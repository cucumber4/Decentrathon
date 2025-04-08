import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import "./ForgotPassword.css";
import logo from "../assets/agalogo.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendResetCode = async () => {
    setLoading(true);
    try {
      await axios.post("/api/user/forgot-password", { email });
      setStep(2);
      setMessage("📩 Code sent to your email");
    } catch {
      setMessage("❌ Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setLoading(true);
    try {
      await axios.post("/api/user/reset-password", {
        email,
        code,
        new_password: newPassword,
      });
      setMessage("✅ Password reset. Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      setMessage("❌ Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="left-side-login">
        <img src={logo} alt="AGA Logo" className="aga-logo" />
      </div>
      <div className="right-side-login">
        <div className="form-box">
          <h2>{step === 1 ? "Reset Password" : "Set New Password"}</h2>
          <p>{step === 1 ? "Enter your email to receive a reset code." : "Enter the code and your new password."}</p>

          {step === 1 ? (
            <>
              <div className="input-group">
                <FaEnvelope className="icon" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button className="register-btn" onClick={sendResetCode} disabled={loading}>
                {loading ? "Sending..." : "Send Code"}
              </button>
            </>
          ) : (
            <>
              <div className="input-group">
                <FaLock className="icon" />
                <input
                  type="text"
                  placeholder="Verification Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <FaLock className="icon" />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <button className="register-btn" onClick={resetPassword} disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </>
          )}

          {message && <p className="message">{message}</p>}

          <p className="login-text">
            <span className="form-divider">— or —</span><br />
            Don’t have an account? <Link to="/register" className="login-link">Register</Link>
          </p>

          <p className="login-text">
            <Link to="/login" className="login-link">← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
