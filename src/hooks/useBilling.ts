import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  DEFAULT_BILLING_PLANS,
  DEFAULT_FREE_TRANSFORMATIONS,
  type BillingPlan,
} from "@/config/billing";

type BillingState = {
  plans: BillingPlan[];
  freeTransformations: number;
  creditsBalance: number;
  freeUsed: number;
  loading: boolean;
  refresh: () => Promise<void>;
};

export const useBilling = (): BillingState => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<BillingPlan[]>(DEFAULT_BILLING_PLANS);
  const [freeTransformations, setFreeTransformations] = useState(DEFAULT_FREE_TRANSFORMATIONS);
  const [creditsBalance, setCreditsBalance] = useState(0);
  const [freeUsed, setFreeUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    const [{ data: planRows }, { data: settingsRows }] = await Promise.all([
      supabase
        .from("billing_plans")
        .select("id, name, credits, amount, currency, description, popular, sort_order")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("app_settings")
        .select("key, value")
        .eq("key", "free_transformations"),
    ]);

    if (planRows?.length) {
      setPlans(planRows as BillingPlan[]);
    }

    const freeSetting = settingsRows?.[0]?.value;
    if (typeof freeSetting === "number") {
      setFreeTransformations(freeSetting);
    }

    if (user) {
      const [{ data: creditRow }, { count }] = await Promise.all([
        supabase
          .from("user_credits")
          .select("credits_balance")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("transformations")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .in("status", ["pending", "processing", "completed"]),
      ]);

      setCreditsBalance(creditRow?.credits_balance ?? 0);
      setFreeUsed(count ?? 0);
    } else {
      setCreditsBalance(0);
      setFreeUsed(0);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    plans,
    freeTransformations,
    creditsBalance,
    freeUsed,
    loading,
    refresh,
  };
};
