from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
 
from Backend.app.db.database import SessionLocal, engine, Base
from Backend.app.db.models import Agent, Memory
from Backend.app.agents.memory import add_memory, retrieve_memories
from Backend.app.agents.planner import plan_next_action
from Backend.app.schema.agent_schemas import (
    AgentCreate, AgentResponse, AgentUpdate,
    MemoryCreate, MemoryResponse,
    Action, DailyPlan
)
 
Base.metadata.create_all(bind=engine)
 
router = APIRouter()
 
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
 
 
# ─── Agents ───────────────────────────────────────────────────────────────────
 
@router.post("/agents/", response_model=AgentResponse)
def create_agent(agent: AgentCreate, db: Session = Depends(get_db)):
    db_agent = Agent(
        name=agent.name,
        personality=agent.personality,
        location=agent.location,
        current_action=agent.current_action
    )
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent
 
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
 
@router.get("/agents/", response_model=List[AgentResponse])
def list_agents(db: Session = Depends(get_db)):
    return db.query(Agent).all()
 
 
# ─── Memory ───────────────────────────────────────────────────────────────────
 
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
 
 
# ─── Planning ─────────────────────────────────────────────────────────────────
 
@router.get("/agents/{agent_id}/plan", response_model=DailyPlan)
def get_daily_plan(agent_id: int, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
 
    try:
        result = plan_next_action(agent, db)
    except Exception as e:
        # If the LLM call fails for any reason, log it and return a fallback
        # so the simulation keeps running rather than breaking the agent loop
        import random, logging
        logging.warning(f"Planner failed for agent {agent_id}: {e}")
        fallback_locations = ["town_hall", "school", "clinic", "cafe", "tavern", "market", "park"]
        pick = random.choice(fallback_locations)
        result = {
            "action": f"Walk to the {pick.replace('_', ' ')}",
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