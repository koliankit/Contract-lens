import os
import datetime
from pathlib import Path
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from backend.core.config import settings
from backend.core.database import SessionLocal, init_db
from backend.models.entities import (
    Organization, User, Contract, ContractParty, Document, Clause,
    Obligation, Deadline, Review, VersionChange, Evidence,
    ContractRelationship, Notification, AuditLog
)

def generate_pdf_document(filename: str, title: str, pages_content: list[list[str]]) -> str:
    out_dir = Path(settings.DOCUMENTS_PATH)
    out_dir.mkdir(parents=True, exist_ok=True)
    file_path = out_dir / filename

    doc = SimpleDocTemplate(str(file_path), pagesize=letter, leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#1A1A1A"),
        spaceAfter=14
    )
    
    section_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#2B2B2B"),
        spaceBefore=12,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#333333"),
        spaceAfter=8
    )

    story = []
    # Document title header
    story.append(Paragraph(title, title_style))
    story.append(Paragraph(f"Generated Enterprise Legal Document — {datetime.date.today().strftime('%B %d, %Y')}", body_style))
    story.append(Spacer(1, 15))

    for p_idx, page_paragraphs in enumerate(pages_content):
        if p_idx > 0:
            story.append(PageBreak())
        story.append(Paragraph(f"<b>PAGE {p_idx + 1} — {title.upper()}</b>", body_style))
        story.append(Spacer(1, 10))

        for text in page_paragraphs:
            if text.startswith("SECTION") or text.startswith("ARTICLE") or text.startswith("AMENDMENT") or text.startswith("SCHEDULE"):
                story.append(Paragraph(text, section_style))
            else:
                story.append(Paragraph(text, body_style))
            story.append(Spacer(1, 4))

    doc.build(story)
    return str(file_path)

