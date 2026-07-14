import { PageMetaTags } from "@/components/seo/PageMetaTags";
import { Hero } from "@/components/sections/Hero";
import { Partners } from "@/components/sections/Partners";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { SolutionsGrid } from "@/components/sections/SolutionsGrid";
import { ImpactStats } from "@/components/sections/ImpactStats";
import { Testimonials } from "@/components/sections/Testimonials";
import { CTA } from "@/components/sections/CTA";
import { meta } from "@/content/site";

export function LandingPage() {
  return (
    <>
      <PageMetaTags title={meta.defaultTitle} description={meta.defaultDescription} />
      <Hero />
      <Partners />
      <ServicesGrid />
      <SolutionsGrid />
      <ImpactStats />
      <Testimonials />
      <CTA />
    </>
  );
}
