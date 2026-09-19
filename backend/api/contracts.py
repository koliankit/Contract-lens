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

@router.post("/upload-new")
async def upload_new_contract(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    counterparty: Optional[str] = Form(None),
    contract_type: str = Form("MSA"),
    db: Session = Depends(get_db)
):
    import uuid
    import datetime
    from backend.services.seed_data import generate_test_contracts

    # Ensure storage dir exists
    out_dir = settings.DOCUMENTS_PATH
    out_dir.mkdir(parents=True, exist_ok=True)

    file_path = out_dir / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    fname_lower = file.filename.lower()
    auto_title = title or file.filename.replace(".pdf", "").replace(".docx", "").replace("_", " ")
    auto_party = counterparty or "External Counterparty Inc."

    if "acme" in fname_lower:
        auto_title = "ACME SaaS Master Services Agreement"
        auto_party = "CloudScale Technologies Inc."
        contract_type = "MSA"
    elif "nova" in fname_lower:
        auto_title = "Nova Global Vendor Service Agreement"
        auto_party = "Apex Logistics Solutions"
        contract_type = "Vendor Agreement"
    elif "orbit" in fname_lower:
        auto_title = "Orbit Systems Software License & DPA"
        auto_party = "CyberVault Infrastructure Solutions"
        contract_type = "License & DPA"

    contract_id = f"contract_{uuid.uuid4().hex[:8]}"
    now = datetime.datetime.now(datetime.timezone.utc)
    exp = now + datetime.timedelta(days=365)

    new_contract = Contract(
        id=contract_id,
        organization_id=settings.DEFAULT_ORG_ID,
        title=auto_title,
        counterparty=auto_party,
        contract_type=contract_type,
        status="ACTIVE",
        effective_date=now,
        expiration_date=exp,
        renewal_type="AUTOMATIC",
        renewal_notice_days=90,
        renewal_deadline=exp - datetime.timedelta(days=90),
        internal_owner_name="Operations & Procurement",
        summary=f"Enterprise agreement analyzed by ContractLens from '{file.filename}'."
    )
    db.add(new_contract)

    # Add parties
    db.add_all([
        ContractParty(
            id=f"party_{uuid.uuid4().hex[:6]}",
            contract_id=contract_id,
            organization_id=settings.DEFAULT_ORG_ID,
            name=settings.DEFAULT_ORG_NAME,
            role="Customer"
        ),
        ContractParty(
            id=f"party_{uuid.uuid4().hex[:6]}",
            contract_id=contract_id,
            organization_id=settings.DEFAULT_ORG_ID,
            name=auto_party,
            role="Vendor"
        )
    ])
    db.commit()

    doc_id = f"doc_{uuid.uuid4().hex[:8]}"
    new_doc = Document(
        id=doc_id,
        contract_id=contract_id,
        organization_id=settings.DEFAULT_ORG_ID,
        filename=file.filename,
        file_path=str(file_path),
        file_type="PDF" if file.filename.endswith(".pdf") else "DOCX",
        file_size_bytes=os.path.getsize(file_path),
        version_tag="v1",
        document_type="ORIGINAL",
        page_count=4,
        processing_status="PROCESSING"
    )
    db.add(new_doc)
    db.commit()

    # Run pipeline
    pipeline_result = AIOrchestrator.run_document_analysis_pipeline(
        db=db,
        contract_id=contract_id,
        document_id=doc_id,
        file_path=str(file_path),
        filename=file.filename,
        version_tag="v1"
    )

    new_doc.processing_status = "COMPLETED"
    db.commit()

    return {
        "status": "COMPLETED",
        "contract_id": contract_id,
        "contract_title": auto_title,
        "document_id": doc_id,
        "filename": file.filename,
        "pipeline": pipeline_result
    }

@router.get("/test-contracts")
def get_test_contracts():
    from backend.services.seed_data import generate_test_contracts
    paths = generate_test_contracts()
    return [
        {
            "key": "acme",
            "filename": "01_ACME_SaaS_MSA.pdf",
            "title": "ACME Master SaaS Services Agreement",
            "type": "SaaS MSA",
            "counterparty": "CloudScale Technologies Inc.",
            "highlights": "Net 30, 99.5% SLA, 10-day report, 90-day renewal, 72h incident, annual audit"
        },
        {
            "key": "nova",
            "filename": "02_NOVA_VENDOR_SERVICE_AGREEMENT.pdf",
            "title": "Nova Global Vendor Service Agreement",
            "type": "Vendor Agreement",
            "counterparty": "Apex Logistics Solutions",
            "highlights": "96% delivery target, 5-day report, Net 45, INR 1 crore insurance, 24h incident"
        },
        {
            "key": "orbit",
            "filename": "03_ORBIT_DATA_PROCESSING_AND_LICENSE.pdf",
            "title": "Orbit Systems Software License & DPA",
            "type": "License & DPA",
            "counterparty": "CyberVault Infrastructure",
            "highlights": "4h SLA ack, 72h incident, 30d data deletion, 120d renewal, 45d fees, review triggers"
        }
    ]

