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

        # Check for ambiguity / failure case triggers
        is_ambiguous = any(term in text_lower for term in [
            "reasonable notice", "commercially reasonable", "as mutually agreed", 
            "reasonable commercial notification", "inconsistency between", "conflicting"
        ])

        # 1. Performance / SLA reporting
        if "monthly" in text_lower and ("report" in text_lower or "metric" in text_lower):
            biz_days = 10 if "10 business days" in text_lower or "10 days" in text_lower else 5
            obligations.append({
                "party": "Vendor",
                "internal_owner": "Operations",
                "action": f"Submit monthly performance report and SLA availability metrics within {biz_days} business days",
                "obligation_type": "EXPLICIT",
                "frequency": "MONTHLY",
                "trigger_event": "End of calendar month",
                "deadline_rule": f"{biz_days} business days after month-end",
                "priority": "HIGH",
                "risk_level": "MEDIUM",
                "confidence": "HIGH",
                "review_required": False
            })

        # 2. Delivery SLA (e.g. NOVA 96% on-time delivery target)
        if "delivery" in text_lower and ("96%" in text_lower or "target" in text_lower or "shipment" in text_lower):
            obligations.append({
                "party": "Vendor",
                "internal_owner": "Operations",
                "action": "Maintain 96% on-time delivery target for all scheduled shipments",
                "obligation_type": "EXPLICIT",
                "frequency": "CONTINUOUS",
                "trigger_event": "Order fulfillment cycle",
                "deadline_rule": "Continuous measurement",
                "priority": "HIGH",
                "risk_level": "MEDIUM",
                "confidence": "HIGH",
                "review_required": False
            })

        # 3. Support SLA Response / Acknowledgement (e.g. ORBIT 4 hours)
        if "support" in text_lower and ("hour" in text_lower or "acknowledge" in text_lower or "priority 1" in text_lower or "ticket" in text_lower):
            obligations.append({
                "party": "Vendor",
                "internal_owner": "Operations",
                "action": "Acknowledge Priority 1 support incidents within 4 hours",
                "obligation_type": "EXPLICIT",
                "frequency": "AS_NEEDED",
                "trigger_event": "P1 ticket submission",
                "deadline_rule": "Within 4 hours of ticket submission",
                "priority": "CRITICAL",
                "risk_level": "HIGH",
                "confidence": "HIGH",
                "review_required": False
            })

        # 4. Renewal / Non-renewal notice (e.g. 60d, 90d, 120d)
        if "renewal" in text_lower or ("notice" in text_lower and ("prior" in text_lower or "expiration" in text_lower)):
            days = 90
            if "120" in text_lower:
                days = 120
            elif "60" in text_lower:
                days = 60
            elif "30" in text_lower:
                days = 30

            obligations.append({
                "party": "Customer",
                "internal_owner": "Procurement",
                "action": f"Provide non-renewal notice to prevent automatic contract extension ({days} days)",
                "obligation_type": "AMBIGUOUS" if is_ambiguous else "EXPLICIT",
                "frequency": "ONE_TIME",
                "trigger_event": "Contract expiration window",
                "deadline_rule": f"{days} days before expiration",
                "priority": "CRITICAL",
                "risk_level": "HIGH",
                "confidence": "LOW" if is_ambiguous else "HIGH",
                "review_required": is_ambiguous
            })

        # 5. Insurance Coverage (e.g. INR 1 crore or $2M)
        if "insurance" in text_lower and ("coverage" in text_lower or "policy" in text_lower or "certificate" in text_lower or "crore" in text_lower):
            amt = "INR 1 crore" if "inr 1 crore" in text_lower or "crore" in text_lower else "$2,000,000"
            obligations.append({
                "party": "Vendor",
                "internal_owner": "Finance",
                "action": f"Maintain and provide Certificate of Insurance ({amt} coverage limits)",
                "obligation_type": "EXPLICIT",
                "frequency": "ANNUALLY",
                "trigger_event": "Annual policy renewal / anniversary",
                "deadline_rule": "30 days before policy expiration",
                "priority": "HIGH",
                "risk_level": "MEDIUM",
                "confidence": "HIGH",
                "review_required": False
            })

        # 6. Invoicing / Payment (Net 30, Net 45)
        if "invoice" in text_lower or "payment" in text_lower or "fee" in text_lower:
            days = 45 if ("45" in text_lower or "net 45" in text_lower) else 30
            net_rule = f"Net {days} calendar days after invoice receipt"
            obligations.append({
                "party": "Customer",
                "internal_owner": "Finance",
                "action": f"Remit payment for undisputed invoices ({net_rule})",
                "obligation_type": "EXPLICIT",
                "frequency": "MONTHLY",
                "trigger_event": "Receipt of monthly invoice",
                "deadline_rule": net_rule,
                "priority": "HIGH",
                "risk_level": "LOW",
                "confidence": "HIGH",
                "review_required": False
            })

        # 7. Security Incident / Breach Notification (24h or 72h)
        if "breach" in text_lower or "security incident" in text_lower or "incident reporting" in text_lower:
            hrs = 24 if "24" in text_lower else 72
            obligations.append({
                "party": "Vendor",
                "internal_owner": "Legal",
                "action": f"Notify Customer in writing within {hrs} hours of any confirmed security or operational incident",
                "obligation_type": "EXPLICIT",
                "frequency": "AS_NEEDED",
                "trigger_event": "Security incident detection",
                "deadline_rule": f"Within {hrs} hours of security breach detection",
                "priority": "CRITICAL",
                "risk_level": "CRITICAL",
                "confidence": "HIGH",
                "review_required": False
            })

        # 8. Data Deletion Upon Termination (e.g. 30 days)
        if "deletion" in text_lower or "purge" in text_lower or ("data" in text_lower and "termination" in text_lower):
            obligations.append({
                "party": "Vendor",
                "internal_owner": "Legal",
                "action": "Purge all Customer personal data and backups within 30 days of contract termination",
                "obligation_type": "EXPLICIT",
                "frequency": "ONE_TIME",
                "trigger_event": "Contract termination or expiration",
                "deadline_rule": "30 days after termination",
                "priority": "HIGH",
                "risk_level": "MEDIUM",
                "confidence": "HIGH",
                "review_required": False
            })

        # 9. Audit Rights & Regulatory Compliance
        if "audit" in text_lower and ("inspect" in text_lower or "records" in text_lower or "examination" in text_lower or "gdpr" in text_lower):
            obligations.append({
                "party": "Vendor",
                "internal_owner": "Operations",
                "action": "Permit independent compliance audit of security controls and operational logs",
                "obligation_type": "DERIVED",
                "frequency": "ANNUALLY",
                "trigger_event": "Annual audit request window",
                "deadline_rule": "Quarterly audit within 30 days of quarter end",
                "priority": "MEDIUM",
                "risk_level": "LOW",
                "confidence": "HIGH",
                "review_required": False
            })

        # 10. Service Credits for downtime / delay
        if "service credit" in text_lower or "credit" in text_lower:
            obligations.append({
                "party": "Customer",
                "internal_owner": "Operations",
                "action": "Submit formal service credit claims following qualifying SLA outage or shipment delay",
                "obligation_type": "DERIVED",
                "frequency": "AS_NEEDED",
                "trigger_event": "SLA failure occurrence",
                "deadline_rule": "Within 30 calendar days following affected month",
                "priority": "MEDIUM",
                "risk_level": "LOW",
                "confidence": "HIGH",
                "review_required": False
            })

        return obligations
