from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class AgentBase(BaseModel):
    name: str = Field(..., example="Alice")
    personality: Optional[str] = Field(None, example="Curious and friendly")
    location: Optional[str] = Field(None, example="park")
    current_action: Optional[str] = Field(None, example="Walking to the cafe")
    home_location: Optional[str] = Field(None, example="house_3")

class AgentCreate(AgentBase):
    pass

class AgentUpdate(BaseModel):
    personality: Optional[str] = None
    location: Optional[str] = None
    current_action: Optional[str] = None
    home_location: Optional[str] = None

class AgentResponse(AgentBase):
    id: int

    class Config:
        from_attributes = True


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
        from_attributes = True


class Action(BaseModel):
    description: str = Field(..., example="Walk to the library")
    scheduled_time: Optional[datetime] = None

class DailyPlan(BaseModel):
    agent_id: int
    date: datetime
    actions: List[Action]


class SimState(BaseModel):
    time: str = Field(..., example="9:04am")
    day_period: str = Field(..., example="morning")
    hour: int
    minute: int
    speed: float = Field(1.0, example=1.0)


class InteractionRequest(BaseModel):
    agent_a_id: int
    agent_b_id: int
    location: str
    time: Optional[str] = None


class ConversationTurn(BaseModel):
    speaker: str   # agent name
    line: str      # what they said

class InteractionResponse(BaseModel):
    happened: bool
    summary: str
    importance_a: float = Field(..., ge=0.0, le=1.0)
    importance_b: float = Field(..., ge=0.0, le=1.0)
    duration_ms: int = Field(..., ge=1000, le=20000)
    turns: list[ConversationTurn] = Field(default_factory=list)


class SpeedRequest(BaseModel):
    speed: float = Field(..., ge=0.0, le=16.0, example=2.0)


class AskRequest(BaseModel):
    question: str = Field(..., min_length=1, example="What do you think of the town?")


class AskResponse(BaseModel):
    agent_name: str
    question: str
    answer: str
