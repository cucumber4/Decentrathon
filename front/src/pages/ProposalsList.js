import React, { useEffect, useState } from "react";
import axios from "axios";

const ProposalsList = () => {
    const [proposals, setProposals] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchProposals();
    }, []);

    async function fetchProposals() {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://127.0.0.1:8000/polls/proposals", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProposals(response.data);
        } catch (error) {
            setMessage("Ошибка загрузки предложенных голосований.");
        }
    }

    async function approvePoll(proposalId) {
        try {
            const token = localStorage.getItem("token");
            await axios.post(`http://127.0.0.1:8000/polls/approve/${proposalId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("Голосование одобрено!");
            fetchProposals(); // Обновляем список
        } catch (error) {
            setMessage("Ошибка одобрения голосования.");
        }
    }

    async function sendToContract(proposalId) {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`http://127.0.0.1:8000/polls/send-to-contract/${proposalId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("Голосование отправлено в контракт! TX Hash: " + response.data.tx_hash);
            fetchProposals(); // Обновляем список
        } catch (error) {
            setMessage("Ошибка отправки голосования в контракт.");
        }
    }

    return (
        <div style={{ maxWidth: "600px", margin: "auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px" }}>
            <h2>Предложенные голосования</h2>

            {proposals.length === 0 ? (
                <p>Нет предложенных голосований.</p>
            ) : (
                <ul>
                    {proposals.map((proposal) => (
                        <li key={proposal.id}>
                            <strong>{proposal.name}</strong>
                            <ul>
                                {proposal.candidates.map((candidate, index) => (
                                    <li key={index}>{candidate}</li>
                                ))}
                            </ul>
                            {!proposal.approved_by_admin ? (
                                <button onClick={() => approvePoll(proposal.id)}>Одобрить</button>
                            ) : (
                                <button onClick={() => sendToContract(proposal.id)}>Отправить в контракт</button>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {message && <p>{message}</p>}
        </div>
    );
};

export default ProposalsList;
