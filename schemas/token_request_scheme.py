from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db import GlobalBase

class TokenRequest(GlobalBase):
    __tablename__ = "token_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    wallet_address = Column(Text, nullable=False)
    status = Column(String, default="pending", nullable=False)  # pending, approved, rejected
    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="token_requests")
