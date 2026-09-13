import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export type ThemeColors = {
  primary: string; secondary: string; accent: string; background: string;
  surface: string; text: string; muted: string; border: string;
  success: string; warning: string; danger: string;
};

export type SiteTheme = {
  mode_default: "light" | "dark";
  allow_mode_toggle: boolean;
  colors: { light: ThemeColors; dark: ThemeColors };
  fonts: { heading: string; body: string; mono: string };
  radius: "none" | "sm" | "md" | "lg" | "xl" | "full";
  button_style: "solid" | "outline" | "soft";
  container_width: string;
};

export type SiteConfig = {
  store_name: string;
  tagline: string | null;
  logo_url: string | null;
  logo_dark_url: string | null;
  favicon_url: string | null;
  og_image_url: string | null;
  theme: SiteTheme;
  contact: Record<string, any>;
  seo: Record<string, any>;
  features: Record<string, boolean>;
  checkout: Record<string, any>;
};

const DEFAULT_SITE_CONFIG: SiteConfig = {
  store_name: "My Store",
  tagline: null,
  logo_url: null,
  logo_dark_url: null,
  favicon_url: null,
  og_image_url: null,
  theme: {
    mode_default: "light",
    allow_mode_toggle: true,
    colors: {
      light: {
        primary: "#111827", secondary: "#2563eb", accent: "#f59e0b", background: "#ffffff",
        surface: "#f8fafc", text: "#0f172a", muted: "#64748b", border: "#e2e8f0",
        success: "#16a34a", warning: "#d97706", danger: "#dc2626",
      },
      dark: {
        primary: "#f8fafc", secondary: "#60a5fa", accent: "#fbbf24", background: "#0b0f19",
        surface: "#111827", text: "#f1f5f9", muted: "#94a3b8", border: "#1f2937",
        success: "#22c55e", warning: "#f59e0b", danger: "#ef4444",
      },
    },
    fonts: { heading: "Poppins", body: "Inter", mono: "JetBrains Mono" },
    radius: "lg",
    button_style: "solid",
    container_width: "1280px",
  },
  contact: { phone: "", whatsapp: "", email: "", address: "", socials: {} },
  seo: { default_title: "", default_description: "", default_keywords: [], google_site_verification: "" },
  features: {
    wishlist: true, compare: true, reviews: true, coupons: true, emi_calculator: true,
    bundle_builder: true, trade_in: true, repair_booking: true, warranty_checker: true,
    whatsapp_enquiry: true, "3d_models": true, live_chat: false,
  },
  checkout: {
    currency: "INR", currency_symbol: "INR", tax_percent: 0, cod_enabled: true,
    online_payment_enabled: true, payment_provider: "razorpay", free_shipping_threshold: null,
    flat_shipping_fee: 0,
  },
};

// `cache()` de-dupes this fetch across every Server Component that needs it
// during a single request — layout, page, and any nested section all call
// getSiteConfig() freely without triggering repeat DB round-trips.
export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  const supabase = createClient();
  const { data, error } = await supabase.from("site_settings").select("*").single();

  if (error || !data) {
    return DEFAULT_SITE_CONFIG;
  }
  return data as unknown as SiteConfig;
});

// Radius token -> actual CSS value, kept out of the DB so it's future-proof
export const RADIUS_MAP: Record<SiteTheme["radius"], string> = {
  none: "0px", sm: "4px", md: "8px", lg: "12px", xl: "20px", full: "999px",
};
