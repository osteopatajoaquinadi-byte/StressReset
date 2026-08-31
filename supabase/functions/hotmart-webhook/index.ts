// Edge Function: procesa webhooks de Hotmart y activa/revoca acceso a Stress Reset.
// Deploy: supabase functions deploy hotmart-webhook --no-verify-jwt
// URL: https://<PROJECT_REF>.supabase.co/functions/v1/hotmart-webhook
//
// Configurar esta URL en Hotmart > Herramientas > Webhook.
// Evento a suscribir: "Compra aprobada" (mínimo).
// Recomendado también: "Compra reembolsada" y "Chargeback".
//
// Secret a configurar en Hotmart:
//   HOTMART_WEBHOOK_TOKEN
// Y en Supabase (Edge Function Secrets):
//   HOTMART_WEBHOOK_TOKEN  (mismo valor)
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const HOTMART_TOKEN = Deno.env.get("HOTMART_WEBHOOK_TOKEN")!;

const ACCESS_MONTHS = 12; // Duración del acceso post-compra

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

Deno.serve(async (req) => {
  // 1) Verificar token
  const token = req.headers.get("x-hotmart-hottok") || new URL(req.url).searchParams.get("hottok");
  if (token !== HOTMART_TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2) Parsear payload
  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  const event = payload.event || payload.data?.event || "unknown";
  const email = (payload.data?.buyer?.email || payload.buyer?.email || "").toLowerCase().trim();
  const externalRef = payload.data?.purchase?.transaction || payload.data?.transaction || null;
  const amount = payload.data?.purchase?.price?.value ?? null;
  const currency = payload.data?.purchase?.price?.currency_value ?? "USD";

  if (!email) {
    return new Response("Missing email", { status: 400 });
  }

  // 3) Log inmutable de la transacción
  await supabase.from("sr_purchases").insert({
    email,
    source: "hotmart",
    external_ref: externalRef,
    event_type: event,
    amount,
    currency,
    raw_payload: payload,
  });

  // 4) Ejecutar acción según evento
  const grantEvents = ["PURCHASE_APPROVED", "PURCHASE_COMPLETE", "SUBSCRIPTION_CANCELLATION_REVERT"];
  const revokeEvents = ["PURCHASE_REFUNDED", "PURCHASE_CHARGEBACK", "PURCHASE_CANCELED"];

  if (grantEvents.includes(event)) {
    await grantAccess(email, externalRef, amount, currency);
  } else if (revokeEvents.includes(event)) {
    await revokeAccess(email);
  }

  return new Response(JSON.stringify({ ok: true, event, email }), {
    headers: { "content-type": "application/json" },
  });
});

async function grantAccess(email: string, ref: string | null, amount: number | null, currency: string) {
  // Busca el usuario existente por email
  const { data: existing } = await supabase.auth.admin
    .listUsers()
    .then(({ data }) => ({ data: data?.users?.find((u: any) => u.email === email) }));

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + ACCESS_MONTHS);

  if (existing) {
    // Usuario ya registrado — solo update de acceso
    await supabase.from("sr_profiles").upsert({
      id: existing.id,
      email,
      access_status: "paid",
      access_expires_at: expiresAt.toISOString(),
      purchase_source: "hotmart",
      purchase_ref: ref,
      purchase_amount: amount,
      purchase_currency: currency,
      purchase_date: new Date().toISOString(),
    });
  } else {
    // Usuario aún no se ha registrado — creamos placeholder e invitación
    // Cuando ese email haga signup, el trigger de abajo copia el acceso
    // (fallback: cuando el usuario se registre, la app verificará sr_purchases por email
    // y activará acceso automáticamente. Esto se hace en el cliente).
    // Aquí solo guardamos en sr_purchases (ya hecho arriba).
  }
}

async function revokeAccess(email: string) {
  const { data: existing } = await supabase.auth.admin
    .listUsers()
    .then(({ data }) => ({ data: data?.users?.find((u: any) => u.email === email) }));

  if (existing) {
    await supabase.from("sr_profiles").update({
      access_status: "revoked",
    }).eq("id", existing.id);
  }
}
