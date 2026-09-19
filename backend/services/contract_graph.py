from typing import Any
from sqlalchemy.orm import Session
from backend.models.entities import (
    Contract, ContractParty, Document, Clause, Obligation, Deadline, Review, VersionChange
)

class ContractGraphService:
    @staticmethod
    def build_graph_for_contract(db: Session, contract_id: str) -> dict[str, Any]:
        contract = db.query(Contract).filter(Contract.id == contract_id).first()
        if not contract:
            return {"contract_id": contract_id, "nodes": [], "edges": []}

        nodes = []
        edges = []

        # 1. Contract Root Node
        nodes.append({
            "id": contract.id,
            "label": contract.title,
            "type": "Contract",
            "group": "contract",
            "metadata": {
                "counterparty": contract.counterparty,
                "status": contract.status,
                "type": contract.contract_type
            }
        })

        # 2. Parties
        parties = db.query(ContractParty).filter(ContractParty.contract_id == contract_id).all()
        for p in parties:
            nodes.append({
                "id": p.id,
                "label": f"{p.name} ({p.role})",
                "type": "Party",
                "group": "party",
                "metadata": {"role": p.role, "email": p.contact_email}
            })
            edges.append({
                "id": f"e_{contract.id}_{p.id}",
                "source": contract.id,
                "target": p.id,
                "relationship": "HAS_PARTY",
                "label": "Has Party"
            })

        # 3. Documents
        docs = db.query(Document).filter(Document.contract_id == contract_id).all()
        for d in docs:
            nodes.append({
                "id": d.id,
                "label": f"{d.filename} ({d.version_tag})",
                "type": "Document",
                "group": "document",
                "metadata": {"version": d.version_tag, "type": d.document_type, "pages": d.page_count}
            })
            edges.append({
                "id": f"e_{contract.id}_{d.id}",
                "source": contract.id,
                "target": d.id,
                "relationship": "HAS_DOCUMENT",
                "label": "Has Document"
            })

        # 4. Clauses
        clauses = db.query(Clause).filter(Clause.contract_id == contract_id).all()
        clause_map = {c.id: c for c in clauses}
        for c in clauses:
            nodes.append({
                "id": c.id,
                "label": f"§{c.section_number} {c.title}",
                "type": "Clause",
                "group": "clause",
                "metadata": {
                    "clause_type": c.clause_type,
                    "risk_level": c.risk_level,
                    "confidence": c.confidence,
                    "page": c.page_number
                }
            })
            edges.append({
                "id": f"e_{contract.id}_{c.id}",
                "source": contract.id,
                "target": c.id,
                "relationship": "CONTAINS_CLAUSE",
                "label": "Contains"
            })

        # 5. Obligations & Owners
        obligations = db.query(Obligation).filter(Obligation.contract_id == contract_id).all()
        owners_seen = set()

        for ob in obligations:
            nodes.append({
                "id": ob.id,
                "label": ob.action[:45] + ("..." if len(ob.action) > 45 else ""),
                "type": "Obligation",
                "group": "obligation",
                "metadata": {
                    "party": ob.party,
                    "internal_owner": ob.internal_owner,
                    "status": ob.status,
                    "priority": ob.priority,
                    "deadline_rule": ob.deadline_rule,
                    "confidence": ob.confidence
                }
            })

            # Edge from clause to obligation if linked
            if ob.clause_id and ob.clause_id in clause_map:
                edges.append({
                    "id": f"e_{ob.clause_id}_{ob.id}",
                    "source": ob.clause_id,
                    "target": ob.id,
                    "relationship": "CREATES_OBLIGATION",
                    "label": "Creates"
                })
            else:
                edges.append({
                    "id": f"e_{contract.id}_{ob.id}",
                    "source": contract.id,
                    "target": ob.id,
                    "relationship": "GENERATES_OBLIGATION",
                    "label": "Generates"
                })

            # Owner node
            if ob.internal_owner:
                owner_id = f"owner_{ob.internal_owner.lower().replace(' ', '_')}"
                if owner_id not in owners_seen:
                    nodes.append({
                        "id": owner_id,
                        "label": f"{ob.internal_owner} Team",
                        "type": "Owner",
                        "group": "owner",
                        "metadata": {"team": ob.internal_owner}
                    })
                    owners_seen.add(owner_id)

                edges.append({
                    "id": f"e_{ob.id}_{owner_id}",
                    "source": ob.id,
                    "target": owner_id,
                    "relationship": "ASSIGNED_TO_OWNER",
                    "label": "Owned by"
                })

        # 6. Deadlines
        deadlines = db.query(Deadline).filter(Deadline.contract_id == contract_id).all()
        for dl in deadlines:
            nodes.append({
                "id": dl.id,
                "label": f"Due: {dl.calculated_date.strftime('%d %b %Y')}",
                "type": "Deadline",
                "group": "deadline",
                "metadata": {
                    "rule": dl.deadline_rule,
                    "date": dl.calculated_date.isoformat(),
                    "status": dl.status,
                    "priority": dl.priority
                }
            })
            if dl.obligation_id:
                edges.append({
                    "id": f"e_{dl.obligation_id}_{dl.id}",
                    "source": dl.obligation_id,
                    "target": dl.id,
                    "relationship": "CREATES_DEADLINE",
                    "label": "Deadline"
                })

        # 7. Reviews
        reviews = db.query(Review).filter(Review.contract_id == contract_id).all()
        for rv in reviews:
            nodes.append({
                "id": rv.id,
                "label": f"Review: {rv.issue_category}",
                "type": "Review",
                "group": "review",
                "metadata": {
                    "category": rv.issue_category,
                    "status": rv.status,
                    "assigned_to": rv.assigned_to_name
                }
            })
            # Connect to reviewed item if exists
            edges.append({
                "id": f"e_{rv.id}_{rv.item_id}",
                "source": rv.id,
                "target": rv.item_id if any(n["id"] == rv.item_id for n in nodes) else contract.id,
                "relationship": "EVALUATES",
                "label": "Reviews"
            })

        return {
            "contract_id": contract_id,
            "nodes": nodes,
            "edges": edges
        }

    @staticmethod
    def query_graph_relationships(db: Session, contract_id: str, question: str) -> dict[str, Any]:
        """
        Answers structural questions about obligations, clauses, renewals, and dependencies
        using the graph topology rather than LLM guesswork.
        """
        q = question.lower()
        graph = ContractGraphService.build_graph_for_contract(db, contract_id)
        nodes = graph["nodes"]
        edges = graph["edges"]

        if "renewal" in q:
            # Find renewal clauses and connected obligations
            renewal_clauses = [n for n in nodes if n["type"] == "Clause" and "renewal" in n["metadata"].get("clause_type", "").lower()]
            renewal_clause_ids = {n["id"] for n in renewal_clauses}
            
            # Find obligations created by these clauses
            related_ob_ids = {e["target"] for e in edges if e["source"] in renewal_clause_ids and e["relationship"] == "CREATES_OBLIGATION"}
            related_obs = [n for n in nodes if n["id"] in related_ob_ids or ("renewal" in n["label"].lower() and n["type"] == "Obligation")]
            
            # Find deadlines for these obligations
            target_ob_ids = {n["id"] for n in related_obs}
            related_dl_ids = {e["target"] for e in edges if e["source"] in target_ob_ids and e["relationship"] == "CREATES_DEADLINE"}
            related_deadlines = [n for n in nodes if n["id"] in related_dl_ids]

            return {
                "query": question,
                "answer": f"Found {len(renewal_clauses)} renewal clause(s) triggering {len(related_obs)} obligation(s) and {len(related_deadlines)} calculated deadline(s).",
                "highlight_node_ids": list(renewal_clause_ids.union(target_ob_ids).union(related_dl_ids)),
                "results": {
                    "clauses": renewal_clauses,
                    "obligations": related_obs,
                    "deadlines": related_deadlines
                }
            }

        if "party" in q or "vendor" in q or "customer" in q:
            # Party workload distribution
            parties = [n for n in nodes if n["type"] == "Party"]
            obs = [n for n in nodes if n["type"] == "Obligation"]
            
            vendor_obs = [o for o in obs if o["metadata"].get("party", "").lower() == "vendor"]
            customer_obs = [o for o in obs if o["metadata"].get("party", "").lower() == "customer"]

            return {
                "query": question,
                "answer": f"Vendor is assigned {len(vendor_obs)} obligation(s); Customer has {len(customer_obs)} obligation(s).",
                "highlight_node_ids": [p["id"] for p in parties] + [o["id"] for o in obs],
                "results": {
                    "vendor_obligations": vendor_obs,
                    "customer_obligations": customer_obs
                }
            }

        # Default fallback traversal
        return {
            "query": question,
            "answer": f"The contract graph contains {len(nodes)} interconnected entities across clauses, parties, obligations, deadlines, and reviews.",
            "highlight_node_ids": [n["id"] for n in nodes[:6]],
            "results": {"total_nodes": len(nodes), "total_edges": len(edges)}
        }
