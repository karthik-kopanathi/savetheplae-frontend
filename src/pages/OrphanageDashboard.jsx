import { useEffect, useState, useCallback } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt, FaHandHoldingHeart, FaCog,
  FaSignOutAlt, FaMoon, FaSun, FaUtensils, FaUsers,
  FaCalendarAlt, FaInfoCircle, FaCheckCircle, FaBox, FaTruck,
  FaBell, FaAppleAlt, FaClipboardList,
  FaChartBar, FaHeart, FaFireAlt,
} from "react-icons/fa";
import "./OrphanageDashboard.css";

const POLL_MS = 20_000; // re-fetch silently every 20 s

/* ===============================
   SIDEBAR
================================= */
const OrphanageSidebar = () => {
  const navigate = useNavigate();
  const [darkMode,    setDarkMode]    = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const stored = localStorage.getItem("orphanageDarkMode") === "true";
    setDarkMode(stored);
    document.body.classList.toggle("orphanage-dark", stored);
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res  = await fetch("https://savetheplae-backend.onrender.com/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      } catch (err) { console.error(err); }
    };
    fetchUnread();
    const iv = setInterval(fetchUnread, 30_000);
    return () => clearInterval(iv);
  }, [token]);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      document.body.classList.toggle("orphanage-dark", next);
      localStorage.setItem("orphanageDarkMode", String(next));
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("dashboardContext");
    navigate("/");
  };

  return (
    <div className="orphanage-sidebar">
      <nav className="orphanage-sidebar-nav">
        <div className="orphanage-sidebar-top">

          <NavLink to="/orphanage-dashboard" end>
            <FaTachometerAlt /><span>Dashboard</span>
          </NavLink>

          <NavLink to="/orphanage-dashboard/donations-received">
            <FaHandHoldingHeart /><span>Donations Received</span>
          </NavLink>

          <NavLink to="/orphanage-dashboard/request-food">
            <FaAppleAlt /><span>Request Food</span>
          </NavLink>

          {/* ✅ Analytics */}
          <NavLink to="/orphanage-dashboard/analytics">
            <FaChartBar /><span>Analytics</span>
          </NavLink>

          <NavLink
            to="/orphanage-dashboard/notifications"
            onClick={() => setUnreadCount(0)}
          >
            <div className="orphanage-notif-wrapper">
              <FaBell />
              {unreadCount > 0 && (
                <span className="orphanage-notif-badge">{unreadCount}</span>
              )}
            </div>
            <span>Notifications</span>
          </NavLink>

          <NavLink to="/orphanage-dashboard/settings">
            <FaCog /><span>Settings</span>
          </NavLink>

        </div>

        <div className="orphanage-sidebar-bottom">
          <div className="orphanage-sidebar-darkmode" onClick={toggleDarkMode}>
            {darkMode ? <FaMoon /> : <FaSun />}
            <span>{darkMode ? "Dark Mode" : "Light Mode"}</span>
          </div>
          <div className="orphanage-sidebar-logout" onClick={handleLogout}>
            <FaSignOutAlt /><span>Logout</span>
          </div>
        </div>
      </nav>
    </div>
  );
};

/* ===============================
   LAYOUT
================================= */
const OrphanageDashboardLayout = () => (
  <div className="orphanage-layout">
    <OrphanageSidebar />
    <div className="orphanage-main">
      <Outlet />
    </div>
  </div>
);

