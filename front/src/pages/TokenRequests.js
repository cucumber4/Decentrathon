import React, { useEffect, useState } from "react";
import axios from "axios";

const TokenRequests = () => {
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchRequests();
    }, []);

    async function fetchRequests() {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("/api/tokens/token-requests", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(response.data);
        } catch (error) {
            setMessage("Ошибка загрузки запросов");
        }
    }

    async function handleApprove(id) {
        try {
            const token = localStorage.getItem("token");
            await axios.post(`/api/tokens/approve-request/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRequests();
        } catch (error) {
            setMessage("Ошибка при одобрении запроса.");
        }
    }

    async function handleReject(id) {
        try {
            const token = localStorage.getItem("token");
            await axios.post(`/api/tokens/reject-request/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRequests();
        } catch (error) {
            setMessage("Ошибка при отклонении запроса.");
        }
    }

    const buttonStyle = {
        padding: "10px 16px",
        borderRadius: "6px",
        border: "none",
        backgroundColor: "#00FFC2",
        color: "#000",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background-color 0.2s ease",
        margin: "5px"
    };

    return (
        <div style={{ textAlign: "center", padding: "30px", color: "#FFFFFF", fontFamily: "Montserrat, sans-serif", background: "#222", minHeight: "100vh" }}>
            <h2>Запросы на AGA</h2>

            {requests.length === 0 ? <p>Нет новых запросов</p> : (
                <ul style={{ listStyleType: "none", padding: 0 }}>
                    {requests.map((req) => (
                        <li key={req.id} style={{ marginBottom: "15px", background: "#333", padding: "10px", borderRadius: "6px" }}>
                            <p>{req.nickname}</p>
                            <button onClick={() => handleApprove(req.id)} style={buttonStyle}>Одобрить</button>
                            <button onClick={() => handleReject(req.id)} style={{ ...buttonStyle, backgroundColor: "red", color: "#fff" }}>Отклонить</button>
                        </li>
                    ))}
                </ul>
            )}

            {message && <p>{message}</p>}
        </div>
    );
};

export default TokenRequests;
