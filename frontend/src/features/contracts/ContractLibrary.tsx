import React, { useState } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { ContractListItem } from '../../types';
import { Upload, Plus, Filter, FileText, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

interface ContractLibraryProps {
  contracts: ContractListItem[];
  onSelectContract: (id: string) => void;
  onRefresh: () => void;
}

export const ContractLibrary: React.FC<ContractLibraryProps> = ({
  contracts,
  onSelectContract,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.counterparty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || c.contract_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSimulatedUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadStep(1);

    // Progressive pipeline step indicators matching Section 24
    const steps = [
      'Reading uploaded contract document...',
      'Identifying clauses and commercial taxonomy...',
      'Extracting explicit, derived, and ambiguous obligations...',
      'Running deterministic deadline engine...',
      'Comparing semantic versions and amendments...',
      'Verifying verbatim evidence quotes against source...',
      'Constructing contract relationship graph...'
    ];

    for (let i = 1; i <= steps.length; i++) {
      setUploadStep(i);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    setIsUploading(false);
    setShowUploadModal(false);
    setUploadStep(0);
    onRefresh();
  };

  return (
    <div style={{ padding: '28px 36px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header & Upload Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 className="editorial-title" style={{ fontSize: '30px', marginBottom: '4px' }}>
            Contract Library
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Central repository of analyzed legal agreements, amendments, and operational mappings.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            backgroundColor: 'var(--accent-primary)',
            color: '#111',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          <Upload size={15} />
          <span>Upload Contract</span>
        </button>
      </div>

      {/* Filter Bar */}
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
          placeholder="Filter by title or counterparty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '280px' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Status:</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="REVIEW_REQUIRED">Review Required</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Type:</span>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="ALL">All Types</option>
            <option value="MSA">MSA</option>
            <option value="SLA">SLA</option>
            <option value="Amendment">Amendment</option>
          </select>
        </div>
      </div>

      {/* Enterprise Data Table (Section 23) */}
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
            <tr
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              <th style={{ padding: '12px 16px' }}>Contract</th>
              <th style={{ padding: '12px 16px' }}>Counterparty</th>
              <th style={{ padding: '12px 16px' }}>Type</th>
              <th style={{ padding: '12px 16px' }}>Effective</th>
              <th style={{ padding: '12px 16px' }}>Expiration</th>
              <th style={{ padding: '12px 16px' }}>Renewal Notice</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Owner</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContracts.map((c) => {
              const effDate = c.effective_date ? new Date(c.effective_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
              const expDate = c.expiration_date ? new Date(c.expiration_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
              const renDeadline = c.renewal_deadline ? new Date(c.renewal_deadline).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '90 Days';

              return (
                <tr
                  key={c.id}
                  onClick={() => onSelectContract(c.id)}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={15} color="var(--accent-secondary)" />
                      <span>{c.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    {c.counterparty}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '3px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
                      {c.contract_type}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {effDate}
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {expDate}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: 'var(--accent-primary)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                        {renDeadline}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {c.renewal_type}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <StatusBadge status={c.status} />
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {c.internal_owner_name}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectContract(c.id);
                      }}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--accent-secondary)',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Upload Contract Modal with 7-Step Pipeline (Section 24) */}
      {showUploadModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              width: '540px',
              padding: '24px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h2 className="editorial-title" style={{ fontSize: '22px', marginBottom: '8px' }}>
              Upload Contract Document
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              ContractLens will ingest the document, segment clauses, extract obligations, calculate deterministic deadlines, verify evidence, and build the contract graph.
            </p>

            {!isUploading ? (
              <form onSubmit={handleSimulatedUpload}>
                <div
                  style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '36px',
                    textAlign: 'center',
                    marginBottom: '20px',
                    backgroundColor: 'var(--bg-elevated)',
                  }}
                >
                  <Upload size={32} color="var(--accent-primary)" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Drop PDF or DOCX here, or click to browse
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Supports original contracts, version updates (v2), amendments, and addendums
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Version Tag
                    </label>
                    <input type="text" defaultValue="v2 (Updated Terms)" style={{ width: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Document Type
                    </label>
                    <select style={{ width: '100%' }}>
                      <option>VERSION_UPDATE</option>
                      <option>AMENDMENT</option>
                      <option>ADDENDUM</option>
                      <option>ORIGINAL</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 20px',
                      backgroundColor: 'var(--accent-primary)',
                      color: '#111',
                      border: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Start Processing
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ padding: '16px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <Loader2 size={18} className="spin" color="var(--accent-primary)" />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-secondary)' }}>
                    Processing Contract Pipeline...
                  </span>
                </div>

                {/* 7-step visual pipeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    'Document uploaded & validated',
                    'Document structure & pages identified',
                    'Clauses detected (25+ commercial categories)',
                    'Obligations extracted with ownership mapping',
                    'Deadlines calculated deterministically',
                    'Source text & evidence verified',
                    'Contract relationship graph constructed'
                  ].map((stepText, idx) => {
                    const isDone = uploadStep > idx + 1;
                    const isCurrent = uploadStep === idx + 1;
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '12px',
                          color: isDone ? 'var(--text-primary)' : isCurrent ? 'var(--accent-primary)' : 'var(--text-muted)',
                        }}
                      >
                        {isDone ? (
                          <CheckCircle2 size={15} color="var(--status-success)" />
                        ) : isCurrent ? (
                          <Loader2 size={15} color="var(--accent-primary)" className="spin" />
                        ) : (
                          <div style={{ width: '15px', height: '15px', borderRadius: '50%', border: '1px solid var(--border-color)' }} />
                        )}
                        <span>{stepText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
