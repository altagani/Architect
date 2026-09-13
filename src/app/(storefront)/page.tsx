import { createClient } from "@/lib/supabase/server";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import Link from "next/link";
import { ArrowRight, BatteryCharging, ShieldCheck, Wrench } from "lucide-react";

export const revalidate = 60; // ISR: homepage edits in admin appear within a minute,
                               // without a redeploy. Drop to 0 for fully live edits
                               // at the cost of a DB hit per request.

function StorefrontFallback() {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface">
        <div className="max-w-container mx-auto grid gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
              Quality tech, better value
            </p>
            <h1 className="max-w-2xl font-heading text-4xl font-bold tracking-tight text-text sm:text-6xl">
              Refurbished devices ready for their next chapter.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
              Shop professionally tested electronics with transparent condition grades,
              reliable support, and prices that make sense.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-primary px-5 py-3 font-semibold text-background transition-opacity hover:opacity-90"
              >
                Explore devices <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                href="/trade-in"
                className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-border px-5 py-3 font-semibold text-text transition-colors hover:bg-background"
              >
                Trade in yours
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[var(--radius)] border border-border bg-background p-6">
              <ShieldCheck className="text-secondary" aria-hidden="true" />
              <h2 className="mt-4 font-heading text-xl font-semibold text-text">Tested with care</h2>
              <p className="mt-2 text-muted">Every device is checked before it reaches you.</p>
            </div>
            <div className="rounded-[var(--radius)] border border-border bg-background p-6">
              <BatteryCharging className="text-accent" aria-hidden="true" />
              <h2 className="mt-4 font-heading text-xl font-semibold text-text">Honest condition</h2>
              <p className="mt-2 text-muted">Clear grades and battery health, without guesswork.</p>
            </div>
            <div className="rounded-[var(--radius)] border border-border bg-background p-6">
              <Wrench className="text-success" aria-hidden="true" />
              <h2 className="mt-4 font-heading text-xl font-semibold text-text">Support after sale</h2>
              <p className="mt-2 text-muted">Help with setup, repairs, and making tech last longer.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="max-w-container mx-auto px-4 py-14 text-center sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl font-semibold text-text">Your storefront is ready to be configured</h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted">
          Add homepage sections and products from the admin area. Published content will replace this starter view automatically.
        </p>
        <Link href="/admin/appearance/homepage" className="mt-6 inline-flex items-center gap-2 font-semibold text-secondary hover:underline">
          Open homepage editor <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}

export default async function HomePage() {
  const supabase = createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("id")
    .eq("slug", "home")
    .single();

  if (!page) return <StorefrontFallback />;

  const { data: sections } = await supabase
    .from("page_sections")
    .select("*")
    .eq("page_id", page.id)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="flex flex-col gap-0">
      {(sections ?? []).map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
}
