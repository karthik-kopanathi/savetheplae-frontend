import { useEffect, useState } from "react";
import {
  FaTruck, FaUser, FaPhone, FaMapMarkerAlt, FaUtensils,
  FaCalendarAlt, FaBoxOpen, FaBuilding, FaEnvelope,
  FaCheckCircle, FaHourglass,
} from "react-icons/fa";
import "./DeliveryDetails.css";

const DeliveryDetails = () => {
  const [deliveries, setDeliveries]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [completing, setCompleting]   = useState({});
  const [completed, setCompleted]     = useState({});
  const [showAllPending, setShowAllPending]     = useState(false);
  const [showAllDelivered, setShowAllDelivered] = useState(false);

  const token = localStorage.getItem("token");

  const fetchDeliveries = async () => {
    try {
      const res = await fetch("https://savetheplae-backend.onrender.com/api/orphanage/deliveries", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDeliveries(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDeliveries(); }, []);

  const handleDeliveryCompleted = async (donationId) => {
    setCompleting(p => ({ ...p, [donationId]: true }));
    try {
      const res = await fetch("https://savetheplae-backend.onrender.com/api/orphanage/delivery-completed", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ donationId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCompleted(p => ({ ...p, [donationId]: true }));
        await fetchDeliveries();
      } else {
        alert(data.message || "Failed to mark delivery");
      }
    } catch { alert("Something went wrong"); }
    finally { setCompleting(p => ({ ...p, [donationId]: false })); }
  };

  if (loading) return <div className="dd-loader">Loading...</div>;

  const pendingDeliveries   = deliveries
    .filter(d => d.deliveryStatus !== "delivered")
    .sort((a, b) => new Date(b.donatedAt || 0) - new Date(a.donatedAt || 0));
  const completedDeliveries = deliveries.filter(d => d.deliveryStatus === "delivered");

  const LIMIT = 6;
  const visiblePending   = showAllPending   ? pendingDeliveries   : pendingDeliveries.slice(0, LIMIT);
  const visibleDelivered = showAllDelivered ? completedDeliveries : completedDeliveries.slice(0, LIMIT);

  const DeliveryCard = ({ d }) => {
    const orphanage    = d.deliveryTo;
    const foodNames    = d.items?.map(i => i.name).join(", ") || "—";
    const isDelivered  = d.deliveryStatus === "delivered";
    const isAwaiting   = d.deliveryStatus === "awaiting_confirmation";
    const isLocalDone  = completed[d._id];

    const orphanageImg = orphanage?.profilePic
      ? orphanage.profilePic.startsWith("http") ? orphanage.profilePic : `https://savetheplae-backend.onrender.com/${orphanage.profilePic}`
      : null;

    return (
      <div className={`dd-card ${isDelivered ? "dd-card--delivered" : ""}`}>

        {/* CARD HEADER */}
        <div className="dd-card__header">
          <FaUtensils className="dd-card__header-icon" />
          <h3 className="dd-card__title">{foodNames}</h3>
          <span className={`dd-badge dd-badge--${d.deliveryStatus || "pending"}`}>
            {d.deliveryStatus === "awaiting_confirmation" ? "Awaiting Confirm" : d.deliveryStatus || "pending"}
          </span>
        </div>

        <div className="dd-card__body">

          {/* ── FOOD DETAILS ── */}
          <div className="dd-section-label">Food Details</div>

          <div className="dd-row">
            <FaBoxOpen className="dd-row__icon dd-row__icon--orange" />
            <div>
              <label className="dd-row__label">Items & Serves</label>
              <p className="dd-row__value">{d.items?.map(i => `${i.name} × ${i.serves}`).join(", ") || "—"}</p>
            </div>
          </div>

          <div className="dd-row">
            <FaCalendarAlt className="dd-row__icon dd-row__icon--blue" />
            <div>
              <label className="dd-row__label">Donation Date</label>
              <p className="dd-row__value">
                {d.donationDate ? new Date(d.donationDate).toLocaleDateString("en-IN", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                }) : "—"}
              </p>
            </div>
          </div>

          <div className="dd-row">
            <FaHourglass className="dd-row__icon dd-row__icon--orange" />
            <div>
              <label className="dd-row__label">Best Before</label>
              <p className="dd-row__value">{d.bestBefore || "—"}</p>
            </div>
          </div>

          {/* ── DIVIDER ── */}
          <div className="dd-divider" />

          {/* ── ORPHANAGE DETAILS ── */}
          <div className="dd-section-label">Delivering To</div>

          {orphanage ? (
            <>
              {orphanageImg && (
                <div className="dd-orphanage-avatar-wrap">
                  <img src={orphanageImg} alt={orphanage.orphanageName} className="dd-orphanage-avatar" />
                </div>
              )}

              <div className="dd-row">
                <FaUser className="dd-row__icon dd-row__icon--blue" />
                <div>
                  <label className="dd-row__label">Orphanage Name</label>
                  <p className="dd-row__value">{orphanage.orphanageName || orphanage.name || "—"}</p>
                </div>
              </div>

              {orphanage.address && (
                <div className="dd-row">
                  <FaBuilding className="dd-row__icon dd-row__icon--purple" />
                  <div>
                    <label className="dd-row__label">Address</label>
                    <p className="dd-row__value">{orphanage.address}</p>
                  </div>
                </div>
              )}

              <div className="dd-row">
                <FaMapMarkerAlt className="dd-row__icon dd-row__icon--red" />
                <div>
                  <label className="dd-row__label">City</label>
                  <p className="dd-row__value">{orphanage.city || "—"}</p>
                </div>
              </div>

              {orphanage.phone && (
                <div className="dd-row">
                  <FaPhone className="dd-row__icon dd-row__icon--green" />
                  <div>
                    <label className="dd-row__label">Phone</label>
                    <p className="dd-row__value">
                      <a href={`tel:${orphanage.phone}`} className="dd-link">{orphanage.phone}</a>
                    </p>
                  </div>
                </div>
              )}

              {orphanage.email && (
                <div className="dd-row">
                  <FaEnvelope className="dd-row__icon dd-row__icon--blue" />
                  <div>
                    <label className="dd-row__label">Email</label>
                    <p className="dd-row__value">
                      <a href={`mailto:${orphanage.email}`} className="dd-link">{orphanage.email}</a>
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="dd-no-orphanage">Orphanage details not available.</p>
          )}

        </div>

        {/* CARD FOOTER */}
        <div className="dd-card__footer">
          {isDelivered ? (
            <div className="dd-delivered-text"><FaCheckCircle /> Delivery Completed</div>
          ) : isAwaiting || isLocalDone ? (
            <div className="dd-waiting-text">⏳ Waiting for orphanage confirmation...</div>
          ) : (
            <button
              className="dd-complete-btn"
              onClick={() => handleDeliveryCompleted(d._id)}
              disabled={completing[d._id]}
            >
              {completing[d._id] ? "Sending..." : "✓ Mark Delivery Completed"}
            </button>
          )}
        </div>

      </div>
    );
  };

  return (
    <div className="dd-page">

      <div className="dd-header">
        <div>
          <h1 className="dd-header__title"><FaTruck /> Delivery Details</h1>
          <p className="dd-header__count">
            {deliveries.length} deliver{deliveries.length !== 1 ? "ies" : "y"} total
          </p>
        </div>
      </div>

      {deliveries.length === 0 ? (
        <div className="dd-empty">No deliveries assigned yet. Orphanages will appear here after requesting food from your stock.</div>
      ) : (
        <>
          {/* ── PENDING DELIVERIES ── */}
          <div className="dd-section">
            <div className="dd-section__title-wrap">
              <span className="dd-section__dot dd-section__dot--active" />
              <h2 className="dd-section__title">Pending Deliveries</h2>
              <span className="dd-section__count">{pendingDeliveries.length}</span>
            </div>
            {pendingDeliveries.length === 0 ? (
              <div className="dd-empty dd-empty--inline">No pending deliveries.</div>
            ) : (
              <>
                <div className="dd-grid">
                  {visiblePending.map(d => <DeliveryCard key={d._id} d={d} />)}
                </div>
                {pendingDeliveries.length > LIMIT && (
                  <div className="dd-view-all-wrap">
                    <button className="dd-view-all-btn" onClick={() => setShowAllPending(v => !v)}>
                      {showAllPending ? "Show Less" : `View All (${pendingDeliveries.length})`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── COMPLETED DELIVERIES ── */}
          <div className="dd-section">
            <div className="dd-section__title-wrap">
              <span className="dd-section__dot dd-section__dot--completed" />
              <h2 className="dd-section__title">Completed Deliveries</h2>
              <span className="dd-section__count">{completedDeliveries.length}</span>
            </div>
            {completedDeliveries.length === 0 ? (
              <div className="dd-empty dd-empty--inline">No completed deliveries yet.</div>
            ) : (
              <>
                <div className="dd-grid">
                  {visibleDelivered.map(d => <DeliveryCard key={d._id} d={d} />)}
                </div>
                {completedDeliveries.length > LIMIT && (
                  <div className="dd-view-all-wrap">
                    <button className="dd-view-all-btn" onClick={() => setShowAllDelivered(v => !v)}>
                      {showAllDelivered ? "Show Less" : `View All (${completedDeliveries.length})`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DeliveryDetails;