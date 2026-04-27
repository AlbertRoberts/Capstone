"""
interaction.py — LLM-driven social interaction resolver.

Given two agents near each other, generate a back-and-forth dialogue
(4 turns: A-B-A-B) using the Hugging Face chat endpoint, then return
structured data (turns + summary) that the frontend can animate.
"""

import os
import re
import requests
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from Backend.app.db.models import Agent
from Backend.app.agents.memory import retrieve_memories
from Backend.app.agents.town_context import build_roster, get_workplace
from Backend.app.sim_clock import sim_clock

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN", "")
HF_MODEL = os.getenv("HF_MODEL", "meta-llama/Llama-3.1-8B-Instruct")
API_URL = "https://router.huggingface.co/v1/chat/completions"

# How many dialogue lines to request (must be even for A-B-A-B pattern)
CONVERSATION_TURNS = 4


def _extract_memory_texts(raw_memories) -> list[str]:
    if raw_memories and raw_memories.get("documents"):
        docs = raw_memories["documents"]
        if docs and isinstance(docs[0], list):
            return docs[0]
    return []


def _build_dialogue_prompt(
    agent_a: Agent,
    agent_b: Agent,
    location: str,
    time_str: str,
    all_agents: list[Agent],
) -> str:
    mem_a = _extract_memory_texts(
        retrieve_memories(agent_a.id, f"{agent_b.name} town event conflict", k=4)
    )
    mem_b = _extract_memory_texts(
        retrieve_memories(agent_b.id, f"{agent_a.name} town event conflict", k=4)
    )

    mem_block_a = "\n".join(f"- {m}" for m in mem_a) if mem_a else "- No prior history with this person."
    mem_block_b = "\n".join(f"- {m}" for m in mem_b) if mem_b else "- No prior history with this person."

    day_period    = sim_clock.get_day_period()
    location_nice = location.replace("_", " ")
    name_a        = agent_a.name
    name_b        = agent_b.name
    role_a        = agent_a.role or "Resident"
    role_b        = agent_b.role or "Resident"

    town_size = len(all_agents)
    roster    = build_roster(all_agents)

    return f"""<s>[INST]
You are writing a scene from a drama set in a small isolated town with {town_size} residents.
Two characters have just crossed paths at the {location_nice}. Write their conversation.

TOWN RESIDENTS (the only people who exist):
{roster}

--- {name_a.upper()} ---
Role: {role_a}
Personality: {agent_a.personality or "An average town resident."}
What {name_a} remembers:
{mem_block_a}

--- {name_b.upper()} ---
Role: {role_b}
Personality: {agent_b.personality or "An average town resident."}
What {name_b} remembers:
{mem_block_b}

Time: {time_str} ({day_period})

WRITING INSTRUCTIONS:
- Each character should speak in a voice that matches their personality — word choice, attitude, rhythm.
- Let subtext do the work. Characters can be evasive, pointed, sarcastic, or guarded.
- If their history or personalities create tension, let it show — don't flatten it into pleasantries.
- Lines can be short or long, whatever fits the character. No word limit.
- Only reference residents from the list above. No invented people.
- No stage directions, no narration — only spoken dialogue.

Write exactly {CONVERSATION_TURNS} lines starting with {name_a}, alternating speakers.
Use EXACTLY this format:
{name_a.upper()}: <line>
{name_b.upper()}: <line>
{name_a.upper()}: <line>
{name_b.upper()}: <line>
[/INST]"""


def _build_summary_prompt(
    agent_a: Agent,
    agent_b: Agent,
    turns: list[dict],
    location: str,
    time_str: str,
) -> str:
    dialogue = "\n".join(f"{t['speaker']}: {t['line']}" for t in turns)
    location_nice = location.replace("_", " ")
    return f"""<s>[INST]
Summarise this conversation between {agent_a.name} and {agent_b.name} at the {location_nice} in one sentence (max 20 words).

{dialogue}

Respond with ONLY the summary sentence, nothing else.
[/INST]"""


