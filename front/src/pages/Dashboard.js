import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState("");
    const [hoverLogout, setHoverLogout] = useState(false);
    const [hoverVote, setHoverVote] = useState(false);
    const [hoverResults, setHoverResults] = useState(false);
    const [hoverCreatePoll, setHoverCreatePoll] = useState(false);
    const [hoverManagePolls, setHoverManagePolls] = useState(false);
    const [agaBalance, setAgaBalance] = useState(null); // Баланс AGA токенов

    const navigate = useNavigate();

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
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/"); // Перенаправление на логин, если нет токена
                return;
            }

            try {
                const response = await axios.get("http://127.0.0.1:8000/user/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);
                
                const balanceResponse = await axios.get(`http://127.0.0.1:8000/user/balance/${response.data.wallet_address}`);
                setAgaBalance(balanceResponse.data.balance); // Устанавливаем баланс в стейт

            } catch (error) {
                console.error("Ошибка загрузки пользователя:", error);
                setMessage("Ошибка загрузки пользователя.");
                localStorage.removeItem("token");
                navigate("/");
            }
        };

        fetchUserData();
    }, [navigate]);

    // 🔹 Стили (сохраняем общую стилистику)
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
        width: "500px",
        padding: "30px",
        borderRadius: "8px",
        backgroundColor: "rgba(30, 30, 47, 0.9)", // Полупрозрачный контейнер
        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
        color: "#FFFFFF",
    };

    const headerStyle = {
        marginBottom: "20px",
        textAlign: "center",
        color: "#00FFC2",
        fontSize: "1.5rem",
        fontWeight: 600,
        textShadow: "0 0 5px rgba(0,255,194,0.4)",
    };

    const userInfoStyle = {
        marginBottom: "20px",
        lineHeight: "1.6",
    };

    const buttonContainerStyle = {
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        justifyContent: "center",
        marginTop: "20px",
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

    // Функции для навигации по кнопкам
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const handleGoToVote = () => {
        navigate("/polls");
    };

    const handleGoToResults = () => {
        navigate("/results");
    };

    const handleGoToCreatePoll = () => {
        navigate("/create-poll");
    };

    const handleGoToManagePolls = () => {
        navigate("/admin");
    };

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                <h2 style={headerStyle}>Добро пожаловать!</h2>
                {user ? (
                    <>
                        <div style={userInfoStyle}>
                            <p><strong>Имя:</strong> {user.first_name} {user.last_name}</p>
                            <p><strong>Адрес почты:</strong> {user.email}</p>
                            <p><strong>Адрес кошелька:</strong> {user.wallet_address}</p>
                            <p><strong>Баланс AGA:</strong> {agaBalance !== null ? `${agaBalance} AGA` : "Загрузка..."}</p>
                            <p><strong>Роль:</strong> {user.role === "admin" ? "Администратор" : "Пользователь"}</p>
                        </div>
                        <div style={buttonContainerStyle}>

                            {/* Кнопка "Перейти к голосованию" */}
                            <button
                                onClick={handleGoToVote}
                                style={{
                                    ...buttonStyle,
                                    ...(hoverVote ? buttonHover : {})
                                }}
                                onMouseEnter={() => setHoverVote(true)}
                                onMouseLeave={() => setHoverVote(false)}
                            >
                                Перейти к голосованию
                            </button>

                            {/* Кнопка "Посмотреть результаты" */}
                            <button
                                onClick={handleGoToResults}
                                style={{
                                    ...buttonStyle,
                                    ...(hoverResults ? buttonHover : {})
                                }}
                                onMouseEnter={() => setHoverResults(true)}
                                onMouseLeave={() => setHoverResults(false)}
                            >
                                Посмотреть результаты
                            </button>

                            {/* Кнопки "Создать голосование" и "Открыть/Закрыть голосования" только для админа */}
                            {user.role === "admin" && (
                                <>
                                    <button
                                        onClick={handleGoToCreatePoll}
                                        style={{
                                            ...buttonStyle,
                                            ...(hoverCreatePoll ? buttonHover : {})
                                        }}
                                        onMouseEnter={() => setHoverCreatePoll(true)}
                                        onMouseLeave={() => setHoverCreatePoll(false)}
                                    >
                                        Создать голосование
                                    </button>

                                    <button
                                        onClick={handleGoToManagePolls}
                                        style={{
                                            ...buttonStyle,
                                            ...(hoverManagePolls ? buttonHover : {})
                                        }}
                                        onMouseEnter={() => setHoverManagePolls(true)}
                                        onMouseLeave={() => setHoverManagePolls(false)}
                                    >
                                        Открыть/Закрыть голосования
                                    </button>
                                </>
                            )}

                            {/* Кнопка "Выйти" */}
                            <button
                                onClick={handleLogout}
                                style={{
                                    ...buttonStyle,
                                    ...(hoverLogout ? buttonHover : {})
                                }}
                                onMouseEnter={() => setHoverLogout(true)}
                                onMouseLeave={() => setHoverLogout(false)}
                            >
                                Выйти
                            </button>
                        </div>
                    </>
                ) : (
                    <p>Загрузка...</p>
                )}

                {message && <p style={messageStyle}>{message}</p>}
            </div>
        </div>
    );
};

export default Dashboard;
