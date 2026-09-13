import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/config/getSiteConfig";
import { ThemeStyleInjector } from "@/lib/theme/ThemeStyleInjector";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { WhatsAppFAB } from "@/components/features/WhatsAppFAB";
import { Toaster } from "sonner";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  return {
    title: { default: site.seo.default_title || site.store_name, template: `%s | ${site.store_name}` },
    description: site.seo.default_description || site.tagline || undefined,
    keywords: site.seo.default_keywords || [],
    icons: site.favicon_url ? [{ url: site.favicon_url }] : undefined,
    openGraph: {
      siteName: site.store_name,
      images: site.og_image_url ? [site.og_image_url] : [],
    },
    verification: site.seo.google_site_verification
      ? { google: site.seo.google_site_verification }
      : undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteConfig();

  return (
    <html lang="en" className={site.theme.mode_default === "dark" ? "dark" : ""}>
      <head>
        <ThemeStyleInjector theme={site.theme} />
        {/* Google Fonts loaded dynamically based on admin's font choice */}
        <link
          href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(
            site.theme.fonts.heading
          )}:wght@400;600;700&family=${encodeURIComponent(
            site.theme.fonts.body
          )}:wght@400;500;600&display=swap`}
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-text font-body antialiased">
        <SiteHeader site={site} />
        <main className="min-h-screen">{children}</main>
        <SiteFooter site={site} />
        {site.features.whatsapp_enquiry && site.contact.whatsapp && (
          <WhatsAppFAB number={site.contact.whatsapp} />
        )}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
