import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const sendResetCode = async () => {
        try {
            await axios.post("http://127.0.0.1:8000/user/forgot-password", { email });
            setStep(2);
        } catch (error) {
            setMessage("Ошибка отправки кода.");
        }
    };

    const resetPassword = async () => {
        try {
            await axios.post("http://127.0.0.1:8000/user/reset-password", { email, code, new_password: newPassword });
            setMessage("Пароль успешно сброшен! Перенаправление...");
            setTimeout(() => navigate("/"), 2000);
        } catch (error) {
            setMessage("Ошибка сброса пароля.");
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#111", fontFamily: "Montserrat, sans-serif" }}>
            <div style={{ width: "420px", padding: "30px", borderRadius: "8px", backgroundColor: "rgba(30, 30, 47, 0.9)", boxShadow: "0 0 10px rgba(0,0,0,0.3)", color: "#FFFFFF" }}>
                <h2 style={{ textAlign: "center", color: "#00FFC2", fontSize: "1.5rem", fontWeight: 600 }}>Восстановление пароля</h2>

                {step === 1 ? (
                    <>
                        <input type="email" placeholder="Введите email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <button onClick={sendResetCode}>Отправить код</button>
                    </>
                ) : (
                    <>
                        <input type="text" placeholder="Введите код" value={code} onChange={(e) => setCode(e.target.value)} required />
                        <input type="password" placeholder="Новый пароль" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        <button onClick={resetPassword}>Сбросить пароль</button>
                    </>
                )}

                {message && <p>{message}</p>}
            </div>
        </div>
    );
};

export default ForgotPassword;
