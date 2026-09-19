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
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Structured pages representation for the document reader
    # Realistic page mock for ACME_MSA_v2.pdf with Section 12.2 and Section 8.4
    pages = [
        {
            "page_number": 1,
            "title": "Parties & Recitals",
            "content": (
                "MASTER SERVICES AGREEMENT (VERSION 2)\n\n"
                "This Master Services Agreement Version 2 ('Agreement') is entered into effective 15 January 2026 ('Effective Date'), "
                "by and between ACME Corporation ('Customer') and XYZ Software Services Inc. ('Vendor').\n\n"
                "RECITALS:\n"
                "WHEREAS, Customer desires to license Vendor's cloud intelligence software;\n"
                "WHEREAS, Vendor agrees to provide such enterprise services pursuant to the terms and conditions herein."
            )
        },
        {
            "page_number": 2,
            "title": "Payment Terms",
            "content": (
                "SECTION 4. FEES AND PAYMENT TERMS\n\n"
                "Section 4.1 Payment Terms (Net 45):\n"
                "Customer shall pay all undisputed invoices within forty-five (45) days of invoice receipt ('Net 45'). "
                "All payments shall be remitted by electronic funds transfer to Vendor's designated commercial bank account.\n\n"
                "Section 4.2 Disputed Invoices:\n"
                "In the event of a good faith billing dispute, Customer shall provide written notice within twenty (20) days."
            )
        },
        {
            "page_number": 3,
            "title": "SLA & Performance Reporting",
            "content": (
                "SECTION 8. SERVICE LEVEL COMMITMENTS & MONITORING\n\n"
                "Section 8.1 Availability Commitment:\n"
                "Vendor warrants that the cloud platform will maintain 99.9% monthly uptime, offering 10% service credits if uptime falls below 99.9%.\n\n"
                "Section 8.4 Monthly Performance Report:\n"
                "Vendor shall submit monthly performance reports and availability metrics within 5 business days after month end to Customer Operations."
            )
        },
        {
            "page_number": 4,
            "title": "Insurance Policies",
            "content": (
                "SECTION 10. INSURANCE REQUIREMENTS\n\n"
                "Section 10.3 Required Policies:\n"
                "Vendor shall maintain Commercial General Liability and Cyber Risk insurance with aggregate limits of not less than $2,000,000 "
                "throughout the Term and provide an annual Certificate of Insurance upon renewal."
            )
        },
        {
            "page_number": 5,
            "title": "Term, Renewal & Termination",
            "content": (
                "SECTION 12. TERM, RENEWAL, AND TERMINATION\n\n"
                "Section 12.1 Term:\n"
                "This Agreement shall commence on 15 January 2026 and shall expire on 15 January 2027 ('Expiration Date').\n\n"
                "Section 12.2 Renewal Notice:\n"
                "Either party may terminate this Agreement or prevent automatic renewal by providing at least ninety (90) days prior written notice "
                "before the expiration of the Initial Term. In the absence of such notice, this Agreement shall automatically renew for successive one (1) year terms."
            )
        },
        {
            "page_number": 6,
            "title": "Audit Rights & Execution",
            "content": (
                "SECTION 15. AUDIT RIGHTS AND GOVERNING LAW\n\n"
                "Section 15.2 Audit Rights:\n"
                "Customer or its designated independent auditor may conduct an annual audit of Vendor's security controls and compliance records.\n\n"
                "IN WITNESS WHEREOF, the parties hereto have executed this Agreement."
            )
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
