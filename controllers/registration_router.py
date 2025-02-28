from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session
from models.register_model import UserRegister  # Импорт Pydantic-схемы
from db import SessionLocal
from schemas.user_scheme import User  # SQLAlchemy-модель для сохранения в БД
from utils.email_sender import send_verification_email
from utils.security import hash_password
from web3 import Web3
import string, random

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

RPC_URL = "https://sepolia.infura.io/v3/cbfec6723c0b4264b5b3dcf5cba569e9"
web3 = Web3(Web3.HTTPProvider(RPC_URL, {"timeout": 60}))

CONTRACT_ADDRESS = "0x024b770fd5E43258363651B5545efbf080d0775F"
CREATOR_ADDRESS = "0xa21356475F98ABF66Fc39D390325e4002b75AEC4"
PRIVATE_KEY = "b4cec174d98688e762355891cbc52759bf5996cb7b47057d1b151b68e9454209"
TOKEN_ABI = [
    {"constant": False, "inputs": [{"name": "recipient", "type": "address"}, {"name": "amount", "type": "uint256"}],
     "name": "transfer", "outputs": [], "type": "function"},
    {"constant": True, "inputs": [{"name": "account", "type": "address"}],
     "name": "balanceOf", "outputs": [{"name": "", "type": "uint256"}], "type": "function"}
]

contract = web3.eth.contract(address=CONTRACT_ADDRESS, abi=TOKEN_ABI)

def generate_verification_code(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))

temp_registrations = {}

@router.post("/register")
def register_user(user: UserRegister, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Если пользователь с таким email уже зарегистрирован – выдаём ошибку
    if db.query(User).filter(User.wallet_address == user.wallet_address).first():
        raise HTTPException(status_code=400, detail="Кошелек уже зарегистрирован")

    # Генерируем код подтверждения
    code = generate_verification_code()

    # Сохраняем данные во временное хранилище
    temp_registrations[user.email] = {"user_data": user.dict(), "code": code}

    # Отправляем email в фоне
    background_tasks.add_task(send_verification_email, user.email, code)

    return {"message": "На вашу почту отправлен код подтверждения"}

class VerificationData(BaseModel):
    email: str
    code: str

@router.post("/verify")
def verify_user(data: VerificationData, db: Session = Depends(get_db)):
    record = temp_registrations.get(data.email)
    if not record:
        raise HTTPException(status_code=404, detail="Регистрация не найдена")
    if record["code"] != data.code:
        raise HTTPException(status_code=400, detail="Неверный код подтверждения")

    # Создаем пользователя в постоянной базе данных
    user_data = record["user_data"]
    hashed_password = hash_password(user_data["password"])
    new_user = User(
        nickname=user_data["nickname"],
        first_name=user_data["first_name"],
        last_name=user_data["last_name"],
        email=user_data["email"],
        wallet_address=user_data["wallet_address"],
        password=hashed_password,
        role="user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Удаляем временную запись
    del temp_registrations[data.email]

    # Начисление 10 AGA токенов новому пользователю
    try:
        nonce = web3.eth.get_transaction_count(CREATOR_ADDRESS, "pending")
        gas_price = web3.eth.gas_price

        # Увеличиваем gasPrice на 10% для ускорения транзакции
        gas_price = int(gas_price * 1.1)

        # Создаем транзакцию
        tx = contract.functions.transfer(new_user.wallet_address, 10 * 10 ** 18).build_transaction({
            'from': CREATOR_ADDRESS,
            'gas': 100000,
            'gasPrice': gas_price,
            'nonce': nonce
        })

        # Проверка баланса контракта
        contract_balance = contract.functions.balanceOf(CREATOR_ADDRESS).call()
        print(f"Баланс контракта: {Web3.from_wei(contract_balance, 'ether')} AGA")

        # Проверка ETH-баланса для оплаты газа
        balance_eth = web3.eth.get_balance(CREATOR_ADDRESS)
        print(f"Баланс ETH: {Web3.from_wei(balance_eth, 'ether')} ETH")

        # Подписываем и отправляем транзакцию
        signed_tx = web3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)

        return {
            "message": "Регистрация подтверждена, 10 AGA начислены!",
            "tx_hash": web3.to_hex(tx_hash)
        }

    except Exception as e:
        # Откатываем создание пользователя, если произошла ошибка с токенами
        db.delete(new_user)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Ошибка при начислении токенов: {str(e)}")

@router.get("/balance/{wallet_address}")
def get_balance(wallet_address: str):
    try:
        balance = contract.functions.balanceOf(wallet_address).call() / 10 ** 18
        return {"wallet_address": wallet_address, "balance": balance}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при получении баланса: {str(e)}")

password_reset_codes = {}

# 📌 1. API для отправки кода восстановления пароля
class ForgotPasswordRequest(BaseModel):
    email: str

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь с таким email не найден")

    # Генерируем код
    code = generate_verification_code()

    # Сохраняем временно
    password_reset_codes[request.email] = code

    # Отправляем код на почту
    background_tasks.add_task(send_verification_email, request.email, code)

    return {"message": "Код для сброса пароля отправлен на email"}

# 📌 2. API для смены пароля
class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    if request.email not in password_reset_codes:
        raise HTTPException(status_code=400, detail="Код для сброса пароля не запрашивался")

    if password_reset_codes[request.email] != request.code:
        raise HTTPException(status_code=400, detail="Неверный код подтверждения")

    # Находим пользователя
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    # Обновляем пароль
    user.password = hash_password(request.new_password)
    db.commit()

    # Удаляем код из временного хранилища
    del password_reset_codes[request.email]

    return {"message": "Пароль успешно обновлен"}