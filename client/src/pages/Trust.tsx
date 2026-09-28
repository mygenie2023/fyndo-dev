import { SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Section } from "@/components/site/Section";
import { AppCTA, TrustSection } from "@/components/site/Sections";
import { useI18n } from "@/i18n/website/provider";

export default function TrustPage() {
  const { t, tx } = useI18n();

  const safetyItems = tx<string[]>(
    "pages.trust.safety.items",
  );

  return (
    <SiteLayout>
      <Section className="hero-wash pt-10 pb-4">
        <Breadcrumbs
          items={[
            {
              label: t("pages.trust.breadcrumb.home"),
              to: "/",
            },
            {
              label: t("pages.trust.breadcrumb.current"),
            },
          ]}
        />

        <div className="mt-6 max-w-3xl">
          <h1 className="text-4xl leading-[1.05] font-extrabold sm:text-5xl">
            {t("pages.trust.hero.title")}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("pages.trust.hero.body")}
          </p>
        </div>
      </Section>

      <TrustSection />

      <Section className="bg-secondary/40 pt-4">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="text-2xl font-extrabold">
            {t("pages.trust.disclaimer.heading")}
          </h2>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("pages.trust.disclaimer.body")}
          </p>

          <h2 className="text-2xl font-extrabold">
            {t("pages.trust.safety.heading")}
          </h2>

          <ul className="space-y-2.5 text-sm leading-relaxed text-muted-foreground">
            {safetyItems.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </Section>

      <AppCTA source="trust_cta" />
    </SiteLayout>
  );
}
