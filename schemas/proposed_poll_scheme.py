from sqlalchemy import Column, Integer, String, Boolean, ARRAY, Text
from db import GlobalBase

class ProposedPoll(GlobalBase):
    __tablename__ = "proposed_polls"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, default="", nullable=True)
    candidates = Column(ARRAY(Text), nullable=False)
    approved = Column(Boolean, default=False, nullable=False)  # Голосование отправлено в контракт
    approved_by_admin = Column(Boolean, default=False, nullable=False)  # Одобрено админом
