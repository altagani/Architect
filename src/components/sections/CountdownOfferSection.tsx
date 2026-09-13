"use client";
import { useEffect, useState } from "react";
export function CountdownOfferSection({ props }: { props: { title: string; ends_at: string; link_url?: string } }) {
  const [left, setLeft] = useState("");
  useEffect(() => {
    const iv = setInterval(() => {
      const diff = new Date(props.ends_at).getTime() - Date.now();
      if (diff <= 0) return setLeft("Offer ended");
      const h = Math.floor(diff / 3.6e6), m = Math.floor((diff % 3.6e6) / 6e4), s = Math.floor((diff % 6e4) / 1000);
      setLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(iv);
  }, [props.ends_at]);
  return (
    <section className="bg-danger/10 py-6 text-center">
      <p className="font-medium">{props.title} — ends in {left}</p>
    </section>
  );
}
