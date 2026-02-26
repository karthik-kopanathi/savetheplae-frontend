import { useEffect, useState } from "react";
import {
  FaHandHoldingHeart, FaMapMarkerAlt, FaWarehouse,
  FaUtensils, FaUsers, FaClock, FaCheckCircle, FaHourglass,
  FaPhone, FaEnvelope, FaBuilding, FaCalendarAlt, FaStar,
  FaGlobe, FaChevronDown, FaChevronUp,
} from "react-icons/fa";
import "./RequestFood.css";

const parseBestBeforeMs = (str) => {
  if (!str) return null;
  const match = str.match(/(\d+(\.\d+)?)\s*hour/i);
  return match ? parseFloat(match[1]) * 3600000 : null;
};

const formatRemaining = (ms) => {
  if (ms <= 0) return null;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const CountdownCell = ({ completedAt, bestBefore }) => {
  const durationMs = parseBestBeforeMs(bestBefore);
  const receivedAt = completedAt ? new Date(completedAt).getTime() : null;
  const getRemaining = () => (!durationMs || !receivedAt) ? null : (receivedAt + durationMs) - Date.now();
  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    if (!durationMs || !receivedAt) return;
    const t = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(t);
  }, [durationMs, receivedAt]);

  if (!durationMs || !receivedAt) return <span className="rf-muted">—</span>;
  if (remaining <= 0) return <span className="rf-spoiled">⚠ Spoiled</span>;
  const pct = Math.max(0, Math.min(100, (remaining / durationMs) * 100));
  const urgency = pct < 20 ? "critical" : pct < 50 ? "warning" : "good";
  return (
    <span className={`rf-countdown rf-countdown--${urgency}`}>
      <span className="rf-countdown__text">{formatRemaining(remaining)}</span>
      <span className="rf-countdown__bar-wrap">
        <span className="rf-countdown__bar" style={{ width: `${pct}%` }} />
      </span>
    </span>
  );
};

