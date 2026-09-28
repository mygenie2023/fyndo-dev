import type { ReactNode } from "react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { InstallFyndoPrompt } from "./InstallFyndoPrompt";
import { MobileActionBar } from "./MobileActionBar";
import { useT } from "@/i18n/website/provider";
import { CONTACT } from "@/lib/fyndo";
import { MessageCircle } from "lucide-react";

export function SiteLayout({ children }: { children: ReactNode }) {
  const t = useT();
  const [location] = useLocation();

  /**
   * Always start a newly navigated page at the top.
   *
   * This applies to navigation from:
   * - Navbar
   * - Footer
   * - Logo
   * - CTA buttons
   * - Links inside pages
   * - Mobile menu
   */
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [location]);

  /**
   * Scroll to the top when the FYNDO logo is clicked.
   *
   * This is especially useful when the user is already on
   * the home page and is currently somewhere lower on the page.
   */
  const handleLogoClick = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  /**
   * WhatsApp contact.
   *
   * CONTACT.phone is stored as:
   * +91 9663474365
   *
   * WhatsApp wa.me links require the number without
   * the "+" or spaces.
   */
  const whatsappNumber = CONTACT.phone.replace(/\D/g, "");

  const whatsappMessage =
    "Hi FYNDO, I would like to know more about your services.";

  const whatsappUrl =
    `https://wa.me/${whatsappNumber}` +
    `?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="public-site flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t("common.a11y.skipToContent")}
      </a>

      <Navbar onLogoClick={handleLogoClick} />

      <main id="main" className="flex-1">
        {children}
      </main>

      <Footer />

      {/* Reserve room for the mobile sticky bar so it never covers the footer. */}
      <div
        aria-hidden="true"
        className="h-[calc(3.5rem+env(safe-area-inset-bottom))] lg:hidden"
      />

      <InstallFyndoPrompt />
      <MobileActionBar />

      {/* ================================================================== */}
      {/* Floating WhatsApp Button */}
      {/* ================================================================== */}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with FYNDO on WhatsApp"
        title="Chat with FYNDO on WhatsApp"
        className="
          fixed
          bottom-6
          right-5
          z-[80]
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-full
          bg-[#25D366]
          text-white
          shadow-[0_8px_24px_rgba(37,211,102,0.28)]
          transition-all
          duration-200
          hover:scale-105
          hover:shadow-[0_10px_28px_rgba(37,211,102,0.36)]
          focus:outline-none
          focus:ring-2
          focus:ring-[#25D366]
          focus:ring-offset-2
        "
      >
        <MessageCircle
          className="h-7 w-7"
          strokeWidth={2.2}
        />
      </a>
    </div>
  );
}