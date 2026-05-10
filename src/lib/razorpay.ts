import { supabase } from "@/integrations/supabase/client";
import type { BillingPlan } from "@/config/billing";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    email?: string;
    name?: string;
  };
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  theme?: {
    color?: string;
  };
};

type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

const loadRazorpayScript = () =>
  new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
    document.body.appendChild(script);
  });

export const startRazorpayCheckout = async ({
  plan,
  email,
  name,
}: {
  plan: BillingPlan;
  email?: string;
  name?: string;
}) => {
  await loadRazorpayScript();

  const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
    body: { plan_id: plan.id },
  });

  if (error) throw error;
  if (!data?.razorpay?.id || !data?.key_id) {
    throw new Error("Payment order was not created.");
  }

  return new Promise<void>((resolve, reject) => {
    const checkout = new window.Razorpay!({
      key: data.key_id,
      amount: data.razorpay.amount,
      currency: data.razorpay.currency,
      name: "RoomFlow",
      description: `${plan.credits} room transformations`,
      order_id: data.razorpay.id,
      prefill: { email, name },
      theme: { color: "#7c3aed" },
      modal: {
        ondismiss: () => reject(new Error("Payment was cancelled.")),
      },
      handler: async (response) => {
        const { error: verifyError } = await supabase.functions.invoke("verify-razorpay-payment", {
          body: response,
        });

        if (verifyError) {
          reject(verifyError);
          return;
        }

        resolve();
      },
    });

    checkout.open();
  });
};
