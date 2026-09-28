import { SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Section } from "@/components/site/Section";
import { SEO } from "@/components/site/SEO";
import { useI18n } from "@/i18n/website/provider";

export default function PrivacyPage() {
  const t = useI18n().t;

  return (
    <SiteLayout>
      <SEO
        title="FYNDO Privacy Policy | Local Jobs & Services"
        description="Read the FYNDO privacy policy and learn how information is handled when using the FYNDO website and services."
        path="/privacy"
      />

      <Section>
        <Breadcrumbs
          items={[
            {
              label: t("extra.privacy.breadcrumb.home"),
              to: "/",
            },
            {
              label: t("extra.privacy.breadcrumb.privacy"),
            },
          ]}
        />

        <div className="mx-auto mt-8 max-w-3xl space-y-5 text-sm leading-relaxed text-muted-foreground">
          <h1 className="font-display text-4xl font-extrabold text-foreground">
            {t("extra.privacy.heading")}
          </h1>

          <p>{t("extra.privacy.intro")}</p>

          <h2 className="pt-3 font-display text-xl font-bold text-foreground">
            {t("extra.privacy.deviceHeading")}
          </h2>

          <p>{t("extra.privacy.deviceBody")}</p>

          <h2 className="pt-3 font-display text-xl font-bold text-foreground">
            {t("extra.privacy.sentHeading")}
          </h2>

          <p>{t("extra.privacy.sentBody")}</p>

          <h2 className="pt-3 font-display text-xl font-bold text-foreground">
            {t("extra.privacy.analyticsHeading")}
          </h2>

          <p>{t("extra.privacy.analyticsBody")}</p>

          <h2 className="pt-3 font-display text-xl font-bold text-foreground">
            {t("extra.privacy.contactHeading")}
          </h2>

          <p>{t("extra.privacy.contactBody")}</p>
        </div>
      </Section>
    </SiteLayout>
  );
}