/* ===============================
   MAIN DASHBOARD PAGE
================================= */
const OrphanageDashboard = () => {
  const navigate = useNavigate();

  const [orphanage,   setOrphanage]   = useState(null);
  const [myDonations, setMyDonations] = useState([]);
  const [stats,       setStats]       = useState({ donationsReceived: 0, upcoming: 0, servesReceived: 0 });
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);

  const token = localStorage.getItem("token");

  /* ─── core fetch ─────────────────────────────────────────── */
  const fetchDashboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else         setRefreshing(true);

    try {
      const [profileRes, dashRes] = await Promise.all([
        fetch("https://savetheplae-backend.onrender.com/api/dashboard/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("https://savetheplae-backend.onrender.com/api/dashboard/orphanage-dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const profileData = await profileRes.json();
      setOrphanage(profileData.user || profileData);

      const dashData  = await dashRes.json();
      const donations = dashData.myDonations || [];
      setMyDonations(donations);

      /* use server-computed stats — they handle all 3 delivery patterns */
      if (dashData.stats) {
        setStats(dashData.stats);
      } else {
        // fallback client-side compute
        setStats({
          donationsReceived: donations.filter(d =>
            d.orphanageStatus === "received" || d.status === "completed"
          ).length,
          upcoming: donations.filter(d =>
            d.orphanageStatus === "upcoming" || d.status === "accepted"
          ).length,
          servesReceived: donations
            .filter(d => d.orphanageStatus === "received" || d.status === "completed")
            .reduce((sum, d) =>
              sum + d.items.reduce((s, i) => s + (Number(i.serves) || 0), 0), 0),
        });
      }
    } catch (err) {
      console.error("Orphanage Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  /* initial load */
  useEffect(() => { fetchDashboard(false); }, [fetchDashboard]);

  /* poll every POLL_MS so dashboard updates after NGO donates */
  useEffect(() => {
    const iv = setInterval(() => fetchDashboard(true), POLL_MS);
    return () => clearInterval(iv);
  }, [fetchDashboard]);

  /* re-fetch when user returns to this tab (e.g. after confirming in Notifications) */
  useEffect(() => {
    const onFocus = () => fetchDashboard(true);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchDashboard]);

  /* ─── loading state ─────────────────────────────────────── */
  if (loading) return <div className="orphanage-loader">Loading...</div>;

  /* ─── derived display values ─────────────────────────────── */
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const orphanageName = orphanage?.orphanageName || orphanage?.name || "Orphanage";

  /* upcoming = orphanageStatus "upcoming" (set by backend for all 3 patterns) */
  const upcomingList = [...myDonations]
    .filter(d => d.orphanageStatus === "upcoming"
              || (!d.orphanageStatus && d.status === "accepted"))
    .sort((a, b) => new Date(b.donationDate) - new Date(a.donationDate));

  /* received = orphanageStatus "received" — latest delivered first, max 4 */
  const recentList = [...myDonations]
    .filter(d => d.orphanageStatus === "received"
              || (!d.orphanageStatus && d.status === "completed"))
    .sort((a, b) => {
      // prefer deliveredAt if available (per-item), else updatedAt, else donationDate
      const ta = new Date(
        a.myDonatedItems?.[0]?.deliveredAt || a.updatedAt || a.donationDate
      );
      const tb = new Date(
        b.myDonatedItems?.[0]?.deliveredAt || b.updatedAt || b.donationDate
      );
      return tb - ta;
    })
    .slice(0, 4);

  /* ─── row helpers ────────────────────────────────────────── */
  const getSource = (d) => {
    if (d.acceptedBy?.ngoName) return d.acceptedBy.ngoName;
    if (d.donor?.name)         return `Donor: ${d.donor.name}`;
    return "—";
  };

  const getFoodNames = (d) => {
    if (d.myDonatedItems?.length) {
      return d.myDonatedItems
        .map(di => di.itemName || d.items[di.itemIndex]?.name)
        .filter(Boolean).join(", ");
    }
    return d.items.map(i => i.name).join(", ");
  };

  const getServes = (d) => {
    if (d.myDonatedItems?.length) {
      return d.myDonatedItems.reduce((s, di) => {
        const item = d.items[di.itemIndex];
        return s + (Number(item?.serves) || 0);
      }, 0);
    }
    return d.items.reduce((s, i) => s + (Number(i.serves) || 0), 0);
  };

  /* ─── render ─────────────────────────────────────────────── */
  return (
    <div className="orphanage-page">

      {/* ── HEADER ── */}
      <div className="orphanage-header">
        <div className="orphanage-header__left">
          <h1 className="orphanage-header__title">Welcome, {orphanageName} 👋</h1>
          <p className="orphanage-header__date">{today}</p>
        </div>

        <div className="orphanage-header__actions">
          {/* REQUEST FOOD */}
          <button
            className="orphanage-request-food-btn"
            onClick={() => navigate("/orphanage-dashboard/request-food")}
          >
            <FaAppleAlt />
            <span>Request Food</span>
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="orphanage-stats-grid">

        <div className="orphanage-stat-card orphanage-stat-card--blue">
          <div className="orphanage-stat-card__icon-wrap orphanage-stat-card__icon-wrap--blue">
            <FaBox className="orphanage-stat-card__icon orphanage-stat-card__icon--blue" />
          </div>
          <div>
            <span className="orphanage-stat-card__label">Donations Received</span>
            <div className="orphanage-stat-card__value">{stats.donationsReceived}</div>
          </div>
        </div>

        <div className="orphanage-stat-card orphanage-stat-card--orange">
          <div className="orphanage-stat-card__icon-wrap orphanage-stat-card__icon-wrap--orange">
            <FaTruck className="orphanage-stat-card__icon orphanage-stat-card__icon--orange" />
          </div>
          <div>
            <span className="orphanage-stat-card__label">Upcoming Donations</span>
            <div className="orphanage-stat-card__value">{stats.upcoming}</div>
          </div>
        </div>

        <div className="orphanage-stat-card orphanage-stat-card--green">
          <div className="orphanage-stat-card__icon-wrap orphanage-stat-card__icon-wrap--green">
            <FaUtensils className="orphanage-stat-card__icon orphanage-stat-card__icon--green" />
          </div>
          <div>
            <span className="orphanage-stat-card__label">Serves Received</span>
            <div className="orphanage-stat-card__value">{stats.servesReceived}</div>
          </div>
        </div>

      </div>

      {/* ── QUICK IMPACT ── */}
      {(() => {
        const now = new Date();
        const monthlyReceived = myDonations.filter(d => {
          if (d.orphanageStatus !== "received") return false;
          const dd = new Date(d.donationDate);
          return dd.getMonth() === now.getMonth() && dd.getFullYear() === now.getFullYear();
        });
        const monthlyServes = monthlyReceived.reduce((s, d) => {
          if (d.myDonatedItems?.length) {
            return s + d.myDonatedItems.reduce((ss, di) => {
              const item = d.items[di.itemIndex];
              return ss + (Number(item?.serves) || 0);
            }, 0);
          }
          return s + d.items.reduce((ss, i) => ss + (Number(i.serves) || 0), 0);
        }, 0);

        return (
          <div className="orphanage-impact-card">
            <div className="orphanage-impact-card__left">
              <div className="orphanage-impact-card__icon"><FaHeart /></div>
              <div>
                <p className="orphanage-impact-card__label">Meals Received This Month</p>
                <h3 className="orphanage-impact-card__value">{monthlyServes} serves</h3>
                <p className="orphanage-impact-card__sub">
                  from {monthlyReceived.length} donation{monthlyReceived.length !== 1 ? "s" : ""} this month
                </p>
              </div>
            </div>

            <div className="orphanage-impact-card__center">
              <div className="orphanage-impact-milestone">
                <div className="orphanage-impact-milestone__labels">
                  <span className="orphanage-impact-milestone__current">{stats.servesReceived} total serves</span>
                  <span className="orphanage-impact-milestone__target">
                    Next milestone: {Math.ceil((stats.servesReceived || 1) / 100) * 100}
                  </span>
                </div>
                <div className="orphanage-impact-milestone__track">
                  <div
                    className="orphanage-impact-milestone__fill"
                    style={{ width: `${Math.min(100, (stats.servesReceived % 100) || (stats.servesReceived > 0 ? 100 : 0))}%` }}
                  />
                </div>
                <p className="orphanage-impact-milestone__note">
                  {Math.ceil((stats.servesReceived || 1) / 100) * 100 - stats.servesReceived > 0
                    ? `${Math.ceil((stats.servesReceived || 1) / 100) * 100 - stats.servesReceived} more serves to next milestone 🎯`
                    : stats.servesReceived > 0 ? "Milestone reached! 🎉" : "Request food to start tracking"}
                </p>
              </div>
            </div>

            <div className="orphanage-impact-card__right">
              <FaFireAlt className="orphanage-impact-card__fire" />
              <p className="orphanage-impact-card__streak-label">All-time</p>
              <p className="orphanage-impact-card__streak-val">{stats.donationsReceived}</p>
              <p className="orphanage-impact-card__streak-unit">received</p>
            </div>
          </div>
        );
      })()}

      {/* ── UPCOMING DONATIONS TABLE ── */}
      <div className="orphanage-table-card">
        <div className="orphanage-table-card__header">
          <h2 className="orphanage-table-card__title">
            <FaClipboardList style={{ color: "var(--orphanage-orange)", marginRight: 10 }} />
            Upcoming Donations
            {upcomingList.length > 0 && (
              <span className="orphanage-table-count">{upcomingList.length}</span>
            )}
          </h2>
        </div>

        {upcomingList.length === 0 ? (
          <div className="orphanage-empty-inline">
            <p>No upcoming donations right now.</p>
            <button
              className="orphanage-empty-cta"
              onClick={() => navigate("/orphanage-dashboard/request-food")}
            >
              <FaAppleAlt /> Request Food from NGOs
            </button>
          </div>
        ) : (
          <div className="orphanage-table">
            <div className="orphanage-table__row orphanage-table__row--head orphanage-table__row--5col">
              <span><FaUtensils /> Food Items</span>
              <span><FaUsers /> Serves</span>
              <span><FaCalendarAlt /> Date</span>
              <span>From</span>
              <span><FaInfoCircle /> Status</span>
            </div>
            {upcomingList.map(d => (
              <div className="orphanage-table__row orphanage-table__row--5col" key={d._id}>
                <span className="orphanage-food-name">{getFoodNames(d)}</span>
                <span>{getServes(d)}</span>
                <span>{new Date(d.donationDate).toLocaleDateString("en-IN")}</span>
                <span className="orphanage-source">{getSource(d)}</span>
                <span>
                  <span className="orphanage-badge orphanage-badge--accepted">On the way</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── RECENTLY RECEIVED TABLE ── */}
      <div className="orphanage-table-card">
        <div className="orphanage-table-card__header orphanage-table-card__header--row">
          <h2 className="orphanage-table-card__title">
            <FaCheckCircle style={{ color: "var(--orphanage-orange)", marginRight: 10 }} />
            Recently Received
            {recentList.length > 0 && (
              <span className="orphanage-table-count">{recentList.length}</span>
            )}
          </h2>
          <button
            className="orphanage-see-all-btn"
            onClick={() => navigate("/orphanage-dashboard/donations-received")}
          >
            See All Donations →
          </button>
        </div>

        {recentList.length === 0 ? (
          <div className="orphanage-empty-inline">
            <p>No received donations yet.</p>
          </div>
        ) : (
          <div className="orphanage-table">
            <div className="orphanage-table__row orphanage-table__row--head orphanage-table__row--5col">
              <span><FaUtensils /> Food Items</span>
              <span><FaUsers /> Serves</span>
              <span><FaCalendarAlt /> Date</span>
              <span>From</span>
              <span><FaInfoCircle /> Status</span>
            </div>
            {recentList.map(d => (
              <div className="orphanage-table__row orphanage-table__row--5col" key={d._id}>
                <span className="orphanage-food-name">{getFoodNames(d)}</span>
                <span>{getServes(d)}</span>
                <span>{new Date(d.donationDate).toLocaleDateString("en-IN")}</span>
                <span className="orphanage-source">{getSource(d)}</span>
                <span>
                  <span className="orphanage-badge orphanage-badge--completed">Received ✓</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export { OrphanageDashboardLayout, OrphanageDashboard };
export default OrphanageDashboard;