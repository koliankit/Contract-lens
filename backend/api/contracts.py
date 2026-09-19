import os
import shutil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.core.database import get_db
from backend.core.config import settings
from backend.models.entities import Contract, Document, Clause, Obligation, Deadline, Review, VersionChange, ContractParty
from backend.schemas.pydantic_models import ContractDetailSchema, ContractListItemSchema
from backend.agents.orchestrator import AIOrchestrator

router = APIRouter(prefix="/contracts", tags=["Contracts"])

@router.get("", response_model=list[ContractListItemSchema])
def list_contracts(
    search: Optional[str] = None,
    status: Optional[str] = None,
    contract_type: Optional[str] = None,
    owner: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Contract)
    if search:
        s = f"%{search}%"
        query = query.filter(or_(Contract.title.ilike(s), Contract.counterparty.ilike(s)))
    if status and status != "ALL":
        query = query.filter(Contract.status == status)
    if contract_type and contract_type != "ALL":
        query = query.filter(Contract.contract_type == contract_type)
    if owner and owner != "ALL":
        query = query.filter(Contract.internal_owner_name.ilike(f"%{owner}%"))

    contracts = query.all()
    results = []
    for c in contracts:
        ob_count = db.query(Obligation).filter(Obligation.contract_id == c.id).count()
        dl_count = db.query(Deadline).filter(Deadline.contract_id == c.id).count()
        rev_count = db.query(Review).filter(Review.contract_id == c.id, Review.status == "PENDING").count()

        results.append(ContractListItemSchema(
            id=c.id,
            title=c.title,
            counterparty=c.counterparty,
            contract_type=c.contract_type,
            status=c.status,
            effective_date=c.effective_date,
            expiration_date=c.expiration_date,
            renewal_type=c.renewal_type,
            renewal_deadline=c.renewal_deadline,
            internal_owner_name=c.internal_owner_name,
            obligations_count=ob_count,
            deadlines_count=dl_count,
            open_reviews_count=rev_count
        ))
    return results

@router.get("/{contract_id}", response_model=ContractDetailSchema)
def get_contract_detail(contract_id: str, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return contract

@router.post("/{contract_id}/upload-document")
async def upload_document(
    contract_id: str,
    file: UploadFile = File(...),
    version_tag: str = Form("v1"),
    document_type: str = Form("ORIGINAL"),
    db: Session = Depends(get_db)
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    # Save file
    file_path = settings.DOCUMENTS_PATH / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    doc_id = f"doc_{file.filename.replace('.', '_')}"
    new_doc = Document(
        id=doc_id,
        contract_id=contract_id,
        organization_id=contract.organization_id,
        filename=file.filename,
        file_path=str(file_path),
        file_type="PDF" if file.filename.endswith(".pdf") else "DOCX",
        file_size_bytes=os.path.getsize(file_path),
        version_tag=version_tag,
        document_type=document_type,
        page_count=6,
        processing_status="PROCESSING"
    )
    db.add(new_doc)
    db.commit()

    # Trigger pipeline
    pipeline_result = AIOrchestrator.run_document_analysis_pipeline(
        db=db,
        contract_id=contract_id,
        document_id=doc_id,
        file_path=str(file_path),
        filename=file.filename,
        version_tag=version_tag
    )

    new_doc.processing_status = "COMPLETED"
    db.commit()

    return {
        "status": "COMPLETED",
        "document_id": doc_id,
        "filename": file.filename,
        "pipeline": pipeline_result
    }
