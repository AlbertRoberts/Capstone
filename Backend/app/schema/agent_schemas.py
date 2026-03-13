from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class AgentBase(BaseModel):
    name: str = Field(..., example="Alice")
    personality: Optional[str] = Field(None, example="Curious and friendly")
    location: Optional[str] = Field(None, example="Park")
    current_action: Optional[str] = Field(None, example="Walking to the cafe")

#work on later-------------------
class AgentCreate(AgentBase):
    pass

class AgentUpdate(BaseModel):
    personality: Optional[str] = None
    location: Optional[str] = None
    current_action: Optional[str] = None

class AgentResponse(AgentBase):
    id: int

    class Config:
        orm_mode = True



class MemoryBase(BaseModel):
    content: str = Field(..., example="Saw Bob at the park talking to Charlie")
    importance: float = Field(..., ge=0.0, le=1.0, example=0.8)

class MemoryCreate(MemoryBase):
    agent_id: int

class MemoryResponse(MemoryBase):
    id: int
    agent_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class Action(BaseModel):
    description: str = Field(..., example="Walk to the library")
    scheduled_time: Optional[datetime] = None

class DailyPlan(BaseModel):
    agent_id: int
    date: datetime
    actions: List[Action]