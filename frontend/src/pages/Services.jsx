import { Link } from "react-router-dom";
import SEO from "../components/SEO.jsx";
import { useVehicles } from "../lib/useVehicles.js";
import VehicleCard from "../components/VehicleCard.jsx";
import { useSiteSettings } from "../lib/SiteSettingsContext.jsx";

// A fixed set of icons, applied to service items by position (cycling if
// there are more items than icons). Titles/text/points are fully editable
// from Admin → Site Settings; the icon shape isn't, to keep that screen simple.
const ICONS = [
  <svg key="i1" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 20h9M3 20V9l7-5 7 5v11M14 20v-6h4v6" /></svg>,
  <svg key="i2" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20h16M6 20V9l6-5 6 5v11M9 20v-5h6v5" /></svg>,
  <svg key="i3" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 17h1a2 2 0 0 0 4 0h6a2 2 0 0 0 4 0h1v-5l-3-4h-5v9M3 12h11" /></svg>,
  <svg key="i4" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8l-5-5-5 5M16 3v12M3 16l5 5 5-5M8 21V9" /></svg>,
  <svg key="i5" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>,
];

export default function Services() {
  const { vehicles } = useVehicles();
  const { settings, telLink } = useSiteSettings();
  const services = settings.services || {};
  const items = services.items || [];

  return (
    <>
      <SEO
        title="Hydra Crane Hire & Towing Services in Siwan"
        description={`24-hour hydra crane hire, mobile crane hire, vehicle towing, recovery, and loading services in Siwan, Hardiya Mod and nearby areas from ${settings.name}.`}
        path="/services"
      />

      <section style={{ background: "var(--surface)", paddingBottom: 48 }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Services</span>
            <h1>{services.hero_title}</h1>
            <p>{services.hero_subtitle}</p>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="service-list">
            {items.map((s, i) => (
              <div className="service-row" key={i} style={{ alignItems: "flex-start" }}>
                <div className="service-icon">{ICONS[i % ICONS.length]}</div>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  {(s.points || []).length > 0 && (
                    <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: "var(--ink-soft)", fontSize: "0.93rem" }}>
                      {s.points.map((p, j) => <li key={j}>{p}</li>)}
                    </ul>
                  )}
                </div>
                <Link className="btn btn-outline" to="/contact">Request This</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "var(--surface)" }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Fleet Behind These Services</span>
            <h2>The cranes doing the lifting.</h2>
          </div>
          <div className="fleet-grid">
            {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        </div>
      </section>

      <section className="band-dark">
        <div className="container" style={{ textAlign: "center" }}>
          <h2>Not sure which service you need?</h2>
          <p style={{ margin: "0 auto 20px" }}>Call us and describe the situation — we'll send the right crane the first time.</p>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <a className="btn btn-primary" href={telLink(settings.phone1)}>Call {settings.phone1}</a>
            <Link className="btn btn-outline" to="/contact" style={{ borderColor: "#fff", color: "#fff" }}>Send a Quote Request</Link>
          </div>
        </div>
      </section>
    </>
  );
}
