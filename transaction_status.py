from web3 import Web3

#Подключаемся к сети Sepolia
from transaction_count import CREATOR_ADDRESS, PRIVATE_KEY

web3 = Web3(Web3.HTTPProvider("https://sepolia.infura.io/v3/cbfec6723c0b4264b5b3dcf5cba569e9"))

#Данные аккаунта
account = "0xa21356475F98ABF66Fc39D390325e4002b75AEC4"
private_key = "b4cec174d98688e762355891cbc52759bf5996cb7b47057d1b151b68e9454209"

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
