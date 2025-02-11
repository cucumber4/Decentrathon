from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from controllers.registration_router import CREATOR_ADDRESS
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
CONTRACT_ADDRESS = "0xbb24d6d3876db623B602b44A45115bc721a252fe" # ✅ Храним в переменной окружения
TOKEN_ABI = [
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
    }
]  # Замените на ABI контракта

contract = web3.eth.contract(address=CONTRACT_ADDRESS, abi=TOKEN_ABI)


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

    tx = contract.functions.createPoll(poll.name, poll.candidates).build_transaction({
        'from': wallet_address,
        'gas': 300000,
        'gasPrice': web3.eth.gas_price,
        'nonce': web3.eth.get_transaction_count(wallet_address, "pending")
    })

    signed_tx = web3.eth.account.sign_transaction(tx, 'b4cec174d98688e762355891cbc52759bf5996cb7b47057d1b151b68e9454209')
    tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)

    new_poll = Poll(name=poll.name, candidates=poll.candidates)
    db.add(new_poll)
    db.commit()

    return {"message": "Голосование создано", "tx_hash": web3.to_hex(tx_hash)}

