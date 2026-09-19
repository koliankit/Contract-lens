import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from backend.core.database import Base

def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    domain = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), index=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, index=True, nullable=False)
    role = Column(String, default="Contract Manager") # Contract Manager, Operations, Finance, Procurement, Legal, Executive
    created_at = Column(DateTime, default=utc_now)

class Contract(Base):
    __tablename__ = "contracts"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), index=True, nullable=False)
    title = Column(String, nullable=False)
    counterparty = Column(String, nullable=False)
    contract_type = Column(String, default="MSA") # MSA, SLA, NDA, DPA, Amendment, Addendum, SOW
    status = Column(String, default="ACTIVE") # ACTIVE, EXPIRED, DRAFT, TERMINATED, REVIEW_REQUIRED
    effective_date = Column(DateTime, nullable=True)
    expiration_date = Column(DateTime, nullable=True)
    renewal_type = Column(String, default="MANUAL") # AUTOMATIC, MANUAL, NONE, UNKNOWN
    renewal_notice_days = Column(Integer, default=90)
    renewal_deadline = Column(DateTime, nullable=True)
    internal_owner_id = Column(String, nullable=True)
    internal_owner_name = Column(String, default="Operations")
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    parties = relationship("ContractParty", back_populates="contract", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="contract", cascade="all, delete-orphan")
    clauses = relationship("Clause", back_populates="contract", cascade="all, delete-orphan")
    obligations = relationship("Obligation", back_populates="contract", cascade="all, delete-orphan")
    deadlines = relationship("Deadline", back_populates="contract", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="contract", cascade="all, delete-orphan")
    version_changes = relationship("VersionChange", back_populates="contract", cascade="all, delete-orphan")

class ContractParty(Base):
    __tablename__ = "contract_parties"

    id = Column(String, primary_key=True, index=True)
    contract_id = Column(String, ForeignKey("contracts.id"), index=True, nullable=False)
    organization_id = Column(String, index=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default="Vendor") # Customer, Vendor, Partner, Subcontractor
    contact_email = Column(String, nullable=True)
    responsibilities_summary = Column(Text, nullable=True)

    contract = relationship("Contract", back_populates="parties")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    contract_id = Column(String, ForeignKey("contracts.id"), index=True, nullable=False)
    organization_id = Column(String, index=True, nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, default="PDF") # PDF, DOCX, SCANNED_PDF
    file_size_bytes = Column(Integer, default=0)
    version_tag = Column(String, default="v1") # v1, v2, Amendment 1, Addendum
    document_type = Column(String, default="ORIGINAL") # ORIGINAL, VERSION_UPDATE, AMENDMENT, ADDENDUM
    page_count = Column(Integer, default=1)
    processing_status = Column(String, default="COMPLETED") # UPLOADED, VALIDATING, PARSING, STRUCTURING, INDEXING, ANALYZING, COMPLETED, FAILED, REVIEW_REQUIRED
    processing_error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    contract = relationship("Contract", back_populates="documents")
    clauses = relationship("Clause", back_populates="document", cascade="all, delete-orphan")

