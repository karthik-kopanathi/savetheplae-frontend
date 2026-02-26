import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaPhoneAlt,
  FaKey,
  FaHandsHelping,
  FaBuilding,
  FaHome,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCity,
  FaChild,
  FaChevronDown,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const selectRole = (role) => {
    setActiveRole(role);
    setShowForm(true);
  };

  const goBack = () => {
    setShowForm(false);
    setActiveRole("");
    setFormData({});
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (role) => {
    try {
      const res = await fetch("https://savetheplae-backend.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await res.json();
      alert(data.message || "Registered successfully");
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="Signup">
      <div className={`wrapper ${showForm ? "active" : ""} ${activeRole}`}>

        {/* ROLE SELECTION */}
        <div className="form-box role">
          <div className="back-arrow" onClick={() => navigate("/")}>
            <FaArrowLeft /> Back
          </div>
          <h1>Select Role</h1>

          <div className="role-cards">
            <div className="role-card" onClick={() => selectRole("donor")}>
              <FaHandsHelping className="role-icon" />
              <h3>Donor</h3>
              <p>Help reduce food waste</p>
            </div>

            <div className="role-card" onClick={() => selectRole("ngo")}>
              <FaBuilding className="role-icon" />
              <h3>NGO</h3>
              <p>Receive & distribute food</p>
            </div>

            <div className="role-card" onClick={() => selectRole("orphanage")}>
              <FaHome className="role-icon" />
              <h3>Orphanage</h3>
              <p>Support children</p>
            </div>
          </div>

          <div className="role-login">
            <p>
              Already registered? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>

        {/* ─── DONOR FORM ─── */}
        <div className={`form-box register register-donor ${activeRole === "donor" && showForm ? "visible" : ""}`}>
          <div className="back-arrow" onClick={goBack}>
            <FaArrowLeft /> Back
          </div>
          <h1>Register As Donor</h1>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-grid">
              <div className="col">
                <div className="input-box">
                  <input type="text" name="name" placeholder="Full Name" required onChange={handleChange} />
                  <FaUser className="icon" />
                </div>
                <div className="input-box">
                  <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
                  <FaEnvelope className="icon" />
                </div>
                <div className="input-box">
                  <input type="tel" name="phone" placeholder="Mobile Number" required onChange={handleChange} />
                  <FaPhoneAlt className="icon" />
                </div>
                 <div className="input-box">
                  <select name="donorType" required onChange={handleChange}>
                    <option value="">Select Donor Type</option>
                    <option value="individual">Individual (Home)</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="hotel">Hotel</option>
                    <option value="event">Event</option>
                    <option value="canteen">Canteen</option>
                    <option value="others">Others</option>
                  </select>
                  <FaChevronDown className="icon" />
                </div>
              </div>

              <div className="col">
                <div className="input-box">
                  <input type="text" name="city" placeholder="City" required onChange={handleChange} />
                  <FaMapMarkerAlt className="icon" />
                </div>
                <div className="input-box">
                  <input type="text" name="address" placeholder="Address" required onChange={handleChange} />
                  <FaMapMarkerAlt className="icon" />
                </div>
                <div className="input-box">
                  <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" required onChange={handleChange} />
                  <span className="icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
            </div>

            <div className="buttons">
              <button type="button" className="submit-btn" onClick={() => handleSubmit("donor")}>
                Submit
              </button>
              <button
                type="button"
                className="google-btn"
                onClick={() => window.open("https://savetheplae-backend.onrender.com/api/auth/google", "_self")}
              >
                <FcGoogle /> Continue with Google
              </button>
              <p className="login-link">
                Already registered? <Link to="/login">Login</Link>
              </p>
            </div>
          </form>
        </div>

        {/* ─── NGO FORM ─── (unchanged) */}
        <div className={`form-box register register-ngo ${activeRole === "ngo" && showForm ? "visible" : ""}`}>
          <div className="back-arrow" onClick={goBack}>
            <FaArrowLeft /> Back
          </div>
          <h1>Register As NGO</h1>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-grid">
              <div className="col">
                <div className="input-box">
                  <input type="text" name="ngoName" placeholder="NGO Name" required onChange={handleChange} />
                  <FaBuilding className="icon" />
                </div>
                <div className="input-box">
                  <input type="text" name="name" placeholder="Contact Person Name" required onChange={handleChange} />
                  <FaUser className="icon" />
                </div>
                <div className="input-box">
                  <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
                  <FaEnvelope className="icon" />
                </div>
                <div className="input-box">
                  <input type="tel" name="phone" placeholder="Mobile Number" required onChange={handleChange} />
                  <FaPhoneAlt className="icon" />
                </div>
              </div>

              <div className="col">
                <div className="input-box">
                  <input type="text" name="regNumber" placeholder="NGO Registration Number" required onChange={handleChange} />
                  <FaKey className="icon" />
                </div>
                   <div className="input-box">
                  <input type="text" name="city" placeholder="City" required onChange={handleChange} />
                  <FaMapMarkerAlt className="icon" />
                </div>
                <div className="input-box">
                  <input type="text" name="address" placeholder="Address" required onChange={handleChange} />
                  <FaMapMarkerAlt className="icon" />
                </div>
                <div className="input-box">
                  <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" required onChange={handleChange} />
                  <span className="icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
            </div>

            <div className="buttons">
              <button type="button" className="submit-btn" onClick={() => handleSubmit("ngo")}>
                Submit
              </button>
              <p className="login-link">
                Already registered? <Link to="/login">Login</Link>
              </p>
            </div>
          </form>
        </div>

        {/* ─── ORPHANAGE FORM ─── */}
        <div className={`form-box register register-orphanage ${activeRole === "orphanage" && showForm ? "visible" : ""}`}>
          <div className="back-arrow" onClick={goBack}>
            <FaArrowLeft /> Back
          </div>
          <h1>Register As Orphanage</h1>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-grid">
              <div className="col">
                <div className="input-box">
                  <input type="text" name="orphanageName" placeholder="Orphanage Name" required onChange={handleChange} />
                  <FaHome className="icon" />
                </div>
                <div className="input-box">
                  <input type="text" name="name" placeholder="Contact Person Name" required onChange={handleChange} />
                  <FaUser className="icon" />
                </div>
                <div className="input-box">
                  <input type="email" name="email" placeholder="Email" required onChange={handleChange} />
                  <FaEnvelope className="icon" />
                </div>
                <div className="input-box">
                  <input type="tel" name="phone" placeholder="Mobile Number" required onChange={handleChange} />
                  <FaPhoneAlt className="icon" />
                </div>
                <div className="input-box">
                  <input type="text" name="licenseNumber" placeholder="Orphanage License Number" required onChange={handleChange} />
                  <FaKey className="icon" />
                </div>
              </div>

              <div className="col">
                <div className="input-box">
                  <input type="number" name="childrenCount" placeholder="Number of Children" required onChange={handleChange} />
                  <FaChild className="icon" />
                </div>
                <div className="input-box">
                  <input type="text" name="city" placeholder="City" required onChange={handleChange} />
                  <FaMapMarkerAlt className="icon" />
                </div>
                <div className="input-box">
                  <input type="text" name="address" placeholder="Address" required onChange={handleChange} />
                  <FaMapMarkerAlt className="icon" />
                </div>
                <div className="input-box">
                  <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" required onChange={handleChange} />
                  <span className="icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
            </div>

            <div className="buttons">
              <button type="button" className="submit-btn" onClick={() => handleSubmit("orphanage")}>
                Submit
              </button>
              <p className="login-link">
                Already registered? <Link to="/login">Login</Link>
              </p>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Signup;