/* ── Reusable NGO card ── */
const NgoCard = ({ ngo, requesting, requested, onRequest, outOfCity = false }) => (
  <div className={`rf-ngo-card ${outOfCity ? "rf-ngo-card--out-of-city" : ""}`}>
    {outOfCity && (
      <div className="rf-out-of-city-banner">
        <FaGlobe /> Out of City · {ngo.city}
      </div>
    )}

    {/* ── HERO HEADER ── */}
    <div className="rf-ngo-hero">
      <div className="rf-ngo-hero__left">
        <div className="rf-ngo-avatar">
          {ngo.profilePic ? (
            <img src={ngo.profilePic.startsWith("http") ? ngo.profilePic : `https://savetheplae-backend.onrender.com/${ngo.profilePic}`} alt={ngo.ngoName} />
          ) : (
            <span>{(ngo.ngoName || "NG").slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div>
          <h3 className="rf-ngo-name">{ngo.ngoName}</h3>
          {ngo.name && <p className="rf-ngo-contact">Contact: {ngo.name}</p>}
          <p className="rf-ngo-location"><FaMapMarkerAlt /> {ngo.city}</p>
        </div>
      </div>
      <div className="rf-ngo-hero__right">
        <div className="rf-ngo-stock-pill">
          <FaWarehouse />
          <span>{ngo.stock?.length || 0} item{(ngo.stock?.length || 0) !== 1 ? "s" : ""} in stock</span>
        </div>
        {ngo.createdAt && (
          <p className="rf-ngo-since">
            <FaStar /> Partner since {new Date(ngo.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
          </p>
        )}
      </div>
    </div>

    {/* ── DETAILS STRIP ── */}
    <div className="rf-ngo-details">
      {ngo.address && (
        <div className="rf-ngo-detail-item">
          <FaBuilding className="rf-ngo-detail-item__icon" />
          <span>{ngo.address}</span>
        </div>
      )}
      {ngo.phone && (
        <div className="rf-ngo-detail-item">
          <FaPhone className="rf-ngo-detail-item__icon" />
          <a href={`tel:${ngo.phone}`} className="rf-ngo-link">{ngo.phone}</a>
        </div>
      )}
      {ngo.email && (
        <div className="rf-ngo-detail-item">
          <FaEnvelope className="rf-ngo-detail-item__icon" />
          <a href={`mailto:${ngo.email}`} className="rf-ngo-link">{ngo.email}</a>
        </div>
      )}
      {ngo.createdAt && (
        <div className="rf-ngo-detail-item">
          <FaCalendarAlt className="rf-ngo-detail-item__icon" />
          <span>Member since {new Date(ngo.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
      )}
    </div>

    {/* ── STOCK TABLE ── */}
    <div className="rf-stock-section">
      <h4 className="rf-stock-title">Available Food Stock</h4>
      {!ngo.stock || ngo.stock.length === 0 ? (
        <p className="rf-ngo-empty">No items currently in stock.</p>
      ) : (
        <div className="rf-table">
          <div className="rf-table__row rf-table__row--head">
            <span><FaUtensils /> Food Item</span>
            <span><FaUsers /> Serves</span>
            <span><FaClock /> Best Before</span>
            <span><FaHourglass /> Time Left</span>
            <span>Action</span>
          </div>
          {[...ngo.stock]
            .sort((a, b) => {
              const ta = a.completedAt ? new Date(a.completedAt).getTime() : 0;
              const tb = b.completedAt ? new Date(b.completedAt).getTime() : 0;
              return tb - ta;
            })
            .map(item => {
              const key = `${item.donationId}_${item.itemIndex}`;
              return (
                <div className="rf-table__row" key={key}>
                  <span className="rf-item-name">{item.name}</span>
                  <span>{item.serves}</span>
                  <span className="rf-freshness">{item.bestBefore || "—"}</span>
                  <CountdownCell completedAt={item.completedAt} bestBefore={item.bestBefore} />
                  <span>
                    {requested[key] ? (
                      <span className="rf-requested-badge"><FaCheckCircle /> Requested</span>
                    ) : (
                      <button
                        className="rf-request-btn"
                        disabled={requesting[key]}
                        onClick={() => onRequest(item.donationId, item.itemIndex, ngo._id)}
                      >
                        {requesting[key] ? "Sending..." : "Request"}
                      </button>
                    )}
                  </span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  </div>
);

/* ── MAIN COMPONENT ── */
const RequestFood = () => {
  const [ngos,        setNgos]        = useState([]);
  const [outNgos,     setOutNgos]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingOut,  setLoadingOut]  = useState(false);
  const [showOutCity, setShowOutCity] = useState(false);
  const [requesting,  setRequesting]  = useState({});
  const [requested,   setRequested]   = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("https://savetheplae-backend.onrender.com/api/orphanage/ngo-city-stock", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setNgos(d.ngos || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const loadOutOfCity = async () => {
    if (outNgos.length > 0) {
      setShowOutCity(v => !v);
      return;
    }
    setLoadingOut(true);
    try {
      const res  = await fetch("https://savetheplae-backend.onrender.com/api/orphanage/ngo-out-of-city-stock", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOutNgos(data.ngos || []);
      setShowOutCity(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOut(false);
    }
  };

  const handleRequest = async (donationId, itemIndex, ngoId) => {
    const key = `${donationId}_${itemIndex}`;
    setRequesting(p => ({ ...p, [key]: true }));
    try {
      const res = await fetch("https://savetheplae-backend.onrender.com/api/orphanage/request-food", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ donationId, itemIndex, ngoId }),
      });
      if (res.ok) setRequested(p => ({ ...p, [key]: true }));
      else { const d = await res.json(); alert(d.message || "Request failed"); }
    } catch { alert("Something went wrong"); }
    finally { setRequesting(p => ({ ...p, [key]: false })); }
  };

  if (loading) return <div className="rf-loader">Loading...</div>;

  const totalStock    = ngos.reduce((s, n) => s + (n.stock?.length || 0), 0);
  const outTotalStock = outNgos.reduce((s, n) => s + (n.stock?.length || 0), 0);

  return (
    <div className="rf-page">

      <div className="rf-header">
        <div>
          <h1 className="rf-header__title"><FaHandHoldingHeart /> Request Food</h1>
          <p className="rf-header__sub">Browse available food stock from NGOs in your city and send a request</p>
        </div>
        <div className="rf-count-badge">
          <span className="rf-count-badge__num">{totalStock}</span>
          item{totalStock !== 1 ? "s" : ""} available
        </div>
      </div>

      {/* ── IN-CITY NGOs ── */}
      {ngos.length === 0 ? (
        <div className="rf-empty"><p>No NGOs with available food stock found in your city.</p></div>
      ) : (
        <div className="rf-ngo-list">
          {ngos.map(ngo => (
            <NgoCard
              key={ngo._id}
              ngo={ngo}
              requesting={requesting}
              requested={requested}
              onRequest={handleRequest}
            />
          ))}
        </div>
      )}

      {/* ── OUT-OF-CITY TOGGLE BUTTON ── */}
      <div className="rf-out-of-city-toggle-wrap">
        <div className="rf-out-of-city-divider">
          <span className="rf-out-of-city-divider__line" />
          <span className="rf-out-of-city-divider__label">
            <FaGlobe /> Other Cities
          </span>
          <span className="rf-out-of-city-divider__line" />
        </div>

        <button
          className="rf-out-of-city-btn"
          onClick={loadOutOfCity}
          disabled={loadingOut}
        >
          {loadingOut ? (
            <>Loading out-of-city NGOs...</>
          ) : showOutCity ? (
            <><FaChevronUp /> Hide NGOs from Other Cities</>
          ) : (
            <><FaGlobe /> View NGOs from Other Cities {outNgos.length > 0 && `(${outTotalStock} items)`}</>
          )}
        </button>

        {showOutCity && !loadingOut && outNgos.length === 0 && (
          <p className="rf-out-empty">No NGOs with available stock found in other cities.</p>
        )}
      </div>

      {/* ── OUT-OF-CITY NGOs ── */}
      {showOutCity && outNgos.length > 0 && (
        <div className="rf-ngo-list rf-ngo-list--out-of-city">
          <div className="rf-out-of-city-header">
            <FaGlobe />
            <span>NGOs from Other Cities</span>
            <span className="rf-out-of-city-count">{outTotalStock} items available</span>
          </div>
          {outNgos.map(ngo => (
            <NgoCard
              key={ngo._id}
              ngo={ngo}
              requesting={requesting}
              requested={requested}
              onRequest={handleRequest}
              outOfCity
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default RequestFood;