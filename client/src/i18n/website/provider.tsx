import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Lang } from "./lang";
import {
  DEFAULT_LANG,
  getCurrentLang,
  persistLang,
} from "./lang";
import { DICTS } from "./index";

type Dict = Record<string, unknown>;

export interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (path: string) => string;
  tx: <T = unknown>(path: string) => T;
}

const I18nContext = createContext<I18nValue | null>(null);

function resolve(dict: Dict, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (
      current &&
      typeof current === "object" &&
      key in (current as Record<string, unknown>)
    ) {
      return (current as Record<string, unknown>)[key];
    }

    return undefined;
  }, dict);
}

export function translate(lang: Lang, path: string): string {
  const current = resolve(DICTS[lang], path);
  if (typeof current === "string") {
    return current;
  }

  const fallback = resolve(DICTS[DEFAULT_LANG], path);
  if (typeof fallback === "string") {
    return fallback;
  }

  return path;
}

export function translateAny<T>(lang: Lang, path: string): T {
  const current = resolve(DICTS[lang], path);

  if (current !== undefined) {
    return current as T;
  }

  const fallback = resolve(DICTS[DEFAULT_LANG], path);

  if (fallback !== undefined) {
    return fallback as T;
  }

  return path as T;
}

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>(() => getCurrentLang());

  const setLang = (nextLang: Lang) => {
    persistLang(nextLang);
    setLangState(nextLang);
  };

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      t: (path: string) => translate(lang, path),
      tx: <T = unknown>(path: string) =>
        translateAny<T>(lang, path),
    }),
    [lang]
  );

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error(
      "useI18n must be used inside LanguageProvider"
    );
  }

  return context;
}

export function useT() {
  return useI18n().t;
}
