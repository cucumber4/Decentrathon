from fastapi import APIRouter, HTTPException, Depends
from web3 import Web3
from utils.dependencies import get_current_user

router = APIRouter()

RPC_URL = "https://sepolia.infura.io/v3/cbfec6723c0b4264b5b3dcf5cba569e9"
web3 = Web3(Web3.HTTPProvider(RPC_URL, {"timeout": 60}))

VOTING_CONTRACT_ADDRESS = "0x0946E6cBd737764BdbEC76430d030d30c653A7f9"
VOTING_ABI = [
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
]

voting_contract = web3.eth.contract(address=VOTING_CONTRACT_ADDRESS, abi=VOTING_ABI)

@router.post("/{poll_id}/{candidate}")
def create_vote_transaction(poll_id: int, candidate: str, user: dict = Depends(get_current_user)):
    user_address = user["wallet_address"]

    # ✅ 1. Получаем актуальный nonce
    nonce = web3.eth.get_transaction_count(user_address, "latest")

    # ✅ 2. Проверяем баланс пользователя
    balance = web3.eth.get_balance(user_address)
    gas_price = web3.eth.gas_price
    estimated_gas = 200000
    gas_cost = estimated_gas * gas_price

    if balance < gas_cost:
        raise HTTPException(status_code=400, detail="Недостаточно средств на газ!")

    try:
        # ✅ 3. Строим транзакцию с правильным nonce
        tx = voting_contract.functions.vote(poll_id, candidate).build_transaction({
            'from': user_address,
            'gas': estimated_gas,
            'gasPrice': gas_price,
            'nonce': nonce  # ✅ Используем корректный nonce
        })

        return {"transaction": tx}  # ✅ Отправляем "сырую" транзакцию на фронт

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при создании транзакции: {str(e)}")
