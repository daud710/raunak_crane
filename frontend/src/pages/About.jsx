import SEO from "../components/SEO.jsx";
import LazyImage from "../components/LazyImage.jsx";
import { useSiteSettings } from "../lib/SiteSettingsContext.jsx";

export default function About() {
  const { settings, telLink } = useSiteSettings();
  const about = settings.about || {};
  const paragraphs = about.paragraphs || [];
  const values = about.values || [];

  return (
    <>
      <SEO
        title={`About ${settings.name} — Local Crane Service in Siwan`}
        description={`${settings.name} has provided reliable hydra crane hire, mobile crane, and vehicle towing services in Siwan, Bihar for ${settings.years_in_service} years.`}
        path="/about"
      />

      <section style={{ background: "var(--surface)", paddingBottom: 48 }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">About {settings.name}</span>
            <h1>{about.hero_title}</h1>
          </div>
        </div>
      </section>

      <section>
        <div className="container split">
          <div>
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            <div className="btn-row">
              <a className="btn btn-primary" href={telLink(settings.phone1)}>Call {settings.phone1}</a>
            </div>
          </div>
          <LazyImage
            src="/images/mobile-crane-2.jpg"
            alt={`${settings.name} mobile crane recovering a passenger bus`}
          />
        </div>
      </section>

      {values.length > 0 && (
        <section style={{ background: "var(--surface)" }}>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">How We Work</span>
              <h2>What we mean when we say "reliable".</h2>
            </div>
            <div className="value-grid">
              {values.map((v, i) => (
                <div className="value-item" key={i}>
                  <h3>{v.title}</h3>
                  <p>{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
