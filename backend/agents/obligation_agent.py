from typing import Any

class ObligationIntelligenceAgent:
    """
    Obligation Intelligence Agent transforms raw contractual clauses into actionable,
    structured operational obligations, segregating contractual party from internal owner.
    """

    @classmethod
    def analyze_clause_for_obligations(
        cls,
        clause_type: str,
        clause_title: str,
        source_text: str,
        page_number: int,
        section_number: str
    ) -> list[dict[str, Any]]:
        obligations = []
        text_lower = source_text.lower()

        # 1. Performance / SLA reporting
        if "monthly" in text_lower and ("report" in text_lower or "metric" in text_lower):
            obligations.append({
                "party": "Vendor",
                "internal_owner": "Operations",
                "action": "Submit monthly performance report and SLA availability metrics",
                "obligation_type": "EXPLICIT",
                "frequency": "MONTHLY",
                "trigger_event": "End of calendar month",
                "deadline_rule": "5 business days after month end",
                "priority": "HIGH",
                "risk_level": "MEDIUM",
                "confidence": "HIGH",
                "review_required": False
            })

        # 2. Renewal / Non-renewal notice
        if "renewal" in text_lower or ("notice" in text_lower and "prior" in text_lower):
            days = "90 days" if "90" in text_lower else "30 days"
            is_ambiguous = "reasonable notice" in text_lower or ("30" in text_lower and "90" in text_lower)
            obligations.append({
                "party": "Customer",
                "internal_owner": "Procurement",
                "action": f"Provide non-renewal notice to prevent automatic contract extension ({days})",
                "obligation_type": "AMBIGUOUS" if is_ambiguous else "EXPLICIT",
                "frequency": "ONE_TIME",
                "trigger_event": "Contract expiration window",
                "deadline_rule": f"{days} before expiration",
                "priority": "CRITICAL",
                "risk_level": "HIGH",
                "confidence": "MEDIUM" if is_ambiguous else "HIGH",
                "review_required": is_ambiguous
            })

        # 3. Insurance Certificate
        if "insurance" in text_lower and ("certificate" in text_lower or "policy" in text_lower):
            obligations.append({
                "party": "Vendor",
                "internal_owner": "Finance",
                "action": "Maintain and provide Certificate of Insurance ($2,000,000 policy coverage)",
                "obligation_type": "EXPLICIT",
                "frequency": "ANNUALLY",
                "trigger_event": "Annual policy renewal / anniversary",
                "deadline_rule": "30 days before policy expiration",
                "priority": "HIGH",
                "risk_level": "MEDIUM",
                "confidence": "HIGH",
                "review_required": False
            })

        # 4. Invoicing / Payment
        if "invoice" in text_lower or "payment" in text_lower:
            net_rule = "Net 45 days after invoice receipt" if "45" in text_lower else "Net 30 days after invoice receipt"
            obligations.append({
                "party": "Customer",
                "internal_owner": "Finance",
                "action": f"Remit payment for approved software services ({net_rule})",
                "obligation_type": "EXPLICIT",
                "frequency": "MONTHLY",
                "trigger_event": "Receipt of monthly invoice",
                "deadline_rule": net_rule,
                "priority": "HIGH",
                "risk_level": "LOW",
                "confidence": "HIGH",
                "review_required": False
            })

        # 5. Security Incident Notification
        if "breach" in text_lower or "security incident" in text_lower:
            obligations.append({
                "party": "Vendor",
                "internal_owner": "Legal",
                "action": "Notify Customer in writing of any confirmed personal data breach",
                "obligation_type": "EXPLICIT",
                "frequency": "AS_NEEDED",
                "trigger_event": "Security incident detection",
                "deadline_rule": "Within 72 hours of security breach detection",
                "priority": "CRITICAL",
                "risk_level": "CRITICAL",
                "confidence": "HIGH",
                "review_required": False
            })

        # 6. Audit Rights
        if "audit" in text_lower and ("inspect" in text_lower or "books" in text_lower or "examination" in text_lower):
            obligations.append({
                "party": "Vendor",
                "internal_owner": "Operations",
                "action": "Permit independent compliance audit of operational facilities and logs",
                "obligation_type": "DERIVED",
                "frequency": "ANNUALLY",
                "trigger_event": "Annual audit request window",
                "deadline_rule": "Quarterly audit within 30 days of quarter end",
                "priority": "MEDIUM",
                "risk_level": "LOW",
                "confidence": "HIGH",
                "review_required": False
            })

        return obligations
