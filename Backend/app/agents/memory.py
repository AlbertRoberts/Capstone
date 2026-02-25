from sqlalchemy.orm import Session
from Backend.app.embedding.chroma_client import memory_collection
from Backend.app.db.database import SessionLocal
from Backend.app.db.models import Memory

def add_memory(db: Session,agent_id: int, content: str, importance: float):
    memory = Memory(
        agent_id=agent_id,
        content=content,
        importance=importance
    )
    db.add(memory)
    db.commit()
    db.refresh(memory)

    memory_collection.add(
        documents=[content],
        metadatas=[{"agent_id": agent_id}],
        ids=[str(memory.id)]
    )

    return memory
    
def retrieve_memories(agent_id: int, query: str, k: int = 5):
    results = memory_collection.query(
        query_texts=[query],
        n_results=k,
        where={"agent_id": agent_id}
    )
    return results

def reflect(agent_id: int):
    memories = retrieve_memories(agent_id, "important life events", 10)
    #todo: replace with llm call later
    reflection = f"Based on memories: {memories}"

    add_memory(agent_id, reflection, importance=0.9)


