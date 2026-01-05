# backend/app/crud.py

from sqlalchemy.orm import Session
from . import models, schemas


def create_sample(db: Session, sample: schemas.SampleCreate):
    """Create a new scanned sample entry."""
    db_item = models.Sample(
        url=sample.url,
        source=sample.source,
        title=sample.title,
        content=sample.content,
        flagged=sample.flagged,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def get_samples(db: Session, skip: int = 0, limit: int = 100):
    """Fetch all stored samples."""
    return db.query(models.Sample).offset(skip).limit(limit).all()


def search_samples(db: Session, q: str = None):
    """Search for keyword in stored samples."""
    query = db.query(models.Sample)
    if q:
        query = query.filter(
            (models.Sample.title.ilike(f"%{q}%")) |
            (models.Sample.content.ilike(f"%{q}%")) |
            (models.Sample.source.ilike(f"%{q}%"))
        )
    return query.order_by(models.Sample.created_at.desc()).all()


def flag_sample(db: Session, sample_id: int, flagged: bool = True):
    """Mark a sample as flagged."""
    sample = db.query(models.Sample).filter(models.Sample.id == sample_id).first()
    if sample:
        sample.flagged = flagged
        db.commit()
        db.refresh(sample)
    return sample
