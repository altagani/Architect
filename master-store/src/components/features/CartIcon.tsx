"use client";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
// Wire to a zustand cart store or `cart_items` count query in production.
export function CartIcon() {
  return (
    <Link href="/cart" className="relative p-2" aria-label="Cart">
      <ShoppingCart size={20} />
    </Link>
  );
}