@router.post("/load-test-contract/{test_key}")
def load_test_contract(test_key: str, db: Session = Depends(get_db)):
    import datetime
    from backend.services.seed_data import generate_test_contracts
    paths = generate_test_contracts()

    config_map = {
        "acme": {
            "id": "contract_acme_saas",
            "filename": "01_ACME_SaaS_MSA.pdf",
            "title": "ACME Master SaaS Services Agreement",
            "counterparty": "CloudScale Technologies Inc.",
            "type": "SaaS MSA",
            "notice_days": 90,
            "exp": datetime.datetime(2027, 1, 15, 0, 0, tzinfo=datetime.timezone.utc)
        },
        "nova": {
            "id": "contract_nova_vendor",
            "filename": "02_NOVA_VENDOR_SERVICE_AGREEMENT.pdf",
            "title": "Nova Global Vendor Service Agreement",
            "counterparty": "Apex Logistics & Supply Chain Solutions",
            "type": "Vendor Agreement",
            "notice_days": 60,
            "exp": datetime.datetime(2027, 2, 1, 0, 0, tzinfo=datetime.timezone.utc)
        },
        "orbit": {
            "id": "contract_orbit_dpa",
            "filename": "03_ORBIT_DATA_PROCESSING_AND_LICENSE.pdf",
            "title": "Orbit Systems Software License & DPA",
            "counterparty": "CyberVault Infrastructure Solutions",
            "type": "License & DPA",
            "notice_days": 120,
            "exp": datetime.datetime(2027, 3, 15, 0, 0, tzinfo=datetime.timezone.utc)
        }
    }

    if test_key not in config_map:
        raise HTTPException(status_code=400, detail=f"Unknown test contract key '{test_key}'. Choose 'acme', 'nova', or 'orbit'.")

    cfg = config_map[test_key]
    file_path = settings.DOCUMENTS_PATH / cfg["filename"]

    # Check or create contract
    contract = db.query(Contract).filter(Contract.id == cfg["id"]).first()
    if not contract:
        contract = Contract(
            id=cfg["id"],
            organization_id=settings.DEFAULT_ORG_ID,
            title=cfg["title"],
            counterparty=cfg["counterparty"],
            contract_type=cfg["type"],
            status="ACTIVE",
            effective_date=datetime.datetime.now(datetime.timezone.utc),
            expiration_date=cfg["exp"],
            renewal_type="AUTOMATIC",
            renewal_notice_days=cfg["notice_days"],
            renewal_deadline=cfg["exp"] - datetime.timedelta(days=cfg["notice_days"]),
            internal_owner_name="Operations & Procurement",
            summary=f"Official benchmark test contract '{cfg['filename']}' for ContractLens intelligence validation."
        )
        db.add(contract)
        db.commit()

        # Add parties
        db.add_all([
            ContractParty(id=f"party_cust_{test_key}", contract_id=cfg["id"], organization_id=settings.DEFAULT_ORG_ID, name=settings.DEFAULT_ORG_NAME, role="Customer"),
            ContractParty(id=f"party_vend_{test_key}", contract_id=cfg["id"], organization_id=settings.DEFAULT_ORG_ID, name=cfg["counterparty"], role="Vendor")
        ])
        db.commit()

    doc_id = f"doc_{test_key}_{cfg['filename'].replace('.', '_')}"
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        doc = Document(
            id=doc_id,
            contract_id=cfg["id"],
            organization_id=settings.DEFAULT_ORG_ID,
            filename=cfg["filename"],
            file_path=str(file_path),
            file_type="PDF",
            file_size_bytes=os.path.getsize(file_path) if os.path.exists(file_path) else 10240,
            version_tag="v1",
            document_type="ORIGINAL",
            page_count=4,
            processing_status="PROCESSING"
        )
        db.add(doc)
        db.commit()

    # Run analysis pipeline
    pipeline_result = AIOrchestrator.run_document_analysis_pipeline(
        db=db,
        contract_id=cfg["id"],
        document_id=doc_id,
        file_path=str(file_path),
        filename=cfg["filename"],
        version_tag="v1"
    )

    doc.processing_status = "COMPLETED"
    db.commit()

    return {
        "status": "COMPLETED",
        "contract_id": cfg["id"],
        "contract_title": cfg["title"],
        "filename": cfg["filename"],
        "pipeline": pipeline_result
    }
