import { HeroSection } from "./HeroSection";
import { CategoryGridSection } from "./CategoryGridSection";
import { FeaturedProductsSection } from "./FeaturedProductsSection";
import { BannerStripSection } from "./BannerStripSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { BrandLogosSection } from "./BrandLogosSection";
import { NewsletterSection } from "./NewsletterSection";
import { RichTextSection } from "./RichTextSection";
import { CountdownOfferSection } from "./CountdownOfferSection";
import { MapSection } from "./MapSection";
import { FaqSection } from "./FaqSection";
import { CustomHtmlSection } from "./CustomHtmlSection";

export type PageSection = {
  id: string;
  type: string;
  props: Record<string, any>;
  sort_order: number;
  is_visible: boolean;
};

// Registry pattern: every section type the admin can add lives here.
// This is the ONLY file that needs to know all section types exist —
// individual section components stay dumb and only care about their own props.
const REGISTRY: Record<string, React.ComponentType<{ props: any }>> = {
  hero: HeroSection,
  category_grid: CategoryGridSection,
  featured_products: FeaturedProductsSection,
  banner_strip: BannerStripSection,
  testimonials: TestimonialsSection,
  brand_logos: BrandLogosSection,
  newsletter: NewsletterSection,
  rich_text: RichTextSection,
  countdown_offer: CountdownOfferSection,
  map: MapSection,
  faq: FaqSection,
  custom_html: CustomHtmlSection,
};

export function SectionRenderer({ section }: { section: PageSection }) {
  const Component = REGISTRY[section.type];
  if (!Component) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div className="p-4 bg-danger/10 text-danger text-sm">
          Unknown section type: &quot;{section.type}&quot; — check page_sections.type
        </div>
      );
    }
    return null; // silently skip unknown sections in production
  }
  return <Component props={section.props} />;
}
