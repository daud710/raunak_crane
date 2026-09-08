# Raunak Crane Service — Client Handoff

## 1. Deploy on Vercel

1. Open Vercel and choose **Add New → Project**.
2. Import this project/repository.
3. Set **Root Directory** to `frontend`.
4. Vercel should detect Vite automatically:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
5. Add these Environment Variables for **Production**, **Preview**, and **Development**:

```text
VITE_SUPABASE_URL=https://nnpsxviwkofvteepwglf.supabase.co
VITE_SUPABASE_ANON_KEY=PASTE_THE_SUPABASE_PUBLISHABLE_OR_ANON_KEY
VITE_PHONE_1=7782005426
VITE_PHONE_2=9653911627
VITE_WHATSAPP_NUMBER=917782005426
VITE_INSTAGRAM_URL=https://instagram.com/raunakcraneservice
VITE_ADDRESS=Hardiya Mod, Siwan, Bihar 841226
VITE_MAP_QUERY=Hardiya Mod, Siwan, Bihar
```

Never add a Supabase `service_role` key to Vercel or the frontend.

## 2. Before giving the link to the client

- Open `/`, `/services`, `/about`, and `/contact`.
- Submit one test quote and confirm it appears in Admin → Quote Requests.
- Log in at `/admin/login`.
- In Admin → Site Settings, save a harmless test change and confirm it appears on the public site.
- Add a test Menu Link, click it from the public navbar, then remove it if it is not needed.
- Check the site on a phone and desktop.
- Confirm Call, WhatsApp, Instagram, Facebook, and Google Maps links.

## 3. Connect the domain later

In Vercel, open **Project → Settings → Domains**, add the purchased domain, and copy the DNS records Vercel shows. At the domain registrar, add those exact records. Keep only one canonical version (`www` or non-`www`) and redirect the other version to it.

After the domain is live:

- Verify `https://your-domain.com` in Google Search Console.
- Submit `https://your-domain.com/sitemap.xml`.
- Confirm the canonical URL in the browser source matches the final domain.
- Update the site URL in `frontend/src/components/SEO.jsx` and `frontend/public/sitemap.xml` if the final domain is different from `www.raunakcraneservice.in`.

## 4. Client handover

Give the client:

- The Vercel website URL.
- The `/admin/login` URL.
- The admin email and password through a private channel, never inside public code.
- The Supabase project ownership/access separately.
- The final ZIP only as a backup; the live Vercel project is the source of truth.