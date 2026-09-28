/**
 * Central FYNDO public website configuration.
 *
 * The public website lives at `/` and hands users off to the
 * FYNDO application at `/login`.
 */

export const APP_URL =
  (import.meta.env["VITE_FYNDO_APP_URL"] as string | undefined)?.replace(/\/$/, "") ||
  "/login";

export const APP_IS_EXTERNAL = /^https?:\/\//i.test(APP_URL);

export function appLink(path = ""): string {
  if (!path) return APP_URL;

  return `${APP_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const CONTACT = {
  email: "auroviafyndo@gmail.com",
  emailHref: "mailto:auroviafyndo@gmail.com",
  phone: "+91 9663474365",
  phoneHref: "tel:+919663474365",
} as const;

export const BRAND = {
  name: "FYNDO",
  tagline: "Hyperlocal Skilled Workers & Local Services Marketplace",
  line: "Your Work. Our Network.",
  contactEmail: CONTACT.email,
} as const;

export type FyndoEvent =
  | "open_app_clicked"
  | "install_prompt_shown"
  | "install_prompt_accepted"
  | "install_prompt_dismissed"
  | "service_category_clicked"
  | "how_it_works_viewed"
  | "faq_opened"
  | "website_to_app_conversion";

type AnalyticsWindow = Window & {
  dataLayer?: Array<Record<string, unknown>>;
  gtag?: (...args: unknown[]) => void;
};

export function track(
  event: FyndoEvent,
  params: Record<string, unknown> = {}
): void {
  if (typeof window === "undefined") return;

  const w = window as AnalyticsWindow;

  try {
    w.dataLayer?.push({ event, ...params });
    w.gtag?.("event", event, params);
  } catch {
    // Analytics must never break the page.
  }
}
