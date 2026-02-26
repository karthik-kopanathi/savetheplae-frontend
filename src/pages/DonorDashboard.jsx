import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import DonateFoodCard from "./DonateFoodCard";
import "./DonorDashboard.css";
import {
  FaBox,
  FaCheckCircle,
  FaHome,
  FaClock,
  FaUsers,
  FaUtensils,
  FaCalendarAlt,
  FaInfoCircle,
  FaBell,
  FaChartBar,
  FaTachometerAlt,
  FaHandHoldingHeart,
  FaHistory,
  FaCog,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaHeart,
  FaFireAlt,
} from "react-icons/fa";

/* ===============================
   DASHBOARD SIDEBAR
================================= */
const DashboardSidebar = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const storedMode = localStorage.getItem("donorDarkMode") === "true";
    setDarkMode(storedMode);
    document.body.classList.toggle("donor-dark", storedMode);
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      document.body.classList.toggle("donor-dark", newMode);
      localStorage.setItem("donorDarkMode", newMode);
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
    <div className="donor-sidebar">
      <nav className="donor-sidebar-nav">

        <div className="donor-sidebar-top">
          <NavLink to="/donor-dashboard" end>
            <FaTachometerAlt />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/donor-dashboard/donations">
            <FaHandHoldingHeart />
            <span>Donations</span>
          </NavLink>

          

          <NavLink to="/donor-dashboard/analytics">
            <FaChartBar />
            <span>Analytics</span>
          </NavLink>

          <NavLink to="/donor-dashboard/partners">
            <FaUsers />
            <span>NGO Partners</span>
          </NavLink>

          <NavLink
            to="/donor-dashboard/notifications"
            onClick={() => setUnreadCount(0)}
          >
            <div className="donor-notif-wrapper">
              <FaBell />
              {unreadCount > 0 && (
                <span className="donor-notif-badge">{unreadCount}</span>
              )}
            </div>
            <span>Notifications</span>
          </NavLink>

          <NavLink to="/donor-dashboard/settings">
            <FaCog />
            <span>Settings</span>
          </NavLink>
        </div>

        <div className="donor-sidebar-bottom">
          <div className="donor-sidebar-darkmode" onClick={toggleDarkMode}>
            {darkMode ? <FaMoon /> : <FaSun />}
            <span>{darkMode ? "Dark Mode" : "Light Mode"}</span>
          </div>

          <div className="donor-sidebar-logout" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </div>
        </div>

      </nav>
    </div>
  );
};

/* ===============================
   DONOR DASHBOARD LAYOUT
================================= */
const DonorDashboardLayout = () => {
  return (
    <div className="donor-layout">
      <DashboardSidebar />
      <div className="donor-main">
        <Outlet />
      </div>
    </div>
  );
};

