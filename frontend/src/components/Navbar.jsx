import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSiteSettings } from "../lib/SiteSettingsContext.jsx";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { settings, telLink, whatsappLink } = useSiteSettings();
  const [firstWord, ...rest] = (settings.name || "Raunak Crane Service").split(" ");
  const customLinks = Array.isArray(settings.nav_links) ? settings.nav_links.filter((link) => (
    link && typeof link.label === "string" && link.label.trim() && typeof link.url === "string" && link.url.trim()
  )) : [];
  const isExternal = (url) => /^(https?:|mailto:|tel:)/i.test(url);

  return (
    <header className={`navbar ${open ? "open" : ""}`}>
      <div className="container">
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          {firstWord} {rest.length > 0 && <span>{rest.join(" ")}</span>}
        </NavLink>

        <nav>
          <ul className="nav-links">
            <li><NavLink to="/" end onClick={() => setOpen(false)}>Home</NavLink></li>
            <li><NavLink to="/services" onClick={() => setOpen(false)}>Services</NavLink></li>
            <li><NavLink to="/about" onClick={() => setOpen(false)}>About</NavLink></li>
            <li><NavLink to="/contact" onClick={() => setOpen(false)}>Contact</NavLink></li>
            {customLinks.map((link, i) => (
              <li key={`${link.url}-${i}`}>
                {isExternal(link.url) ? (
                  <a href={link.url} target={link.open_new_tab !== false ? "_blank" : undefined}
                    rel={link.open_new_tab !== false ? "noreferrer" : undefined}
                    onClick={() => setOpen(false)}>{link.label}</a>
                ) : (
                  <NavLink to={link.url.startsWith("/") ? link.url : `/${link.url}`} onClick={() => setOpen(false)}>
                    {link.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav-actions">
          <a className="btn btn-outline" href={telLink(settings.phone1)}>
            <span className="icon" aria-hidden="true">📞</span>
            <span className="label">Call Now</span>
          </a>
          <a className="btn btn-primary" href={whatsappLink("Hi, I need a crane/towing service.")}
             target="_blank" rel="noreferrer">
            <span className="icon" aria-hidden="true">💬</span>
            <span className="label">WhatsApp</span>
          </a>
          <button
            className="nav-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
    </header>
  );
}
