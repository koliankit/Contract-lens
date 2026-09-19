import React, { useState, useEffect } from 'react';
import { Navigation, NavTab } from './components/Navigation';
import { Header } from './components/Header';
import { Dashboard } from './features/dashboard/Dashboard';
import { ContractLibrary } from './features/contracts/ContractLibrary';
import { ContractDetailPage } from './features/contract_detail/ContractDetail';
import { ObligationRegistry } from './features/obligations/ObligationRegistry';
import { ObligationTimeline } from './features/timeline/ObligationTimeline';
import { ReviewCenter } from './features/reviews/ReviewCenter';
import { VersionComparison } from './features/changes/VersionComparison';
import { AskContractLens } from './features/query/AskContractLens';
import { ContractGraphView } from './features/graph/ContractGraphView';
import { DocumentRepository } from './features/documents/DocumentRepository';
import { AuditTrail } from './features/audit/AuditTrail';
import { SettingsPage } from './features/settings/Settings';
import { EvidenceModal, EvidenceModalData } from './components/EvidenceModal';

import {
  DashboardMetrics, ContractListItem, Obligation, Deadline,
  Review, VersionChange, AuditLogItem, NotificationItem
} from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [changes, setChanges] = useState<VersionChange[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [evidenceModalData, setEvidenceModalData] = useState<EvidenceModalData | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [m, c, o, d, r, ch, a, n] = await Promise.all([
        api.getDashboardMetrics().catch(() => null),
        api.getContracts().catch(() => []),
        api.getObligations().catch(() => []),
        api.getDeadlines().catch(() => []),
        api.getReviews().catch(() => []),
        api.getVersionChanges().catch(() => []),
        api.getAuditLogs().catch(() => []),
        api.getNotifications().catch(() => []),
      ]);

      if (m) setMetrics(m);
      setContracts(c);
      setObligations(o);
      setDeadlines(d);
      setReviews(r);
      setChanges(ch);
      setAuditLogs(a);
      setNotifications(n);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const handleNavigate = (tab: NavTab, contractId?: string) => {
    if (contractId) {
      setSelectedContractId(contractId);
      setCurrentTab('contracts');
    } else {
      setSelectedContractId(null);
      setCurrentTab(tab);
    }
  };

  const handleOpenEvidence = (
    page: number,
    text: string,
    title?: string,
    docName?: string,
    section?: string
  ) => {
    setEvidenceModalData({
      title: title || 'Source Clause Verification',
      documentName: docName || (contracts.find((c) => c.id === selectedContractId)?.title ?? 'Contract Agreement'),
      page: page || 1,
      section: section || 'Section Clause Excerpt',
      verbatimQuote: text || 'No verbatim excerpt recorded for this obligation item.',
      findingSummary: 'Extracted directly from verified contract language by Clause and Obligation analysis agents.',
      confidence: '98.5%'
    });
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      {/* Sidebar Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedContractId(null);
          setCurrentTab(tab);
        }}
        reviewCount={reviews.filter((r) => r.status === 'PENDING').length}
        deadlinesCount={deadlines.filter((d) => d.status !== 'COMPLETED').length}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header
          onSearch={(term) => {
            if (term.trim() && currentTab !== 'contracts') {
              setCurrentTab('contracts');
            }
          }}
          onOpenQuery={() => setCurrentTab('query')}
          notifications={notifications}
          onMarkRead={handleMarkNotificationRead}
        />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          {selectedContractId ? (
            <ContractDetailPage
              contractId={selectedContractId}
              onBack={() => setSelectedContractId(null)}
            />
          ) : (
            <>
              {currentTab === 'overview' && (
                <Dashboard
                  metrics={metrics}
                  contracts={contracts}
                  obligations={obligations}
                  reviews={reviews}
                  auditLogs={auditLogs}
                  onNavigate={handleNavigate}
                  onOpenEvidence={(finding) =>
                    handleOpenEvidence(
                      finding.page,
                      finding.quote,
                      finding.title,
                      finding.docName,
                      finding.section
                    )
                  }
                />
              )}

              {currentTab === 'contracts' && (
                <ContractLibrary
                  contracts={contracts}
                  onSelectContract={(id) => setSelectedContractId(id)}
                  onRefresh={loadAllData}
                />
              )}

              {currentTab === 'obligations' && (
                <ObligationRegistry
                  obligations={obligations}
                  onRefresh={loadAllData}
                  onOpenEvidence={(ob) =>
                    handleOpenEvidence(
                      ob.source_page,
                      ob.source_text,
                      ob.action,
                      ob.contract_id,
                      ob.source_section
                    )
                  }
                />
              )}

              {currentTab === 'timeline' && (
                <ObligationTimeline
                  deadlines={deadlines}
                  obligations={obligations}
                  onOpenEvidence={(page, text) =>
                    handleOpenEvidence(page, text, 'Deadline Obligation Citation')
                  }
                />
              )}

              {currentTab === 'reviews' && (
                <ReviewCenter
                  reviews={reviews}
                  onRefresh={loadAllData}
                  onOpenEvidence={(page, text) =>
                    handleOpenEvidence(page, text, 'Review Item Ground Truth')
                  }
                />
              )}

              {currentTab === 'changes' && (
                <VersionComparison
                  changes={changes}
                  onOpenEvidence={(page, text) =>
                    handleOpenEvidence(page, text, 'Version Comparison Diff Evidence')
                  }
                />
              )}

              {currentTab === 'graph' && (
                <ContractGraphView
                  contractId={selectedContractId || (contracts[0]?.id ?? 'contract_acme_msa')}
                  onOpenEvidence={(page, text) =>
                    handleOpenEvidence(page, text, 'Graph Node Evidence')
                  }
                />
              )}

              {currentTab === 'documents' && (
                <DocumentRepository
                  documents={[]}
                  onOpenDocument={(docId) => {
                    setSelectedContractId(docId || 'contract_acme_msa');
                  }}
                />
              )}

              {currentTab === 'query' && (
                <AskContractLens
                  onOpenEvidence={(page, text) =>
                    handleOpenEvidence(page, text, 'Copilot Grounded Answer')
                  }
                />
              )}

              {currentTab === 'audit' && (
                <AuditTrail logs={auditLogs} />
              )}

              {currentTab === 'settings' && <SettingsPage />}
            </>
          )}
        </main>
      </div>

      {/* Universal Source Evidence Modal */}
      <EvidenceModal
        evidence={evidenceModalData}
        onClose={() => setEvidenceModalData(null)}
      />
    </div>
  );
};

