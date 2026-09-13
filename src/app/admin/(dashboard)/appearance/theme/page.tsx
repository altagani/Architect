"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SiteTheme } from "@/lib/config/getSiteConfig";
import { toast } from "sonner";

const COLOR_KEYS: (keyof SiteTheme["colors"]["light"])[] = [
  "primary", "secondary", "accent", "background", "surface",
  "text", "muted", "border", "success", "warning", "danger",
];

const GOOGLE_FONTS = ["Inter", "Poppins", "Roboto", "Montserrat", "Playfair Display", "Space Grotesk", "Nunito", "Work Sans"];

export default function ThemeCustomizerPage() {
  const supabase = createClient();
  const [theme, setTheme] = useState<SiteTheme | null>(null);
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("theme").single().then(({ data }) => {
      if (data) setTheme(data.theme as SiteTheme);
    });
  }, []);

  if (!theme) return <div className="p-6 text-muted">Loading theme...</div>;

  function updateColor(key: string, value: string) {
    setTheme((prev) =>
      prev ? { ...prev, colors: { ...prev.colors, [mode]: { ...prev.colors[mode], [key]: value } } } : prev
    );
  }

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("site_settings").update({ theme }).eq("id", true);
    setSaving(false);
    if (error) toast.error("Failed to save theme");
    else toast.success("Theme updated — live for all visitors");
  }

  return (
    <div className="p-6 max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-heading font-semibold">Theme & Branding</h1>
        <p className="text-sm text-muted mt-1">
          Changes apply instantly across the storefront — no redeploy needed.
        </p>
      </div>

      <div className="flex gap-2">
        {(["light", "dark"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-theme text-sm border ${
              mode === m ? "bg-primary text-background border-primary" : "border-border"
            }`}
          >
            {m === "light" ? "Light mode colors" : "Dark mode colors"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {COLOR_KEYS.map((key) => (
          <label key={key} className="flex flex-col gap-1.5 text-sm">
            <span className="capitalize text-muted">{key}</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.colors[mode][key]}
                onChange={(e) => updateColor(key, e.target.value)}
                className="w-9 h-9 rounded-theme border border-border cursor-pointer"
              />
              <input
                type="text"
                value={theme.colors[mode][key]}
                onChange={(e) => updateColor(key, e.target.value)}
                className="flex-1 min-w-0 px-2 py-1.5 border border-border rounded-theme text-xs font-mono"
              />
            </div>
          </label>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {(["heading", "body", "mono"] as const).map((slot) => (
          <label key={slot} className="flex flex-col gap-1.5 text-sm">
            <span className="capitalize text-muted">{slot} font</span>
            <select
              value={theme.fonts[slot]}
              onChange={(e) => setTheme({ ...theme, fonts: { ...theme.fonts, [slot]: e.target.value } })}
              className="px-2 py-1.5 border border-border rounded-theme"
            >
              {GOOGLE_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted">Corner radius</span>
          <select
            value={theme.radius}
            onChange={(e) => setTheme({ ...theme, radius: e.target.value as SiteTheme["radius"] })}
            className="px-2 py-1.5 border border-border rounded-theme"
          >
            {["none", "sm", "md", "lg", "xl", "full"].map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted">Allow visitors to toggle dark mode</span>
          <input
            type="checkbox"
            checked={theme.allow_mode_toggle}
            onChange={(e) => setTheme({ ...theme, allow_mode_toggle: e.target.checked })}
            className="w-5 h-5"
          />
        </label>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="px-6 py-2.5 bg-primary text-background rounded-theme font-medium disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save & Publish"}
      </button>
    </div>
  );
}
