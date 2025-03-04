from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    nickname: str
    first_name: str
    last_name: str
    email: EmailStr
    wallet_address: str
    password: str
