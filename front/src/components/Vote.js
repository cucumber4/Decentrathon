import React, { useState } from "react";
import { ethers } from "ethers";

const Vote = ({ pollId, candidate }) => {
    const [message, setMessage] = useState("");

    async function vote() {
        if (!window.ethereum) {
            alert("MetaMask не установлен!");
            return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum); // ✅ Новый способ
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        // Запрашиваем у сервера "сырую" транзакцию
        const response = await fetch(`http://127.0.0.1:8000/vote/${pollId}/${candidate}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });

        const data = await response.json();
        if (!data.transaction) {
            alert("Ошибка при получении транзакции!");
            return;
        }

        // Подписываем транзакцию в MetaMask
        const signedTx = await signer.sendTransaction(data.transaction);
        setMessage(`Голос отправлен! Транзакция: ${signedTx.hash}`);
    }

    return (
        <div>
            <h2>Голосование</h2>
            <button onClick={vote}>Проголосовать за {candidate}</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Vote;
