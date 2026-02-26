import { useEffect, useState } from "react";
import { FaBell, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaHandHoldingHeart, FaTrash } from "react-icons/fa";
import "./NgoNotifications.css";

const NgoNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState({});
  const [donated, setDonated] = useState({});

  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetch("http://localhost:5000/api/notifications/mark-read", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(console.error);
  }, []);

  const handleDonate = async (notif) => {
    const { donationId, metadata } = notif;
    const orphanageId = metadata?.orphanageId;
    if (!donationId || !orphanageId) return alert("Missing donation or orphanage info");

    setDonating(p => ({ ...p, [notif._id]: true }));
    try {
      const res = await fetch("http://localhost:5000/api/orphanage/donate-to-orphanage", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ donationId, orphanageId }),
      });
      const data = await res.json();
      if (res.ok) {
        setDonated(p => ({ ...p, [notif._id]: true }));
      } else {
        alert(data.message || "Failed to confirm donation");
      }
    } catch { alert("Something went wrong"); }
    finally { setDonating(p => ({ ...p, [notif._id]: false })); }
  };

  const handleClearAll = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notifications/clear-all", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setNotifications([]);
      else alert("Failed to clear notifications");
    } catch { alert("Something went wrong"); }
  };

  const getIcon = (type) => {
    if (type === "food_request")  return <FaHandHoldingHeart className="nng-icon nng-icon--orange" />;
    if (type === "spoil_warning") return <FaExclamationTriangle className="nng-icon nng-icon--red" />;
    if (type === "request_approved" || type === "delivery_confirmed") return <FaCheckCircle className="nng-icon nng-icon--green" />;
    if (type === "request_rejected") return <FaExclamationTriangle className="nng-icon nng-icon--red" />;
    return <FaInfoCircle className="nng-icon nng-icon--blue" />;
  };

  const getBorderClass = (type) => {
    if (type === "food_request")  return "nng-notif--orange";
    if (type === "spoil_warning") return "nng-notif--red";
    if (type === "request_approved" || type === "delivery_confirmed") return "nng-notif--green";
    if (type === "request_rejected") return "nng-notif--red";
    return "nng-notif--blue";
  };

  if (loading) return <div className="nng-loader">Loading...</div>;

  return (
    <div className="nng-page">
      <div className="nng-header">
        <div className="nng-header__left">
          <h1 className="nng-header__title"><FaBell /> Notifications</h1>
          <p className="nng-header__sub">Your latest activity and updates</p>
        </div>
        <div className="nng-header__right">
          <span className="nng-count-badge">{notifications.length} Total</span>
          {notifications.length > 0 && (
            <button className="nng-clear-btn" onClick={handleClearAll}>
              <FaTrash /> Clear All
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="nng-empty"><p>No notifications yet.</p></div>
      ) : (
        <div className="nng-list">
          {notifications.map(notif => (
            <div
              key={notif._id}
              className={`nng-notif ${getBorderClass(notif.type)} ${!notif.read ? "nng-notif--unread" : ""} ${notif.type === "spoil_warning" ? "nng-notif--spoil" : ""}`}
            >
              <div className="nng-notif__left">
                {getIcon(notif.type)}
              </div>
              <div className="nng-notif__body">
                <p className="nng-notif__msg">{notif.message}</p>
                <span className="nng-notif__time">
                  {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })} · {new Date(notif.createdAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>

                {notif.type === "food_request" && !notif.actioned && (
                  <div className="nng-notif__action">
                    {donated[notif._id] ? (
                      <span className="nng-donated-badge"><FaCheckCircle /> Donation Confirmed</span>
                    ) : (
                      <button
                        className="nng-donate-btn"
                        disabled={donating[notif._id]}
                        onClick={() => handleDonate(notif)}
                      >
                        <FaHandHoldingHeart />
                        {donating[notif._id] ? "Confirming..." : "Donate to Orphanage"}
                      </button>
                    )}
                  </div>
                )}

                {notif.type === "food_request" && notif.actioned && (
                  <div className="nng-notif__action">
                    <span className="nng-donated-badge"><FaCheckCircle /> Already Donated</span>
                  </div>
                )}
              </div>
              {!notif.read && <span className="nng-unread-dot" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NgoNotifications;