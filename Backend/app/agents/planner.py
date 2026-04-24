"""
planner.py — LLM-driven action planner for agents.

Each agent knows:
  - Their role and primary workplace
  - The exact list of other people in town (no fictional extras)
  - Work-hour expectations for their role
"""

import os
import re
import random
import requests
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from Backend.app.db.models import Agent
from Backend.app.agents.memory import retrieve_memories, add_memory
from Backend.app.agents.town_context import (
    build_roster, get_workplace, work_schedule_hint,
    WORK_PERIODS, STUDENT_WORK_PERIODS,
)
from Backend.app.sim_clock import sim_clock

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN", "")
HF_MODEL = os.getenv("HF_MODEL", "meta-llama/Llama-3.1-8B-Instruct")
API_URL   = "https://router.huggingface.co/v1/chat/completions"

PUBLIC_LOCATIONS = [
    "town_hall", "school", "clinic", "cafe", "tavern", "market", "park",
]
HOUSE_LOCATIONS = [f"house_{i}" for i in range(1, 11)]


def _valid_locations_for(agent: Agent) -> list[str]:
    valid = list(PUBLIC_LOCATIONS)
    if agent.home_location and agent.home_location in HOUSE_LOCATIONS:
        valid.append(agent.home_location)
    return valid


def _build_prompt(agent: Agent, memories: list[str], all_agents: list[Agent]) -> str:
    memory_block = (
        "\n".join(f"- {m}" for m in memories)
        if memories else "- No memories yet."
    )

    valid_locations = _valid_locations_for(agent)
    location_list   = ", ".join(valid_locations)
    sim_time        = sim_clock.get_time_string()
    day_period      = sim_clock.get_day_period()
    home_text       = (agent.home_location or "None").replace("_", " ")
    current_loc     = (agent.location or "town_hall").replace("_", " ")

    # Role context
    role            = agent.role or "Resident"
    workplace       = get_workplace(agent.role)
    role_line       = f"Your role: {role}"
    if workplace:
        role_line  += f" — you work at the {workplace.replace('_', ' ')}"
    schedule_hint   = work_schedule_hint(agent.role)

    # Town roster (everyone except this agent)
    n_others  = len(all_agents) - 1
    roster    = build_roster(all_agents, exclude_id=agent.id)
    town_size = len(all_agents)

    return f"""<s>[INST]
You are roleplaying as {agent.name}, one of exactly {town_size} people who live in this small, isolated town. There are NO other residents — the list below is complete.

{role_line}.
{schedule_hint}

YOUR IDENTITY:
  Name: {agent.name}
  Role: {role}
  Home: {home_text}
  Personality: {agent.personality or "An average town resident."}

ALL {town_size} RESIDENTS OF THIS TOWN (complete list — no one else exists):
  - You: {agent.name} ({role})
{roster}

CURRENT SITUATION:
  Location: {current_loc}
  Time: {sim_time} ({day_period})

RECENT MEMORIES:
{memory_block}

CURRENT TIME PERIOD: {day_period}

DECISION RULES (follow strictly):
{"1. You MUST go to the " + workplace.replace("_", " ") + " during work/school hours (morning and afternoon). This is not optional." if workplace else "1. You have no fixed workplace — go wherever suits your mood and time of day."}
2. Only leave your workplace for: lunch at the café (midday only), a genuine personal errand, or the evening/night.
3. It is currently {day_period}. Choose an action that makes sense for THIS time of day — do NOT plan morning activities if it is evening or night.
4. In the evening (after 5pm) go home or to the tavern. Do NOT go to work or school in the evening.
5. Late at night always go home to {home_text}.
6. Only reference the people listed above — no one else exists in this town.

Valid locations: {location_list}

Respond in EXACTLY this format (no extra text):
ACTION: <one sentence describing what {agent.name} does next>
LOCATION: <one location from the valid list above>
[/INST]"""


def _call_hf(prompt: str) -> str:
    if not HF_TOKEN:
        raise ValueError("HF_TOKEN is not set.")

    response = requests.post(
        API_URL,
        headers={"Authorization": f"Bearer {HF_TOKEN}"},
        json={
            "model":       HF_MODEL,
            "messages":    [{"role": "user", "content": prompt}],
            "max_tokens":  100,
            "temperature": 0.7,
        },
        timeout=30,
    )

    if not response.ok:
        raise RuntimeError(f"HF API error {response.status_code}: {response.text}")

    return response.json()["choices"][0]["message"]["content"]


def _parse_response(text: str, valid_locations: list[str]) -> dict[str, str]:
    action   = ""
    location = ""

    for line in text.splitlines():
        line = line.strip()
        if line.upper().startswith("ACTION:"):
            raw_action = line[7:].strip()
            # Strip any trailing LOCATION:xxx the LLM appended to the action sentence
            raw_action = re.sub(r'\s*LOCATION:\s*\S+', '', raw_action, flags=re.IGNORECASE).strip()
            action = raw_action
        elif line.upper().startswith("LOCATION:"):
            raw = line[9:].strip().lower().replace("the ", "").replace(" ", "_")
            if raw in valid_locations:
                location = raw

    if not location:
        for loc in valid_locations:
            pattern = loc.replace("_", r"[\s_]")
            if re.search(pattern, text, re.IGNORECASE):
                location = loc
                break

    if not location:
        location = valid_locations[0]

    if not action:
        if location.startswith("house_"):
            action = f"Go home to {location.replace('_', ' ')}"
        else:
            action = f"Walk to the {location.replace('_', ' ')}"

    return {"action": action, "location": location}


def plan_next_action(agent: Agent, db: Session) -> dict[str, str]:
    # Fetch all agents for roster
    all_agents: list[Agent] = db.query(Agent).all()

    query        = f"What should {agent.name} do next given their role as {agent.role or 'resident'}?"
    raw_memories = retrieve_memories(agent.id, query, k=5)

    memory_texts: list[str] = []
    if raw_memories and raw_memories.get("documents"):
        docs = raw_memories["documents"]
        if docs and isinstance(docs[0], list):
            memory_texts = docs[0]

    valid_locations = _valid_locations_for(agent)
    prompt          = _build_prompt(agent, memory_texts, all_agents)
    raw_text        = _call_hf(prompt)
    result          = _parse_response(raw_text, valid_locations)

    # ── Workplace enforcement ─────────────────────────────────
    # If the LLM picked somewhere other than the agent's workplace
    # during work/school hours, override it with high probability.
    workplace   = get_workplace(agent.role)
    day_period  = sim_clock.get_day_period()
    work_set    = STUDENT_WORK_PERIODS if agent.role == "Student" else WORK_PERIODS

    if workplace and day_period in work_set and result["location"] != workplace:
        # 85% chance to enforce — leaves 15% room for believable one-off detours
        if random.random() < 0.85:
            nice = workplace.replace("_", " ")
            result["location"] = workplace
            result["action"]   = (
                f"{agent.name} goes to the {nice} for "
                f"{'class' if agent.role == 'Student' else 'work'}."
            )

    add_memory(
        db, agent.id,
        f"I decided to go to the {result['location'].replace('_', ' ')}. {result['action']}",
        importance=0.5,
    )

    return result
