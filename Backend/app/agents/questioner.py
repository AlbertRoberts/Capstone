"""
questioner.py — Let a user ask an in-character question to an agent.

The agent answers based on their role, personality, memories, and full
awareness of exactly who else lives in the town.
"""

import os
import requests
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from Backend.app.db.models import Agent
from Backend.app.agents.memory import retrieve_memories
from Backend.app.agents.town_context import build_roster, get_workplace, work_schedule_hint
from Backend.app.sim_clock import sim_clock

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN", "")
HF_MODEL = os.getenv("HF_MODEL", "meta-llama/Llama-3.1-8B-Instruct")
API_URL   = "https://router.huggingface.co/v1/chat/completions"


def _build_ask_prompt(
    agent: Agent,
    memories: list[str],
    question: str,
    all_agents: list[Agent],
) -> str:
    memory_block = (
        "\n".join(f"- {m}" for m in memories)
        if memories else "- No notable memories yet."
    )

    sim_time   = sim_clock.get_time_string()
    day_period = sim_clock.get_day_period()
    location   = (agent.location or "town_hall").replace("_", " ")
    role       = agent.role or "Resident"
    workplace  = get_workplace(agent.role)
    role_line  = f"{role}" + (f" (works at the {workplace.replace('_', ' ')})" if workplace else "")

    town_size = len(all_agents)
    roster    = build_roster(all_agents, exclude_id=agent.id)

    return f"""<s>[INST]
You are roleplaying as {agent.name}, the {role_line} of a small isolated town.

This town has exactly {town_size} residents. Here is everyone who lives here:
  - You: {agent.name} ({role})
{roster}
There are no other people. When you talk about "people in town," you mean the specific individuals above.

Your personality: {agent.personality or "An average town resident."}

Current location: {location}
Current time: {sim_time} ({day_period})

Your recent memories:
{memory_block}

Someone approaches you and asks: "{question}"

Respond in character as {agent.name}. Be natural and conversational, drawing on your role, your knowledge of the town, and the people you know by name. Keep your answer to 2-3 sentences.
[/INST]"""


def answer_question(agent: Agent, question: str, db: Session) -> str:
    """Ask an agent a question and get an in-character response."""
    if not HF_TOKEN:
        raise ValueError("HF_TOKEN is not set.")

    all_agents: list[Agent] = db.query(Agent).all()

    raw_memories = retrieve_memories(agent.id, question, k=4)
    memory_texts: list[str] = []
    if raw_memories and raw_memories.get("documents"):
        docs = raw_memories["documents"]
        if docs and isinstance(docs[0], list):
            memory_texts = docs[0]

    prompt = _build_ask_prompt(agent, memory_texts, question, all_agents)

    response = requests.post(
        API_URL,
        headers={"Authorization": f"Bearer {HF_TOKEN}"},
        json={
            "model":       HF_MODEL,
            "messages":    [{"role": "user", "content": prompt}],
            "max_tokens":  120,
            "temperature": 0.8,
        },
        timeout=30,
    )

    if not response.ok:
        raise RuntimeError(f"HF API error {response.status_code}: {response.text}")

    answer = response.json()["choices"][0]["message"]["content"].strip()

    # Strip any instruction echoes the model might produce
    for prefix in [f"{agent.name}:", "[/INST]", "[INST]"]:
        if answer.startswith(prefix):
            answer = answer[len(prefix):].strip()

    return answer
