import { Link } from "react-router-dom";
import { useSiteSettings } from "../lib/SiteSettingsContext.jsx";
import { normalizeInstagramUrl } from "../lib/siteConfig.js";

export default function Footer() {
  const { settings, telLink, whatsappLink } = useSiteSettings();

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h4>{settings.name}</h4>
          <p style={{ color: "#c3ccd4", maxWidth: "38ch" }}>
            {settings.tagline} — based at {settings.address}. On call 24 hours a day, every day.
          </p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact &amp; Quote</Link>
        </div>
        <div>
          <h4>Reach Us</h4>
          <a href={telLink(settings.phone1)}>Call: +91 {settings.phone1}</a>
          <a href={telLink(settings.phone2)}>Call: +91 {settings.phone2}</a>
          <a href={whatsappLink("Hi, I need a crane/towing service.")} target="_blank" rel="noreferrer">
            WhatsApp Us
          </a>
          <a href={normalizeInstagramUrl(settings.instagram_url)} target="_blank" rel="noreferrer">Instagram</a>
          <a href="/admin/login" style={{ opacity: 0.6, fontSize: "0.82rem" }}>Admin Login</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {settings.name}, Siwan, Bihar.</span>
        <span>{settings.address}</span>
      </div>
    </footer>
  );
}
