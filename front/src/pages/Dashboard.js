import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  ResponsiveContainer,
} from "recharts";
import { FaVoteYea } from "react-icons/fa";
import { FaChartPie, FaUsers, FaPoll, FaInfoCircle } from "react-icons/fa";
import { PieChart, Pie, Cell } from "recharts";
import "./Dashboard.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [agaBalance, setAgaBalance] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [polls, setPolls] = useState([]);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [latestPolls, setLatestPolls] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const headingStyle = {
    fontSize: "30px",
    fontWeight: 600,
    marginBottom: "15px",
    color: "#333",
  };

  const pollCardStyle = {
    background: "#fff",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "10px",
    border: "1px solid #ccc",
    color: "#333",
  };

  const dummyData = [
    { date: "Apr 1", votes: 5 },
    { date: "Apr 2", votes: 8 },
    { date: "Apr 3", votes: 2 },
    { date: "Apr 4", votes: 9 },
    { date: "Apr 5", votes: 4 },
  ];

  const statsStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginLeft: "40px",
  };

  const cardStyle = (color) => ({
    background: color,
    borderRadius: "12px",
    color: "#fff",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    width: "300px", // Wider
  });

  const pieData = [
    { name: "Participation", value: 64 },
    { name: "Remaining", value: 36 },
  ];

  const COLORS = ["#a777e3", "#eee"];

  const StatisticsChart = () => (
    <div style={{ width: "100%", maxHeight: "300px", marginTop: "40px" }}>
      <h3 style={{ color: "#333", marginBottom: "10px", fontWeight: "bold" }}>
        Ballots Submitted By Date
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={dummyData}>
          <defs>
            <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6e8efb" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#a777e3" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            stroke="#555"
            tick={{ fontWeight: "bold", fontSize: 12 }}
          />
          <YAxis
            stroke="#555"
            tick={{ fontWeight: "bold", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{ fontWeight: "bold", fontSize: 13 }}
            labelStyle={{ fontWeight: "bold" }}
          />
          <Area
            type="monotone"
            dataKey="votes"
            stroke="#6e8efb"
            strokeWidth={2}
            fill="url(#colorVotes)"
            dot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  const RightStatsPanel = () => (
    <div style={statsStyle}>
      {/* Participation Card with Pie Chart */}
      <div style={cardStyle("#a777e3")}>
        <div>
          <p style={{ fontWeight: "bold", fontSize: 20, color: "#fff" }}>Participation</p>
          <p style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>64%</p>
        </div>
        <PieChart width={120} height={120}>
          <defs>
            <linearGradient id="pieGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6e8efb" />
              <stop offset="100%" stopColor="#a777e3" />
            </linearGradient>
          </defs>
          <Pie
            data={pieData}
            innerRadius={40}
            outerRadius={50}
            dataKey="value"
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === 0 ? "url(#pieGradient)" : "#eee"}
              />
            ))}
          </Pie>
        </PieChart>

      </div>

      {/* Total Users */}
      <div style={cardStyle("#f06292")}>
        <div>
          <p style={{ fontWeight: "bold", fontSize: 20 , color: "white"}}>Total number of voters</p>
          <p style={{ fontSize: 24, fontWeight: "bold", color: "white"}}>1,961</p>
        </div>
        <FaUsers size={32} />
      </div>

      {/* Total Polls */}
      <div style={cardStyle("#64b5f6")}>
        <div>
          <p style={{ fontWeight: "bold", fontSize: 20, color: "white" }}>Total number of created polls</p>
          <p style={{ fontSize: 24, fontWeight: "bold", color: "white" }}>58</p>
        </div>
        <FaPoll size={32} />
      </div>

      {/* Learn More */}
      <div
        style={{
          ...cardStyle("linear-gradient(90deg, #6e8efb, #a777e3)"),
          justifyContent: "center",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        <FaInfoCircle size={20} style={{ marginRight: "10px" }} />
        <span style={{ fontWeight: "bold" }}>Learn More</span>
      </div>
    </div>
  );


  useEffect(() => {
    async function fetchLatestPolls() {
      try {
        const response = await axios.get("/api/polls/list/onchain/active");
        const latest = response.data.slice(0, 5);
        setLatestPolls(latest);
      } catch (error) {
        console.error("Error fetching latest polls:", error);
      }
    }
    fetchLatestPolls();
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
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        const balanceResponse = await axios.get(
          `/api/user/balance/${response.data.wallet_address}`
        );
        setAgaBalance(balanceResponse.data.balance);
      } catch (error) {
        console.error("Error loading user:", error);
        localStorage.removeItem("token");
        navigate("/");
      }
    };
    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchActive(false);
      setPolls([]);
      setMessage("");
    }
  }, [searchTerm]);

  useEffect(() => {
  const fetchSearchResults = async () => {
    if (!searchTerm.trim()) {
      setSearchActive(false);
      setPolls([]);
      setMessage("");
      return;
    }

    try {
      const response = await axios.get(`/api/polls/search?name=${encodeURIComponent(searchTerm)}`);
      setPolls(response.data);
      setSearchActive(true);
    } catch (error) {
      setPolls([]);
      setSearchActive(true);
      if (error.response?.status === 404) {
        setMessage("Poll not found.");
      } else {
        setMessage("Search error.");
      }
    }
  };

  const debounceTimeout = setTimeout(fetchSearchResults, 300); // debounce by 300ms

  return () => clearTimeout(debounceTimeout); // cleanup
}, [searchTerm]);


  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setMessage("Enter a voting name!");
      return;
    }
    setLoading(true);
    setSearchActive(true);
    setMessage("");
    try {
      const response = await axios.get(`/api/polls/search?name=${encodeURIComponent(searchTerm)}`);
      setPolls(response.data);
    } catch (error) {
      setPolls([]);
      if (error.response?.status === 404) {
        setMessage("Poll not found.");
      } else {
        setMessage("Search error.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestTokens = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("/api/tokens/request-tokens", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.detail || "Token request failed.");
    }
  };

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <SidebarLayout
          user={user}
          agaBalance={agaBalance}
          showUserInfo={showUserInfo}
          setShowUserInfo={setShowUserInfo}
          handleRequestTokens={handleRequestTokens}
        />
      </div>


  <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="collapse-btn">
    {sidebarCollapsed ? "→" : "←"}
  </button>

      <div className="main-content">
        <div className="search-container">
          <input
            type="text"
            placeholder="Enter voting name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
          <button className="gradient-button" onClick={handleSearch}>
            Search
          </button>
        </div>

        {searchActive && polls.length > 0 && (
          <div style={{ marginBottom: "30px", maxWidth: "600px" }}>
            <h3 style={headingStyle}>Search Results</h3>
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {polls.map((poll) => (
                <li key={poll.id} style={pollCardStyle}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}>
                    <p style={{ fontSize: "18px", fontWeight: "600", color: "#000", margin: 0 }}>
                      {poll.name}
                    </p>
                    <p style={{ fontSize: "px", fontWeight: "600", color: "#000", margin: 0 }}>
                      {poll.description}
                    </p>
                    <button
                      className="gradient-button"
                      style={{ display: "flex", alignItems: "center", padding: "10px 14px" }}
                      onClick={() => navigate(`/vote/${poll.id}`)}
                    >
                      <FaVoteYea size={20} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <StatisticsChart />

{latestPolls.length > 0 && (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "40px",
      marginTop: "30px",
    }}
  >
    {/* LEFT - Active Polls (fixed width) */}
    <div style={{ width: "600px" }}>
      <h3 style={headingStyle}>Recent Active Polls</h3>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {latestPolls.map((poll) => (
          <li key={poll.id} style={pollCardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <p style={{ fontSize: "18px", fontWeight: "600", color: "#000", margin: 0 }}>
                {poll.name}
              </p>
              <button
                className="gradient-button"
                style={{ display: "flex", alignItems: "center", padding: "10px 14px" }}
                onClick={() => navigate(`/vote/${poll.id}`)}
              >
                <FaVoteYea size={20} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>

    {/* RIGHT - Stats Panel with dynamic width */}
    <div
      style={{
        width: sidebarCollapsed ? "500px" : "320px", // ⬅️ Wider when collapsed
        transition: "width 0.3s ease",
      }}
    >
      <RightStatsPanel />
    </div>
  </div>
)}


            </div>

          </div>
    );
};

export default Dashboard;
