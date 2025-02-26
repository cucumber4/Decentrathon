from web3 import Web3

CREATOR_ADDRESS = "0xa21356475F98ABF66Fc39D390325e4002b75AEC4"
PRIVATE_KEY = "b4cec174d98688e762355891cbc52759bf5996cb7b47057d1b151b68e9454209"

RPC_URL = "https://sepolia.infura.io/v3/cbfec6723c0b4264b5b3dcf5cba569e9"
web3 = Web3(Web3.HTTPProvider(RPC_URL, {"timeout": 60}))

latest_nonce = web3.eth.get_transaction_count(CREATOR_ADDRESS, "latest")

pending_nonce = web3.eth.get_transaction_count(CREATOR_ADDRESS, "pending")
latest_nonce = web3.eth.get_transaction_count(CREATOR_ADDRESS, "latest")
print(f"Pending Nonce: {pending_nonce}, Latest Nonce: {latest_nonce}")
print(latest_nonce)
