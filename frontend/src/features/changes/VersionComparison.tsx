import React, { useState } from 'react';
import { VersionChange } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { GitCompare, Eye, AlertCircle, ArrowRight, ShieldCheck, FileText } from 'lucide-react';

interface VersionComparisonProps {
  changes: VersionChange[];
  onOpenEvidence?: (page: number, text: string) => void;
}

export const VersionComparison: React.FC<VersionComparisonProps> = ({
  changes,
  onOpenEvidence,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filtered = changes.filter((c) => {
    if (selectedCategory === 'ALL') return true;
    return c.change_category === selectedCategory;
  });

  return (
    <div style={{ padding: '28px 36px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="editorial-title" style={{ fontSize: '30px', marginBottom: '4px' }}>
          Semantic Version Comparison
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Side-by-side analysis of contractual obligations across Version 1 (2025) and Version 2 (2026), highlighting operational impact.
        </p>
      </div>

      {/* Version Header Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 60px 1fr',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 24px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-subtle)',
        }}
      >
        <div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            BASELINE VERSION
          </span>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            ACME_MSA_v1.pdf (Initial 2025 Term)
          </div>
        </div>

        <div style={{ textAlign: 'center', color: 'var(--accent-primary)' }}>
          <GitCompare size={22} style={{ margin: '0 auto' }} />
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '10px', color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            ACTIVE AGREEMENT
          </span>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            ACME_MSA_v2.pdf (Current 2026 Term)
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(['ALL', 'POTENTIALLY_MATERIAL', 'OPERATIONAL', 'FINANCIAL', 'RISK_LIABILITY'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: selectedCategory === cat ? 'var(--bg-elevated)' : 'var(--bg-surface)',
              color: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--text-secondary)',
              border: `1px solid ${selectedCategory === cat ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {cat.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Change Cards Grid (Section 27) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.map((change) => {
          return (
            <div
              key={change.id}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              {/* Change Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {change.clause_title}
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({change.clause_type})</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <StatusBadge status={change.change_category} />
                  <StatusBadge status={change.review_status} />
                </div>
              </div>

              {/* Side-by-side Language Comparison (Section 27) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 16px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    PREVIOUS LANGUAGE (VERSION 1)
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    "{change.previous_language}"
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--accent-faint)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 16px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '4px' }}>
                    CURRENT LANGUAGE (VERSION 2)
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    "{change.current_language}"
                  </p>
                </div>
              </div>

              {/* Operational Impact Analysis */}
              <div
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '14px',
                  fontSize: '12px',
                }}
              >
                <div style={{ color: 'var(--accent-secondary)', fontWeight: 600, marginBottom: '2px' }}>
                  Operational Impact & Obligation Consequences:
                </div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  {change.change_summary}
                </div>
                {change.affected_obligations && (
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    <strong>Department Requirement:</strong> {change.affected_obligations}
                  </div>
                )}
              </div>

              {/* Bottom Grounding Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Source: {change.page_reference}
                </span>

                {onOpenEvidence && (
                  <button
                    onClick={() => onOpenEvidence(5, change.current_language)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      backgroundColor: 'var(--accent-faint)',
                      border: '1px solid var(--accent-primary)',
                      color: 'var(--accent-secondary)',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    <Eye size={13} />
                    <span>View Evidence</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
