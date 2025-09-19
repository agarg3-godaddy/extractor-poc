// Subscription model
export interface Subscription {
  domain: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
  productName: string;
  commonName: string;
  autoRenew: boolean;
  offerPlan: string;
  paidThroughDate: string; // ISO date string
  canBeRenewed: boolean;
}

// Address model
export interface Address {
  country: string;
  state?: string;
  city?: string;
  postalCode?: string;
  street?: string;
}

// Contact model
export interface Contact {
  address: Address;
  email?: string;
  phone?: string;
}

// Main Shopper model
export interface Shopper {
  contact: Contact;
  createdAt: string; // ISO date string
  customerId: string;
  customerType: string | null;
  locale: string;
  spendTotal13MonthUSD: number;
  updatedAt: string; // ISO date string
  subscriptions: Subscription[];
}

// API Response wrapper
export interface ShopperApiResponse {
  data: {
    shopper: Shopper;
  };
}

// Customer Info model (for backward compatibility)
export interface CustomerInfo {
  customerId: string;
  contact: Contact;
  locale: string;
  spendTotal13MonthUSD: number;
  createdAt: string;
  updatedAt: string;
}
