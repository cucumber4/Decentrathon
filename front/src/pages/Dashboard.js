import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

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
            } catch (error) {
                console.error("Ошибка загрузки пользователя:", error);
                localStorage.removeItem("token"); // Удаляем токен, если недействителен
                navigate("/"); // Перенаправление на логин
            }
        };

        fetchUserData();
    }, [navigate]);

    return (
        <div style={{ maxWidth: "600px", margin: "auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px" }}>
            <h2>Добро пожаловать!</h2>
            {user ? (
                <div>
                    <p><strong>Имя:</strong> {user.first_name} {user.last_name}</p>
                    <p><strong>Телефон:</strong> {user.phone}</p>
                    <p><strong>Адрес кошелька:</strong> {user.wallet_address}</p>
                    <button onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/");
                    }}>Выйти</button>
                </div>
            ) : (
                <p>Загрузка...</p>
            )}
        </div>
    );
};

export default Dashboard;
