from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from datetime import datetime
from .database import Base

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    personality = Column(Text)
    current_action = Column(String)
    location = Column(String)


class Memory(Base):
    __tablename__ = "memories"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer)
    content = Column(Text)
    importance = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
