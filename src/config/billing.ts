export const DEFAULT_FREE_TRANSFORMATIONS = 3;

export type BillingPlan = {
  id: string;
  name: string;
  credits: number;
  amount: number;
  currency: string;
  description: string;
  popular: boolean;
  sort_order: number;
};

export const DEFAULT_BILLING_PLANS: BillingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 5,
    amount: 49,
    currency: "INR",
    description: "A small top-up for quick room ideas",
    popular: false,
    sort_order: 1,
  },
  {
    id: "value",
    name: "Value",
    credits: 15,
    amount: 99,
    currency: "INR",
    description: "Best for exploring a few design directions",
    popular: true,
    sort_order: 2,
  },
  {
    id: "studio",
    name: "Studio",
    credits: 40,
    amount: 199,
    currency: "INR",
    description: "For frequent room transformations",
    popular: false,
    sort_order: 3,
  },
];
