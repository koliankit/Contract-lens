from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.services.contract_graph import ContractGraphService
from backend.schemas.pydantic_models import ContractGraphResponse

router = APIRouter(prefix="/graph", tags=["Contract Graph"])

@router.get("/{contract_id}", response_model=ContractGraphResponse)
def get_contract_graph(contract_id: str, db: Session = Depends(get_db)):
    graph = ContractGraphService.build_graph_for_contract(db, contract_id)
    if not graph or not graph["nodes"]:
        raise HTTPException(status_code=404, detail="Contract graph not found")
    return graph

@router.post("/{contract_id}/query")
def query_graph_relationships(
    contract_id: str,
    payload: dict[str, str] = Body(...),
    db: Session = Depends(get_db)
):
    question = payload.get("query", "")
    if not question:
        raise HTTPException(status_code=400, detail="Query parameter required")

    return ContractGraphService.query_graph_relationships(db, contract_id, question)
