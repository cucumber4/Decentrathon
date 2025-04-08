import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import "./VoteSmart.css"; // Create this file with the styles below

const Vote = () => {
    const { pollId, candidate } = useParams();
    const [message, setMessage] = useState("");
    const [poll, setPoll] = useState(null);

    useEffect(() => {
        async function fetchPoll() {
            try {
                const response = await fetch(`http://127.0.0.1:8000/polls/${pollId}`);
                const data = await response.json();
                setPoll(data);
            } catch (err) {
                console.error("Failed to load poll:", err);
            }
        }

        fetchPoll();
    }, [pollId]);

    async function vote() {
        if (!window.ethereum) {
            alert("MetaMask is not installed!");
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();

            const response = await fetch(`http://127.0.0.1:8000/vote/${pollId}/${candidate}`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });

            const data = await response.json();
            if (!data.transaction) {
                alert("Failed to get transaction!");
                return;
            }

            const signedTx = await signer.sendTransaction(data.transaction);
            setMessage(`✅ Vote sent! Transaction: ${signedTx.hash}`);
        } catch (err) {
            console.error("Voting failed:", err);
            setMessage("❌ Failed to send vote.");
        }
    }

    return (
        <div className="vote-page">
            <div className="vote-card">
                <h2 className="vote-heading">Vote</h2>
                {poll ? (
                    <>
                        <p className="vote-question"><strong>Question:</strong> {poll.name}</p>
                        <p className="vote-description"><strong>Description:</strong> {poll.description}</p>
                    </>
                ) : (
                    <p className="vote-description">Loading poll data...</p>
                )}

                <button className="vote-button" onClick={vote}>
                    Vote for {candidate}
                </button>

                {message && <p className="vote-message">{message}</p>}
            </div>
        </div>
    );
};

export default Vote;
