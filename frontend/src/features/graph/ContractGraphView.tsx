import React, { useState, useEffect } from 'react';
import { ContractGraph, GraphNode } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { Share2, Search, Filter, Layers, Info, CheckCircle2 } from 'lucide-react';

interface ContractGraphViewProps {
  contractId: string;
  onOpenEvidence?: (page: number, text: string) => void;
}

export const ContractGraphView: React.FC<ContractGraphViewProps> = ({
  contractId,
  onOpenEvidence,
}) => {
  const [graphData, setGraphData] = useState<ContractGraph | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [queryInput, setQueryInput] = useState('Which obligations depend on the renewal clause?');
  const [highlightNodeIds, setHighlightNodeIds] = useState<string[]>([]);
  const [queryAnswer, setQueryAnswer] = useState<string | null>(null);
  const [filterGroup, setFilterGroup] = useState<string>('ALL');

  useEffect(() => {
    loadGraph();
  }, [contractId]);

  const loadGraph = async () => {
    try {
      const data = await api.getContractGraph(contractId);
      setGraphData(data);
      if (data.nodes.length > 0) {
        // Select renewal node or root by default
        const renewalNode = data.nodes.find((n) => n.label.toLowerCase().includes('renewal')) || data.nodes[0];
        setSelectedNode(renewalNode);
      }
    } catch (err) {
      console.error('Failed to load contract graph:', err);
    }
  };

  const handleRunGraphQuery = async (q: string) => {
    try {
      const res = await api.queryGraph(contractId, q);
      setHighlightNodeIds(res.highlight_node_ids || []);
      setQueryAnswer(res.answer);
    } catch (err) {
      console.error('Graph query failed:', err);
    }
  };

  if (!graphData) {
    return <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Loading contract graph...</div>;
  }

  // Node position layout algorithm (Hierarchical Tree Simulation)
  const groupOrder = ['contract', 'party', 'clause', 'obligation', 'deadline', 'owner', 'review'];
  const nodeLevels: Record<string, GraphNode[]> = {};
  groupOrder.forEach((g) => { nodeLevels[g] = []; });

  graphData.nodes.forEach((n) => {
    if (filterGroup === 'ALL' || n.group === filterGroup) {
      if (!nodeLevels[n.group]) nodeLevels[n.group] = [];
      nodeLevels[n.group].push(n);
    }
  });

  return (
    <div style={{ padding: '28px 36px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 className="editorial-title" style={{ fontSize: '30px', marginBottom: '4px' }}>
          Contract Relationship Graph
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Interactive topological graph mapping contractual clauses to obligations, owners, deadlines, and reviews.
        </p>
      </div>

      {/* Graph Query Bar (Section 14 & 42) */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: 'var(--shadow-subtle)',
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Ask topological questions: 'Which obligations depend on renewal?', 'What deadlines originate here?'"
            style={{ flex: 1 }}
          />
          <button
            onClick={() => handleRunGraphQuery(queryInput)}
            style={{
              padding: '8px 18px',
              backgroundColor: 'var(--accent-primary)',
              color: '#111',
              border: 'none',
              fontWeight: 600,
            }}
          >
            Query Graph
          </button>
        </div>

        {queryAnswer && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--accent-faint)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} color="var(--accent-primary)" />
            <span>{queryAnswer}</span>
          </div>
        )}
      </div>

      {/* Main Canvas & Inspector Pane */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Left: SVG Canvas */}
        <div
          style={{
            backgroundColor: '#0E0E0E',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            minHeight: '520px',
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Interactive Topology • {graphData.nodes.length} Nodes • {graphData.edges.length} Edges
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['ALL', 'clause', 'obligation', 'deadline', 'owner'].map((grp) => (
                <button
                  key={grp}
                  onClick={() => setFilterGroup(grp)}
                  style={{
                    padding: '3px 8px',
                    fontSize: '10px',
                    borderRadius: '3px',
                    backgroundColor: filterGroup === grp ? 'var(--bg-elevated)' : 'transparent',
                    color: filterGroup === grp ? 'var(--accent-primary)' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {grp.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Node columns rendering */}
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
            {Object.entries(nodeLevels).map(([groupKey, nodes]) => {
              if (nodes.length === 0) return null;
              return (
                <div key={groupKey} style={{ minWidth: '170px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-secondary)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px', marginBottom: '4px' }}>
                    {groupKey} ({nodes.length})
                  </div>
                  {nodes.map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    const isHighlighted = highlightNodeIds.includes(node.id);

                    let nodeColor = 'var(--text-secondary)';
                    let borderColor = 'var(--border-color)';
                    if (isSelected) {
                      borderColor = 'var(--accent-primary)';
                      nodeColor = 'var(--text-primary)';
                    } else if (isHighlighted) {
                      borderColor = 'var(--status-warning)';
                    }

                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        style={{
                          padding: '10px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isSelected ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                          border: `1px solid ${borderColor}`,
                          cursor: 'pointer',
                          boxShadow: isHighlighted ? '0 0 10px rgba(200, 138, 61, 0.25)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          {node.type}
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: nodeColor, marginTop: '2px' }}>
                          {node.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Node Detail Inspector (Section 42) */}
        {selectedNode && (
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              height: 'fit-content',
              position: 'sticky',
              top: '80px',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-secondary)', textTransform: 'uppercase' }}>
                NODE INSPECTOR ({selectedNode.type})
              </span>
              <StatusBadge status={selectedNode.group} />
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
              {selectedNode.label}
            </h3>

            {/* Metadata Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', marginBottom: '16px' }}>
              {Object.entries(selectedNode.metadata).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{String(v)}</strong>
                </div>
              ))}
            </div>

            {/* Example Section 42 Renewal Detail */}
            {selectedNode.label.toLowerCase().includes('renewal') && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--accent-faint)',
                  fontSize: '12px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '4px' }}>
                  Clause §12.2 Traversal
                </div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Notice: 90 calendar days<br />
                  Contract Expiration: 15 Jan 2027<br />
                  Calculated Deadline: <strong>17 Oct 2026</strong><br />
                  Affected Obligation: Non-Renewal Notice (Procurement)
                </div>
              </div>
            )}

            {onOpenEvidence && selectedNode.metadata.page && (
              <button
                onClick={() => onOpenEvidence(selectedNode.metadata.page, selectedNode.label)}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: 'var(--accent-faint)',
                  border: '1px solid var(--accent-primary)',
                  color: 'var(--accent-secondary)',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              >
                Inspect Source Document
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
