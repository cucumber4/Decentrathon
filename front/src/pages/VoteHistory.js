import React, { useEffect, useState } from "react";
import axios from "axios";

const VoteHistory = () => {
    const [history, setHistory] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchHistory();
    }, []);

    async function fetchHistory() {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://127.0.0.1:8000/votes/vote-history", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(response.data);
        } catch (error) {
            setMessage("Ошибка загрузки истории голосований");
        }
    }

    return (
        <div style={{ textAlign: "center", padding: "30px", color: "#FFFFFF", fontFamily: "Montserrat, sans-serif", background: "#222", minHeight: "100vh" }}>
            <h2>История голосований</h2>

            {history.length === 0 ? <p>Вы еще не участвовали в голосованиях</p> : (
                <ul style={{ listStyleType: "none", padding: 0 }}>
                    {history.map((entry) => (
                        <li key={entry.poll_id} style={{ marginBottom: "15px", background: "#333", padding: "10px", borderRadius: "6px" }}>
                            <p>Голосование #{entry.poll_id}</p>
                            <p>{new Date(entry.timestamp).toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
            )}

            {message && <p>{message}</p>}
        </div>
    );
};

export default VoteHistory;