def seed_database_and_documents():
    init_db()
    db = SessionLocal()

    try:
        # Check if already seeded
        existing_contract = db.query(Contract).filter(Contract.id == "contract_acme_msa").first()
        if existing_contract:
            print("[Seed] Database already populated with ACME contract suite.")
            return

        print("[Seed] Generating 4 real legal PDF files via ReportLab...")

        # 1. ACME_MSA_v1.pdf (6 Pages)
        v1_pages = [
            # Page 1: Parties, Recitals, Term
            [
                "SECTION 1. PARTIES AND EFFECTIVE DATE",
                "This Master Services Agreement ('Agreement') is entered into effective 15 January 2025 ('Effective Date'), by and between ACME Corporation ('Customer') and XYZ Software Services Inc. ('Vendor').",
                "SECTION 2. TERM AND INITIAL PERIOD",
                "The initial term of this Agreement shall commence on 15 January 2025 and continue in full force and effect until 15 January 2026 ('Initial Term')."
            ],
            # Page 2: Scope & Fees
            [
                "SECTION 3. SERVICES AND DELIVERABLES",
                "Vendor agrees to deliver enterprise cloud contract intelligence and automation services as described in Statement of Work No. 1.",
                "SECTION 4. PAYMENT TERMS (NET 30)",
                "Section 4.1 Payment Terms: Customer shall pay all undisputed invoices within thirty (30) days of invoice receipt ('Net 30'). Late payments shall accrue interest at 1.0% per month."
            ],
            # Page 3: SLA & Support
            [
                "SECTION 8. SERVICE LEVELS AND REPORTING",
                "Section 8.1 Availability: Vendor warrants that the core SaaS platform will maintain 99.5% monthly uptime, excluding scheduled maintenance.",
                "Section 8.4 Monthly SLA Reporting: Vendor shall submit monthly performance reports within 10 business days following the close of each calendar month."
            ],
            # Page 4: Insurance & Liability
            [
                "SECTION 10. INSURANCE COVERAGE",
                "Section 10.3 Required Policies: Vendor shall maintain Commercial General Liability insurance with policy limits of not less than $1,000,000 per occurrence during the Term."
            ],
            # Page 5: Termination Notice (30 Days in v1)
            [
                "SECTION 12. TERMINATION AND RENEWAL",
                "Section 12.1 Termination for Cause: Either party may terminate upon 30 days written notice of material breach.",
                "Section 12.2 Renewal Notice: Either party may terminate this Agreement by providing at least thirty (30) days prior written notice before the expiration of the Initial Term."
            ],
            # Page 6: Signatures
            [
                "SECTION 15. GOVERNING LAW AND EXECUTION",
                "This Agreement is governed by the laws of the State of Delaware.",
                "IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of 15 January 2025."
            ]
        ]
        p1 = generate_pdf_document("ACME_MSA_v1.pdf", "Master Services Agreement (v1)", v1_pages)

        # 2. ACME_MSA_v2.pdf (6 Pages - Crucial version with 90-day renewal, Net 45, $2M insurance, 99.9% SLA)
        v2_pages = [
            # Page 1: Updated Effective Date
            [
                "SECTION 1. REVISED PARTIES AND TERM",
                "This Master Services Agreement Version 2 ('Agreement') is entered into effective 15 January 2026 ('Effective Date'), between ACME Corporation ('Customer') and XYZ Software Services Inc. ('Vendor').",
                "SECTION 2. TERM OF AGREEMENT",
                "The Term of this Agreement shall commence on 15 January 2026 and shall expire on 15 January 2027 ('Expiration Date'), unless renewed pursuant to Section 12.2."
            ],
            # Page 2: Payment Terms (Net 45)
            [
                "SECTION 4. PAYMENT TERMS (NET 45)",
                "Section 4.1 Payment Terms: Customer shall pay all undisputed invoices within forty-five (45) days of invoice receipt ('Net 45'). Payments shall be remitted by electronic funds transfer to Vendor's designated account."
            ],
            # Page 3: SLA & Monthly Report within 5 business days
            [
                "SECTION 8. SERVICE LEVELS AND REPORTING",
                "Section 8.1 Availability Commitment: Vendor warrants that the cloud platform will maintain 99.9% monthly uptime, offering 10% service credits if uptime falls below 99.9%.",
                "Section 8.4 Monthly Performance Report: Vendor shall submit monthly performance reports and availability metrics within 5 business days after month end to Customer Operations."
            ],
            # Page 4: Insurance ($2M)
            [
                "SECTION 10. INSURANCE COVERAGE",
                "Section 10.3 Required Policies: Vendor shall maintain Commercial General Liability and Cyber Risk insurance with aggregate limits of not less than $2,000,000 throughout the Term and provide an annual Certificate of Insurance."
            ],
            # Page 5: Termination / Renewal Notice (90 Days - 17 Oct 2026 Deadline!)
            [
                "SECTION 12. TERMINATION AND RENEWAL NOTICE",
                "Section 12.1 Termination for Cause: Either party may terminate for uncured material breach upon 30 days written notice.",
                "Section 12.2 Renewal Notice: Either party may terminate this Agreement or prevent automatic renewal by providing at least ninety (90) days prior written notice before the expiration of the Initial Term (Expiration Date: 15 January 2027)."
            ],
            # Page 6: Compliance and Signatures
            [
                "SECTION 15. AUDIT RIGHTS AND GOVERNING LAW",
                "Section 15.2 Audit Rights: Customer or its designated independent auditor may conduct an annual audit of Vendor's security controls and compliance records.",
                "Executed by authorized representatives of ACME Corporation and XYZ Software Services Inc."
            ]
        ]
        p2 = generate_pdf_document("ACME_MSA_v2.pdf", "Master Services Agreement (v2)", v2_pages)

        # 3. ACME_SLA.pdf (3 Pages)
        sla_pages = [
            [
                "SCHEDULE A: SERVICE LEVEL AGREEMENT (SLA)",
                "This Service Level Agreement governs the performance and availability commitments provided by XYZ Software Services Inc. to ACME Corporation under Master Agreement v2.",
                "SECTION 1. PLATFORM UPTIME GUARANTEE",
                "Platform availability is guaranteed at 99.9% measured on a calendar month basis. Scheduled maintenance shall occur only between 02:00 and 04:00 UTC on Sundays."
            ],
            [
                "SECTION 2. SERVICE CREDITS",
                "In the event of uptime below 99.9%, Customer is entitled to receive a 10% service credit applied to the subsequent monthly billing cycle upon written claim within 30 days of month end.",
                "SECTION 3. INCIDENT RESPONSE TIERS",
                "Priority 1 Critical outages require response within 15 minutes and continuous updates every 60 minutes until resolution."
            ],
            [
                "SECTION 4. QUARTERLY REVIEW AND AUDIT",
                "Operations leadership from both Customer and Vendor shall meet quarterly within 30 days of quarter end to review SLA performance, incident logs, and service improvement plans."
            ]
        ]
        p3 = generate_pdf_document("ACME_SLA.pdf", "Service Level Agreement (SLA Schedule)", sla_pages)

        # 4. ACME_Amendment.pdf (2 Pages)
        amend_pages = [
            [
                "AMENDMENT NO. 1 TO MASTER SERVICES AGREEMENT",
                "This Amendment No. 1 ('Amendment') is effective as of 1 March 2026, by and between ACME Corporation and XYZ Software Services Inc.",
                "RECITALS: The parties desire to amend Section 4 (Payment) and Section 14 (Data Protection) of the Master Agreement.",
                "SECTION 1. PAYMENT MODIFICATION",
                "The parties hereby confirm that all invoices shall be payable under Net 45 terms, with invoice approvals submitted through Customer's central ERP portal."
            ],
            [
                "SECTION 2. SECURITY INCIDENT NOTIFICATION (72 HOURS)",
                "Section 14.3 Data Breach Reporting: Vendor shall notify Customer in writing within seventy-two (72) hours of becoming aware of any confirmed personal data breach or security incident involving Customer data.",
                "IN WITNESS WHEREOF, the parties have executed this Amendment as of 1 March 2026."
            ]
        ]
        p4 = generate_pdf_document("ACME_Amendment.pdf", "Amendment No. 1", amend_pages)

        print("[Seed] Populating database entities matching Section 40 target metrics...")

        # Organization
        org = Organization(
            id=settings.DEFAULT_ORG_ID,
            name=settings.DEFAULT_ORG_NAME,
            domain="acme-corp.com"
        )
        db.add(org)

        # User
        user = User(
            id=settings.DEFAULT_USER_ID,
            organization_id=org.id,
            name=settings.DEFAULT_USER_NAME,
            email="rahul.sharma@acme-corp.com",
            role="Contract Manager"
        )
        db.add(user)

        # Contract
        contract = Contract(
            id="contract_acme_msa",
            organization_id=org.id,
            title="ACME Software Agreement (MSA v2)",
            counterparty="XYZ Software Services Inc.",
            contract_type="MSA",
            status="ACTIVE",
            effective_date=datetime.datetime(2026, 1, 15, tzinfo=datetime.timezone.utc),
            expiration_date=datetime.datetime(2027, 1, 15, tzinfo=datetime.timezone.utc),
            renewal_type="MANUAL",
            renewal_notice_days=90,
            renewal_deadline=datetime.datetime(2026, 10, 17, 18, 0, tzinfo=datetime.timezone.utc),
            internal_owner_id=user.id,
            internal_owner_name="Operations & Procurement",
            summary="Master Services Agreement governing enterprise software licensing, 99.9% uptime SLA commitments, Net 45 billing, $2M insurance, and 90-day renewal notice period."
        )
        db.add(contract)

        # Parties
        p_customer = ContractParty(
            id="party_customer",
            contract_id=contract.id,
            organization_id=org.id,
            name="ACME Corporation",
            role="Customer",
            contact_email="procurement@acme-corp.com",
            responsibilities_summary="Timely invoice payment (Net 45), SLA claim submission, non-renewal notification (90 days prior)."
        )
        p_vendor = ContractParty(
            id="party_vendor",
            contract_id=contract.id,
            organization_id=org.id,
            name="XYZ Software Services Inc.",
            role="Vendor",
            contact_email="legal@xyzservices.io",
            responsibilities_summary="Platform 99.9% uptime, monthly performance reporting (within 5 business days), $2M insurance maintenance, 72h breach notice."
        )
        db.add_all([p_customer, p_vendor])

        # Documents
        doc_v1 = Document(
            id="doc_acme_v1",
            contract_id=contract.id,
            organization_id=org.id,
            filename="ACME_MSA_v1.pdf",
            file_path=p1,
            file_type="PDF",
            file_size_bytes=os.path.getsize(p1),
            version_tag="v1",
            document_type="ORIGINAL",
            page_count=6,
            processing_status="COMPLETED"
        )
        doc_v2 = Document(
            id="doc_acme_v2",
            contract_id=contract.id,
            organization_id=org.id,
            filename="ACME_MSA_v2.pdf",
            file_path=p2,
            file_type="PDF",
            file_size_bytes=os.path.getsize(p2),
            version_tag="v2",
            document_type="VERSION_UPDATE",
            page_count=6,
            processing_status="COMPLETED"
        )
        doc_sla = Document(
            id="doc_acme_sla",
            contract_id=contract.id,
            organization_id=org.id,
            filename="ACME_SLA.pdf",
            file_path=p3,
            file_type="PDF",
            file_size_bytes=os.path.getsize(p3),
            version_tag="Schedule A",
            document_type="ADDENDUM",
            page_count=3,
            processing_status="COMPLETED"
        )
        doc_amend = Document(
            id="doc_acme_amend",
            contract_id=contract.id,
            organization_id=org.id,
            filename="ACME_Amendment.pdf",
            file_path=p4,
            file_type="PDF",
            file_size_bytes=os.path.getsize(p4),
            version_tag="Amendment 1",
            document_type="AMENDMENT",
            page_count=2,
            processing_status="COMPLETED"
        )
        db.add_all([doc_v1, doc_v2, doc_sla, doc_amend])

        # Clauses (Generating realistic ~42 clauses across all 25+ categories)
        clause_specs = [
            ("Payment", "Payment Terms (Net 45)", "Customer shall pay all undisputed invoices within forty-five (45) days of receipt (Net 45).", 2, "4.1", "MEDIUM", False),
            ("Renewal", "Renewal Notice Period", "Either party may terminate this Agreement or prevent automatic renewal by providing at least ninety (90) days prior written notice before the expiration of the Initial Term.", 5, "12.2", "HIGH", True),
            ("Termination", "Termination for Cause", "Either party may terminate for uncured material breach upon thirty (30) days written notice.", 5, "12.1", "HIGH", False),
            ("SLA", "Platform Availability 99.9%", "Vendor warrants that the cloud platform will maintain 99.9% monthly uptime, offering 10% service credits if uptime falls below 99.9%.", 3, "8.1", "MEDIUM", False),
            ("Deliverables", "Monthly Performance Reporting", "Vendor shall submit monthly performance reports and availability metrics within 5 business days after month end to Customer Operations.", 3, "8.4", "LOW", False),
            ("Insurance", "Commercial General & Cyber Coverage", "Vendor shall maintain Commercial General Liability and Cyber Risk insurance with aggregate limits of not less than $2,000,000 throughout the Term.", 4, "10.3", "MEDIUM", False),
            ("Audit Rights", "Annual Security Audit", "Customer or its designated independent auditor may conduct an annual audit of Vendor's security controls and compliance records.", 6, "15.2", "LOW", False),
            ("Data Protection", "Breach Notification Window", "Vendor shall notify Customer in writing within seventy-two (72) hours of becoming aware of any confirmed personal data breach.", 2, "14.3", "CRITICAL", False),
            ("Security", "SOC 2 Type II Certification", "Vendor shall annually deliver an updated SOC 2 Type II attestation report covering security and confidentiality trust principles.", 4, "9.2", "MEDIUM", False),
            ("Liability", "Limitation of Liability Cap", "Except for indemnity and confidentiality breaches, total aggregate liability shall not exceed twelve (12) months of fees paid.", 4, "11.1", "HIGH", False),
            ("Indemnification", "IP Infringement Indemnity", "Vendor shall defend and indemnify Customer against third-party claims alleging that the software infringes any patent or copyright.", 4, "11.4", "HIGH", False),
            ("Confidentiality", "Non-Disclosure of Proprietary Data", "Each party agrees to safeguard confidential information with at least the same degree of care it uses for its own confidential data.", 3, "7.1", "LOW", False),
            ("Intellectual Property", "Ownership of Customer Data", "Customer retains all right, title, and interest in and to Customer Data, including all intellectual property rights.", 3, "7.4", "MEDIUM", False),
            ("Governing Law", "Jurisdiction and Venue", "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware.", 6, "15.1", "LOW", False),
            ("Dispute Resolution", "Executive Escalation & Mediation", "In the event of dispute, executive sponsors shall meet within 15 business days prior to initiating formal arbitration.", 6, "15.3", "LOW", False),
            ("Force Majeure", "Excused Performance", "Neither party shall be liable for delay caused by acts of God, war, pandemic, or government action.", 5, "13.1", "LOW", False),
            ("Assignment", "Assignment Restrictions", "Neither party may assign this Agreement without prior written consent, except in connection with a merger or acquisition.", 6, "15.4", "LOW", False),
            ("Subcontracting", "Subcontractor Approval", "Vendor may utilize approved subcontractors provided Vendor remains fully liable for their performance.", 2, "3.3", "LOW", False),
            ("Change Control", "Written Amendment Requirement", "No modification or waiver of any provision shall be valid unless in writing signed by authorized representatives of both parties.", 6, "15.5", "LOW", False),
            ("Pricing", "Annual Rate Adjustments", "Price increases upon renewal shall not exceed the lesser of 3.5% or the Consumer Price Index (CPI-U).", 2, "4.3", "MEDIUM", False),
            ("Penalties", "Late Payment Interest", "Overdue balances shall accrue interest at the lower of 1.0% per month or the maximum rate permitted by law.", 2, "4.2", "LOW", False),
            ("Service Credits", "Service Credit Issuance", "Service credits for downtime must be claimed within thirty (30) days following the affected calendar month.", 2, "8.2", "MEDIUM", False),
            ("Warranty", "Software Fitness and Performance", "Vendor warrants software conforms in all material respects with published documentation for ninety (90) days.", 3, "6.1", "LOW", True),
            ("Compliance", "Statutory Regulatory Compliance", "Each party shall comply with all applicable local, state, and federal laws and anti-corruption statutes.", 5, "14.1", "LOW", False),
        ]

        # Additional complementary clauses to reach ~42 clauses target
        additional_clauses = [
            ("Term", "Initial Term Definition", "The initial term of this Agreement shall commence on 15 January 2026 and continue until 15 January 2027.", 1, "2.1", "LOW", False),
            ("Notice", "Formal Legal Notice Addresses", "All notices shall be in writing sent by certified mail or confirmed email to designated corporate officers.", 5, "12.3", "LOW", False),
            ("SLA", "Scheduled Maintenance Windows", "Maintenance windows shall only occur between 02:00 and 04:00 UTC on Sundays with 48h advance notice.", 1, "1.2", "LOW", False),
            ("Deliverables", "API Documentation", "Vendor shall provide up-to-date OpenAPI specifications and integration guides.", 2, "3.1", "LOW", False),
            ("Security", "Data Encryption at Rest", "All stored data shall be encrypted using AES-256 and TLS 1.3 in transit.", 4, "9.1", "MEDIUM", False),
            ("Data Protection", "Data Deletion Upon Termination", "Vendor shall purge all Customer data within 30 days of contract termination and issue a deletion certificate.", 5, "14.4", "MEDIUM", False),
            ("Insurance", "Worker's Compensation", "Vendor shall maintain statutory worker's compensation insurance per state guidelines.", 4, "10.1", "LOW", False),
            ("Payment", "Currency and Tax Handling", "All fees are quoted and payable in US Dollars, exclusive of applicable state sales taxes.", 2, "4.4", "LOW", False),
            ("Audit Rights", "Quarterly SLA Review", "Customer and Vendor leads shall convene quarterly to review uptime metrics and service credits.", 3, "4.1", "LOW", False),
            ("Confidentiality", "Return of Confidential Materials", "Promptly upon request, either party shall return or certify destruction of all confidential files.", 3, "7.2", "LOW", False),
            ("Warranty", "Malware and Virus Protection", "Vendor warrants software does not contain malicious code, trojans, or unauthorized backdoors.", 3, "6.2", "MEDIUM", False),
            ("Compliance", "Export Control Regulations", "Neither party shall export or re-export software in violation of US export control laws.", 5, "14.2", "LOW", False),
            ("Change Control", "Emergency Patching", "Vendor may apply critical security hotfixes without advance notice to safeguard customer data.", 6, "15.6", "LOW", False),
            ("Pricing", "Volume Discount Tiers", "Enterprise volume discounts shall activate once active user licenses exceed 5,000 seats.", 2, "4.5", "LOW", False),
            ("Liability", "Exclusion of Consequential Damages", "In no event shall either party be liable for lost profits, lost revenues, or indirect damages.", 4, "11.2", "HIGH", False),
            ("Indemnification", "Indemnification Procedures", "Indemnified party shall promptly notify indemnifying party and grant sole control of defense.", 4, "11.5", "MEDIUM", False),
            ("Dispute Resolution", "Arbitration Venue", "Arbitration shall be administered in Wilmington, Delaware in accordance with AAA commercial rules.", 6, "15.7", "LOW", False),
            ("SLA", "Priority 1 Outage Handling", "P1 critical outages require response within 15 minutes and updates every hour.", 2, "2.2", "HIGH", False),
        ]

        clause_entities = []
        c_counter = 1
        for c_type, title, text, page, sec, risk, rev in (clause_specs + additional_clauses):
            c_id = f"clause_{c_counter:03d}"
            c_counter += 1
            cl = Clause(
                id=c_id,
                contract_id=contract.id,
                document_id=doc_v2.id if page > 1 else doc_v1.id,
                organization_id=org.id,
                clause_type=c_type,
                title=title,
                summary=text[:120] + "...",
                source_text=text,
                page_number=page,
                section_number=sec,
                paragraph_number=1,
                confidence="HIGH",
                confidence_score=0.96,
                risk_level=risk,
                review_required=rev
            )
            clause_entities.append(cl)
            db.add(cl)

        # Commit clauses so we have IDs
        db.commit()

        # Obligations (Target: 18 obligations matching Section 40)
        ob_specs = [
            ("Customer", "Procurement", "Provide non-renewal notice to prevent automatic contract extension (90 days prior)", "EXPLICIT", "ONE_TIME", "Contract expiration window", "90 days before expiration", datetime.datetime(2026, 10, 17, 18, 0, tzinfo=datetime.timezone.utc), "CRITICAL", "HIGH", "Either party may terminate this Agreement or prevent automatic renewal by providing at least ninety (90) days prior written notice before the expiration of the Initial Term.", 5, "12.2", "clause_002", True),
            ("Vendor", "Operations", "Submit monthly performance report and SLA availability metrics", "EXPLICIT", "MONTHLY", "End of calendar month", "5 business days after month end", datetime.datetime(2026, 10, 31, 17, 0, tzinfo=datetime.timezone.utc), "HIGH", "MEDIUM", "Vendor shall submit monthly performance reports and availability metrics within 5 business days after month end to Customer Operations.", 3, "8.4", "clause_005", False),
            ("Vendor", "Finance", "Maintain and deliver Certificate of Insurance ($2,000,000 coverage)", "EXPLICIT", "ANNUALLY", "Annual policy renewal / anniversary", "30 days before policy expiration", datetime.datetime(2026, 10, 22, 17, 0, tzinfo=datetime.timezone.utc), "HIGH", "MEDIUM", "Vendor shall maintain Commercial General Liability and Cyber Risk insurance with aggregate limits of not less than $2,000,000 throughout the Term.", 4, "10.3", "clause_006", False),
            ("Customer", "Finance", "Remit payment for monthly subscription software invoices (Net 45)", "EXPLICIT", "MONTHLY", "Receipt of monthly invoice", "Net 45 days after invoice receipt", datetime.datetime(2026, 11, 15, 17, 0, tzinfo=datetime.timezone.utc), "HIGH", "LOW", "Customer shall pay all undisputed invoices within forty-five (45) days of invoice receipt (Net 45).", 2, "4.1", "clause_001", False),
            ("Vendor", "Legal", "Notify Customer in writing within 72 hours of any security breach", "EXPLICIT", "AS_NEEDED", "Security incident detection", "Within 72 hours of security breach detection", datetime.datetime(2026, 12, 1, 12, 0, tzinfo=datetime.timezone.utc), "CRITICAL", "CRITICAL", "Vendor shall notify Customer in writing within seventy-two (72) hours of becoming aware of any confirmed personal data breach.", 2, "14.3", "clause_008", False),
            ("Vendor", "Operations", "Permit independent compliance audit of facilities and security controls", "DERIVED", "ANNUALLY", "Annual audit request window", "Quarterly audit within 30 days of quarter end", datetime.datetime(2026, 10, 30, 18, 0, tzinfo=datetime.timezone.utc), "MEDIUM", "LOW", "Customer or its designated independent auditor may conduct an annual audit of Vendor's security controls and compliance records.", 6, "15.2", "clause_007", False),
            ("Vendor", "Operations", "Maintain 99.9% monthly uptime availability across all platform nodes", "EXPLICIT", "MONTHLY", "Continuous runtime monitoring", "Continuous monthly SLA standard", datetime.datetime(2026, 10, 31, 23, 59, tzinfo=datetime.timezone.utc), "HIGH", "MEDIUM", "Vendor warrants that the cloud platform will maintain 99.9% monthly uptime, offering 10% service credits if uptime falls below 99.9%.", 3, "8.1", "clause_004", False),
            ("Vendor", "Legal", "Provide annual SOC 2 Type II compliance attestation report", "EXPLICIT", "ANNUALLY", "Annual audit cycle", "Annually on 15 December", datetime.datetime(2026, 12, 15, 17, 0, tzinfo=datetime.timezone.utc), "HIGH", "MEDIUM", "Vendor shall annually deliver an updated SOC 2 Type II attestation report covering security and confidentiality trust principles.", 4, "9.2", "clause_009", False),
            ("Customer", "Operations", "Submit formal service credit claims within 30 days of qualifying outage", "DERIVED", "AS_NEEDED", "Downtime event occurrence", "Within 30 calendar days following affected month", datetime.datetime(2026, 11, 30, 18, 0, tzinfo=datetime.timezone.utc), "MEDIUM", "LOW", "Service credits for downtime must be claimed within thirty (30) days following the affected calendar month.", 2, "8.2", "clause_022", False),
            ("Vendor", "Operations", "Perform scheduled platform maintenance solely during approved Sunday window", "EXPLICIT", "WEEKLY", "Sunday maintenance window", "Sundays 02:00-04:00 UTC with 48h notice", datetime.datetime(2026, 10, 25, 4, 0, tzinfo=datetime.timezone.utc), "MEDIUM", "LOW", "Maintenance windows shall only occur between 02:00 and 04:00 UTC on Sundays with 48h advance notice.", 1, "1.2", "clause_027", False),
            ("Vendor", "Operations", "Respond to Priority 1 critical outage alerts within 15 minutes", "EXPLICIT", "AS_NEEDED", "P1 incident alert", "Within 15 minutes of alert", datetime.datetime(2026, 11, 10, 9, 0, tzinfo=datetime.timezone.utc), "CRITICAL", "HIGH", "P1 critical outages require response within 15 minutes and updates every hour.", 2, "2.2", "clause_042", False),
            ("Vendor", "Legal", "Defend and indemnify Customer against intellectual property infringement", "EXPLICIT", "AS_NEEDED", "Third-party claim filed", "Within 30 days of receiving claim notice", datetime.datetime(2026, 12, 5, 17, 0, tzinfo=datetime.timezone.utc), "HIGH", "HIGH", "Vendor shall defend and indemnify Customer against third-party claims alleging that the software infringes any patent or copyright.", 4, "11.4", "clause_011", False),
            ("Customer", "Legal", "Provide written notice of any indemnification claim within 10 days", "DERIVED", "AS_NEEDED", "Receipt of infringement notice", "Prompt notice within 10 business days", datetime.datetime(2026, 12, 10, 17, 0, tzinfo=datetime.timezone.utc), "HIGH", "LOW", "Indemnified party shall promptly notify indemnifying party and grant sole control of defense.", 4, "11.5", "clause_040", False),
            ("Vendor", "Legal", "Purge all Customer confidential data and backups within 30 days of termination", "EXPLICIT", "ONE_TIME", "Contract termination or expiration", "30 days post-termination", datetime.datetime(2027, 2, 14, 18, 0, tzinfo=datetime.timezone.utc), "HIGH", "MEDIUM", "Vendor shall purge all Customer data within 30 days of contract termination and issue a deletion certificate.", 5, "14.4", "clause_030", False),
            ("Customer", "Procurement", "Convene quarterly joint operations steering committee review", "DERIVED", "QUARTERLY", "Quarterly milestone", "Within 30 days of quarter end", datetime.datetime(2026, 10, 30, 15, 0, tzinfo=datetime.timezone.utc), "LOW", "LOW", "Customer and Vendor leads shall convene quarterly to review uptime metrics and service credits.", 3, "4.1", "clause_033", False),
            ("Vendor", "Legal", "Encrypt Customer data in transit and at rest using AES-256 standard", "EXPLICIT", "CONTINUOUS", "Data ingress and storage", "Continuous compliance", datetime.datetime(2026, 10, 31, 0, 0, tzinfo=datetime.timezone.utc), "HIGH", "LOW", "All stored data shall be encrypted using AES-256 and TLS 1.3 in transit.", 4, "9.1", "clause_029", False),
            ("Vendor", "Legal", "Ensure all software code is free from viruses and unauthorized backdoors", "EXPLICIT", "CONTINUOUS", "Software release build", "Prior to production deployment", datetime.datetime(2026, 11, 1, 0, 0, tzinfo=datetime.timezone.utc), "HIGH", "MEDIUM", "Vendor warrants software does not contain malicious code, trojans, or unauthorized backdoors.", 3, "6.2", "clause_035", False),
            ("Customer", "Legal", "Interpret warranty disclaimer under Delaware commercial statute (Ambiguous terms)", "AMBIGUOUS", "AS_NEEDED", "Warranty conflict", "Requires legal counsel clarification", datetime.datetime(2026, 10, 28, 17, 0, tzinfo=datetime.timezone.utc), "MEDIUM", "MEDIUM", "Vendor warrants software conforms in all material respects with published documentation for ninety (90) days.", 3, "6.1", "clause_023", True),
        ]

        ob_entities = []
        for idx, (party, owner, act, ob_type, freq, trig, rule, dt, prio, risk, src, pg, sec, cl_id, rev) in enumerate(ob_specs):
            ob_id = f"ob_{idx + 1:03d}"
            ob = Obligation(
                id=ob_id,
                contract_id=contract.id,
                clause_id=cl_id,
                document_id=doc_v2.id,
                organization_id=org.id,
                party=party,
                internal_owner=owner,
                internal_owner_id=user.id if owner in ["Operations", "Procurement"] else None,
                action=act,
                obligation_type=ob_type,
                frequency=freq,
                trigger_event=trig,
                deadline_rule=rule,
                calculated_deadline=dt,
                status="UPCOMING",
                priority=prio,
                risk_level=risk,
                source_text=src,
                source_page=pg,
                source_section=sec,
                confidence="MEDIUM" if ob_type == "AMBIGUOUS" else "HIGH",
                confidence_score=0.78 if ob_type == "AMBIGUOUS" else 0.96,
                review_required=rev
            )
            ob_entities.append(ob)
            db.add(ob)

        # Commit obligations
        db.commit()

        # Deadlines (Target: 7 key deadlines matching Section 40)
        deadline_specs = [
            ("Renewal Notice Deadline", "90 days before expiration (15 Jan 2027)", datetime.datetime(2026, 10, 17, 18, 0, tzinfo=datetime.timezone.utc), "NOTICE_PERIOD", "CRITICAL", "ob_001", 5, "12.2"),
            ("Certificate of Insurance Submission", "30 days before annual policy expiration", datetime.datetime(2026, 10, 22, 17, 0, tzinfo=datetime.timezone.utc), "CALENDAR_DAYS", "HIGH", "ob_003", 4, "10.3"),
            ("Warranty Disclaimer Review", "Within 90 days of contract execution", datetime.datetime(2026, 10, 28, 17, 0, tzinfo=datetime.timezone.utc), "CALENDAR_DAYS", "MEDIUM", "ob_018", 3, "6.1"),
            ("Quarterly Audit Steering Committee", "Within 30 days of Q3 close", datetime.datetime(2026, 10, 30, 18, 0, tzinfo=datetime.timezone.utc), "FREQUENCY_RECURRENCE", "MEDIUM", "ob_006", 6, "15.2"),
            ("Monthly SLA Performance Report", "5 business days after month end", datetime.datetime(2026, 10, 31, 17, 0, tzinfo=datetime.timezone.utc), "BUSINESS_DAYS", "HIGH", "ob_002", 3, "8.4"),
            ("Net 45 Software Subscription Invoice", "Net 45 days after invoice issue date", datetime.datetime(2026, 11, 15, 17, 0, tzinfo=datetime.timezone.utc), "CALENDAR_DAYS", "HIGH", "ob_004", 2, "4.1"),
            ("Security Breach Notification Protocol", "Within 72 hours of confirmed detection", datetime.datetime(2026, 12, 1, 12, 0, tzinfo=datetime.timezone.utc), "HOURS_ELAPSED", "CRITICAL", "ob_005", 2, "14.3"),
        ]

        dl_entities = []
        for idx, (t, r, dt, m, p, ob_id, pg, sec) in enumerate(deadline_specs):
            dl = Deadline(
                id=f"dl_{idx + 1:03d}",
                contract_id=contract.id,
                obligation_id=ob_id,
                organization_id=org.id,
                title=t,
                deadline_rule=r,
                reference_date=contract.expiration_date if "expiration" in r else datetime.datetime.now(datetime.timezone.utc),
                calculated_date=dt,
                calculation_method=m,
                status="UPCOMING",
                priority=p,
                lead_time_days=30,
                source_page=pg,
                source_section=sec
            )
            dl_entities.append(dl)
            db.add(dl)

        # Version Changes (Target: 4 semantic version changes matching Section 40)
        vc1 = VersionChange(
            id="vc_001",
            contract_id=contract.id,
            organization_id=org.id,
            source_version="Version 1",
            target_version="Version 2",
            clause_title="Renewal Notice Period",
            clause_type="Renewal",
            previous_language="Either party may terminate this Agreement by providing at least thirty (30) days prior written notice before the expiration of the Initial Term.",
            current_language="Either party may terminate this Agreement or prevent automatic renewal by providing at least ninety (90) days prior written notice before the expiration of the Initial Term.",
            change_category="POTENTIALLY_MATERIAL",
            change_summary="Non-renewal notice window lengthened from 30 days to 90 days. Non-renewal deadline advances from 16 Dec 2026 to 17 Oct 2026.",
            affected_obligations="Procurement must deliver non-renewal notice by 17 Oct 2026 to prevent unintended $180,000 auto-renewal commitment.",
            review_status="REQUIRES_REVIEW",
            page_reference="ACME_MSA_v2.pdf — Page 5, Section 12.2"
        )
        vc2 = VersionChange(
            id="vc_002",
            contract_id=contract.id,
            organization_id=org.id,
            source_version="Version 1",
            target_version="Version 2",
            clause_title="Payment Terms and Invoicing",
            clause_type="Payment",
            previous_language="Customer shall pay all undisputed invoices within thirty (30) days of invoice receipt ('Net 30').",
            current_language="Customer shall pay all undisputed invoices within forty-five (45) days of invoice receipt ('Net 45').",
            change_category="FINANCIAL",
            change_summary="Payment window extended from Net 30 to Net 45. Provides 15 days additional working capital flexibility.",
            affected_obligations="Finance cash management schedule adjusted to 45-day cycle.",
            review_status="REVIEWED",
            page_reference="ACME_MSA_v2.pdf — Page 2, Section 4.1"
        )
        vc3 = VersionChange(
            id="vc_003",
            contract_id=contract.id,
            organization_id=org.id,
            source_version="Version 1",
            target_version="Version 2",
            clause_title="SLA Availability & Reporting",
            clause_type="SLA",
            previous_language="Vendor warrants that the core SaaS platform will maintain 99.5% monthly uptime, excluding scheduled maintenance.",
            current_language="Vendor warrants that the cloud platform will maintain 99.9% monthly uptime, offering 10% service credits if uptime falls below 99.9%.",
            change_category="OPERATIONAL",
            change_summary="Uptime requirement strengthened from 99.5% to 99.9% with concrete 10% credit penalty.",
            affected_obligations="Operations receives stronger SLA remedy rights and 5-day monthly reporting.",
            review_status="REVIEWED",
            page_reference="ACME_MSA_v2.pdf — Page 3, Section 8.1"
        )
        vc4 = VersionChange(
            id="vc_004",
            contract_id=contract.id,
            organization_id=org.id,
            source_version="Version 1",
            target_version="Version 2",
            clause_title="Insurance Policy Minimums",
            clause_type="Insurance",
            previous_language="Vendor shall maintain Commercial General Liability insurance with policy limits of not less than $1,000,000 per occurrence.",
            current_language="Vendor shall maintain Commercial General Liability and Cyber Risk insurance with aggregate limits of not less than $2,000,000 throughout the Term.",
            change_category="RISK_LIABILITY",
            change_summary="Insurance limits doubled from $1,000,000 to $2,000,000 with mandatory cyber liability rider.",
            affected_obligations="Vendor must provide Certificate of Insurance evidencing $2M policy limits.",
            review_status="REQUIRES_REVIEW",
            page_reference="ACME_MSA_v2.pdf — Page 4, Section 10.3"
        )
        db.add_all([vc1, vc2, vc3, vc4])

        # Reviews (Target: 2 human review flags matching Section 40)
        rev1 = Review(
            id="rev_001",
            contract_id=contract.id,
            organization_id=org.id,
            item_type="VERSION_CHANGE",
            item_id="vc_001",
            title="Conflicting Termination Notice Periods Detected",
            issue_category="CONFLICTING_VERSION",
            reason="Version 1 (Section 12.2) stipulates 30 calendar days notice, whereas Version 2 (Section 12.2) specifies 90 calendar days notice prior to expiration.",
            version_1_summary="30 days notice (Expires 15 Jan 2026)",
            version_2_summary="90 days notice (Expires 15 Jan 2027)",
            evidence_reference="ACME_MSA_v1.pdf (p.5) vs ACME_MSA_v2.pdf (p.5)",
            status="PENDING",
            assigned_to_name="Ankit (Legal & Compliance Reviewer)"
        )
        rev2 = Review(
            id="rev_002",
            contract_id=contract.id,
            organization_id=org.id,
            item_type="CLAUSE",
            item_id="clause_023",
            title="Ambiguous Warranty Disclaimer & Delaware Statutory Cross-Reference",
            issue_category="AMBIGUOUS_CLAUSE",
            reason="Section 6.1 contains contradictory language between ninety-day express performance warranty and broad 'as is' disclaimer of merchantability.",
            version_1_summary="Standard 90-day express warranty",
            version_2_summary="Broad statutory UCC waiver",
            evidence_reference="ACME_MSA_v2.pdf (p.3, Section 6.1)",
            status="PENDING",
            assigned_to_name="Ankit (Legal & Compliance Reviewer)"
        )
        db.add_all([rev1, rev2])

        # Evidence records with bounding box coordinates for Document Viewer
        ev1 = Evidence(
            id="ev_001",
            contract_id=contract.id,
            document_id=doc_v2.id,
            organization_id=org.id,
            entity_type="CLAUSE",
            entity_id="clause_002",
            page_number=5,
            section_number="12.2",
            verbatim_quote="Either party may terminate this Agreement or prevent automatic renewal by providing at least ninety (90) days prior written notice before the expiration of the Initial Term.",
            bounding_box={"x": 54, "y": 280, "width": 500, "height": 38},
            verified=True,
            verification_notes="Verbatim ground-truth source confirmed on Page 5 of ACME_MSA_v2.pdf."
        )
        ev2 = Evidence(
            id="ev_002",
            contract_id=contract.id,
            document_id=doc_v2.id,
            organization_id=org.id,
            entity_type="OBLIGATION",
            entity_id="ob_002",
            page_number=3,
            section_number="8.4",
            verbatim_quote="Vendor shall submit monthly performance reports and availability metrics within 5 business days after month end to Customer Operations.",
            bounding_box={"x": 54, "y": 340, "width": 500, "height": 34},
            verified=True,
            verification_notes="Verbatim ground-truth source confirmed on Page 3 of ACME_MSA_v2.pdf."
        )
        db.add_all([ev1, ev2])

        # Seed initial audit logs
        AuditLog_entries = [
            AuditLog(
                id="audit_init_01",
                organization_id=org.id,
                user_name="System",
                agent_name="Document Agent",
                action="Parsed Document Hierarchy",
                tool_called="parse_document()",
                input_summary="Processed ACME_MSA_v2.pdf (6 pages)",
                output_summary="Extracted 6 structural pages, 42 clauses, and coordinates",
                source_reference="ACME_MSA_v2.pdf",
                user_decision="Confirmed",
                confidence=1.0
            ),
            AuditLog(
                id="audit_init_02",
                organization_id=org.id,
                user_name="System",
                agent_name="Deadline Engine",
                action="Calculated Renewal Deadline",
                tool_called="calculate_deadline()",
                input_summary="Rule: 90 days before expiration; Reference: 15 Jan 2027",
                output_summary="Calculated date: 17 Oct 2026 (CALENDAR_DAYS notice period)",
                source_reference="Page 5, Section 12.2",
                user_decision="Confirmed",
                confidence=1.0
            ),
            AuditLog(
                id="audit_init_03",
                organization_id=org.id,
                user_name="System",
                agent_name="Version Agent",
                action="Detected Version Shift",
                tool_called="compare_versions()",
                input_summary="Compared ACME_MSA_v1.pdf vs ACME_MSA_v2.pdf",
                output_summary="Flagged 30d -> 90d notice shift as POTENTIALLY_MATERIAL",
                source_reference="Section 12.2",
                user_decision="Flagged for Review",
                confidence=0.98
            )
        ]
        db.add_all(AuditLog_entries)

        # Seed notification alerts
        notif1 = Notification(
            id="notif_001",
            organization_id=org.id,
            user_id=user.id,
            type="UPCOMING_DEADLINE",
            severity="CRITICAL",
            title="Renewal Notice Deadline Approaching",
            message="90-day non-renewal notice for ACME Software Agreement is due 17 Oct 2026.",
            target_url="/contracts/contract_acme_msa",
            due_date=datetime.datetime(2026, 10, 17, 18, 0, tzinfo=datetime.timezone.utc)
        )
        notif2 = Notification(
            id="notif_002",
            organization_id=org.id,
            user_id=user.id,
            type="REVIEW_REQUIRED",
            severity="HIGH",
            title="Version Conflict Requires Legal Review",
            message="Conflicting termination notice periods (30 days vs 90 days) detected between v1 and v2.",
            target_url="/reviews"
        )
        db.add_all([notif1, notif2])

        db.commit()
        print("[Seed] Successfully seeded ACME contract intelligence suite:")
        print("       - 42 Clauses across 25+ categories")
        print("       - 18 Actionable Obligations (Explicit, Derived, Ambiguous)")
        print("       - 7 Deterministic Deadlines")
        print("       - 4 Semantic Version Changes")
        print("       - 2 Human Review Items")
        print("       - Real PDF files in storage/documents/")
    except Exception as e:
        db.rollback()
        print(f"[Seed] Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database_and_documents()
