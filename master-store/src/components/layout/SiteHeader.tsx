import Link from "next/link";
import Image from "next/image";
import type { SiteConfig } from "@/lib/config/getSiteConfig";
import { CartIcon } from "@/components/features/CartIcon";
import { SearchBar } from "@/components/features/SearchBar";

// Nav links come from `nav_menus` (location='header') in production —
// simplified here to keep the scaffold readable.
export function SiteHeader({ site }: { site: SiteConfig }) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {site.logo_url ? (
            <Image src={site.logo_url} alt={site.store_name} width={36} height={36} className="object-contain" />
          ) : (
            <span className="font-heading font-bold text-lg">{site.store_name}</span>
          )}
        </Link>
        <div className="flex-1 hidden sm:block"><SearchBar /></div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/products">Shop</Link>
          <Link href="/trade-in">Trade-In</Link>
          <Link href="/repair-booking">Repairs</Link>
          <Link href="/wishlist">Wishlist</Link>
        </nav>
        <CartIcon />
      </div>
      <div className="sm:hidden px-4 pb-3"><SearchBar /></div>
    </header>
  );
}
