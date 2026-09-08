-- Raunak Crane Service — Supabase schema
-- Run this once in the Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- Admin allowlist
-- A Supabase-authenticated user is not automatically an admin.
-- After creating the admin user in Auth, add that user's UUID here:
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'your-admin-email@example.com';
-- ─────────────────────────────────────────────────────────────
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;

create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

-- ─────────────────────────────────────────────────────────────
-- Vehicles shown on the site (Home + Services pages)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Crane',
  description text not null default '',
  image_url text not null,
  thumb_url text,
  photos jsonb not null default '[]', -- [{"url": "...", "thumb": "..."}, ...] — full gallery for this vehicle
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Safe to run again on a database that already has the vehicles table from
-- an earlier version of this schema — adds the new gallery column only if missing.
alter table public.vehicles add column if not exists photos jsonb not null default '[]';

-- Backfill: any existing vehicle with no gallery yet gets its single photo
-- as the first (and only) item, so nothing breaks after upgrading.
update public.vehicles
set photos = jsonb_build_array(jsonb_build_object('url', image_url, 'thumb', coalesce(thumb_url, image_url)))
where photos = '[]'::jsonb and image_url is not null;

alter table public.vehicles enable row level security;

-- Anyone can view active vehicles (this is what the public website reads).
create policy "Public can view active vehicles"
  on public.vehicles for select to anon
  using (is_active = true);

-- Only users explicitly listed in admin_users can manage vehicles.
create policy "Admins can view all vehicles"
  on public.vehicles for select to authenticated
  using ((select private.is_admin()));

create policy "Admins can insert vehicles"
  on public.vehicles for insert to authenticated
  with check ((select private.is_admin()));

create policy "Admins can update vehicles"
  on public.vehicles for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admins can delete vehicles"
  on public.vehicles for delete to authenticated
  using ((select private.is_admin()));

-- ─────────────────────────────────────────────────────────────
-- Quote / contact form submissions
-- Only the backend (using the service role key) is allowed to insert.
-- Only a logged-in admin can read or update them.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  service_type text not null default 'General enquiry',
  location text,
  message text,
  status text not null default 'new', -- new | contacted | closed
  created_at timestamptz not null default now()
);

alter table public.inquiries enable row level security;

-- No public select/insert policy is created on purpose: the anon key gets no access at all.
-- The "contact" Supabase Edge Function uses the service_role key, which bypasses RLS entirely.

create policy "Admins can view inquiries"
  on public.inquiries for select to authenticated
  using ((select private.is_admin()));

create policy "Admins can update inquiries"
  on public.inquiries for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- ─────────────────────────────────────────────────────────────
-- Storage bucket for vehicle photos uploaded from the admin panel.
-- Create the bucket "vehicle-photos" as PUBLIC from the Storage UI, then run this:
-- ─────────────────────────────────────────────────────────────
create policy "Public can view vehicle photos"
  on storage.objects for select
  using (bucket_id = 'vehicle-photos');

create policy "Admins can upload vehicle photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'vehicle-photos' and (select private.is_admin()));

create policy "Admins can delete vehicle photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'vehicle-photos' and (select private.is_admin()));

