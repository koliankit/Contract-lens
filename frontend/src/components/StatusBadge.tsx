import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'priority' | 'risk' | 'type';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'status' }) => {
  const s = status.toUpperCase();

  let bg = 'var(--status-info-bg)';
  let color = 'var(--status-info)';
  let border = 'var(--border-color)';

  if (['CRITICAL', 'OVERDUE', 'FAILED'].includes(s)) {
    bg = 'var(--status-critical-bg)';
    color = 'var(--status-critical)';
    border = 'rgba(198, 90, 84, 0.35)';
  } else if (['HIGH', 'DUE_SOON', 'DUE_TODAY', 'POTENTIALLY_MATERIAL', 'REQUIRES_REVIEW', 'PENDING', 'AMBIGUOUS'].includes(s)) {
    bg = 'var(--status-warning-bg)';
    color = 'var(--status-warning)';
    border = 'rgba(213, 139, 58, 0.35)';
  } else if (['COMPLETED', 'ACTIVE', 'CONFIRMED', 'ACCEPTED', 'EXPLICIT', 'HIGH CONFIDENCE'].includes(s)) {
    bg = 'var(--status-success-bg)';
    color = 'var(--status-success)';
    border = 'rgba(155, 154, 114, 0.35)';
  } else if (['MEDIUM', 'IN_PROGRESS', 'REVIEWED', 'DERIVED', 'OPERATIONAL', 'FINANCIAL'].includes(s)) {
    bg = 'rgba(216, 178, 124, 0.12)';
    color = 'var(--accent-secondary)';
    border = 'rgba(216, 178, 124, 0.25)';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
};
