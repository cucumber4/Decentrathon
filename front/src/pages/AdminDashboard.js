import React, { useEffect, useState } from "react";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [agaBalance, setAgaBalance] = useState(null);
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [polls, setPolls] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPolls();
    }, []);

    useEffect(() => {
    const fetchUserData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }

        try {
            const response = await axios.get("/api/user/me", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);

            const balanceResponse = await axios.get(`/api/user/balance/${response.data.wallet_address}`);
            setAgaBalance(balanceResponse.data.balance);
        } catch (error) {
            console.error("Error loading user:", error);
            localStorage.removeItem("token");
            navigate("/");
        }
    };

        fetchUserData();
    }, [navigate]);


    async function fetchPolls() {
        try {
            const response = await axios.get("/api/polls/list/onchain/");
            setPolls(response.data);
        } catch (error) {
            console.error("Error loading polls:", error);
            setMessage("Error loading polls.");
        } finally {
            setTimeout(() => setLoading(false), 1000);
        }
    }

    async function togglePollStatus(pollId, isActive) {
        const endpoint = isActive
            ? `/api/polls/close/${pollId}`
            : `/api/polls/open/${pollId}`;

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(endpoint, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage(response.data.message);
            fetchPolls();
        } catch (error) {
            console.error("Error changing poll status:", error);
            setMessage("Error changing poll status.");
        }
    }

    const headingStyle = {
        fontSize: "30px",
        fontWeight: 600,
        marginBottom: "25px",
        background: "linear-gradient(90deg, #6e8efb, #a777e3)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    };

    const pollCardStyle = {
        background: "#2C2C3A",
        padding: "16px",
        borderRadius: "8px",
        marginBottom: "12px",
        border: "1px solid #444",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    };

    const messageStyle = {
        marginTop: "15px",
        textAlign: "center",
        fontSize: "0.95rem",
        backgroundColor: "#2C2C3A",
        padding: "10px",
        borderRadius: "6px",
        color: "white"
    };

    return (
        <SidebarLayout
            user={user}
            agaBalance={agaBalance}
            showUserInfo={showUserInfo}
            setShowUserInfo={setShowUserInfo}
            handleRequestTokens={() => {}} // Not needed for admin
        >
            <div style={{ maxWidth: "700px", width: "100%" }}>
                <h3 style={headingStyle}>Admin Panel</h3>

                {loading ? (
                    <p style={{ textAlign: "center", color: "white" }}>Loading polls...</p>
                ) : polls.length === 0 ? (
                    <p style={{ textAlign: "center", color: "white" }}>No polls available.</p>
                ) : (
                    <ul style={{ listStyleType: "none", padding: 0 }}>
                        {polls.map((poll) => (
                            <li key={poll.id} style={pollCardStyle}>
                                <div style={{ color: "white" }}>
                                    <strong>{poll.name}</strong>{" "}
                                    <span style={{ color: poll.active ? "limegreen" : "red" }}>
                                        — {poll.active ? "Open" : "Closed"}
                                    </span>
                                </div>
                                <button
                                    className="gradient-button"
                                    style={{
                                        backgroundColor: poll.active ? "#FF6B6B" : "#00FFC2",
                                        color: "#000"
                                    }}
                                    onClick={() => togglePollStatus(poll.id, poll.active)}
                                >
                                    {poll.active ? "Close" : "Open"}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {message && <p style={messageStyle}>{message}</p>}
            </div>
        </SidebarLayout>
    );
};

export default AdminDashboard;
