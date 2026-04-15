"""
questioner.py — Let a user ask an in-character question to an agent.

The agent answers based on its personality and recent memories.
"""

import os
import requests
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from Backend.app.db.models import Agent
from Backend.app.agents.memory import retrieve_memories
from Backend.app.sim_clock import sim_clock

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN", "")
HF_MODEL = os.getenv("HF_MODEL", "meta-llama/Llama-3.1-8B-Instruct")
API_URL   = "https://router.huggingface.co/v1/chat/completions"


def _build_ask_prompt(agent: Agent, memories: list[str], question: str) -> str:
    memory_block = (
        "\n".join(f"- {m}" for m in memories)
        if memories
        else "- No memories yet."
    )

    sim_time   = sim_clock.get_time_string()
    day_period = sim_clock.get_day_period()
    location   = (agent.location or "town_hall").replace("_", " ")

    return f"""<s>[INST]
You are roleplaying as {agent.name}, a resident of a small town.

Personality:
{agent.personality or "An average town resident."}

Current location: {location}
Current time: {sim_time} ({day_period})

Recent memories:
{memory_block}

Someone approaches {agent.name} and asks: "{question}"

Respond in character as {agent.name}. Keep your answer conversational and in first person.
Limit your response to 2-3 sentences.
[/INST]"""


def answer_question(agent: Agent, question: str, db: Session) -> str:
    """Ask an agent a question and get an in-character response."""
    if not HF_TOKEN:
        raise ValueError("HF_TOKEN is not set.")

    raw_memories = retrieve_memories(agent.id, question, k=4)
    memory_texts: list[str] = []
    if raw_memories and raw_memories.get("documents"):
        docs = raw_memories["documents"]
        if docs and isinstance(docs[0], list):
            memory_texts = docs[0]

    prompt = _build_ask_prompt(agent, memory_texts, question)

    response = requests.post(
        API_URL,
        headers={"Authorization": f"Bearer {HF_TOKEN}"},
        json={
            "model": HF_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 120,
            "temperature": 0.8,
        },
        timeout=30,
    )

    if not response.ok:
        raise RuntimeError(f"HF API error {response.status_code}: {response.text}")

    data = response.json()
    answer = data["choices"][0]["message"]["content"].strip()

    # Strip any instruction echoes the model might produce
    for prefix in [f"{agent.name}:", "[/INST]", "[INST]"]:
        if answer.startswith(prefix):
            answer = answer[len(prefix):].strip()

    return answer
