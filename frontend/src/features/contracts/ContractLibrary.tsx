import React, { useState, useRef } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { ContractListItem } from '../../types';
import { Upload, Plus, Filter, FileText, ChevronRight, CheckCircle2, Loader2, Sparkles, X, FileCheck } from 'lucide-react';
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
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [pipelineEvents, setPipelineEvents] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.counterparty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || c.contract_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const standardSteps = [
    'Document uploaded & validated',
    'Document structure detected',
    'Clauses extracted (25+ categories)',
    'Obligations identified with ownership',
    'Deadlines calculated deterministically',
    'Version changes analyzed',
    'Evidence verified against source',
    'Contract graph generated',
  ];

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a PDF or DOCX file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setActiveStepIndex(1);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Step through progress while upload completes
      const progressTimer = setInterval(() => {
        setActiveStepIndex((prev) => (prev < 7 ? prev + 1 : prev));
      }, 450);

      const res = await api.uploadNewContract(formData);
      clearInterval(progressTimer);
      setActiveStepIndex(8);

      if (res.pipeline && res.pipeline.events) {
        setPipelineEvents(res.pipeline.events.map((ev: any) => `${ev.agent}: ${ev.action}`));
      }

      setTimeout(() => {
        setIsUploading(false);
        setShowUploadModal(false);
        setSelectedFile(null);
        setActiveStepIndex(0);
        onRefresh();
        if (res.contract_id) {
          onSelectContract(res.contract_id);
        }
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Upload processing failed.');
      setIsUploading(false);
    }
  };

  const handleLoadTestContract = async (testKey: string) => {
    setIsUploading(true);
    setUploadError(null);
    setActiveStepIndex(1);

    const progressTimer = setInterval(() => {
      setActiveStepIndex((prev) => (prev < 7 ? prev + 1 : prev));
    }, 400);

    try {
      const res = await api.loadTestContract(testKey);
      clearInterval(progressTimer);
      setActiveStepIndex(8);

      if (res.pipeline && res.pipeline.events) {
        setPipelineEvents(res.pipeline.events.map((ev: any) => `${ev.agent}: ${ev.action}`));
      }

      setTimeout(() => {
        setIsUploading(false);
        setShowUploadModal(false);
        setActiveStepIndex(0);
        onRefresh();
        if (res.contract_id) {
          onSelectContract(res.contract_id);
        }
      }, 800);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Failed to load test contract.');
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: '28px 36px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header & Upload Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 className="editorial-title" style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Contract Library
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Central repository of analyzed agreements, clauses, and operational commitments.
          </p>
        </div>

        <button
          onClick={() => {
            setShowUploadModal(true);
            setUploadError(null);
            setSelectedFile(null);
          }}
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
            cursor: 'pointer',
          }}
        >
          <Upload size={15} />
          <span>Upload Contract</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
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
          <Filter size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search contracts by title, counterparty, or owner..."
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

        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}
          >
            <option value="ALL">All Types</option>
            <option value="MSA">MSA</option>
            <option value="Vendor Agreement">Vendor Agreement</option>
            <option value="License & DPA">License & DPA</option>
            <option value="SLA">SLA</option>
            <option value="Amendment">Amendment</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="REVIEW_REQUIRED">Review Required</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {/* Contract Table */}
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
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Contract Title</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Counterparty</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Type</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Renewal Deadline</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Obligations</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Deadlines</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>Reviews</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredContracts.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No contracts found matching criteria. Upload a contract to begin intelligence analysis.
                </td>
              </tr>
            ) : (
              filteredContracts.map((c) => {
                const renewalStr = c.renewal_deadline
                  ? new Date(c.renewal_deadline).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
                  : 'N/A';

                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelectContract(c.id)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-elevated)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={15} color="var(--accent-primary)" />
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.title}</span>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {c.counterparty}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {c.contract_type}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={c.status} type="status" />
                    </td>

                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-secondary)' }}>
                      {renewalStr}
                    </td>

                    <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {c.obligations_count}
                    </td>

                    <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {c.deadlines_count}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      {c.open_reviews_count > 0 ? (
                        <span
                          style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            backgroundColor: 'var(--status-warning-bg)',
                            color: 'var(--status-warning)',
                            fontWeight: 600,
                            border: '1px solid rgba(213, 139, 58, 0.3)',
                          }}
                        >
                          {c.open_reviews_count} pending
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>0</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Real Contract Upload Modal */}
      {showUploadModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            padding: '24px',
          }}
          onClick={() => {
            if (!isUploading) setShowUploadModal(false);
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '640px',
              padding: '28px',
              boxShadow: 'var(--shadow-card)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {!isUploading && (
              <button
                onClick={() => setShowUploadModal(false)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            )}

            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-secondary)', fontWeight: 600 }}>
                CONTRACT INGESTION
              </span>
              <h2 className="editorial-title" style={{ fontSize: '24px', color: 'var(--text-primary)', marginTop: '4px' }}>
                Upload Contracts
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Ingest PDF, DOCX, or scanned documents to dynamically extract obligations, deadlines, evidence, and version changes.
              </p>
            </div>

            {!isUploading ? (
              <div>
                {/* 1-Click Test Contracts Selector (Section 16) */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-base)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Sparkles size={14} color="var(--accent-primary)" />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Quick Test Contracts (Official Hackathon Suite)
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => handleLoadTestContract('acme')}
                      style={{
                        padding: '10px',
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)' }}>01 ACME SaaS</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>Net 30, 99.5% SLA, 90d renewal</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLoadTestContract('nova')}
                      style={{
                        padding: '10px',
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-secondary)' }}>02 NOVA Vendor</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>96% delivery, INR 1Cr, 24h incident</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLoadTestContract('orbit')}
                      style={{
                        padding: '10px',
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--status-warning)' }}>03 ORBIT DPA</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>4h SLA, 120d renewal, review trigger</div>
                    </button>
                  </div>
                </div>

                {/* Drag and Drop Box */}
                <form onSubmit={handleFileUpload}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.docx,.txt"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                        setUploadError(null);
                      }
                    }}
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '32px 20px',
                      textAlign: 'center',
                      marginBottom: '16px',
                      backgroundColor: 'var(--bg-elevated)',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                  >
                    <Upload size={28} color="var(--accent-primary)" style={{ margin: '0 auto 10px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {selectedFile ? selectedFile.name : 'Drag & drop documents here'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      PDF • DOCX • Scanned PDF
                    </div>
                    <button
                      type="button"
                      style={{
                        padding: '6px 14px',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        borderRadius: 'var(--radius-sm)',
                        pointerEvents: 'none',
                      }}
                    >
                      {selectedFile ? 'Change File' : 'Select Files'}
                    </button>
                  </div>

                  {uploadError && (
                    <div style={{ color: 'var(--status-critical)', fontSize: '12px', marginBottom: '16px' }}>
                      {uploadError}
                    </div>
                  )}

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
                      disabled={!selectedFile}
                      style={{
                        padding: '8px 20px',
                        backgroundColor: selectedFile ? 'var(--accent-primary)' : 'var(--border-color)',
                        color: selectedFile ? '#111' : 'var(--text-muted)',
                        border: 'none',
                        fontWeight: 600,
                        cursor: selectedFile ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Process Document
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Real Processing Progress (No fake progress) */
              <div style={{ padding: '16px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                  <Loader2 size={20} className="spin" color="var(--accent-primary)" />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Autonomous Intelligence Pipeline Active...
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Extracting contractual commitments, evidence, and deterministic deadlines
                    </div>
                  </div>
                </div>

                {/* 8-stage progress tracker */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--bg-base)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  {standardSteps.map((stepText, idx) => {
                    const stepNum = idx + 1;
                    const isDone = activeStepIndex > stepNum || activeStepIndex === 8;
                    const isCurrent = activeStepIndex === stepNum && activeStepIndex < 8;

                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                          color: isDone ? 'var(--text-primary)' : isCurrent ? 'var(--accent-primary)' : 'var(--text-muted)',
                          fontWeight: isDone || isCurrent ? 500 : 400,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {isDone ? (
                            <CheckCircle2 size={16} color="var(--status-success)" />
                          ) : isCurrent ? (
                            <Loader2 size={16} color="var(--accent-primary)" className="spin" />
                          ) : (
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid var(--border-color)' }} />
                          )}
                          <span>{stepText}</span>
                        </div>

                        {isDone && (
                          <span style={{ color: 'var(--status-success)', fontSize: '11px', fontWeight: 600 }}>✓</span>
                        )}
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