-- ─────────────────────────────────────────────────────────────
-- Starter data using the photos already shipped in frontend/public/images/
-- Delete or edit these rows any time from the admin panel.
-- ─────────────────────────────────────────────────────────────
-- ─────────────────────────────────────────────────────────────
-- Site settings (single row) — every editable piece of text/contact
-- info on the site. The public site reads this (anyone can view);
-- only a logged-in admin can update it.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.site_settings (
  id int primary key default 1,
  name text not null default 'Raunak Crane Service',
  tagline text not null default 'Hydra Crane, Mobile Crane & Vehicle Towing',
  phone1 text not null default '7782005426',
  phone2 text not null default '9653911627',
  whatsapp_number text not null default '917782005426',
  instagram_url text not null default 'https://instagram.com/raunakcraneservice',
  facebook_url text not null default '',
  address text not null default 'Hardiya Mod, Siwan, Bihar 841226',
  map_query text not null default 'Hardiya Mod, Siwan, Bihar',
  years_in_service int not null default 9,
  service_areas jsonb not null default '["Siwan Town","Hardiya Mod","Maharajganj","Guthni","Darauli","Basantpur","Andar","Nearby NH-227 stretch"]',
  about jsonb not null default '{}',
  services jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

alter table public.site_settings enable row level security;

-- Content added after the initial settings release. JSONB keeps this
-- backwards-compatible with existing rows and allows the admin editor to
-- grow without changing the table shape.
alter table public.site_settings add column if not exists home jsonb not null default '{}'::jsonb;
alter table public.site_settings add column if not exists contact jsonb not null default '{}'::jsonb;
alter table public.site_settings add column if not exists nav_links jsonb not null default '[]'::jsonb;

create policy "Public can view site settings"
  on public.site_settings for select
  using (true);

create policy "Admins can update site settings"
  on public.site_settings for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admins can insert site settings"
  on public.site_settings for insert to authenticated
  with check ((select private.is_admin()) and id = 1);

-- Seed the one row with the current site content. Edit any of this later
-- from Admin → Site Settings — you never need to touch this file again.
insert into public.site_settings (
  id, name, tagline, phone1, phone2, whatsapp_number, instagram_url, address, map_query,
  years_in_service, service_areas, about, services
) values (
  1, 'Raunak Crane Service', 'Hydra Crane, Mobile Crane & Vehicle Towing',
  '7782005426', '9653911627', '917782005426', 'https://instagram.com/raunakcraneservice',
  'Hardiya Mod, Siwan, Bihar 841226', 'Hardiya Mod, Siwan, Bihar',
  9,
  '["Siwan Town","Hardiya Mod","Maharajganj","Guthni","Darauli","Basantpur","Andar","Nearby NH-227 stretch"]',
  '{
    "hero_title": "Nine years of pulling Siwan''s vehicles out of trouble.",
    "paragraphs": [
      "Raunak Crane Service started as a single hydra crane working breakdown calls around Hardiya Mod. Over 9 years, the work grew from roadside towing into full recovery and lifting support: a second, heavier mobile crane joined the fleet for jobs a hydra crane can''t handle — loaded buses, site material, and larger trucks.",
      "What hasn''t changed is how the business runs day to day. Every call still goes to someone who can send a crane immediately, not a booking system. Every job still gets handled by the same small, experienced crew, whether it''s a car in a ditch at midnight or a scheduled loading job at a construction site.",
      "We work across Hardiya Mod, Siwan town, and the surrounding blocks — close enough that a call rarely means a long wait, and local enough that we usually already know the road you''re stuck on."
    ],
    "values": [
      {"title": "We actually answer the phone", "text": "Day or night, both numbers on this site are picked up by someone who can dispatch a crane — not a call centre."},
      {"title": "We quote before we start", "text": "You''ll know the basis for the charge before the crane leaves Hardiya Mod, not after the job is done."},
      {"title": "We handle the vehicle carefully", "text": "Recovery work done wrong causes more damage than the original breakdown. Our crew is trained to avoid that."},
      {"title": "We know these roads", "text": "9 years of towing jobs around Siwan means we already know the shortcuts, the tight turns, and the spots that need a hydra crane instead of a bigger one."}
    ]
  }'::jsonb,
  '{
    "hero_title": "Everything we do, in plain terms.",
    "hero_subtitle": "Pick what you need, or just call and describe the problem — we''ll tell you which vehicle and crew fit the job.",
    "items": [
      {"title": "Hydra Crane Hire", "text": "Our hydra crane is the first unit we send for most breakdown and accident calls. It lifts and pulls vehicles clear without additional damage, and works on tight village roads where a larger crane can''t turn.", "points": ["Cars, autos, and light commercial vehicles", "Roadside lifting and repositioning", "Fast dispatch — usually our quickest response"]},
      {"title": "Mobile Crane Hire", "text": "For heavier jobs — buses, loaded trucks, or lifting material at a site — our ACE 12XW-class mobile crane handles loads a hydra crane can''t. Hired by the job or by the hour.", "points": ["Rated up to 12-tonne class lifting", "Site loading and unloading work", "Bus and heavy-vehicle recovery"]},
      {"title": "Vehicle Towing & Recovery", "text": "Accident recovery, breakdown towing, and long-distance transport for vehicles that can''t be driven. We tow to your preferred garage, home, or destination.", "points": ["Accident and breakdown recovery", "Local towing and cross-district transport", "Careful handling — no dragging"]},
      {"title": "Loading & Unloading", "text": "Beyond towing, our cranes support general loading and unloading work — machinery, construction material, and heavy goods that need lifting rather than manual handling.", "points": ["Construction sites and godowns", "Machinery placement", "Scheduled or on-demand jobs"]},
      {"title": "24-Hour Emergency Response", "text": "Breakdowns don''t wait for office hours, so neither do we. Both numbers on this site are answered around the clock, every day of the year.", "points": ["No separate emergency surcharge policy hidden in fine print", "Same crew, day or night", "Clear communication on arrival time"]}
    ]
  }'::jsonb
)
on conflict (id) do nothing;

