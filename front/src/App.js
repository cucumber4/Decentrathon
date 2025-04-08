import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreatePoll from "./pages/CreatePoll";
import Vote from "./pages/Vote";
import AdminDashboard from "./pages/AdminDashboard";
import Results from "./pages/Results";
import PollsList from "./pages/PollsList";
import PollDetail from "./pages/PollDetail";
import ForgotPassword from "./pages/ForgotPassword";  // 📌 Добавлено
import ResetPassword from "./pages/ResetPassword";    // 📌 Добавлено
import ProposePoll from "./pages/ProposePoll";
import ProposalsList from "./pages/ProposalsList";
import TokenRequests from "./pages/TokenRequests";
import VoteHistory from "./pages/VoteHistory";

import LandingPage from "./pages/LandingPage";



function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-poll" element={<CreatePoll />} />
                <Route path="/vote" element={<Vote />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/results" element={<Results />} />
                
                {/* Список голосований */}
                <Route path="/polls" element={<PollsList />} />

                {/* Детальная страница одного голосования */}
                <Route path="/vote/:pollId" element={<PollDetail />} />
                {/* 📌 Новый функционал: Восстановление пароля */}
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/propose" element={<ProposePoll />} />
                <Route path="/proposals" element={<ProposalsList />} />
                <Route path="/token-requests" element={<TokenRequests />} />
                <Route path="/vote-history" element={<VoteHistory />} />


            </Routes>
        </Router>
    );
}

export default App;
