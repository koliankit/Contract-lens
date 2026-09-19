import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field

# Base Schemas
class OrganizationBase(BaseModel):
    id: str
    name: str
    domain: Optional[str] = None

class UserBase(BaseModel):
    id: str
    organization_id: str
    name: str
    email: str
    role: str

# Contract Parties
class ContractPartySchema(BaseModel):
    id: str
    name: str
    role: str
    contact_email: Optional[str] = None
    responsibilities_summary: Optional[str] = None

    class Config:
        from_attributes = True

# Evidence
class EvidenceSchema(BaseModel):
    id: str
    document_id: str
    page_number: int
    section_number: str
    verbatim_quote: str
    bounding_box: Optional[dict[str, Any]] = None
    verified: bool = True
    verification_notes: Optional[str] = "Source Verified"

    class Config:
        from_attributes = True

# Clauses
class ClauseSchema(BaseModel):
    id: str
    contract_id: str
    document_id: str
    clause_type: str
    title: str
    summary: str
    source_text: str
    page_number: int
    section_number: str
    paragraph_number: int = 1
    confidence: str = "HIGH"
    confidence_score: float = 0.95
    risk_level: str = "LOW"
    review_required: bool = False

    class Config:
        from_attributes = True

# Deadlines
class DeadlineSchema(BaseModel):
    id: str
    contract_id: str
    obligation_id: Optional[str] = None
    title: str
    deadline_rule: str
    reference_date: Optional[datetime.datetime] = None
    calculated_date: datetime.datetime
    calculation_method: str = "CALENDAR_DAYS"
    status: str = "UPCOMING"
    priority: str = "MEDIUM"
    lead_time_days: int = 30
    source_page: int = 1
    source_section: str = "1.0"

    class Config:
        from_attributes = True

# Obligations
class ObligationSchema(BaseModel):
    id: str
    contract_id: str
    clause_id: Optional[str] = None
    party: str
    internal_owner: str
    internal_owner_id: Optional[str] = None
    action: str
    obligation_type: str = "EXPLICIT"
    frequency: str = "ONE_TIME"
    trigger_event: Optional[str] = None
    deadline_rule: str
    calculated_deadline: Optional[datetime.datetime] = None
    dependency: Optional[str] = None
    status: str = "UPCOMING"
    priority: str = "MEDIUM"
    risk_level: str = "LOW"
    source_text: str
    source_page: int = 1
    source_section: str = "1.0"
    confidence: str = "HIGH"
    confidence_score: float = 0.95
    review_required: bool = False
    completed_at: Optional[datetime.datetime] = None
    completed_by: Optional[str] = None
    completion_note: Optional[str] = None

    class Config:
        from_attributes = True

class ObligationStatusUpdate(BaseModel):
    status: str
    completed_by: Optional[str] = None
    completion_note: Optional[str] = None
    internal_owner: Optional[str] = None

# Reviews
class ReviewSchema(BaseModel):
    id: str
    contract_id: str
    item_type: str
    item_id: str
    title: str
    issue_category: str
    reason: str
    version_1_summary: Optional[str] = None
    version_2_summary: Optional[str] = None
    evidence_reference: Optional[str] = None
    status: str = "PENDING"
    assigned_to_user_id: Optional[str] = None
    assigned_to_name: str = "Legal Reviewer"
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime.datetime] = None
    resolved_by: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ReviewActionRequest(BaseModel):
    action: str # Confirm, Correct, Reject, Escalate
    resolution_notes: Optional[str] = None
    assigned_to_name: Optional[str] = None
    corrected_value: Optional[str] = None

# Version Changes
class VersionChangeSchema(BaseModel):
    id: str
    contract_id: str
    source_version: str = "Version 1"
    target_version: str = "Version 2"
    clause_title: str
    clause_type: str
    previous_language: str
    current_language: str
    change_category: str = "OPERATIONAL"
    change_summary: str
    affected_obligations: Optional[str] = None
    review_status: str = "REQUIRES_REVIEW"
    page_reference: str = "Page 19, Section 12.2"
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Documents
class DocumentSchema(BaseModel):
    id: str
    contract_id: str
    filename: str
    file_path: str
    file_type: str = "PDF"
    file_size_bytes: int = 0
    version_tag: str = "v1"
    document_type: str = "ORIGINAL"
    page_count: int = 1
    processing_status: str = "COMPLETED"
    processing_error: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Contracts
class ContractDetailSchema(BaseModel):
    id: str
    organization_id: str
    title: str
    counterparty: str
    contract_type: str = "MSA"
    status: str = "ACTIVE"
    effective_date: Optional[datetime.datetime] = None
    expiration_date: Optional[datetime.datetime] = None
    renewal_type: str = "MANUAL"
    renewal_notice_days: int = 90
    renewal_deadline: Optional[datetime.datetime] = None
    internal_owner_id: Optional[str] = None
    internal_owner_name: str = "Operations"
    summary: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    parties: list[ContractPartySchema] = []
    documents: list[DocumentSchema] = []
    clauses: list[ClauseSchema] = []
    obligations: list[ObligationSchema] = []
    deadlines: list[DeadlineSchema] = []
    reviews: list[ReviewSchema] = []
    version_changes: list[VersionChangeSchema] = []

    class Config:
        from_attributes = True

class ContractListItemSchema(BaseModel):
    id: str
    title: str
    counterparty: str
    contract_type: str
    status: str
    effective_date: Optional[datetime.datetime] = None
    expiration_date: Optional[datetime.datetime] = None
    renewal_type: str
    renewal_deadline: Optional[datetime.datetime] = None
    internal_owner_name: str
    obligations_count: int = 0
    deadlines_count: int = 0
    open_reviews_count: int = 0

# Graph
class GraphNodeSchema(BaseModel):
    id: str
    label: str
    type: str # Contract, Party, Clause, Obligation, Deadline, Owner, Review, Document, Version
    group: str
    metadata: dict[str, Any] = {}

class GraphEdgeSchema(BaseModel):
    id: str
    source: str
    target: str
    relationship: str
    label: Optional[str] = None

class ContractGraphResponse(BaseModel):
    contract_id: str
    nodes: list[GraphNodeSchema]
    edges: list[GraphEdgeSchema]

# Dashboard Metrics
class DashboardMetricsSchema(BaseModel):
    active_contracts: int
    upcoming_deadlines: int
    review_required: int
    renewals_approaching: int
    obligations_due_30_days: int
    conflicting_versions: int
    ambiguous_clauses: int

# Query / Ask ContractLens
class QueryRequest(BaseModel):
    query: str
    contract_id: Optional[str] = None
    organization_id: Optional[str] = None

class QueryAnswerSource(BaseModel):
    document_name: str
    document_id: str
    page: int
    section: str
    exact_quote: str
    confidence: str = "HIGH"

class QueryResponse(BaseModel):
    answer: str
    related_obligations: list[ObligationSchema] = []
    sources: list[QueryAnswerSource] = []
    confidence: str = "HIGH"
    review_recommended: bool = False
    review_reason: Optional[str] = None
    agent_reasoning: str = ""

# Audit Log
class AuditLogSchema(BaseModel):
    id: str
    user_name: str
    agent_name: str
    action: str
    tool_called: Optional[str] = None
    input_summary: Optional[str] = None
    output_summary: Optional[str] = None
    source_reference: Optional[str] = None
    user_decision: Optional[str] = None
    confidence: float = 1.0
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

# Notifications
class NotificationSchema(BaseModel):
    id: str
    type: str
    severity: str
    title: str
    message: str
    target_url: Optional[str] = None
    is_read: bool = False
    due_date: Optional[datetime.datetime] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True
