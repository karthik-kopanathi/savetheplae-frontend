import { useEffect, useState } from "react";
import {
  FaWarehouse, FaUtensils, FaUsers, FaCalendarAlt,
  FaClock, FaHourglass, FaHandHoldingHeart, FaTimes,
  FaMapMarkerAlt, FaCheckCircle, FaPhone,
} from "react-icons/fa";
import "./NgoFoodStock.css";

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

  if (!durationMs || !receivedAt) return <span className="nfs-muted">—</span>;
  if (remaining <= 0) return <span className="nfs-spoiled">⚠ Spoiled</span>;
  const pct = Math.max(0, Math.min(100, (remaining / durationMs) * 100));
  const urgency = pct < 20 ? "critical" : pct < 50 ? "warning" : "good";
  return (
    <span className={`nfs-countdown nfs-countdown--${urgency}`}>
      <span className="nfs-countdown__text">{formatRemaining(remaining)}</span>
      <span className="nfs-countdown__bar-wrap">
        <span className="nfs-countdown__bar" style={{ width: `${pct}%` }} />
      </span>
    </span>
  );
};

/* ─── ORPHANAGE PICKER MODAL ─── */
const OrphanagePickerModal = ({ item, orphanages, onClose, onDonate, donating }) => (
  <div className="nfs-modal-overlay" onClick={onClose}>
    <div className="nfs-modal" onClick={e => e.stopPropagation()}>
      <div className="nfs-modal__header">
        <div>
          <h3 className="nfs-modal__title">Donate "{item.name}"</h3>
          <p className="nfs-modal__sub">Select an orphanage in your city to donate this item to</p>
        </div>
        <button className="nfs-modal__close" onClick={onClose}><FaTimes /></button>
      </div>

      <div className="nfs-modal__list">
        {orphanages.length === 0 ? (
          <div className="nfs-modal__empty">No orphanages found in your city.</div>
        ) : (
          orphanages.map(o => {
            const pic = o.profilePic
              ? o.profilePic.startsWith("http") ? o.profilePic : `http://localhost:5000/${o.profilePic}`
              : null;
            return (
              <div className="nfs-orphanage-card" key={o._id}>
                <div className="nfs-orphanage-card__left">
                  {pic
                    ? <img src={pic} alt={o.orphanageName} className="nfs-orphanage-card__avatar" />
                    : <div className="nfs-orphanage-card__avatar nfs-orphanage-card__avatar--placeholder">🏠</div>
                  }
                  <div>
                    <p className="nfs-orphanage-card__name">{o.orphanageName || o.name}</p>
                    {o.city && <p className="nfs-orphanage-card__meta"><FaMapMarkerAlt /> {o.city}</p>}
                    {o.phone && <p className="nfs-orphanage-card__meta"><FaPhone /> {o.phone}</p>}
                    {o.childrenCount && <p className="nfs-orphanage-card__meta"><FaUsers /> {o.childrenCount} children</p>}
                  </div>
                </div>
                <button
                  className="nfs-donate-confirm-btn"
                  disabled={donating === o._id}
                  onClick={() => onDonate(o._id)}
                >
                  {donating === o._id ? "Donating..." : "Donate"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  </div>
);

/* ─── MAIN ─── */
const NgoFoodStock = () => {
  const [completedDonations, setCompletedDonations] = useState([]); // now holds flat stock items
  const [loading, setLoading]       = useState(true);
  const [orphanages, setOrphanages] = useState([]);
  const [pickerItem, setPickerItem] = useState(null);
  const [donating, setDonating]     = useState(null);
  const [donated, setDonated]       = useState({});

  const token = localStorage.getItem("token");

  const fetchStock = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orphanage/ngo-food-stock", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // ✅ Store flat stock items directly — no need to flatMap on the frontend
      setCompletedDonations(data.stock || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchOrphanages = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orphanage/city-orphanages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrphanages(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchStock(); fetchOrphanages(); }, []);

  const handleDonate = async (orphanageId) => {
    if (!pickerItem) return;
    setDonating(orphanageId);
    try {
      const res = await fetch("http://localhost:5000/api/orphanage/donate-item", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          donationId: pickerItem.donationId,
          itemIndex:  pickerItem.itemIndex,
          orphanageId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const key = `${pickerItem.donationId}_${pickerItem.itemIndex}`;
        setDonated(p => ({ ...p, [key]: true }));
        setPickerItem(null);
        fetchStock();
      } else {
        alert(data.message || "Failed to donate");
      }
    } catch { alert("Something went wrong"); }
    finally { setDonating(null); }
  };

  if (loading) return <div className="nfs-loader">Loading...</div>;

  // ✅ Backend now returns flat stock items directly — already filtered of donated items
  const allItems = completedDonations;

  return (
    <div className="nfs-page">

      <div className="nfs-header">
        <div>
          <h1 className="nfs-header__title"><FaWarehouse /> Food Stock</h1>
          <p className="nfs-header__sub">Food items from completed pickups · Donate items directly to orphanages in your city</p>
        </div>
        <div className="nfs-count-badge">
          <span className="nfs-count-badge__num">{allItems.length}</span>
          item{allItems.length !== 1 ? "s" : ""} in stock
        </div>
      </div>

      {allItems.length === 0 ? (
        <div className="nfs-empty">
          <p>No food items in stock. Items appear here once pickups are completed and disappear once donated to an orphanage.</p>
        </div>
      ) : (
        <div className="nfs-table-card">
          <div className="nfs-table">
            <div className="nfs-table__row nfs-table__row--head">
              <span><FaUtensils /> Food Item</span>
              <span><FaUsers /> Serves</span>
              <span><FaCalendarAlt /> Received On</span>
              <span><FaClock /> Best Before</span>
              <span><FaHourglass /> Time Left</span>
              <span><FaHandHoldingHeart /> Donate</span>
            </div>

            {allItems.map(item => {
              const key = `${item.donationId}_${item.itemIndex}`;
              const isDonated = donated[key];
              const receivedDate = item.completedAt ? new Date(item.completedAt) : null;
              const receivedStr = receivedDate
                ? receivedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                  + " · " + receivedDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                : "—";

              return (
                <div className="nfs-table__row" key={key}>
                  <span className="nfs-item-name">{item.name}</span>
                  <span>{item.serves}</span>
                  <span className="nfs-received">{receivedStr}</span>
                  <span className="nfs-fresh">{item.bestBefore || "—"}</span>
                  <CountdownCell completedAt={item.completedAt} bestBefore={item.bestBefore} />
                  <span>
                    {isDonated ? (
                      <span className="nfs-donated-badge"><FaCheckCircle /> Donated</span>
                    ) : (
                      <button className="nfs-donate-btn" onClick={() => setPickerItem(item)}>
                        <FaHandHoldingHeart /> Donate
                      </button>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pickerItem && (
        <OrphanagePickerModal
          item={pickerItem}
          orphanages={orphanages}
          onClose={() => setPickerItem(null)}
          onDonate={handleDonate}
          donating={donating}
        />
      )}
    </div>
  );
};

export default NgoFoodStock;