from fastapi import FastAPI

app = FastAPI(title="Little ReaLLM Backend")

@app.get("/")
def health_check():
    return {"status": "ok"}
