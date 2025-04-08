import React, { useState } from "react";
import { FaUser, FaPhone, FaWallet, FaLock, FaEnvelope } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";
import logo from "../assets/agapinklogo.png"; // Ensure the logo path is correct

const Register = () => {
    const [step, setStep] = useState(1); // Step 1: Register, Step 2: Verification
    const [formData, setFormData] = useState({
        nickname: "",
        first_name: "",
        last_name: "",
        email: "",
        wallet_address: "",
        password: "",
        confirm_password: ""
    });
    const [verificationCode, setVerificationCode] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleVerificationChange = (e) => {
        setVerificationCode(e.target.value);
    };

    const handleSubmitRegistration = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirm_password) {
            setMessage("Passwords do not match!");
            return;
        }
        try {
            const { confirm_password, ...payload } = formData;
            const response = await axios.post("/api/user/register", payload, {
                headers: { "Content-Type": "application/json" }
            });
            setMessage(response.data.message);
            setStep(2); // ✅ Move to verification step
        } catch (error) {
            setMessage("Registration error: " + (error.response?.data?.detail || "Unknown error"));
        }
    };

    const handleSubmitVerification = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/user/verify", {
                email: formData.email,
                code: verificationCode
            }, {
                headers: { "Content-Type": "application/json" }
            });
            setMessage(response.data.message);
            setTimeout(() => navigate("/login"), 1500);
        } catch (error) {
            setMessage("Verification error: " + (error.response?.data?.detail || "Unknown error"));
        }
    };

    return (
        <div className="register-container">
            <img src={logo} alt="AGA Logo" className="register-logo" />
            <div className="register-box">
                {step === 1 ? ( // ✅ Step 1: Registration Form
                    <>
                        <h2>Registration</h2>
                        <p>Create your account.</p>

                        <form onSubmit={handleSubmitRegistration}>
                            <div className="input-group">
                                <FaUser className="icon" />
                                <input type="text" name="nickname" placeholder="Nickname" value={formData.nickname} onChange={handleChange} required />
                            </div>

                            <div className="input-group">
                                <FaUser className="icon" />
                                <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required />
                            </div>

                            <div className="input-group">
                                <FaUser className="icon" />
                                <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required />
                            </div>

                            <div className="input-group">
                                <FaEnvelope className="icon" />
                                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                            </div>

                            <div className="input-group">
                                <FaWallet className="icon" />
                                <input type="text" name="wallet_address" placeholder="Wallet Address" value={formData.wallet_address} onChange={handleChange} required />
                            </div>

                            <div className="input-group">
                                <FaLock className="icon" />
                                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                            </div>

                            <div className="input-group">
                                <FaLock className="icon" />
                                <input type="password" name="confirm_password" placeholder="Repeat Password" value={formData.confirm_password} onChange={handleChange} required />
                            </div>

                            <button className="register-btn" type="submit">Register</button>
                        </form>
                    </>
                ) : ( // ✅ Step 2: Verification Form
                    <>
                        <h2>Confirm Code</h2>
                        <p>We sent a code to: <strong>{formData.email || "your email"}</strong></p>
                        <form onSubmit={handleSubmitVerification}>
                            <div className="input-group">
                                <FaLock className="icon" />
                                <input type="text" name="code" placeholder="Verification Code" value={verificationCode} onChange={handleVerificationChange} required />
                            </div>

                            <button className="register-btn" type="submit">Confirm</button>
                        </form>
                    </>
                )}

                {message && <p className="message">{message}</p>}

                <p className="login-text">
                    Already have an account? <Link to="/login" className="login-link">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
