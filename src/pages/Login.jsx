import React, { useState, useEffect } from "react";
import "./Login.css";
import { FaUser, FaLock, FaArrowLeft, FaEnvelope } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  // 🔹 logic only (NO UI)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  // 🔹 Handle OAuth token from URL (Google login) using native JS
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) return; // no OAuth token, normal login

    try {
      // Decode JWT payload manually
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userRole = payload.role;

      localStorage.setItem("token", token);
      localStorage.setItem("role", userRole);

      // Navigate to role-based dashboard
      if (userRole === "donor") navigate("/donor-dashboard");
      else if (userRole === "ngo") navigate("/ngo-dashboard");
      else if (userRole === "orphanage") navigate("/orphanage-dashboard");
      else navigate("/login");
    } catch (err) {
      console.error("Invalid token", err);
      navigate("/login");
    }
  }, [navigate]);

  // 🔹 Manual login
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      if (data.role === "donor") navigate("/donor-dashboard");
      else if (data.role === "ngo") navigate("/ngo-dashboard");
      else if (data.role === "orphanage") navigate("/orphanage-dashboard");
    } catch (err) {
      alert("Server error");
    }
  };

  // 🔹 Google login
  const handleGoogleLogin = () => {
    // Backend should redirect to /login?token=...
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-form-box">

          {/* BACK BUTTON */}
          <div className="login-back-arrow" onClick={() => navigate("/")}>
            <FaArrowLeft /> Back
          </div>

          <form onSubmit={handleSubmit}>
            <h1>Login</h1>

            <div className="login-input-box">
              <input
                type="text"
                placeholder="Email"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
              <FaEnvelope className="login-icon" />
            </div>

            <div className="login-input-box">
              <input
                type="password"
                placeholder="Password"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <FaLock className="login-icon" />
            </div>

            <div className="login-input-box">
              <select
                className="login-role-select"
                required
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">Select Role</option>
                <option value="donor">Donor</option>
                <option value="ngo">NGO</option>
                <option value="orphanage">Orphanage</option>
              </select>
            </div>

            <div className="login-remember-forgot">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <span>Forgot password?</span>
            </div>

            <button type="submit" className="login-btn">
              Login
            </button>

            <button
              type="button"
              className="login-google-btn"
              onClick={handleGoogleLogin}
            >
              <FcGoogle /> Login with Google
            </button>

            <div className="login-signup-link">
              <p>
                Not yet registered? <Link to="/signup">Signup</Link>
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
