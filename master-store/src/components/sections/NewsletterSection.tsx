"use client";
import { useState } from "react";
export function NewsletterSection({ props }: { props: { title?: string; subtitle?: string } }) {
  const [email, setEmail] = useState("");
  return (
    <section className="bg-surface py-12">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-heading text-2xl font-semibold">{props.title ?? "Stay in the loop"}</h2>
        {props.subtitle && <p className="text-muted mt-2">{props.subtitle}</p>}
        <form className="mt-6 flex max-w-md mx-auto gap-2" onSubmit={(e) => e.preventDefault()}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com"
            className="flex-1 px-4 py-2.5 border border-border rounded-theme bg-background" />
          <button className="px-5 py-2.5 bg-primary text-background rounded-theme font-medium">Subscribe</button>
        </form>
      </div>
    </section>
  );
}
