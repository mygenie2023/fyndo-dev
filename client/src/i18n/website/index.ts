import type { Lang } from "./lang";

import enCommon from "./en/common";
import enHome from "./en/home";
import enServices from "./en/services";
import enPages from "./en/pages";
import enExtra from "./en/extra";

import knCommon from "./kn/common";
import knHome from "./kn/home";
import knServices from "./kn/services";
import knPages from "./kn/pages";
import knExtra from "./kn/extra";

import hiCommon from "./hi/common";
import hiHome from "./hi/home";
import hiServices from "./hi/services";
import hiPages from "./hi/pages";
import hiExtra from "./hi/extra";

export const DICTS: Record<Lang, Record<string, unknown>> = {
  en: { common: enCommon, home: enHome, services: enServices, pages: enPages, extra: enExtra },
  kn: { common: knCommon, home: knHome, services: knServices, pages: knPages, extra: knExtra },
  hi: { common: hiCommon, home: hiHome, services: hiServices, pages: hiPages, extra: hiExtra },
};
