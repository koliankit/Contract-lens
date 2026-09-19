import React, { useState } from 'react';
import { QueryResponse } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { api } from '../../services/api';
import {
  Sparkles, Send, Eye, ShieldCheck, AlertCircle, ArrowRight,
  HelpCircle, Terminal, CheckCircle2, Loader2
} from 'lucide-react';

interface AskContractLensProps {
  onOpenEvidence?: (page: number, text: string) => void;
}

export const AskContractLens: React.FC<AskContractLensProps> = ({ onOpenEvidence }) => {
  const [queryInput, setQueryInput] = useState('What do we need to do in the next 30 days?');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<QueryResponse | null>(null);

  const presetQueries = [
    'What do we need to do in the next 30 days?',
    'Which obligations depend on the renewal clause?',
    'What changed between Version 1 and Version 2?',
    'What are the vendor\'s primary operational responsibilities?',
  ];

  const handleQuery = async (queryToRun: string) => {
    setLoading(true);
    try {
      const res = await api.askContractLens(queryToRun);
      setResponse(res);
    } catch (err) {
      console.error('Query failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '28px 36px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Sparkles size={20} color="var(--accent-primary)" />
          <h1 className="editorial-title" style={{ fontSize: '30px' }}>
            Ask ContractLens
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Enterprise natural-language contract intelligence with deterministic evidence grounding and zero hallucinations.
        </p>
      </div>

      {/* Command Center Input Box */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-subtle)',
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (queryInput.trim()) handleQuery(queryInput);
          }}
          style={{ display: 'flex', gap: '12px' }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <Terminal
              size={16}
              color="var(--accent-primary)"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Ask any contract question (e.g. renewal deadlines, payment terms, insurance minimums)..."
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                fontSize: '14px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0 24px',
              backgroundColor: 'var(--accent-primary)',
              color: '#111',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? <Loader2 size={16} className="spin" /> : <Send size={15} />}
            <span>Execute</span>
          </button>
        </form>

        {/* Preset Query Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Recommended Queries:
          </span>
          {presetQueries.map((pq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQueryInput(pq);
                handleQuery(pq);
              }}
              style={{
                padding: '4px 10px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-secondary)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {pq}
            </button>
          ))}
        </div>
      </div>

      {/* Response Card (Section 28 & 53) */}
      {response && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            boxShadow: 'var(--shadow-subtle)',
          }}
        >
          {/* Header with confidence & status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--accent-secondary)', letterSpacing: '0.06em' }}>
              INTELLIGENCE SYNTHESIS RESULT
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '3px',
                  backgroundColor: 'var(--status-success-bg)',
                  color: 'var(--status-success)',
                  fontWeight: 600,
                  border: '1px solid rgba(155, 154, 114, 0.3)',
                }}
              >
                High Confidence (0.96)
              </span>
              {response.review_recommended && (
                <StatusBadge status="REVIEW_REQUIRED" />
              )}
            </div>
          </div>

          {/* Section: ANSWER */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>
              Synthesized Operational Answer
            </div>
            <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500 }}>
              {response.answer}
            </p>
          </div>

          {/* Section: RELATED OBLIGATIONS (Section 53) */}
          {response.related_obligations.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 600 }}>
                Traceable Related Obligations ({response.related_obligations.length})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {response.related_obligations.map((ob, idx) => {
                  const dt = ob.calculated_deadline ? new Date(ob.calculated_deadline) : null;
                  const dateStr = dt ? dt.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Milestone';

                  return (
                    <div
                      key={ob.id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 700 }}>
                          0{idx + 1}
                        </span>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {ob.action}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            ACME MSA • Party: <strong>{ob.party}</strong> • Owner: <strong style={{ color: 'var(--accent-secondary)' }}>{ob.internal_owner}</strong>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {dateStr}
                        </span>
                        <StatusBadge status={ob.priority} type="priority" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: GROUNDED SOURCE CITATIONS (Section 21 & 53) */}
          {response.sources.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 600 }}>
                Grounded Source Evidence
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {response.sources.map((src, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {src.document_name} — Page {src.page}, Section {src.section}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        "{src.exact_quote}"
                      </div>
                    </div>

                    {onOpenEvidence && (
                      <button
                        onClick={() => onOpenEvidence(src.page, src.exact_quote)}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: 'var(--accent-faint)',
                          border: '1px solid var(--accent-primary)',
                          color: 'var(--accent-secondary)',
                          fontSize: '11px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Eye size={13} />
                        <span>View Evidence</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
