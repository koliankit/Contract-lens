import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.core.database import get_db
from backend.models.entities import Obligation
from backend.schemas.pydantic_models import ObligationSchema, ObligationStatusUpdate
from backend.services.audit_service import AuditService

router = APIRouter(prefix="/obligations", tags=["Obligations"])

@router.get("", response_model=list[ObligationSchema])
def list_obligations(
    contract_id: Optional[str] = None,
    status: Optional[str] = None,
    party: Optional[str] = None,
    internal_owner: Optional[str] = None,
    priority: Optional[str] = None,
    obligation_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Obligation)

    if contract_id:
        query = query.filter(Obligation.contract_id == contract_id)
    if status and status != "ALL":
        query = query.filter(Obligation.status == status)
    if party and party != "ALL":
        query = query.filter(Obligation.party == party)
    if internal_owner and internal_owner != "ALL":
        query = query.filter(Obligation.internal_owner.ilike(f"%{internal_owner}%"))
    if priority and priority != "ALL":
        query = query.filter(Obligation.priority == priority)
    if obligation_type and obligation_type != "ALL":
        query = query.filter(Obligation.obligation_type == obligation_type)
    if search:
        s = f"%{search}%"
        query = query.filter(or_(Obligation.action.ilike(s), Obligation.deadline_rule.ilike(s)))

    return query.order_by(Obligation.calculated_deadline.asc().nulls_last()).all()

@router.patch("/{obligation_id}", response_model=ObligationSchema)
def update_obligation_status(
    obligation_id: str,
    payload: ObligationStatusUpdate,
    db: Session = Depends(get_db)
):
    ob = db.query(Obligation).filter(Obligation.id == obligation_id).first()
    if not ob:
        raise HTTPException(status_code=404, detail="Obligation not found")

    old_status = ob.status
    ob.status = payload.status
    if payload.internal_owner:
        ob.internal_owner = payload.internal_owner
    if payload.completion_note:
        ob.completion_note = payload.completion_note
    if payload.completed_by:
        ob.completed_by = payload.completed_by

    if payload.status == "COMPLETED":
        ob.completed_at = datetime.datetime.now(datetime.timezone.utc)
        ob.completed_by = payload.completed_by or "Current User"

    db.commit()
    db.refresh(ob)

    # Log user action to audit trail
    AuditService.log(
        db=db,
        action=f"Obligation Status Updated: {old_status} -> {payload.status}",
        agent_name="Human (Contract Manager)",
        source_reference=f"{ob.contract_id} / {ob.id}",
        user_decision=payload.status,
        input_summary=payload.completion_note or f"Owner: {ob.internal_owner}",
        output_summary=f"Obligation marked as {payload.status}"
    )

    return ob
