from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from db import SessionLocal
from schemas.user_scheme import User
from utils.jwt_handler import create_access_token
from utils.security import verify_password
from pydantic import BaseModel

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserLogin(BaseModel):
    phone: str
    password: str

@router.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.phone == user.phone).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Пользователь не найден")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Неверный пароль")

    # ✅ Добавляем wallet_address в токен
    access_token = create_access_token(
        data={"sub": db_user.phone, "role": db_user.role, "wallet_address": db_user.wallet_address}
    )

    return {"access_token": access_token, "token_type": "bearer"}
