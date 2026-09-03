// Edge Function: reclama una compra pendiente de Hotmart tras el signup del usuario.
//
// Escenario: el usuario compra primero en Hotmart (sin cuenta), el webhook
// deja registrado en sr_purchases con el email pero sin user_id. Luego el
// usuario se registra en la app con el mismo email — esta función matchea
// la compra y activa el acceso.
//
// Usa service_role para bypasear las políticas RLS que impiden al usuario
// modificar sus propios campos access_*.
//
// Deploy: automático vía GitHub Actions al pushear cambios en supabase/functions/**

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const ACCESS_MONTHS = 12;

Deno.serve(async (req) => {
  // Autentica al usuario con su JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "no auth" }, 401);

  const jwt = authHeader.replace("Bearer ", "");
  const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
  if (userErr || !userData.user) return json({ error: "invalid token" }, 401);

  const user = userData.user;
  const email = user.email?.toLowerCase().trim();
  if (!email) return json({ error: "no email" }, 400);

  // Busca compras pendientes por email
  const { data: purchases } = await supabase
    .from("sr_purchases")
    .select("*")
    .eq("email", email)
    .in("event_type", ["PURCHASE_APPROVED", "PURCHASE_COMPLETE"])
    .order("processed_at", { ascending: false });

  if (!purchases || purchases.length === 0) {
    return json({ claimed: false, reason: "no purchases found" });
  }

  // Determinar tier más alto comprado
  const hasFullTier = purchases.some(
    (p) => p.raw_payload?.tier === "full" || p.raw_payload?.tier === "upgrade_to_full"
  );
  const tier = hasFullTier ? "full" : "week1";
  const purchase = purchases[0];

  // Verifica el estado actual — no downgrade
  const { data: current } = await supabase
    .from("sr_profiles")
    .select("access_tier")
    .eq("id", user.id)
    .maybeSingle();
  const finalTier = current?.access_tier === "full" ? "full" : tier;

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + ACCESS_MONTHS);

  // Escribe con service_role (bypassa RLS)
  const { data: updated, error: upsertErr } = await supabase
    .from("sr_profiles")
    .upsert({
      id: user.id,
      email,
      access_status: "paid",
      access_tier: finalTier,
      access_expires_at: expiresAt.toISOString(),
      purchase_source: purchase.source,
      purchase_ref: purchase.external_ref,
      purchase_amount: purchase.amount,
      purchase_currency: purchase.currency,
      purchase_date: purchase.processed_at,
    })
    .select()
    .single();

  if (upsertErr) return json({ error: upsertErr.message }, 500);

  // Link user_id a las compras que aún no lo tenían
  await supabase
    .from("sr_purchases")
    .update({ user_id: user.id })
    .eq("email", email)
    .is("user_id", null);

  return json({
    claimed: true,
    tier: finalTier,
    expires_at: expiresAt.toISOString(),
    profile: updated,
  });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
