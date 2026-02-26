import { useEffect, useState } from "react";
import { FaPlus, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import defaultAvatar from "../assets/default-avatar.png";
import "./DonorSettings.css";

const DonorSettings = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", city: "", donorType: "", profilePic: null,
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "", newPassword: "", confirmPassword: "",
  });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/dashboard/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const userData = data.user || data;
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
          city: userData.city || "",
          donorType: userData.donorType || "",
          profilePic: null,
        });
      } catch (err) { console.error(err); }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === "profilePic") {
      setFormData({ ...formData, profilePic: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    setMsg({ text: "", type: "" });

    const { oldPassword, newPassword, confirmPassword } = passwordData;
    const isChangingPassword = !user?.googleId && (oldPassword || newPassword || confirmPassword);

    if (isChangingPassword) {
      if (!oldPassword || !newPassword || !confirmPassword) {
        setMsg({ text: "Fill in all three password fields to change password.", type: "error" });
        return;
      }
      if (newPassword.length < 6) {
        setMsg({ text: "New password must be at least 6 characters.", type: "error" });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMsg({ text: "New passwords do not match.", type: "error" });
        return;
      }
    }

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("address", formData.address);
      data.append("city", formData.city);
      data.append("donorType", formData.donorType);
      if (formData.profilePic) data.append("profilePic", formData.profilePic);

      const profileRes = await fetch("http://localhost:5000/api/profile/update", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const profileUpdated = await profileRes.json();
      if (!profileRes.ok) {
        setMsg({ text: profileUpdated.message || "Profile update failed.", type: "error" });
        return;
      }
      setUser(profileUpdated.user || profileUpdated);

      if (isChangingPassword) {
        const pwRes = await fetch("http://localhost:5000/api/profile/change-password", {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ oldPassword, newPassword }),
        });
        const pwData = await pwRes.json();
        if (!pwRes.ok) {
          setMsg({ text: pwData.message || "Password change failed.", type: "error" });
          return;
        }
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      }

      setMsg({ text: "Changes saved successfully!", type: "success" });
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
    } catch (err) {
      console.error(err);
      setMsg({ text: "Something went wrong.", type: "error" });
    }
  };

  if (!user) return null;

  const profileImage = user?.profilePic
    ? user.profilePic.startsWith("http") ? user.profilePic : `http://localhost:5000/${user.profilePic}`
    : defaultAvatar;

  return (
    <div className="ds-container">
      <div className="ds-card">

        <h2 className="ds-title">Account Settings</h2>

        {/* PROFILE PIC */}
        <div className="ds-profile-wrapper">
          <div className="ds-profile-pic-container">
            <img src={profileImage} alt="profile" className="ds-profile-pic" />
            <label className="ds-profile-upload">
              <FaPlus />
              <input type="file" name="profilePic" accept="image/*" onChange={handleChange} />
            </label>
          </div>
        </div>

        {/* PROFILE FIELDS */}
        <div className="ds-form-grid">
          <div className="ds-form-group">
            <label className="ds-label">Name</label>
            <input className="ds-input" type="text" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="ds-form-group">
            <label className="ds-label">Email</label>
            <input className="ds-input" type="email" name="email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="ds-form-group">
            <label className="ds-label">Phone</label>
            <input className="ds-input" type="text" name="phone" value={formData.phone} onChange={handleChange} />
          </div>
          {/* ✅ City added */}
          <div className="ds-form-group">
            <label className="ds-label">City</label>
            <input className="ds-input" type="text" name="city" value={formData.city} onChange={handleChange} />
          </div>
          <div className="ds-form-group">
            <label className="ds-label">Address</label>
            <input className="ds-input" type="text" name="address" value={formData.address} onChange={handleChange} />
          </div>
          <div className="ds-form-group">
            <label className="ds-label">Donor Type</label>
            <select className="ds-input ds-select" name="donorType" value={formData.donorType} onChange={handleChange}>
              <option value="">Select Donor Type</option>
              <option value="individual">Individual (Home)</option>
              <option value="restaurant">Restaurant</option>
              <option value="hotel">Hotel</option>
              <option value="event">Event</option>
              <option value="canteen">Canteen</option>
              <option value="others">Others</option>
            </select>
          </div>
        </div>

        {/* PASSWORD SECTION — hidden for Google login users */}
        {!user?.googleId ? (
          <>
            <div className="ds-divider">
              <span><FaLock /> Change Password</span>
            </div>
            <p className="ds-password-hint">Leave blank if you don't want to change your password.</p>

            <div className="ds-form-grid">
              <div className="ds-form-group ds-form-group--full">
                <label className="ds-label">Current Password</label>
                <div className="ds-input-wrap">
                  <input
                    className="ds-input" type={showOld ? "text" : "password"}
                    placeholder="Enter current password"
                    value={passwordData.oldPassword}
                    onChange={e => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  />
                  <button className="ds-eye-btn" onClick={() => setShowOld(p => !p)}>
                    {showOld ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className="ds-form-group">
                <label className="ds-label">New Password</label>
                <div className="ds-input-wrap">
                  <input
                    className="ds-input" type={showNew ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                  <button className="ds-eye-btn" onClick={() => setShowNew(p => !p)}>
                    {showNew ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className="ds-form-group">
                <label className="ds-label">Confirm New Password</label>
                <div className="ds-input-wrap">
                  <input
                    className="ds-input" type={showConfirm ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                  <button className="ds-eye-btn" onClick={() => setShowConfirm(p => !p)}>
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="ds-google-notice">
            🔒 You signed in with Google. Password management is handled by Google.
          </div>
        )}

        {msg.text && <div className={`ds-msg ds-msg--${msg.type}`}>{msg.text}</div>}

        <button className="ds-save-btn" onClick={handleSave}>Save Changes</button>

      </div>
    </div>
  );
};

export default DonorSettings;