from web3 import Web3

#Подключаемся к сети Sepolia
from transaction_count import CREATOR_ADDRESS, PRIVATE_KEY

web3 = Web3(Web3.HTTPProvider("https://sepolia.infura.io/v3/cbfec6723c0b4264b5b3dcf5cba569e9"))

#Данные аккаунта
account = "0x30dee139d103b538E9824e7F8Bd2aFA176e5e2Ad"
private_key = "800a10888524d269e63e8a8d09004edf8560e08f011313e1243c363ea6ceb8cd"

#Получаем текущий nonce
nonce = web3.eth.get_transaction_count(account, "pending")
print(f"Текущий nonce: {nonce}")

tx = {
    'to': CREATOR_ADDRESS,
    'value': 0,
    'gas': 21000,
    'gasPrice': int(web3.eth.gas_price * 1.5),
    'nonce': 59 #Необходимо менять что бы сбивать тх
}
signed_tx = web3.eth.account.sign_transaction(tx, PRIVATE_KEY)
tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
print(f"Отправлена пустая транзакция для ускорения: {web3.to_hex(tx_hash)}")


#Подписываем транзакцию
signed_tx = web3.eth.account.sign_transaction(tx, private_key)

#Отправляем подписанную транзакцию с правильным атрибутом
tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)

print(f"Очистка nonce отправлена! TX Hash: {web3.to_hex(tx_hash)}")
