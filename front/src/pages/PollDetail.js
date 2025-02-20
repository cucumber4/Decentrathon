import React, { useState, useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { useParams, useNavigate } from "react-router-dom";

const PollDetail = () => {
    const { pollId } = useParams();           // Получаем ID из URL для загрузки данных (не для голосования!)
    const [poll, setPoll] = useState(null);   // Текущее голосование
    const [message, setMessage] = useState("");
    const [hoveredCandidate, setHoveredCandidate] = useState(null);
    const navigate = useNavigate();

    const TOKEN_ADDRESS = "0x024b770fd5E43258363651B5545efbf080d0775F";
    const VOTING_CONTRACT_ADDRESS = "0x0946E6cBd737764BdbEC76430d030d30c653A7f9";
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

    // Пример отображения кандидатов: если в данных хранится число, то используем маппинг.
    const candidateMapping = {
        0: "",
    };

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

    // Загружаем детали одного голосования (из базы)
    useEffect(() => {
        fetchPollDetail();
    }, []);

    async function fetchPollDetail() {
        try {
            const pollsResponse = await axios.get("http://127.0.0.1:8000/polls/list/");
            const allPolls = pollsResponse.data;
            const foundPoll = allPolls.find((p) => p.id == pollId);
            if (!foundPoll) {
                setMessage("Голосование не найдено!");
                return;
            }
            setPoll(foundPoll);
        } catch (error) {
            console.error("Ошибка загрузки голосования:", error);
            setMessage("Ошибка загрузки голосования.");
        }
    }

    async function vote(candidate) {
        if (!poll || !candidate) {
            alert("Выберите кандидата!");
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

            if (allowance < ethers.parseUnits("10", 18)) {
                setMessage("Выполняем approve на 10 AGA...");
                const approveTx = await tokenContract.approve(VOTING_CONTRACT_ADDRESS, ethers.parseUnits("10", 18));
                await approveTx.wait();
                setMessage("Approve выполнен! Теперь отправляем голос.");
            }

            // Отправляем запрос на сервер для получения "сырой" транзакции
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

    // Стили
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
        width: "650px",
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

    const pollNameStyle = {
        fontSize: "1.2rem",
        fontWeight: 600,
        marginBottom: "10px",
    };

    const candidatesListStyle = {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    };

    const candidateButtonStyle = {
        padding: "12px",
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

    if (!poll) {
        return (
            <div style={pageStyle}>
                <div style={containerStyle}>
                    <h2 style={headerStyle}>Загрузка...</h2>
                    {message && <p style={messageStyle}>{message}</p>}
                </div>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                <h2 style={headerStyle}>Голосование</h2>
                <div style={pollNameStyle}>{poll.name}</div>
                <div style={candidatesListStyle}>
                    {poll.candidates.map((candidate) => {
                        // Если кандидат хранится как число, используем mapping
                        const candidateName = typeof candidate === "number" ? 
                            (candidateMapping[candidate] || candidate.toString()) : candidate;
                        const isHovering = hoveredCandidate === candidateName;
                        return (
                            <button
                                key={candidate}
                                style={{
                                    ...candidateButtonStyle,
                                    ...(isHovering ? candidateButtonHover : {})
                                }}
                                onMouseEnter={() => setHoveredCandidate(candidateName)}
                                onMouseLeave={() => setHoveredCandidate(null)}
                                onClick={() => vote(candidateName)}
                            >
                                {candidateName}
                            </button>
                        );
                    })}
                </div>
                {message && <p style={messageStyle}>{message}</p>}
            </div>
        </div>
    );
};

export default PollDetail;