class Clause(Base):
    __tablename__ = "clauses"

    id = Column(String, primary_key=True, index=True)
    contract_id = Column(String, ForeignKey("contracts.id"), index=True, nullable=False)
    document_id = Column(String, ForeignKey("documents.id"), index=True, nullable=False)
    organization_id = Column(String, index=True, nullable=False)
    clause_type = Column(String, nullable=False) # Payment, Renewal, Termination, SLA, etc.
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    source_text = Column(Text, nullable=False)
    page_number = Column(Integer, default=1)
    section_number = Column(String, default="1.0")
    paragraph_number = Column(Integer, default=1)
    confidence = Column(String, default="HIGH") # HIGH, MEDIUM, LOW
    confidence_score = Column(Float, default=0.95)
    risk_level = Column(String, default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    review_required = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    contract = relationship("Contract", back_populates="clauses")
    document = relationship("Document", back_populates="clauses")
    obligations = relationship("Obligation", back_populates="clause")

class Obligation(Base):
    __tablename__ = "obligations"

    id = Column(String, primary_key=True, index=True)
    contract_id = Column(String, ForeignKey("contracts.id"), index=True, nullable=False)
    clause_id = Column(String, ForeignKey("clauses.id"), index=True, nullable=True)
    document_id = Column(String, ForeignKey("documents.id"), index=True, nullable=True)
    organization_id = Column(String, index=True, nullable=False)
    party = Column(String, nullable=False) # Responsible legal party: Vendor / Customer
    internal_owner = Column(String, default="Operations") # Operations, Procurement, Finance, Legal, Contract Manager
    internal_owner_id = Column(String, nullable=True)
    action = Column(Text, nullable=False)
    obligation_type = Column(String, default="EXPLICIT") # EXPLICIT, DERIVED, AMBIGUOUS
    frequency = Column(String, default="ONE_TIME") # ONE_TIME, MONTHLY, QUARTERLY, ANNUALLY, AS_NEEDED
    trigger_event = Column(String, nullable=True)
    deadline_rule = Column(String, nullable=False)
    calculated_deadline = Column(DateTime, nullable=True)
    dependency = Column(String, nullable=True)
    status = Column(String, default="UPCOMING") # UPCOMING, IN_PROGRESS, COMPLETED, OVERDUE, BLOCKED, CANCELLED
    priority = Column(String, default="MEDIUM") # CRITICAL, HIGH, MEDIUM, LOW
    risk_level = Column(String, default="LOW") # CRITICAL, HIGH, MEDIUM, LOW
    source_text = Column(Text, nullable=False)
    source_page = Column(Integer, default=1)
    source_section = Column(String, default="1.0")
    confidence = Column(String, default="HIGH") # HIGH, MEDIUM, LOW
    confidence_score = Column(Float, default=0.95)
    review_required = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    completed_by = Column(String, nullable=True)
    completion_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    contract = relationship("Contract", back_populates="obligations")
    clause = relationship("Clause", back_populates="obligations")
    deadlines = relationship("Deadline", back_populates="obligation")

class Deadline(Base):
    __tablename__ = "deadlines"

    id = Column(String, primary_key=True, index=True)
    contract_id = Column(String, ForeignKey("contracts.id"), index=True, nullable=False)
    obligation_id = Column(String, ForeignKey("obligations.id"), index=True, nullable=True)
    organization_id = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    deadline_rule = Column(String, nullable=False)
    reference_date = Column(DateTime, nullable=True)
    calculated_date = Column(DateTime, nullable=False)
    calculation_method = Column(String, default="CALENDAR_DAYS") # FIXED_DATE, CALENDAR_DAYS, BUSINESS_DAYS, NOTICE_PERIOD, FREQUENCY_RECURRENCE
    status = Column(String, default="UPCOMING") # UPCOMING, DUE_SOON, DUE_TODAY, OVERDUE, COMPLETED, CANCELLED, REVIEW_REQUIRED
    priority = Column(String, default="MEDIUM") # CRITICAL, HIGH, MEDIUM, LOW
    lead_time_days = Column(Integer, default=30)
    source_page = Column(Integer, default=1)
    source_section = Column(String, default="1.0")
    created_at = Column(DateTime, default=utc_now)

    contract = relationship("Contract", back_populates="deadlines")
    obligation = relationship("Obligation", back_populates="deadlines")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, index=True)
    contract_id = Column(String, ForeignKey("contracts.id"), index=True, nullable=False)
    organization_id = Column(String, index=True, nullable=False)
    item_type = Column(String, nullable=False) # CLAUSE, OBLIGATION, DEADLINE, VERSION_CHANGE
    item_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    issue_category = Column(String, nullable=False) # AMBIGUOUS_CLAUSE, CONFLICTING_DATE, CONFLICTING_VERSION, LOW_CONFIDENCE, POTENTIALLY_MATERIAL_CHANGE, UNCLEAR_RESPONSIBILITY, MISSING_EVIDENCE, FAILED_CALCULATION
    reason = Column(Text, nullable=False)
    version_1_summary = Column(Text, nullable=True)
    version_2_summary = Column(Text, nullable=True)
    evidence_reference = Column(String, nullable=True)
    status = Column(String, default="PENDING") # PENDING, CONFIRMED, CORRECTED, REJECTED, ESCALATED
    assigned_to_user_id = Column(String, nullable=True)
    assigned_to_name = Column(String, default="Legal Reviewer")
    resolution_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    contract = relationship("Contract", back_populates="reviews")

