import { useEffect, useState } from "react";
import { FaHome, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUsers } from "react-icons/fa";
import "./NgoOrphanages.css";

const NgoOrphanages = () => {
  const [orphanages, setOrphanages] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("https://savetheplae-backend.onrender.com/api/orphanage/city-orphanages", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setOrphanages(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="nor-loader">Loading...</div>;

  return (
    <div className="nor-page">

      <div className="nor-header">
        <div>
          <h1 className="nor-header__title"><FaHome /> Orphanages</h1>
          <p className="nor-header__sub">Orphanages registered in your city</p>
        </div>
        <div className="nor-count-badge">
          <span className="nor-count-badge__num">{orphanages.length}</span>
          orphanage{orphanages.length !== 1 ? "s" : ""}
        </div>
      </div>

      {orphanages.length === 0 ? (
        <div className="nor-empty">
          <p>No orphanages found in your city yet.</p>
        </div>
      ) : (
        <div className="nor-grid">
          {orphanages.map((o, idx) => {
            const pic = o.profilePic
              ? o.profilePic.startsWith("http") ? o.profilePic : `https://savetheplae-backend.onrender.com/${o.profilePic}`
              : null;
            return (
              <div className="nor-card" key={o._id} style={{ "--i": idx }}>

                <div className="nor-card__top">
                  <div className="nor-card__avatar-wrap">
                    {pic
                      ? <img src={pic} alt={o.orphanageName} className="nor-card__avatar" />
                      : <div className="nor-card__avatar nor-card__avatar--placeholder">🏠</div>
                    }
                  </div>
                  <span className="nor-card__badge">Orphanage</span>
                </div>

                <div className="nor-card__body">
                  <h3 className="nor-card__name">{o.orphanageName || o.name || "—"}</h3>

                  {o.childrenCount && (
                    <p className="nor-card__children">
                      <FaUsers className="nor-card__meta-icon" /> {o.childrenCount} children
                    </p>
                  )}

                  {o.city && (
                    <p className="nor-card__meta"><FaMapMarkerAlt className="nor-card__meta-icon" />{o.city}</p>
                  )}
                  {o.phone && (
                    <p className="nor-card__meta"><FaPhone className="nor-card__meta-icon" />{o.phone}</p>
                  )}
                  {o.email && (
                    <p className="nor-card__meta"><FaEnvelope className="nor-card__meta-icon" />{o.email}</p>
                  )}
                  {o.address && (
                    <p className="nor-card__address">{o.address}</p>
                  )}
                  {o.name && (
                    <p className="nor-card__contact">Contact: <strong>{o.name}</strong></p>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NgoOrphanages;