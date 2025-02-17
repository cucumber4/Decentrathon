import React, { useState, useEffect } from "react";
import axios from "axios";

const Register = () => {
    // Основные данные + confirm_password
    const [formData, setFormData] = useState({
        nickname: "",
        first_name: "",
        last_name: "",
        phone: "",
        wallet_address: "",
        password: "",
        confirm_password: ""
    });

    const [message, setMessage] = useState("");
    const [isHover, setIsHover] = useState(false);
    const [disableSubmit, setDisableSubmit] = useState(false);

    // 🔹 При каждом вводе проверяем совпадение паролей
    useEffect(() => {
        if (formData.password && formData.confirm_password) {
            setDisableSubmit(formData.password !== formData.confirm_password);
        } else {
            setDisableSubmit(false);
        }
    }, [formData.password, formData.confirm_password]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Если пароли не совпадают, прерываем отправку
        if (formData.password !== formData.confirm_password) {
            setMessage("Пароли не совпадают!");
            return;
        }
        try {
            const { confirm_password, ...payload } = formData; // confirm_password не отправляем на бэкенд
            const response = await axios.post("http://127.0.0.1:8000/user/register", payload, {
                headers: { "Content-Type": "application/json" }
            });
            setMessage("Регистрация успешна!");
            console.log("Успех:", response.data);
        } catch (error) {
            setMessage("Ошибка регистрации: " + (error.response?.data?.detail || "Неизвестная ошибка"));
            console.error("Ошибка регистрации:", error.response?.data);
        }
    };

    // 🔹 Подключим Google Font (Montserrat) через inline-стиль
    // Обычно это делают в index.html, но для демонстрации можно так:
    useEffect(() => {
        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);
        return () => {
            document.head.removeChild(link);
        };
    }, []);

    // 🔹 Стили фона и общие
    const pageStyle = {
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        background: "radial-gradient(circle at top, #222 0%, #111 100%)",  // Тёмный градиент
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

    const buttonStyle = {
        padding: "12px",
        borderRadius: "6px",
        border: "none",
        backgroundColor: disableSubmit ? "#555" : "#00FFC2",
        color: "#000",
        fontWeight: 600,
        cursor: disableSubmit ? "not-allowed" : "pointer",
        transition: "background-color 0.2s ease",
    };

    const buttonHover = {
        backgroundColor: disableSubmit ? "#555" : "#00E6AE",
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
                <h2 style={headerStyle}>Регистрация</h2>
                <form onSubmit={handleSubmit} style={formStyle}>
                    <input
                        style={inputStyle}
                        type="text"
                        name="nickname"
                        placeholder="Никнейм"
                        value={formData.nickname}
                        onChange={handleChange}
                        required
                    />
                    <input
                        style={inputStyle}
                        type="text"
                        name="first_name"
                        placeholder="Имя"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        style={inputStyle}
                        type="text"
                        name="last_name"
                        placeholder="Фамилия"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                    />
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
                        type="text"
                        name="wallet_address"
                        placeholder="Адрес кошелька"
                        value={formData.wallet_address}
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
                    <input
                        style={inputStyle}
                        type="password"
                        name="confirm_password"
                        placeholder="Подтвердите пароль"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        required
                    />
                    <button
                        type="submit"
                        style={{ 
                            ...buttonStyle,
                            ...(isHover ? buttonHover : {})
                        }}
                        onMouseEnter={() => setIsHover(true)}
                        onMouseLeave={() => setIsHover(false)}
                        disabled={disableSubmit}
                    >
                        Зарегистрироваться
                    </button>
                </form>

                {message && <p style={messageStyle}>{message}</p>}
            </div>
        </div>
    );
};

export default Register;
