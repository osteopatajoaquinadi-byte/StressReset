import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

/**
 * Estado del acceso del usuario a Stress Reset.
 * loading | free | paid | trial | expired | revoked
 */
export function useAccess(session) {
  const [status, setStatus] = useState("loading");
  const [expiresAt, setExpiresAt] = useState(null);

  const check = useCallback(async () => {
    if (!session?.user) {
      setStatus("free");
      setExpiresAt(null);
      return;
    }

    const { data: profile } = await supabase
      .from("sr_profiles")
      .select("access_status, access_expires_at")
      .eq("id", session.user.id)
      .maybeSingle();

    // Si nunca compró, intenta reclamar compra pendiente por email
    if (!profile || profile.access_status === "free" || !profile.access_status) {
      const claimed = await claimPendingPurchase(session.user);
      if (claimed) {
        setStatus("paid");
        setExpiresAt(claimed.access_expires_at ? new Date(claimed.access_expires_at) : null);
        return;
      }
    }

    if (!profile) {
      setStatus("free");
      return;
    }

    const now = new Date();
    const exp = profile.access_expires_at ? new Date(profile.access_expires_at) : null;

    if (profile.access_status === "paid" || profile.access_status === "trial") {
      if (!exp || exp > now) {
        setStatus(profile.access_status);
        setExpiresAt(exp);
      } else {
        setStatus("expired");
        setExpiresAt(exp);
      }
    } else if (profile.access_status === "revoked") {
      setStatus("revoked");
      setExpiresAt(exp);
    } else if (profile.access_status === "expired") {
      setStatus("expired");
      setExpiresAt(exp);
    } else {
      setStatus("free");
    }
  }, [session]);

  useEffect(() => { check(); }, [check]);

  return { status, expiresAt, recheck: check };
}

async function claimPendingPurchase(user) {
  const email = user.email?.toLowerCase().trim();
  if (!email) return null;

  const { data: purchases } = await supabase
    .from("sr_purchases")
    .select("*")
    .eq("email", email)
    .in("event_type", ["PURCHASE_APPROVED", "PURCHASE_COMPLETE"])
    .order("processed_at", { ascending: false })
    .limit(1);

  if (!purchases || purchases.length === 0) return null;

  const purchase = purchases[0];
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 12);

  const { data: updated } = await supabase
    .from("sr_profiles")
    .upsert({
      id: user.id,
      email,
      access_status: "paid",
      access_expires_at: expiresAt.toISOString(),
      purchase_source: purchase.source,
      purchase_ref: purchase.external_ref,
      purchase_amount: purchase.amount,
      purchase_currency: purchase.currency,
      purchase_date: purchase.processed_at,
    })
    .select()
    .single();

  return updated;
}
