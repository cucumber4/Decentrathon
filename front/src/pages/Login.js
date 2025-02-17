import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [formData, setFormData] = useState({
        phone: "",
        password: "",
    });
    const [message, setMessage] = useState("");
    const [isHoverLogin, setIsHoverLogin] = useState(false);
    const [isHoverRegister, setIsHoverRegister] = useState(false);
    const navigate = useNavigate(); // Используем useNavigate для редиректа

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://127.0.0.1:8000/user/login", formData, {
                headers: { "Content-Type": "application/json" }
            });

            const { access_token } = response.data;

            // ✅ Сохраняем токен в localStorage
            localStorage.setItem("token", access_token);
            setMessage("Авторизация успешна! Перенаправление...");
            setTimeout(() => navigate("/dashboard"), 1500);
        } catch (error) {
            setMessage("Ошибка авторизации: " + (error.response?.data?.detail || "Неизвестная ошибка"));
            console.error("Ошибка авторизации:", error.response?.data);
        }
    };

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
        width: "420px",
        padding: "30px",
        borderRadius: "8px",
        backgroundColor: "rgba(30, 30, 47, 0.9)", // Полупрозрачный контейнер
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

    const formStyle = {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    };

    const inputStyle = {
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #444",
        backgroundColor: "#2C2C3A",
        color: "#fff",
        outline: "none",
        fontSize: "0.95rem",
    };

    // ✅ Меняем расположение кнопок на “столбик”
    const buttonContainerStyle = {
        display: "flex",
        flexDirection: "column",  // колоночное расположение
        gap: "10px",
        marginTop: "8px",
    };

    const buttonStyle = {
        padding: "12px",
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

    // Кнопка "Зарегистрироваться"
    const handleRegisterClick = () => {
        navigate("/register");
    };

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                <h2 style={headerStyle}>Вход в систему</h2>
                <form onSubmit={handleSubmit} style={formStyle}>
                    <input
                        style={inputStyle}
                        type="tel"
                        name="phone"
                        placeholder="Номер телефона"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                    <input
                        style={inputStyle}
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <div style={buttonContainerStyle}>
                        <button
                            type="submit"
                            style={{
                                ...buttonStyle,
                                ...(isHoverLogin ? buttonHover : {})
                            }}
                            onMouseEnter={() => setIsHoverLogin(true)}
                            onMouseLeave={() => setIsHoverLogin(false)}
                        >
                            Войти
                        </button>
                        <button
                            type="button"
                            style={{
                                ...buttonStyle,
                                ...(isHoverRegister ? buttonHover : {})
                            }}
                            onMouseEnter={() => setIsHoverRegister(true)}
                            onMouseLeave={() => setIsHoverRegister(false)}
                            onClick={handleRegisterClick}
                        >
                            Регистрация
                        </button>
                    </div>
                </form>
                {message && <p style={messageStyle}>{message}</p>}
            </div>
        </div>
    );
};

export default Login;
