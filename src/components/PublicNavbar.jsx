import defaultAvatar from "../assets/default-avatar.png";
import "./PublicNavbar.css";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const PublicNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sliderRef = useRef(null);
  const linksRef = useRef([]);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardContext, setDashboardContext] = useState(
    sessionStorage.getItem("dashboardContext") || null
  );

  /* ========================= */
  /* FETCH LOGGED-IN USER      */
  /* ========================= */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      sessionStorage.removeItem("dashboardContext");
      setDashboardContext(null);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch("https://savetheplae-backend.onrender.com/api/dashboard/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          sessionStorage.removeItem("dashboardContext");
          setDashboardContext(null);
          setUser(null);
        } else {
          const data = await res.json();
          setUser(data.user || data);
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        sessionStorage.removeItem("dashboardContext");
        setDashboardContext(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [location.pathname]);

  /* ========================= */
  /* TRACK DASHBOARD CONTEXT   */
  /* ========================= */
  useEffect(() => {
    if (location.pathname.startsWith("/donor-dashboard")) {
      sessionStorage.setItem("dashboardContext", "donor");
      setDashboardContext("donor");
    } else if (location.pathname.startsWith("/ngo-dashboard")) {
      sessionStorage.setItem("dashboardContext", "ngo");
      setDashboardContext("ngo");
    } else if (location.pathname.startsWith("/orphanage-dashboard")) {
      sessionStorage.setItem("dashboardContext", "orphanage");
      setDashboardContext("orphanage");
    } else if (location.pathname === "/") {
      sessionStorage.removeItem("dashboardContext");
      setDashboardContext(null);
    }
  }, [location.pathname]);

  /* ========================= */
  /* ROUTE FLAGS               */
  /* ========================= */
  const isOnDonorDashboard     = location.pathname.startsWith("/donor-dashboard");
  const isOnNgoDashboard       = location.pathname.startsWith("/ngo-dashboard");
  const isOnOrphanageDashboard = location.pathname.startsWith("/orphanage-dashboard");

  const effectiveContext = isOnDonorDashboard
    ? "donor"
    : isOnNgoDashboard
    ? "ngo"
    : isOnOrphanageDashboard
    ? "orphanage"
    : dashboardContext;

  const isLoggedInContext = !!effectiveContext && !!user;

  /* ========================= */
  /* NAV LINKS                 */
  /* ========================= */
  const navLinks = isLoggedInContext
    ? effectiveContext === "ngo"
      ? [
          { to: "/ngo-dashboard",  label: "Dashboard"    },
          { to: "/how-it-works",   label: "How It Works" },
          { to: "/partners",       label: "NGO Partners" },
          { to: "/orphanages",     label: "Orphanages"   },
          { to: "/about",          label: "About Us"     },
        ]
      : effectiveContext === "orphanage"
      ? [
          { to: "/orphanage-dashboard", label: "Dashboard"    },
          { to: "/how-it-works",        label: "How It Works" },
          { to: "/partners",            label: "NGO Partners" },
          { to: "/orphanages",          label: "Orphanages"   },
          { to: "/about",               label: "About Us"     },
        ]
      : [
          { to: "/donor-dashboard", label: "Dashboard"    },
          { to: "/how-it-works",    label: "How It Works" },
          { to: "/partners",        label: "NGO Partners" },
          { to: "/orphanages",      label: "Orphanages"   },
          { to: "/about",           label: "About Us"     },
        ]
    : [
        { to: "/",             label: "Home"         },
        { to: "/how-it-works", label: "How It Works" },
        { to: "/partners",     label: "NGO Partners" },
        { to: "/orphanages",   label: "Orphanages"   },
        { to: "/about",        label: "About Us"     },
      ];

  const hideNavbarOn = ["/donate"];
  if (hideNavbarOn.includes(location.pathname)) return null;

  /* ========================= */
  /* NAV SLIDER                */
  /* ========================= */
  useEffect(() => {
    const activeIndex = linksRef.current.findIndex((el) => {
      if (!el) return false;
      const path = new URL(el.href).pathname;
      return path === location.pathname;
    });

    if (activeIndex !== -1 && sliderRef.current) {
      const el = linksRef.current[activeIndex];
      sliderRef.current.style.width   = el.offsetWidth + "px";
      sliderRef.current.style.left    = el.offsetLeft  + "px";
      sliderRef.current.style.opacity = 1;

      linksRef.current.forEach((link, idx) => {
        if (link) link.dataset.active = idx === activeIndex ? "true" : "false";
      });
    } else if (sliderRef.current) {
      sliderRef.current.style.opacity = 0;
    }
  }, [location.pathname, user]);

  /* ========================= */
  /* PROFILE IMAGE             */
  /* ========================= */
  const profileImage = user?.profilePic
    ? user.profilePic.startsWith("http")
      ? `${user.profilePic}?t=${Date.now()}`
      : `https://savetheplae-backend.onrender.com/${user.profilePic}?t=${Date.now()}`
    : defaultAvatar;

  /* ========================= */
  /* RENDER                    */
  /* ========================= */
  return (
    <nav className="navbar">

      {/* ── LOGO ── */}
      <div className="logo" onClick={() => navigate("/")}>
        <svg className="logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="22" r="14" fill="#2d5a27" opacity="0.15"/>
          <circle cx="20" cy="22" r="14" stroke="#e8651a" strokeWidth="1.5" fill="none"/>
          <line x1="13" y1="10" x2="13" y2="20" stroke="#f5f0e8" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="11" y1="10" x2="11" y2="14" stroke="#f5f0e8" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="13" y1="10" x2="13" y2="14" stroke="#f5f0e8" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="15" y1="10" x2="15" y2="14" stroke="#f5f0e8" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="27" y1="15" x2="27" y2="22" stroke="#f5f0e8" strokeWidth="1.5" strokeLinecap="round"/>
          <ellipse cx="27" cy="12" rx="2.5" ry="3" fill="#e8651a" opacity="0.85"/>
          <path d="M18.5 21.5 C18.5 20 20 19 20 19 C20 19 21.5 20 21.5 21.5 C21.5 23 20 24 20 24 C20 24 18.5 23 18.5 21.5Z" fill="#e8651a"/>
        </svg>

        <div className="logo-text">
          <span className="logo-text__main">
            Save the <span>Plate</span>
          </span>
          <span className="logo-text__sub">Feed the Future</span>
        </div>
      </div>

      <div className="menu">
        <ul className="nav-links">
          {navLinks.map((link, idx) => (
            <li key={idx}>
              <NavLink
                to={link.to}
                end={link.to === "/"}
                ref={(el) => (linksRef.current[idx] = el)}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="nav-slider" ref={sliderRef}></div>

        <div className="nav-actions">
          {loading ? null : isLoggedInContext ? (
            <img
              src={profileImage}
              alt="profile"
              className="nav-profile-pic"
              onClick={() => {
                if (effectiveContext === "ngo") navigate("/ngo-dashboard/settings");
                else if (effectiveContext === "orphanage") navigate("/orphanage-dashboard/settings");
                else navigate("/donor-dashboard/settings");
              }}
            />
          ) : (
            <>
              {location.pathname !== "/signup" && (
                <button className="btn btn-signin" onClick={() => navigate("/signup")}>
                  Sign Up
                </button>
              )}
              {location.pathname !== "/login" && (
                <button className="btn btn-login" onClick={() => navigate("/login")}>
                  Login
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;