"""
interaction.py — LLM-driven social interaction resolver.

Given two agents near each other, generate a short interaction summary
using the Hugging Face chat endpoint, then return structured data that
the frontend can animate.
"""

import os
import re
import requests
from dotenv import load_dotenv
from Backend.app.db.models import Agent
from Backend.app.agents.memory import retrieve_memories
from Backend.app.sim_clock import sim_clock

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN", "")
HF_MODEL = os.getenv("HF_MODEL", "meta-llama/Llama-3.1-8B-Instruct")
API_URL = "https://router.huggingface.co/v1/chat/completions"


def _extract_memory_texts(raw_memories) -> list[str]:
    memory_texts: list[str] = []
    if raw_memories and raw_memories.get("documents"):
        docs = raw_memories["documents"]
        if docs and isinstance(docs[0], list):
            memory_texts = docs[0]
    return memory_texts


def _build_prompt(agent_a: Agent, agent_b: Agent, location: str, time_str: str) -> str:
    mem_a = _extract_memory_texts(
        retrieve_memories(agent_a.id, f"What does {agent_a.name} remember about social interactions?", k=4)
    )
    mem_b = _extract_memory_texts(
        retrieve_memories(agent_b.id, f"What does {agent_b.name} remember about social interactions?", k=4)
    )

    memory_block_a = "\n".join(f"- {m}" for m in mem_a) if mem_a else "- No notable recent social memories."
    memory_block_b = "\n".join(f"- {m}" for m in mem_b) if mem_b else "- No notable recent social memories."

    day_period = sim_clock.get_day_period()
    location_nice = location.replace("_", " ")

    return f"""<s>[INST]
You are simulating a social interaction between two town residents.

Agent A:
Name: {agent_a.name}
Personality: {agent_a.personality or "Average town resident"}
Current location: {agent_a.location or location}
Recent memories:
{memory_block_a}

Agent B:
Name: {agent_b.name}
Personality: {agent_b.personality or "Average town resident"}
Current location: {agent_b.location or location}
Recent memories:
{memory_block_b}

Context:
Time: {time_str}
Day period: {day_period}
Place: {location_nice}

Decide whether these two people would briefly interact when near each other.
The interaction should be short, natural, and grounded in their personalities, time of day, and location.

Respond in EXACTLY this format and nothing else:
HAPPENED: <yes or no>
SUMMARY: <one sentence, max 25 words>
IMPORTANCE_A: <number from 0.0 to 1.0>
IMPORTANCE_B: <number from 0.0 to 1.0>
DURATION_MS: <integer between 3000 and 7000>
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
            "max_tokens": 120,
            "temperature": 0.7,
        },
        timeout=30,
    )

    if not response.ok:
        raise RuntimeError(f"HF API error {response.status_code}: {response.text}")

    data = response.json()
    return data["choices"][0]["message"]["content"]


def _clamp_float(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def _clamp_int(value: int, lo: int, hi: int) -> int:
    return max(lo, min(hi, value))


def _parse_response(text: str) -> dict:
    happened = False
    summary = "They acknowledge each other briefly."
    importance_a = 0.3
    importance_b = 0.3
    duration_ms = 4000

    for line in text.splitlines():
        line = line.strip()

        if line.upper().startswith("HAPPENED:"):
            raw = line.split(":", 1)[1].strip().lower()
            happened = raw in ("yes", "true")

        elif line.upper().startswith("SUMMARY:"):
            raw = line.split(":", 1)[1].strip()
            if raw:
                summary = raw

        elif line.upper().startswith("IMPORTANCE_A:"):
            raw = line.split(":", 1)[1].strip()
            try:
                importance_a = float(raw)
            except ValueError:
                pass

        elif line.upper().startswith("IMPORTANCE_B:"):
            raw = line.split(":", 1)[1].strip()
            try:
                importance_b = float(raw)
            except ValueError:
                pass

        elif line.upper().startswith("DURATION_MS:"):
            raw = line.split(":", 1)[1].strip()
            try:
                duration_ms = int(raw)
            except ValueError:
                pass

    importance_a = _clamp_float(importance_a, 0.0, 1.0)
    importance_b = _clamp_float(importance_b, 0.0, 1.0)
    duration_ms = _clamp_int(duration_ms, 3000, 7000)

    # Fallback: if the model ignored format completely, infer a small interaction happened
    if "no" not in text.lower() and not any(line.upper().startswith("HAPPENED:") for line in text.splitlines()):
        happened = True

    return {
        "happened": happened,
        "summary": summary,
        "importance_a": importance_a,
        "importance_b": importance_b,
        "duration_ms": duration_ms,
    }


def generate_interaction(agent_a: Agent, agent_b: Agent, location: str, time_str: str | None = None) -> dict:
    if not time_str:
        time_str = sim_clock.get_time_string()

    prompt = _build_prompt(agent_a, agent_b, location, time_str)
    raw_text = _call_hf(prompt)
    return _parse_response(raw_text)