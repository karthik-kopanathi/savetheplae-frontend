import { useEffect, useState } from "react";
import {
  FaBell, FaCheckCircle, FaInfoCircle, FaExclamationTriangle,
  FaTruck, FaTrash,
} from "react-icons/fa";
import "./Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [confirming, setConfirming] = useState({});
  const [confirmed, setConfirmed]   = useState({});

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

  const handleConfirm = async (notif) => {
    const donationId = notif.donationId || notif.metadata?.donationId;
    if (!donationId) return alert("Missing donation info");

    setConfirming(p => ({ ...p, [notif._id]: true }));
    try {
      const res = await fetch(
        `http://localhost:5000/api/donations/${donationId}/confirm-completion`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        await fetch(`http://localhost:5000/api/notifications/${notif._id}/confirm`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(console.error);
        setConfirmed(p => ({ ...p, [notif._id]: true }));
      } else {
        alert(data.message || "Failed to confirm pickup");
      }
    } catch { alert("Something went wrong"); }
    finally { setConfirming(p => ({ ...p, [notif._id]: false })); }
  };

  const handleClearAll = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notifications/clear-all", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications([]);
      } else {
        alert("Failed to clear notifications");
      }
    } catch {
      alert("Something went wrong");
    }
  };

  const getIcon = (type) => {
    if (type === "accepted")        return <FaCheckCircle   className="notif-item__icon notif-item__icon--green" />;
    if (type === "confirm_pickup")  return <FaTruck         className="notif-item__icon notif-item__icon--orange" />;
    if (type === "spoil_warning")   return <FaExclamationTriangle className="notif-item__icon notif-item__icon--red" />;
    return                                 <FaInfoCircle    className="notif-item__icon notif-item__icon--blue" />;
  };

  if (loading) return <div className="notif-loader">Loading...</div>;

  return (
    <div className="notif-page">
      <div className="notif-header">
        <div className="notif-header__left">
          <h1 className="notif-header__title">
            <FaBell /> Notifications
          </h1>
          <p className="notif-header__count">
            {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="notif-header__right">
          {notifications.length > 0 && (
            <button className="notif-clear-btn" onClick={handleClearAll}>
              <FaTrash /> Clear All
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="notif-empty">No notifications yet.</div>
      ) : (
        <div className="notif-list">
          {notifications.map(notif => (
            <div
              key={notif._id}
              className={`notif-item ${notif.read ? "notif-item--read" : "notif-item--unread"}`}
            >
              {getIcon(notif.type)}
              <div className="notif-item__content">
                <p className="notif-item__message">{notif.message}</p>
                <span className="notif-item__time">
                  {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })} · {new Date(notif.createdAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>

                {notif.type === "confirm_pickup" && !notif.actioned && !notif.confirmed && (
                  <>
                    {confirmed[notif._id] ? (
                      <span className="notif-confirmed-text">
                        <FaCheckCircle /> Pickup Confirmed!
                      </span>
                    ) : (
                      <button
                        className="notif-confirm-btn"
                        disabled={confirming[notif._id]}
                        onClick={() => handleConfirm(notif)}
                      >
                        <FaCheckCircle />
                        {confirming[notif._id] ? "Confirming..." : "Yes, They Picked It Up"}
                      </button>
                    )}
                  </>
                )}

                {notif.type === "confirm_pickup" && (notif.actioned || notif.confirmed) && (
                  <span className="notif-confirmed-text">
                    <FaCheckCircle /> Already Confirmed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
