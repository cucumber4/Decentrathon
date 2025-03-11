from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from db import SessionLocal
from schemas.user_scheme import User
from schemas.token_request_scheme  import TokenRequest
from utils.dependencies import get_current_user, is_admin
from web3 import Web3
from pydantic import BaseModel

router = APIRouter()

RPC_URL = "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
web3 = Web3(Web3.HTTPProvider(RPC_URL, {"timeout": 60}))

CONTRACT_ADDRESS = "0x0946E6cBd737764BdbEC76430d030d30c653A7f9"
CREATOR_ADDRESS = "0xa21356475F98ABF66Fc39D390325e4002b75AEC4"
PRIVATE_KEY = "YOUR_PRIVATE_KEY"

contract = web3.eth.contract(address=CONTRACT_ADDRESS, abi=[
    {
        "constant": False,
        "inputs": [{"name": "recipient", "type": "address"}, {"name": "amount", "type": "uint256"}],
        "name": "transfer",
        "outputs": [],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [{"name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    }
])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/request-tokens")
def request_tokens(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    # 🔹 Получаем пользователя по email из токена
    db_user = db.query(User).filter(User.email == user["sub"]).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    # 🔹 Проверяем, есть ли уже активный запрос
    existing_request = db.query(TokenRequest).filter(
        TokenRequest.user_id == db_user.id, TokenRequest.status == "pending"
    ).first()

    if existing_request:
        raise HTTPException(status_code=400, detail="У вас уже есть активный запрос")

    # 🔹 Создаем новую заявку
    token_request = TokenRequest(user_id=db_user.id, wallet_address=db_user.wallet_address)
    db.add(token_request)
    db.commit()
    db.refresh(token_request)

    return {"message": "Запрос отправлен. Ожидайте одобрения администратором."}




@router.get("/token-requests")
def get_token_requests(user: dict = Depends(is_admin), db: Session = Depends(get_db)):
    requests = db.query(TokenRequest).filter(TokenRequest.status == "pending").all()
    return [{"id": req.id, "nickname": req.user.nickname, "wallet_address": req.wallet_address} for req in requests]


@router.post("/approve-request/{request_id}")
def approve_request(request_id: int, user: dict = Depends(is_admin), db: Session = Depends(get_db)):
    request = db.query(TokenRequest).filter(TokenRequest.id == request_id, TokenRequest.status == "pending").first()
    if not request:
        raise HTTPException(status_code=404, detail="Запрос не найден или уже обработан")

    nonce = web3.eth.get_transaction_count(CREATOR_ADDRESS, "pending")
    gas_price = web3.eth.gas_price
    gas_price = int(gas_price * 1.1)

    tx = contract.functions.transfer(request.wallet_address, 10 * 10 ** 18).build_transaction({
        'from': CREATOR_ADDRESS,
        'gas': 100000,
        'gasPrice': gas_price,
        'nonce': nonce
    })

    signed_tx = web3.eth.account.sign_transaction(tx, PRIVATE_KEY)
    tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)

    request.status = "approved"
    db.commit()

    return {"message": "Токены отправлены!", "tx_hash": web3.to_hex(tx_hash)}


@router.post("/reject-request/{request_id}")
def reject_request(request_id: int, user: dict = Depends(is_admin), db: Session = Depends(get_db)):
    request = db.query(TokenRequest).filter(TokenRequest.id == request_id, TokenRequest.status == "pending").first()
    if not request:
        raise HTTPException(status_code=404, detail="Запрос не найден или уже обработан")

    request.status = "rejected"
    db.commit()

    return {"message": "Запрос отклонен"}
