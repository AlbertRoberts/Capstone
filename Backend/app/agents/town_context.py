"""
town_context.py — Shared helpers for building town-aware LLM context.

Provides:
  - ROLE_WORKPLACES   : role name → primary workplace location
  - ROLE_DESCRIPTIONS : role name → one-line description of duties
  - build_roster()    : formatted string of all residents for prompts
  - get_workplace()   : safe lookup of a role's workplace
"""

from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from Backend.app.db.models import Agent

# ── Role definitions ──────────────────────────────────────────────────────────

# Maps role name (as stored in DB) → primary workplace location key
ROLE_WORKPLACES: dict[str, str] = {
    "Doctor":     "clinic",
    "Teacher":    "school",
    "Student":    "school",
    "Librarian":  "school",
    "Mayor":      "town_hall",
    "Sheriff":    "town_hall",
    "Café Owner": "cafe",
    "Barista":    "cafe",
    "Bartender":  "tavern",
    "Innkeeper":  "tavern",
    "Merchant":   "market",
    "Shopkeeper": "market",
    "Farmer":     "park",
    "Gardener":   "park",
}

# Human-readable duty descriptions used in prompts
ROLE_DESCRIPTIONS: dict[str, str] = {
    "Doctor":     "provides medical care to the townspeople at the clinic",
    "Teacher":    "teaches and runs the school",
    "Student":    "attends classes and studies at the school",
    "Librarian":  "maintains the school's library and helps with learning",
    "Mayor":      "governs the town and holds meetings at the town hall",
    "Sheriff":    "keeps the peace and works out of the town hall",
    "Café Owner": "runs the café, serves coffee and food",
    "Barista":    "works at the café serving drinks and chatting with visitors",
    "Bartender":  "runs the tavern, pours drinks and listens to gossip",
    "Innkeeper":  "manages the tavern and looks after guests",
    "Merchant":   "sells goods at the market and manages trade",
    "Shopkeeper": "operates a stall at the market",
    "Farmer":     "tends fields and spends time in the park area",
    "Gardener":   "maintains the park and town gardens",
}

# All available roles for the UI (display name → internal name)
ALL_ROLES: list[tuple[str, str]] = [
    ("Doctor",     "Doctor"),
    ("Teacher",    "Teacher"),
    ("Student",    "Student"),
    ("Mayor",      "Mayor"),
    ("Sheriff",    "Sheriff"),
    ("Café Owner", "Café Owner"),
    ("Bartender",  "Bartender"),
    ("Merchant",   "Merchant"),
    ("Farmer",     "Farmer"),
    ("Resident (no fixed role)", ""),
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def get_workplace(role: str | None) -> str | None:
    """Return the workplace location key for a role, or None if unknown."""
    if not role:
        return None
    return ROLE_WORKPLACES.get(role)


def build_roster(all_agents: list[Agent], exclude_id: int | None = None) -> str:
    """
    Build a human-readable list of all town residents for use in LLM prompts.

    Example output:
        - Alice (Doctor, works at the clinic) — lives at house 3
        - Bob (Bartender, works at the tavern) — lives at house 5
    """
    lines: list[str] = []
    for agent in all_agents:
        if agent.id == exclude_id:
            continue
        role_str = agent.role or "Resident"
        workplace = get_workplace(agent.role)
        workplace_str = (
            f", works at the {workplace.replace('_', ' ')}" if workplace else ""
        )
        home = (
            agent.home_location.replace("_", " ")
            if agent.home_location
            else "unknown"
        )
        lines.append(f"  - {agent.name} ({role_str}{workplace_str}) — lives at {home}")

    return "\n".join(lines) if lines else "  (you are the only person in town)"


def work_schedule_hint(role: str | None) -> str:
    """Return a work-schedule sentence for the agent's role."""
    workplace = get_workplace(role)
    if not role or not workplace:
        return ""
    desc = ROLE_DESCRIPTIONS.get(role, f"works at the {workplace.replace('_', ' ')}")
    hours_phrase = (
        "school hours (roughly 8am–3pm)"
        if role == "Student"
        else "work hours (roughly 9am–5pm)"
    )
    return (
        f"As a {role}, you {desc}. "
        f"During {hours_phrase} you MUST be at the "
        f"{workplace.replace('_', ' ')}."
    )


# Day periods that count as "work/school time" for workplace enforcement
WORK_PERIODS = {"morning", "midday", "afternoon"}

# For students, exclude midday so they can go home/cafe for lunch
STUDENT_WORK_PERIODS = {"morning", "afternoon"}
