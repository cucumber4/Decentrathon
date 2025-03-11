import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState("");
    const [agaBalance, setAgaBalance] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/");
                return;
            }

            try {
                const response = await axios.get("http://127.0.0.1:8000/user/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);

                const balanceResponse = await axios.get(`http://127.0.0.1:8000/user/balance/${response.data.wallet_address}`);
                setAgaBalance(balanceResponse.data.balance);
            } catch (error) {
                console.error("Ошибка загрузки пользователя:", error);
                setMessage("Ошибка загрузки пользователя.");
                localStorage.removeItem("token");
                navigate("/");
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleRequestTokens = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post("http://127.0.0.1:8000/tokens/request-tokens", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.detail || "Ошибка запроса токенов");
        }
    };
    

    return (
        <div style={{ minHeight: "100vh", background: "#222", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Montserrat, sans-serif" }}>
            <div style={{ width: "500px", padding: "30px", borderRadius: "8px", backgroundColor: "rgba(30, 30, 47, 0.9)", boxShadow: "0 0 10px rgba(0,0,0,0.3)", color: "#FFFFFF" }}>
                <h2 style={{ textAlign: "center", color: "#00FFC2", fontSize: "1.5rem", fontWeight: 600 }}>Добро пожаловать!</h2>

                {user ? (
                    <>
                        <div style={{ marginBottom: "20px", lineHeight: "1.6" }}>
                            <p><strong>Имя:</strong> {user.first_name} {user.last_name}</p>
                            <p><strong>Адрес почты:</strong> {user.email}</p>
                            <p><strong>Адрес кошелька:</strong> {user.wallet_address}</p>
                            <p><strong>Баланс AGA:</strong> {agaBalance !== null ? `${agaBalance} AGA` : "Загрузка..."}</p>
                            <p><strong>Роль:</strong> {user.role === "admin" ? "Администратор" : "Пользователь"}</p>
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px" }}>
                            <button onClick={() => navigate("/polls")} style={buttonStyle}>Перейти к голосованию</button>
                            <button onClick={() => navigate("/results")} style={buttonStyle}>Посмотреть результаты</button>

                            {/* Кнопка "Запросить токены" для пользователей */}
                            {user.role === "user" && (
                                <button onClick={handleRequestTokens} style={buttonStyle}>Запросить 10 AGA</button>
                            )}

                            {/* Кнопки для админа */}
                            {user.role === "admin" && (
                                <>
                                    <button onClick={() => navigate("/create-poll")} style={buttonStyle}>Создать голосование</button>
                                    <button onClick={() => navigate("/admin")} style={buttonStyle}>Открыть/Закрыть голосования</button>
                                    <button onClick={() => navigate("/proposals")} style={buttonStyle}>Просмотреть предложения</button>
                                    <button onClick={() => navigate("/token-requests")} style={buttonStyle}>Запросы на токены</button>
                                </>
                            )}

                            <button onClick={() => { localStorage.removeItem("token"); navigate("/"); }} style={buttonStyle}>Выйти</button>
                        </div>
                    </>
                ) : (
                    <p>Загрузка...</p>
                )}

                {message && <p style={{ textAlign: "center", backgroundColor: "#2C2C3A", padding: "10px", borderRadius: "6px" }}>{message}</p>}
            </div>
        </div>
    );
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

export default Dashboard;
