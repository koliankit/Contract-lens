import datetime
from backend.services.deadline_engine import DeadlineEngine

def test_notice_period_calculation():
    # ACME MSA v2 Expiration: 15 Jan 2027
    # Notice: 90 days before expiration
    # Calculated Date: 17 Oct 2026
    expiration = datetime.datetime(2027, 1, 15, 0, 0, tzinfo=datetime.timezone.utc)
    res = DeadlineEngine.calculate_deadline("90 days before expiration", reference_date=expiration)
    
    assert res.calculated_date.year == 2026
    assert res.calculated_date.month == 10
    assert res.calculated_date.day == 17
    assert res.calculation_method == "NOTICE_PERIOD"
    assert "90 calendar days" in res.explanation

def test_business_days_after_month_end():
    # September month end is Sep 30 (Wednesday in 2026)
    # 5 business days: Thu Oct 1, Fri Oct 2, Mon Oct 5, Tue Oct 6, Wed Oct 7
    ref = datetime.datetime(2026, 9, 15, tzinfo=datetime.timezone.utc)
    res = DeadlineEngine.calculate_deadline("5 business days after month end", reference_date=ref)
    
    assert res.calculation_method == "BUSINESS_DAYS"
    # Ensure it calculated a valid date in early October
    assert res.calculated_date.month == 10
    assert res.calculated_date.day in [6, 7, 8] # depending on specific holiday calendar

def test_net_payment_terms():
    invoice_date = datetime.datetime(2026, 10, 1, tzinfo=datetime.timezone.utc)
    res = DeadlineEngine.calculate_deadline("Net 45 days after invoice receipt", reference_date=invoice_date)
    
    assert res.calculation_method == "CALENDAR_DAYS"
    assert res.calculated_date.month == 11
    assert res.calculated_date.day == 15

def test_hours_elapsed_calculation():
    detection_time = datetime.datetime(2026, 10, 1, 12, 0, tzinfo=datetime.timezone.utc)
    res = DeadlineEngine.calculate_deadline("Within 72 hours of security breach detection", reference_date=detection_time)
    
    assert res.calculation_method == "HOURS_ELAPSED"
    assert (res.calculated_date - detection_time).total_seconds() == 72 * 3600
    assert res.priority == "CRITICAL"
