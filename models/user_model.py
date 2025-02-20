from pydantic import BaseModel


class UserBase(BaseModel):
    pass


class UserCreate(UserBase):
    nickname: str
    first_name: str
    last_name: str
    email: str
    password: str
    wallet_address: str
