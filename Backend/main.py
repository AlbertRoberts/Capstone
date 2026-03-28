from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Backend.app.api.routes import router
from Backend.app.db.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
