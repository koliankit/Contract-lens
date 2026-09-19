from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.models.entities import VersionChange
from backend.schemas.pydantic_models import VersionChangeSchema

router = APIRouter(prefix="/changes", tags=["Version Changes"])

@router.get("", response_model=list[VersionChangeSchema])
def list_version_changes(
    contract_id: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(VersionChange)
    if contract_id:
        query = query.filter(VersionChange.contract_id == contract_id)
    if category and category != "ALL":
        query = query.filter(VersionChange.change_category == category)

    return query.order_by(VersionChange.created_at.desc()).all()
