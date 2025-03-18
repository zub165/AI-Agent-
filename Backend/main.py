import os
import logging
from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Optional, List
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import requests

# Load environment variables
load_dotenv()

# Environment Variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./office_assistant.db")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database Setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    description = Column(String)
    completed = Column(Boolean, default=False)

class UserPreferences(Base):
    __tablename__ = "user_preferences"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    preferred_topics = Column(String)  # JSON string of preferred topics
    notification_enabled = Column(Boolean, default=True)

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# FastAPI App with lifespan management
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up...")
    yield
    logger.info("Shutting down...")

app = FastAPI(lifespan=lifespan)

# Enable CORS for Frontend Access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class MessageInput(BaseModel):
    message: str

class TaskCreate(BaseModel):
    user_id: int
    description: str

class TaskResponse(BaseModel):
    id: int
    user_id: int
    description: str
    completed: bool

class UserPreferencesUpdate(BaseModel):
    preferred_topics: List[str]
    notification_enabled: bool

# OpenAI API Call
async def get_ai_response(message: str) -> Optional[str]:
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
    data = {
        "model": "gpt-4",
        "messages": [{"role": "user", "content": message}]
    }
    
    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions", 
            headers=headers, 
            json=data,
            timeout=10
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except requests.exceptions.RequestException as e:
        logger.error(f"Error calling OpenAI API: {e}")
        return None

# Task Management
@app.post("/tasks/", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    db_task = Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/tasks/{user_id}", response_model=List[TaskResponse])
def get_tasks(user_id: int, db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.user_id == user_id).all()
    return tasks

@app.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, completed: bool, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db_task.completed = completed
    db.commit()
    db.refresh(db_task)
    return db_task

# User Preferences
@app.post("/preferences/{user_id}", response_model=Dict[str, str])
def update_preferences(user_id: int, preferences: UserPreferencesUpdate, db: Session = Depends(get_db)):
    db_preferences = db.query(UserPreferences).filter(UserPreferences.user_id == user_id).first()
    if not db_preferences:
        db_preferences = UserPreferences(user_id=user_id, **preferences.dict())
    else:
        db_preferences.preferred_topics = ",".join(preferences.preferred_topics)
        db_preferences.notification_enabled = preferences.notification_enabled
    db.add(db_preferences)
    db.commit()
    return {"message": "Preferences updated successfully"}

# Chat Endpoint
@app.post("/chat", response_model=Dict[str, str])
async def chat(input: MessageInput):
    ai_response = await get_ai_response(input.message)
    if ai_response:
        return {"response": ai_response}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing your request with AI"
        )

# Health Check
@app.get("/health")
def health_check():
    return {"status": "healthy"}