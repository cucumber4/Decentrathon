from fastapi import APIRouter, HTTPException, Depends
from web3 import Web3
from utils.dependencies import get_current_user

router = APIRouter()

RPC_URL = "https://sepolia.infura.io/v3/cbfec6723c0b4264b5b3dcf5cba569e9"
web3 = Web3(Web3.HTTPProvider(RPC_URL, {"timeout": 60}))

VOTING_CONTRACT_ADDRESS = "0x024b770fd5E43258363651B5545efbf080d0775F"
VOTING_ABI = [
    {"constant": False, "inputs": [{"name": "pollId", "type": "uint256"}, {"name": "candidate", "type": "string"}],
     "name": "vote", "outputs": [], "type": "function"}
]
voting_contract = web3.eth.contract(address=VOTING_CONTRACT_ADDRESS, abi=VOTING_ABI)


@router.post("/{poll_id}/{candidate}")
def create_vote_transaction(poll_id: int, candidate: str, user: dict = Depends(get_current_user)):
    user_address = user["wallet_address"]

    nonce = web3.eth.get_transaction_count(user_address, "pending")

    tx = voting_contract.functions.vote(poll_id, candidate).build_transaction({
        'from': user_address,
        'gas': 200000,
        'gasPrice': web3.eth.gas_price,
        'nonce': nonce
    })

    return {"message": "Подпишите транзакцию", "transaction": tx}
