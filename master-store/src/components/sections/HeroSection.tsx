"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

type HeroProps = {
  headline: string;
  subheadline?: string;
  cta_text?: string;
  cta_link?: string;
  background_image_url?: string;
  background_video_url?: string;
  overlay_opacity?: number; // 0-1, admin controlled for legibility over any image
};

export function HeroSection({ props }: { props: HeroProps }) {
  const overlay = props.overlay_opacity ?? 0.35;

  return (
    <section className="relative overflow-hidden min-h-[70vh] flex items-center">
      {props.background_video_url ? (
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src={props.background_video_url}
        />
      ) : props.background_image_url ? (
        <Image
          src={props.background_image_url}
          alt=""
          fill
          priority
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-surface to-secondary/10" />
      )}
      <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} />

      <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white max-w-2xl"
        >
          {props.headline}
        </motion.h1>
        {props.subheadline && (
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-lg text-white/90 max-w-xl"
          >
            {props.subheadline}
          </motion.p>
        )}
        {props.cta_text && props.cta_link && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              href={props.cta_link}
              className="inline-block mt-8 px-8 py-3 bg-primary text-background font-medium rounded-theme
                         hover:opacity-90 active:scale-95 transition-all"
            >
              {props.cta_text}
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
