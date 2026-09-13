import Image from "next/image";
export function BrandLogosSection({ props }: { props: { logos: { url: string; alt: string }[] } }) {
  return (
    <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-wrap items-center justify-center gap-8 opacity-70">
      {(props.logos ?? []).map((logo, i) => (
        <div key={i} className="relative w-24 h-10"><Image src={logo.url} alt={logo.alt} fill className="object-contain" /></div>
      ))}
    </section>
  );
}
