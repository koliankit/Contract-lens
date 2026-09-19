export interface ContractListItem {
  id: string;
  title: string;
  counterparty: string;
  contract_type: string;
  status: string;
  effective_date: string | null;
  expiration_date: string | null;
  renewal_type: string;
  renewal_deadline: string | null;
  internal_owner_name: string;
  obligations_count: number;
  deadlines_count: number;
  open_reviews_count: number;
}

export interface ContractParty {
  id: string;
  name: string;
  role: string;
  contact_email?: string;
  responsibilities_summary?: string;
}

export interface Clause {
  id: string;
  contract_id: string;
  document_id: string;
  clause_type: string;
  title: string;
  summary: string;
  source_text: string;
  page_number: number;
  section_number: string;
  confidence: string;
  confidence_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  review_required: boolean;
}

export interface Obligation {
  id: string;
  contract_id: string;
  clause_id?: string;
  party: string;
  internal_owner: string;
  internal_owner_id?: string;
  action: string;
  obligation_type: 'EXPLICIT' | 'DERIVED' | 'AMBIGUOUS';
  frequency: string;
  trigger_event?: string;
  deadline_rule: string;
  calculated_deadline?: string;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'BLOCKED' | 'CANCELLED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  source_text: string;
  source_page: number;
  source_section: string;
  confidence: string;
  confidence_score: number;
  review_required: boolean;
  completed_at?: string;
  completed_by?: string;
  completion_note?: string;
}

export interface Deadline {
  id: string;
  contract_id: string;
  obligation_id?: string;
  title: string;
  deadline_rule: string;
  reference_date?: string;
  calculated_date: string;
  calculation_method: string;
  status: 'UPCOMING' | 'DUE_SOON' | 'DUE_TODAY' | 'OVERDUE' | 'COMPLETED' | 'CANCELLED' | 'REVIEW_REQUIRED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  lead_time_days: number;
  source_page: number;
  source_section: string;
}

export interface Review {
  id: string;
  contract_id: string;
  item_type: string;
  item_id: string;
  title: string;
  issue_category: string;
  reason: string;
  version_1_summary?: string;
  version_2_summary?: string;
  evidence_reference?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CORRECTED' | 'REJECTED' | 'ESCALATED';
  assigned_to_name: string;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
}

export interface VersionChange {
  id: string;
  contract_id: string;
  source_version: string;
  target_version: string;
  clause_title: string;
  clause_type: string;
  previous_language: string;
  current_language: string;
  change_category: string;
  change_summary: string;
  affected_obligations?: string;
  review_status: string;
  page_reference: string;
  created_at: string;
}

export interface ContractDocument {
  id: string;
  contract_id: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size_bytes: number;
  version_tag: string;
  document_type: string;
  page_count: number;
  processing_status: string;
  created_at: string;
}

export interface ContractDetail {
  id: string;
  organization_id: string;
  title: string;
  counterparty: string;
  contract_type: string;
  status: string;
  effective_date?: string;
  expiration_date?: string;
  renewal_type: string;
  renewal_notice_days: number;
  renewal_deadline?: string;
  internal_owner_name: string;
  summary?: string;
  parties: ContractParty[];
  documents: ContractDocument[];
  clauses: Clause[];
  obligations: Obligation[];
  deadlines: Deadline[];
  reviews: Review[];
  version_changes: VersionChange[];
}

export interface DashboardMetrics {
  active_contracts: number;
  upcoming_deadlines: number;
  review_required: number;
  renewals_approaching: number;
  obligations_due_30_days: number;
  conflicting_versions: number;
  ambiguous_clauses: number;
}

export interface QuerySource {
  document_name: string;
  document_id: string;
  page: number;
  section: string;
  exact_quote: string;
  confidence: string;
}

export interface QueryResponse {
  answer: string;
  related_obligations: Obligation[];
  sources: QuerySource[];
  confidence: string;
  review_recommended: boolean;
  review_reason?: string;
  agent_reasoning: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  group: string;
  metadata: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  label?: string;
}

export interface ContractGraph {
  contract_id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface AuditLogItem {
  id: string;
  user_name: string;
  agent_name: string;
  action: string;
  tool_called?: string;
  input_summary?: string;
  output_summary?: string;
  source_reference?: string;
  user_decision?: string;
  confidence: number;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  target_url?: string;
  is_read: boolean;
  due_date?: string;
  created_at: string;
}
