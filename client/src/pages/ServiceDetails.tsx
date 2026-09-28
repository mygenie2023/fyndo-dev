import { Link, useRoute } from "wouter";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Reveal, Section, SectionHeading } from "@/components/site/Section";
import { AppCTA, TrustSection } from "@/components/site/Sections";
import { OpenAppButton } from "@/components/ui/cta";
import { useI18n } from "@/i18n/website/provider";
import {
  useService,
  useServices,
} from "@/i18n/website/taxonomy";

function fill(template: string, name: string) {
  return template.replaceAll("{name}", name);
}

function ServiceNotFound() {
  const t = useI18n().t;

  return (
    <SiteLayout>
      <Section>
        <h1 className="text-3xl font-extrabold">
          {t("services.service.notFound.title")}
        </h1>

        <p className="mt-3 text-muted-foreground">
          {t("services.service.notFound.body")}
        </p>

        <Link
          href="/services"
          className="mt-6 inline-block font-semibold text-primary"
        >
          {t("services.service.notFound.cta")}
        </Link>
      </Section>
    </SiteLayout>
  );
}

export default function ServiceDetailsPage() {
  const [, params] = useRoute("/services/:service");
const slug = params?.service ?? "";

  const { t } = useI18n();
  const service = useService(slug);

  const related = useServices()
    .filter((item) => item.slug !== slug)
    .slice(0, 3);

  if (!service) {
  return <ServiceNotFound />;
}

  return (
    <SiteLayout>
      <Section className="hero-wash pt-10 pb-4">
        <Breadcrumbs
          items={[
            {
              label: t("common.nav.home"),
              to: "/",
            },
            {
              label: t("common.footer.links.services"),
              to: "/services",
            },
            {
              label: service.name,
            },
          ]}
        />

        <div className="mt-6 max-w-3xl">
          <p className="text-sm font-semibold text-primary">
            {service.category}
          </p>

          <h1 className="mt-2 text-4xl leading-[1.05] font-extrabold sm:text-5xl">
            {fill(
              t("services.service.hero.findNear"),
              service.name,
            )}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {service.summary}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <OpenAppButton
              source={`service_${service.slug}`}
              size="lg"
            />
          </div>
        </div>
      </Section>

      <Section className="pt-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <article className="surface-card h-full p-7">
              <h2 className="text-2xl font-extrabold">
                {fill(
                  t("services.service.covers.title"),
                  service.name,
                )}
              </h2>

              <ul className="mt-5 space-y-2.5">
                {service.covers.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2.5 text-sm"
                  >
                    <span
                      aria-hidden="true"
                      className="text-primary"
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>

          <Reveal delay={110}>
            <article className="surface-card h-full p-7">
              <h2 className="text-2xl font-extrabold">
                {t("services.service.when.title")}
              </h2>

              <ul className="mt-5 space-y-2.5">
                {service.whenYouNeed.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2.5 text-sm"
                  >
                    <span
                      aria-hidden="true"
                      className="text-accent-foreground"
                    >
                      •
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        </div>
      </Section>

      <Section className="bg-secondary/40 pt-4">
        <SectionHeading
          align="left"
          eyebrow={t("services.service.onFyndo.eyebrow")}
          title={fill(
            t("services.service.onFyndo.title"),
            service.name,
          )}
          description={fill(
            t("services.service.onFyndo.description"),
            service.name,
          )}
        />
      </Section>

      <TrustSection />

      <Section className="pt-0">
        <h2 className="text-2xl font-extrabold">
          {t("services.service.other.title")}
        </h2>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {related.map((item) => (
            <Link
              key={item.slug}
              href={`/services/${item.slug}`}
              className="surface-card p-5 transition-transform duration-300 hover:-translate-y-1"
            >
              <h3 className="font-display font-bold">
                {item.name}
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                {item.category}
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <AppCTA source={`service_${service.slug}_cta`} />
    </SiteLayout>
  );
}
