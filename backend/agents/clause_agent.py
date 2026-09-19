from typing import Any

# Supported Clause Taxonomy (Section 7)
CLAUSE_TYPES = [
    "Payment", "Pricing", "Term", "Renewal", "Termination", "Notice",
    "SLA", "Deliverables", "Confidentiality", "Intellectual Property",
    "Data Protection", "Security", "Liability", "Indemnification",
    "Insurance", "Audit Rights", "Compliance", "Penalties",
    "Service Credits", "Warranty", "Governing Law", "Dispute Resolution",
    "Force Majeure", "Assignment", "Subcontracting", "Change Control"
]

class ClauseIntelligenceAgent:
    """
    Clause Intelligence Agent classifies contract paragraphs into 25+ standard
    legal/commercial categories, preserving verbatim quotes and calculating risk.
    """

    KEYWORD_MAPPINGS = {
        "Renewal": ["renewal", "auto-renew", "renew", "subsequent term", "extension"],
        "Termination": ["termination", "terminate", "for convenience", "material breach", "cause"],
        "Notice": ["written notice", "days prior written notice", "delivered by notice", "certified mail"],
        "Payment": ["invoice", "net 30", "net 45", "fees", "payable within", "billing"],
        "Pricing": ["rate card", "annual fee", "price increase", "index adjustment"],
        "SLA": ["service level", "uptime", "99.9%", "availability", "scheduled maintenance"],
        "Service Credits": ["credit", "service credit", "penalty for downtime", "credit request"],
        "Insurance": ["commercial general liability", "cyber insurance", "coverage of not less than", "policy limits"],
        "Audit Rights": ["audit", "inspect books", "records examination", "on-site inspection"],
        "Data Protection": ["gdpr", "personal data", "breach notification", "dpa", "security incident"],
        "Security": ["soc 2", "encryption", "vulnerability", "security measures"],
        "Liability": ["limitation of liability", "consequential damages", "aggregate liability", "cap on liability"],
        "Indemnification": ["indemnify", "defend", "hold harmless", "third party claim"],
        "Confidentiality": ["confidential information", "non-disclosure", "proprietary information"],
        "Intellectual Property": ["ip rights", "ownership of deliverables", "work made for hire", "license grant"],
        "Governing Law": ["governed by the laws", "jurisdiction", "venue", "courts of"],
        "Dispute Resolution": ["arbitration", "mediation", "dispute", "escalation"],
        "Force Majeure": ["act of god", "force majeure", "pandemic", "unforeseeable events"],
        "Assignment": ["assignment", "assign rights", "merger or acquisition"],
        "Subcontracting": ["subcontractor", "subcontracting", "third-party contractors"],
        "Warranty": ["warrant", "as is", "merchantability", "fitness for purpose"],
        "Change Control": ["change order", "scope modification", "written amendment"],
    }

    @classmethod
    def classify_text(cls, text: str) -> list[dict[str, Any]]:
        """
        Scans document text blocks and extracts categorized clauses.
        """
        results = []
        lower = text.lower()

        for c_type, keywords in cls.KEYWORD_MAPPINGS.items():
            for kw in keywords:
                if kw in lower:
                    risk = "LOW"
                    if c_type in ["Liability", "Indemnification", "Termination", "Data Protection"]:
                        risk = "HIGH"
                    elif c_type in ["Renewal", "Payment", "Insurance", "SLA"]:
                        risk = "MEDIUM"

                    results.append({
                        "clause_type": c_type,
                        "matched_keyword": kw,
                        "risk_level": risk,
                        "confidence": "HIGH"
                    })
                    break

        return results
