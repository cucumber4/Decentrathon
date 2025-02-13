import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
    const [polls, setPolls] = useState([]);
    const [message, setMessage] = useState("");

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

    return (
        <div style={{ maxWidth: "600px", margin: "auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px" }}>
            <h2>Админ Панель</h2>

            {polls.length === 0 ? (
                <p>Нет активных голосований.</p>
            ) : (
                <ul>
                    {polls.map((poll) => (
                        <li key={poll.id}>
                            <strong>{poll.name}</strong> — 
                            <span style={{ color: poll.active ? "green" : "red" }}>
                                {poll.active ? "Открыто" : "Закрыто"}
                            </span>
                            <button onClick={() => togglePollStatus(poll.id, poll.active)} style={{ marginLeft: "10px" }}>
                                {poll.active ? "Закрыть" : "Открыть"}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {message && <p>{message}</p>}
        </div>
    );
};

export default AdminDashboard;
