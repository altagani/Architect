import { getSiteConfig } from "@/lib/config/getSiteConfig";
export async function MapSection() {
  const site = await getSiteConfig();
  const { map_lat, map_lng, address } = site.contact;
  if (!map_lat || !map_lng) return null;
  return (
    <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="aspect-video w-full rounded-theme overflow-hidden border border-border">
        <iframe
          className="w-full h-full"
          loading="lazy"
          src={`https://www.google.com/maps?q=${map_lat},${map_lng}&z=15&output=embed`}
        />
      </div>
      {address && <p className="text-sm text-muted mt-3">{address}</p>}
    </section>
  );
}
