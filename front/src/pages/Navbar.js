import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/agalogo.png"; // Import logo

const Navbar = () => {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();
  let lastScrollY = window.scrollY;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setVisible(false); // Hide navbar when scrolling down
      } else {
        setVisible(true); // Show navbar when scrolling up
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${visible ? "show" : "hide"}`}>
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/security">Security</Link></li>
        <li><Link to="/how-it-works">How It Works?</Link></li>
        <li><Link to="/elections">Elections</Link></li>
        <li><Link to="/contact">Contact</Link></li>
      </ul>
      <div className="auth-links">
      <button className="login-btn" onClick={() => navigate("/login")}>
          Log in
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
