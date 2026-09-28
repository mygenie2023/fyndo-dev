export const LANGS = ["kn", "en", "hi"] as const;

export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = "kn";

export const LANG_LABELS: Record<Lang, string> = {
  kn: "ಕನ್ನಡ",
  en: "English",
  hi: "हिन्दी",
};

export const LANG_TAGS: Record<Lang, string> = {
  kn: "kn-IN",
  en: "en-IN",
  hi: "hi-IN",
};

export const LANG_OG_LOCALE: Record<Lang, string> = {
  kn: "kn_IN",
  en: "en_IN",
  hi: "hi_IN",
};

const STORAGE_KEY = "fyndo.lang";

export function isLang(value: unknown): value is Lang {
  return (
    typeof value === "string" &&
    (LANGS as readonly string[]).includes(value)
  );
}

export function getCurrentLang(): Lang {
  if (typeof window === "undefined") {
    return DEFAULT_LANG;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (isLang(stored)) {
      return stored;
    }
  } catch {
    // Ignore unavailable storage.
  }

  return DEFAULT_LANG;
}

export function persistLang(lang: Lang): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Persistence is best-effort.
  }

  document.documentElement.lang = LANG_TAGS[lang];
}

export function readInitialLang(): Lang {
  return getCurrentLang();
}
