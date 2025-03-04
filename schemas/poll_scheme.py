from sqlalchemy import Column, Integer, String, Boolean, ARRAY, Text
from db import GlobalBase


class Poll(GlobalBase):
    __tablename__ = "polls"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    candidates = Column(ARRAY(Text), nullable=False)
    active = Column(Boolean, default=True, nullable=False)
