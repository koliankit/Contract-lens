import React, { useState } from 'react';
import { Cpu, ChevronDown, ChevronUp, CheckCircle2, Clock } from 'lucide-react';
import { AuditLogItem } from '../types';

interface AgentActivityPanelProps {
  logs: AuditLogItem[];
}

export const AgentActivityPanel: React.FC<AgentActivityPanelProps> = ({ logs }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-subtle)',
        marginTop: '16px',
      }}
    >
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          backgroundColor: isExpanded ? 'var(--bg-elevated)' : 'var(--bg-surface)',
          borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={16} color="var(--accent-primary)" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            AI Agent Orchestration & Execution Stream
          </span>
          <span
            style={{
              fontSize: '11px',
              padding: '1px 6px',
              borderRadius: '10px',
              backgroundColor: 'var(--status-success-bg)',
              color: 'var(--status-success)',
              border: '1px solid rgba(155, 154, 114, 0.3)',
              fontWeight: 600,
            }}
          >
            {logs.length} Operations Logged
          </span>
        </div>

        <button
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isExpanded && (
        <div style={{ padding: '12px 18px', maxHeight: '280px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {logs.slice(0, 10).map((log) => {
              const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              return (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    fontSize: '12px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                      fontSize: '11px',
                      minWidth: '65px',
                    }}
                  >
                    {timeStr}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '130px' }}>
                    <CheckCircle2 size={13} color="var(--status-success)" />
                    <span style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>
                      {log.agent_name}
                    </span>
                  </div>

                  <div style={{ flex: 1 }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {log.action}
                    </span>
                    {log.output_summary && (
                      <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>
                        {log.output_summary}
                      </div>
                    )}
                  </div>

                  {log.tool_called && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {log.tool_called}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
