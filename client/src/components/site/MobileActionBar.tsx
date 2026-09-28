import { LANGS, LANG_LABELS, type Lang } from "@/i18n/website/lang";
import { useI18n } from "@/i18n/website/provider";
import { CONTACT } from "@/lib/fyndo";
import { cn } from "@/lib/utils";

/**
 * Mobile-only sticky bar: à²•à²¨à³à²¨à²¡ | English | à¤¹à¤¿à¤¨à¥à¤¦à¥€ | Call FYNDO.
 * Hidden from lg breakpoint up, where the header selector takes over.
 */
export function MobileActionBar() {
  const { lang, setLang, t } = useI18n();

  return (
    <nav
      aria-label={t("common.lang.barAria")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-3xl grid-cols-4">
        {LANGS.map((code) => (
          <li key={code} className="min-w-0">
            <button
              type="button"
              onClick={() => setLang(code as Lang)}
              aria-label={t(`common.lang.switchTo.${code}`)}
              aria-current={code === lang ? "true" : undefined}
              className={cn(
                "flex min-h-14 w-full flex-col items-center justify-center gap-0.5 px-1 text-[0.78rem] leading-tight font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary focus-visible:outline-none",
                code === lang
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="truncate">{LANG_LABELS[code]}</span>
              <span
                aria-hidden="true"
                className={cn(
                  "h-0.5 w-6 rounded-full transition-colors",
                  code === lang ? "bg-primary" : "bg-transparent",
                )}
              />
            </button>
          </li>
        ))}
        <li className="min-w-0">
          <a
            href={CONTACT.phoneHref}
            aria-label={t("common.contact.callAria")}
            className="flex min-h-14 w-full flex-col items-center justify-center gap-0.5 bg-accent px-1 text-[0.78rem] leading-tight font-bold text-accent-foreground transition-[filter] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary focus-visible:outline-none"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path
                d="M6.6 3h2.2l1.4 3.5-1.8 1.3a12 12 0 0 0 5.8 5.8l1.3-1.8L19 13.2v2.2A2.4 2.4 0 0 1 16.4 18 13.4 13.4 0 0 1 6 7.6 2.4 2.4 0 0 1 6.6 3Z"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </li>
      </ul>
    </nav>
  );
}
