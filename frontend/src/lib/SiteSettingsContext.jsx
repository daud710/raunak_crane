import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient.js";

// Used only until the real row loads from Supabase (or if the site_settings
// table/row doesn't exist yet) — keeps the site working either way.
export const DEFAULT_SETTINGS = {
  name: "Raunak Crane Service",
  tagline: "Hydra Crane, Mobile Crane & Vehicle Towing",
  phone1: "7782005426",
  phone2: "9653911627",
  whatsapp_number: "917782005426",
  instagram_url: "https://instagram.com/raunak_crean_service",
  facebook_url: "",
  address: "Hardiya Mod, Siwan, Bihar 841226",
  map_query: "Hardiya Mod, Siwan, Bihar",
  years_in_service: 9,
  service_areas: [
    "Siwan Town", "Hardiya Mod", "Maharajganj", "Guthni",
    "Darauli", "Basantpur", "Andar", "Nearby NH-227 stretch",
  ],
  about: {
    hero_title: "Nine years of pulling Siwan's vehicles out of trouble.",
    paragraphs: [
      "Raunak Crane Service started as a single hydra crane working breakdown calls around Hardiya Mod.",
    ],
    values: [],
  },
  services: {
    hero_title: "Everything we do, in plain terms.",
    hero_subtitle: "Pick what you need, or just call and describe the problem.",
    items: [],
  },
  home: {
    hero_eyebrow: "Hardiya Mod, Siwan · On Call 24 Hours",
    hero_title: "When your vehicle is stuck, we're already on the way.",
    hero_intro: "",
    services_heading: "Crane hire and recovery, handled by people who show up.",
    services_description: "Three services cover most of what our customers call about. See the full list, including pricing basis and coverage, on the Services page.",
    process_heading: "From your call to your vehicle moving again.",
    process_steps: [],
    coverage_heading: "Based at Hardiya Mod, out across Siwan district.",
    coverage_description: "If you're near any of these, we can usually reach you within minutes, not hours.",
  },
  contact: {
    heading: "Reach us however's fastest for you.",
    intro: "For an active breakdown, calling or WhatsApp is quicker than the form below.",
    quote_heading: "Request a Quote / Callback",
    quote_copy: "Fill this in with what's happened and where you are, and we'll call you back to confirm details and timing.",
  },
  nav_links: [],
};

const SiteSettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: true,
  refresh: () => {},
  telLink: (n) => `tel:+91${n}`,
  whatsappLink: () => "https://wa.me/",
  mapEmbedUrl: "",
  mapLinkUrl: "",
});

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (!error && data) {
      setSettings((prev) => ({
        ...DEFAULT_SETTINGS,
        ...data,
        about: { ...DEFAULT_SETTINGS.about, ...(data.about || {}) },
        services: { ...DEFAULT_SETTINGS.services, ...(data.services || {}) },
        home: { ...DEFAULT_SETTINGS.home, ...(data.home || {}) },
        contact: { ...DEFAULT_SETTINGS.contact, ...(data.contact || {}) },
        nav_links: Array.isArray(data.nav_links) ? data.nav_links : DEFAULT_SETTINGS.nav_links,
      }));
    } else if (error) {
      console.warn("Could not load site settings, using defaults:", error.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const value = useMemo(() => {
    const telLink = (number) => `tel:+91${String(number || "").replace(/\D/g, "").slice(-10)}`;
    const whatsappLink = (message = "") => {
      const text = message ? `?text=${encodeURIComponent(message)}` : "";
      return `https://wa.me/${settings.whatsapp_number}${text}`;
    };
    const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(settings.map_query)}&z=15&output=embed`;
    const mapLinkUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.map_query)}`;

    return { settings, loading, refresh: load, telLink, whatsappLink, mapEmbedUrl, mapLinkUrl };
  }, [settings, loading, load]);

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
