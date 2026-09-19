import React from 'react';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Calendar,
  AlertCircle,
  GitCompare,
  FolderArchive,
  Sparkles,
  Settings,
  ShieldCheck,
  Network,
  History,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'contracts'
  | 'obligations'
  | 'timeline'
  | 'reviews'
  | 'changes'
  | 'documents'
  | 'graph'
  | 'query'
  | 'audit'
  | 'settings';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  reviewCount?: number;
  deadlinesCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  reviewCount = 0,
  deadlinesCount = 0,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'contracts', label: 'Contracts', icon: FileText },
    { id: 'obligations', label: 'Obligations', icon: CheckSquare },
    { id: 'timeline', label: 'Timeline', icon: Calendar, count: deadlinesCount },
    { id: 'reviews', label: 'Reviews', icon: AlertCircle, count: reviewCount, highlight: true },
    { id: 'changes', label: 'Version Changes', icon: GitCompare },
    { id: 'documents', label: 'Documents', icon: FolderArchive },
    { id: 'graph', label: 'Contract Graph', icon: Network },
    { id: 'query', label: 'Ask ContractLens', icon: Sparkles, accent: true },
    { id: 'audit', label: 'Audit Trail', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      style={{
        width: '240px',
        minWidth: '240px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100vh',
        position: 'sticky',
        top: 0,
        padding: '20px 14px',
      }}
    >
      <div>
        {/* Brand Header */}
        <div style={{ padding: '0 8px 24px 8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-faint)',
                border: '1px solid var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
              }}
            >
              <ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
                CONTRACTLENS
              </div>
              <div style={{ fontSize: '10px', color: 'var(--accent-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Intelligence Agent
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as NavTab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: active ? 'var(--bg-elevated)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: active ? '1px solid var(--border-color)' : '1px solid transparent',
                  fontWeight: active ? 600 : 400,
                  fontSize: '13px',
                  width: '100%',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon
                    size={16}
                    color={active ? 'var(--accent-primary)' : item.accent ? 'var(--accent-secondary)' : 'var(--text-muted)'}
                  />
                  <span>{item.label}</span>
                </div>

                {item.count && item.count > 0 ? (
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      backgroundColor: item.highlight ? 'var(--status-warning-bg)' : 'var(--bg-elevated)',
                      color: item.highlight ? 'var(--status-warning)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      border: `1px solid ${item.highlight ? 'rgba(213, 139, 58, 0.3)' : 'var(--border-color)'}`,
                    }}
                  >
                    {item.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status / Workspace Info */}
      <div
        style={{
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Workspace
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
          ACME Global
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--status-success)' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Deterministic Engine Active</span>
        </div>
      </div>
    </aside>
  );
};
