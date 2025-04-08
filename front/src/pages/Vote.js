import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./Vote.css";

const Vote = () => {
    const [poll, setPoll] = useState(null);
    const [message, setMessage] = useState("");
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPoll = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/");
                return;
            }

            try {
                const response = await axios.get(`/api/polls/${id}`);
                setPoll(response.data);
            } catch (err) {
                console.error("Error loading poll:", err);
                navigate("/");
            }
        };

        fetchPoll();
    }, [id, navigate]);

    const handleVote = async (candidateIndex) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `/api/polls/vote/${id}`,
                { candidate_index: candidateIndex },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage("✅ Vote submitted successfully!");
        } catch (err) {
            setMessage(err.response?.data?.detail || "❌ Failed to submit vote.");
        }
    };

    if (!poll) return null;

    return (
        <div className="vote-container-no-sidebar">
            <button className="gradient-button back-button" onClick={() => navigate("/dashboard")}>
                ← Back to Dashboard
            </button>

            <h2 className="vote-heading">{poll.name}</h2>
            <p className="vote-description">{poll.description}</p>

            <div className="vote-card">
                {poll.candidates.map((candidate, index) => (
                    <button
                        key={index}
                        className="vote-candidate-btn gradient-button"
                        onClick={() => handleVote(index)}
                    >
                        {candidate}
                    </button>
                ))}
            </div>

            {message && <div className="vote-status">{message}</div>}
        </div>
    );
};

export default Vote;
