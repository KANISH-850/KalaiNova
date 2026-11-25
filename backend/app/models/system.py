from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text

from app.database.session import Base


def utcnow():
    return datetime.now(timezone.utc)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notif_type = Column(String(40), default="info", nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    from sqlalchemy.orm import relationship
    user = relationship("User", back_populates="notifications")


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_type = Column(String(60), nullable=False, index=True)
    user_message = Column(Text, nullable=False)
    assistant_response = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)


class AIAgentAction(Base):
    __tablename__ = "ai_agent_actions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_type = Column(String(60), nullable=False)
    action_name = Column(String(100), nullable=False)
    payload_json = Column(Text, nullable=False)
    requires_confirmation = Column(Boolean, default=True, nullable=False)
    confirmed = Column(Boolean, default=False, nullable=False)
    executed = Column(Boolean, default=False, nullable=False)
    result_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)


class ModelMetadata(Base):
    __tablename__ = "model_metadata"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(120), unique=True, nullable=False, index=True)
    model_version = Column(String(60), nullable=False)
    source = Column(String(255), nullable=False)
    license = Column(String(120), nullable=False)
    task = Column(String(120), nullable=False)
    input_format = Column(String(150), nullable=False)
    output_format = Column(String(150), nullable=False)
    hardware_requirements = Column(String(150), nullable=False)
    loading_status = Column(String(60), default="unloaded", nullable=False)
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)
