import { useEffect, useState } from "react";
import "./DonorDashboard.css";
import "./Donations.css";
import { FaUtensils, FaUsers, FaCalendarAlt, FaInfoCircle, FaCheckCircle, FaHome } from "react-icons/fa";

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://savetheplae-backend.onrender.com/api/donations/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDonations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  if (loading) return <div className="donor-loader">Loading Donations...</div>;

  return (
    <div className="donor-page">

      <div className="donor-header">
        <div>
          <h1 className="donor-header__title">All Donations</h1>
          <p className="donations-subtitle">Complete history of your food donations</p>
        </div>
        <span className="donations-count">{donations.length} Total</span>
      </div>

      <div className="donor-table-card">
        <div className="donor-table-card__header">
          <h2 className="donor-table-card__title">Donation Records</h2>
        </div>

        {donations.length === 0 ? (
          <div className="donor-empty">No donations yet. Start helping today.</div>
        ) : (
          <div className="donor-table donations-table">
            <div className="donor-table__row donor-table__row--head">
              <span><FaUtensils /> Food</span>
              <span><FaUsers /> Serves</span>
              <span><FaCalendarAlt /> Date</span>
              <span><FaInfoCircle /> Status</span>
              <span><FaCheckCircle /> Accepted By</span>
              <span><FaHome /> Received By</span>
            </div>

            {donations.map((d) => (
              <div className="donor-table__row" key={d._id}>
                <span>{d.items.map((i) => i.name).join(", ")}</span>
                <span>{d.items.map((i) => i.serves).join(", ")}</span>
                <span>
                  {d.donationDate
                    ? new Date(d.donationDate).toLocaleDateString("en-IN")
                    : "N/A"}
                </span>
                <span className={`donor-badge donor-badge--${d.status}`}>
                  {d.status}
                </span>
                <span className="donor-accepted-by">
                  {d.acceptedBy?.ngoName ? `${d.acceptedBy.ngoName} NGO` : "—"}
                </span>
                <span className="donor-received-by">
                  {d.receivedByName || "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Donations;