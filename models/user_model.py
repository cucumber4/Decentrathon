from pydantic import BaseModel


class UserBase(BaseModel):
    pass


class UserCreate(UserBase):
    nickname: str
    first_name: str
    last_name: str
    phone: str
    password: str
    wallet_address: str
