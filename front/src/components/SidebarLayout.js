import React from "react";
import { useNavigate } from "react-router-dom";
import "../pages/Dashboard.css";
import agaLogo from "../assets/agapinklogo.png";

const SidebarLayout = ({ user, agaBalance, showUserInfo, setShowUserInfo, handleRequestTokens, children }) => {
    const navigate = useNavigate();

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-scroll">
                    <img src={agaLogo} alt="Logo" className="logo" />
                    <div className="user-icon">👤</div>
                    <button className="user-info-button" onClick={() => setShowUserInfo(!showUserInfo)}>
                        {showUserInfo ? "Hide Info" : "Show Info"}
                    </button>

                    <div className={`user-info-container ${showUserInfo ? "show" : ""}`}>
                        {user && (
                            <div className="user-info">
                                <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Wallet Address:</strong> {user.wallet_address}</p>
                                <p><strong>AGA Balance:</strong> {agaBalance !== null ? `${agaBalance} AGA` : "Loading..."}</p>
                                <p><strong>Role:</strong> {user.role === "admin" ? "Administrator" : "User"}</p>
                            </div>
                        )}
                    </div>

                    <button className="sidebar-button" onClick={() => navigate("/polls")}>All Votings</button>
                    <button className="sidebar-button" onClick={() => navigate("/results")}>View Results</button>
                    <button className="sidebar-button" onClick={() => navigate("/vote-history")}>Voting History</button>

                    {user?.role === "user" && (
                        <>
                            <button className="sidebar-button" onClick={handleRequestTokens}>Request 10 AGA</button>
                            <button className="sidebar-button" onClick={() => navigate("/propose")}>Propose Voting</button>
                        </>
                    )}

                    {user?.role === "admin" && (
                        <>
                            <button className="sidebar-button" onClick={() => navigate("/create-poll")}>Create a Vote</button>
                            <button className="sidebar-button" onClick={() => navigate("/proposals")}>View Proposals</button>
                            <button className="sidebar-button" onClick={() => navigate("/token-requests")}>Token Requests</button>
                            <button className="sidebar-button" onClick={() => navigate("/admin")}>Manage Polls</button>
                        </>
                    )}

                    <button className="sidebar-button" onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/");
                    }}>Logout</button>
                </div>
            </div>

            {/* Right Side Content */}
            <div className="main-content">
                {children}
            </div>
        </div>
    );
};

export default SidebarLayout;
