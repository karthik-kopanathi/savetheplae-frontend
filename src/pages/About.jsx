import React, { useEffect, useRef } from "react";
import "./About.css";

const values = [
  {
    number: "01",
    title: "Compassion",
    desc: "Every action we take is guided by empathy and humanity — for the donor, the NGO, and the child who eats tonight because someone cared.",
    accent: "orange",
    icon: "❤",
  },
  {
    number: "02",
    title: "Transparency",
    desc: "Clear, real-time communication between donors, NGOs, and beneficiaries. Every pickup tracked. Every meal confirmed.",
    accent: "leaf",
    icon: "◎",
  },
  {
    number: "03",
    title: "Sustainability",
    desc: "Reducing food waste protects both people and the planet. We measure our success in kilograms saved and lives changed.",
    accent: "gold",
    icon: "⬡",
  },
];

const stats = [
  { value: "10,000+", label: "Meals Delivered" },
  { value: "200+",    label: "Donor Partners" },
  { value: "50+",     label: "NGO Network" },
  { value: "0",       label: "Kg Wasted" },
];

const About = () => {
  const fadeRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("ab-visible"); }),
      { threshold: 0.1 }
    );
    fadeRefs.current.forEach(el => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const ref = (i) => (el) => (fadeRefs.current[i] = el);

  return (
    <div className="ab-page">

      {/* ── BG ── */}
      <div className="ab-bg" aria-hidden="true">
        <div className="ab-bg__orb ab-bg__orb--1" />
        <div className="ab-bg__orb ab-bg__orb--2" />
        <div className="ab-bg__grid" />
      </div>

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section className="ab-hero">
        <div className="ab-hero__inner">

          {/* Left: text */}
          <div className="ab-hero__text" ref={ref(0)}>
            <span className="ab-eyebrow">Our Story</span>
            <h1 className="ab-hero__title">
              We believe<br />
              <em>no plate should</em><br />
              go to waste.
            </h1>
            <p className="ab-hero__lead">
              Save The Plate was born from a simple truth — tonnes of good food are discarded
              daily while millions go to bed hungry. We built the bridge.
            </p>
          </div>

          {/* Right: typographic poster */}
          <div className="ab-hero__poster" ref={ref(1)} aria-hidden="true">
            <div className="ab-poster">
              <span className="ab-poster__bg-word">FOOD</span>
              <div className="ab-poster__lines">
                <div className="ab-poster__line ab-poster__line--1">Donors</div>
                <div className="ab-poster__arrow">→</div>
                <div className="ab-poster__line ab-poster__line--2">NGOs</div>
                <div className="ab-poster__arrow">→</div>
                <div className="ab-poster__line ab-poster__line--3">Impact</div>
              </div>
              <div className="ab-poster__tag">Est. 2024 · India</div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════
          STATS BAND
      ══════════════════════════════ */}
      <section className="ab-stats" ref={ref(2)}>
        <div className="ab-stats__inner">
          {stats.map((s, i) => (
            <div className="ab-stat" key={i} style={{ "--si": i }}>
              <span className="ab-stat__value">{s.value}</span>
              <span className="ab-stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          WHO WE ARE
      ══════════════════════════════ */}
      <section className="ab-who">
        <div className="ab-who__inner">

          <div className="ab-who__left" ref={ref(3)}>
            <span className="ab-eyebrow">Who We Are</span>
            <h2 className="ab-section-title">
              A community<br />built on<br /><em>shared purpose.</em>
            </h2>
          </div>

          <div className="ab-who__right" ref={ref(4)}>
            <p className="ab-who__para">
              <strong>Save The Plate</strong> is a community-driven platform that connects
              surplus food providers — restaurants, hotels, canteens, homes — with verified
              NGOs and orphanages across India.
            </p>
            <p className="ab-who__para">
              We believe that no good food should ever go to waste while people sleep hungry.
              Our platform ensures safe, quick, and fully transparent food redistribution —
              tracked from listing to delivery.
            </p>
            <div className="ab-who__quote">
              <span className="ab-who__quote-mark">"</span>
              <p>The best way to find yourself is to lose yourself in the service of others.</p>
              <cite>— Mahatma Gandhi</cite>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════
          VALUES
      ══════════════════════════════ */}
      <section className="ab-values">
        <div className="ab-values__header" ref={ref(5)}>
          <span className="ab-eyebrow ab-eyebrow--light">Core Values</span>
          <h2 className="ab-section-title ab-section-title--light">
            What drives<br /><em>everything we do.</em>
          </h2>
        </div>

        <div className="ab-values__grid">
          {values.map((v, i) => (
            <div
              className={`ab-value-card ab-value-card--${v.accent}`}
              key={i}
              ref={ref(6 + i)}
              style={{ "--vi": i }}
            >
              <div className="ab-value-card__top">
                <span className="ab-value-card__num">{v.number}</span>
                <span className="ab-value-card__icon">{v.icon}</span>
              </div>
              <h3 className="ab-value-card__title">{v.title}</h3>
              <p className="ab-value-card__desc">{v.desc}</p>
              <div className="ab-value-card__bar" />
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          HOW WE STARTED
      ══════════════════════════════ */}

      {/* ══════════════════════════════
          CTA
      ══════════════════════════════ */}
      <section className="ab-cta">
        <div className="ab-cta__bg" aria-hidden="true" />
        <span className="ab-eyebrow ab-eyebrow--light">Join Us</span>
        <h2 className="ab-cta__title">
          Be a part of<br /><em>the change.</em>
        </h2>
        <p className="ab-cta__sub">
          Whether you donate food or help distribute it — you are making a real impact.
        </p>
        <div className="ab-cta__btns">
          <a href="/signup" className="ab-btn ab-btn--primary">Start Donating</a>
          <a href="/how-it-works" className="ab-btn ab-btn--ghost">How It Works</a>
        </div>
      </section>

    </div>
  );
};

export default About;