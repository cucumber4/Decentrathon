from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from web3 import Web3
from db import SessionLocal
from utils.dependencies import get_current_user
import os

router = APIRouter()

# Подключение к Ethereum
RPC_URL = "https://sepolia.infura.io/v3/cbfec6723c0b4264b5b3dcf5cba569e9"
web3 = Web3(Web3.HTTPProvider(RPC_URL, {"timeout": 60}))

# Адрес контракта
CONTRACT_ADDRESS = "0xbb24d6d3876db623B602b44A45115bc721a252fe"
TOKEN_CONTRACT_ADDRESS = "0x024b770fd5E43258363651B5545efbf080d0775F"
VOTE_COST = 10 * 10**18  # 10 токенов

TOKEN_ABI = [
    {"constant": False, "inputs": [{"name": "sender", "type": "address"}, {"name": "recipient", "type": "address"}, {"name": "amount", "type": "uint256"}],
     "name": "transferFrom", "outputs": [{"name": "", "type": "bool"}], "type": "function"},
    {"constant": True, "inputs": [{"name": "account", "type": "address"}],
     "name": "balanceOf", "outputs": [{"name": "", "type": "uint256"}], "type": "function"}
]


VOTING_ABI = [
    {"constant": False, "inputs": [{"name": "pollId", "type": "uint256"}, {"name": "candidate", "type": "string"}],
     "name": "vote", "outputs": [], "type": "function"},
    {"constant": True, "inputs": [{"name": "pollId", "type": "uint256"}, {"name": "candidate", "type": "string"}],
     "name": "getResult", "outputs": [{"name": "", "type": "uint256"}], "type": "function"}
]


# Подключаем контракты
token_contract = web3.eth.contract(address=TOKEN_CONTRACT_ADDRESS, abi=TOKEN_ABI)
voting_contract = web3.eth.contract(address=CONTRACT_ADDRESS, abi=VOTING_ABI)


@router.post("/vote/{poll_id}/{candidate}")
def vote(poll_id: int, candidate: str, user: dict = Depends(get_current_user)):
    user_address = user["wallet_address"]
    private_key = 'b4cec174d98688e762355891cbc52759bf5996cb7b47057d1b151b68e9454209'  # Приватный ключ должен быть у пользователя!

    if not private_key:
        raise HTTPException(status_code=400, detail="Приватный ключ не найден!")

    # Проверяем баланс пользователя
    user_balance = token_contract.functions.balanceOf(user_address).call()
    if user_balance < VOTE_COST:
        raise HTTPException(status_code=400, detail="Недостаточно токенов для голосования!")

    # Создаем транзакцию голосования
    tx = voting_contract.functions.vote(poll_id, candidate).build_transaction({
        'from': user_address,
        'gas': 200000,
        'gasPrice': web3.eth.gas_price,
        'nonce': web3.eth.get_transaction_count(user_address, "pending")
    })

    # Подписываем транзакцию
    signed_tx = web3.eth.account.sign_transaction(tx, "ff3b75ea3cd0bfed0c2a9032fd6c9690bedcbe24f36c3a1350f5001bfd5adecc")
    tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)

    return {"message": "Голос успешно отправлен", "tx_hash": web3.to_hex(tx_hash)}


@router.get("/results/{poll_id}/{candidate}")
def get_vote_result(poll_id: int, candidate: str):
    try:
        votes = voting_contract.functions.getResult(poll_id, candidate).call()
        return {"poll_id": poll_id, "candidate": candidate, "votes": votes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при получении результатов: {str(e)}")
