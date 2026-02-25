from fastapi import FastAPI
from Backend.app.api.routes import router
from Backend.app.db.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(router)
