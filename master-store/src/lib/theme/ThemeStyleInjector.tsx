import { SiteTheme, RADIUS_MAP } from "@/lib/config/getSiteConfig";

function hexToRgbTriplet(hex: string): string {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
  return `${r} ${g} ${b}`;
}

function buildVarBlock(colors: SiteTheme["colors"]["light"]) {
  return Object.entries(colors)
    .map(([key, hex]) => `--color-${key}: ${hexToRgbTriplet(hex)};`)
    .join("\n");
}

// Rendered once in the root layout (Server Component — no hydration flash).
// Produces a small <style> tag scoping light-mode vars to :root and
// dark-mode vars to `.dark`, matching Tailwind's darkMode:"class" config.
export function ThemeStyleInjector({ theme }: { theme: SiteTheme }) {
  const css = `
    :root {
      ${buildVarBlock(theme.colors.light)}
      --font-heading: '${theme.fonts.heading}', sans-serif;
      --font-body: '${theme.fonts.body}', sans-serif;
      --font-mono: '${theme.fonts.mono}', monospace;
      --radius: ${RADIUS_MAP[theme.radius]};
      --container-width: ${theme.container_width};
    }
    .dark {
      ${buildVarBlock(theme.colors.dark)}
    }
  `;
  return <style id="theme-vars" dangerouslySetInnerHTML={{ __html: css }} />;
}
