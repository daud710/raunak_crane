import { Link } from "react-router-dom";
import SEO from "../components/SEO.jsx";
import LazyImage from "../components/LazyImage.jsx";
import VehicleCard from "../components/VehicleCard.jsx";
import PhotoMarquee from "../components/PhotoMarquee.jsx";
import QuoteForm from "../components/QuoteForm.jsx";
import { useVehicles } from "../lib/useVehicles.js";
import { useSiteSettings } from "../lib/SiteSettingsContext.jsx";

const SERVICES_PREVIEW = [
  {
    title: "Hydra Crane Hire",
    text: "A dedicated hydra crane for vehicle recovery, lifting, and site work — dispatched fast whenever you call.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 20h9M3 20V9l7-5 7 5v11M14 20v-6h4v6" />
      </svg>
    ),
  },
  {
    title: "Vehicle Towing & Recovery",
    text: "Cars, buses, and trucks pulled clear of accidents, ditches, and breakdowns and towed to a safe location.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 17h1a2 2 0 0 0 4 0h6a2 2 0 0 0 4 0h1v-5l-3-4h-5v9M3 12h11" />
      </svg>
    ),
  },
  {
    title: "Loading & Unloading",
    text: "Mobile crane support for loading and unloading heavy material at construction sites, godowns, and yards.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 20h16M6 20V9l6-5 6 5v11M9 20v-5h6v5" />
      </svg>
    ),
  },
];

export default function Home() {
  const { vehicles } = useVehicles();
  const { settings, telLink, whatsappLink } = useSiteSettings();
  const home = settings.home || {};
  const processSteps = Array.isArray(home.process_steps) && home.process_steps.length
    ? home.process_steps : [
      { num: "01", title: "Call or WhatsApp", text: "Tell us what's happened and roughly where you are." },
      { num: "02", title: "Share your location", text: "A pin, a landmark, or the nearest mod/chowk — whatever's fastest." },
      { num: "03", title: "Crane is dispatched", text: "Our nearest crane and crew head straight to you." },
      { num: "04", title: "Vehicle recovered", text: "We tow, lift, or load — and you're back on the road." },
    ];

  return (
    <>
      <SEO
        title="Hydra Crane & Towing Service in Siwan, Bihar"
        description={`24-hour hydra crane hire, mobile crane hire, and vehicle towing & recovery from ${settings.name}. ${settings.years_in_service} years serving the area. Call ${settings.phone1}.`}
        path="/"
      />

      <section className="hero">
        <div className="container">
          <div className="hero-copy">
            <span className="eyebrow">{home.hero_eyebrow || "Hardiya Mod, Siwan · On Call 24 Hours"}</span>
            <h1>{home.hero_title || "When your vehicle is stuck, we're already on the way."}</h1>
            <p className="lede">
              {home.hero_intro || `${settings.name} has spent ${settings.years_in_service} years pulling cars, buses, and
              trucks out of breakdowns and accidents across Siwan. Hydra crane, mobile crane, and
              a recovery crew who answer the phone at 2 a.m. just as fast as at 2 p.m.`}
            </p>
            <div className="btn-row">
              <a className="btn btn-primary" href={telLink(settings.phone1)}>Call {settings.phone1}</a>
              <a className="btn btn-whatsapp" href={whatsappLink("Hi, I need crane/towing help.")} target="_blank" rel="noreferrer">
                WhatsApp Us
              </a>
              <Link className="btn btn-outline" to="/contact">Request a Quote</Link>
            </div>
          </div>
          <div className="hero-photo">
            <LazyImage
              src="/images/hydra-crane-1.jpg"
              alt={`${settings.name} hydra crane truck parked on a Siwan street`}
              eager
            />
          </div>
        </div>
        <div className="container">
          <div className="stat-strip">
            <div className="stat"><span className="num">{settings.years_in_service}+</span><span className="label">Years serving Siwan</span></div>
            <div className="stat"><span className="num">24 Hrs</span><span className="label">Every day, no off days</span></div>
            <div className="stat"><span className="num">2</span><span className="label">Cranes on standby</span></div>
            <div className="stat"><span className="num">40 Km</span><span className="label">Typical service radius</span></div>
          </div>
        </div>
      </section>

      <div className="hazard-bar" />

      <PhotoMarquee vehicles={vehicles} />

      <section>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">What We Do</span>
            <h2>{home.services_heading || "Crane hire and recovery, handled by people who show up."}</h2>
            <p>{home.services_description || "Three services cover most of what our customers call about. See the full list, including pricing basis and coverage, on the Services page."}</p>
          </div>
          <div className="service-list">
            {SERVICES_PREVIEW.map((s) => (
              <div className="service-row" key={s.title}>
                <div className="service-icon">{s.icon}</div>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
                <Link className="btn btn-outline" to="/services">Details</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "var(--surface)" }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Our Fleet</span>
            <h2>The vehicles that do the work.</h2>
            <p>A hydra crane for fast roadside recovery and a heavier mobile crane for lifting and loading jobs — both maintained and ready to move.</p>
          </div>
          <div className="fleet-grid">
            {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">How It Works</span>
            <h2>{home.process_heading || "From your call to your vehicle moving again."}</h2>
          </div>
          <div className="process">
            {processSteps.map(({ num, title, text }, i) => (
              <div className="process-step" key={`${num || i}-${title}`}>
                <span className="num">{num}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band-dark">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow" style={{ color: "var(--hazard)" }}>Coverage</span>
            <h2>{home.coverage_heading || "Based at Hardiya Mod, out across Siwan district."}</h2>
            <p>{home.coverage_description || "If you're near any of these, we can usually reach you within minutes, not hours."}</p>
          </div>
          <ul className="area-list">
            {settings.service_areas.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">Get In Touch</span>
            <h2>Tell us what's happened — we'll take it from there.</h2>
          </div>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <QuoteForm />
          </div>
        </div>
      </section>
    </>
  );
}
