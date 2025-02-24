import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [step, setStep] = useState(1); // 1 - регистрация, 2 - подтверждение кода
    const [formData, setFormData] = useState({
        nickname: "",
        first_name: "",
        last_name: "",
        email: "",
        wallet_address: "",
        password: "",
        confirm_password: ""
    });
    const [verificationCode, setVerificationCode] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

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
        if (formData.password && formData.confirm_password) {
            if (formData.password !== formData.confirm_password) {
                setMessage("Пароли не совпадают!");
            } else {
                setMessage("");
            }
        }
    }, [formData.password, formData.confirm_password]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleVerificationChange = (e) => {
        setVerificationCode(e.target.value);
    };

    const handleSubmitRegistration = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirm_password) {
            setMessage("Пароли не совпадают!");
            return;
        }
        try {
            const { confirm_password, ...payload } = formData;
            const response = await axios.post("http://127.0.0.1:8000/user/register", payload, {
                headers: { "Content-Type": "application/json" }
            });
            setMessage(response.data.message);
            // Переходим ко второму шагу для ввода кода
            setStep(2);
        } catch (error) {
            setMessage("Ошибка регистрации: " + (error.response?.data?.detail || "Неизвестная ошибка"));
            console.error("Ошибка регистрации:", error.response?.data);
        }
    };

    const handleSubmitVerification = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://127.0.0.1:8000/user/verify", {
                email: formData.email,
                code: verificationCode
            }, {
                headers: { "Content-Type": "application/json" }
            });
            setMessage(response.data.message);
            // После подтверждения можно перенаправить пользователя, например, на логин или дашборд
            setTimeout(() => navigate("/"), 1500);
        } catch (error) {
            setMessage("Ошибка верификации: " + (error.response?.data?.detail || "Неизвестная ошибка"));
            console.error("Ошибка верификации:", error.response?.data);
        }
    };

    // Стили (аналогичные предыдущим)
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
        backgroundColor: "#00FFC2",
        color: "#000",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background-color 0.2s ease",
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
                {step === 1 && (
                    <>
                        <h2 style={headerStyle}>Регистрация</h2>
                        <form onSubmit={handleSubmitRegistration} style={formStyle}>
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
                                type="email"
                                name="email"
                                placeholder="Адрес почты"
                                value={formData.email}
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
                            <button type="submit" style={buttonStyle}>Зарегистрироваться</button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2 style={headerStyle}>Введите код подтверждения</h2>
                        <form onSubmit={handleSubmitVerification} style={formStyle}>
                            <input
                                style={inputStyle}
                                type="text"
                                name="code"
                                placeholder="Код подтверждения"
                                value={verificationCode}
                                onChange={handleVerificationChange}
                                required
                            />
                            <button type="submit" style={buttonStyle}>Подтвердить</button>
                        </form>
                    </>
                )}
                {message && <p style={messageStyle}>{message}</p>}
            </div>
        </div>
    );
};

export default Register;
