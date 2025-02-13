import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreatePoll = () => {
    const [pollData, setPollData] = useState({
        name: "",
        candidates: [""]
    });
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e, index) => {
        const newCandidates = [...pollData.candidates];
        newCandidates[index] = e.target.value;
        setPollData({ ...pollData, candidates: newCandidates });
    };

    const handleNameChange = (e) => {
        setPollData({ ...pollData, name: e.target.value });
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
            const response = await axios.post("http://127.0.0.1:8000/polls/create", pollData, {
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

    return (
        <div style={{ maxWidth: "500px", margin: "auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px" }}>
            <h2>Создать голосование</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Название голосования" value={pollData.name} onChange={handleNameChange} required />
                
                {pollData.candidates.map((candidate, index) => (
                    <div key={index}>
                        <input
                            type="text"
                            placeholder={`Кандидат ${index + 1}`}
                            value={candidate}
                            onChange={(e) => handleChange(e, index)}
                            required
                        />
                        {pollData.candidates.length > 2 && (
                            <button type="button" onClick={() => removeCandidate(index)}>-</button>
                        )}
                    </div>
                ))}

                {pollData.candidates.length < 8 && (
                    <button type="button" onClick={addCandidate}>+ Добавить кандидата</button>
                )}

                <button type="submit">Создать голосование</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default CreatePoll;
