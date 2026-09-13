import Image from "next/image";
import Link from "next/link";
export function BannerStripSection({ props }: { props: { image_url: string; link_url?: string; alt?: string } }) {
  const img = <div className="relative w-full aspect-[16/5] sm:aspect-[16/3]"><Image src={props.image_url} alt={props.alt ?? ""} fill className="object-cover" /></div>;
  return (
    <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {props.link_url ? <Link href={props.link_url}>{img}</Link> : img}
    </section>
  );
}