-- Backfill the newer content columns on an existing installation without
-- overwriting any content an administrator has already entered.
update public.site_settings
set home = case when home = '{}'::jsonb then '{
  "hero_eyebrow": "Hardiya Mod, Siwan · On Call 24 Hours",
  "hero_title": "When your vehicle is stuck, we''re already on the way.",
  "services_heading": "Crane hire and recovery, handled by people who show up.",
  "services_description": "Three services cover most of what our customers call about. See the full list, including pricing basis and coverage, on the Services page.",
  "process_heading": "From your call to your vehicle moving again.",
  "coverage_heading": "Based at Hardiya Mod, out across Siwan district.",
  "coverage_description": "If you''re near any of these, we can usually reach you within minutes, not hours."
}'::jsonb else home end,
contact = case when contact = '{}'::jsonb then '{
  "heading": "Reach us however''s fastest for you.",
  "intro": "For an active breakdown, calling or WhatsApp is quicker than the form below.",
  "quote_heading": "Request a Quote / Callback",
  "quote_copy": "Fill this in with what''s happened and where you are, and we''ll call you back to confirm details and timing."
}'::jsonb else contact end
where id = 1;

insert into public.vehicles (name, category, description, image_url, thumb_url, photos, sort_order)
values
  ('Hydra Recovery Crane', 'Hydra Crane',
   'Our main tow recovery unit — on call 24 hours for breakdowns, accidents, and roadside recovery around Siwan.',
   '/images/hydra-crane-1.jpg', '/images/hydra-crane-1-thumb.jpg',
   '[{"url": "/images/hydra-crane-1.jpg", "thumb": "/images/hydra-crane-1-thumb.jpg"}]', 1),
  ('Hydra Crane — Close Up', 'Hydra Crane',
   'The winch and boom assembly on our hydra crane, built for pulling stuck or damaged vehicles clear safely.',
   '/images/hydra-crane-2.jpg', '/images/hydra-crane-2-thumb.jpg',
   '[{"url": "/images/hydra-crane-2.jpg", "thumb": "/images/hydra-crane-2-thumb.jpg"}]', 2),
  ('ACE 12XW Mobile Crane', 'Mobile Crane',
   'A 12-tonne class mobile crane for heavier lifting, loading, and unloading jobs at sites and yards.',
   '/images/mobile-crane-1.jpg', '/images/mobile-crane-1-thumb.jpg',
   '[{"url": "/images/mobile-crane-1.jpg", "thumb": "/images/mobile-crane-1-thumb.jpg"}]', 3),
  ('Mobile Crane on a Tow Job', 'Mobile Crane',
   'The same mobile crane out on a bus recovery job — this fleet handles everything from cars to buses.',
   '/images/mobile-crane-2.jpg', '/images/mobile-crane-2-thumb.jpg',
   '[{"url": "/images/mobile-crane-2.jpg", "thumb": "/images/mobile-crane-2-thumb.jpg"}]', 4)
on conflict do nothing;
