"use client";
import { MessageCircle } from "lucide-react";

export function WhatsAppFAB({ number }: { number: string }) {
  const cleaned = number.replace(/[^\d]/g, "");
  return (
    <a
      href={`https://wa.me/${cleaned}?text=${encodeURIComponent("Hi, I have a question about a product.")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full
                 bg-[#25D366] text-white shadow-lg hover:scale-105 active:scale-95 transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={26} fill="white" />
    </a>
  );
}
