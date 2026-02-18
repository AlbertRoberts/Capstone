from app.embedding.chroma_client import memory_collection
from app.db.database import SessionLocal
from app.db.models import Memory

def add_memory(agent_id: int, content: str, importance: float):
    db = SessionLocal()

    # Save raw memory
    memory = Memory(
        agent_id=agent_id,
        content=content,
        importance=importance
    )
    db.add(memory)
    db.commit()
    db.refresh(memory)

    # Save embedding
    memory_collection.add(
        documents=[content],
        metadatas=[{"agent_id": agent_id}],
        ids=[str(memory.id)]
    )

    db.close()