def _call_hf(prompt: str, max_tokens: int = 200) -> str:
    if not HF_TOKEN:
        raise ValueError("HF_TOKEN is not set.")

    response = requests.post(
        API_URL,
        headers={"Authorization": f"Bearer {HF_TOKEN}"},
        json={
            "model":       HF_MODEL,
            "messages":    [{"role": "user", "content": prompt}],
            "max_tokens":  max_tokens,
            "temperature": 0.92,
        },
        timeout=30,
    )

    if not response.ok:
        raise RuntimeError(f"HF API error {response.status_code}: {response.text}")

    return response.json()["choices"][0]["message"]["content"]


def _parse_dialogue(
    text: str,
    name_a: str,
    name_b: str,
) -> list[dict]:
    """
    Extract NAME: line pairs from model output.
    Accepts names in any case; normalises speaker to the canonical name.
    """
    turns: list[dict] = []
    name_map = {
        name_a.upper(): name_a,
        name_b.upper(): name_b,
    }

    for raw_line in text.splitlines():
        raw_line = raw_line.strip()
        if not raw_line or raw_line.startswith("["):
            continue

        # Match "NAME: dialogue" — name is one or more words before the colon
        m = re.match(r"^([A-Za-z][A-Za-z ]{0,30}):\s*(.+)$", raw_line)
        if not m:
            continue

        speaker_raw = m.group(1).strip().upper()
        line        = m.group(2).strip()

        # Resolve to canonical name (fuzzy: accept if one is substring of other)
        canonical = name_map.get(speaker_raw)
        if canonical is None:
            for key, val in name_map.items():
                if key in speaker_raw or speaker_raw in key:
                    canonical = val
                    break

        if canonical and line:
            turns.append({"speaker": canonical, "line": line})

    return turns


def _fallback_turns(name_a: str, name_b: str, location: str) -> list[dict]:
    loc = location.replace("_", " ")
    return [
        {"speaker": name_a, "line": f"Hey {name_b}, nice to see you here!"},
        {"speaker": name_b, "line": f"Good to see you too, {name_a}!"},
        {"speaker": name_a, "line": f"Lovely {loc} today, isn't it?"},
        {"speaker": name_b, "line": "It really is. Catch you later!"},
    ]


def generate_interaction(
    agent_a: Agent,
    agent_b: Agent,
    location: str,
    time_str: str | None = None,
    all_agents: list[Agent] | None = None,
) -> dict:
    if not time_str:
        time_str = sim_clock.get_time_string()
    if all_agents is None:
        all_agents = [agent_a, agent_b]

    # ── 1. Generate dialogue ──────────────────────────────────
    dialogue_prompt = _build_dialogue_prompt(agent_a, agent_b, location, time_str, all_agents)
    raw_dialogue    = _call_hf(dialogue_prompt, max_tokens=220)
    turns           = _parse_dialogue(raw_dialogue, agent_a.name, agent_b.name)

    # Ensure we got something useful; fall back if not
    if len(turns) < 2:
        turns = _fallback_turns(agent_a.name, agent_b.name, location)

    # ── 2. Generate summary (second LLM call) ─────────────────
    try:
        summary_prompt = _build_summary_prompt(agent_a, agent_b, turns, location, time_str)
        summary        = _call_hf(summary_prompt, max_tokens=60).strip()
        # Strip any quote wrapping the model might add
        summary = summary.strip('"').strip("'")
    except Exception:
        summary = (
            f"{agent_a.name} and {agent_b.name} had a brief chat at the "
            f"{location.replace('_', ' ')}."
        )

    # ── 3. Compute duration (1.8 s per turn + 1 s buffer) ────
    duration_ms = len(turns) * 1_800 + 1_000

    return {
        "happened":     True,
        "turns":        turns,
        "summary":      summary,
        "importance_a": 0.5,
        "importance_b": 0.5,
        "duration_ms":  duration_ms,
    }
