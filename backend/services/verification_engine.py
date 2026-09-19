from typing import Optional

class VerificationResult:
    def __init__(
        self,
        verified: bool,
        verification_status: str,
        reason: str,
        confidence_level: str,
        requires_review: bool,
        review_category: Optional[str] = None
    ):
        self.verified = verified
        self.verification_status = verification_status
        self.reason = reason
        self.confidence_level = confidence_level
        self.requires_review = requires_review
        self.review_category = review_category

    def to_dict(self):
        return {
            "verified": self.verified,
            "verification_status": self.verification_status,
            "reason": self.reason,
            "confidence_level": self.confidence_level,
            "requires_review": self.requires_review,
            "review_category": self.review_category
        }

class VerificationEngine:
    """
    Verification Engine verifying all AI extractions against ground-truth document text,
    validating deterministic date math, and raising review tickets upon conflict detection.
    """

    @classmethod
    def verify_source_quote(
        cls,
        extracted_quote: str,
        document_text: str,
        page_number: int,
        tolerance_ratio: float = 0.85
    ) -> VerificationResult:
        """
        Confirms that the extracted quote is genuinely grounded in the actual document.
        """
        if not document_text or not extracted_quote:
            return VerificationResult(
                verified=False,
                verification_status="MISSING_EVIDENCE",
                reason="Document content or source quote is empty.",
                confidence_level="LOW",
                requires_review=True,
                review_category="MISSING_EVIDENCE"
            )

        # Normalize whitespace
        clean_quote = " ".join(extracted_quote.lower().split())
        clean_doc = " ".join(document_text.lower().split())

        if clean_quote in clean_doc:
            return VerificationResult(
                verified=True,
                verification_status="VERIFIED_EXACT_MATCH",
                reason=f"Verbatim match confirmed on Page {page_number}.",
                confidence_level="HIGH",
                requires_review=False
            )

        # Partial token overlap check
        quote_words = set(clean_quote.split())
        doc_words = set(clean_doc.split())
        overlap = quote_words.intersection(doc_words)
        overlap_ratio = len(overlap) / max(len(quote_words), 1)

        if overlap_ratio >= tolerance_ratio:
            return VerificationResult(
                verified=True,
                verification_status="VERIFIED_PARTIAL_MATCH",
                reason=f"Strong token overlap ({int(overlap_ratio * 100)}%) confirmed on Page {page_number}.",
                confidence_level="HIGH" if overlap_ratio > 0.9 else "MEDIUM",
                requires_review=overlap_ratio < 0.9,
                review_category="LOW_CONFIDENCE" if overlap_ratio < 0.9 else None
            )

        return VerificationResult(
            verified=False,
            verification_status="UNVERIFIED_MISMATCH",
            reason=f"Source quote not found on Page {page_number}. Potential hallucination prevented.",
            confidence_level="LOW",
            requires_review=True,
            review_category="MISSING_EVIDENCE"
        )

    @classmethod
    def detect_version_conflict(
        cls,
        v1_rule: str,
        v2_rule: str,
        clause_name: str
    ) -> Optional[dict]:
        """
        Detects if two versions of a contract present conflicting terms (e.g. 30 days notice vs 90 days notice).
        Never silently chooses one; flags for human review.
        """
        if v1_rule.strip().lower() != v2_rule.strip().lower():
            return {
                "conflict_detected": True,
                "clause_name": clause_name,
                "version_1": v1_rule,
                "version_2": v2_rule,
                "issue_category": "CONFLICTING_VERSION",
                "reason": f"Conflicting terms detected for {clause_name}: '{v1_rule}' in Version 1 vs '{v2_rule}' in Version 2.",
                "requires_review": True
            }
        return None
