import React, { useState } from 'react';
import { X, ShieldCheck, Layers, Cpu, Share2, CheckCircle2, FileText, ArrowRight, Eye } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'ascii'>('visual');

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(6px)',
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
          maxWidth: '960px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-faint)',
                border: '1px solid var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
              }}
            >
              <Cpu size={18} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                ContractLens Agent Architecture
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                AI Contract Intelligence & Obligation Management Agent • "From Contracts to Actions"
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', padding: '2px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setActiveTab('visual')}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'visual' ? 'var(--bg-elevated)' : 'transparent',
                  color: activeTab === 'visual' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                }}
              >
                Interactive Flow
              </button>
              <button
                onClick={() => setActiveTab('ascii')}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'ascii' ? 'var(--bg-elevated)' : 'transparent',
                  color: activeTab === 'ascii' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                }}
              >
                System Blueprint
              </button>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* Motto Banner */}
          <div
            style={{
              padding: '12px 18px',
              backgroundColor: 'var(--accent-faint)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '11px',
              letterSpacing: '0.04em',
              fontWeight: 600,
              color: 'var(--accent-secondary)',
              textTransform: 'uppercase',
            }}
          >
            <span>Contract</span> → <span>Understand</span> → <span>Extract</span> → <span>Calculate</span> → <span>Compare</span> → <span>Verify</span> → <span>Review</span> → <span>Act</span> → <span>Monitor</span> → <span>Audit</span>
          </div>

          {activeTab === 'visual' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Layer 1: Ingestion */}
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>1. Document Ingestion</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  PDF / DOCX / Scanned PDF / Amendments / Multiple Versions
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  File Validation + OCR + Text Extraction &rarr; Document Structure Detection (Pages → Sections → Tables → Paragraphs)
                </div>
              </div>

              {/* Layer 2: Intelligence Layer */}
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>2. AI Intelligence Layer</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '10px' }}>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>Document Agent</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>Parties, Sections, Tables, Definitions, Metadata</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>Clause Agent</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>Payment, Renewal, Termination, SLA, Security</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>Obligation Agent</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>Who, Must do what, When, Frequency, Dependency</div>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>Deadline Engine</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>Fixed Dates, Business Days, Relative Dates, Renewal Windows</div>
                  </div>
                </div>
              </div>

              {/* Layer 3 & 4: Graph & Verification */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>3. Contract Intelligence Graph</span>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Topological relationship mapping: Contract → Party, Clause, Version → Obligation, Change Detected → Deadline, Owner.
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>4. Verification & Risk Engine</span>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Schema Validation → Source Grounding → Date Validation → Conflict Detection → Verified vs Human Review Center.
                  </div>
                </div>
              </div>

              {/* Layer 5 & 6: Evidence & Action */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>5. Evidence-First Output</span>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Every finding anchors directly to source: AI Insight → Document → Page → Section → Highlighted Text.
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>6. Action & Monitoring</span>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Verified Obligations → Timeline → Owner Assignment → Reminders → Alerts → Audit Trail Ledger.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <pre
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-base)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                overflowX: 'auto',
                lineHeight: '1.4',
                border: '1px solid var(--border-color)',
              }}
            >
{`                                      CONTRACTLENS
                    AI CONTRACT INTELLIGENCE & OBLIGATION MANAGEMENT AGENT
                                      "From Contracts to Actions"
                                             │
                                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      1. DOCUMENT INGESTION                                                   │
│   PDF / DOCX / SCANNED PDF / AMENDMENTS / ADDENDUMS / MULTIPLE VERSIONS                                      │
│                                             │                                                                │
│                                             ▼                                                                │
│                              File Validation + OCR + Text Extraction                                         │
│                                             │                                                                │
│                                             ▼                                                                │
│                               Document Structure Detection                                                   │
│                         Pages → Sections → Tables → Paragraphs                                               │
└──────────────────────────────────────────────────────┬───────────────────────────────────────────────────────┘
                                                       │
                                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      2. AI INTELLIGENCE LAYER                                                │
│                                                                                                              │
│   ┌─────────────────┐   ┌─────────────────┐   ┌──────────────────┐   ┌──────────────────┐                │
│   │ DOCUMENT AGENT  │ → │  CLAUSE AGENT   │ → │ OBLIGATION AGENT │ → │  DEADLINE ENGINE  │                │
│   │                 │   │                 │   │                  │   │                  │                │
│   │ Parties         │   │ Payment         │   │ Who              │   │ Fixed Dates      │                │
│   │ Sections        │   │ Renewal         │   │ Must do what     │   │ Business Days    │                │
│   │ Tables          │   │ Termination     │   │ When             │   │ Relative Dates   │                │
│   │ Definitions     │   │ SLA             │   │ Frequency        │   │ Renewal Windows  │                │
│   │ Metadata        │   │ Security        │   │ Dependency       │   │ Event Triggers   │                │
│   └─────────────────┘   └─────────────────┘   └──────────────────┘   └──────────────────┘                │
│                                                                                                              │
│                          ┌──────────────────────┐       ┌──────────────────────┐                            │
│                          │ VERSION INTELLIGENCE │       │    QUERY AGENT       │                            │
│                          │                      │       │                      │                            │
│                          │ V1 ↔ V2 Comparison   │       │ Natural Language     │                            │
│                          │ Semantic Changes     │       │ Contract Questions   │                            │
│                          │ Material Changes     │       │ Evidence-Based       │                            │
│                          └──────────────────────┘       └──────────────────────┘                            │
└──────────────────────────────────────────────────────┬───────────────────────────────────────────────────────┘
                                                       │
                                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      3. CONTRACT INTELLIGENCE GRAPH                                          │
│                                                                                                              │
│                         CONTRACT                                                                            │
│                            │                                                                                 │
│              ┌─────────────┼─────────────┐                                                                   │
│              ▼             ▼             ▼                                                                   │
│            PARTY         CLAUSE       VERSION                                                                │
│              │             │             │                                                                   │
│              │             ▼             ▼                                                                   │
│              │        OBLIGATION    CHANGE DETECTED                                                          │
│              │             │                                                                                 │
│              │             ▼                                                                                 │
│              │         DEADLINE ─────────────── OWNER                                                        │
│              │                                                                                               │
│              └────────────────────── RELATIONSHIPS / DEPENDENCIES                                            │
└──────────────────────────────────────────────────────┬───────────────────────────────────────────────────────┘
                                                       │
                                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      4. VERIFICATION & RISK ENGINE                                           │
│                                                                                                              │
│       AI EXTRACTION → SCHEMA VALIDATION → SOURCE VERIFICATION → DATE VALIDATION → CONFLICT DETECTION         │
│                                                                                                              │
│                                      │                                                                       │
│                         ┌────────────┴────────────┐                                                          │
│                         ▼                         ▼                                                          │
│                  ✓ VERIFIED                ⚠ REVIEW REQUIRED                                                 │
│                         │                         │                                                          │
│                         │              Ambiguous Clause                                                      │
│                         │              Conflicting Version                                                   │
│                         │              Unclear Responsibility                                                │
│                         │              Missing Evidence                                                      │
│                         │              Calculation Issue                                                     │
│                         │                         │                                                          │
│                         │                         ▼                                                          │
│                         │                  HUMAN REVIEW CENTER                                               │
│                         │            Confirm / Correct / Reject / Comment                                    │
│                         │                         │                                                          │
│                         └─────────────────────────┘                                                          │
└──────────────────────────────────────────────────────┬───────────────────────────────────────────────────────┘
                                                       │
                                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      5. EVIDENCE-FIRST OUTPUT                                                │
│                                                                                                              │
│     AI INSIGHT ─────────→ SOURCE DOCUMENT ─────────→ PAGE ─────────→ SECTION ─────────→ EXACT TEXT           │
│                                                                                                              │
│     Example: 17 Oct 2026 Renewal Deadline → ACME_MSA_v2.pdf → Page 19 → Section 8.2 → Highlighted Text      │
└──────────────────────────────────────────────────────┬───────────────────────────────────────────────────────┘
                                                       │
                                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      6. ACTION & MONITORING                                                  │
│                                                                                                              │
│     VERIFIED OBLIGATIONS → TIMELINE → OWNER ASSIGNMENT → REMINDERS → ALERTS → STATUS → COMPLETION            │
│                                                                                                              │
│                                      │                                                                       │
│                                      ▼                                                                       │
│                              CONTRACT DASHBOARD                                                              │
│                                                                                                              │
│        Contracts │ Obligations │ Deadlines │ Renewals │ Reviews │ Version Changes │ Graph │ Audit Trail      │
└──────────────────────────────────────────────────────┬───────────────────────────────────────────────────────┘
                                                       │
                                                       ▼
                                      ┌───────────────────────────────┐
                                      │          AUDIT TRAIL          │
                                      │                               │
                                      │ AI Action → Evidence →        │
                                      │ Human Decision → Final State  │
                                      └───────────────────────────────┘`}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
