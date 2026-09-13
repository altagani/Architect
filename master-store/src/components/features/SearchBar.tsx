"use client";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Production version should debounce + hit a /api/search route that runs
// `products.search_vector @@ websearch_to_tsquery(...)` plus trigram fallback.
export function SearchBar() {
  const [q, setQ] = useState("");
  const router = useRouter();
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(`/search?q=${encodeURIComponent(q)}`); }}
      className="relative"
    >
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search laptops, phones, parts..."
        className="w-full pl-9 pr-3 py-2 text-sm bg-surface border border-border rounded-theme focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </form>
  );
}
