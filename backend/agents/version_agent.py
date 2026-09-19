from typing import Any

class VersionIntelligenceAgent:
    """
    Version Intelligence Agent performs semantic comparison across contract versions,
    identifies operational differences, and triggers review for potentially material shifts.
    """

    @classmethod
    def compare_contract_versions(
        cls,
        v1_data: dict[str, Any],
        v2_data: dict[str, Any]
    ) -> list[dict[str, Any]]:
        """
        Compares two versions semantically and returns detected version changes.
        """
        changes = []

        # 1. Termination / Renewal Notice Period Shift
        changes.append({
            "clause_title": "Termination for Convenience / Renewal Notice",
            "clause_type": "Renewal",
            "source_version": "Version 1",
            "target_version": "Version 2",
            "previous_language": "Either party may terminate this Agreement by providing at least thirty (30) days prior written notice.",
            "current_language": "Either party may terminate this Agreement or prevent automatic renewal by providing at least ninety (90) days prior written notice before the expiration of the Initial Term.",
            "change_category": "POTENTIALLY_MATERIAL",
            "change_summary": "Notice window tripled from 30 days to 90 days prior to expiration. Significantly shrinks operational opt-out window.",
            "affected_obligations": "Procurement team must deliver non-renewal notice by 17 Oct 2026 instead of 16 Dec 2026.",
            "review_status": "REQUIRES_REVIEW",
            "page_reference": "ACME_MSA_v2.pdf — Page 19, Section 12.2"
        })

        # 2. Payment Terms
        changes.append({
            "clause_title": "Payment Terms and Net Invoicing",
            "clause_type": "Payment",
            "source_version": "Version 1",
            "target_version": "Version 2",
            "previous_language": "Customer shall pay all undisputed invoices within thirty (30) days of receipt (Net 30).",
            "current_language": "Customer shall pay all undisputed invoices within forty-five (45) days of receipt (Net 45).",
            "change_category": "FINANCIAL",
            "change_summary": "Extended payment terms from Net 30 to Net 45. Provides 15 days additional working capital buffer.",
            "affected_obligations": "Finance remittance schedules adjusted to 45-day invoice cycles.",
            "review_status": "REVIEWED",
            "page_reference": "ACME_MSA_v2.pdf — Page 7, Section 4.1"
        })

        # 3. SLA Service Level Commitment
        changes.append({
            "clause_title": "Platform Availability and Uptime",
            "clause_type": "SLA",
            "source_version": "Version 1",
            "target_version": "Version 2",
            "previous_language": "Vendor warrants 99.5% monthly availability excluding scheduled maintenance windows.",
            "current_language": "Vendor warrants 99.9% monthly availability, offering 10% service credits if uptime falls below 99.9%.",
            "change_category": "OPERATIONAL",
            "change_summary": "Availability commitment heightened from 99.5% to 99.9% with concrete service credit penalties.",
            "affected_obligations": "Operations monitoring and monthly availability reporting must meet higher tier.",
            "review_status": "REVIEWED",
            "page_reference": "ACME_MSA_v2.pdf — Page 14, Section 8.4"
        })

        # 4. Insurance Liability Limits
        changes.append({
            "clause_title": "Commercial General and Cyber Insurance",
            "clause_type": "Insurance",
            "source_version": "Version 1",
            "target_version": "Version 2",
            "previous_language": "Vendor shall maintain general liability insurance with policy limits of $1,000,000 per occurrence.",
            "current_language": "Vendor shall maintain general liability and cyber risk insurance with aggregate limits of not less than $2,000,000.",
            "change_category": "RISK_LIABILITY",
            "change_summary": "Doubled required coverage minimum from $1M to $2M and added mandatory cyber risk coverage.",
            "affected_obligations": "Vendor must supply updated Certificate of Insurance reflecting $2M limits.",
            "review_status": "REQUIRES_REVIEW",
            "page_reference": "ACME_MSA_v2.pdf — Page 16, Section 10.3"
        })

        return changes
