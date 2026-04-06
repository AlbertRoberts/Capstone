"""
planner.py — LLM-driven action planner for agents.
"""

import os
import re
import requests
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from Backend.app.db.models import Agent
from Backend.app.agents.memory import retrieve_memories, add_memory
from Backend.app.sim_clock import sim_clock

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN", "")
HF_MODEL = os.getenv(
    "HF_MODEL",
    "meta-llama/Llama-3.1-8B-Instruct"
)

API_URL = "https://router.huggingface.co/v1/chat/completions"

PUBLIC_LOCATIONS = [
    "town_hall",
    "school",
    "clinic",
    "cafe",
    "tavern",
    "market",
    "park",
]

HOUSE_LOCATIONS = [
    "house_1",
    "house_2",
    "house_3",
    "house_4",
    "house_5",
    "house_6",
    "house_7",
    "house_8",
    "house_9",
    "house_10",
]


def _valid_locations_for(agent: Agent) -> list[str]:
    valid = list(PUBLIC_LOCATIONS)
    if agent.home_location and agent.home_location in HOUSE_LOCATIONS:
        valid.append(agent.home_location)
    return valid


def _build_prompt(agent: Agent, memories: list[str]) -> str:
    memory_block = (
        "\n".join(f"- {m}" for m in memories)
        if memories
        else "- No memories yet."
    )

    valid_locations = _valid_locations_for(agent)
    location_list = ", ".join(valid_locations)
    sim_time = sim_clock.get_time_string()
    day_period = sim_clock.get_day_period()

    home_text = agent.home_location or "None"

    return f"""<s>[INST]
You are roleplaying as {agent.name}, a resident of a small town.

Personality and behavior rules (follow these exactly):
{agent.personality or "An average town resident."}

Current location: {agent.location or "town_hall"}
Home location: {home_text}
Current time: {sim_time} ({day_period})

Recent memories:
{memory_block}

It is {day_period}. Decide what {agent.name} does next.

Behavior guidance:
- In the morning, they may go to the cafe or market.
- During the day, they may go to town_hall, school, clinic, or park.
- In the evening, they may go to tavern or return home.
- If they are tired, private, shy, resting, or home-oriented, they may stay home or go home.
- If their personality says they prefer staying home, respect that.
- If their personality says they avoid somewhere, do not send them there.
- They may choose their home location if it is in the valid locations list.

Valid locations: {location_list}

Respond in EXACTLY this format (no extra text):
ACTION: <one sentence describing what {agent.name} does>
LOCATION: <one location from the valid list above>
[/INST]"""


def _call_hf(prompt: str) -> str:
    if not HF_TOKEN:
        raise ValueError("HF_TOKEN is not set.")

    response = requests.post(
        API_URL,
        headers={"Authorization": f"Bearer {HF_TOKEN}"},
        json={
            "model": HF_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 80,
            "temperature": 0.7,
        },
        timeout=30,
    )

    if not response.ok:
        raise RuntimeError(f"HF API error {response.status_code}: {response.text}")

    data = response.json()
    return data["choices"][0]["message"]["content"]


def _parse_response(text: str, valid_locations: list[str]) -> dict[str, str]:
    action = ""
    location = ""

    for line in text.splitlines():
        line = line.strip()
        if line.upper().startswith("ACTION:"):
            action = line[7:].strip()
        elif line.upper().startswith("LOCATION:"):
            raw_loc = line[9:].strip().lower()
            raw_loc = raw_loc.replace("the ", "").replace(" ", "_")
            if raw_loc in valid_locations:
                location = raw_loc

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
    query = f"What should {agent.name} do next in {agent.location}?"
    raw_memories = retrieve_memories(agent.id, query, k=5)

    memory_texts: list[str] = []
    if raw_memories and raw_memories.get("documents"):
        docs = raw_memories["documents"]
        if docs and isinstance(docs[0], list):
            memory_texts = docs[0]

    valid_locations = _valid_locations_for(agent)
    prompt = _build_prompt(agent, memory_texts)
    raw_text = _call_hf(prompt)
    result = _parse_response(raw_text, valid_locations)

    memory_content = (
        f"I decided to go to {result['location'].replace('_', ' ')}. "
        f"{result['action']}"
    )
    add_memory(db, agent.id, memory_content, importance=0.5)

    return result