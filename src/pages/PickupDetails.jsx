import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaTruck, FaUser, FaPhone, FaMapMarkerAlt, FaUtensils,
  FaCalendarAlt, FaBoxOpen, FaStickyNote, FaArrowLeft, FaCheckCircle
} from "react-icons/fa";
import "./PickupDetails.css";

const PickupDetails = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null);
  const [showAllActive, setShowAllActive] = useState(false);
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const highlightId = searchParams.get("id");

  const fetchPickups = async () => {
    try {
      const res = await fetch("https://savetheplae-backend.onrender.com/api/dashboard/ngo-dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDonations(data.myDonations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  // ✅ NGO clicks Complete Pickup → sends confirmation request to donor
  const handleCompletePickup = async (donationId) => {
    try {
      setRequestingId(donationId);
      const res = await fetch(`https://savetheplae-backend.onrender.com/api/donations/${donationId}/request-completion`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        await fetchPickups();
        alert("Confirmation request sent to donor!");
      } else {
        alert(data.message || "Failed to request completion");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRequestingId(null);
    }
  };

  if (loading) return <div className="pd-loader">Loading...</div>;

  const displayDonations = highlightId
    ? donations.filter(d => d._id === highlightId)
    : donations;

  // Split into active and completed
  const activeDonations    = displayDonations.filter(d => d.status !== "completed");
  const completedDonations = displayDonations.filter(d => d.status === "completed");

  const LIMIT = 6;
  const visibleActive    = showAllActive    ? activeDonations    : activeDonations.slice(0, LIMIT);
  const visibleCompleted = showAllCompleted ? completedDonations : completedDonations.slice(0, LIMIT);

  const PickupCard = ({ d }) => (
    <div className={`pd-card ${highlightId === d._id ? "pd-card--highlighted" : ""}`} key={d._id}>

      {/* CARD HEADER */}
      <div className="pd-card__header">
        <FaUtensils className="pd-card__header-icon" />
        <h3 className="pd-card__title">{d.items.map(i => i.name).join(", ")}</h3>
        <span className={`pd-badge pd-badge--${d.status}`}>{d.status}</span>
      </div>

      {/* CARD BODY */}
      <div className="pd-card__body">

        <div className="pd-row">
          <FaBoxOpen className="pd-row__icon pd-row__icon--orange" />
          <div>
            <label className="pd-row__label">Serves</label>
            <p className="pd-row__value">{d.items.map(i => `${i.name} × ${i.serves}`).join(", ")}</p>
          </div>
        </div>

        <div className="pd-row">
          <FaCalendarAlt className="pd-row__icon pd-row__icon--blue" />
          <div>
            <label className="pd-row__label">Donation Date</label>
            <p className="pd-row__value">{new Date(d.donationDate).toLocaleDateString("en-IN", {
              weekday: "long", day: "numeric", month: "long", year: "numeric"
            })}</p>
          </div>
        </div>

        <div className="pd-row">
          <FaCalendarAlt className="pd-row__icon pd-row__icon--orange" />
          <div>
            <label className="pd-row__label">Best Before</label>
            <p className="pd-row__value">{d.bestBefore || "N/A"}</p>
          </div>
        </div>

        <div className="pd-row">
          <FaMapMarkerAlt className="pd-row__icon pd-row__icon--red" />
          <div>
            <label className="pd-row__label">Pickup Location</label>
            <p className="pd-row__value">{d.location || "N/A"}</p>
          </div>
        </div>

        <div className="pd-row">
          <FaUser className="pd-row__icon pd-row__icon--blue" />
          <div>
            <label className="pd-row__label">Donor Name</label>
            <p className="pd-row__value">{d.donor?.name || "N/A"}</p>
          </div>
        </div>

        <div className="pd-row">
          <FaPhone className="pd-row__icon pd-row__icon--green" />
          <div>
            <label className="pd-row__label">Contact Number</label>
            <p className="pd-row__value">{d.donor?.phone || "N/A"}</p>
          </div>
        </div>

        {d.instructions && (
          <div className="pd-row">
            <FaStickyNote className="pd-row__icon pd-row__icon--purple" />
            <div>
              <label className="pd-row__label">Instructions</label>
              <p className="pd-row__value">{d.instructions}</p>
            </div>
          </div>
        )}

      </div>

      {/* CARD FOOTER */}
      <div className="pd-card__footer">
        {d.status === "completed" ? (
          <div className="pd-completed-text">
            <FaCheckCircle /> Pickup Completed
          </div>
        ) : d.confirmationPending ? (
          <div className="pd-waiting-text">
            ⏳ Waiting for donor confirmation...
          </div>
        ) : (
          <button
            className="pd-complete-btn"
            onClick={() => handleCompletePickup(d._id)}
            disabled={requestingId === d._id}
          >
            {requestingId === d._id ? "Sending..." : "✓ Complete Pickup"}
          </button>
        )}
      </div>

    </div>
  );

  return (
    <div className="pd-page">

      {/* HEADER */}
      <div className="pd-header">
        <div>
          <h1 className="pd-header__title"><FaTruck /> Pickup Details</h1>
          <p className="pd-header__count">
            {displayDonations.length} pickup{displayDonations.length !== 1 ? "s" : ""} {highlightId ? "found" : "total"}
          </p>
        </div>
        {highlightId && (
          <button className="pd-back-btn" onClick={() => navigate("/ngo-dashboard/pickup-details")}>
            <FaArrowLeft /> View All Pickups
          </button>
        )}
      </div>

      {displayDonations.length === 0 ? (
        <div className="pd-empty">No pickup details found.</div>
      ) : (
        <>
          {/* ── ACTIVE PICKUPS ── */}
          <div className="pd-section">
            <div className="pd-section__header">
              <div className="pd-section__title-wrap">
                <span className="pd-section__dot pd-section__dot--active"></span>
                <h2 className="pd-section__title">Active Pickups</h2>
                <span className="pd-section__count">{activeDonations.length}</span>
              </div>
            </div>

            {activeDonations.length === 0 ? (
              <div className="pd-empty pd-empty--inline">No active pickups.</div>
            ) : (
              <>
                <div className="pd-grid">
                  {visibleActive.map(d => <PickupCard key={d._id} d={d} />)}
                </div>
                {activeDonations.length > LIMIT && (
                  <div className="pd-view-all-wrap">
                    <button className="pd-view-all-btn" onClick={() => setShowAllActive(v => !v)}>
                      {showAllActive ? "Show Less" : `View All Active Pickups (${activeDonations.length})`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── COMPLETED PICKUPS ── */}
          <div className="pd-section">
            <div className="pd-section__header">
              <div className="pd-section__title-wrap">
                <span className="pd-section__dot pd-section__dot--completed"></span>
                <h2 className="pd-section__title">Completed Pickups</h2>
                <span className="pd-section__count">{completedDonations.length}</span>
              </div>
            </div>

            {completedDonations.length === 0 ? (
              <div className="pd-empty pd-empty--inline">No completed pickups yet.</div>
            ) : (
              <>
                <div className="pd-grid">
                  {visibleCompleted.map(d => <PickupCard key={d._id} d={d} />)}
                </div>
                {completedDonations.length > LIMIT && (
                  <div className="pd-view-all-wrap">
                    <button className="pd-view-all-btn" onClick={() => setShowAllCompleted(v => !v)}>
                      {showAllCompleted ? "Show Less" : `View All Completed Pickups (${completedDonations.length})`}
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

export default PickupDetails;