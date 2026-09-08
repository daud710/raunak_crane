// Supabase Edge Function — replaces the old Node/Express backend.
// Does the same job: validates the quote form, drops obvious bot
// submissions, and inserts into "inquiries" using the service role key
// (so the anon key never needs insert access to this table).
//
// Deploy with:  supabase functions deploy contact
// Call from the frontend at:
//   https://<your-project-ref>.supabase.co/functions/v1/contact

import { createClient } from "jsr:@supabase/supabase-js@2";

const PHONE_RE = /^[+]?[0-9\s-]{7,15}$/;

function clean(value: unknown, maxLength: number): string {
  return String(value ?? "").trim().slice(0, maxLength);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, errors: ["Method not allowed."] }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, errors: ["Invalid request body."] }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Honeypot: a real visitor never fills this hidden field. Bots usually do.
  if (clean(body.website, 100).length > 0) {
    // Pretend it worked so the bot doesn't learn anything, but drop it silently.
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const name = clean(body.name, 80);
  const phone = clean(body.phone, 20);
  const serviceType = clean(body.serviceType, 60) || "General enquiry";
  const location = clean(body.location, 120);
  const message = clean(body.message, 800);

  const errors: string[] = [];
  if (name.length < 2) errors.push("Please enter your name.");
  if (!PHONE_RE.test(phone)) errors.push("Please enter a valid phone number.");
  if (message.length > 0 && message.length < 3) errors.push("Message looks too short.");

  if (errors.length > 0) {
    return new Response(JSON.stringify({ ok: false, errors }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const { error } = await supabaseAdmin.from("inquiries").insert({
    name,
    phone,
    service_type: serviceType,
    location: location || null,
    message: message || null,
  });

  if (error) {
    console.error("Failed to store inquiry:", error.message);
    return new Response(
      JSON.stringify({
        ok: false,
        errors: ["Something went wrong on our end. Please call or WhatsApp us directly."],
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
