import React, { useState, useEffect } from "react";
import axios from "axios";

const ProposePoll = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [candidates, setCandidates] = useState([""]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);
        return () => {
            document.head.removeChild(link);
        };
    }, []);

    const handleChange = (e, index) => {
        const newCandidates = [...candidates];
        newCandidates[index] = e.target.value;
        setCandidates(newCandidates);
    };

    const addCandidate = () => {
        if (candidates.length < 8) {
            setCandidates([...candidates, ""]);
        } else {
            setMessage("Максимум 8 кандидатов.");
        }
    };

    const removeCandidate = (index) => {
        if (candidates.length > 2) {
            setCandidates(candidates.filter((_, i) => i !== index));
        } else {
            setMessage("Минимум 2 кандидата.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            setMessage("Ошибка: Не авторизован.");
            return;
        }

        try {
            const response = await axios.post(
                "/api/polls/propose",
                { name, description, candidates },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage("Предложение успешно отправлено!");
            setName("");
            setDescription("");
            setCandidates([""]);
        } catch (error) {
            setMessage("Ошибка при отправке предложения: " + (error.response?.data?.detail || "Неизвестная ошибка"));
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
        width: "500px",
        padding: "30px",
        borderRadius: "8px",
        backgroundColor: "rgba(30, 30, 47, 0.9)",
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
        width: "100%",
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
                <h2 style={headerStyle}>Предложить голосование</h2>
                <form onSubmit={handleSubmit} style={formStyle}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Название голосования"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={inputStyle}
                    />

                    <textarea
                        name="description"
                        placeholder="Описание голосования"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                    />

                    {candidates.map((candidate, index) => (
                        <div key={index} style={{ display: "flex", gap: "10px" }}>
                            <input
                                type="text"
                                placeholder={`Кандидат ${index + 1}`}
                                value={candidate}
                                onChange={(e) => handleChange(e, index)}
                                required
                                style={inputStyle}
                            />
                            {candidates.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => removeCandidate(index)}
                                    style={{
                                        ...buttonStyle,
                                        backgroundColor: "red",
                                        color: "#fff",
                                        fontWeight: "bold"
                                    }}
                                >
                                    -
                                </button>
                            )}
                        </div>
                    ))}

                    {candidates.length < 8 && (
                        <button
                            type="button"
                            onClick={addCandidate}
                            style={buttonStyle}
                        >
                            + Добавить кандидата
                        </button>
                    )}

                    <button type="submit" style={buttonStyle}>
                        Предложить голосование
                    </button>
                </form>

                {message && <p style={messageStyle}>{message}</p>}
            </div>
        </div>
    );
};

export default ProposePoll;