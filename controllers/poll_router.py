from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from controllers.registration_router import CREATOR_ADDRESS, PRIVATE_KEY
from db import SessionLocal
from schemas.poll_scheme import Poll
from utils.dependencies import is_admin
from web3 import Web3
from pydantic import BaseModel
import os

router = APIRouter()

# Подключение к Ethereum-сети
RPC_URL = "https://sepolia.infura.io/v3/cbfec6723c0b4264b5b3dcf5cba569e9"
web3 = Web3(Web3.HTTPProvider(RPC_URL, {"timeout": 60}))
CONTRACT_ADDRESS = "0x0946E6cBd737764BdbEC76430d030d30c653A7f9"  # ✅ Храним в переменной окружения
TOKEN_ABI =[
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_tokenAddress",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": False,
        "inputs": [
            {
                "indexed": False,
                "internalType": "uint256",
                "name": "pollId",
                "type": "uint256"
            },
            {
                "indexed": False,
                "internalType": "string",
                "name": "name",
                "type": "string"
            }
        ],
        "name": "PollCreated",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {
                "indexed": False,
                "internalType": "uint256",
                "name": "pollId",
                "type": "uint256"
            },
            {
                "indexed": False,
                "internalType": "string",
                "name": "candidate",
                "type": "string"
            },
            {
                "indexed": False,
                "internalType": "address",
                "name": "voter",
                "type": "address"
            }
        ],
        "name": "Voted",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_name",
                "type": "string"
            },
            {
                "internalType": "string[]",
                "name": "_candidates",
                "type": "string[]"
            }
        ],
        "name": "createPoll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "pollId",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "candidate",
                "type": "string"
            }
        ],
        "name": "getResult",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "pollCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "polls",
        "outputs": [
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "bool",
                "name": "active",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "tokenAddress",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "pollId",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "candidate",
                "type": "string"
            }
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "voteCost",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "pollId",
                "type": "uint256"
            }
        ],
        "name": "openPoll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "pollId",
                "type": "uint256"
            }
        ],
        "name": "closePoll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] # Замените на ABI контракта

contract = web3.eth.contract(address=CONTRACT_ADDRESS, abi=TOKEN_ABI)

import time


def get_valid_nonce(wallet_address):
    while True:
        latest_nonce = web3.eth.get_transaction_count(wallet_address, "latest")
        pending_nonce = web3.eth.get_transaction_count(wallet_address, "pending")

        if pending_nonce <= latest_nonce:
            return latest_nonce

        print(f"⚠️ Ожидание сброса pending nonce... (Latest: {latest_nonce}, Pending: {pending_nonce})")
        time.sleep(2)  # Ждем 2 секунды


# Pydantic-модель для создания голосования
class PollCreate(BaseModel):
    name: str
    candidates: list[str]


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/create/")
def create_poll(poll: PollCreate, db: Session = Depends(get_db), user: dict = Depends(is_admin)):
    if len(poll.candidates) < 2 or len(poll.candidates) > 8:
        raise HTTPException(status_code=400, detail="Количество кандидатов должно быть от 2 до 8")

    wallet_address = CREATOR_ADDRESS  # Используем адрес администратора

    nonce = get_valid_nonce(wallet_address)
    tx = contract.functions.createPoll(poll.name, poll.candidates).build_transaction({
        'from': wallet_address,
        'gas': 300000,
        'gasPrice': web3.eth.gas_price,
        'nonce': nonce
    })

    signed_tx = web3.eth.account.sign_transaction(tx,
                                                  'b4cec174d98688e762355891cbc52759bf5996cb7b47057d1b151b68e9454209')
    tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)

    new_poll = Poll(name=poll.name, candidates=poll.candidates)
    db.add(new_poll)
    db.commit()

    return {"message": "Голосование создано", "tx_hash": web3.to_hex(tx_hash)}


@router.get("/list/")
def get_polls(db: Session = Depends(get_db)):
    polls = db.query(Poll).all()
    return [{"id": poll.id, "name": poll.name, "candidates": poll.candidates} for poll in polls]


@router.get("/list/onchain/")
def get_polls_onchain():
    try:
        poll_count = contract.functions.pollCount().call()
        polls = []

        for i in range(poll_count):
            poll_info = contract.functions.polls(i).call()
            polls.append({"id": i, "name": poll_info[0], "active": poll_info[1]})

        return polls
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения голосований: {str(e)}")


@router.get("/polls/status/{poll_id}")
def get_poll_status(poll_id: int):
    try:
        poll_info = contract.functions.polls(poll_id).call()
        return {"id": poll_id, "name": poll_info[0], "active": poll_info[1]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения статуса: {str(e)}")


@router.get("/vote/status/{poll_id}/{user_address}")
def get_vote_status(poll_id: int, user_address: str):
    try:
        poll_info = contract.functions.polls(poll_id).call()
        voted = poll_info[3][Web3.to_checksum_address(user_address)]
        return {"user_address": user_address, "has_voted": voted}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка проверки голоса: {str(e)}")


def get_valid_nonce(wallet_address):
    """Ожидание корректного nonce, если pending > latest"""
    while True:
        latest_nonce = web3.eth.get_transaction_count(wallet_address, "latest")
        pending_nonce = web3.eth.get_transaction_count(wallet_address, "pending")

        if pending_nonce <= latest_nonce:
            return latest_nonce

        print(f"⚠️ Ожидание сброса pending nonce... (Latest: {latest_nonce}, Pending: {pending_nonce})")
        time.sleep(2)


@router.post("/open/{poll_id}")
def open_poll(poll_id: int, user: dict = Depends(is_admin)):
    """Открыть голосование (только админ)"""
    try:
        nonce = get_valid_nonce(CREATOR_ADDRESS)
        tx = contract.functions.openPoll(poll_id).build_transaction({
            'from': CREATOR_ADDRESS,
            'gas': 200000,
            'gasPrice': web3.eth.gas_price,
            'nonce': nonce
        })

        signed_tx = web3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)

        return {"message": "Голосование открыто", "tx_hash": web3.to_hex(tx_hash)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка открытия голосования: {str(e)}")


@router.post("/close/{poll_id}")
def close_poll(poll_id: int, user: dict = Depends(is_admin)):
    """Закрыть голосование (только админ)"""
    try:
        nonce = get_valid_nonce(CREATOR_ADDRESS)
        tx = contract.functions.closePoll(poll_id).build_transaction({
            'from': CREATOR_ADDRESS,
            'gas': 200000,
            'gasPrice': web3.eth.gas_price,
            'nonce': nonce
        })

        signed_tx = web3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)

        return {"message": "Голосование закрыто", "tx_hash": web3.to_hex(tx_hash)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка закрытия голосования: {str(e)}")