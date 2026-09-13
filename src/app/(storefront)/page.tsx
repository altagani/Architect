import { createClient } from "@/lib/supabase/server";
import { SectionRenderer } from "@/components/sections/SectionRenderer";

export const revalidate = 60; // ISR: homepage edits in admin appear within a minute,
                               // without a redeploy. Drop to 0 for fully live edits
                               // at the cost of a DB hit per request.

export default async function HomePage() {
  const supabase = createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("id")
    .eq("slug", "home")
    .single();

  if (!page) return null;

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
