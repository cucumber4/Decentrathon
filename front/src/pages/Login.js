import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [formData, setFormData] = useState({
        phone: "",
        password: "",
    });
    const [message, setMessage] = useState("");
    const navigate = useNavigate(); // Используем useNavigate для редиректа

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
            setTimeout(() => navigate("/dashboard"), 1500); // 🔄 Редирект после успешного входа
        } catch (error) {
            setMessage("Ошибка авторизации: " + (error.response?.data?.detail || "Неизвестная ошибка"));
            console.error("Ошибка авторизации:", error.response?.data);
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px" }}>
            <h2>Вход в систему</h2>
            <form onSubmit={handleSubmit}>
                <input type="tel" name="phone" placeholder="Номер телефона" value={formData.phone} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Пароль" value={formData.password} onChange={handleChange} required />
                <button type="submit">Войти</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Login;
