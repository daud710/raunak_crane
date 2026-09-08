import SEO from "../components/SEO.jsx";
import QuoteForm from "../components/QuoteForm.jsx";
import { useSiteSettings } from "../lib/SiteSettingsContext.jsx";
import { normalizeFacebookUrl, normalizeInstagramUrl } from "../lib/siteConfig.js";

export default function Contact() {
  const { settings, telLink, whatsappLink, mapEmbedUrl, mapLinkUrl } = useSiteSettings();
  const contact = settings.contact || {};

  return (
    <>
      <SEO
        title="Contact Hydra Crane Service in Siwan"
        description={`Call ${settings.name} for 24-hour hydra crane hire, towing and vehicle recovery in Siwan, Hardiya Mod and nearby areas. Call or WhatsApp for a quick quote.`}
        path="/contact"
      />

      <section style={{ background: "var(--surface)", paddingBottom: 48 }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Contact</span>
            <h1>{contact.heading || "Reach us however's fastest for you."}</h1>
            <p>{contact.intro || "For an active breakdown, calling or WhatsApp is quicker than the form below."}</p>
          </div>
        </div>
      </section>

      <section>
        <div className="container contact-grid">
          <div>
            <div className="contact-card">
              <h3>Call or Message</h3>
              <a className="contact-line" href={telLink(settings.phone1)}>
                📞 +91 {settings.phone1}
                <small>Primary — answered 24 hours</small>
              </a>
              <a className="contact-line" href={telLink(settings.phone2)}>
                📞 +91 {settings.phone2}
                <small>Secondary line</small>
              </a>
              <a className="contact-line" href={whatsappLink("Hi, I need a crane/towing service.")} target="_blank" rel="noreferrer">
                💬 WhatsApp
                <small>Fastest for photos of the vehicle/location</small>
              </a>
              <a className="contact-line" href={normalizeInstagramUrl(settings.instagram_url)} target="_blank" rel="noreferrer">
                📷 Instagram
                <small>Fleet photos and recent jobs</small>
              </a>
              {settings.facebook_url && (
                <a className="contact-line" href={normalizeFacebookUrl(settings.facebook_url)} target="_blank" rel="noreferrer">
                  📘 Facebook
                  <small>Follow us on Facebook</small>
                </a>
              )}
            </div>

            <div className="contact-card">
              <h3>Yard Address</h3>
              <p style={{ marginBottom: 4 }}>{settings.address}</p>
              <a className="btn btn-outline" href={mapLinkUrl} target="_blank" rel="noreferrer">
                Open in Google Maps
              </a>
            </div>

            <div className="map-wrap">
              <iframe
                src={mapEmbedUrl}
                title={`${settings.name} location on Google Maps`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="contact-card" style={{ marginBottom: 0 }}>
             <h3>{contact.quote_heading || "Request a Quote / Callback"}</h3>
            <p style={{ marginBottom: 20 }}>
               {contact.quote_copy || "Fill this in with what's happened and where you are, and we'll call you back to confirm details and timing."}
            </p>
            <QuoteForm />
          </div>
        </div>
      </section>
    </>
  );
}
