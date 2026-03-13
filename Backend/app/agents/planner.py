import os
import re
import requests
from sqlalchemy.orm import Session
 
from Backend.app.db.models import Agent
from Backend.app.agents.memory import retrieve_memories, add_memory
 
# ─── Config ───────────────────────────────────────────────────────────────────
 
HF_TOKEN = os.getenv("HF_TOKEN", "") 
 
HF_MODEL = os.getenv(
    "HF_MODEL",
    "mistralai/Mistral-7B-Instruct-v0.3"
)
 
API_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL}"
 
VALID_LOCATIONS = [
    "town_hall",
    "school",
    "clinic",
    "cafe",
    "tavern",
    "market",
    "park",
]
 
# ─── Prompt builder ───────────────────────────────────────────────────────────
 
def _build_prompt(agent: Agent, memories: list[str]) -> str:
    memory_block = (
        "\n".join(f"- {m}" for m in memories)
        if memories
        else "- No memories yet."
    )
 
    location_list = ", ".join(VALID_LOCATIONS)
 
    return f"""<s>[INST]
You are {agent.name}, a resident of a small town.
 
Personality: {agent.personality or "An average town resident."}
Current location: {agent.location or "town_hall"}
Recent memories:
{memory_block}
 
Decide what {agent.name} does next. Pick ONE destination from this list:
{location_list}
 
Respond in EXACTLY this format (no extra text):
ACTION: <one sentence describing what {agent.name} does>
LOCATION: <one location from the list above>
[/INST]"""
 
 
# ─── LLM call ─────────────────────────────────────────────────────────────────
 
def _call_hf(prompt: str) -> str:
    """Call the Hugging Face Inference API and return raw generated text."""
    if not HF_TOKEN:
        raise ValueError(
            "HF_TOKEN is not set. "
            "Add it to your environment: set HF_TOKEN=your_token_here"
        )
 
    response = requests.post(
        API_URL,
        headers={"Authorization": f"Bearer {HF_TOKEN}"},
        json={
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 80,
                "temperature": 0.7,
                "top_p": 0.9,
                "do_sample": True,
                "return_full_text": False,  # only return the new tokens
            },
        },
        timeout=30,
    )
 
    if response.status_code == 503:
        raise RuntimeError(
            f"Model {HF_MODEL} is loading on HF servers. "
            "Wait ~20 seconds and retry."
        )
 
    if not response.ok:
        raise RuntimeError(
            f"HF API error {response.status_code}: {response.text}"
        )
 
    data = response.json()
 
    # HF returns a list of dicts: [{"generated_text": "..."}]
    if isinstance(data, list) and data:
        return data[0].get("generated_text", "")
 
    raise RuntimeError(f"Unexpected HF response shape: {data}")
 
 
# ─── Response parser ──────────────────────────────────────────────────────────
 
def _parse_response(text: str) -> dict[str, str]:
    """
    Extract ACTION and LOCATION from the model's response.
    Falls back gracefully if the model doesn't follow the format exactly.
    """
    action = ""
    location = ""
 
    for line in text.splitlines():
        line = line.strip()
        if line.upper().startswith("ACTION:"):
            action = line[7:].strip()
        elif line.upper().startswith("LOCATION:"):
            raw_loc = line[9:].strip().lower()
            # Normalise: "Town Hall" -> "town_hall", "the cafe" -> "cafe"
            raw_loc = raw_loc.replace("the ", "").replace(" ", "_")
            # Only accept known locations
            if raw_loc in VALID_LOCATIONS:
                location = raw_loc
 
    # If the model ignored the format, scan the whole text for any location keyword
    if not location:
        for loc in VALID_LOCATIONS:
            pattern = loc.replace("_", r"[\s_]")
            if re.search(pattern, text, re.IGNORECASE):
                location = loc
                break
 
    # Final fallback
    if not location:
        import random
        location = random.choice(VALID_LOCATIONS)
 
    if not action:
        action = f"Walk to the {location.replace('_', ' ')}"
 
    return {"action": action, "location": location}
 
 
# ─── Public API ───────────────────────────────────────────────────────────────
 
def plan_next_action(agent: Agent, db: Session) -> dict[str, str]:
    """
    Generate the next action for an agent.
 
    Returns:
        {
            "action":   "Alice heads to the cafe for a morning coffee.",
            "location": "cafe"
        }
 
    Also writes the planned action to the agent's memory so future
    plans are informed by what they've already done.
    """
 
    # Retrieve the agent's most relevant recent memories
    query = f"What should {agent.name} do next in {agent.location}?"
    raw_memories = retrieve_memories(agent.id, query, k=5)
 
    # ChromaDB returns {"documents": [["mem1", "mem2", ...]], ...}
    memory_texts: list[str] = []
    if raw_memories and raw_memories.get("documents"):
        docs = raw_memories["documents"]
        if docs and isinstance(docs[0], list):
            memory_texts = docs[0]
 
    # Build prompt and call the model
    prompt = _build_prompt(agent, memory_texts)
    raw_text = _call_hf(prompt)
    result = _parse_response(raw_text)
 
    # Write this plan as a memory so the agent remembers where they went
    memory_content = (
        f"I decided to go to {result['location'].replace('_', ' ')}. "
        f"{result['action']}"
    )
    add_memory(db, agent.id, memory_content, importance=0.5)
 
    return result
 