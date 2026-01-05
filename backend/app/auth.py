# backend/app/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError
from pydantic import BaseModel, constr
from .database import SessionLocal
from .models import User
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "mysecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# bcrypt-based password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------- Models ----------
class UserCreate(BaseModel):
    username: str
    password: constr(max_length=72)  # ensure bcrypt-safe length

class UserLogin(BaseModel):
    username: str
    password: constr(max_length=72)

class Token(BaseModel):
    access_token: str
    token_type: str


# ---------- Database Dependency ----------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------- Utility Functions ----------
def get_password_hash(password: str):
    """Generate bcrypt hash safely (limit to 72 bytes)."""
    password = password[:72]  # truncate long passwords
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    """Verify password securely."""
    plain_password = plain_password[:72]
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# ---------- Routes ----------
@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "✅ Signup successful", "username": new_user.username}


@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}