class VersionChange(Base):
    __tablename__ = "version_changes"

    id = Column(String, primary_key=True, index=True)
    contract_id = Column(String, ForeignKey("contracts.id"), index=True, nullable=False)
    organization_id = Column(String, index=True, nullable=False)
    source_version = Column(String, default="Version 1")
    target_version = Column(String, default="Version 2")
    clause_title = Column(String, nullable=False)
    clause_type = Column(String, nullable=False)
    previous_language = Column(Text, nullable=False)
    current_language = Column(Text, nullable=False)
    change_category = Column(String, default="OPERATIONAL") # OPERATIONAL, FINANCIAL, RISK_LIABILITY, TERMINATION_RENEWAL, POTENTIALLY_MATERIAL
    change_summary = Column(Text, nullable=False)
    affected_obligations = Column(Text, nullable=True)
    review_status = Column(String, default="REQUIRES_REVIEW") # REQUIRES_REVIEW, REVIEWED, ACCEPTED
    page_reference = Column(String, default="Page 19, Section 12.2")
    created_at = Column(DateTime, default=utc_now)

    contract = relationship("Contract", back_populates="version_changes")

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String, primary_key=True, index=True)
    contract_id = Column(String, ForeignKey("contracts.id"), index=True, nullable=False)
    document_id = Column(String, ForeignKey("documents.id"), index=True, nullable=False)
    organization_id = Column(String, index=True, nullable=False)
    entity_type = Column(String, nullable=False) # CLAUSE, OBLIGATION, DEADLINE, VERSION_CHANGE
    entity_id = Column(String, nullable=False)
    page_number = Column(Integer, default=1)
    section_number = Column(String, default="1.0")
    verbatim_quote = Column(Text, nullable=False)
    bounding_box = Column(JSON, nullable=True) # {"x": 72, "y": 240, "width": 450, "height": 40}
    verified = Column(Boolean, default=True)
    verification_notes = Column(Text, default="Source Verified")
    created_at = Column(DateTime, default=utc_now)

class ContractRelationship(Base):
    __tablename__ = "contract_relationships"

    id = Column(String, primary_key=True, index=True)
    contract_id = Column(String, ForeignKey("contracts.id"), index=True, nullable=False)
    organization_id = Column(String, index=True, nullable=False)
    source_type = Column(String, nullable=False) # CONTRACT, PARTY, CLAUSE, OBLIGATION, DEADLINE, VERSION, REVIEW
    source_id = Column(String, nullable=False)
    source_label = Column(String, nullable=False)
    target_type = Column(String, nullable=False)
    target_id = Column(String, nullable=False)
    target_label = Column(String, nullable=False)
    relationship_type = Column(String, nullable=False) # HAS_PARTY, HAS_DOCUMENT, CONTAINS_CLAUSE, CREATES_OBLIGATION, CREATES_DEADLINE, ASSIGNED_TO, DEPENDS_ON, CHANGES_CLAUSE, EVALUATES
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utc_now)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, index=True, nullable=False)
    user_id = Column(String, nullable=True)
    type = Column(String, default="UPCOMING_DEADLINE") # UPCOMING_DEADLINE, OVERDUE_OBLIGATION, RENEWAL_APPROACHING, REVIEW_REQUIRED, VERSION_CHANGE
    severity = Column(String, default="MEDIUM") # CRITICAL, HIGH, MEDIUM, LOW
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    target_url = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    organization_id = Column(String, index=True, nullable=False)
    user_id = Column(String, nullable=True)
    user_name = Column(String, default="System")
    agent_name = Column(String, default="Orchestrator") # Document Agent, Clause Agent, Obligation Agent, Version Agent, Query Agent, Human
    action = Column(String, nullable=False)
    tool_called = Column(String, nullable=True)
    input_summary = Column(Text, nullable=True)
    output_summary = Column(Text, nullable=True)
    source_reference = Column(String, nullable=True)
    user_decision = Column(String, nullable=True) # Confirmed, Rejected, Corrected, N/A
    confidence = Column(Float, default=1.0)
    timestamp = Column(DateTime, default=utc_now)
