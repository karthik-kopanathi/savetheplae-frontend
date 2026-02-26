import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHandHoldingHeart, FaUtensils, FaUsers, FaCalendarAlt, FaInfoCircle, FaEye,
} from "react-icons/fa";
import "./NgoDonationsReceived.css";

const NgoDonationsReceived = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | accepted | completed
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await fetch("https://savetheplae-backend.onrender.com/api/dashboard/ngo-dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const sorted = (data.myDonations || []).sort(
          (a, b) => new Date(b.donationDate) - new Date(a.donationDate)
        );
        setDonations(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  if (loading) return <div className="ndr-loader">Loading...</div>;

  const filtered = filter === "all"
    ? donations
    : donations.filter(d => d.status === filter);

  return (
    <div className="ndr-page">

      {/* HEADER */}
      <div className="ndr-header">
        <div>
          <h1 className="ndr-header__title"><FaHandHoldingHeart /> Donations Received</h1>
          <p className="ndr-header__sub">All donations accepted by your NGO</p>
        </div>
        <div className="ndr-count-badge">
          <span className="ndr-count-badge__num">{filtered.length}</span>
          donation{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="ndr-tabs">
        {["all", "accepted", "completed"].map(tab => (
          <button
            key={tab}
            className={`ndr-tab ${filter === tab ? "ndr-tab--active" : ""}`}
            onClick={() => setFilter(tab)}
          >
            {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className="ndr-tab__count">
              {tab === "all"
                ? donations.length
                : donations.filter(d => d.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* TABLE */}
      {filtered.length === 0 ? (
        <div className="ndr-empty">
          <p>No {filter === "all" ? "" : filter} donations found.</p>
        </div>
      ) : (
        <div className="ndr-table-card">
          <div className="ndr-table">

            {/* HEAD */}
            <div className="ndr-table__row ndr-table__row--head">
              <span><FaUtensils /> Food Items</span>
              <span><FaUsers /> Serves</span>
              <span><FaCalendarAlt /> Donation Date</span>
              <span><FaInfoCircle /> Status</span>
              <span><FaEye /> Details</span>
            </div>

            {/* ROWS */}
            {filtered.map(d => (
              <div className="ndr-table__row" key={d._id}>
                <span className="ndr-item-name">{d.items.map(i => i.name).join(", ")}</span>
                <span>{d.items.map(i => i.serves).join(", ")}</span>
                <span>{new Date(d.donationDate).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}</span>
                <span>
                  <span className={`ndr-badge ndr-badge--${d.status}`}>{d.status}</span>
                </span>
                <span>
                  <button
                    className="ndr-view-btn"
                    onClick={() => navigate(`/ngo-dashboard/pickup-details?id=${d._id}`)}
                  >
                    View
                  </button>
                </span>
              </div>
            ))}

          </div>
        </div>
      )}
    </div>
  );
};

export default NgoDonationsReceived;  