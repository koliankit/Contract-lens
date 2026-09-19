from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.agents.query_agent import QueryAgent
from backend.schemas.pydantic_models import QueryRequest, QueryResponse
from backend.services.audit_service import AuditService

router = APIRouter(prefix="/query", tags=["Ask ContractLens"])

@router.post("", response_model=QueryResponse)
def ask_contractlens(payload: QueryRequest, db: Session = Depends(get_db)):
    response = QueryAgent.answer_question(
        db=db,
        query=payload.query,
        contract_id=payload.contract_id,
        organization_id=payload.organization_id
    )

    # Log query to audit trail
    AuditService.log(
        db=db,
        action="Contract Natural Language Query",
        agent_name="Query Agent",
        tool_called="hybrid_search()",
        input_summary=payload.query,
        output_summary=response.answer[:120] + "...",
        source_reference=response.sources[0].document_name if response.sources else "Workspace",
        confidence=0.96 if response.confidence == "HIGH" else 0.80
    )

    return response
