"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, GitCompare, BatteryMedium } from "lucide-react";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { useCompare } from "@/lib/hooks/useCompare";
import { formatCurrency } from "@/lib/utils/currency";

const GRADE_LABEL: Record<string, { label: string; className: string }> = {
  new: { label: "New", className: "bg-success/10 text-success" },
  like_new: { label: "Like New", className: "bg-success/10 text-success" },
  excellent: { label: "Excellent", className: "bg-secondary/10 text-secondary" },
  good: { label: "Good", className: "bg-accent/10 text-accent" },
  fair: { label: "Fair", className: "bg-warning/10 text-warning" },
};

export type ProductCardData = {
  id: string; slug: string; name: string; brand: string | null;
  price: number; compare_at_price: number | null;
  condition_grade: keyof typeof GRADE_LABEL;
  battery_health_percent: number | null;
  warranty_months: number;
  thumbnail_url: string | null;
  in_stock: boolean;
};

export function ProductCard({ product, currencySymbol }: { product: ProductCardData; currencySymbol: string }) {
  const { isWishlisted, toggle: toggleWishlist } = useWishlist(product.id);
  const { isComparing, toggle: toggleCompare } = useCompare(product.id);
  const grade = GRADE_LABEL[product.condition_grade] ?? GRADE_LABEL.good;
  const discountPct = product.compare_at_price
    ? Math.round(100 - (product.price / product.compare_at_price) * 100)
    : null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-surface border border-border rounded-theme overflow-hidden"
    >
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        <span className={`text-xs font-medium px-2 py-1 rounded-theme ${grade.className}`}>{grade.label}</span>
        {discountPct !== null && discountPct > 0 && (
          <span className="text-xs font-medium px-2 py-1 rounded-theme bg-danger/10 text-danger">
            -{discountPct}%
          </span>
        )}
      </div>

      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => toggleWishlist()}
          aria-label="Toggle wishlist"
          className="p-2 rounded-full bg-background/90 backdrop-blur hover:scale-110 transition-transform"
        >
          <Heart size={16} className={isWishlisted ? "fill-danger text-danger" : "text-text"} />
        </button>
        <button
          onClick={() => toggleCompare()}
          aria-label="Toggle compare"
          className="p-2 rounded-full bg-background/90 backdrop-blur hover:scale-110 transition-transform"
        >
          <GitCompare size={16} className={isComparing ? "text-secondary" : "text-text"} />
        </button>
      </div>

      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square bg-background">
          {product.thumbnail_url ? (
            <Image
              src={product.thumbnail_url}
              alt={product.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted text-sm">No image</div>
          )}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <span className="text-sm font-medium text-muted">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 space-y-1.5">
          {product.brand && <p className="text-xs text-muted">{product.brand}</p>}
          <h3 className="font-medium text-sm sm:text-base leading-snug line-clamp-2">{product.name}</h3>

          <div className="flex items-center gap-2 flex-wrap text-xs text-muted">
            {product.battery_health_percent !== null && (
              <span className="inline-flex items-center gap-1">
                <BatteryMedium size={13} /> {product.battery_health_percent}% health
              </span>
            )}
            {product.warranty_months > 0 && <span>· {product.warranty_months}mo warranty</span>}
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-semibold text-base sm:text-lg">
              {formatCurrency(product.price, currencySymbol)}
            </span>
            {product.compare_at_price && (
              <span className="text-xs text-muted line-through">
                {formatCurrency(product.compare_at_price, currencySymbol)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
