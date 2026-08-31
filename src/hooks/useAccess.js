import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

/**
 * Estado del acceso del usuario a Stress Reset.
 * status: loading | free | paid | trial | expired | revoked
 * tier:   free | week1 | full
 */
export function useAccess(session) {
  const [status, setStatus] = useState("loading");
  const [tier, setTier] = useState("free");
  const [expiresAt, setExpiresAt] = useState(null);

  const check = useCallback(async () => {
    if (!session?.user) {
      setStatus("free");
      setTier("free");
      setExpiresAt(null);
      return;
    }

    const { data: profile } = await supabase
      .from("sr_profiles")
      .select("access_status, access_expires_at, access_tier")
      .eq("id", session.user.id)
      .maybeSingle();

    if (!profile || profile.access_status === "free" || !profile.access_status) {
      const claimed = await claimPendingPurchase(session.user);
      if (claimed) {
        setStatus("paid");
        setTier(claimed.access_tier || "full");
        setExpiresAt(claimed.access_expires_at ? new Date(claimed.access_expires_at) : null);
        return;
      }
    }

    if (!profile) {
      setStatus("free");
      setTier("free");
      return;
    }

    const now = new Date();
    const exp = profile.access_expires_at ? new Date(profile.access_expires_at) : null;
    setTier(profile.access_tier || "free");

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

  return { status, tier, expiresAt, recheck: check };
}

async function claimPendingPurchase(user) {
  const email = user.email?.toLowerCase().trim();
  if (!email) return null;

  const { data: purchases } = await supabase
    .from("sr_purchases")
    .select("*")
    .eq("email", email)
    .in("event_type", ["PURCHASE_APPROVED", "PURCHASE_COMPLETE"])
    .order("processed_at", { ascending: false });

  if (!purchases || purchases.length === 0) return null;

  // Determinar tier más alto comprado (full > week1)
  const hasFullTier = purchases.some(
    (p) => p.raw_payload?.tier === "full" || p.raw_payload?.tier === "upgrade_to_full"
  );
  const tier = hasFullTier ? "full" : "week1";

  const purchase = purchases[0];
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 12);

  const { data: updated } = await supabase
    .from("sr_profiles")
    .upsert({
      id: user.id,
      email,
      access_status: "paid",
      access_tier: tier,
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

/**
 * Devuelve true si el usuario puede acceder al día dado del programa
 * según su tier.
 * - free: solo suspiro fisiológico (día 1 sin plan)
 * - week1: días 1-7
 * - full: días 1-28
 */
export function canAccessDay(tier, day) {
  if (tier === "full") return true;
  if (tier === "week1") return day >= 1 && day <= 7;
  return false; // free: sin acceso al plan
}

/**
 * Devuelve true si el patrón respiratorio está desbloqueado.
 * Free tier solo tiene suspiro fisiológico.
 */
export function canAccessPattern(tier, patternKey) {
  if (tier === "full" || tier === "week1") return true;
  return patternKey === "sigh";
}
