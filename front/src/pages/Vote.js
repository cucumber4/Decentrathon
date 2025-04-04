import React, { useState, useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";

const Vote = () => {
    const [polls, setPolls] = useState([]);
    const [message, setMessage] = useState("");
    const [isHover, setIsHover] = useState(null); // Хранит индекс кликнутой кнопки (или null)
    
    // Адреса контракта и токена (AGA)
    const TOKEN_ADDRESS = "0x024b770fd5E43258363651B5545efbf080d0775F";
    const VOTING_CONTRACT_ADDRESS = "0x0946E6cBd737764BdbEC76430d030d30c653A7f9";

    // Минимум из ABI: approve/allowance
    const TOKEN_ABI = [
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

    // Подключаем Montserrat
    useEffect(() => {
        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);
        return () => {
            document.head.removeChild(link);
        };
    }, []);

    // Загружаем список голосований
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

    // Функция голосования
    async function vote(pollId, candidate) {
        if (!pollId || !candidate) {
            alert("Пожалуйста, выберите голосование и кандидата!");
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
            // Проверяем allowance
            const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
            const allowance = await tokenContract.allowance(userAddress, VOTING_CONTRACT_ADDRESS);
            console.log(`Allowance: ${ethers.formatUnits(allowance, 18)} AGA`);

            // Если allowance < 10 токенов, делаем approve
            if (allowance < ethers.parseUnits("10", 18)) {
                setMessage("Выполняем approve на 10 AGA...");
                const approveTx = await tokenContract.approve(VOTING_CONTRACT_ADDRESS, ethers.parseUnits("10", 18));
                await approveTx.wait();
                setMessage("Approve выполнен! Теперь отправляем голос.");
            }

            // Запрос на сервер для получения "сырой" транзакции
            const response = await axios.post(
                `http://127.0.0.1:8000/votes/${pollId}/${candidate}`,
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            const txData = response.data.transaction;
            if (!txData) {
                alert("Ошибка: сервер не вернул транзакцию.");
                return;
            }

            // Подписываем транзакцию в MetaMask
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

    // 🔹 Стили (аналогичные прошлым страницам)
    const pageStyle = {
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        background: "radial-gradient(circle at top, #222 0%, #111 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Montserrat', sans-serif",
    };

    const containerStyle = {
        width: "800px",
        padding: "30px",
        borderRadius: "8px",
        backgroundColor: "rgba(30, 30, 47, 0.9)",
        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    };

    const headerStyle = {
        marginBottom: "20px",
        textAlign: "center",
        color: "#00FFC2",
        fontSize: "1.5rem",
        fontWeight: 600,
        textShadow: "0 0 5px rgba(0,255,194,0.4)",
    };

    const pollsWrapperStyle = {
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        justifyContent: "center",
    };

    const pollCardStyle = {
        width: "250px",
        backgroundColor: "#2C2C3A",
        padding: "16px",
        borderRadius: "8px",
        border: "1px solid #444",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        transition: "background-color 0.2s ease",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    };

    const pollTitleStyle = {
        fontSize: "1rem",
        fontWeight: 600,
        marginBottom: "10px",
    };

    const candidatesListStyle = {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    };

    const candidateButtonStyle = {
        padding: "8px",
        borderRadius: "6px",
        border: "none",
        backgroundColor: "#00FFC2",
        color: "#000",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background-color 0.2s ease",
        fontSize: "0.9rem",
        textAlign: "center",
    };

    const candidateButtonHover = {
        backgroundColor: "#00E6AE",
    };

    const messageStyle = {
        marginTop: "15px",
        textAlign: "center",
        fontSize: "0.95rem",
        backgroundColor: "#2C2C3A",
        padding: "10px",
        borderRadius: "6px",
    };

    // Локальный хук для ховера на кнопке кандидата
    const [hoveredCandidate, setHoveredCandidate] = useState(null); // {pollId, candidate} или null

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                <h1 style={headerStyle}>Голосование</h1>

                {polls.length === 0 ? (
                    <p>Нет доступных голосований.</p>
                ) : (
                    <div style={pollsWrapperStyle}>
                        {polls.map((poll) => (
                            <div key={poll.id} style={pollCardStyle}>
                                <div style={pollTitleStyle}>{poll.name}</div>
                                <div style={candidatesListStyle}>
                                    {poll.candidates.map((candidate) => {
                                        const isHovering = hoveredCandidate?.pollId === poll.id
                                            && hoveredCandidate?.candidate === candidate;
                                        return (
                                            <button
                                                key={candidate}
                                                style={{
                                                    ...candidateButtonStyle,
                                                    ...(isHovering ? candidateButtonHover : {})
                                                }}
                                                onMouseEnter={() => setHoveredCandidate({pollId: poll.id, candidate })}
                                                onMouseLeave={() => setHoveredCandidate(null)}
                                                onClick={() => vote(poll.id, candidate)}
                                            >
                                                {candidate}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {message && <p style={messageStyle}>{message}</p>}
            </div>
        </div>
    );
};

export default Vote;
