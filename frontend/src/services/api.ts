import {
  ContractListItem, ContractDetail, Obligation, Deadline, Review,
  VersionChange, DashboardMetrics, QueryResponse, ContractGraph,
  AuditLogItem, NotificationItem
} from '../types';

const BASE_URL = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Network request failed' }));
    throw new Error(err.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Dashboard Analytics
  getDashboardMetrics: () => fetchJson<DashboardMetrics>('/analytics/dashboard'),

  // Contracts
  getContracts: (params?: { search?: string; status?: string; contract_type?: string; owner?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<ContractListItem[]>(`/contracts${query ? `?${query}` : ''}`);
  },
  getContractDetail: (id: string) => fetchJson<ContractDetail>(`/contracts/${id}`),
  uploadContractDocument: async (contractId: string, formData: FormData) => {
    const res = await fetch(`${BASE_URL}/contracts/${contractId}/upload-document`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  // Obligations
  getObligations: (params?: { contract_id?: string; status?: string; party?: string; internal_owner?: string; priority?: string; obligation_type?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<Obligation[]>(`/obligations${query ? `?${query}` : ''}`);
  },
  updateObligation: (id: string, payload: { status: string; completed_by?: string; completion_note?: string; internal_owner?: string }) =>
    fetchJson<Obligation>(`/obligations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Deadlines & Timeline
  getDeadlines: (params?: { contract_id?: string; status?: string; priority?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<Deadline[]>(`/deadlines${query ? `?${query}` : ''}`);
  },

  // Reviews
  getReviews: (params?: { contract_id?: string; status?: string; issue_category?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<Review[]>(`/reviews${query ? `?${query}` : ''}`);
  },
  executeReviewAction: (id: string, payload: { action: string; resolution_notes?: string; assigned_to_name?: string }) =>
    fetchJson<Review>(`/reviews/${id}/action`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Changes
  getVersionChanges: (contractId?: string) => {
    const query = contractId ? `?contract_id=${contractId}` : '';
    return fetchJson<VersionChange[]>(`/changes${query}`);
  },

  // Graph
  getContractGraph: (contractId: string) => fetchJson<ContractGraph>(`/graph/${contractId}`),
  queryGraph: (contractId: string, question: string) =>
    fetchJson<any>(`/graph/${contractId}/query`, {
      method: 'POST',
      body: JSON.stringify({ query: question }),
    }),

  // Ask ContractLens
  askContractLens: (query: string, contractId?: string) =>
    fetchJson<QueryResponse>('/query', {
      method: 'POST',
      body: JSON.stringify({ query, contract_id: contractId }),
    }),

  // Documents
  getDocumentPages: (docId: string) => fetchJson<any>(`/documents/${docId}/pages`),

  // Audit Logs & Notifications
  getAuditLogs: () => fetchJson<AuditLogItem[]>('/audit-logs'),
  getNotifications: () => fetchJson<NotificationItem[]>('/notifications'),
  markNotificationRead: (id: string) => fetchJson<any>(`/notifications/${id}/read`, { method: 'POST' }),
};
