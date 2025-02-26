import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
    const [polls, setPolls] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true); // Флаг загрузки данных

    useEffect(() => {
        fetchPolls();
    }, []);

    async function fetchPolls() {
        try {
            const response = await axios.get("http://127.0.0.1:8000/polls/list/onchain/");
            setPolls(response.data);
        } catch (error) {
            console.error("Ошибка загрузки голосований:", error);
            setMessage("Ошибка загрузки голосований.");
        } finally {
            setTimeout(() => setLoading(false), 1000); // Задержка в 1 секунду для плавной загрузки
        }
    }

    async function togglePollStatus(pollId, isActive) {
        const endpoint = isActive
            ? `http://127.0.0.1:8000/polls/close/${pollId}`
            : `http://127.0.0.1:8000/polls/open/${pollId}`;

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(endpoint, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage(response.data.message);
            fetchPolls(); // Обновить список после изменения
        } catch (error) {
            console.error("Ошибка при изменении статуса голосования:", error);
            setMessage("Ошибка изменения статуса голосования.");
        }
    }

    // 🔹 Стили (единый дизайн с остальными страницами)
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
        textAlign: "center",
        color: "#00FFC2",
        fontSize: "1.5rem",
        fontWeight: 600,
        textShadow: "0 0 5px rgba(0,255,194,0.4)",
    };

    const pollsListStyle = {
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    };

    const pollItemStyle = {
        backgroundColor: "#2C2C3A",
        padding: "12px",
        borderRadius: "6px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid #444",
    };

    const buttonStyle = {
        padding: "8px 12px",
        borderRadius: "6px",
        border: "none",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background-color 0.2s ease",
        fontSize: "0.9rem",
        textAlign: "center",
    };

    const openButton = {
        ...buttonStyle,
        backgroundColor: "#00FFC2",
        color: "#000",
    };

    const closeButton = {
        ...buttonStyle,
        backgroundColor: "#FF4D4D",
        color: "#000",
    };

    const messageStyle = {
        marginTop: "15px",
        textAlign: "center",
        fontSize: "0.95rem",
        backgroundColor: "#2C2C3A",
        padding: "10px",
        borderRadius: "6px",
    };

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                <h1 style={headerStyle}>Админ Панель</h1>

                {loading ? (
                    <p style={{ textAlign: "center" }}>Загрузка голосований...</p>
                ) : polls.length === 0 ? (
                    <p style={{ textAlign: "center" }}>Нет доступных голосований.</p>
                ) : (
                    <ul style={pollsListStyle}>
                        {polls.map((poll) => (
                            <li key={poll.id} style={pollItemStyle}>
                                <div>
                                    <strong>{poll.name}</strong> —{" "}
                                    <span style={{ color: poll.active ? "limegreen" : "red" }}>
                                        {poll.active ? "Открыто" : "Закрыто"}
                                    </span>
                                </div>
                                <button
                                    onClick={() => togglePollStatus(poll.id, poll.active)}
                                    style={poll.active ? closeButton : openButton}
                                >
                                    {poll.active ? "Закрыть" : "Открыть"}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {message && <p style={messageStyle}>{message}</p>}
            </div>
        </div>
    );
};

export default AdminDashboard;
