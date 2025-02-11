import React, { useState } from "react";
import axios from "axios";

const Register = () => {
    const [formData, setFormData] = useState({
        nickname: "",
        first_name: "",
        last_name: "",
        phone: "",
        wallet_address: "",
        password: "" // ✅ Added password field
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://127.0.0.1:8000/user/register", formData, {
                headers: { "Content-Type": "application/json" }
            });
            setMessage("Регистрация успешна!");
            console.log("Успех:", response.data);
        } catch (error) {
            setMessage("Ошибка регистрации: " + (error.response?.data?.detail || "Неизвестная ошибка"));
            console.error("Ошибка регистрации:", error.response?.data);
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px" }}>
            <h2>Регистрация</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="nickname" placeholder="Никнейм" value={formData.nickname} onChange={handleChange} required />
                <input type="text" name="first_name" placeholder="Имя" value={formData.first_name} onChange={handleChange} required />
                <input type="text" name="last_name" placeholder="Фамилия" value={formData.last_name} onChange={handleChange} required />
                <input type="tel" name="phone" placeholder="Номер телефона" value={formData.phone} onChange={handleChange} required />
                <input type="text" name="wallet_address" placeholder="Адрес кошелька" value={formData.wallet_address} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Пароль" value={formData.password} onChange={handleChange} required />
                <button type="submit">Зарегистрироваться</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Register;
