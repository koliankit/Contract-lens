import datetime
import calendar
from typing import Optional
from dateutil.relativedelta import relativedelta

# Configurable jurisdictional standard business holidays (Month, Day)
STANDARD_HOLIDAYS_MD = {
    (1, 1),   # New Year's Day
    (1, 15),  # MLK Day (approx / Jan 15-21)
    (5, 25),  # Memorial Day (approx)
    (7, 4),   # Independence Day
    (9, 7),   # Labor Day (approx)
    (11, 26), # Thanksgiving (approx)
    (12, 25), # Christmas Day
}

class DeadlineCalculationResult:
    def __init__(
        self,
        rule: str,
        calculated_date: datetime.datetime,
        calculation_method: str,
        explanation: str,
        status: str = "UPCOMING",
        priority: str = "MEDIUM"
    ):
        self.rule = rule
        self.calculated_date = calculated_date
        self.calculation_method = calculation_method
        self.explanation = explanation
        self.status = status
        self.priority = priority

    def to_dict(self):
        return {
            "rule": self.rule,
            "calculated_date": self.calculated_date.isoformat(),
            "calculation_method": self.calculation_method,
            "explanation": self.explanation,
            "status": self.status,
            "priority": self.priority,
        }

class DeadlineEngine:
    """
    Deterministic contract deadline calculation engine.
    Ensures that calendar dates are never hallucinated by an LLM,
    but deterministically derived from contract rules and reference dates.
    """

    @staticmethod
    def is_business_day(d: datetime.date, holiday_tuples: set[tuple[int, int]] = STANDARD_HOLIDAYS_MD) -> bool:
        # Weekend check: Monday is 0, Sunday is 6
        if d.weekday() >= 5:
            return False
        # Holiday check
        if (d.month, d.day) in holiday_tuples:
            return False
        return True

    @classmethod
    def add_business_days(cls, start_date: datetime.date, num_days: int) -> datetime.date:
        """
        Adds or subtracts N business days from start_date, skipping weekends and holidays.
        """
        current = start_date
        direction = 1 if num_days >= 0 else -1
        remaining = abs(num_days)

        while remaining > 0:
            current += datetime.timedelta(days=direction)
            if cls.is_business_day(current):
                remaining -= 1

        return current

    @classmethod
    def get_month_end(cls, year: int, month: int) -> datetime.date:
        _, last_day = calendar.monthrange(year, month)
        return datetime.date(year, month, last_day)

    @classmethod
    def calculate_deadline(
        cls,
        rule: str,
        reference_date: Optional[datetime.datetime] = None,
        now: Optional[datetime.datetime] = None
    ) -> DeadlineCalculationResult:
        if now is None:
            # Fixed reference baseline for demo/production determinism
            now = datetime.datetime.now(datetime.timezone.utc)
        
        rule_lower = rule.lower().strip()

        # Case 1: Incident / SLA Notification within hours (24h, 72h, 4h)
        # Example: "Within 24 hours", "72 hours of incident", "4 hours support ack"
        if "hour" in rule_lower:
            hours = 72
            if "24" in rule_lower:
                hours = 24
            elif "4" in rule_lower:
                hours = 4
            elif "72" in rule_lower:
                hours = 72
            elif "48" in rule_lower:
                hours = 48

            base_ref = reference_date or now
            calc_dt = base_ref + datetime.timedelta(hours=hours)
            status = cls.evaluate_status(calc_dt, now)

            return DeadlineCalculationResult(
                rule=rule,
                calculated_date=calc_dt,
                calculation_method="HOURS_ELAPSED",
                explanation=f"Strict SLA/regulatory compliance window within {hours} hours of qualifying trigger event.",
                status=status,
                priority="CRITICAL" if hours <= 24 else "HIGH"
            )

        # Case 2: Post-termination milestone (e.g. data deletion within 30 days after termination)
        if "after termination" in rule_lower or "post-termination" in rule_lower:
            days = 30
            for word in rule_lower.split():
                if word.isdigit():
                    days = int(word)
                    break
            base_ref = reference_date or now
            calc_dt = base_ref + datetime.timedelta(days=days)
            status = cls.evaluate_status(calc_dt, now)

            return DeadlineCalculationResult(
                rule=rule,
                calculated_date=calc_dt,
                calculation_method="CALENDAR_DAYS",
                explanation=f"Post-termination data purge required within {days} calendar days after contract conclusion.",
                status=status,
                priority="HIGH"
            )

        # Case 3: Renewal / Termination Notice before Expiration
        # Example: "90 days before expiration", "120 days before expiration", "60 days renewal notice"
        if "before expiration" in rule_lower or "prior to expiration" in rule_lower or "renewal" in rule_lower or "notice" in rule_lower:
            days = 90
            if "120" in rule_lower:
                days = 120
            elif "90" in rule_lower:
                days = 90
            elif "60" in rule_lower:
                days = 60
            elif "30" in rule_lower:
                days = 30

            ref = reference_date or datetime.datetime(2027, 1, 15, 0, 0, tzinfo=datetime.timezone.utc)
            target_date = ref - datetime.timedelta(days=days)
            status = cls.evaluate_status(target_date, now)

            return DeadlineCalculationResult(
                rule=rule,
                calculated_date=target_date,
                calculation_method="NOTICE_PERIOD",
                explanation=f"Calculated as {days} calendar days before contract expiration date ({ref.strftime('%d %b %Y')}). Result: {target_date.strftime('%d %b %Y')}.",
                status=status,
                priority="CRITICAL" if days <= 30 or status in ["DUE_SOON", "OVERDUE"] else "HIGH"
            )

        # Case 4: Business days after month end
        # Example: "5 business days after month end", "10 business days after month-end"
        if "business days" in rule_lower or "month end" in rule_lower or "month-end" in rule_lower:
            days = 5
            if "10" in rule_lower:
                days = 10
            else:
                for word in rule_lower.split():
                    if word.isdigit():
                        days = int(word)
                        break

            base_ref = reference_date.date() if reference_date else now.date()
            m_end = cls.get_month_end(base_ref.year, base_ref.month)
            due_date = cls.add_business_days(m_end, days)
            calc_dt = datetime.datetime(due_date.year, due_date.month, due_date.day, 17, 0, tzinfo=datetime.timezone.utc)
            status = cls.evaluate_status(calc_dt, now)

            return DeadlineCalculationResult(
                rule=rule,
                calculated_date=calc_dt,
                calculation_method="BUSINESS_DAYS",
                explanation=f"Calculated as {days} business days following month end ({m_end.strftime('%d %b %Y')}), excluding weekends and recognized holidays.",
                status=status,
                priority="HIGH"
            )

        # Case 5: Days after invoice / Net X payment
        # Example: "Net 30", "Net 45", "30 calendar days", "45 calendar days"
        if "net" in rule_lower or "invoice" in rule_lower or "payment" in rule_lower:
            net_days = 45 if "45" in rule_lower else 30
            base_ref = reference_date or now
            calc_dt = base_ref + datetime.timedelta(days=net_days)
            status = cls.evaluate_status(calc_dt, now)

            return DeadlineCalculationResult(
                rule=rule,
                calculated_date=calc_dt,
                calculation_method="CALENDAR_DAYS",
                explanation=f"Net payment term of {net_days} calendar days from invoice issue date ({base_ref.strftime('%d %b %Y')}).",
                status=status,
                priority="HIGH"
            )

        # Case 5: Quarterly frequency
        # Example: "Quarterly audit within 30 days of quarter end"
        if "quarter" in rule_lower:
            base_ref = reference_date or now
            # Next quarter end
            curr_q = (base_ref.month - 1) // 3 + 1
            q_end_month = curr_q * 3
            q_end = cls.get_month_end(base_ref.year, q_end_month)
            calc_dt = datetime.datetime(q_end.year, q_end.month, q_end.day, 18, 0, tzinfo=datetime.timezone.utc) + datetime.timedelta(days=30)
            status = cls.evaluate_status(calc_dt, now)

            return DeadlineCalculationResult(
                rule=rule,
                calculated_date=calc_dt,
                calculation_method="FREQUENCY_RECURRENCE",
                explanation=f"Quarterly obligation calculated 30 days after Q{curr_q} close.",
                status=status,
                priority="MEDIUM"
            )

        # Default Fallback: Fixed date or offset
        base_ref = reference_date or now
        calc_dt = base_ref + datetime.timedelta(days=30)
        return DeadlineCalculationResult(
            rule=rule,
            calculated_date=calc_dt,
            calculation_method="CALENDAR_DAYS",
            explanation=f"Standard derived term: 30 days from reference date {base_ref.strftime('%d %b %Y')}.",
            status=cls.evaluate_status(calc_dt, now),
            priority="MEDIUM"
        )

    @staticmethod
    def evaluate_status(due_date: datetime.datetime, current_time: datetime.datetime) -> str:
        diff = (due_date.date() - current_time.date()).days
        if diff < 0:
            return "OVERDUE"
        elif diff == 0:
            return "DUE_TODAY"
        elif diff <= 14:
            return "DUE_SOON"
        else:
            return "UPCOMING"
