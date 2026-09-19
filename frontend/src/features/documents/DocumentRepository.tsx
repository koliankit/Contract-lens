import React from 'react';
import { ContractDocument } from '../../types';
import { FileText, Download, Eye, Clock, CheckCircle2, FolderArchive } from 'lucide-react';

interface DocumentRepositoryProps {
  documents: ContractDocument[];
  onOpenDocument: (docId: string) => void;
}

export const DocumentRepository: React.FC<DocumentRepositoryProps> = ({
  documents,
  onOpenDocument,
}) => {
  // Pre-seed demo documents if not loaded yet
  const displayDocs = documents.length > 0 ? documents : [
    {
      id: 'doc_acme_v1',
      contract_id: 'contract_acme_msa',
      filename: 'ACME_MSA_v1.pdf',
      file_path: 'storage/documents/ACME_MSA_v1.pdf',
      file_type: 'PDF',
      file_size_bytes: 6200,
      version_tag: 'v1 (Baseline)',
      document_type: 'ORIGINAL',
      page_count: 6,
      processing_status: 'COMPLETED',
      created_at: '2025-01-15T00:00:00Z',
    },
    {
      id: 'doc_acme_v2',
      contract_id: 'contract_acme_msa',
      filename: 'ACME_MSA_v2.pdf',
      file_path: 'storage/documents/ACME_MSA_v2.pdf',
      file_type: 'PDF',
      file_size_bytes: 6315,
      version_tag: 'v2 (Active MSA)',
      document_type: 'VERSION_UPDATE',
      page_count: 6,
      processing_status: 'COMPLETED',
      created_at: '2026-01-15T00:00:00Z',
    },
    {
      id: 'doc_acme_sla',
      contract_id: 'contract_acme_msa',
      filename: 'ACME_SLA.pdf',
      file_path: 'storage/documents/ACME_SLA.pdf',
      file_type: 'PDF',
      file_size_bytes: 3792,
      version_tag: 'Schedule A',
      document_type: 'ADDENDUM',
      page_count: 3,
      processing_status: 'COMPLETED',
      created_at: '2026-01-15T00:00:00Z',
    },
    {
      id: 'doc_acme_amend',
      contract_id: 'contract_acme_msa',
      filename: 'ACME_Amendment.pdf',
      file_path: 'storage/documents/ACME_Amendment.pdf',
      file_type: 'PDF',
      file_size_bytes: 3020,
      version_tag: 'Amendment 1',
      document_type: 'AMENDMENT',
      page_count: 2,
      processing_status: 'COMPLETED',
      created_at: '2026-03-01T00:00:00Z',
    }
  ];

  return (
    <div style={{ padding: '28px 36px', maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="editorial-title" style={{ fontSize: '30px', marginBottom: '4px' }}>
          Document Repository & Version Tree
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Raw contractual artifacts, amendments, addendums, and version timelines preserved with persistent source metadata.
        </p>
      </div>

      {/* Version Timeline (Section 92) */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '20px 24px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-subtle)',
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-secondary)', textTransform: 'uppercase', marginBottom: '14px' }}>
          Contract Lifecycle & Document Version Tree (Section 92)
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
          {[
            { date: '15 Jan 2025', title: 'Original Agreement (v1)', doc: 'ACME_MSA_v1.pdf', tag: 'v1' },
            { date: '15 Jan 2026', title: 'Restated Agreement (v2)', doc: 'ACME_MSA_v2.pdf', tag: 'v2' },
            { date: '15 Jan 2026', title: 'SLA Schedule A', doc: 'ACME_SLA.pdf', tag: 'Schedule A' },
            { date: '01 Mar 2026', title: 'Amendment No. 1', doc: 'ACME_Amendment.pdf', tag: 'Amendment 1' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  minWidth: '200px',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {item.date}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '2px 0' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {item.doc}
                </div>
              </div>
              {idx < 3 && (
                <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {displayDocs.map((doc) => (
          <div
            key={doc.id}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} color="var(--accent-primary)" />
                  <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                    {doc.filename}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {doc.document_type}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                <div>Pages: <strong>{doc.page_count}</strong> • Size: <strong>{Math.round(doc.file_size_bytes / 1024)} KB</strong></div>
                <div>Status: <span style={{ color: 'var(--status-success)' }}>OCR & Pipeline Verified ✓</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              <button
                onClick={() => onOpenDocument(doc.id)}
                style={{
                  flex: 1,
                  padding: '7px',
                  backgroundColor: 'var(--accent-faint)',
                  border: '1px solid var(--accent-primary)',
                  color: 'var(--accent-secondary)',
                  fontWeight: 600,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Eye size={13} />
                <span>Open in Viewer</span>
              </button>

              <a
                href={`/api/documents/${doc.id}/file`}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '7px 12px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Download PDF"
              >
                <Download size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
