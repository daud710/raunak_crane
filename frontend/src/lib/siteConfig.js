// Every piece of business info lives here, read from .env — change the numbers
// once and every page, button, and structured-data block updates together.
const env = import.meta.env;

export const site = {
  name: "Raunak Crane Service",
  tagline: "Hydra Crane, Mobile Crane & Vehicle Towing",
  phone1: env.VITE_PHONE_1 || "7782005426",
  phone2: env.VITE_PHONE_2 || "9653911627",
  whatsappNumber: env.VITE_WHATSAPP_NUMBER || "917782005426",
  instagramUrl: env.VITE_INSTAGRAM_URL || "https://instagram.com/raunak_crean_service",
  address: env.VITE_ADDRESS || "Hardiya Mod, Siwan, Bihar 841226",
  mapQuery: env.VITE_MAP_QUERY || "Hardiya Mod, Siwan, Bihar",
  yearsInService: 9,
  serviceAreas: [
    "Siwan Town",
    "Hardiya Mod",
    "Maharajganj",
    "Guthni",
    "Darauli",
    "Basantpur",
    "Andar",
    "Nearby NH-227 stretch",
  ],
};

export const whatsappLink = (message = "") => {
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${site.whatsappNumber}${text}`;
};

export const telLink = (number) => `tel:+91${number.replace(/\D/g, "").slice(-10)}`;

// Accepts a bare username, a link missing "https://", or a full URL and
// always returns a proper, clickable Instagram profile URL. Used as a
// safety net wherever we render an Instagram link, in case older data
// saved before this fix is missing the "https://" prefix.
export const normalizeInstagramUrl = (raw) => {
  let value = (raw || "").trim();
  if (!value) return "";
  const compact = value.replace(/^@/, "").replace(/^(https?:\/\/)?(www\.)?instagram\.com\/?/i, "").replace(/\/+$/, "");
  if (compact.toLowerCase() === "raunakcraneservice") return "https://instagram.com/raunak_crean_service";
  value = value.replace(/^@/, "");
  if (!/^https?:\/\//i.test(value)) {
    value = value.replace(/^(www\.)?instagram\.com\/?/i, "");
    value = `https://instagram.com/${value}`;
  }
  return value;
};

export const normalizeFacebookUrl = (raw) => {
  let value = (raw || "").trim();
  if (!value) return "";
  if (!/^https?:\/\//i.test(value)) {
    value = value.replace(/^@/, "").replace(/^(www\.)?facebook\.com\/?/i, "");
    value = `https://facebook.com/${value}`;
  }
  return value;
};

export const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
  site.mapQuery
)}&z=15&output=embed`;

export const mapLinkUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  site.mapQuery
)}`;
