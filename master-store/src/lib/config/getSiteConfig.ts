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

// `cache()` de-dupes this fetch across every Server Component that needs it
// during a single request — layout, page, and any nested section all call
// getSiteConfig() freely without triggering repeat DB round-trips.
export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  const supabase = createClient();
  const { data, error } = await supabase.from("site_settings").select("*").single();

  if (error || !data) {
    // Fail-safe defaults so a misconfigured store never shows a blank/broken page
    throw new Error("site_settings row missing — run supabase/schema.sql seed section");
  }
  return data as unknown as SiteConfig;
});

// Radius token -> actual CSS value, kept out of the DB so it's future-proof
export const RADIUS_MAP: Record<SiteTheme["radius"], string> = {
  none: "0px", sm: "4px", md: "8px", lg: "12px", xl: "20px", full: "999px",
};
