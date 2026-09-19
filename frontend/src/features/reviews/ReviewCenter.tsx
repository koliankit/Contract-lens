import React, { useState } from 'react';
import { Review } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { api } from '../../services/api';
import {
  AlertCircle, CheckCircle, XCircle, ArrowUpRight, MessageSquare,
  ShieldAlert, Eye, UserCheck, Check
} from 'lucide-react';

interface ReviewCenterProps {
  reviews: Review[];
  onRefresh: () => void;
  onOpenEvidence?: (page: number, text: string) => void;
}

export const ReviewCenter: React.FC<ReviewCenterProps> = ({
  reviews,
  onRefresh,
  onOpenEvidence,
}) => {
  const [selectedReview, setSelectedReview] = useState<Review | null>(
    reviews.length > 0 ? reviews[0] : null
  );
  const [actionNote, setActionNote] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'REJECTED'>('ALL');

  const filtered = reviews.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  const handleAction = async (action: 'CONFIRM' | 'CORRECT' | 'REJECT' | 'ESCALATE') => {
    if (!selectedReview) return;
    try {
      await api.executeReviewAction(selectedReview.id, {
        action,
        resolution_notes: actionNote || `Action ${action} executed by legal counsel.`,
      });
      setActionNote('');
      onRefresh();
    } catch (err) {
      console.error('Review action failed:', err);
    }
  };

  return (
    <div style={{ padding: '28px 36px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="editorial-title" style={{ fontSize: '30px', marginBottom: '4px' }}>
          Human Review Center
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          No important legal decision without human review. Triage conflicting versions, ambiguous clauses, and material shifts.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(['ALL', 'PENDING', 'CONFIRMED', 'REJECTED'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: filterStatus === s ? 'var(--bg-elevated)' : 'var(--bg-surface)',
              color: filterStatus === s ? 'var(--accent-primary)' : 'var(--text-secondary)',
              border: `1px solid ${filterStatus === s ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* 2-Column Review Queue & Review Detail (Section 74) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Left: Review Queue List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '40px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-muted)' }}>
              No review items in this status.
            </div>
          ) : (
            filtered.map((r) => {
              const isSelected = selectedReview?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReview(r)}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                    border: `1px solid ${isSelected ? 'var(--status-warning)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--status-warning)', textTransform: 'uppercase' }}>
                      {r.issue_category.replace(/_/g, ' ')}
                    </span>
                    <StatusBadge status={r.status} />
                  </div>

                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    {r.title}
                  </h3>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.4 }}>
                    {r.reason}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>Assigned: {r.assigned_to_name}</span>
                    <span>{r.evidence_reference}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Review Detail Panel (Section 74) */}
        {selectedReview && (
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              position: 'sticky',
              top: '80px',
              height: 'fit-content',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--status-warning)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                REVIEW REQUIRED DETAIL
              </span>
              <StatusBadge status={selectedReview.status} />
            </div>

            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              {selectedReview.title}
            </h2>

            {/* Comparison Box if Conflicting Version */}
            {selectedReview.version_1_summary && selectedReview.version_2_summary && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '16px',
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    VERSION 1 (2025)
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {selectedReview.version_1_summary}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '4px' }}>
                    VERSION 2 (CURRENT)
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-primary)' }}>
                    {selectedReview.version_2_summary}
                  </div>
                </div>
              </div>
            )}

            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
              <strong>Underlying Discrepancy:</strong> {selectedReview.reason}
            </div>

            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                fontSize: '11px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '18px',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Evidence Anchor: {selectedReview.evidence_reference}</span>
              {onOpenEvidence && (
                <button
                  onClick={() => onOpenEvidence(5, 'ninety (90) days prior written notice')}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--accent-secondary)',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Eye size={12} />
                  <span>Inspect Source</span>
                </button>
              )}
            </div>

            {/* Counsel Resolution Note Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Legal Reviewer Decision & Notes:
              </label>
              <textarea
                rows={3}
                placeholder="Enter review explanation or operational instructions..."
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                style={{ width: '100%', resize: 'none' }}
              />
            </div>

            {/* Action Buttons: Confirm, Correct, Reject, Escalate (Section 20 & 74) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <button
                onClick={() => handleAction('CONFIRM')}
                style={{
                  padding: '9px',
                  backgroundColor: 'var(--status-success)',
                  color: '#111',
                  border: 'none',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <CheckCircle size={14} />
                <span>Confirm Finding</span>
              </button>

              <button
                onClick={() => handleAction('REJECT')}
                style={{
                  padding: '9px',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--status-critical)',
                  border: '1px solid var(--status-critical)',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <XCircle size={14} />
                <span>Reject Finding</span>
              </button>

              <button
                onClick={() => handleAction('CORRECT')}
                style={{
                  padding: '8px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--accent-secondary)',
                  fontWeight: 600,
                }}
              >
                Correct Rule
              </button>

              <button
                onClick={() => handleAction('ESCALATE')}
                style={{
                  padding: '8px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--status-warning)',
                  fontWeight: 600,
                }}
              >
                Escalate to GC
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
