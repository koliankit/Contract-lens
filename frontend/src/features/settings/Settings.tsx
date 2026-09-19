import React, { useState, useEffect } from 'react';
import { AuditLogItem } from '../../types';
import { api } from '../../services/api';
import { Settings as SettingsIcon, Shield, Bell, Calendar, Users, Database, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'calendar' | 'audit'>('general');
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [leadTimes, setLeadTimes] = useState({
    notice7d: true,
    notice14d: true,
    notice30d: true,
    notice60d: true,
    notice90d: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getAuditLogs().then(setAuditLogs).catch(console.error);
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: '28px 36px', maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="editorial-title" style={{ fontSize: '30px', marginBottom: '4px' }}>
          Platform Settings & Security
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Organization-level configuration, notification lead times, deterministic holiday calendar, and audit trails.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        {(['general', 'notifications', 'calendar', 'audit'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: activeTab === tab ? 'var(--bg-elevated)' : 'transparent',
              color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
              border: `1px solid ${activeTab === tab ? 'var(--accent-primary)' : 'transparent'}`,
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          >
            {tab === 'audit' ? 'Audit Trail Log' : tab}
          </button>
        ))}
      </div>

      {/* TAB 1: GENERAL */}
      {activeTab === 'general' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px' }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px' }}>Organization Profile</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Organization Name
                </label>
                <input type="text" defaultValue="ACME Global Enterprise" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Primary Domain
                </label>
                <input type="text" defaultValue="acme-corp.com" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Tenant ID (Multi-tenancy Isolation)
                </label>
                <input type="text" defaultValue="org_acme_corp" disabled style={{ width: '100%', opacity: 0.7 }} />
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px' }}>Authorized Users & Roles</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              {[
                { name: 'Rahul Sharma', email: 'rahul.sharma@acme-corp.com', role: 'Contract Manager' },
                { name: 'Ankit Mehta', email: 'ankit.mehta@acme-corp.com', role: 'Legal Reviewer' },
                { name: 'Sarah Chen', email: 'sarah.chen@acme-corp.com', role: 'Finance Lead' },
                { name: 'David Ross', email: 'david.ross@acme-corp.com', role: 'Procurement Specialist' },
              ].map((u, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '3px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--accent-secondary)' }}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NOTIFICATIONS (Section 88) */}
      {activeTab === 'notifications' && (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', maxWidth: '720px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px' }}>
            Notification Lead Times (Section 88)
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Configure advance dispatch intervals for renewal windows and critical obligation deadlines:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {[
              { id: 'notice90d', label: '90 Calendar Days Before Expiration (Standard Renewal Notice)' },
              { id: 'notice60d', label: '60 Calendar Days Before Expiration (Executive Review)' },
              { id: 'notice30d', label: '30 Calendar Days Before Expiration (Final Procurement Window)' },
              { id: 'notice14d', label: '14 Calendar Days Before Expiration (Urgent Warning)' },
              { id: 'notice7d', label: '7 Calendar Days Before Expiration (Critical Escalation)' },
            ].map((item) => (
              <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={(leadTimes as any)[item.id]}
                  onChange={(e) => setLeadTimes({ ...leadTimes, [item.id]: e.target.checked })}
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleSave}
            style={{
              padding: '8px 20px',
              backgroundColor: 'var(--accent-primary)',
              color: '#111',
              border: 'none',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {saved ? <Check size={14} /> : null}
            <span>{saved ? 'Saved Preferences' : 'Save Notification Preferences'}</span>
          </button>
        </div>
      )}

      {/* TAB 3: CALENDAR (Section 10) */}
      {activeTab === 'calendar' && (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '24px', maxWidth: '720px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px' }}>
            Deterministic Business Calendar Configuration
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            The deadline engine skips Saturdays, Sundays, and verified jurisdictional holidays to guarantee audit-proof date calculations.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            {[
              'New Year\'s Day (January 1)',
              'Martin Luther King Jr. Day (Mid-January)',
              'Memorial Day (Late May)',
              'Independence Day (July 4)',
              'Labor Day (Early September)',
              'Thanksgiving Day (Late November)',
              'Christmas Day (December 25)'
            ].map((hol, idx) => (
              <div key={idx} style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                ✓ {hol}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL LOG (Section 32 & 55) */}
      {activeTab === 'audit' && (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Immutable Audit Trail (Section 32)</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Showing last 50 recorded operations</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '10px' }}>
                <th style={{ padding: '10px 14px' }}>Timestamp</th>
                <th style={{ padding: '10px 14px' }}>Agent / Actor</th>
                <th style={{ padding: '10px 14px' }}>Action</th>
                <th style={{ padding: '10px 14px' }}>Tool / Method</th>
                <th style={{ padding: '10px 14px' }}>Source Grounding</th>
                <th style={{ padding: '10px 14px' }}>Decision</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--accent-secondary)' }}>
                    {log.agent_name}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-primary)' }}>
                    {log.action}
                  </td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {log.tool_called || '—'}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                    {log.source_reference || 'Workspace'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--status-success)', fontWeight: 600 }}>
                      {log.user_decision || 'Recorded'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
