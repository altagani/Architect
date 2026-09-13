import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";

export async function CategoryGridSection({ props }: { props: { title?: string; limit?: number } }) {
  const supabase = createClient();
  const { data: categories } = await supabase
    .from("categories").select("*").eq("is_visible", true)
    .order("sort_order").limit(props.limit ?? 8);

  return (
    <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {props.title && <h2 className="font-heading text-2xl font-semibold mb-6">{props.title}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {(categories ?? []).map((cat) => (
          <Link key={cat.id} href={`/category/${cat.slug}`} className="flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-surface border border-border overflow-hidden relative group-hover:border-primary transition-colors">
              {cat.image_url && <Image src={cat.image_url} alt={cat.name} fill className="object-cover" />}
            </div>
            <span className="text-xs sm:text-sm text-center">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
