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

    nonce = web3.eth.get_transaction_count(user_address, "latest")

    # актуальные данные по газу (EIP-1559)
    base_fee = web3.eth.fee_history(1, "latest")["baseFeePerGas"][-1]
    max_priority_fee = web3.to_wei(2, "gwei")
    max_fee = base_fee + max_priority_fee

    try:
        estimated_gas = voting_contract.functions.vote(poll_id, candidate).estimate_gas({
            'from': user_address
        })

        gas_cost = estimated_gas * max_fee
        balance = web3.eth.get_balance(user_address)
        if balance < gas_cost:
            raise HTTPException(status_code=400, detail="Недостаточно ETH для оплаты газа!")

        tx = voting_contract.functions.vote(poll_id, candidate).build_transaction({
            'from': user_address,
            'gas': estimated_gas,
            'maxPriorityFeePerGas': max_priority_fee,
            'maxFeePerGas': max_fee,
            'nonce': nonce,
            'chainId': 11155111
        })

        return {"transaction": tx}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при создании транзакции: {str(e)}")


@router.get("/{poll_id}/{candidate}")
def get_votes(poll_id: int, candidate: str):
    votes = voting_contract.functions.getResult(poll_id, candidate).call()
    return {"poll_id": poll_id, "candidate": candidate, "votes": votes}
