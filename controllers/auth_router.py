from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from db import SessionLocal
from schemas.user_scheme import User
from utils.dependencies import get_current_user
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
    email: str
    password: str


@router.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Пользователь не найден")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Неверный пароль")

    # wallet_address в токен
    access_token = create_access_token(
        data={"sub": db_user.email, "role": db_user.role, "wallet_address": db_user.wallet_address}
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
def get_current_user_data(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user["sub"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    return {
        "nickname": db_user.nickname,
        "first_name": db_user.first_name,
        "last_name": db_user.last_name,
        "email": db_user.email,
        "wallet_address": db_user.wallet_address,
        "role": db_user.role
    }
