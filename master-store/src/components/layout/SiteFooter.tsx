import Link from "next/link";
import type { SiteConfig } from "@/lib/config/getSiteConfig";

// Footer columns come from `nav_menus` (location='footer_col_*') — simplified here.
export function SiteFooter({ site }: { site: SiteConfig }) {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-10 grid sm:grid-cols-3 gap-8 text-sm">
        <div>
          <h3 className="font-heading font-semibold mb-2">{site.store_name}</h3>
          {site.tagline && <p className="text-muted">{site.tagline}</p>}
        </div>
        <div>
          <h4 className="font-medium mb-2">Company</h4>
          <ul className="space-y-1 text-muted">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/warranty-policy">Warranty Policy</Link></li>
            <li><Link href="/return-policy">Return Policy</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-2">Get in touch</h4>
          {site.contact.phone && <p className="text-muted">{site.contact.phone}</p>}
          {site.contact.email && <p className="text-muted">{site.contact.email}</p>}
          {site.contact.address && <p className="text-muted">{site.contact.address}</p>}
        </div>
      </div>
      <div className="text-center text-xs text-muted py-4 border-t border-border">
        © {new Date().getFullYear()} {site.store_name}. All rights reserved.
      </div>
    </footer>
  );
}
