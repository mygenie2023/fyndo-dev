import { useState } from "react";
import { track } from "@/lib/fyndo";
import { useI18n } from "@/i18n/website/provider";

export interface FaqItem {
  q: string;
  a: string;
}

export function useFaqItems(): FaqItem[] {
  const { tx } = useI18n();
  return tx<FaqItem[]>("extra.faq.items");
}

export function FaqList({ items }: { items?: FaqItem[] }) {
  const fallback = useFaqItems();
  const list = items ?? fallback;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
      {list.map((item, i) => {
        const isOpen = open === i;

        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                onClick={() => {
                  setOpen(isOpen ? null : i);

                  if (!isOpen) {
                    track("faq_opened", {
                      question: item.q,
                    });
                  }
                }}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-base font-bold transition-colors hover:bg-secondary/60"
              >
                {item.q}

                <span
                  aria-hidden="true"
                  className={`grid size-7 shrink-0 place-items-center rounded-full bg-secondary transition-transform duration-300 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>
            </h3>

            <div
              id={`faq-panel-${i}`}
              hidden={!isOpen}
              className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground"
            >
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Generates FAQ structured data using the currently selected website language.
 */
export function faqSchema() {
  const items = useFaqItems();

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: i.a,
      },
    })),
  };
}
