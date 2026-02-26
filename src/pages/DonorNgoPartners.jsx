import { useEffect, useState } from "react";
import { FaUsers, FaMapMarkerAlt, FaPhone, FaEnvelope, FaBuilding } from "react-icons/fa";
import "./DonorNgoPartners.css";

const DonorNgoPartners = () => {
  const [ngos, setNgos] = useState([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch("https://savetheplae-backend.onrender.com/api/partners", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setNgos(data.ngos || []);
        setCity(data.city || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  if (loading) return <div className="dnp-loader">Loading...</div>;

  return (
    <div className="dnp-page">

      {/* HEADER */}
      <div className="dnp-header">
        <div>
          <h1 className="dnp-header__title"><FaUsers /> NGO Partners</h1>
          <p className="dnp-header__sub">
            NGOs operating in <span className="dnp-header__city">{city}</span> that accept your donations
          </p>
        </div>
        <div className="dnp-count-badge">
          <span className="dnp-count-badge__num">{ngos.length}</span>
          NGO{ngos.length !== 1 ? "s" : ""} in {city}
        </div>
      </div>

      {ngos.length === 0 ? (
        <div className="dnp-empty">
          <p>No NGOs found in {city} yet. More partners will appear as they register.</p>
        </div>
      ) : (
        <div className="dnp-grid">
          {ngos.map((ngo) => {
            const initials = ngo.ngoName
              ? ngo.ngoName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
              : "NG";

            const profileImg = ngo.profilePic
              ? ngo.profilePic.startsWith("http")
                ? ngo.profilePic
                : `https://savetheplae-backend.onrender.com/${ngo.profilePic}`
              : null;

            return (
              <div className="dnp-card" key={ngo._id}>
                {/* Card accent bar */}
                <div className="dnp-card__accent" />

                {/* Avatar */}
                <div className="dnp-card__avatar-wrap">
                  {profileImg ? (
                    <img src={profileImg} alt={ngo.ngoName} className="dnp-card__avatar-img" />
                  ) : (
                    <div className="dnp-card__avatar-initials">{initials}</div>
                  )}
                </div>

                {/* NGO Name */}
                <h3 className="dnp-card__name">{ngo.ngoName}</h3>
                {ngo.name && <p className="dnp-card__contact-person">Contact: {ngo.name}</p>}

                {/* Details */}
                <div className="dnp-card__details">
                  {ngo.city && (
                    <div className="dnp-card__detail">
                      <FaMapMarkerAlt className="dnp-card__detail-icon" />
                      <span>{ngo.city}</span>
                    </div>
                  )}
                  {ngo.address && (
                    <div className="dnp-card__detail">
                      <FaBuilding className="dnp-card__detail-icon" />
                      <span>{ngo.address}</span>
                    </div>
                  )}
                  {ngo.phone && (
                    <div className="dnp-card__detail">
                      <FaPhone className="dnp-card__detail-icon" />
                      <span>{ngo.phone}</span>
                    </div>
                  )}
                  {ngo.email && (
                    <div className="dnp-card__detail">
                      <FaEnvelope className="dnp-card__detail-icon" />
                      <span>{ngo.email}</span>
                    </div>
                  )}
                </div>

                {/* Member since */}
                <div className="dnp-card__footer">
                  Partner since {new Date(ngo.createdAt).toLocaleDateString("en-IN", {
                    month: "short", year: "numeric",
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DonorNgoPartners;