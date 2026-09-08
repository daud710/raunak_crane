# Raunak Crane Service — Website

A complete website for **Raunak Crane Service** (Hardiya Mod, Siwan, Bihar): hydra crane hire,
mobile crane hire, and vehicle towing/recovery.

- `frontend/` — React (Vite) site: Home, Services, About, Contact, and an Admin panel.
- `supabase/schema.sql` — database tables, security rules, and starter data.
- `supabase/functions/contact/` — a Supabase Edge Function that validates and stores quote-form
  submissions. This replaces a separate Node/Express backend, so there is no extra server to
  host, deploy, or pay for — it lives inside the same free Supabase project as the database.

No Hindi text is used anywhere in the UI, as requested. All content is in English.

---

## 1. How the pieces fit together

```
Visitor's browser                 Supabase (one free project)
─────────────────                 ─────────────────────────────────
React site  ───────────────────►  Postgres + Auth + Storage
  reads vehicles directly            - "vehicles" table (public read)
  (fast, no server needed)           - Admin login (Supabase Auth)
                                      - "vehicle-photos" storage bucket

React site  ───────────────────►  "contact" Edge Function  ───────►  Postgres
  submits the quote/contact form     - input validation                - "inquiries" table
                                      - spam honeypot check              (private, admin-only read)
                                      - uses the service role key
                                        internally, so it never sits
                                        in the browser
```

The frontend is a static site (Vercel/Netlify/Cloudflare Pages — all free). The Edge Function
is deployed straight into your Supabase project — there's no separate host to sign up for,
sleep, or fall out of a free tier.

---

## 2. Set up Supabase (free tier is enough)

1. Create a project at https://supabase.com.
2. Open **SQL Editor** and run the contents of `supabase/schema.sql`. This creates:
   - `vehicles` table (photos shown on the site) — public can only *read* active vehicles;
     only a logged-in admin can add/edit/delete.
   - `inquiries` table (quote form submissions) — nobody outside the "contact" Edge Function
     can insert, and only a logged-in admin can read them.
   - Starter rows for the 4 vehicle photos already included in `frontend/public/images/`.
3. Open **Storage** → create a **public** bucket named `vehicle-photos`. This is where new
   photos the admin uploads later will live.
4. Open **Authentication → Users** → **Add user** and create the one admin login (email +
   password). Sign-up is intentionally *not* open to the public — this is the only way in.
5. Copy your **Project URL** and **anon public key** from Settings → API — you'll need them
   below.
6. Deploy the Edge Function (one-time, needs the free [Supabase CLI](https://supabase.com/docs/guides/cli)):
   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref your-project-ref   # find this in your project's Settings → General
   supabase functions deploy contact
   ```
   The function automatically has access to your project's database — you don't need to paste
   any secret key into it yourself.

---

## 3. Configure environment variables

### Frontend (`frontend/.env` — copy from `.env.example`)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PHONE_1=7782005426
VITE_PHONE_2=9653911627
VITE_WHATSAPP_NUMBER=917782005426
VITE_INSTAGRAM_URL=https://instagram.com/raunakcraneservice
VITE_ADDRESS=Hardiya Mod, Siwan, Bihar 841226
VITE_MAP_QUERY=Hardiya Mod, Siwan, Bihar
```
Update `VITE_INSTAGRAM_URL` to your real handle, and double check the phone numbers/address.
That's it — no backend URL to configure, since the quote form calls the Edge Function through
the same Supabase client already used for everything else.

---

## 4. Run it locally

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173 for the site, and http://localhost:5173/admin/login for the admin panel.
The quote form on Contact will call your *deployed* Edge Function even while the rest of the
site runs locally — there's nothing else to start.

---

## 5. Build for production / deploy

```bash
cd frontend
npm run build     # outputs static files to frontend/dist
```
Deploy `frontend/dist` to any static host (Vercel, Netlify, Cloudflare Pages — all free). The
Edge Function from step 2.6 is already live on Supabase's infrastructure; there's no second
deployment for it.

---

## 6. What's already built in

**Performance**
- All vehicle photos are pre-compressed and shipped as both `.jpg` and `.webp`.
- Every image uses native lazy loading (`loading="lazy"`) except the very first hero photo.
- No heavy UI framework — plain CSS, so the whole site loads fast on a mobile connection.

**Security**
- The public site never sees your Supabase service role key — it only lives inside the
  Edge Function's environment, which Supabase manages for you.
- The contact form only ever talks to the "contact" Edge Function, which rejects anything
  that looks like a bot (honeypot field) or has invalid input before it ever reaches the
  database. (Note: unlike a dedicated backend server, the Edge Function alone doesn't add
  IP-based rate limiting — for a small local-business site this is a reasonable trade-off,
  but if spam ever becomes a problem, Supabase's dashboard lets you see and delete bad rows.)
- Row Level Security in Postgres means even if someone got the anon key, they still can't
  write to `vehicles` or read `inquiries` without an admin login.
- The admin panel requires a Supabase-authenticated session for every write action.

**Local SEO (so "crane service near me" searches find you)**
- Every page has a unique, descriptive title and meta description mentioning Siwan/Bihar.
- A `LocalBusiness` structured-data block (JSON-LD) on every page lists your name, address,
  phone, service area, and opening hours (24 hours) — this is what Google reads to show you
  in local/map results.
- The Contact page embeds a live Google Map pinned to Hardiya Mod, Siwan.
- `robots.txt` and `sitemap.xml` are included so search engines can crawl the whole site.
- **Also do this outside the code** (can't be done from a repo): create/claim your
  **Google Business Profile** with the exact same name, address, and phone number used on the
  site, add these same photos there, and ask a few real customers for reviews. This one step
  usually matters more for "near me" ranking than anything on the website itself.

**Admin panel** (`/admin`)
- Add a vehicle: name, category, short description, and a photo (uploaded straight to
  Supabase Storage, then shown on the Home/Services pages).
- Toggle a vehicle active/inactive or delete it.
- View every quote/contact form submission, newest first, and mark it as read/contacted.

---

## 7. Content notes

- The homepage copy, service descriptions, and about-page story were written for this project
  based on the details you gave (9 years in service, Hardiya Mod/Siwan location, hydra crane +
  mobile crane fleet, 24-hour availability, loading/unloading/towing work). Feel free to edit
  the text directly in `frontend/src/pages/*.jsx` — it's plain readable JSX, not generated
  templating.
- I used your 4 supplied vehicle photos (compressed for the web) rather than pulling stock
  photos from the internet — for a local business site, real photos of your actual trucks and
  crew build far more trust than generic stock imagery, and it avoids any licensing question
  around images I don't have rights to redistribute. If you'd like extra photography (yard,
  a completed job, the team), drop the files into `frontend/public/images/` or upload them
  through the admin panel — the site will pick them up the same way.
#   c r e a n  
 #   r a u n a k _ c r a n e  
 #   r a u n a k _ c r a n e  
 