import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Vote from "./components/Vote";

function App() {
    return (
        <Router>
            <div>
                <h1>Decentralized Voting</h1>
                <Routes>
                    <Route path="/register" element={<Register />} />
                    <Route path="/vote" element={<Vote pollId={1} candidate="Alice" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
