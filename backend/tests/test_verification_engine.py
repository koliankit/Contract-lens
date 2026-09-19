from backend.services.verification_engine import VerificationEngine

def test_verbatim_quote_match():
    doc_text = "Either party may terminate this Agreement by providing at least ninety (90) days prior written notice before expiration."
    quote = "at least ninety (90) days prior written notice"
    res = VerificationEngine.verify_source_quote(quote, doc_text, page_number=5)
    
    assert res.verified is True
    assert res.confidence_level == "HIGH"
    assert res.requires_review is False

def test_quote_not_found_flags_review():
    doc_text = "Standard payment terms apply."
    fake_quote = "Vendor shall pay a $5,000,000 penalty immediately."
    res = VerificationEngine.verify_source_quote(fake_quote, doc_text, page_number=2)
    
    assert res.verified is False
    assert res.requires_review is True
    assert res.review_category == "MISSING_EVIDENCE"

def test_version_conflict_detection():
    v1_rule = "30 days prior written notice"
    v2_rule = "90 days prior written notice"
    conflict = VerificationEngine.detect_version_conflict(v1_rule, v2_rule, "Renewal Notice Period")
    
    assert conflict is not None
    assert conflict["conflict_detected"] is True
    assert conflict["issue_category"] == "CONFLICTING_VERSION"
    assert conflict["requires_review"] is True
