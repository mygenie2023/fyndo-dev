import { useI18n } from "@/i18n/website/provider";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MarketplaceVisual } from "@/components/site/MarketplaceVisual";
import { SEO } from "@/components/site/SEO";

import { ButtonLink, OpenAppButton } from "@/components/ui/cta";
import {
  AppCTA,
  CategoriesSection,
  HowItWorksSection,
  NearbySection,
  ProblemSection,
  TrustSection,
  TwoSidedSection,
} from "@/components/site/Sections";

function Hero() {
  const t = useI18n().t;

  return (
    <section className="hero-wash relative overflow-hidden pt-10 pb-16 sm:pt-14 lg:pt-16 lg:pb-24">
      <div className="container-page grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-primary">
            <span
              className="size-1.5 rounded-full bg-accent"
              aria-hidden="true"
            />
            {t("home.hero.badge")}
          </span>

          <h1 className="mt-5 text-[2.4rem] leading-[1.03] font-extrabold sm:text-6xl lg:text-[4.1rem]">
            {t("home.hero.title")}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("home.hero.subtitle")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <OpenAppButton source="hero" size="lg" />

            <ButtonLink
              to="/how-it-works"
              variant="outline"
              size="lg"
            >
              {t("home.hero.exploreHow")}
            </ButtonLink>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <ButtonLink
              to="/for-work-providers"
              variant="outline"
              className="h-auto justify-start rounded-2xl px-5 py-4 text-left"
            >
              <span>
                <span className="block font-display text-base font-bold">
                  {t("home.hero.needWork.title")}
                </span>

                <span className="block text-xs font-normal text-muted-foreground">
                  {t("home.hero.needWork.body")}
                </span>
              </span>
            </ButtonLink>

            <ButtonLink
              to="/for-operators"
              variant="outline"
              className="h-auto justify-start rounded-2xl px-5 py-4 text-left"
            >
              <span>
                <span className="block font-display text-base font-bold">
                  {t("home.hero.offerSkills.title")}
                </span>

                <span className="block text-xs font-normal text-muted-foreground">
                  {t("home.hero.offerSkills.body")}
                </span>
              </span>
            </ButtonLink>
          </div>
        </div>

        <MarketplaceVisual />
      </div>
    </section>
  );
}

export default function PublicHome() {
  return (
    <>
      <SEO
        title="FYNDO - Local Jobs & Services Near You"
        description="Find trusted local workers and service providers near you with FYNDO. Connect for agriculture, home, repair, rental, labour and other everyday services."
        path="/"
      />

      <SiteLayout>
        <Hero />
        <ProblemSection />
        <TwoSidedSection />
        <HowItWorksSection />
        <CategoriesSection />
        <NearbySection />
        <TrustSection />
        <AppCTA source="home_final_cta" />
      </SiteLayout>
    </>
  );
}