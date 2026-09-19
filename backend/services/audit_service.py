import uuid
import datetime
from sqlalchemy.orm import Session
from backend.models.entities import AuditLog
from backend.core.config import settings

class AuditService:
    @staticmethod
    def log(
        db: Session,
        action: str,
        agent_name: str = "Orchestrator",
        tool_called: str = None,
        input_summary: str = None,
        output_summary: str = None,
        source_reference: str = None,
        user_decision: str = None,
        user_name: str = None,
        confidence: float = 1.0,
        organization_id: str = None
    ) -> AuditLog:
        log_entry = AuditLog(
            id=f"audit_{uuid.uuid4().hex[:12]}",
            organization_id=organization_id or settings.DEFAULT_ORG_ID,
            user_name=user_name or settings.DEFAULT_USER_NAME,
            agent_name=agent_name,
            action=action,
            tool_called=tool_called,
            input_summary=input_summary,
            output_summary=output_summary,
            source_reference=source_reference,
            user_decision=user_decision,
            confidence=confidence,
            timestamp=datetime.datetime.now(datetime.timezone.utc)
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry
