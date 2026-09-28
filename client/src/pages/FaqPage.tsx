import { SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Section } from "@/components/site/Section";
import { AppCTA } from "@/components/site/Sections";
import { FaqList } from "@/components/site/Faq";
import { useI18n } from "@/i18n/website/provider";

export default function FaqPage() {
  const t = useI18n().t;

  return (
    <SiteLayout>
      <Section className="hero-wash pt-10 pb-4">
        <Breadcrumbs
          items={[
            {
              label: t("extra.faq.breadcrumb.home"),
              to: "/",
            },
            {
              label: t("extra.faq.breadcrumb.faq"),
            },
          ]}
        />

        <div className="mt-6 max-w-3xl">
          <h1 className="text-4xl leading-[1.05] font-extrabold sm:text-5xl">
            {t("extra.faq.heading")}
          </h1>
        </div>
      </Section>

      <Section className="pt-8">
        <FaqList />
      </Section>

      <AppCTA source="faq_cta" />
    </SiteLayout>
  );
}
