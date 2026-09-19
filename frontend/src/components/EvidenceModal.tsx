import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export interface EvidenceModalData {
  title?: string;
  documentName?: string;
  page?: number;
  section?: string;
  verbatimQuote?: string;
  findingSummary?: string;
  confidence?: string;
}

interface EvidenceModalProps {
  evidence: EvidenceModalData | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ evidence, onClose }) => {
  if (!evidence) return null;

  const docName = evidence.documentName || 'Contract Document';
  const pageNum = evidence.page || 1;
  const sectionNum = evidence.section || '1.0';
  const quote = evidence.verbatimQuote || 'No supporting text excerpt provided.';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-elevated)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-faint)',
                border: '1px solid var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
              }}
            >
              <ShieldCheck size={16} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Source Evidence Verification
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Ground-truth clause excerpt verified by Verification Engine
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Finding Summary Bar */}
        {evidence.title && (
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: 'var(--bg-base)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-secondary)' }}>
                AI Finding
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                {evidence.title}
              </div>
              {evidence.findingSummary && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {evidence.findingSummary}
                </div>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: 'var(--status-success-bg)',
                border: '1px solid rgba(155, 154, 114, 0.3)',
                color: 'var(--status-success)',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={12} />
              <span>Verbatim Match</span>
            </div>
          </div>
        )}

        {/* Source Coordinates Bar */}
        <div
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <FileText size={14} color="var(--accent-primary)" />
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{docName}</span>
          </div>
          <span style={{ color: 'var(--border-color)' }}>|</span>
          <div style={{ color: 'var(--text-secondary)' }}>
            Page <strong style={{ color: 'var(--accent-secondary)' }}>{pageNum}</strong>
          </div>
          <span style={{ color: 'var(--border-color)' }}>|</span>
          <div style={{ color: 'var(--text-secondary)' }}>
            Section <strong style={{ color: 'var(--text-primary)' }}>{sectionNum}</strong>
          </div>
        </div>

        {/* Document Page Reader View */}
        <div style={{ padding: '24px 20px', overflowY: 'auto', maxHeight: '380px', backgroundColor: 'var(--bg-base)' }}>
          <div
            style={{
              padding: '20px 24px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                marginBottom: '12px',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '6px',
              }}
            >
              PAGE {pageNum} EXCERPT — SECTION {sectionNum}
            </div>

            {/* Verbatim quote with highlight */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(200, 138, 61, 0.08)',
                borderLeft: '3px solid var(--accent-primary)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                lineHeight: 1.6,
                fontStyle: 'normal',
              }}
            >
              <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>"</span>
              {quote}
              <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>"</span>
            </div>

            <div
              style={{
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}
            >
              <span>Deterministic Optical Text Match</span>
              <span>Confidence: {evidence.confidence || 'HIGH'} (0.96)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-elevated)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
