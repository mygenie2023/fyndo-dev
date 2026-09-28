import { SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Section } from "@/components/site/Section";
import { AppCTA } from "@/components/site/Sections";
import { useI18n } from "@/i18n/website/provider";

export default function AboutPage() {
  const t = useI18n().t;

  return (
    <SiteLayout>
      <Section className="hero-wash pt-10 pb-4">
        <Breadcrumbs
          items={[
            {
              label: t("pages.about.breadcrumb.home"),
              to: "/",
            },
            {
              label: t("pages.about.breadcrumb.current"),
            },
          ]}
        />

        <div className="mt-6 max-w-3xl">
          <h1 className="text-4xl leading-[1.05] font-extrabold sm:text-5xl">
            {t("pages.about.hero.title")}
          </h1>
        </div>
      </Section>

      <Section className="pt-8">
        <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-muted-foreground">
          <p>{t("pages.about.body.p1")}</p>
          <p>{t("pages.about.body.p2")}</p>
          <p>{t("pages.about.body.p3")}</p>

          <h2 className="pt-2 font-display text-2xl font-extrabold text-foreground">
            {t("pages.about.body.heading")}
          </h2>

          <p>{t("pages.about.body.p4")}</p>
          <p>{t("pages.about.body.p5")}</p>

          <p className="font-display text-xl font-bold text-foreground">
            {t("pages.about.body.slogan")}
          </p>
        </div>
      </Section>

      <AppCTA source="about_cta" />
    </SiteLayout>
  );
}
