import { useEffect, useState } from "react";
import { FaBuilding, FaMapMarkerAlt, FaPhone, FaEnvelope, FaSearch } from "react-icons/fa";
import defaultAvatar from "../assets/default-avatar.png";
import "./NgoPartners.css";

const NgoPartners = () => {
  const [ngos, setNgos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNgos = async () => {
      try {
        const res = await fetch("https://savetheplae-backend.onrender.com/api/partners/ngos");
        const data = await res.json();
        setNgos(data);
        setFiltered(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNgos();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      ngos.filter(
        n =>
          n.ngoName?.toLowerCase().includes(q) ||
          n.city?.toLowerCase().includes(q)
      )
    );
  }, [search, ngos]);

  return (
    <div className="np-page">

      {/* ─── HERO ─── */}
      <div className="np-hero">
        <div className="np-hero__content">
          <span className="np-hero__eyebrow">Our Network</span>
          <h1 className="np-hero__title">NGO Partners</h1>
          <p className="np-hero__sub">
            Meet the organisations working alongside us to rescue food and feed communities across India.
          </p>

          {/* ─── SEARCH ─── */}
          <div className="np-search">
            <FaSearch className="np-search__icon" />
            <input
              className="np-search__input"
              type="text"
              placeholder="Search by name or city…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="np-hero__count">
          <span className="np-hero__count-num">{ngos.length}</span>
          <span className="np-hero__count-label">Partners Nationwide</span>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      {loading ? (
        <div className="np-loader">Loading partners…</div>
      ) : filtered.length === 0 ? (
        <div className="np-empty">
          <span>🔍</span>
          <p>No NGOs found matching "<strong>{search}</strong>"</p>
        </div>
      ) : (
        <div className="np-grid">
          {filtered.map((ngo, idx) => {
            const pic = ngo.profilePic
              ? ngo.profilePic.startsWith("http")
                ? ngo.profilePic
                : `https://savetheplae-backend.onrender.com/${ngo.profilePic}`
              : defaultAvatar;

            return (
              <div className="np-card" key={ngo._id} style={{ "--i": idx }}>
                <div className="np-card__top">
                  <img src={pic} alt={ngo.ngoName} className="np-card__avatar" />
                  <div className="np-card__badge">NGO</div>
                </div>

                <div className="np-card__body">
                  <h3 className="np-card__name">{ngo.ngoName || "Unnamed NGO"}</h3>

                  {ngo.city && (
                    <p className="np-card__meta">
                      <FaMapMarkerAlt className="np-card__meta-icon" />
                      {ngo.city}
                    </p>
                  )}
                  {ngo.phone && (
                    <p className="np-card__meta">
                      <FaPhone className="np-card__meta-icon" />
                      {ngo.phone}
                    </p>
                  )}
                  {ngo.email && (
                    <p className="np-card__meta">
                      <FaEnvelope className="np-card__meta-icon" />
                      {ngo.email}
                    </p>
                  )}
                  {ngo.name && (
                    <p className="np-card__contact">
                      Contact: <strong>{ngo.name}</strong>
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

export default NgoPartners;