/* ===============================
   DONOR DASHBOARD (Main Page)
================================= */
const DonorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({ pending: 0, accepted: 0, completed: 0, serves: 0, monthlyServes: 0, monthlyDonations: 0 });
  const [showDonate, setShowDonate] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const userRes = await fetch("http://localhost:5000/api/dashboard/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();
      setUser(userData);

      const donationsRes = await fetch("http://localhost:5000/api/donations/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const donationData = await donationsRes.json();
      setDonations(donationData);

      const totalServes = donationData.reduce(
        (total, donation) =>
          total + donation.items.reduce((sum, item) => sum + Number(item.serves || 0), 0),
        0
      );

      // Monthly serves — current month only
      const now = new Date();
      const monthlyServes = donationData
        .filter(d => {
          const dd = new Date(d.donationDate);
          return dd.getMonth() === now.getMonth() && dd.getFullYear() === now.getFullYear();
        })
        .reduce((sum, d) => sum + d.items.reduce((s, i) => s + Number(i.serves || 0), 0), 0);

      const monthlyDonations = donationData.filter(d => {
        const dd = new Date(d.donationDate);
        return dd.getMonth() === now.getMonth() && dd.getFullYear() === now.getFullYear();
      }).length;

      setStats({
        pending:          donationData.filter((d) => d.status === "pending").length,
        accepted:         donationData.filter((d) => d.status === "accepted").length,
        completed:        donationData.filter((d) => d.status === "completed").length,
        serves:           totalServes,
        monthlyServes,
        monthlyDonations,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return <div className="donor-loader">Loading Dashboard...</div>;
  }

  return (
    <>
      <div className="donor-page">

        {/* HEADER */}
        <div className="donor-header">
          <div>
            <h1 className="donor-header__title">
              {getGreeting()}, {user?.name || "Donor"} 👋
            </h1>
            <p className="donor-header__date">{today}</p>
          </div>
          <button className="donor-btn-primary" onClick={() => setShowDonate(true)}>
            + Donate Food
          </button>
        </div>

        {/* STATS */}
        <div className="donor-stats-grid">
          <div className="donor-stat-card donor-stat-card--blue">
            <div className="donor-stat-card__icon-wrap donor-stat-card__icon-wrap--blue">
              <FaBox className="donor-stat-card__icon donor-stat-card__icon--blue" />
            </div>
            <div>
              <span className="donor-stat-card__label">Total Donations</span>
              <p className="donor-stat-card__value">{donations.length}</p>
            </div>
          </div>

          <div className="donor-stat-card donor-stat-card--green">
            <div className="donor-stat-card__icon-wrap donor-stat-card__icon-wrap--green">
              <FaCheckCircle className="donor-stat-card__icon donor-stat-card__icon--green" />
            </div>
            <div>
              <span className="donor-stat-card__label">Completed</span>
              <p className="donor-stat-card__value">{stats.completed}</p>
            </div>
          </div>

          <div className="donor-stat-card donor-stat-card--orange">
            <div className="donor-stat-card__icon-wrap donor-stat-card__icon-wrap--orange">
              <FaClock className="donor-stat-card__icon donor-stat-card__icon--orange" />
            </div>
            <div>
              <span className="donor-stat-card__label">Pending</span>
              <p className="donor-stat-card__value">{stats.pending}</p>
            </div>
          </div>

          <div className="donor-stat-card donor-stat-card--purple">
            <div className="donor-stat-card__icon-wrap donor-stat-card__icon-wrap--purple">
              <FaUsers className="donor-stat-card__icon donor-stat-card__icon--purple" />
            </div>
            <div>
              <span className="donor-stat-card__label">Serves Helped</span>
              <p className="donor-stat-card__value">{stats.serves}</p>
            </div>
          </div>
        </div>


        {/* QUICK IMPACT SUMMARY */}
        <div className="donor-impact-card">
          <div className="donor-impact-card__left">
            <div className="donor-impact-card__icon"><FaHeart /></div>
            <div>
              <p className="donor-impact-card__label">Your Impact This Month</p>
              <h3 className="donor-impact-card__value">{stats.monthlyServes} serves</h3>
              <p className="donor-impact-card__sub">
                across {stats.monthlyDonations} donation{stats.monthlyDonations !== 1 ? "s" : ""} this month
              </p>
            </div>
          </div>

          <div className="donor-impact-card__center">
            <div className="donor-impact-milestone">
              <div className="donor-impact-milestone__labels">
                <span className="donor-impact-milestone__current">{stats.serves} total serves</span>
                <span className="donor-impact-milestone__target">
                  Next milestone: {Math.ceil(stats.serves / 100) * 100}
                </span>
              </div>
              <div className="donor-impact-milestone__track">
                <div
                  className="donor-impact-milestone__fill"
                  style={{ width: `${Math.min(100, (stats.serves % 100) || (stats.serves > 0 ? 100 : 0))}%` }}
                />
              </div>
              <p className="donor-impact-milestone__note">
                {Math.ceil(stats.serves / 100) * 100 - stats.serves > 0
                  ? `${Math.ceil(stats.serves / 100) * 100 - stats.serves} more serves to next milestone 🎯`
                  : stats.serves > 0 ? "Milestone reached! 🎉" : "Start donating to track your impact"}
              </p>
            </div>
          </div>

          <div className="donor-impact-card__right">
            <FaFireAlt className="donor-impact-card__fire" />
            <p className="donor-impact-card__streak-label">All-time</p>
            <p className="donor-impact-card__streak-val">{donations.length}</p>
            <p className="donor-impact-card__streak-unit">donations</p>
          </div>
        </div>

        {/* RECENT DONATIONS TABLE */}
        <div className="donor-table-card">
          <div className="donor-table-card__header">
            <h2 className="donor-table-card__title">Recent Donations</h2>
          </div>

          {donations.length === 0 ? (
            <div className="donor-empty">
              No donations yet. Start helping today.
            </div>
          ) : (
            <div className="donor-table">
              <div className="donor-table__row donor-table__row--head">
                <span><FaUtensils /> Food</span>
                <span><FaUsers /> Serves</span>
                <span><FaCalendarAlt /> Date</span>
                <span><FaInfoCircle /> Status</span>
                <span><FaCheckCircle /> Accepted By</span>
                <span><FaHome /> Received By</span>
              </div>

              {donations.slice(0, 2).map((d) => (
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

              {donations.length > 2 && (
                <div style={{ textAlign: "right", marginTop: "16px" }}>
                  <button
                    className="donor-btn-secondary"
                    onClick={() => navigate("/donor-dashboard/donations")}
                  >
                    View All Donations →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {showDonate && (
        <DonateFoodCard
          onClose={() => setShowDonate(false)}
          refresh={fetchDashboard}
        />
      )}
    </>
  );
};

export { DonorDashboardLayout, DonorDashboard };
export default DonorDashboard;