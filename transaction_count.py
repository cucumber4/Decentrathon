from web3 import Web3

# Данные кошелька
CREATOR_ADDRESS = "0x30dee139d103b538E9824e7F8Bd2aFA176e5e2Ad"
PRIVATE_KEY = "800a10888524d269e63e8a8d09004edf8560e08f011313e1243c363ea6ceb8cd"

# Подключение к сети Ethereum Sepolia
RPC_URL = "https://sepolia.infura.io/v3/cbfec6723c0b4264b5b3dcf5cba569e9"
web3 = Web3(Web3.HTTPProvider(RPC_URL, {"timeout": 60}))

# Получаем latest nonce (НЕ pending!)
latest_nonce = web3.eth.get_transaction_count(CREATOR_ADDRESS, "latest")

pending_nonce = web3.eth.get_transaction_count(CREATOR_ADDRESS, "pending")
latest_nonce = web3.eth.get_transaction_count(CREATOR_ADDRESS, "latest")
print(f"Pending Nonce: {pending_nonce}, Latest Nonce: {latest_nonce}")
print(latest_nonce)