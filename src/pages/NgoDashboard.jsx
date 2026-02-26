import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FaUsers, FaUtensils, FaCalendarAlt, FaInfoCircle, FaEye,
  FaTachometerAlt, FaHandHoldingHeart, FaWarehouse, FaBell, FaCog,
  FaSignOutAlt, FaMoon, FaSun, FaTruck, FaBoxOpen, FaHome,
  FaChartBar, FaHeart, FaFireAlt,
} from "react-icons/fa";
import "./NgoDashboard.css";

/* ===============================
   NGO SIDEBAR
================================= */
const NgoSidebar = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const storedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(storedMode);
    document.body.classList.toggle("ngo-dark", storedMode);
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      } catch (err) { console.error(err); }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      document.body.classList.toggle("ngo-dark", newMode);
      localStorage.setItem("darkMode", newMode);
      return newMode;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("dashboardContext");
    navigate("/");
  };

  return (
    <div className="ngo-sidebar">
      <nav className="ngo-sidebar-nav">

        <div className="ngo-sidebar-top">
          <NavLink to="/ngo-dashboard" end>
            <FaTachometerAlt />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/ngo-dashboard/donations-received">
            <FaHandHoldingHeart />
            <span>Donations Received</span>
          </NavLink>

          <NavLink to="/ngo-dashboard/food-stock">
            <FaWarehouse />
            <span>Food Stock</span>
          </NavLink>

          <NavLink to="/ngo-dashboard/pickup-details">
            <FaTruck />
            <span>Pickup Details</span>
          </NavLink>

          <NavLink to="/ngo-dashboard/delivery-details">
            <FaBoxOpen />
            <span>Delivery Details</span>
          </NavLink>

          {/* ✅ Orphanages link */}
          <NavLink to="/ngo-dashboard/orphanages">
            <FaHome /><span>Orphanages</span>
          </NavLink>

          {/* ✅ Analytics link */}
          <NavLink to="/ngo-dashboard/analytics">
            <FaChartBar /><span>Analytics</span>
          </NavLink>

          <NavLink
            to="/ngo-dashboard/notifications"
            onClick={() => setUnreadCount(0)}
          >
            <div className="ngo-notif-wrapper">
              <FaBell />
              {unreadCount > 0 && (
                <span className="ngo-notif-badge">{unreadCount}</span>
              )}
            </div>
            <span>Notifications</span>
          </NavLink>

          <NavLink to="/ngo-dashboard/settings">
            <FaCog />
            <span>Settings</span>
          </NavLink>
        </div>

        <div className="ngo-sidebar-bottom">
          <div className="ngo-sidebar-darkmode" onClick={toggleDarkMode}>
            {darkMode ? <FaMoon /> : <FaSun />}
            <span>{darkMode ? "Dark Mode" : "Light Mode"}</span>
          </div>

          <div className="ngo-sidebar-logout" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </div>
        </div>

      </nav>
    </div>
  );
};

/* ===============================
   NGO DASHBOARD LAYOUT
================================= */
const NgoDashboardLayout = () => (
  <div className="ngo-layout">
    <NgoSidebar />
    <div className="ngo-main">
      <Outlet />
    </div>
  </div>
);

