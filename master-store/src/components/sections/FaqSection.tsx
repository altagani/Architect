"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
export function FaqSection({ props }: { props: { title?: string; items: { q: string; a: string }[] } }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {props.title && <h2 className="font-heading text-2xl font-semibold mb-6">{props.title}</h2>}
      <div className="space-y-2 max-w-2xl">
        {(props.items ?? []).map((item, i) => (
          <div key={i} className="border border-border rounded-theme overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex justify-between items-center p-4 text-left text-sm font-medium">
              {item.q}
              <ChevronDown size={16} className={`transition-transform ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && <div className="px-4 pb-4 text-sm text-muted">{item.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
