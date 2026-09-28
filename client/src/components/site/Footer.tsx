import { Link } from "wouter";
import { Logo } from "./Logo";
import { CONTACT } from "@/lib/fyndo";
import { useT } from "@/i18n/website/provider";
import { OpenAppButton } from "@/components/ui/cta";

const COLUMNS: Array<{
  titleKey: string;
  links: Array<{ to: string; key: string }>;
}> = [
  {
    titleKey: "product",
    links: [
      { to: "/how-it-works", key: "howItWorks" },
      { to: "/services", key: "services" },
    ],
  },
  {
    titleKey: "forYou",
    links: [
      { to: "/for-work-providers", key: "forWorkProviders" },
      { to: "/for-operators", key: "forOperators" },
      { to: "/trust", key: "trust" },
    ],
  },
  {
    titleKey: "company",
    links: [
      { to: "/about", key: "about" },
      { to: "/faq", key: "faq" },
    ],
  },
  {
    titleKey: "legal",
    links: [
      { to: "/privacy", key: "privacy" },
      { to: "/terms", key: "terms" },
    ],
  },
];

export function Footer() {
  const t = useT();

  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="max-w-xs">
          <Logo />

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {t("common.footer.blurb")}
          </p>

          <p className="mt-4 font-display text-base font-bold">
            {t("common.brand.line")}
          </p>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {t("common.coverage.statement")}
          </p>

          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex flex-wrap items-center gap-x-2">
              <dt className="font-semibold">
                {t("common.contact.email")}:
              </dt>
              <dd className="min-w-0">
                <a
                  href={CONTACT.emailHref}
                  aria-label={t("common.contact.emailAria")}
                  className="break-all text-primary underline-offset-4 hover:underline"
                >
                  {CONTACT.email}
                </a>
              </dd>
            </div>

            <div className="flex flex-wrap items-center gap-x-2">
              <dt className="font-semibold">
                {t("common.contact.phone")}:
              </dt>
              <dd>
                <a
                  href={CONTACT.phoneHref}
                  aria-label={t("common.contact.callAria")}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {CONTACT.phone}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        {COLUMNS.map((col) => (
          <nav
            key={col.titleKey}
            aria-label={t(`common.footer.${col.titleKey}`)}
          >
            <h2 className="font-display text-sm font-bold tracking-wide uppercase">
              {t(`common.footer.${col.titleKey}`)}
            </h2>

            <ul className="mt-4 space-y-2.5">
              {col.titleKey === "product" ? (
                <li>
                  <OpenAppButton
                    source="footer"
                    plain
                    label={t("common.footer.links.openApp")}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  />
                </li>
              ) : null}

              {col.links.map((l) => (
                <li key={l.to}>
                  <Link
                    href={l.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t(`common.footer.links.${l.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} FYNDO. {t("common.footer.rights")}
          </p>

          <p>{t("common.brand.tagline")}</p>

          <p>
  Built with ❤️ by{" "}
  <a
    href="https://1xsoft.com/"
    target="_blank"
    rel="noopener noreferrer"
    className="text-foreground underline-offset-4 hover:underline"
  >
    1Xsoft Private Limited
  </a>
</p>
        </div>
      </div>
    </footer>
  );
}