/* ===============================
   NGO DASHBOARD (Main Page)
================================= */
const NgoDashboard = () => {
  const navigate = useNavigate();
  const [ngo, setNgo] = useState(null);
  const [availableDonations, setAvailableDonations] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [stats, setStats] = useState({ received: 0, foodStock: 0, serves: 0 });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const ngoRes = await fetch("http://localhost:5000/api/dashboard/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ngoData = await ngoRes.json();
      setNgo(ngoData);

      const pendingRes = await fetch("http://localhost:5000/api/donations/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pendingData = await pendingRes.json();
      setAvailableDonations(pendingData.filter(d => d.city === ngoData.city));

      const myDonationsRes = await fetch("http://localhost:5000/api/dashboard/ngo-dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const myData = await myDonationsRes.json();
      const allDonations = myData.myDonations || [];
      setMyDonations(allDonations);

      const totalServes = allDonations.reduce(
        (total, d) => total + d.items.reduce((sum, i) => sum + Number(i.serves || 0), 0), 0
      );

      // Food stock = items from completed donations NOT yet donated to an orphanage
      // Mirrors NgoFoodStock: skip any itemIndex present in donatedItems
      const foodStockItems = allDonations
        .filter(d => d.status === "completed")
        .reduce((count, d) => {
          const donatedIndexes = new Set((d.donatedItems || []).map(di => di.itemIndex));
          const available = d.items.filter((_, idx) => !donatedIndexes.has(idx));
          return count + available.length;
        }, 0);

      setStats({
        received:  allDonations.length,
        foodStock: foodStockItems,
        serves:    totalServes,
      });

    } catch (err) {
      console.error("NGO Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) return <div className="ngo-loader">Loading...</div>;

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const recentDonations = [...myDonations]
    .sort((a, b) => new Date(b.donationDate) - new Date(a.donationDate))
    .slice(0, 4);

  return (
    <div className="ngo-page">

      {/* HEADER */}
      <div className="ngo-header">
        <div>
          <h1 className="ngo-header__title">Welcome, {ngo?.ngoName || "NGO"} 👋</h1>
          <p className="ngo-header__subtitle">{ngo?.ngoName} · NGO · {ngo?.city}</p>
          <p className="ngo-header__date">{today}</p>
        </div>
      </div>

      {/* STATS */}
      <div className="ngo-stats-grid">

        <div className="ngo-stat-card ngo-stat-card--blue">
          <div className="ngo-stat-card__icon-wrap ngo-stat-card__icon-wrap--blue">
            <FaHandHoldingHeart className="ngo-stat-card__icon ngo-stat-card__icon--blue" />
          </div>
          <div>
            <span className="ngo-stat-card__label">Donations Received</span>
            <p className="ngo-stat-card__value">{stats.received}</p>
          </div>
        </div>

        {/* ✅ Food Stock card — clicking navigates to food-stock page */}
        <div
          className="ngo-stat-card ngo-stat-card--green"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/ngo-dashboard/food-stock")}
        >
          <div className="ngo-stat-card__icon-wrap ngo-stat-card__icon-wrap--green">
            <FaWarehouse className="ngo-stat-card__icon ngo-stat-card__icon--green" />
          </div>
          <div>
            <span className="ngo-stat-card__label">Food Stock Items</span>
            <p className="ngo-stat-card__value">{stats.foodStock}</p>
          </div>
        </div>

        <div className="ngo-stat-card ngo-stat-card--purple">
          <div className="ngo-stat-card__icon-wrap ngo-stat-card__icon-wrap--purple">
            <FaUsers className="ngo-stat-card__icon ngo-stat-card__icon--purple" />
          </div>
          <div>
            <span className="ngo-stat-card__label">Serves Saved</span>
            <p className="ngo-stat-card__value">{stats.serves}</p>
          </div>
        </div>

      </div>

      {/* ── QUICK IMPACT ── */}
      {(() => {
        const now = new Date();
        const monthlyDonations = myDonations.filter(d => {
          const dd = new Date(d.donationDate);
          return dd.getMonth() === now.getMonth() && dd.getFullYear() === now.getFullYear();
        });
        const monthlyServes = monthlyDonations.reduce(
          (s, d) => s + d.items.reduce((ss, i) => ss + Number(i.serves || 0), 0), 0
        );
        return (
          <div className="ngo-impact-card">
            <div className="ngo-impact-card__left">
              <div className="ngo-impact-card__icon"><FaHeart /></div>
              <div>
                <p className="ngo-impact-card__label">Your Impact This Month</p>
                <h3 className="ngo-impact-card__value">{monthlyServes} serves</h3>
                <p className="ngo-impact-card__sub">
                  across {monthlyDonations.length} pickup{monthlyDonations.length !== 1 ? "s" : ""} this month
                </p>
              </div>
            </div>

            <div className="ngo-impact-card__center">
              <div className="ngo-impact-milestone">
                <div className="ngo-impact-milestone__labels">
                  <span className="ngo-impact-milestone__current">{stats.serves} total serves</span>
                  <span className="ngo-impact-milestone__target">
                    Next milestone: {Math.ceil((stats.serves || 1) / 100) * 100}
                  </span>
                </div>
                <div className="ngo-impact-milestone__track">
                  <div
                    className="ngo-impact-milestone__fill"
                    style={{ width: `${Math.min(100, (stats.serves % 100) || (stats.serves > 0 ? 100 : 0))}%` }}
                  />
                </div>
                <p className="ngo-impact-milestone__note">
                  {Math.ceil((stats.serves || 1) / 100) * 100 - stats.serves > 0
                    ? `${Math.ceil((stats.serves || 1) / 100) * 100 - stats.serves} more serves to next milestone 🎯`
                    : stats.serves > 0 ? "Milestone reached! 🎉" : "Start accepting donations to track impact"}
                </p>
              </div>
            </div>

            <div className="ngo-impact-card__right">
              <FaFireAlt className="ngo-impact-card__fire" />
              <p className="ngo-impact-card__streak-label">All-time</p>
              <p className="ngo-impact-card__streak-val">{myDonations.length}</p>
              <p className="ngo-impact-card__streak-unit">pickups</p>
            </div>
          </div>
        );
      })()}

      {/* AVAILABLE DONATIONS */}
      <div className="ngo-table-card">
        <div className="ngo-table-card__header">
          <h2 className="ngo-table-card__title">Available Donations in {ngo?.city}</h2>
        </div>

        {availableDonations.length === 0 ? (
          <div className="ngo-empty">No donations available currently.</div>
        ) : (
          <div className="ngo-table">
            <div className="ngo-table__row ngo-table__row--head">
              <span><FaUtensils /> Food</span>
              <span><FaUsers /> Serves</span>
              <span><FaCalendarAlt /> Date</span>
              <span><FaInfoCircle /> Status</span>
              <span>Action</span>
            </div>
            {availableDonations.map(d => (
              <div className="ngo-table__row" key={d._id}>
                <span>{d.items.map(i => i.name).join(", ")}</span>
                <span>{d.items.map(i => i.serves).join(", ")}</span>
                <span>{new Date(d.donationDate).toLocaleDateString("en-IN")}</span>
                <span className={`ngo-badge ngo-badge--${d.status}`}>{d.status}</span>
                <span>
                  <button
                    className="ngo-btn-secondary"
                    onClick={async () => {
                      try {
                        await fetch(`http://localhost:5000/api/donations/${d._id}/accept`, {
                          method: "PUT",
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        fetchDashboard();
                      } catch (err) { console.error(err); }
                    }}
                  >Accept</button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DONATIONS RECEIVED — recent 4 + View All */}
      <div className="ngo-table-card">
        <div className="ngo-table-card__header">
          <h2 className="ngo-table-card__title">Donations Received</h2>
        </div>

        {myDonations.length === 0 ? (
          <div className="ngo-empty">No donations received yet.</div>
        ) : (
          <>
            <div className="ngo-table">
              <div className="ngo-table__row ngo-table__row--head ngo-table__row--accepted">
                <span><FaUtensils /> Food</span>
                <span><FaUsers /> Serves</span>
                <span><FaCalendarAlt /> Date</span>
                <span><FaInfoCircle /> Status</span>
                <span><FaEye /> Details</span>
              </div>
              {recentDonations.map(d => (
                <div className="ngo-table__row ngo-table__row--accepted" key={d._id}>
                  <span>{d.items.map(i => i.name).join(", ")}</span>
                  <span>{d.items.map(i => i.serves).join(", ")}</span>
                  <span>{new Date(d.donationDate).toLocaleDateString("en-IN")}</span>
                  <span className={`ngo-badge ngo-badge--${d.status}`}>{d.status}</span>
                  <span>
                    <button
                      className="ngo-btn-secondary"
                      onClick={() => navigate(`/ngo-dashboard/pickup-details?id=${d._id}`)}
                    >View</button>
                  </span>
                </div>
              ))}
            </div>

            {/* ✅ navigates to donations-received page */}
            {myDonations.length > 4 && (
              <div className="ngo-view-all-wrap">
                <button
                  className="ngo-view-all-btn"
                  onClick={() => navigate("/ngo-dashboard/donations-received")}
                >
                  View All Donations →
                </button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};

export { NgoDashboardLayout, NgoDashboard };
export default NgoDashboard;