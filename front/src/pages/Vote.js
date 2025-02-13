import React, { useState, useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";

const Vote = () => {
    const [polls, setPolls] = useState([]);
    const [selectedPoll, setSelectedPoll] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState("");
    const [message, setMessage] = useState("");

    const TOKEN_ADDRESS = "0x024b770fd5E43258363651B5545efbf080d0775F"; // 🔴 Укажи адрес AGA-токена
    const VOTING_CONTRACT_ADDRESS = "0x0946E6cBd737764BdbEC76430d030d30c653A7f9";
    const TOKEN_ABI = [ 
        // 🔴 Добавь ABI токена (нужно только `approve` и `allowance`)
        {
            "constant": false,
            "inputs": [
                { "name": "spender", "type": "address" },
                { "name": "amount", "type": "uint256" }
            ],
            "name": "approve",
            "outputs": [{ "name": "", "type": "bool" }],
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                { "name": "owner", "type": "address" },
                { "name": "spender", "type": "address" }
            ],
            "name": "allowance",
            "outputs": [{ "name": "", "type": "uint256" }],
            "type": "function"
        }
    ];

    useEffect(() => {
        fetchPolls();
    }, []);

    async function fetchPolls() {
        try {
            const response = await axios.get("http://127.0.0.1:8000/polls/list/");
            setPolls(response.data);
        } catch (error) {
            console.error("Ошибка загрузки голосований:", error);
            setMessage("Ошибка загрузки голосований.");
        }
    }

    async function vote() {
        if (!selectedPoll || !selectedCandidate) {
            alert("Выберите голосование и кандидата!");
            return;
        }

        if (!window.ethereum) {
            alert("MetaMask не установлен!");
            return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        try {
            const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
            
            // 🔴 Проверяем `allowance`
            const allowance = await tokenContract.allowance(userAddress, VOTING_CONTRACT_ADDRESS);
            console.log(`Allowance: ${ethers.formatUnits(allowance, 18)} AGA`);

            if (allowance < ethers.parseUnits("10", 18)) {
                setMessage("Выполняем approve на 10 AGA...");
                
                const approveTx = await tokenContract.approve(VOTING_CONTRACT_ADDRESS, ethers.parseUnits("10", 18));
                await approveTx.wait();
                
                setMessage("Approve выполнен! Теперь отправляем голос.");
            }

            // 🔴 Запрос "сырой" транзакции с сервера
            const response = await axios.post(
                `http://127.0.0.1:8000/vote/${selectedPoll}/${selectedCandidate}`,
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            const txData = response.data.transaction;
            if (!txData) {
                alert("Ошибка: сервер не вернул транзакцию.");
                return;
            }

            // 🔵 Подписываем транзакцию в MetaMask
            const tx = await signer.sendTransaction({
                to: txData.to,
                value: txData.value ? ethers.toBigInt(txData.value) : 0n,
                gasLimit: txData.gas,
                gasPrice: txData.gasPrice,
                nonce: txData.nonce,
                data: txData.data
            });

            setMessage(`Голос отправлен! Транзакция: ${tx.hash}`);

        } catch (error) {
            console.error("Ошибка при голосовании:", error);
            setMessage(`Ошибка при голосовании: ${error.response?.data?.detail || "Неизвестная ошибка"}`);
        }
    }

    return (
        <div>
            <h1>Голосование</h1>
            {polls.length === 0 ? (
                <p>Нет доступных голосований.</p>
            ) : (
                <div>
                    <label>Выберите голосование:</label>
                    <select onChange={(e) => setSelectedPoll(e.target.value)}>
                        <option value="">-- Выберите --</option>
                        {polls.map((poll) => (
                            <option key={poll.id} value={poll.id}>{poll.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {selectedPoll && (
                <div>
                    <label>Выберите кандидата:</label>
                    <select onChange={(e) => setSelectedCandidate(e.target.value)}>
                        <option value="">-- Выберите --</option>
                        {polls.find(p => p.id == selectedPoll)?.candidates.map((candidate, index) => (
                            <option key={index} value={candidate}>{candidate}</option>
                        ))}   
                    </select>
                    <button onClick={vote}>Проголосовать</button>
                </div>
            )}

            {message && <p>{message}</p>}
        </div>
    );
};

export default Vote;
