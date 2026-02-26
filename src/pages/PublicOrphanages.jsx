import { useEffect, useState } from "react";
import { FaHome, FaMapMarkerAlt, FaPhone, FaEnvelope, FaSearch, FaUsers } from "react-icons/fa";
import defaultAvatar from "../assets/default-avatar.png";
import "./PublicOrphanages.css";

const PublicOrphanages = () => {
  const [orphanages, setOrphanages] = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [search,     setSearch]     = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const fetchOrphanages = async () => {
      try {
        const res  = await fetch("https://savetheplae-backend.onrender.com/api/public/orphanages");
        const data = await res.json();
        const list = data.orphanages || data || [];
        setOrphanages(list);
        setFiltered(list);
      } catch (err) {
        console.error("Failed to fetch orphanages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrphanages();
  }, []);

  /* ── filter whenever search or city changes ── */
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      orphanages.filter(o => {
        const name = (o.orphanageName || o.name || "").toLowerCase();
        const city = (o.city || "").toLowerCase();
        const matchSearch = !q || name.includes(q) || city.includes(q);
        const matchCity   = cityFilter === "All" || o.city === cityFilter;
        return matchSearch && matchCity;
      })
    );
  }, [search, cityFilter, orphanages]);

  const cities = ["All", ...Array.from(new Set(orphanages.map(o => o.city).filter(Boolean))).sort()];

  return (
    <div className="po-page">

      {/* ── HERO ── */}
      <div className="po-hero">
        <div className="po-hero__content">
          <span className="po-hero__eyebrow">Our Network</span>
          <h1 className="po-hero__title">Registered Orphanages</h1>
          <p className="po-hero__sub">
            Meet the homes we partner with to ensure rescued food reaches children who need it most across India.
          </p>

          <div className="po-search">
            <FaSearch className="po-search__icon" />
            <input
              className="po-search__input"
              type="text"
              placeholder="Search by name or city…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="po-hero__count">
          <span className="po-hero__count-num">{orphanages.length}</span>
          <span className="po-hero__count-label">Homes Registered</span>
        </div>
      </div>

      {/* ── CITY FILTER TABS ── */}
      {cities.length > 2 && (
        <div className="po-city-tabs">
          {cities.map(c => (
            <button
              key={c}
              className={`po-city-tab ${cityFilter === c ? "po-city-tab--active" : ""}`}
              onClick={() => setCityFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* ── CONTENT ── */}
      {loading ? (
        <div className="po-loader">Loading orphanages…</div>
      ) : filtered.length === 0 ? (
        <div className="po-empty">
          <span>🏠</span>
          <p>
            {search
              ? <>No orphanages found matching "<strong>{search}</strong>"</>
              : "No orphanages registered yet."}
          </p>
        </div>
      ) : (
        <div className="po-grid">
          {filtered.map((o, idx) => {
            const pic = o.profilePic
              ? o.profilePic.startsWith("http")
                ? o.profilePic
                : `https://savetheplae-backend.onrender.com/${o.profilePic}`
              : null;

            return (
              <div className="po-card" key={o._id} style={{ "--i": idx }}>
                <div className="po-card__top">
                  {pic
                    ? <img src={pic} alt={o.orphanageName || o.name} className="po-card__avatar" />
                    : <div className="po-card__avatar po-card__avatar--placeholder">🏠</div>
                  }
                  <div className="po-card__badge">Orphanage</div>
                </div>

                <div className="po-card__body">
                  <h3 className="po-card__name">{o.orphanageName || o.name || "Unnamed Orphanage"}</h3>

                  {o.city && (
                    <span className="po-card__city-badge">
                      <FaMapMarkerAlt /> {o.city}
                    </span>
                  )}

                  {o.phone && (
                    <p className="po-card__meta">
                      <FaPhone className="po-card__meta-icon" />
                      {o.phone}
                    </p>
                  )}
                  {o.email && (
                    <p className="po-card__meta">
                      <FaEnvelope className="po-card__meta-icon" />
                      {o.email}
                    </p>
                  )}
                  {o.address && (
                    <p className="po-card__meta">
                      <FaMapMarkerAlt className="po-card__meta-icon" />
                      {o.address}
                    </p>
                  )}
                  {o.childrenCount && (
                    <p className="po-card__children">
                      <strong>{o.childrenCount}</strong> children supported
                    </p>
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

export default PublicOrphanages;