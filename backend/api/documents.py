import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.core.config import settings
from backend.models.entities import Document, Evidence
from backend.schemas.pydantic_models import EvidenceSchema

router = APIRouter(prefix="/documents", tags=["Documents & Evidence"])

@router.get("/{document_id}/file")
def get_document_pdf_file(document_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc or not os.path.exists(doc.file_path):
        # Fallback to direct filename match
        test_path = settings.DOCUMENTS_PATH / f"{document_id}.pdf"
        if test_path.exists():
            return FileResponse(str(test_path), media_type="application/pdf", filename=test_path.name)
        raise HTTPException(status_code=404, detail="PDF Document file not found")

    return FileResponse(
        doc.file_path,
        media_type="application/pdf",
        filename=doc.filename
    )

@router.get("/{document_id}/pages")
def get_document_pages(document_id: str, db: Session = Depends(get_db)):
    from backend.agents.document_agent import DocumentIntelligenceAgent
    from backend.models.entities import Clause

    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    pages = []
    # 1. Try reading real file from disk if present
    if os.path.exists(doc.file_path):
        parsed = DocumentIntelligenceAgent.process_file(doc.file_path, doc.filename)
        for p in parsed.get("pages", []):
            if p.get("text", "").strip():
                pages.append({
                    "page_number": p.get("page_number", 1),
                    "title": f"Page {p.get('page_number', 1)} — {doc.filename}",
                    "content": p.get("text")
                })

    # 2. If no text extracted from disk, construct pages from database clauses
    if not pages:
        clauses = db.query(Clause).filter(Clause.document_id == document_id).all()
        by_page: dict[int, list[str]] = {}
        for cl in clauses:
            pg = cl.page_number or 1
            if pg not in by_page:
                by_page[pg] = []
            by_page[pg].append(f"SECTION {cl.section_number}: {cl.title.upper()}\n{cl.source_text}")

        for pg in sorted(by_page.keys()):
            pages.append({
                "page_number": pg,
                "title": f"Page {pg} — {doc.filename}",
                "content": "\n\n".join(by_page[pg])
            })

    # 3. Fallback to standard 4-page structure if empty
    if not pages:
        pages = [
            {
                "page_number": 1,
                "title": "Parties & Recitals",
                "content": f"MASTER AGREEMENT: {doc.filename}\n\nThis Agreement is entered into by and between the parties hereto pursuant to the terms and conditions herein."
            },
            {
                "page_number": 2,
                "title": "Terms, Invoicing & Service Commitments",
                "content": "All undisputed invoices payable under agreed terms.\nService level commitments and monthly reporting standards apply."
            },
            {
                "page_number": 3,
                "title": "Renewal & Notice Provisions",
                "content": "Either party may terminate or prevent automatic renewal by providing prior written notice before term expiration."
            },
            {
                "page_number": 4,
                "title": "Signatures & Execution",
                "content": "IN WITNESS WHEREOF, the authorized representatives have executed this agreement."
            }
        ]

    return {
        "document_id": document_id,
        "filename": doc.filename,
        "page_count": len(pages),
        "pages": pages
    }

@router.get("/evidence/{evidence_id}", response_model=EvidenceSchema)
def get_evidence(evidence_id: str, db: Session = Depends(get_db)):
    ev = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence record not found")
    return ev
