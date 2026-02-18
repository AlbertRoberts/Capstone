from sqlalchemy import Column, Integer, String, Text
from .database import Base

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    personality = Column(Text)
    current_plan = Column(Text)
