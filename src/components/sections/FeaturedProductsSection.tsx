import { createClient } from "@/lib/supabase/server";
import { getSiteConfig } from "@/lib/config/getSiteConfig";
import { ProductCard } from "@/components/product/ProductCard";

export async function FeaturedProductsSection({ props }: { props: { title?: string; limit?: number } }) {
  const supabase = createClient();
  const site = await getSiteConfig();
  const { data: products } = await supabase
    .from("products").select("*, product_media(url, sort_order)")
    .eq("is_active", true).eq("is_featured", true)
    .order("created_at", { ascending: false }).limit(props.limit ?? 8);

  return (
    <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {props.title && <h2 className="font-heading text-2xl font-semibold mb-6">{props.title}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {(products ?? []).map((p: any) => (
          <ProductCard
            key={p.id}
            currencySymbol={site.checkout.currency_symbol}
            product={{
              id: p.id, slug: p.slug, name: p.name, brand: p.brand,
              price: p.price, compare_at_price: p.compare_at_price,
              condition_grade: p.condition_grade, battery_health_percent: p.battery_health_percent,
              warranty_months: p.warranty_months, in_stock: p.stock_quantity > 0,
              thumbnail_url: p.product_media?.sort((a: any, b: any) => a.sort_order - b.sort_order)?.[0]?.url ?? null,
            }}
          />
        ))}
      </div>
    </section>
  );
}
