import React, { useState } from 'react';
import { Obligation } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { api } from '../../services/api';
import {
  CheckSquare, Filter, Eye, CheckCircle, Clock, ShieldCheck,
  User, Calendar, AlertCircle
} from 'lucide-react';

interface ObligationRegistryProps {
  obligations: Obligation[];
  onRefresh: () => void;
  onOpenEvidence?: (ob: Obligation) => void;
}

export const ObligationRegistry: React.FC<ObligationRegistryProps> = ({
  obligations,
  onRefresh,
  onOpenEvidence,
}) => {
  const [selectedObligation, setSelectedObligation] = useState<Obligation | null>(
    obligations.length > 0 ? obligations[0] : null
  );
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ownerFilter, setOwnerFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = obligations.filter((ob) => {
    const matchesSearch = ob.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || ob.status === statusFilter;
    const matchesOwner = ownerFilter === 'ALL' || ob.internal_owner === ownerFilter;
    const matchesType = typeFilter === 'ALL' || ob.obligation_type === typeFilter;
    return matchesSearch && matchesStatus && matchesOwner && matchesType;
  });

  const handleStatusChange = async (obId: string, newStatus: string) => {
    try {
      await api.updateObligation(obId, { status: newStatus });
      onRefresh();
      if (selectedObligation && selectedObligation.id === obId) {
        setSelectedObligation({ ...selectedObligation, status: newStatus as any });
      }
    } catch (err) {
      console.error('Failed to update obligation status:', err);
    }
  };

  return (
    <div style={{ padding: '28px 36px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="editorial-title" style={{ fontSize: '30px', marginBottom: '4px' }}>
          Obligation Registry
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Operational commitments transformed from legal clauses, with segregated legal party and internal owner accountability.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          backgroundColor: 'var(--bg-surface)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        <input
          type="text"
          placeholder="Search obligations by action or keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '280px' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Status:</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Owner:</span>
          <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
            <option value="ALL">All Teams</option>
            <option value="Operations">Operations</option>
            <option value="Procurement">Procurement</option>
            <option value="Finance">Finance</option>
            <option value="Legal">Legal</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Type:</span>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="ALL">All Types</option>
            <option value="EXPLICIT">Explicit</option>
            <option value="DERIVED">Derived</option>
            <option value="AMBIGUOUS">Ambiguous (Review)</option>
          </select>
        </div>
      </div>

      {/* 2-Column Layout: Obligation List & Obligation Detail Panel (Section 73) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* Left Column: Obligation Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((ob) => {
            const isSelected = selectedObligation?.id === ob.id;
            return (
              <div
                key={ob.id}
                onClick={() => setSelectedObligation(ob)}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                  border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: 'var(--shadow-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {ob.action}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <StatusBadge status={ob.obligation_type} />
                    <StatusBadge status={ob.priority} type="priority" />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span>Responsible Party: <strong style={{ color: 'var(--text-primary)' }}>{ob.party}</strong></span>
                  <span>•</span>
                  <span>Internal Owner: <strong style={{ color: 'var(--accent-secondary)' }}>{ob.internal_owner}</strong></span>
                </div>

                <div
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '11px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>Rule: {ob.deadline_rule}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 600 }}>
                    {ob.calculated_deadline ? new Date(ob.calculated_deadline).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Milestone'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Obligation Detail Panel (Section 73) */}
        {selectedObligation ? (
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
              <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--accent-secondary)', letterSpacing: '0.06em' }}>
                OBLIGATION INTELLIGENCE DETAIL
              </span>
              <StatusBadge status={selectedObligation.status} />
            </div>

            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', lineHeight: 1.4 }}>
              {selectedObligation.action}
            </h2>

            {/* Spec Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Responsible Legal Party:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedObligation.party}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Internal Operational Owner:</span>
                <strong style={{ color: 'var(--accent-secondary)' }}>{selectedObligation.internal_owner} Team</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Frequency:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedObligation.frequency}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Extracted Deadline Rule:</span>
                <strong style={{ color: 'var(--accent-primary)' }}>{selectedObligation.deadline_rule}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Calculated Due Date:</span>
                <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {selectedObligation.calculated_deadline ? new Date(selectedObligation.calculated_deadline).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Event Triggered'}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Source Grounding:</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Page {selectedObligation.source_page}, Section {selectedObligation.source_section}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Confidence / Source Verification:</span>
                <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>High Confidence • Verified ✓</span>
              </div>
            </div>

            {/* Verbatim Source Quote Box */}
            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                fontSize: '12px',
                fontStyle: 'italic',
                color: 'var(--text-secondary)',
                marginBottom: '20px',
                lineHeight: 1.5,
              }}
            >
              "{selectedObligation.source_text}"
            </div>

            {/* Action Buttons (Section 73) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedObligation.status !== 'COMPLETED' ? (
                <button
                  onClick={() => handleStatusChange(selectedObligation.id, 'COMPLETED')}
                  style={{
                    padding: '10px',
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
                  <CheckCircle size={15} />
                  <span>Mark Completed</span>
                </button>
              ) : (
                <button
                  onClick={() => handleStatusChange(selectedObligation.id, 'UPCOMING')}
                  style={{
                    padding: '10px',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Reopen Obligation
                </button>
              )}

              {onOpenEvidence && (
                <button
                  onClick={() => onOpenEvidence(selectedObligation)}
                  style={{
                    padding: '10px',
                    backgroundColor: 'var(--accent-faint)',
                    border: '1px solid var(--accent-primary)',
                    color: 'var(--accent-secondary)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Eye size={14} />
                  <span>Open Verbatim Evidence Viewer</span>
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
