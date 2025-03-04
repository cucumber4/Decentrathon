from fastapi import Depends, HTTPException, Security
from fastapi.security import OAuth2PasswordBearer
from utils.jwt_handler import verify_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/user/login")  # Bearer-токен


#  Функция для проверки аутентификации
def get_current_user(token: str = Security(oauth2_scheme)):
    payload = verify_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Недействительный токен")
    return payload


#  Функция для проверки роли администратора
def is_admin(token: str = Depends(oauth2_scheme)):
    payload = verify_access_token(token)
    if payload is None or payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Недостаточно прав")

    if "wallet_address" not in payload:
        raise HTTPException(status_code=401, detail="Ошибка авторизации: отсутствует wallet_address")

    return payload  # payload содержит wallet_address
