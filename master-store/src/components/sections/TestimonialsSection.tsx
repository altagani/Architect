import { createClient } from "@/lib/supabase/server";
import { Star } from "lucide-react";

export async function TestimonialsSection({ props }: { props: { title?: string } }) {
  const supabase = createClient();
  const { data } = await supabase.from("testimonials").select("*").eq("is_visible", true).order("sort_order");
  return (
    <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {props.title && <h2 className="font-heading text-2xl font-semibold mb-6">{props.title}</h2>}
      <div className="grid sm:grid-cols-3 gap-4">
        {(data ?? []).map((t) => (
          <div key={t.id} className="p-4 border border-border rounded-theme bg-surface">
            {t.rating && (
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={14} className="fill-accent text-accent" />)}
              </div>
            )}
            <p className="text-sm">{t.quote}</p>
            <p className="text-xs text-muted mt-2">— {t.customer_name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
