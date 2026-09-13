"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, Plus, Settings2 } from "lucide-react";
import { toast } from "sonner";

type Section = { id: string; type: string; is_visible: boolean; sort_order: number; props: Record<string, any> };

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Banner", category_grid: "Category Grid", featured_products: "Featured Products",
  banner_strip: "Banner Strip", testimonials: "Testimonials", brand_logos: "Brand Logos",
  newsletter: "Newsletter Signup", rich_text: "Rich Text Block", countdown_offer: "Countdown Offer",
  map: "Store Location Map", faq: "FAQ", custom_html: "Custom HTML",
};

function SortableRow({ section, onToggle, onEdit }: { section: Section; onToggle: () => void; onEdit: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-3 p-3 bg-surface border border-border rounded-theme"
    >
      <button {...attributes} {...listeners} className="cursor-grab text-muted"><GripVertical size={18} /></button>
      <span className="flex-1 font-medium text-sm">{SECTION_LABELS[section.type] ?? section.type}</span>
      <button onClick={onEdit} className="p-1.5 hover:bg-background rounded-theme"><Settings2 size={16} /></button>
      <button onClick={onToggle} className="p-1.5 hover:bg-background rounded-theme">
        {section.is_visible ? <Eye size={16} /> : <EyeOff size={16} className="text-muted" />}
      </button>
    </div>
  );
}

export default function HomepageBuilderPage() {
  const supabase = createClient();
  const [sections, setSections] = useState<Section[]>([]);
  const [pageId, setPageId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: page } = await supabase.from("pages").select("id").eq("slug", "home").single();
      if (!page) return;
      setPageId(page.id);
      const { data } = await supabase.from("page_sections").select("*").eq("page_id", page.id).order("sort_order");
      setSections(data ?? []);
    })();
  }, []);

  async function persistOrder(next: Section[]) {
    setSections(next);
    const updates = next.map((s, i) => ({ id: s.id, sort_order: i }));
    for (const u of updates) {
      await supabase.from("page_sections").update({ sort_order: u.sort_order }).eq("id", u.id);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    persistOrder(arrayMove(sections, oldIndex, newIndex));
  }

  async function toggleVisible(section: Section) {
    const updated = { ...section, is_visible: !section.is_visible };
    setSections((prev) => prev.map((s) => (s.id === section.id ? updated : s)));
    await supabase.from("page_sections").update({ is_visible: updated.is_visible }).eq("id", section.id);
  }

  async function addSection(type: string) {
    if (!pageId) return;
    const { data, error } = await supabase
      .from("page_sections")
      .insert({ page_id: pageId, type, props: {}, sort_order: sections.length, is_visible: true })
      .select()
      .single();
    if (error) return toast.error("Could not add section");
    setSections((prev) => [...prev, data]);
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-heading font-semibold">Homepage Layout</h1>
        <p className="text-sm text-muted mt-1">Drag to reorder. Toggle visibility. Click the gear to edit content.</p>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sections.map((s) => (
              <SortableRow key={s.id} section={s} onToggle={() => toggleVisible(s)} onEdit={() => {}} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
        {Object.entries(SECTION_LABELS).map(([type, label]) => (
          <button
            key={type}
            onClick={() => addSection(type)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-border rounded-theme hover:bg-surface"
          >
            <Plus size={12} /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}
