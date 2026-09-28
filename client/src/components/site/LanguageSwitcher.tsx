import { useEffect, useRef, useState } from "react";
import { LANGS, LANG_LABELS, type Lang } from "@/i18n/website/lang";
import { useI18n } from "@/i18n/website/provider";
import { cn } from "@/lib/utils";

/** Compact header language selector (desktop / tablet). */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (next: Lang) => {
    setLang(next);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("common.lang.selectorAria")}
        className="inline-flex h-10 min-w-11 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm font-semibold transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 2.5 15 0 18M12 3c2.5 2.6 2.5 15 0 18" />
        </svg>

        <span>{LANG_LABELS[lang]}</span>

        <span aria-hidden="true" className="text-xs">
          ▾
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("common.lang.label")}
          className="absolute right-0 z-50 mt-2 min-w-40 overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-[var(--shadow-lift)]"
        >
          {LANGS.map((code) => (
            <li key={code}>
              <button
                type="button"
                role="option"
                aria-selected={code === lang}
                aria-label={t(`common.lang.switchTo.${code}`)}
                onClick={() => choose(code)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                  code === lang && "bg-secondary text-primary",
                )}
              >
                {LANG_LABELS[code]}

                {code === lang && (
                  <span aria-hidden="true">✓</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
