import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import { useSiteSettings, DEFAULT_SETTINGS } from "../../lib/SiteSettingsContext.jsx";
import { normalizeFacebookUrl, normalizeInstagramUrl } from "../../lib/siteConfig.js";

export default function Dashboard() {
  const [tab, setTab] = useState("vehicles");

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <div className="container">
          <strong>Admin Panel</strong>
          <button className="btn btn-outline" style={{ borderColor: "#fff", color: "#fff" }}
            onClick={() => supabase.auth.signOut()}>
            Log Out
          </button>
        </div>
      </div>

      <div className="container">
        <div className="admin-tabs">
          <button className={tab === "vehicles" ? "active" : ""} onClick={() => setTab("vehicles")}>Vehicles</button>
          <button className={tab === "inquiries" ? "active" : ""} onClick={() => setTab("inquiries")}>Quote Requests</button>
          <button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}>Site Settings</button>
        </div>

        <div className="admin-panel">
          {tab === "vehicles" && <VehiclesPanel />}
          {tab === "inquiries" && <InquiriesPanel />}
          {tab === "settings" && <SiteSettingsPanel />}
        </div>
      </div>
    </div>
  );
}

// ── Vehicles ─────────────────────────────────────────────────
function VehiclesPanel() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", category: "Hydra Crane", description: "" });
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [addingPhotoFor, setAddingPhotoFor] = useState(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("vehicles").select("*").order("sort_order");
    if (error) setError(error.message);
    setVehicles(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function uploadOne(file) {
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${file.name.replace(/\s+/g, "-")}`;
    const { error: uploadError } = await supabase.storage.from("vehicle-photos").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (uploadError) throw new Error(uploadError.message);
    const { data: pub } = supabase.storage.from("vehicle-photos").getPublicUrl(path);
    return { url: pub.publicUrl, thumb: pub.publicUrl };
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name || files.length === 0) {
      setError("Name and at least one photo are required.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const photos = [];
      for (const file of files) {
        photos.push(await uploadOne(file));
      }

      const { error: insertError } = await supabase.from("vehicles").insert({
        name: form.name,
        category: form.category,
        description: form.description,
        image_url: photos[0].url,
        thumb_url: photos[0].thumb,
        photos,
        sort_order: vehicles.length + 1,
      });
      if (insertError) throw new Error(insertError.message);

      setForm({ name: "", category: "Hydra Crane", description: "" });
      setFiles([]);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function addPhotoToVehicle(vehicle, file) {
    setAddingPhotoFor(vehicle.id);
    setError("");
    try {
      const photo = await uploadOne(file);
      const existing = vehicle.photos && vehicle.photos.length > 0
        ? vehicle.photos
        : [{ url: vehicle.image_url, thumb: vehicle.thumb_url || vehicle.image_url }];
      const updatedPhotos = [...existing, photo];
      await supabase.from("vehicles").update({ photos: updatedPhotos }).eq("id", vehicle.id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingPhotoFor(null);
    }
  }

  async function toggleActive(v) {
    await supabase.from("vehicles").update({ is_active: !v.is_active }).eq("id", v.id);
    load();
  }

  async function remove(v) {
    if (!confirm(`Delete "${v.name}"? This can't be undone.`)) return;
    await supabase.from("vehicles").delete().eq("id", v.id);
    load();
  }

  return (
    <>
      <h3 style={{ marginBottom: 16 }}>Add a Vehicle</h3>
      <form onSubmit={handleAdd} style={{ marginBottom: 32 }}>
        {error && <p className="text-error">{error}</p>}
        <div className="form-row">
          <div className="form-field">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. New Mobile Crane" />
          </div>
          <div className="form-field">
            <label>Category</label>
            <input
              list="category-suggestions"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="e.g. Hydra Crane"
            />
            <datalist id="category-suggestions">
              {Array.from(new Set(["Hydra Crane", "Mobile Crane", "Recovery Truck", ...vehicles.map((v) => v.category)])).map(
                (cat) => (
                  <option key={cat} value={cat} />
                )
              )}
            </datalist>
          </div>
        </div>
        <div className="form-field">
          <label>Short description</label>
          <textarea rows="2" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="form-field">
          <label>Photos (select multiple at once)</label>
          <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
          {files.length > 0 && <small style={{ color: "var(--ink-soft)" }}>{files.length} photo(s) selected</small>}
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Uploading…" : "Add Vehicle"}
        </button>
      </form>

      <h3 style={{ marginBottom: 16 }}>Current Vehicles</h3>
      {loading ? <p>Loading…</p> : vehicles.length === 0 ? (
        <p className="empty-note">No vehicles yet — add one above.</p>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr><th>Photo</th><th>Name</th><th>Category</th><th>Photos</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td><img className="admin-thumb" src={v.thumb_url || v.image_url} alt={v.name} /></td>
                  <td>{v.name}</td>
                  <td>{v.category}</td>
                  <td>
                    {(v.photos?.length || 1)} photo(s)
                    <label className="btn btn-outline" style={{ marginLeft: 8, fontSize: "0.8rem", padding: "4px 10px", cursor: "pointer" }}>
                      {addingPhotoFor === v.id ? "Uploading…" : "+ Add"}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        disabled={addingPhotoFor === v.id}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) addPhotoToVehicle(v, file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </td>
                  <td>
                    <span className={`pill ${v.is_active ? "active" : "inactive"}`}>
                      {v.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-outline" onClick={() => toggleActive(v)}>
                      {v.is_active ? "Hide" : "Show"}
                    </button>
                    <button className="btn btn-outline" onClick={() => remove(v)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ── Inquiries ────────────────────────────────────────────────
function InquiriesPanel() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    const { data, error: queryError } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (queryError) {
      console.error("[Admin] Could not load inquiries:", queryError);
      setError(queryError.message);
    }
    setInquiries(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function setStatus(id, status) {
    await supabase.from("inquiries").update({ status }).eq("id", id);
    load();
  }

  if (loading) return <p>Loading…</p>;
  if (error) {
    return (
      <div className="form-status error">
        Could not load quote requests: {error}
      </div>
    );
  }
  if (inquiries.length === 0) return <p className="empty-note">No quote requests yet.</p>;

  return (
    <div className="admin-table-scroll">
      <table className="admin-table">
        <thead>
          <tr><th>Name</th><th>Phone</th><th>Service</th><th>Location</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {inquiries.map((i) => (
            <tr key={i.id}>
              <td>{i.name}</td>
              <td><a href={`tel:+91${i.phone.replace(/\D/g, "").slice(-10)}`}>{i.phone}</a></td>
              <td>{i.service_type}</td>
              <td>{i.location || "—"}</td>
              <td><span className={`pill ${i.status}`}>{i.status}</span></td>
              <td>
                <select value={i.status} onChange={(e) => setStatus(i.id, e.target.value)}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="closed">Closed</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Site Settings ────────────────────────────────────────────
function SiteSettingsPanel() {
  const { refresh } = useSiteSettings();
  const [form, setForm] = useState(null); // null while loading
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  async function load() {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error) {
      setStatus({ type: "error", message: error.message });
      setForm({ ...DEFAULT_SETTINGS });
      return;
    }
    const row = data || DEFAULT_SETTINGS;
    setForm({
      name: row.name || "",
      tagline: row.tagline || "",
      phone1: row.phone1 || "",
      phone2: row.phone2 || "",
      whatsapp_number: row.whatsapp_number || "",
      instagram_url: row.instagram_url || "",
       facebook_url: row.facebook_url || "",
      address: row.address || "",
      map_query: row.map_query || "",
      years_in_service: row.years_in_service ?? 0,
      service_areas_text: (row.service_areas || []).join("\n"),
      about_hero_title: row.about?.hero_title || "",
      about_paragraphs_text: (row.about?.paragraphs || []).join("\n\n"),
      about_values: row.about?.values && row.about.values.length > 0
        ? row.about.values
        : [{ title: "", text: "" }],
      services_hero_title: row.services?.hero_title || "",
      services_hero_subtitle: row.services?.hero_subtitle || "",
      services_items: row.services?.items && row.services.items.length > 0
        ? row.services.items.map((it) => ({ ...it, points_text: (it.points || []).join("\n") }))
        : [{ title: "", text: "", points_text: "" }],
      home: {
        ...DEFAULT_SETTINGS.home, ...(row.home || {}),
        process_text: (row.home?.process_steps || []).map((s) => [s.num, s.title, s.text].join(" | ")).join("\n"),
      },
      contact: { ...DEFAULT_SETTINGS.contact, ...(row.contact || {}) },
      nav_links: Array.isArray(row.nav_links) ? row.nav_links : [],
    });
  }

  useEffect(() => { load(); }, []);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function setNested(group, key, value) {
    setForm((f) => ({ ...f, [group]: { ...f[group], [key]: value } }));
  }
  function setNavLink(i, key, value) {
    setForm((f) => {
      const links = [...f.nav_links];
      links[i] = { ...links[i], [key]: value };
      return { ...f, nav_links: links };
    });
  }

  function setValueField(i, key, value) {
    setForm((f) => {
      const values = [...f.about_values];
      values[i] = { ...values[i], [key]: value };
      return { ...f, about_values: values };
    });
  }
  function addValue() {
    setForm((f) => ({ ...f, about_values: [...f.about_values, { title: "", text: "" }] }));
  }
  function removeValue(i) {
    setForm((f) => ({ ...f, about_values: f.about_values.filter((_, idx) => idx !== i) }));
  }

  function setServiceField(i, key, value) {
    setForm((f) => {
      const items = [...f.services_items];
      items[i] = { ...items[i], [key]: value };
      return { ...f, services_items: items };
    });
  }
  function addService() {
    setForm((f) => ({ ...f, services_items: [...f.services_items, { title: "", text: "", points_text: "" }] }));
  }
  function removeService(i) {
    setForm((f) => ({ ...f, services_items: f.services_items.filter((_, idx) => idx !== i) }));
  }
  function addNavLink() {
    setForm((f) => ({ ...f, nav_links: [...f.nav_links, { label: "", url: "", open_new_tab: false }] }));
  }
  function removeNavLink(i) {
    setForm((f) => ({ ...f, nav_links: f.nav_links.filter((_, idx) => idx !== i) }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: "", message: "" });

    const payload = {
      id: 1,
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      phone1: form.phone1.trim(),
      phone2: form.phone2.trim(),
      whatsapp_number: form.whatsapp_number.trim(),
      instagram_url: normalizeInstagramUrl(form.instagram_url),
      facebook_url: normalizeFacebookUrl(form.facebook_url),
      address: form.address.trim(),
      map_query: form.map_query.trim(),
      years_in_service: Number(form.years_in_service) || 0,
      service_areas: form.service_areas_text.split("\n").map((s) => s.trim()).filter(Boolean),
      about: {
        hero_title: form.about_hero_title.trim(),
        paragraphs: form.about_paragraphs_text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
        values: form.about_values
          .map((v) => ({ title: v.title.trim(), text: v.text.trim() }))
          .filter((v) => v.title || v.text),
      },
      services: {
        hero_title: form.services_hero_title.trim(),
        hero_subtitle: form.services_hero_subtitle.trim(),
        items: form.services_items
          .map((it) => ({
            title: it.title.trim(),
            text: it.text.trim(),
            points: it.points_text.split("\n").map((p) => p.trim()).filter(Boolean),
          }))
          .filter((it) => it.title || it.text),
      },
      home: {
        ...form.home,
        process_steps: form.home.process_text.split("\n").map((line, i) => {
          const [num, title, text] = line.split("|").map((part) => part.trim());
          return { num: num || String(i + 1).padStart(2, "0"), title: title || "", text: text || "" };
        }).filter((step) => step.title || step.text),
      },
      contact: {
        heading: form.contact.heading.trim(),
        intro: form.contact.intro.trim(),
        quote_heading: form.contact.quote_heading.trim(),
        quote_copy: form.contact.quote_copy.trim(),
      },
      nav_links: form.nav_links.map((link) => ({
        label: String(link.label || "").trim(),
        url: String(link.url || "").trim(),
        open_new_tab: link.open_new_tab !== false,
      })).filter((link) => link.label && /^(\/|https?:\/\/|mailto:|tel:)/i.test(link.url)),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("site_settings").upsert(payload);
    setSaving(false);
    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }
    setStatus({ type: "ok", message: "Saved — the live site will reflect this on next page load." });
    refresh();
  }

  if (!form) return <p>Loading…</p>;

  return (
    <form onSubmit={handleSave}>
      {status.message && (
        <div className={`form-status ${status.type === "ok" ? "ok" : "error"}`} style={{ marginBottom: 18 }}>
          {status.message}
        </div>
      )}

      <div className="admin-section-title">Business Info</div>
      <div className="form-row">
        <div className="form-field">
          <label>Site / Business Name</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Raunak Crane Service" />
        </div>
        <div className="form-field">
          <label>Tagline</label>
          <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="e.g. Hydra Crane, Mobile Crane & Vehicle Towing" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>Primary Phone</label>
          <input value={form.phone1} onChange={(e) => set("phone1", e.target.value)} placeholder="10-digit number" />
        </div>
        <div className="form-field">
          <label>Secondary Phone</label>
          <input value={form.phone2} onChange={(e) => set("phone2", e.target.value)} placeholder="10-digit number" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>WhatsApp Number (with country code, no +)</label>
          <input value={form.whatsapp_number} onChange={(e) => set("whatsapp_number", e.target.value)} placeholder="e.g. 917782005426" />
        </div>
        <div className="form-field">
          <label>Instagram URL</label>
          <input value={form.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} placeholder="https://instagram.com/..." />
        </div>
        <div className="form-field">
          <label>Facebook URL or ID</label>
          <input value={form.facebook_url} onChange={(e) => set("facebook_url", e.target.value)} placeholder="https://facebook.com/... or page ID" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>Address</label>
          <input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Full address shown on site" />
        </div>
        <div className="form-field">
          <label>Google Maps Search Query</label>
          <input value={form.map_query} onChange={(e) => set("map_query", e.target.value)} placeholder="Used to place the map pin" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>Years in Service</label>
          <input type="number" min="0" value={form.years_in_service} onChange={(e) => set("years_in_service", e.target.value)} />
        </div>
        <div className="form-field">
          <label>Service Areas (one per line)</label>
          <textarea rows="3" value={form.service_areas_text} onChange={(e) => set("service_areas_text", e.target.value)} />
        </div>
      </div>

      <div className="admin-section-title">About Page</div>
      <div className="form-field">
        <label>About Page Heading</label>
        <input value={form.about_hero_title} onChange={(e) => set("about_hero_title", e.target.value)} />
      </div>
      <div className="form-field">
        <label>About Page Paragraphs (leave a blank line between paragraphs)</label>
        <textarea rows="8" value={form.about_paragraphs_text} onChange={(e) => set("about_paragraphs_text", e.target.value)} />
      </div>

      <label style={{ fontWeight: 600, display: "block", margin: "18px 0 8px" }}>"Why Choose Us" Cards</label>
      {form.about_values.map((v, i) => (
        <div className="repeater-card" key={i}>
          {form.about_values.length > 1 && (
            <button type="button" className="remove-btn" onClick={() => removeValue(i)}>Remove</button>
          )}
          <div className="form-field">
            <label>Card Title</label>
            <input value={v.title} onChange={(e) => setValueField(i, "title", e.target.value)} />
          </div>
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label>Card Text</label>
            <textarea rows="2" value={v.text} onChange={(e) => setValueField(i, "text", e.target.value)} />
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-outline" onClick={addValue}>+ Add Card</button>

      <div className="admin-section-title">Services Page</div>
      <div className="form-field">
        <label>Services Page Heading</label>
        <input value={form.services_hero_title} onChange={(e) => set("services_hero_title", e.target.value)} />
      </div>
      <div className="form-field">
        <label>Services Page Subheading</label>
        <textarea rows="2" value={form.services_hero_subtitle} onChange={(e) => set("services_hero_subtitle", e.target.value)} />
      </div>

      <label style={{ fontWeight: 600, display: "block", margin: "18px 0 8px" }}>Service Listings</label>
      {form.services_items.map((it, i) => (
        <div className="repeater-card" key={i}>
          {form.services_items.length > 1 && (
            <button type="button" className="remove-btn" onClick={() => removeService(i)}>Remove</button>
          )}
          <div className="form-field">
            <label>Service Title</label>
            <input value={it.title} onChange={(e) => setServiceField(i, "title", e.target.value)} />
          </div>
          <div className="form-field">
            <label>Description</label>
            <textarea rows="2" value={it.text} onChange={(e) => setServiceField(i, "text", e.target.value)} />
          </div>
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label>Bullet Points (one per line)</label>
            <textarea rows="3" value={it.points_text} onChange={(e) => setServiceField(i, "points_text", e.target.value)} />
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-outline" onClick={addService}>+ Add Service</button>

      <div className="admin-section-title">Home Page</div>
      <div className="form-row">
        <div className="form-field"><label>Hero Eyebrow</label><input value={form.home.hero_eyebrow} onChange={(e) => setNested("home", "hero_eyebrow", e.target.value)} /></div>
        <div className="form-field"><label>Hero Title</label><input value={form.home.hero_title} onChange={(e) => setNested("home", "hero_title", e.target.value)} /></div>
      </div>
      <div className="form-field"><label>Hero Intro</label><textarea rows="3" value={form.home.hero_intro} onChange={(e) => setNested("home", "hero_intro", e.target.value)} placeholder="Leave blank for the default intro" /></div>
      <div className="form-row">
        <div className="form-field"><label>Services Section Heading</label><input value={form.home.services_heading} onChange={(e) => setNested("home", "services_heading", e.target.value)} /></div>
        <div className="form-field"><label>Services Section Description</label><textarea rows="2" value={form.home.services_description} onChange={(e) => setNested("home", "services_description", e.target.value)} /></div>
      </div>
      <div className="form-field"><label>Process Heading</label><input value={form.home.process_heading} onChange={(e) => setNested("home", "process_heading", e.target.value)} /></div>
      <div className="form-field"><label>Process Steps (one per line: number | title | description)</label><textarea rows="5" value={form.home.process_text} onChange={(e) => setNested("home", "process_text", e.target.value)} /></div>
      <div className="form-row">
        <div className="form-field"><label>Coverage Heading</label><input value={form.home.coverage_heading} onChange={(e) => setNested("home", "coverage_heading", e.target.value)} /></div>
        <div className="form-field"><label>Coverage Description</label><textarea rows="2" value={form.home.coverage_description} onChange={(e) => setNested("home", "coverage_description", e.target.value)} /></div>
      </div>

      <div className="admin-section-title">Contact Page</div>
      <div className="form-field"><label>Contact Heading</label><input value={form.contact.heading} onChange={(e) => setNested("contact", "heading", e.target.value)} /></div>
      <div className="form-field"><label>Contact Intro</label><textarea rows="2" value={form.contact.intro} onChange={(e) => setNested("contact", "intro", e.target.value)} /></div>
      <div className="form-row">
        <div className="form-field"><label>Quote Card Heading</label><input value={form.contact.quote_heading} onChange={(e) => setNested("contact", "quote_heading", e.target.value)} /></div>
        <div className="form-field"><label>Quote Card Copy</label><textarea rows="2" value={form.contact.quote_copy} onChange={(e) => setNested("contact", "quote_copy", e.target.value)} /></div>
      </div>

      <div className="admin-section-title">Menu Links</div>
      <p className="form-note">Use /path for an internal page or https://, mailto:, or tel: for an external link.</p>
      {form.nav_links.map((link, i) => (
        <div className="repeater-card nav-link-editor" key={i}>
          <button type="button" className="remove-btn" onClick={() => removeNavLink(i)}>Remove</button>
          <div className="form-row">
            <div className="form-field"><label>Label</label><input value={link.label || ""} onChange={(e) => setNavLink(i, "label", e.target.value)} /></div>
            <div className="form-field"><label>URL</label><input value={link.url || ""} onChange={(e) => setNavLink(i, "url", e.target.value)} placeholder="/gallery or https://..." /></div>
          </div>
          <label className="checkbox-field"><input type="checkbox" checked={link.open_new_tab !== false} onChange={(e) => setNavLink(i, "open_new_tab", e.target.checked)} /> Open in new tab</label>
        </div>
      ))}
      <button type="button" className="btn btn-outline" onClick={addNavLink}>+ Add Menu Link</button>

      <div style={{ marginTop: 28 }}>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save Site Settings"}
        </button>
      </div>
    </form>
  );
}
