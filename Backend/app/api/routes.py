from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
import random
import logging

from Backend.app.db.database import SessionLocal, engine, Base
from Backend.app.db.models import Agent, Memory
from Backend.app.agents.memory import add_memory, retrieve_memories
from Backend.app.agents.planner import plan_next_action
from Backend.app.agents.interaction import generate_interaction
from Backend.app.agents.questioner import answer_question
from Backend.app.sim_clock import sim_clock
from Backend.app.schema.agent_schemas import (
    AgentCreate, AgentResponse, AgentUpdate,
    MemoryCreate, MemoryResponse,
    Action, DailyPlan, SimState,
    InteractionRequest, InteractionResponse,
    SpeedRequest, AskRequest, AskResponse,
    ConversationTurn,
)

Base.metadata.create_all(bind=engine)

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/simulation/state", response_model=SimState)
def get_simulation_state():
    return SimState(**sim_clock.get_state())

@router.post("/simulation/reset")
def reset_simulation():
    sim_clock.reset()
    return {"message": "Simulation clock reset to 8:00am"}

@router.get("/simulation/speed")
def get_simulation_speed():
    return {"speed": sim_clock.get_speed()}

@router.post("/simulation/speed")
def set_simulation_speed(req: SpeedRequest):
    sim_clock.set_speed(req.speed)
    return {"speed": sim_clock.get_speed()}


@router.post("/agents/", response_model=AgentResponse)
def create_agent(agent: AgentCreate, db: Session = Depends(get_db)):
    db_agent = Agent(
        name=agent.name,
        personality=agent.personality,
        location=agent.location,
        current_action=agent.current_action,
        home_location=agent.home_location,
    )
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent

@router.get("/agents/", response_model=List[AgentResponse])
def list_agents(db: Session = Depends(get_db)):
    return db.query(Agent).all()

@router.get("/agents/{agent_id}", response_model=AgentResponse)
def get_agent(agent_id: int, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.put("/agents/{agent_id}", response_model=AgentResponse)
def update_agent(agent_id: int, agent_update: AgentUpdate, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    for field, value in agent_update.dict(exclude_unset=True).items():
        setattr(agent, field, value)

    db.commit()
    db.refresh(agent)
    return agent


@router.post("/agents/{agent_id}/memory", response_model=MemoryResponse)
def create_memory(agent_id: int, memory: MemoryCreate, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    db_memory = add_memory(db, agent_id, memory.content, memory.importance)
    return db_memory

@router.get("/agents/{agent_id}/memory", response_model=List[MemoryResponse])
def get_memories(agent_id: int, query: str = "", db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    if query:
        results = retrieve_memories(agent_id, query)
        db_memories = db.query(Memory).filter(
            Memory.id.in_([int(rid) for rid in results["ids"]])
        ).all()
        return db_memories
    else:
        return db.query(Memory).filter(Memory.agent_id == agent_id).all()


@router.get("/agents/{agent_id}/plan", response_model=DailyPlan)
def get_daily_plan(agent_id: int, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    try:
        result = plan_next_action(agent, db)
    except Exception as e:
        logging.warning(f"Planner failed for agent {agent_id}: {e}")
        fallback_locations = [
            "town_hall", "school", "clinic", "cafe", "tavern", "market", "park"
        ]
        if agent.home_location:
            fallback_locations.append(agent.home_location)

        pick = random.choice(fallback_locations)
        action_text = (
            f"Go home to {pick.replace('_', ' ')}"
            if pick.startswith("house_")
            else f"Walk to the {pick.replace('_', ' ')}"
        )

        result = {
            "action": action_text,
            "location": pick,
        }

    return DailyPlan(
        agent_id=agent_id,
        date=datetime.utcnow(),
        actions=[
            Action(
                description=f"{result['action']} LOCATION:{result['location']}"
            )
        ]
    )


@router.post("/agents/{agent_id}/ask", response_model=AskResponse)
def ask_agent(agent_id: int, req: AskRequest, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    try:
        answer = answer_question(agent, req.question, db)
    except Exception as e:
        logging.warning(f"Question answering failed for agent {agent_id}: {e}")
        answer = "I'm not sure how to answer that right now."

    return AskResponse(agent_name=agent.name, question=req.question, answer=answer)


@router.post("/interactions/", response_model=InteractionResponse)
def create_interaction(req: InteractionRequest, db: Session = Depends(get_db)):
    agent_a = db.query(Agent).filter(Agent.id == req.agent_a_id).first()
    agent_b = db.query(Agent).filter(Agent.id == req.agent_b_id).first()

    if not agent_a or not agent_b:
        raise HTTPException(status_code=404, detail="One or both agents not found")

    try:
        result = generate_interaction(agent_a, agent_b, req.location, req.time)
    except Exception as e:
        logging.warning(f"Interaction generation failed for {req.agent_a_id}/{req.agent_b_id}: {e}")
        loc_nice = req.location.replace("_", " ")
        result = {
            "happened":     True,
            "turns":        [
                {"speaker": agent_a.name, "line": f"Hey {agent_b.name}, good to see you!"},
                {"speaker": agent_b.name, "line": f"Likewise, {agent_a.name}!"},
            ],
            "summary":      f"{agent_a.name} and {agent_b.name} briefly chat at the {loc_nice}.",
            "importance_a": 0.3,
            "importance_b": 0.3,
            "duration_ms":  4600,
        }

    if result["happened"]:
        time_str      = req.time or sim_clock.get_time_string()
        location_nice = req.location.replace("_", " ")

        # Build a richer memory that includes a snippet of what was actually said
        turns = result.get("turns", [])
        dialogue_snippet = " | ".join(
            f'{t["speaker"]}: "{t["line"]}"' for t in turns[:2]
        )
        memory_suffix = f" They said: {dialogue_snippet}" if dialogue_snippet else ""

        add_memory(
            db,
            agent_a.id,
            f"At {time_str} I spoke with {agent_b.name} at the {location_nice}. "
            f"{result['summary']}{memory_suffix}",
            result["importance_a"],
        )
        add_memory(
            db,
            agent_b.id,
            f"At {time_str} I spoke with {agent_a.name} at the {location_nice}. "
            f"{result['summary']}{memory_suffix}",
            result["importance_b"],
        )

    # Convert raw turn dicts to ConversationTurn objects
    turns_out = [ConversationTurn(**t) for t in result.get("turns", [])]
    return InteractionResponse(
        happened=result["happened"],
        summary=result["summary"],
        importance_a=result["importance_a"],
        importance_b=result["importance_b"],
        duration_ms=result["duration_ms"],
        turns=turns_out,
    )
