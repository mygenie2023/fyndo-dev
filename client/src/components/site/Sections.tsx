import { Link } from "wouter";
import { Reveal, Section, SectionHeading } from "./Section";
import { ButtonLink, OpenAppButton } from "@/components/ui/cta";
import { useCategories } from "@/i18n/website/taxonomy";
import { useI18n } from "@/i18n/website/provider";
import { track } from "@/lib/fyndo";
import { useEffect, useRef } from "react";

interface TitleBody {
  title: string;
  body: string;
}

/* -------------------------------------------------- problem / value prop */

export function ProblemSection() {
  const { t, tx } = useI18n();
  const problems = tx<readonly TitleBody[]>("home.problems.items");

  return (
    <Section className="bg-secondary/40">
      <SectionHeading
        eyebrow={t("home.problems.eyebrow")}
        title={t("home.problems.title")}
        description={t("home.problems.description")}
      />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {problems.map((p, i) => (
          <Reveal key={p.title} delay={i * 90}>
            <article className="surface-card h-full p-6">
              <span className="font-display text-4xl font-extrabold text-primary/25">
                0{i + 1}
              </span>
              <h3 className="mt-3 text-lg font-bold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
      <Reveal delay={200}>
        <div className="ink-panel mt-8 rounded-3xl p-8 text-center sm:p-12">
          <h3 className="text-2xl font-extrabold sm:text-3xl">{t("home.problems.fixTitle")}</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed opacity-85 sm:text-base">
            {t("home.problems.fixBody")}
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

/* ------------------------------------------------------- two-sided split */

function Ticks({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
      {items.map((s) => (
        <li key={s} className="flex items-start gap-2.5 text-sm">
          <span aria-hidden="true" className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
            <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="3.4">
              <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          {s}
        </li>
      ))}
    </ul>
  );
}

export function TwoSidedSection() {
  const { t, tx } = useI18n();
  const providerSteps = tx<readonly string[]>("home.twoSided.provider.steps");
  const operatorSteps = tx<readonly string[]>("home.twoSided.operator.steps");

  return (
    <Section id="two-sided">
      <SectionHeading
        eyebrow={t("home.twoSided.eyebrow")}
        title={t("home.twoSided.title")}
        description={t("home.twoSided.description")}
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <article className="surface-card flex h-full flex-col p-7 sm:p-9">
            <span className="text-xs font-bold tracking-wider text-primary uppercase">
              {t("home.twoSided.provider.label")}
            </span>
            <h3 className="mt-3 text-2xl font-extrabold sm:text-3xl">
              {t("home.twoSided.provider.title")}
            </h3>
            <Ticks items={providerSteps} />
            <div className="mt-8 flex flex-wrap gap-3">
              <OpenAppButton source="two_sided_provider" />
              <ButtonLink to="/for-work-providers" variant="outline">
                {t("common.cta.learnMore")}
              </ButtonLink>
            </div>
          </article>
        </Reveal>

        <Reveal delay={120}>
          <article className="surface-card flex h-full flex-col border-accent/40 bg-accent-soft/50 p-7 sm:p-9">
            <span className="text-xs font-bold tracking-wider text-accent-foreground uppercase">
              {t("home.twoSided.operator.label")}
            </span>
            <h3 className="mt-3 text-2xl font-extrabold sm:text-3xl">
              {t("home.twoSided.operator.title")}
            </h3>
            <Ticks items={operatorSteps} />
            <div className="mt-8 flex flex-wrap gap-3">
              <OpenAppButton
                source="two_sided_operator"
                label={t("common.cta.joinFyndo")}
                variant="accent"
              />
              <ButtonLink to="/for-operators" variant="outline">
                {t("common.cta.learnMore")}
              </ButtonLink>
            </div>
          </article>
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------ how it works */

interface Step {
  n: string;
  title: string;
  body: string;
}

export function HowItWorksSection() {
  const { t, tx } = useI18n();
  const steps = tx<readonly Step[]>("home.howItWorks.steps");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          track("how_it_works_viewed");
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Section className="bg-secondary/40">
      <div ref={ref}>
        <SectionHeading
          eyebrow={t("home.howItWorks.eyebrow")}
          title={t("home.howItWorks.title")}
          description={t("home.howItWorks.description")}
        />
      </div>
      <ol className="mt-12 grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 110}>
            <li className="surface-card relative h-full list-none p-7">
              <span className="font-display text-sm font-extrabold text-accent-foreground">{s.n}</span>
              <h3 className="mt-2 text-xl font-bold">{s.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 -right-3 hidden size-6 place-items-center rounded-full bg-primary text-primary-foreground md:grid"
                >
                  →
                </span>
              )}
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}

/* --------------------------------------------------------------- categories */

export function CategoryGrid({ limit }: { limit?: number }) {
  const categories = useCategories();
  const list = limit ? categories.slice(0, limit) : categories;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {list.map((c, i) => (
        <Reveal key={c.slug} delay={(i % 4) * 80}>
          <article className="surface-card group h-full p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
            <span aria-hidden="true" className="text-2xl">
              {c.emoji}
            </span>
            <h3 className="mt-3 text-lg font-bold">{c.name}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{c.blurb}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {c.trades.map((trade) => (
                <li key={trade.label}>
                  {trade.serviceSlug ? (
                    <Link
                      href={`/services/${trade.serviceSlug}`}
                      onClick={() =>
                        track("service_category_clicked", { category: c.slug, trade: trade.label })
                      }
                      className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {trade.label}
                    </Link>
                  ) : (
                    <span className="inline-block rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                      {trade.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

export function CategoriesSection() {
  const t = useI18n().t;
  return (
    <Section id="categories">
      <SectionHeading
        eyebrow={t("home.categories.eyebrow")}
        title={t("home.categories.title")}
        description={t("home.categories.description")}
      />
      <div className="mt-12">
        <CategoryGrid limit={4} />
      </div>
      <Reveal delay={150}>
        <div className="mt-8 text-center">
          <ButtonLink to="/services" variant="outline" size="lg">
            {t("home.categories.exploreAll")}
          </ButtonLink>
        </div>
      </Reveal>
    </Section>
  );
}

/* ------------------------------------------------------------- near you */

interface NearbyCard {
  trade: string;
  rating: string;
  distance: string;
  tag: string;
}

export function NearbySection() {
  const { t, tx } = useI18n();
  const nearby = tx<readonly NearbyCard[]>("home.nearby.sample");

  return (
    <Section className="bg-secondary/40">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading
            align="left"
            eyebrow={t("home.nearby.eyebrow")}
            title={t("home.nearby.title")}
            description={t("home.nearby.description")}
          />
          <Reveal delay={120}>
            <div className="mt-8">
              <OpenAppButton source="near_you" size="lg" />
            </div>
          </Reveal>
        </div>

        <Reveal delay={150}>
          <div className="surface-card relative overflow-hidden p-6">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:34px_34px]"
            />
            <ul className="relative space-y-3">
              {nearby.map((n) => (
                <li
                  key={n.trade}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
                >
                  <div>
                    <p className="font-display font-bold">{n.trade}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      <span aria-hidden="true" className="text-accent">
                        ★
                      </span>{" "}
                      {n.rating} · {n.distance}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {n.tag}
                  </span>
                </li>
              ))}
            </ul>
            <p className="relative mt-4 text-center text-xs text-muted-foreground">
              {t("home.nearby.exampleNote")}
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------- trust */

export function TrustSection() {
  const { t, tx } = useI18n();
  const points = tx<readonly TitleBody[]>("home.trust.points");

  return (
    <Section>
      <SectionHeading
        eyebrow={t("home.trust.eyebrow")}
        title={t("home.trust.title")}
        description={t("home.trust.description")}
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {points.map((point, i) => (
          <Reveal key={point.title} delay={(i % 2) * 90}>
            <article className="surface-card flex h-full gap-4 p-6">
              <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3 5 6v6c0 4.4 3 7.9 7 9 4-1.1 7-4.6 7-9V6l-7-3Z" strokeLinejoin="round" />
                  <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <h3 className="text-lg font-bold">{point.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{point.body}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------- final CTA */

export function AppCTA({ source = "final_cta" }: { source?: string }) {
  const t = useI18n().t;
  return (
    <Section>
      <Reveal>
        <div className="ink-panel relative overflow-hidden rounded-[2rem] px-6 py-14 text-center sm:px-12 sm:py-20">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,var(--accent),transparent_45%),radial-gradient(circle_at_80%_70%,var(--primary),transparent_45%)]"
          />
          <div className="relative">
            <h2 className="text-3xl font-extrabold sm:text-5xl">{t("home.finalCta.title")}</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed opacity-85 sm:text-lg">
              {t("home.finalCta.body")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <OpenAppButton source={source} size="lg" variant="onInk" />
              <ButtonLink
                to="/services"
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-ink-foreground hover:bg-white/10"
              >
                {t("common.cta.exploreServices")}
              </ButtonLink>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}


