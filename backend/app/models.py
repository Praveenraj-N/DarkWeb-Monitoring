from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Boolean
from sqlalchemy.sql import func
from .database import Base

from sqlalchemy import Column, Integer, String
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)


class Sample(Base):
    __tablename__ = 'samples'

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, index=True)          # e.g. tor, pastebin, clearnet
    url = Column(String, index=True)
    title = Column(String, nullable=True)
    content = Column(Text)
    extra_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    flagged = Column(Boolean, default=False)
