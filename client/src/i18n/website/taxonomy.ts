import { CATEGORIES, SERVICES } from "@/lib/services";
import { useI18n } from "@/i18n/website/provider";
import type { Lang } from "./lang";
import {
  translate,
  translateAny,
} from "./provider";

export interface UiTrade {
  label: string;
  serviceSlug?: string;
}

export interface UiCategory {
  slug: string;
  name: string;
  blurb: string;
  emoji: string;
  trades: UiTrade[];
}

export interface UiService {
  slug: string;
  name: string;
  category: string;
  summary: string;
  covers: string[];
  whenYouNeed: string[];
}

function serviceSlugForTrade(
  trade: string
): string | undefined {
  return SERVICES.find(
    (s) => s.name.toLowerCase() === trade.toLowerCase()
  )?.slug;
}

export function getCategories(
  lang: Lang
): UiCategory[] {
  return CATEGORIES.map((c) => ({
    slug: c.slug,
    emoji: c.emoji,
    name: translate(
      lang,
      `services.categories.${c.slug}.name`
    ),
    blurb: translate(
      lang,
      `services.categories.${c.slug}.blurb`
    ),
    trades: c.trades.map((trade) => {
      const label = translate(
        lang,
        `services.categories.${c.slug}.trades.${trade}`
      );

      const slug = serviceSlugForTrade(trade);

      return slug
        ? { label, serviceSlug: slug }
        : { label };
    }),
  }));
}

export function getServices(
  lang: Lang
): UiService[] {
  return SERVICES.map((s) => {
    const category = CATEGORIES.find(
      (c) => c.name === s.category
    );

    return {
      slug: s.slug,
      name: translate(
        lang,
        `services.items.${s.slug}.name`
      ),
      category: category
        ? translate(
            lang,
            `services.categories.${category.slug}.name`
          )
        : s.category,
      summary: translate(
        lang,
        `services.items.${s.slug}.summary`
      ),
      covers:
        translateAny<string[] | undefined>(
          lang,
          `services.items.${s.slug}.covers`
        ) ?? s.covers,
      whenYouNeed:
        translateAny<string[] | undefined>(
          lang,
          `services.items.${s.slug}.whenYouNeed`
        ) ?? s.whenYouNeed,
    };
  });
}

export function getService(
  lang: Lang,
  slug: string
): UiService | undefined {
  return getServices(lang).find(
    (s) => s.slug === slug
  );
}

export function useCategories(): UiCategory[] {
  return getCategories(useI18n().lang);
}

export function useServices(): UiService[] {
  return getServices(useI18n().lang);
}

export function useService(
  slug: string
): UiService | undefined {
  return getService(useI18n().lang, slug);
}
