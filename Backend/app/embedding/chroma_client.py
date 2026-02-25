import chromadb
from chromadb.utils import embedding_functions

client = chromadb.Client()

embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

memory_collection = client.create_collection(
    name="agent_memories",
    embedding_function=embedding_function
)
