import React, { useState } from "react";
import axios from "axios";

const ProposePoll = () => {
    const [name, setName] = useState("");
    const [candidates, setCandidates] = useState([""]);
    const [message, setMessage] = useState("");

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
            const response = await axios.post("http://127.0.0.1:8000/polls/propose", 
                { name, candidates }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage(response.data.message);
            setName("");
            setCandidates([""]);
        } catch (error) {
            setMessage("Ошибка при отправке предложения: " + (error.response?.data?.detail || "Неизвестная ошибка"));
        }
    };

    return (
        <div style={{ maxWidth: "500px", margin: "auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px" }}>
            <h2>Предложить голосование</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Название голосования" value={name} onChange={(e) => setName(e.target.value)} required />
                
                {candidates.map((candidate, index) => (
                    <div key={index}>
                        <input
                            type="text"
                            placeholder={`Кандидат ${index + 1}`}
                            value={candidate}
                            onChange={(e) => handleChange(e, index)}
                            required
                        />
                        {candidates.length > 2 && (
                            <button type="button" onClick={() => removeCandidate(index)}>-</button>
                        )}
                    </div>
                ))}

                {candidates.length < 8 && (
                    <button type="button" onClick={addCandidate}>+ Добавить кандидата</button>
                )}

                <button type="submit">Предложить голосование</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ProposePoll;
