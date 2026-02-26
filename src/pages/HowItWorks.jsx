import React, { useEffect, useRef } from "react";
import "./HowItWorks.css";

const steps = [
  {
    number: "01",
    title: "List Surplus Food",
    subtitle: "Donors Take Action",
    description:
      "Restaurants, homes, hotels and canteens list available food in seconds — with quantity, pickup window, and location. No app download. No friction.",
    accent: "orange",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.2"/>
        <path d="M40 20 C40 20 52 28 52 40 C52 52 40 58 40 58 C40 58 28 52 28 40 C28 28 40 20 40 20Z" stroke="currentColor" strokeWidth="1.8" fill="none"/>
        <circle cx="40" cy="40" r="6" fill="currentColor"/>
        <line x1="40" y1="20" x2="40" y2="34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="52" y1="40" x2="46" y2="40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="40" y1="58" x2="40" y2="46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="28" y1="40" x2="34" y2="40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M26 26 L30 30" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
        <path d="M54 26 L50 30" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
        <path d="M54 54 L50 50" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
        <path d="M26 54 L30 50" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
      </svg>
    ),
    stats: [{ value: "2 min", label: "to list food" }, { value: "Free", label: "always" }],
  },
  {
    number: "02",
    title: "NGOs Coordinate",
    subtitle: "Swift & Verified",
    description:
      "Verified NGOs in your city receive instant alerts, review the listing, and schedule a pickup — no phone calls, no paperwork. Pure coordination.",
    accent: "leaf",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="25" cy="30" r="8" stroke="currentColor" strokeWidth="1.8" fill="none"/>
        <circle cx="55" cy="30" r="8" stroke="currentColor" strokeWidth="1.8" fill="none"/>
        <circle cx="40" cy="55" r="8" stroke="currentColor" strokeWidth="1.8" fill="none"/>
        <line x1="33" y1="30" x2="47" y2="30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="30" y1="36" x2="37" y2="49" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="50" y1="36" x2="43" y2="49" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="25" cy="30" r="3" fill="currentColor"/>
        <circle cx="55" cy="30" r="3" fill="currentColor"/>
        <circle cx="40" cy="55" r="3" fill="currentColor"/>
      </svg>
    ),
    stats: [{ value: "< 1hr", label: "response time" }, { value: "100%", label: "verified NGOs" }],
  },
  {
    number: "03",
    title: "Meals Delivered",
    subtitle: "Impact at Scale",
    description:
      "Food reaches orphanages, shelters, and communities — tracked end-to-end. Every meal confirmed. Every gram accounted for. Zero waste, maximum impact.",
    accent: "gold",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 50 Q40 20 65 50" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M20 50 L60 50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="40" cy="38" r="5" fill="currentColor"/>
        <path d="M35 58 L40 50 L45 58" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M28 62 L52 62" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="22" cy="56" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <circle cx="58" cy="56" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M40 25 L40 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M40 20 L37 23 M40 20 L43 23" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    stats: [{ value: "10k+", label: "meals served" }, { value: "0", label: "food wasted" }],
  },
];

const HowItWorks = () => {
  const stepRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("hiw-visible");
        });
      },
      { threshold: 0.12 }
    );
    stepRefs.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="hiw-page">

      {/* BG */}
      <div className="hiw-bg" aria-hidden="true">
        <div className="hiw-bg__orb hiw-bg__orb--1" />
        <div className="hiw-bg__orb hiw-bg__orb--2" />
        <div className="hiw-bg__orb hiw-bg__orb--3" />
        <div className="hiw-bg__grid" />
      </div>

      {/* HEADER */}
      <div className="hiw-header">
        <span className="hiw-eyebrow">The Process</span>
        <h1 className="hiw-title">
          Three steps.<br />
          <em>Infinite impact.</em>
        </h1>
        <p className="hiw-subtitle">
          From a restaurant's surplus to a child's meal — here's how
          Save the Plate makes it seamless.
        </p>
      </div>

      {/* TIMELINE */}
      <div className="hiw-timeline">
        <div className="hiw-spine" aria-hidden="true">
          <div className="hiw-spine__fill" />
        </div>

        {steps.map((step, idx) => (
          <div
            className={`hiw-step hiw-step--${step.accent} ${idx % 2 === 1 ? "hiw-step--flip" : ""}`}
            key={idx}
            ref={(el) => (stepRefs.current[idx] = el)}
            style={{ "--i": idx }}
          >
            {/* Spine node */}
            <div className="hiw-step__node">
              <span className="hiw-step__node-num">{step.number}</span>
              <div className="hiw-step__node-ring" />
            </div>

            {/* Visual card */}
            <div className="hiw-step__visual">
              <div className="hiw-visual-card">
                <span className="hiw-visual-card__ghost">{step.number}</span>
                <div className="hiw-visual-card__icon">{step.icon}</div>
                <div className="hiw-visual-card__ring hiw-visual-card__ring--1" />
                <div className="hiw-visual-card__ring hiw-visual-card__ring--2" />
                <div className="hiw-visual-card__stats">
                  {step.stats.map((s, i) => (
                    <div className="hiw-stat" key={i}>
                      <span className="hiw-stat__value">{s.value}</span>
                      <span className="hiw-stat__label">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="hiw-step__content">
              <p className="hiw-step__eyebrow">{step.subtitle}</p>
              <h2 className="hiw-step__title">{step.title}</h2>
              <p className="hiw-step__desc">{step.description}</p>
              <div className="hiw-step__bar">
                <div className="hiw-step__bar-fill" />
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="hiw-cta">
        <div className="hiw-cta__bg" aria-hidden="true" />
        <span className="hiw-cta__label">Join the movement</span>
        <h2 className="hiw-cta__title">Every plate saved<br /><em>feeds a future.</em></h2>
        <a href="/signup" className="hiw-cta__btn">Start Donating Today</a>
      </div>

    </div>
  );
};

export default HowItWorks;