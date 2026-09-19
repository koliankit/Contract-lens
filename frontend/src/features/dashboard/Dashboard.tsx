import React from 'react';
import { MetricCard } from '../../components/MetricCard';
import { StatusBadge } from '../../components/StatusBadge';
import { AgentActivityPanel } from '../../components/AgentActivityPanel';
import { DashboardMetrics, Obligation, AuditLogItem } from '../../types';
import { Calendar, AlertCircle, ArrowRight, CheckCircle, ShieldAlert } from 'lucide-react';

interface DashboardProps {
  metrics: DashboardMetrics | null;
  obligations: Obligation[];
  auditLogs: AuditLogItem[];
  onNavigate: (tab: any, contractId?: string) => void;
  onOpenObligationEvidence?: (ob: Obligation) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  metrics,
  obligations,
  auditLogs,
  onNavigate,
  onOpenObligationEvidence,
}) => {
  // Sort upcoming obligations by calculated deadline
  const upcomingObs = obligations
    .filter((o) => o.status !== 'COMPLETED')
    .slice(0, 6);

  return (
    <div style={{ padding: '28px 36px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Editorial Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 className="editorial-title" style={{ fontSize: '32px', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Contract Intelligence
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Turn contractual language into traceable business actions.
        </p>
      </div>

      {/* 4 Core Dynamic Metrics (Section 22) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <MetricCard
          label="Active Contracts"
          value={metrics ? metrics.active_contracts : 24}
          subtext="Total managed agreements"
          onClick={() => onNavigate('contracts')}
        />
        <MetricCard
          label="Upcoming Deadlines"
          value={metrics ? metrics.upcoming_deadlines : 8}
          subtext="Due within 30 days"
          badge="Action Required"
          accent
          onClick={() => onNavigate('timeline')}
        />
        <MetricCard
          label="Review Required"
          value={metrics ? metrics.review_required : 5}
          subtext="Ambiguous clauses & conflicts"
          badge="Human Triage"
          onClick={() => onNavigate('reviews')}
        />
        <MetricCard
          label="Renewals"
          value={metrics ? metrics.renewals_approaching : 3}
          subtext="Approaching notice window"
          onClick={() => onNavigate('contracts')}
        />
      </div>

      {/* Main Grid: Upcoming Obligations & Needs Review */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Left Column: Upcoming Obligations */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            boxShadow: 'var(--shadow-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Upcoming Obligations</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Extracted operational requirements requiring department action
              </p>
            </div>
            <button
              onClick={() => onNavigate('obligations')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: 'var(--accent-secondary)',
                fontWeight: 600,
                fontSize: '12px',
              }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {upcomingObs.map((ob) => {
              const dt = ob.calculated_deadline ? new Date(ob.calculated_deadline) : null;
              const dateStr = dt
                ? dt.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase()
                : '17 OCT';

              return (
                <div
                  key={ob.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* Date Pill */}
                    <div
                      style={{
                        minWidth: '60px',
                        textAlign: 'center',
                        padding: '6px 4px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: 'var(--accent-primary)',
                        }}
                      >
                        {dateStr}
                      </span>
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                        {ob.action}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        <span>ACME Software MSA</span>
                        <span>•</span>
                        <span>Party: <strong style={{ color: 'var(--text-primary)' }}>{ob.party}</strong></span>
                        <span>•</span>
                        <span>Owner: <strong style={{ color: 'var(--accent-secondary)' }}>{ob.internal_owner}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <StatusBadge status={ob.priority} type="priority" />
                    {onOpenObligationEvidence && (
                      <button
                        onClick={() => onOpenObligationEvidence(ob)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--accent-secondary)',
                          fontSize: '11px',
                          fontWeight: 500,
                        }}
                      >
                        Evidence
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Needs Review Center */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--status-warning)',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <AlertCircle size={18} color="var(--status-warning)" />
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--status-warning)' }}>
                Needs Human Review
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
              The AI Orchestrator flagged contractual ambiguities and version discrepancies requiring verified human decision.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Conflicting contract version</span>
                <strong style={{ color: 'var(--status-warning)' }}>01 item</strong>
              </div>
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Ambiguous obligations</span>
                <strong style={{ color: 'var(--accent-secondary)' }}>02 items</strong>
              </div>
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Renewal windows approaching</span>
                <strong style={{ color: 'var(--text-primary)' }}>02 items</strong>
              </div>
            </div>

            <button
              onClick={() => onNavigate('reviews')}
              style={{
                width: '100%',
                padding: '9px',
                backgroundColor: 'var(--accent-primary)',
                color: '#111',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              Open Review Queue
            </button>
          </div>

          {/* Quick Demo Script Link */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
              End-to-End Demo Ready
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '12px' }}>
              Inspect ACME MSA v1 vs v2, verify exact source evidence on Page 5 (§12.2), and test deterministic 90-day renewal calculations.
            </p>
            <button
              onClick={() => onNavigate('contracts', 'contract_acme_msa')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '12px',
              }}
            >
              <span>Open ACME MSA (v2)</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Agent Activity Execution Stream (Section 29) */}
      <AgentActivityPanel logs={auditLogs} />
    </div>
  );
};
