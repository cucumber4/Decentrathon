from sqlalchemy import Column, Integer, String, Enum
from db import GlobalBase
import enum

class RoleEnum(str, enum.Enum):
    user = "user"
    admin = "admin"

class User(GlobalBase):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nickname = Column(String, unique=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)  # Пароли должны быть захешированы!
    wallet_address = Column(String, unique=True, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.user, nullable=False)  # ✅ Добавляем роль
