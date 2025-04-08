import React, { useState, useEffect } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import leftImage from "../assets/backlogin3.png";
import logo from "../assets/agalogo.png";

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            setMessage("");
        }, 3000);
    }, [message]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/user/login", formData, {
                headers: { "Content-Type": "application/json" }
            });
            localStorage.setItem("token", response.data.access_token);
            setMessage("Login successful! Redirecting...");
            setTimeout(() => navigate("/dashboard"), 1500);
        } catch (error) {
            setMessage("Login failed: " + (error.response?.data?.detail || "Unknown error"));
        }
    };

    return (
        <div className="login-container">
            <div className="left-side-login" style={{ backgroundImage: `url(${leftImage})` }}>
                <img src={logo} alt="AGA Logo" className="aga-logo" />
                <p className="fade-in-text">
                    <span className="welcome-back">Welcome Back!</span>
                    <br />
                    We are glad to see you again on our platform.
                </p>
            </div>
            <div className="right-side-login">
                <div className="login-box">
                    <h2>We are <strong>AGA</strong></h2>
                    <p>Log in to your account.</p>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <FaEnvelope className="icon" />
                            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="input-group">
                            <FaLock className="icon" />
                            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                        </div>

                        <button className="login-btn" type="submit">Log in</button>
                    </form>

                    {message && <p className="message">{message}</p>}

                    <p className="register-text">
                        Don't have an account yet? <Link to="/register" className="register-link">Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
