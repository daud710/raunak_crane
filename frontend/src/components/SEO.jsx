import { useEffect } from "react";
import { useSiteSettings } from "../lib/SiteSettingsContext.jsx";

function setMeta(name, content, attr = "name") {
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

/**
 * Sets a unique title + description per page, and writes the LocalBusiness
 * structured data Google uses for "near me" / map results. No extra
 * dependency needed — a couple of DOM writes on mount is all this takes.
 */
export default function SEO({ title, description, path = "/" }) {
  const { settings } = useSiteSettings();

  useEffect(() => {
    const fullTitle = `${title} | ${settings.name}`;
    document.title = fullTitle;
    setMeta("description", description);
    setMeta("keywords", "hydra crane service Siwan, crane hire Siwan, mobile crane Siwan, vehicle towing Siwan, crane service Hardiya Mod");
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", description, "property");
    setMeta("og:url", `https://raunakcrane.xyz${path}`, "property");
    setMeta("og:site_name", settings.name, "property");
    setMeta("og:locale", "en_IN", "property");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", "https://raunakcrane.xyz/images/hydra-crane-1.jpg");

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `https://raunakcrane.xyz${path}`);

    let ld = document.getElementById("local-business-ld");
    if (!ld) {
      ld = document.createElement("script");
      ld.type = "application/ld+json";
      ld.id = "local-business-ld";
      document.head.appendChild(ld);
    }
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": "https://raunakcrane.xyz/#business",
      name: settings.name,
      description:
        "Hydra crane hire, mobile crane hire, and vehicle towing & recovery serving Siwan, Bihar, 24 hours a day.",
      url: "https://raunakcrane.xyz/",
      image: "https://raunakcrane.xyz/images/hydra-crane-1.jpg",
      telephone: `+91${settings.phone1}`,
      serviceType: [
        "Hydra crane hire",
        "Mobile crane hire",
        "Vehicle towing and recovery",
        "Loading and unloading",
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: "Hardiya Mod",
        addressLocality: "Siwan",
        addressRegion: "Bihar",
        postalCode: "841226",
        addressCountry: "IN",
      },
      areaServed: settings.service_areas,
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
      priceRange: "$$",
      sameAs: [settings.instagram_url, settings.facebook_url].filter(Boolean),
    });
  }, [title, description, path, settings]);

  return null;
}
