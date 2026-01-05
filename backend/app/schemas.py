from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class SampleCreate(BaseModel):
    source: str
    url: str
    title: Optional[str]
    content: str
    extra_metadata: Optional[Any]


class SampleOut(BaseModel):
    id: int
    source: str
    url: str
    title: Optional[str]
    content: str
    extra_metadata: Optional[Any]
    created_at: datetime
    flagged: bool

    class Config:
        orm_mode = True
