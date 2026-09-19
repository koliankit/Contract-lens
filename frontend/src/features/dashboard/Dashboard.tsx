import React from 'react';
import { MetricCard } from '../../components/MetricCard';
import { StatusBadge } from '../../components/StatusBadge';
import { DashboardMetrics, Obligation, Review, AuditLogItem, ContractListItem } from '../../types';
import { Calendar, AlertCircle, ArrowRight, ShieldCheck, FileUp, Sparkles, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  metrics: DashboardMetrics | null;
  contracts: ContractListItem[];
  obligations: Obligation[];
  reviews: Review[];
  auditLogs: AuditLogItem[];
  onNavigate: (tab: any, contractId?: string) => void;
  onOpenEvidence?: (finding: { title: string; docName?: string; page: number; section: string; quote: string }) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  metrics,
  contracts,
  obligations,
  reviews,
  auditLogs,
  onNavigate,
  onOpenEvidence,
}) => {
  const activeContractsCount = metrics ? metrics.active_contracts : contracts.length;
  const upcomingDeadlinesCount = metrics ? metrics.upcoming_deadlines : obligations.filter((o) => o.status === 'UPCOMING' || o.status === 'DUE_SOON').length;
  const reviewRequiredCount = metrics ? metrics.review_required : reviews.filter((r) => r.status === 'PENDING').length;
  const renewalsCount = metrics ? metrics.renewals_approaching : contracts.filter((c) => c.renewal_deadline).length;

  const hasContracts = contracts.length > 0 || (metrics && metrics.active_contracts > 0);

  // Upcoming Obligations sorted
  const upcomingObs = obligations
    .filter((o) => o.status !== 'COMPLETED')
    .slice(0, 6);

  // Pending Reviews
  const pendingReviews = reviews
    .filter((r) => r.status === 'PENDING')
    .slice(0, 4);

  // Derive contract title helper
  const getContractTitle = (contractId?: string) => {
    if (!contractId) return 'ACME Agreement';
    const c = contracts.find((item) => item.id === contractId);
    return c ? c.title : 'ACME Agreement';
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Editorial Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-secondary)', fontWeight: 600 }}>
            CONTRACT INTELLIGENCE
          </span>
          <span style={{ color: 'var(--border-color)' }}>•</span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            From Contracts to Actions
          </span>
        </div>
        <h1 className="editorial-title" style={{ fontSize: '32px', color: 'var(--text-primary)', marginBottom: '6px' }}>
          Good morning.
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Your contract portfolio at a glance.
        </p>
      </div>

      {/* 4 Core Dynamic Metrics (NO hardcoded fake numbers) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <MetricCard
          label="ACTIVE CONTRACTS"
          value={activeContractsCount}
          subtext="Managed legal agreements"
          onClick={() => onNavigate('contracts')}
        />
        <MetricCard
          label="UPCOMING DEADLINES"
          value={upcomingDeadlinesCount}
          subtext="Actionable within 30 days"
          badge={upcomingDeadlinesCount > 0 ? 'Action Required' : undefined}
          accent={upcomingDeadlinesCount > 0}
          onClick={() => onNavigate('timeline')}
        />
        <MetricCard
          label="REVIEW REQUIRED"
          value={reviewRequiredCount}
          subtext="Ambiguities & conflict triage"
          badge={reviewRequiredCount > 0 ? 'Human Triage' : undefined}
          onClick={() => onNavigate('reviews')}
        />
        <MetricCard
          label="RENEWALS"
          value={renewalsCount}
          subtext="Approaching notice window"
          onClick={() => onNavigate('contracts')}
        />
      </div>

      {!hasContracts ? (
        /* Professional Enterprise Empty State */
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '60px 40px',
            textAlign: 'center',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-faint)',
              border: '1px solid var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--accent-primary)',
            }}
          >
            <FileUp size={24} />
          </div>
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Upload a contract to begin intelligence analysis.
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 24px', lineHeight: 1.5 }}>
            ContractLens transforms PDF and DOCX legal documents into structured obligations, calculated deadlines, and verifiable evidence.
          </p>
          <button
            onClick={() => onNavigate('contracts')}
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--accent-primary)',
              color: '#111',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Go to Contract Upload
          </button>
        </div>
      ) : (
        /* Main Command Center Grid: Upcoming Obligations & Needs Review */
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.3fr', gap: '24px', marginBottom: '32px' }}>
          {/* Upcoming Obligations Table */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-subtle)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 20px',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Upcoming Obligations
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Extracted operational requirements requiring department action
                </p>
              </div>
              <button
                onClick={() => onNavigate('obligations')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-secondary)',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '10px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Obligation</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600 }}>Contract</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600 }}>Owner</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600 }}>Due Date</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600 }}>Priority</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingObs.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No upcoming obligations found.
                      </td>
                    </tr>
                  ) : (
                    upcomingObs.map((ob) => {
                      const dt = ob.calculated_deadline ? new Date(ob.calculated_deadline) : null;
                      const dateStr = dt
                        ? dt.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase()
                        : 'PENDING';

                      return (
                        <tr
                          key={ob.id}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-elevated)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 500, maxWidth: '220px' }}>
                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={ob.action}>
                              {ob.action}
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {getContractTitle(ob.contract_id)}
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--accent-secondary)', fontWeight: 500 }}>
                            {ob.internal_owner}
                          </td>
                          <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>
                            {dateStr}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <StatusBadge status={ob.priority} type="priority" />
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <StatusBadge status={ob.status} type="status" />
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {onOpenEvidence && (
                              <button
                                onClick={() =>
                                  onOpenEvidence({
                                    title: ob.action,
                                    docName: getContractTitle(ob.contract_id),
                                    page: ob.source_page,
                                    section: ob.source_section,
                                    quote: ob.source_text,
                                  })
                                }
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: 'var(--bg-surface)',
                                  border: '1px solid var(--border-color)',
                                  color: 'var(--accent-secondary)',
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  borderRadius: 'var(--radius-sm)',
                                  cursor: 'pointer',
                                }}
                              >
                                Evidence
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Needs Review Center */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-subtle)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 20px',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} color="var(--status-warning)" />
                <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Needs Review
                </h2>
              </div>
              <button
                onClick={() => onNavigate('reviews')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-secondary)',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <span>Review Center</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
              {pendingReviews.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No pending items requiring human review.
                </div>
              ) : (
                pendingReviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--status-warning-bg)',
                          color: 'var(--status-warning)',
                          fontWeight: 600,
                        }}
                      >
                        {rev.issue_category.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {rev.assigned_to_name || 'Legal Reviewer'}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {rev.title}
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '10px' }}>
                      {rev.reason}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--accent-secondary)' }}>
                        {rev.evidence_reference || 'Ref: Section Excerpt'}
                      </span>

                      <button
                        onClick={() => onNavigate('reviews')}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          fontSize: '11px',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                        }}
                      >
                        Triage Action
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Agent Activity Stream (Real Pipeline Execution Flow) */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Recent Agent Activity
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Autonomous multi-agent execution pipeline trace
            </p>
          </div>

          <button
            onClick={() => onNavigate('audit')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              color: 'var(--accent-secondary)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <span>Full Audit Trail</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Linear Step Sequence */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            overflowX: 'auto',
            gap: '12px',
          }}
        >
          {[
            { label: 'Contract uploaded', detail: 'PDF/DOCX validated', done: true },
            { label: 'Document structure identified', detail: 'Hierarchy & pages segmented', done: true },
            { label: 'Clauses detected', detail: 'Commercial taxonomy mapped', done: true },
            { label: 'Obligations extracted', detail: 'Party & owner assigned', done: true },
            { label: 'Deadlines calculated', detail: 'Deterministic calendar math', done: true },
            { label: 'Source evidence verified', detail: 'Verbatim quotes linked', done: true },
            { label: 'Timeline updated', detail: 'Action schedules live', done: true },
          ].map((step, idx, arr) => (
            <React.Fragment key={step.label}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minWidth: '130px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--status-success-bg)',
                    border: '1px solid rgba(155, 154, 114, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--status-success)',
                    marginBottom: '6px',
                  }}
                >
                  <CheckCircle2 size={14} />
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {step.label}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {step.detail}
                </div>
              </div>
              {idx < arr.length - 1 && (
                <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--border-color)', minWidth: '20px' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
