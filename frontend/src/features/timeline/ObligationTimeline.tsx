import React, { useState } from 'react';
import { Deadline, Obligation } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { Calendar, Clock, Filter, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface ObligationTimelineProps {
  deadlines: Deadline[];
  obligations: Obligation[];
  onOpenEvidence?: (page: number, text: string) => void;
}

export const ObligationTimeline: React.FC<ObligationTimelineProps> = ({
  deadlines,
  obligations,
  onOpenEvidence,
}) => {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'quarter'>('month');
  const [filterMode, setFilterMode] = useState<'ALL' | 'CRITICAL' | 'UPCOMING' | 'OVERDUE' | 'COMPLETED'>('ALL');

  const filtered = deadlines.filter((dl) => {
    if (filterMode === 'ALL') return true;
    if (filterMode === 'CRITICAL') return dl.priority === 'CRITICAL';
    return dl.status === filterMode;
  });

  return (
    <div style={{ padding: '28px 36px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 className="editorial-title" style={{ fontSize: '30px', marginBottom: '4px' }}>
            Actionable Timeline
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Deterministic calendar of operational deadlines, renewal windows, and compliance triggers.
          </p>
        </div>

        {/* View Mode Switcher (Month, Week, Quarter) */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-surface)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          {(['month', 'week', 'quarter'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '6px 14px',
                borderRadius: '4px',
                backgroundColor: viewMode === mode ? 'var(--bg-elevated)' : 'transparent',
                color: viewMode === mode ? 'var(--accent-primary)' : 'var(--text-secondary)',
                border: viewMode === mode ? '1px solid var(--border-color)' : 'none',
                fontWeight: viewMode === mode ? 600 : 400,
                fontSize: '12px',
                textTransform: 'capitalize',
              }}
            >
              {mode} View
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs (Section 26) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '12px',
        }}
      >
        {(['ALL', 'CRITICAL', 'UPCOMING', 'OVERDUE', 'COMPLETED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterMode(f)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: filterMode === f ? 'var(--bg-elevated)' : 'transparent',
              color: filterMode === f ? 'var(--text-primary)' : 'var(--text-muted)',
              border: filterMode === f ? '1px solid var(--border-color)' : '1px solid transparent',
              fontSize: '12px',
              fontWeight: filterMode === f ? 600 : 400,
            }}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Timeline Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
        {filtered.map((dl, idx) => {
          const dt = new Date(dl.calculated_date);
          const day = dt.toLocaleDateString('en-US', { day: '2-digit' });
          const month = dt.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
          const year = dt.getFullYear();

          const matchingOb = obligations.find((o) => o.id === dl.obligation_id);

          return (
            <div
              key={dl.id}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                gap: '20px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              {/* Date Box */}
              <div
                style={{
                  minWidth: '85px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--accent-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>
                  {month} {year}
                </span>
                <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  {day}
                </span>
              </div>

              {/* Main Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {dl.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <StatusBadge status={dl.status} />
                      <StatusBadge status={dl.priority} type="priority" />
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <span>Contract: <strong style={{ color: 'var(--text-primary)' }}>ACME Software Agreement (MSA v2)</strong></span>
                    {matchingOb && (
                      <>
                        <span style={{ margin: '0 8px' }}>•</span>
                        <span>Party: <strong style={{ color: 'var(--text-primary)' }}>{matchingOb.party}</strong></span>
                        <span style={{ margin: '0 8px' }}>•</span>
                        <span>Internal Owner: <strong style={{ color: 'var(--accent-secondary)' }}>{matchingOb.internal_owner} Team</strong></span>
                      </>
                    )}
                  </div>
                </div>

                {/* Calculation Rationale Box */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '11px',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Deterministic Rule: </span>
                    <strong style={{ color: 'var(--accent-primary)' }}>{dl.deadline_rule}</strong>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>({dl.calculation_method})</span>
                  </div>

                  <span style={{ color: 'var(--text-secondary)' }}>
                    Source: Page {dl.source_page} (§{dl.source_section})
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
