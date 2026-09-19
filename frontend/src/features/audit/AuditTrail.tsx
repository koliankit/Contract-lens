import React, { useState } from 'react';
import { AuditLogItem } from '../../types';
import { ShieldCheck, Search, Filter, Bot, User, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AuditTrailProps {
  logs: AuditLogItem[];
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [agentFilter, setAgentFilter] = useState('ALL');

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.agent_name && l.agent_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.source_reference && l.source_reference.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesAgent = agentFilter === 'ALL' || l.agent_name === agentFilter;
    return matchesSearch && matchesAgent;
  });

  const agents = ['ALL', 'Document Agent', 'Clause Agent', 'Obligation Agent', 'Deadline Engine', 'Version Agent', 'Verification Engine', 'Review Agent', 'Contract Graph'];

  return (
    <div style={{ padding: '28px 36px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <ShieldCheck size={20} color="var(--accent-primary)" />
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-secondary)' }}>
            Enterprise Governance & Lineage
          </span>
        </div>
        <h1 className="editorial-title" style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Audit Trail & Agent Lineage
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Immutable record of every autonomous agent action, tool invocation, and human decision.
        </p>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '20px',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search audit actions, tools, or references..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              padding: '4px',
              fontSize: '13px',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Agent:</span>
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {agents.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-subtle)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                Timestamp
              </th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                Agent / Actor
              </th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                Action
              </th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                Output Summary
              </th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                Source Ref
              </th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
                Decision
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No audit logs found matching criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const isHuman = log.agent_name === 'Human' || log.user_name !== 'System';
                const timeStr = log.timestamp
                  ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  : 'Recent';

                return (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-elevated)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {timeStr}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isHuman ? (
                          <User size={14} color="var(--accent-secondary)" />
                        ) : (
                          <Bot size={14} color="var(--accent-primary)" />
                        )}
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '12px' }}>
                          {log.agent_name}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {log.action}
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '12px', maxWidth: '300px' }}>
                      {log.output_summary || log.input_summary || '—'}
                    </td>

                    <td style={{ padding: '12px 16px', color: 'var(--accent-secondary)', fontSize: '12px' }}>
                      {log.source_reference || '—'}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor:
                            log.user_decision === 'Confirmed'
                              ? 'var(--status-success-bg)'
                              : log.user_decision === 'Flagged for Review'
                              ? 'var(--status-warning-bg)'
                              : 'var(--bg-elevated)',
                          color:
                            log.user_decision === 'Confirmed'
                              ? 'var(--status-success)'
                              : log.user_decision === 'Flagged for Review'
                              ? 'var(--status-warning)'
                              : 'var(--text-secondary)',
                          fontWeight: 600,
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        {log.user_decision || 'Logged'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
