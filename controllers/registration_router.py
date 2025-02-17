from web3 import Web3
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from schemas.user_scheme import User
from db import SessionLocal
from models.user_model import UserCreate
from utils.security import hash_password


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


@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.wallet_address == user.wallet_address).first():
        raise HTTPException(status_code=400, detail="Кошелек уже зарегистрирован")

    hashed_password = hash_password(user.password)

    new_user = User(
        nickname=user.nickname,
        first_name=user.first_name,
        last_name=user.last_name,
        phone=user.phone,
        password=hashed_password,
        wallet_address=user.wallet_address
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Начисление токенов через смарт-контракт
    try:
        # Получаем nonce для следующей транзакции
        nonce = web3.eth.get_transaction_count(CREATOR_ADDRESS, "pending")  # Используем "pending"
        gas_price = web3.eth.gas_price  # Текущая цена газа

        # Увеличиваем gasPrice (на 10-20% выше текущего)
        gas_price = int(gas_price * 1.1)

        # Строим транзакцию
        tx = contract.functions.transfer(user.wallet_address, 10 * 10 ** 18).build_transaction({
            'from': CREATOR_ADDRESS,
            'gas': 100000,
            'gasPrice': int(gas_price * 1.1),
            'nonce': nonce
        })

        pending_nonce = web3.eth.get_transaction_count(CREATOR_ADDRESS, "pending")
        latest_nonce = web3.eth.get_transaction_count(CREATOR_ADDRESS, "latest")
        print(f"Pending Nonce: {pending_nonce}, Latest Nonce: {latest_nonce}")

        # Получаем баланс контракта в токенах
        contract_balance = contract.functions.balanceOf(CREATOR_ADDRESS).call()
        print(f"Баланс контракта: {Web3.from_wei(contract_balance, 'ether')} AGA")

        # Получаем баланс эфира на счету для покрытия газа
        balance_eth = web3.eth.get_balance(CREATOR_ADDRESS)  # Получить баланс в ETH
        print(f"Баланс ETH: {Web3.from_wei(balance_eth, 'ether')} ETH")

        # Оценка газа для транзакции
        gas_estimate = contract.functions.transfer(user.wallet_address, 10 * 10 ** 18).estimate_gas({
            'from': CREATOR_ADDRESS,
        })
        print(f"Ожидаемый газ: {gas_estimate}")

        # Подписываем и отправляем транзакцию
        signed_tx = web3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)

        return {"message": "Регистрация успешна", "tx_hash": web3.to_hex(tx_hash)}

    except Exception as e:
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
