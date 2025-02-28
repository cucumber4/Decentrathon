import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [message, setMessage] = useState("");
    const [hoverLogin, setHoverLogin] = useState(false);
    const [hoverRegister, setHoverRegister] = useState(false);
    const [hoverForgot, setHoverForgot] = useState(false);
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
            localStorage.setItem("token", access_token);
            setMessage("Авторизация успешна! Перенаправление...");
            setTimeout(() => navigate("/dashboard"), 1500);
        } catch (error) {
            setMessage("Ошибка авторизации: " + (error.response?.data?.detail || "Неизвестная ошибка"));
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#111", fontFamily: "Montserrat, sans-serif" }}>
            <div style={{ width: "420px", padding: "30px", borderRadius: "8px", backgroundColor: "rgba(30, 30, 47, 0.9)", boxShadow: "0 0 10px rgba(0,0,0,0.3)", color: "#FFFFFF" }}>
                <h2 style={{ textAlign: "center", color: "#00FFC2", fontSize: "1.5rem", fontWeight: 600 }}>Вход в систему</h2>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <input type="email" name="email" placeholder="Адрес почты" value={formData.email} onChange={handleChange} required style={{ padding: "10px", borderRadius: "6px", backgroundColor: "#2C2C3A", color: "#fff", border: "1px solid #444" }} />
                    <input type="password" name="password" placeholder="Пароль" value={formData.password} onChange={handleChange} required style={{ padding: "10px", borderRadius: "6px", backgroundColor: "#2C2C3A", color: "#fff", border: "1px solid #444" }} />

                    <button type="submit" style={{ padding: "12px", borderRadius: "6px", border: "none", backgroundColor: "#00FFC2", color: "#000", fontWeight: 600, cursor: "pointer", transition: "background-color 0.2s ease" }}
                        onMouseEnter={() => setHoverLogin(true)} onMouseLeave={() => setHoverLogin(false)}>
                        Войти
                    </button>

                    <button type="button" style={{ padding: "12px", borderRadius: "6px", border: "none", backgroundColor: "#00FFC2", color: "#000", fontWeight: 600, cursor: "pointer", transition: "background-color 0.2s ease" }}
                        onClick={() => navigate("/register")} onMouseEnter={() => setHoverRegister(true)} onMouseLeave={() => setHoverRegister(false)}>
                        Регистрация
                    </button>

                    <button type="button" style={{ padding: "8px", borderRadius: "6px", border: "none", backgroundColor: "transparent", color: "#00FFC2", fontWeight: 600, cursor: "pointer", transition: "color 0.2s ease" }}
                        onClick={() => navigate("/forgot-password")} onMouseEnter={() => setHoverForgot(true)} onMouseLeave={() => setHoverForgot(false)}>
                        Забыли пароль?
                    </button>
                </form>

                {message && <p style={{ textAlign: "center", backgroundColor: "#2C2C3A", padding: "10px", borderRadius: "6px", marginTop: "10px" }}>{message}</p>}
            </div>
        </div>
    );
};

export default Login;
