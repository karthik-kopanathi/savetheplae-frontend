import { useEffect, useState } from "react";
import { FaBell, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaTruck, FaTrash } from "react-icons/fa";
import "./OrphanageNotifications.css";

const OrphanageNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]   = useState(true);
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
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchNotifications();
    fetch("http://localhost:5000/api/notifications/mark-read", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(console.error);
  }, []);

  const handleConfirmDelivery = async (notif) => {
    const donationId = notif.metadata?.donationId || notif.donationId;
    const itemIndex  = notif.metadata?.itemIndex;
    if (!donationId) return alert("Missing donation info");

    setConfirming(p => ({ ...p, [notif._id]: true }));
    try {
      const body = { donationId };
      if (itemIndex !== undefined && itemIndex !== null) {
        body.itemIndex = itemIndex;
      }

      const res = await fetch("http://localhost:5000/api/orphanage/confirm-delivery", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setConfirmed(p => ({ ...p, [notif._id]: true }));
        fetchNotifications();
      } else {
        alert(data.message || "Failed to confirm delivery");
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
    if (type === "food_request_accepted")    return <FaCheckCircle   className="orn-icon orn-icon--green" />;
    if (type === "food_incoming")            return <FaTruck         className="orn-icon orn-icon--blue" />;
    if (type === "delivery_confirm_request") return <FaTruck         className="orn-icon orn-icon--orange" />;
    if (type === "request_rejected")         return <FaExclamationTriangle className="orn-icon orn-icon--red" />;
    return <FaInfoCircle className="orn-icon orn-icon--blue" />;
  };

  const getBorderClass = (type) => {
    if (type === "food_request_accepted")    return "orn-notif--green";
    if (type === "food_incoming")            return "orn-notif--blue";
    if (type === "delivery_confirm_request") return "orn-notif--orange";
    if (type === "request_rejected")         return "orn-notif--red";
    return "orn-notif--blue";
  };

  if (loading) return <div className="orn-loader">Loading...</div>;

  return (
    <div className="orn-page">
      <div className="orn-header">
        <div className="orn-header__left">
          <h1 className="orn-header__title"><FaBell /> Notifications</h1>
          <p className="orn-header__sub">Your latest activity and updates</p>
        </div>
        <div className="orn-header__right">
          <span className="orn-count-badge">{notifications.length} Total</span>
          {notifications.length > 0 && (
            <button className="orn-clear-btn" onClick={handleClearAll}>
              <FaTrash /> Clear All
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="orn-empty"><p>No notifications yet.</p></div>
      ) : (
        <div className="orn-list">
          {notifications.map(notif => (
            <div
              key={notif._id}
              className={`orn-notif ${getBorderClass(notif.type)} ${!notif.read ? "orn-notif--unread" : ""}`}
            >
              <div className="orn-notif__left">
                {getIcon(notif.type)}
              </div>
              <div className="orn-notif__body">
                <p className="orn-notif__msg">{notif.message}</p>
                <span className="orn-notif__time">
                  {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })} · {new Date(notif.createdAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>

                {notif.type === "delivery_confirm_request" && !notif.actioned && (
                  <div className="orn-notif__action">
                    {confirmed[notif._id] ? (
                      <span className="orn-confirmed-badge"><FaCheckCircle /> Delivery Confirmed!</span>
                    ) : (
                      <button
                        className="orn-confirm-btn"
                        disabled={confirming[notif._id]}
                        onClick={() => handleConfirmDelivery(notif)}
                      >
                        <FaCheckCircle />
                        {confirming[notif._id] ? "Confirming..." : "Yes, I Received the Food"}
                      </button>
                    )}
                  </div>
                )}

                {notif.type === "delivery_confirm_request" && notif.actioned && (
                  <div className="orn-notif__action">
                    <span className="orn-confirmed-badge"><FaCheckCircle /> Already Confirmed</span>
                  </div>
                )}
              </div>
              {!notif.read && <span className="orn-unread-dot" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrphanageNotifications;
