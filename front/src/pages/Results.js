import React, { useState, useEffect } from "react";
import axios from "axios";

const Results = () => {
    const [polls, setPolls] = useState([]);
    const [selectedPoll, setSelectedPoll] = useState(null);
    const [votes, setVotes] = useState({});
    const [message, setMessage] = useState("");
    const [hoverButton, setHoverButton] = useState(false);

    // Подключаем Google Font (Montserrat)
    useEffect(() => {
        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);
        return () => {
            document.head.removeChild(link);
        };
    }, []);

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

    async function fetchVotes() {
        if (!selectedPoll) {
            alert("Выберите голосование!");
            return;
        }

        setMessage("Загрузка результатов...");

        try {
            const selectedPollData = polls.find(p => p.id == selectedPoll);
            if (!selectedPollData) {
                setMessage("Ошибка: голосование не найдено!");
                return;
            }

            let results = {};
            for (let candidate of selectedPollData.candidates) {
                const response = await axios.get(`http://127.0.0.1:8000/votes/${selectedPoll}/${candidate}`);
                results[candidate] = response.data.votes;
            }

            setVotes(results);
            setMessage("");
        } catch (error) {
            console.error("Ошибка загрузки результатов:", error);
            setMessage("Ошибка загрузки результатов голосования.");
        }
    }

    // 🔹 Стили
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
        width: "600px",
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

    const selectBoxStyle = {
        display: "flex",
        gap: "10px",
        alignItems: "center",
    };

    const selectStyle = {
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #444",
        backgroundColor: "#2C2C3A",
        color: "#fff",
        outline: "none",
        fontSize: "0.95rem",
    };

    const buttonStyle = {
        padding: "10px 16px",
        borderRadius: "6px",
        border: "none",
        backgroundColor: "#00FFC2",
        color: "#000",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background-color 0.2s ease",
    };

    const buttonHover = {
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

    const resultsStyle = {
        marginTop: "20px",
    };

    const resultItemStyle = {
        marginBottom: "8px",
    };

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                <h1 style={headerStyle}>Результаты голосования</h1>

                {polls.length === 0 ? (
                    <p>Нет доступных голосований.</p>
                ) : (
                    <div style={selectBoxStyle}>
                        <label>Выберите голосование:</label>
                        <select
                            style={selectStyle}
                            onChange={(e) => setSelectedPoll(e.target.value)}
                        >
                            <option value="">-- Выберите --</option>
                            {polls.map((poll) => (
                                <option key={poll.id} value={poll.id}>{poll.name}</option>
                            ))}
                        </select>
                        <button
                            style={{
                                ...buttonStyle,
                                ...(hoverButton ? buttonHover : {})
                            }}
                            onMouseEnter={() => setHoverButton(true)}
                            onMouseLeave={() => setHoverButton(false)}
                            onClick={fetchVotes}
                        >
                            Показать результаты
                        </button>
                    </div>
                )}

                {message && <p style={messageStyle}>{message}</p>}

                {Object.keys(votes).length > 0 && (
                    <div style={resultsStyle}>
                        <h2>Результаты</h2>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            {Object.entries(votes).map(([candidate, voteCount]) => (
                                <li key={candidate} style={resultItemStyle}>
                                    {candidate}: {voteCount} голосов
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Results;
