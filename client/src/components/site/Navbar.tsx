import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { OpenAppButton } from "@/components/ui/cta";
import { useT } from "@/i18n/website/provider";
import { CONTACT } from "@/lib/fyndo";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/how-it-works", key: "howItWorks" },
  { to: "/services", key: "services" },
  { to: "/for-work-providers", key: "forWorkProviders" },
  { to: "/for-operators", key: "findWork" },
  { to: "/faq", key: "faq" },
] as const;

const SECONDARY = [{ to: "/about", key: "about" }] as const;

function PhoneIcon({ className = "size-[1.15rem]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M6.6 3h2.2l1.4 3.5-1.8 1.3a12 12 0 0 0 5.8 5.8l1.3-1.8L19 13.2v2.2A2.4 2.4 0 0 1 16.4 18 13.4 13.4 0 0 1 6 7.6 2.4 2.4 0 0 1 6.6 3Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Determines whether a navigation item should appear active.
 *
 * Services should remain active on:
 *   /services
 *   /services/farm-labour
 *   /services/electrician
 *   etc.
 *
 * Other navigation items use an exact path match.
 */
function isNavItemActive(pathname: string, target: string) {
  if (target === "/services") {
    return pathname === "/services" || pathname.startsWith("/services/");
  }

  return pathname === target;
}

export function Navbar() {
  const t = useT();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-3 lg:h-[4.5rem]">
        {/* FYNDO Logo -> Home */}
<div
  role="button"
  tabIndex={0}
  onClick={() => {
    if (window.location.pathname === "/") {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
  }}
  onKeyDown={(event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (window.location.pathname === "/") {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      }
    }
  }}
  className="cursor-pointer"
  aria-label="Go to FYNDO home"
>
  <Logo />
</div>

        {/* Desktop Navigation */}
        <nav
          aria-label={t("common.nav.aria")}
          className="hidden items-center gap-1 xl:flex"
        >
          {NAV.map((item) => {
            const active = isNavItemActive(location, item.to);

            return (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {t(`common.nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="flex min-w-0 items-center gap-2">
          <LanguageSwitcher className="hidden md:block" />

          <a
            href={CONTACT.phoneHref}
            title={t("common.contact.callAria")}
            aria-label={t("common.contact.callAria")}
            className="hidden size-10 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary md:grid"
          >
            <PhoneIcon />
          </a>

          <OpenAppButton
            source="navbar"
            className="hidden sm:inline-flex"
          />

          <OpenAppButton
            source="navbar_mobile"
            label={t("common.cta.openAppShort")}
            size="sm"
            className="sm:hidden"
          />

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={
              open
                ? t("common.nav.closeMenu")
                : t("common.nav.openMenu")
            }
            className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card xl:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {open ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <div
          id="mobile-menu"
          className="border-t border-border bg-background xl:hidden"
        >
          <nav
            aria-label={t("common.nav.mobileAria")}
            className="container-page flex flex-col gap-1 py-4"
          >
            {[...NAV, ...SECONDARY].map((item) => {
              const active = isNavItemActive(location, item.to);

              return (
                <Link
                  key={item.to}
                  href={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-xl px-3 py-3 text-base font-medium",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-foreground hover:bg-secondary",
                  )}
                >
                  {t(`common.nav.${item.key}`)}
                </Link>
              );
            })}

            <a
              href={CONTACT.phoneHref}
              aria-label={t("common.contact.callAria")}
              className="flex items-center gap-2 rounded-xl px-3 py-3 text-base font-medium hover:bg-secondary"
            >
              <PhoneIcon className="size-5" />
              {CONTACT.phone}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}