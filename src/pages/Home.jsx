import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  const [stats, setStats] = useState({
    totalMeals: 0,
    totalDonors: 0,
    totalOrphanages: 0,
  });

  /* ─── Reveal Animation ─── */
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ─── Fetch Stats From Backend ─── */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("https://savetheplae-backend.onrender.com/api/stats");
        const data = await res.json();

        setStats({
          totalMeals: data.totalMeals || 0,
          totalDonors: data.totalDonors || 0,
          totalOrphanages: data.totalOrphanages || 0,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="home">

      {/* ─── HERO ─── */}
      <section className="hero" ref={heroRef}>
        <div className="hero-content">
          <span className="hero-label">Save The Plate Initiative</span>
          <h1 className="hero-title">
            Save Food.<br />
            <em>Serve</em>{" "}
            <span className="outline-text">Humanity.</span>
          </h1>
          <p className="hero-subtitle">
            Connecting generous donors to orphanages through trusted NGOs — turning surplus food into smiles, every single day.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate("/signup")}>
              Donate Food →
            </button>
            <button className="btn-outline" onClick={() => navigate("/signup")}>
              Request Food
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-stats-grid">
            <div className="stat-card featured">
              <div className="stat-icon">🍽️</div>
              <div className="stat-number">
                {stats.totalMeals.toLocaleString()}+
              </div>
              <div className="stat-label">Meals Delivered</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🤝</div>
              <div className="stat-number">
                {stats.totalDonors.toLocaleString()}
              </div>
              <div className="stat-label">Active Donors</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏠</div>
              <div className="stat-number">
                {stats.totalOrphanages.toLocaleString()}
              </div>
              <div className="stat-label">Orphanages Registered</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE ─── */}
      <div className="marquee-strip">
        <div className="marquee-inner">
          {[...Array(2)].map((_, i) =>
            ["Zero Food Waste", "Verified NGOs", "Real-Time Matching", "Safe & Fresh Food", "Trusted Donors", "Kids Fed Daily"].map((item, j) => (
              <span className="marquee-item" key={`${i}-${j}`}>
                <span className="marquee-dot" />
                {item}
              </span>
            ))
          )}
        </div>
      </div>

      {/* ─── FEATURES ─── */}
      <section className="features-section">
        <div className="section-header reveal">
          <div>
            <p className="section-label">What We Do</p>
            <h2 className="section-title">
              Bridging the gap between<br /><em>surplus and scarcity</em>
            </h2>
          </div>
          <p className="section-desc">
            Every donation is handled with care, speed, and accountability — from your hands to their plates.
          </p>
        </div>

        <div className="features-grid">
          {[
            { icon: "📦", title: "Donate Surplus Food", desc: "Easily list your surplus food — from home kitchens to restaurant events. We handle the logistics.", num: "01" },
            { icon: "🏢", title: "NGO Coordination", desc: "Verified NGOs receive alerts instantly, collect from donors, and ensure safe, timely delivery.", num: "02" },
            { icon: "❤️", title: "Feed the Future", desc: "Orphanages receive nutritious meals, and every donation is logged so you can see your real-world impact.", num: "03" },
          ].map((f, i) => (
            <div className={`feature-card reveal reveal-delay-${i + 1}`} key={i}>
              <span className="feature-number">{f.num}</span>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="how-section">
        <div className="section-header reveal">
          <div>
            <p className="section-label">The Process</p>
            <h2 className="section-title">
              Simple steps,<br /><em>powerful impact</em>
            </h2>
          </div>
          <p className="section-desc">
            From a donor's door to a child's plate in as little as 2 hours.
          </p>
        </div>

        <div className="steps-row">
          {[
            { badge: "badge-orange", icon: "🥗", step: "Step One", title: "Donor Lists Food", desc: "You post available food — type, quantity, freshness, and pickup window. Takes under a minute." },
            { badge: "badge-gold", icon: "👥", step: "Step Two", title: "NGO Collects", desc: "A nearby verified NGO is notified instantly. They confirm, arrive, and safely transport the food." },
            { badge: "badge-leaf", icon: "🍽️", step: "Step Three", title: "Orphanage Receives", desc: "Meals are delivered and confirmed by the orphanage. You get a notification and impact update." },
          ].map((s, i) => (
            <div className={`step-card reveal reveal-delay-${i + 1}`} key={i}>
              <div className={`step-badge ${s.badge}`}>{s.icon}</div>
              <p className="step-number-label">{s.step}</p>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section">
        <div className="cta-text reveal">
          <p className="section-label">Join the Movement</p>
          <h2 className="section-title cta-title">
            Your leftovers are<br /><em className="cta-em">someone's lifeline</em>
          </h2>
          <p className="cta-body">
            Whether you're a home cook, a restaurant, or an event organiser — any amount of food makes a difference. Sign up in seconds and start saving plates today.
          </p>
          <div className="cta-actions">
            <button className="cta-btn-primary" onClick={() => navigate("/signup")}>
              Start Donating
            </button>
            <button className="cta-btn-secondary" onClick={() => navigate("/signup")}>
              Register as NGO
            </button>
          </div>
        </div>

        <div className="cta-image-block reveal reveal-delay-2">
          <div className="impact-card">
            <h3 className="impact-heading">📊 Our Impact This Month</h3>
            <div className="impact-row">
              {[
                { label: "Food Redistributed", fill: "82%", pct: "82%", cls: "bar-orange" },
                { label: "On-Time Deliveries", fill: "94%", pct: "94%", cls: "bar-green" },
                { label: "NGO Response Rate", fill: "76%", pct: "76%", cls: "bar-gold" },
              ].map((item, i) => (
                <div className="impact-item" key={i}>
                  <span className="impact-label">{item.label}</span>
                  <div className="impact-bar-bg">
                    <div className={`impact-bar-fill ${item.cls}`} style={{ width: item.fill }} />
                  </div>
                  <span className="impact-pct">{item.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;