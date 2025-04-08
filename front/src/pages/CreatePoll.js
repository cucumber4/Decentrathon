import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreatePoll = () => {
    const [pollData, setPollData] = useState({
        name: "",
        description: "",
        candidates: [""]
    });
    const [message, setMessage] = useState("");
    const [hoverCreate, setHoverCreate] = useState(false);
    const [hoverAdd, setHoverAdd] = useState(false);
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

    const handleChange = (e, index) => {
        const newCandidates = [...pollData.candidates];
        newCandidates[index] = e.target.value;
        setPollData({ ...pollData, candidates: newCandidates });
    };

    const handleNameChange = (e) => {
        setPollData({ ...pollData, name: e.target.value });
    };

    const handleDescriptionChange = (e) => {
        setPollData({ ...pollData, description: e.target.value });
    };

    const addCandidate = () => {
        if (pollData.candidates.length < 8) {
            setPollData({ ...pollData, candidates: [...pollData.candidates, ""] });
        } else {
            setMessage("Максимум 8 кандидатов.");
        }
    };

    const removeCandidate = (index) => {
        if (pollData.candidates.length > 2) {
            const newCandidates = pollData.candidates.filter((_, i) => i !== index);
            setPollData({ ...pollData, candidates: newCandidates });
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
            const response = await axios.post("/api/polls/create", pollData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            setMessage("Голосование успешно создано! TX Hash: " + response.data.tx_hash);
            setTimeout(() => navigate("/dashboard"), 2000);
        } catch (error) {
            setMessage("Ошибка при создании голосования: " + (error.response?.data?.detail || "Неизвестная ошибка"));
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
        display: "flex",
        flexDirection: "column",
        gap: "15px",
    };

    const headerStyle = {
        marginBottom: "10px",
        textAlign: "center",
        color: "#00FFC2",
        fontSize: "1.5rem",
        fontWeight: 600,
        textShadow: "0 0 5px rgba(0,255,194,0.4)",
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
        padding: "10px 16px",
        borderRadius: "6px",
        border: "none",
        backgroundColor: "#00FFC2",
        color: "#000",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background-color 0.2s ease",
        width: "100%",
    };

    const buttonHover = {
        backgroundColor: "#00E6AE",
    };

    const messageStyle = {
        marginTop: "10px",
        textAlign: "center",
        fontSize: "0.9rem",
        backgroundColor: "#2C2C3A",
        padding: "10px",
        borderRadius: "6px",
    };

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                <h2 style={headerStyle}>Создать голосование</h2>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Название голосования"
                        value={pollData.name}
                        onChange={handleNameChange}
                        style={inputStyle}
                        required
                    />

                    <textarea
                        name="description"
                        placeholder="Описание голосования"
                        value={pollData.description}
                        onChange={handleDescriptionChange}
                        style={{
                            ...inputStyle,
                            minHeight: "80px",
                            resize: "vertical"
                        }}
                        required
                    />

                    {pollData.candidates.map((candidate, index) => (
                        <div key={index} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <input
                                type="text"
                                placeholder={`Кандидат ${index + 1}`}
                                value={candidate}
                                onChange={(e) => handleChange(e, index)}
                                style={inputStyle}
                                required
                            />
                            {pollData.candidates.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => removeCandidate(index)}
                                    style={{ ...buttonStyle, width: "40px", textAlign: "center", fontSize: "1rem" }}
                                >
                                    -
                                </button>
                            )}
                        </div>
                    ))}

                    {pollData.candidates.length < 8 && (
                        <button
                            type="button"
                            onClick={addCandidate}
                            style={{
                                ...buttonStyle,
                                ...(hoverAdd ? buttonHover : {}),
                            }}
                            onMouseEnter={() => setHoverAdd(true)}
                            onMouseLeave={() => setHoverAdd(false)}
                        >
                            + Добавить кандидата
                        </button>
                    )}

                    <button
                        type="submit"
                        style={{
                            ...buttonStyle,
                            ...(hoverCreate ? buttonHover : {}),
                        }}
                        onMouseEnter={() => setHoverCreate(true)}
                        onMouseLeave={() => setHoverCreate(false)}
                    >
                        Создать голосование
                    </button>
                </form>

                {message && <p style={messageStyle}>{message}</p>}
            </div>
        </div>
    );
};

export default CreatePoll;