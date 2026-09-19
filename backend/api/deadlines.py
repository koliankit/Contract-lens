from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.models.entities import Deadline
from backend.schemas.pydantic_models import DeadlineSchema

router = APIRouter(prefix="/deadlines", tags=["Deadlines"])

@router.get("", response_model=list[DeadlineSchema])
def list_deadlines(
    contract_id: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Deadline)
    if contract_id:
        query = query.filter(Deadline.contract_id == contract_id)
    if status and status != "ALL":
        query = query.filter(Deadline.status == status)
    if priority and priority != "ALL":
        query = query.filter(Deadline.priority == priority)

    return query.order_by(Deadline.calculated_date.asc()).all()
