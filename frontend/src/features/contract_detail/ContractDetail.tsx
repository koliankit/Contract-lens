import React, { useState, useEffect } from 'react';
import { ContractDetail, Clause, Obligation, VersionChange } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { api } from '../../services/api';
import {
  FileText, ArrowLeft, Eye, CheckCircle, AlertCircle,
  Calendar, Layers, GitCompare, Share2, Search, ZoomIn, ZoomOut
} from 'lucide-react';

interface ContractDetailProps {
  contractId: string;
  onBack: () => void;
  highlightClauseId?: string;
}

export const ContractDetailPage: React.FC<ContractDetailProps> = ({
  contractId,
  onBack,
  highlightClauseId,
}) => {
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'clauses' | 'obligations' | 'changes' | 'graph'>('overview');
  const [activePage, setActivePage] = useState(5); // Default to Page 5 (where Section 12.2 Renewal Notice is!)
  const [pagesData, setPagesData] = useState<any[]>([]);
  const [highlightedText, setHighlightedText] = useState<string>(
    'Either party may terminate this Agreement or prevent automatic renewal by providing at least ninety (90) days prior written notice before the expiration of the Initial Term.'
  );
  const [selectedObligation, setSelectedObligation] = useState<Obligation | null>(null);
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);

  useEffect(() => {
    loadContract();
  }, [contractId]);

  const loadContract = async () => {
    try {
      const data = await api.getContractDetail(contractId);
      setContract(data);
      if (data.obligations.length > 0) {
        setSelectedObligation(data.obligations[0]);
      }
      if (data.clauses.length > 0) {
        setSelectedClause(data.clauses[1]); // Renewal clause
      }

      // Load document pages for v2
      const pagesRes = await api.getDocumentPages('doc_acme_v2');
      if (pagesRes && pagesRes.pages) {
        setPagesData(pagesRes.pages);
      }
    } catch (err) {
      console.error('Failed to load contract:', err);
    }
  };

  const handleViewEvidence = (page: number, text: string) => {
    setActivePage(page);
    setHighlightedText(text);
  };

  if (!contract) {
    return (
      <div style={{ padding: '40px', color: 'var(--text-secondary)', textAlign: 'center' }}>
        Loading contract intelligence details...
      </div>
    );
  }

  const currentPageObj = pagesData.find((p) => p.page_number === activePage) || pagesData[activePage - 1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      {/* Top Contract Header (Section 25) */}
      <div
        style={{
          padding: '14px 24px',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ArrowLeft size={14} />
            <span>Contracts</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
                {contract.title}
              </h1>
              <StatusBadge status={contract.status} />
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '3px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                }}
              >
                {contract.contract_type}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              <span>Counterparty: <strong style={{ color: 'var(--text-primary)' }}>{contract.counterparty}</strong></span>
              <span style={{ margin: '0 8px' }}>•</span>
              <span>Term: 15 Jan 2026 → 15 Jan 2027</span>
              <span style={{ margin: '0 8px' }}>•</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Renewal Deadline: 17 Oct 2026 (90 days)</span>
            </div>
          </div>
        </div>

        {/* Intelligence Tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['overview', 'clauses', 'obligations', 'changes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 14px',
                backgroundColor: activeTab === tab ? 'var(--bg-elevated)' : 'transparent',
                color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
                border: activeTab === tab ? '1px solid var(--border-color)' : '1px solid transparent',
                fontWeight: activeTab === tab ? 600 : 500,
                textTransform: 'capitalize',
                fontSize: '12px',
              }}
            >
              {tab === 'changes' ? 'Version Changes (4)' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Split-Pane Main Interface (Section 25) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', flex: 1, overflow: 'hidden' }}>
        {/* Left Pane: Interactive Document Viewer with Highlighted Evidence (Section 21 & 91) */}
        <div
          style={{
            borderRight: '1px solid var(--border-color)',
            backgroundColor: '#0E0E0E',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Document Viewer Toolbar */}
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={15} color="var(--accent-secondary)" />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                ACME_MSA_v2.pdf
              </span>
              <span
                style={{
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  backgroundColor: 'var(--status-success-bg)',
                  color: 'var(--status-success)',
                  border: '1px solid rgba(155, 154, 114, 0.3)',
                }}
              >
                Source Verified ✓
              </span>
            </div>

            {/* Page Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Page</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5, 6].map((p) => (
                  <button
                    key={p}
                    onClick={() => setActivePage(p)}
                    style={{
                      padding: '2px 7px',
                      fontSize: '11px',
                      backgroundColor: activePage === p ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                      color: activePage === p ? '#111' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      fontWeight: activePage === p ? 700 : 500,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Document Page Reader Body */}
          <div
            style={{
              flex: 1,
              padding: '36px',
              overflowY: 'auto',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {/* White/Ivory Document Sheet */}
            <div
              style={{
                width: '100%',
                maxWidth: '620px',
                backgroundColor: '#1E1E1E',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
                padding: '40px 48px',
                color: '#ECE5D8',
                fontFamily: 'Georgia, serif',
                fontSize: '13px',
                lineHeight: 1.8,
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#8A8275',
                  marginBottom: '20px',
                  borderBottom: '1px solid #333',
                  paddingBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>ACME Software Agreement — Version 2.0</span>
                <span>Page {activePage} of 6</span>
              </div>

              {currentPageObj ? (
                <div>
                  <h3 style={{ fontSize: '15px', color: '#F4F0E8', marginBottom: '14px', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                    {currentPageObj.title}
                  </h3>
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {/* Render text with gold evidence highlight if matching */}
                    {renderPageWithHighlight(currentPageObj.content, highlightedText)}
                  </div>
                </div>
              ) : (
                <div>Loading page content...</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Pane: AI Intelligence (Section 25) */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '24px',
          }}
        >
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Executive Renewal Alert Box */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--accent-primary)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} color="var(--accent-primary)" />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-primary)' }}>
                      Critical Renewal Window Detected
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      backgroundColor: 'var(--status-critical-bg)',
                      color: 'var(--status-critical)',
                      fontWeight: 700,
                    }}
                  >
                    Action Required
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '10px', lineHeight: 1.5 }}>
                  The contract specifies a <strong>90-day written notice</strong> requirement prior to the expiration date of <strong>15 January 2027</strong>.
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Calculated Notice Deadline
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                      17 October 2026
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewEvidence(
                      5,
                      'Either party may terminate this Agreement or prevent automatic renewal by providing at least ninety (90) days prior written notice before the expiration of the Initial Term.'
                    )}
                    style={{
                      padding: '7px 12px',
                      backgroundColor: 'var(--accent-faint)',
                      color: 'var(--accent-secondary)',
                      border: '1px solid var(--accent-primary)',
                      fontWeight: 600,
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Eye size={13} />
                    <span>View Evidence (p.5)</span>
                  </button>
                </div>
              </div>

              {/* Summary Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TOTAL CLAUSES</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{contract.clauses.length}</div>
                </div>
                <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>OBLIGATIONS</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{contract.obligations.length}</div>
                </div>
                <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>OPEN REVIEWS</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--status-warning)' }}>
                    {contract.reviews.filter((r) => r.status === 'PENDING').length}
                  </div>
                </div>
              </div>

              {/* Key Obligations Highlight */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>Key Operational Commitments</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {contract.obligations.slice(0, 4).map((ob) => (
                    <div
                      key={ob.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{ob.action}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Owner: <strong style={{ color: 'var(--accent-secondary)' }}>{ob.internal_owner}</strong> • Rule: {ob.deadline_rule}
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewEvidence(ob.source_page, ob.source_text)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--accent-secondary)',
                          fontSize: '11px',
                        }}
                      >
                        Evidence
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLAUSES */}
          {activeTab === 'clauses' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Showing {contract.clauses.length} structured clauses across 25+ standard categories:
              </div>
              {contract.clauses.map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '3px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--accent-secondary)' }}>
                        §{c.section_number}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{c.title}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <StatusBadge status={c.clause_type} />
                      <StatusBadge status={c.risk_level} type="risk" />
                    </div>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
                    "{c.source_text}"
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Page {c.page_number} • High Confidence</span>
                    <button
                      onClick={() => handleViewEvidence(c.page_number, c.source_text)}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--accent-secondary)',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      View Evidence
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: OBLIGATIONS */}
          {activeTab === 'obligations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Showing {contract.obligations.length} operational obligations assigned to parties and teams:
              </div>
              {contract.obligations.map((ob) => (
                <div
                  key={ob.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{ob.action}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Party: <strong style={{ color: 'var(--text-primary)' }}>{ob.party}</strong> • Internal Owner: <strong style={{ color: 'var(--accent-secondary)' }}>{ob.internal_owner}</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <StatusBadge status={ob.obligation_type} />
                      <StatusBadge status={ob.priority} type="priority" />
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '11px',
                      marginBottom: '10px',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>Deterministic Rule: </span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{ob.deadline_rule}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Page {ob.source_page} (§{ob.source_section})</span>
                    <button
                      onClick={() => handleViewEvidence(ob.source_page, ob.source_text)}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--accent-secondary)',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      View Evidence
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: VERSION CHANGES */}
          {activeTab === 'changes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Semantic comparison between Version 1 (2025) and Version 2 (2026):
              </div>
              {contract.version_changes.map((vc) => (
                <div
                  key={vc.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{vc.clause_title}</span>
                    <StatusBadge status={vc.change_category} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ padding: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', fontSize: '11px' }}>
                      <div style={{ color: 'var(--text-muted)', marginBottom: '2px', fontWeight: 600 }}>VERSION 1</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{vc.previous_language}</div>
                    </div>
                    <div style={{ padding: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--accent-faint)', fontSize: '11px' }}>
                      <div style={{ color: 'var(--accent-primary)', marginBottom: '2px', fontWeight: 600 }}>VERSION 2 (CURRENT)</div>
                      <div style={{ color: 'var(--text-primary)' }}>{vc.current_language}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <strong>Impact:</strong> {vc.change_summary}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{vc.page_reference}</span>
                    <button
                      onClick={() => handleViewEvidence(5, vc.current_language)}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--accent-secondary)',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      View Evidence
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper: Highlights evidence substring in document page text with warm amber/gold background
function renderPageWithHighlight(fullText: string, targetQuote: string) {
  if (!targetQuote || !fullText) return <span>{fullText}</span>;

  // Clean and find key tokens
  const snippet = targetQuote.slice(0, 50).trim();
  const idx = fullText.indexOf(snippet);

  if (idx !== -1) {
    const before = fullText.slice(0, idx);
    const match = fullText.slice(idx, idx + targetQuote.length);
    const after = fullText.slice(idx + targetQuote.length);

    return (
      <span>
        {before}
        <mark
          style={{
            backgroundColor: '#C88A3D',
            color: '#111',
            padding: '2px 4px',
            borderRadius: '2px',
            fontWeight: 600,
          }}
        >
          {match || snippet}
        </mark>
        {after}
      </span>
    );
  }

  return <span>{fullText}</span>;
}
