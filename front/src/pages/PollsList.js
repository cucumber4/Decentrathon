import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PollsList = () => {
    const [polls, setPolls] = useState([]);
    const [message, setMessage] = useState("");
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [loading, setLoading] = useState(true); // Флаг загрузки данных

    const navigate = useNavigate();

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

    useEffect(() => {
        async function fetchPolls() {
            try {
                const response = await axios.get("http://127.0.0.1:8000/polls/list/onchain/active");
                setPolls(response.data);
            } catch (error) {
                console.error("Ошибка загрузки голосований:", error);
                setMessage("Ошибка загрузки голосований.");
            } finally {
                setTimeout(() => setLoading(false), 1000); // ✅ Добавляем небольшую задержку (1 сек.)
            }
        }

        fetchPolls();
    }, []);

    // При клике на голосование → переход на страницу деталей
    function handlePollClick(pollId) {
        navigate(`/vote/${pollId}`);
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
        cursor: "pointer",
        transition: "background-color 0.2s ease",
        border: "1px solid #444",
    };

    const pollItemHover = {
        backgroundColor: "#3A3A4C",
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
                <h1 style={headerStyle}>Список голосований</h1>

                {loading ? (
                    <p style={{ textAlign: "center" }}>Загрузка голосований...</p>
                ) : polls.length === 0 ? (
                    <p style={{ textAlign: "center" }}>Нет доступных голосований.</p>
                ) : (
                    <ul style={pollsListStyle}>
                        {polls.map((poll, index) => {
                            const isHover = index === hoveredIndex;
                            return (
                                <li
                                    key={poll.id}
                                    style={{
                                        ...pollItemStyle,
                                        ...(isHover ? pollItemHover : {}),
                                    }}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    onClick={() => handlePollClick(poll.id)}
                                >
                                    {poll.name}
                                </li>
                            );
                        })}
                    </ul>
                )}

                {message && <p style={messageStyle}>{message}</p>}
            </div>
        </div>
    );
};

export default PollsList;
