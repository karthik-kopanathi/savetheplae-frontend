import { useEffect, useState } from "react";
import { FaPlus, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import defaultAvatar from "../assets/default-avatar.png";
import "./NgoSettings.css";

const NgoSettings = () => {
  const [ngo, setNgo] = useState(null);
  const [formData, setFormData] = useState({
    ngoName: "", name: "", email: "", phone: "",
    address: "", city: "", profilePic: null,
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
    const fetchNgo = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/dashboard/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const ngoData = data.user || data;
        setNgo(ngoData);
        setFormData({
          ngoName: ngoData.ngoName || "",
          name: ngoData.name || "",
          email: ngoData.email || "",
          phone: ngoData.phone || "",
          address: ngoData.address || "",
          city: ngoData.city || "",
          profilePic: null,
        });
      } catch (err) { console.error(err); }
    };
    fetchNgo();
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
    const isChangingPassword = oldPassword || newPassword || confirmPassword;

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
      data.append("ngoName", formData.ngoName);
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("address", formData.address);
      data.append("city", formData.city);
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
      setNgo(profileUpdated.user || profileUpdated);

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

  if (!ngo) return null;

  const profileImage = ngo?.profilePic
    ? ngo.profilePic.startsWith("http") ? ngo.profilePic : `http://localhost:5000/${ngo.profilePic}`
    : defaultAvatar;

  return (
    <div className="ns-container">
      <div className="ns-card">

        <h2 className="ns-title">NGO Settings</h2>

        {/* PROFILE PIC */}
        <div className="ns-profile-wrapper">
          <div className="ns-profile-pic-container">
            <img src={profileImage} alt="profile" className="ns-profile-pic" />
            <label className="ns-profile-upload">
              <FaPlus />
              <input type="file" name="profilePic" accept="image/*" onChange={handleChange} />
            </label>
          </div>
        </div>

        {/* PROFILE FIELDS */}
        <div className="ns-form-grid">
          <div className="ns-form-group ns-form-group--full">
            <label className="ns-label">NGO Name</label>
            <input className="ns-input" type="text" name="ngoName" value={formData.ngoName} onChange={handleChange} />
          </div>
          <div className="ns-form-group">
            <label className="ns-label">Contact Person</label>
            <input className="ns-input" type="text" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="ns-form-group">
            <label className="ns-label">Email</label>
            <input className="ns-input" type="email" name="email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="ns-form-group">
            <label className="ns-label">Phone</label>
            <input className="ns-input" type="text" name="phone" value={formData.phone} onChange={handleChange} />
          </div>
          <div className="ns-form-group">
            <label className="ns-label">City</label>
            <input className="ns-input" type="text" name="city" value={formData.city} onChange={handleChange} />
          </div>
          <div className="ns-form-group ns-form-group--full">
            <label className="ns-label">Address</label>
            <input className="ns-input" type="text" name="address" value={formData.address} onChange={handleChange} />
          </div>
        </div>

        {/* DIVIDER */}
        <div className="ns-divider">
          <span><FaLock /> Change Password</span>
        </div>
        <p className="ns-password-hint">Leave blank if you don't want to change your password.</p>

        {/* PASSWORD FIELDS */}
        <div className="ns-form-grid">
          <div className="ns-form-group ns-form-group--full">
            <label className="ns-label">Current Password</label>
            <div className="ns-input-wrap">
              <input
                className="ns-input" type={showOld ? "text" : "password"}
                placeholder="Enter current password"
                value={passwordData.oldPassword}
                onChange={e => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
              />
              <button className="ns-eye-btn" onClick={() => setShowOld(p => !p)}>
                {showOld ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="ns-form-group">
            <label className="ns-label">New Password</label>
            <div className="ns-input-wrap">
              <input
                className="ns-input" type={showNew ? "text" : "password"}
                placeholder="At least 6 characters"
                value={passwordData.newPassword}
                onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
              <button className="ns-eye-btn" onClick={() => setShowNew(p => !p)}>
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="ns-form-group">
            <label className="ns-label">Confirm New Password</label>
            <div className="ns-input-wrap">
              <input
                className="ns-input" type={showConfirm ? "text" : "password"}
                placeholder="Repeat new password"
                value={passwordData.confirmPassword}
                onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
              <button className="ns-eye-btn" onClick={() => setShowConfirm(p => !p)}>
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
        </div>

        {msg.text && <div className={`ns-msg ns-msg--${msg.type}`}>{msg.text}</div>}

        <button className="ns-save-btn" onClick={handleSave}>Save Changes</button>

      </div>
    </div>
  );
};

export default NgoSettings;