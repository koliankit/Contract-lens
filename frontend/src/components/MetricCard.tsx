import React from 'react';

interface MetricCardProps {
  label: string;
  value: number | string;
  subtext?: string;
  badge?: string;
  onClick?: () => void;
  accent?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  badge,
  onClick,
  accent = false,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: `1px solid ${accent ? 'var(--accent-primary)' : 'var(--border-color)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, border-color 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        boxShadow: 'var(--shadow-subtle)',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = 'var(--accent-secondary)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = accent ? 'var(--accent-primary)' : 'var(--border-color)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-secondary)',
          }}
        >
          {label}
        </span>
        {badge && (
          <span
            style={{
              fontSize: '10px',
              padding: '1px 6px',
              borderRadius: '3px',
              backgroundColor: 'var(--accent-faint)',
              color: 'var(--accent-secondary)',
              fontWeight: 500,
            }}
          >
            {badge}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          {typeof value === 'number' && value < 10 ? `0${value}` : value}
        </span>
      </div>

      {subtext && (
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
          {subtext}
        </span>
      )}
    </div>
  );
};
