import { useEffect, useState } from "react";
import { FaPlus, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import defaultAvatar from "../assets/default-avatar.png";
import "./OrphanageSettings.css";

const OrphanageSettings = () => {
  const [orphanage, setOrphanage] = useState(null);
  const [formData, setFormData] = useState({
    orphanageName: "", name: "", email: "", phone: "",
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
    const fetchOrphanage = async () => {
      try {
        const res = await fetch("https://savetheplae-backend.onrender.com/api/dashboard/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const u = data.user || data;
        setOrphanage(u);
        setFormData({
          orphanageName: u.orphanageName || "",
          name:          u.name          || "",
          email:         u.email         || "",
          phone:         u.phone         || "",
          address:       u.address       || "",
          city:          u.city          || "",
          profilePic:    null,
        });
      } catch (err) { console.error(err); }
    };
    fetchOrphanage();
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
      data.append("orphanageName", formData.orphanageName);
      data.append("name",          formData.name);
      data.append("email",         formData.email);
      data.append("phone",         formData.phone);
      data.append("address",       formData.address);
      data.append("city",          formData.city);
      if (formData.profilePic) data.append("profilePic", formData.profilePic);

      const profileRes = await fetch("https://savetheplae-backend.onrender.com/api/profile/update", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const profileUpdated = await profileRes.json();
      if (!profileRes.ok) {
        setMsg({ text: profileUpdated.message || "Profile update failed.", type: "error" });
        return;
      }
      setOrphanage(profileUpdated.user || profileUpdated);

      if (isChangingPassword) {
        const pwRes = await fetch("https://savetheplae-backend.onrender.com/api/profile/change-password", {
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

  if (!orphanage) return null;

  const profileImage = orphanage?.profilePic
    ? orphanage.profilePic.startsWith("http")
      ? orphanage.profilePic
      : `https://savetheplae-backend.onrender.com/${orphanage.profilePic}`
    : defaultAvatar;

  return (
    <div className="os-container">
      <div className="os-card">

        <h2 className="os-title">Orphanage Settings</h2>

        <div className="os-profile-wrapper">
          <div className="os-profile-pic-container">
            <img src={profileImage} alt="profile" className="os-profile-pic" />
            <label className="os-profile-upload">
              <FaPlus />
              <input type="file" name="profilePic" accept="image/*" onChange={handleChange} />
            </label>
          </div>
        </div>

        <div className="os-form-grid">
          <div className="os-form-group os-form-group--full">
            <label className="os-label">Orphanage Name</label>
            <input className="os-input" type="text" name="orphanageName" value={formData.orphanageName} onChange={handleChange} />
          </div>
          <div className="os-form-group">
            <label className="os-label">Contact Person</label>
            <input className="os-input" type="text" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="os-form-group">
            <label className="os-label">Email</label>
            <input className="os-input" type="email" name="email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="os-form-group">
            <label className="os-label">Phone</label>
            <input className="os-input" type="text" name="phone" value={formData.phone} onChange={handleChange} />
          </div>
          <div className="os-form-group">
            <label className="os-label">City</label>
            <input className="os-input" type="text" name="city" value={formData.city} onChange={handleChange} />
          </div>
          <div className="os-form-group os-form-group--full">
            <label className="os-label">Address</label>
            <input className="os-input" type="text" name="address" value={formData.address} onChange={handleChange} />
          </div>
        </div>

        <div className="os-divider">
          <span><FaLock /> Change Password</span>
        </div>
        <p className="os-password-hint">Leave blank if you don't want to change your password.</p>

        <div className="os-form-grid">
          <div className="os-form-group os-form-group--full">
            <label className="os-label">Current Password</label>
            <div className="os-input-wrap">
              <input
                className="os-input"
                type={showOld ? "text" : "password"}
                placeholder="Enter current password"
                value={passwordData.oldPassword}
                onChange={e => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
              />
              <button className="os-eye-btn" onClick={() => setShowOld(p => !p)}>
                {showOld ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="os-form-group">
            <label className="os-label">New Password</label>
            <div className="os-input-wrap">
              <input
                className="os-input"
                type={showNew ? "text" : "password"}
                placeholder="At least 6 characters"
                value={passwordData.newPassword}
                onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
              <button className="os-eye-btn" onClick={() => setShowNew(p => !p)}>
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="os-form-group">
            <label className="os-label">Confirm New Password</label>
            <div className="os-input-wrap">
              <input
                className="os-input"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat new password"
                value={passwordData.confirmPassword}
                onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
              <button className="os-eye-btn" onClick={() => setShowConfirm(p => !p)}>
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
        </div>

        {msg.text && <div className={`os-msg os-msg--${msg.type}`}>{msg.text}</div>}

        <button className="os-save-btn" onClick={handleSave}>Save Changes</button>

      </div>
    </div>
  );
};

export default OrphanageSettings;