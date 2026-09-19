import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.models.entities import Review, Obligation, VersionChange, Clause
from backend.schemas.pydantic_models import ReviewSchema, ReviewActionRequest
from backend.services.audit_service import AuditService

router = APIRouter(prefix="/reviews", tags=["Human Review Center"])

@router.get("", response_model=list[ReviewSchema])
def list_reviews(
    contract_id: Optional[str] = None,
    status: Optional[str] = None,
    issue_category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Review)
    if contract_id:
        query = query.filter(Review.contract_id == contract_id)
    if status and status != "ALL":
        query = query.filter(Review.status == status)
    if issue_category and issue_category != "ALL":
        query = query.filter(Review.issue_category == issue_category)

    return query.order_by(Review.created_at.desc()).all()

@router.post("/{review_id}/action", response_model=ReviewSchema)
def execute_review_action(
    review_id: str,
    payload: ReviewActionRequest,
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review item not found")

    action_upper = payload.action.upper()
    if action_upper not in ["CONFIRM", "CORRECT", "REJECT", "ESCALATE"]:
        raise HTTPException(status_code=400, detail=f"Invalid action {payload.action}. Must be CONFIRM, CORRECT, REJECT, or ESCALATE.")

    status_mapping = {
        "CONFIRM": "CONFIRMED",
        "CORRECT": "CORRECTED",
        "REJECT": "REJECTED",
        "ESCALATE": "ESCALATED"
    }

    review.status = status_mapping[action_upper]
    review.resolution_notes = payload.resolution_notes or f"Action {action_upper} applied by legal reviewer."
    review.resolved_at = datetime.datetime.now(datetime.timezone.utc)
    review.resolved_by = "Legal Reviewer"

    if payload.assigned_to_name:
        review.assigned_to_name = payload.assigned_to_name

    # If linked to a version change or clause, update their review_status
    if review.item_type == "VERSION_CHANGE":
        vc = db.query(VersionChange).filter(VersionChange.id == review.item_id).first()
        if vc:
            vc.review_status = "ACCEPTED" if action_upper in ["CONFIRM", "CORRECT"] else "REVIEWED"
    elif review.item_type == "CLAUSE":
        cl = db.query(Clause).filter(Clause.id == review.item_id).first()
        if cl:
            cl.review_required = False

    db.commit()
    db.refresh(review)

    # Log to audit trail
    AuditService.log(
        db=db,
        action=f"Human Review Decision: {review.title}",
        agent_name="Human (Legal & Compliance Reviewer)",
        source_reference=f"Review ID: {review.id} / Item: {review.item_id}",
        user_decision=review.status,
        input_summary=payload.resolution_notes,
        output_summary=f"Item {review.item_id} status updated to {review.status}"
    )

    return review
