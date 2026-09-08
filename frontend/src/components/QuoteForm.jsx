import { useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { useSiteSettings } from "../lib/SiteSettingsContext.jsx";

const SERVICES = [
  "Hydra Crane Hire",
  "Mobile Crane Hire",
  "Vehicle Towing & Recovery",
  "Loading & Unloading",
  "General enquiry",
];

const initial = {
  name: "",
  phone: "",
  serviceType: SERVICES[4],
  location: "",
  message: "",
  website: "", // honeypot — real visitors never see or fill this
};

export default function QuoteForm({ defaultService }) {
  const [form, setForm] = useState({ ...initial, serviceType: defaultService || SERVICES[4] });
  const [status, setStatus] = useState({ state: "idle", errors: [] });
  const { settings } = useSiteSettings();

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ state: "loading", errors: [] });

    // Calls the "contact" Supabase Edge Function, which validates the
    // submission, checks the honeypot, and inserts into "inquiries" using
    // the service role key — the anon key never gets insert access to
    // that table.
    const { data, error } = await supabase.functions.invoke("contact", { body: form });

    if (error || !data?.ok) {
      console.error("Quote form submission failed:", {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        response: data,
      });
      setStatus({
        state: "error",
        errors: data?.errors || ["Something went wrong. Please try again, or call/WhatsApp us instead."],
      });
      return;
    }

    setStatus({ state: "success", errors: [] });
    setForm({ ...initial, serviceType: defaultService || SERVICES[4] });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {status.state === "success" && (
        <div className="form-status ok">
          Thanks — we've received your request and will call you back shortly.
        </div>
      )}
      {status.state === "error" && (
        <div className="form-status error">{status.errors.join(" ")}</div>
      )}

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="name">Your name</label>
          <input id="name" required value={form.name} onChange={update("name")} placeholder="e.g. Ramesh Kumar" />
        </div>
        <div className="form-field">
          <label htmlFor="phone">Phone number</label>
          <input id="phone" required value={form.phone} onChange={update("phone")} placeholder="10-digit mobile number" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="serviceType">Service needed</label>
          <select id="serviceType" value={form.serviceType} onChange={update("serviceType")}>
            {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="location">Your location</label>
          <input id="location" value={form.location} onChange={update("location")} placeholder="e.g. Maharajganj, Siwan" />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="message">Tell us what happened (optional)</label>
        <textarea id="message" rows="4" value={form.message} onChange={update("message")}
          placeholder="e.g. Bus broke down near NH-227, needs towing to Siwan" />
      </div>

      {/* Honeypot: hidden from real people via CSS, tempting for bots */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" tabIndex="-1" autoComplete="off" value={form.website} onChange={update("website")} />
      </div>

      <button className="btn btn-primary" type="submit" disabled={status.state === "loading"}>
        {status.state === "loading" ? "Sending…" : "Request a Callback"}
      </button>
      <p className="form-note" style={{ marginTop: 12 }}>
        Prefer to talk now? Call {settings.phone1} or WhatsApp us — we usually reply within minutes.
      </p>
    </form>
  );
}
