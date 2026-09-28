import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useInstallPrompt } from "@/hooks/use-pwa-install";
import { Button } from "@/components/ui/cta";
import { track } from "@/lib/fyndo";
import { useI18n } from "@/i18n/website/provider";


/**
 * Elegant, non-intrusive install nudge.
 * - Never shows on desktop, in standalone mode, or after a recent dismissal.
 * - Waits for meaningful engagement (scroll or a short delay) before appearing.
 * - Falls back to manual instructions on iOS Safari.
 */
export function InstallFyndoPrompt() {
  const { t, tx } = useI18n();
  const [, setLocation] = useLocation();

  const { canPromote, mode, install, snooze } = useInstallPrompt();
  const [visible, setVisible] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    if (!canPromote) {
      setVisible(false);
      return;
    }
    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setVisible(true);
      track("install_prompt_shown", { mode });
    };
    const timer = window.setTimeout(reveal, 7000);
    return () => window.clearTimeout(timer);
  }, [canPromote, mode]);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    track("install_prompt_dismissed", { mode });
  };

  const accept = async () => {
    if (mode === "ios-manual") {
      setShowIosSteps(true);
      return;
    }
    const outcome = await install();
    if (outcome === "accepted") {
      track("install_prompt_accepted", { mode });
      setVisible(false);
      setLocation("/login");
      return;
    }
    track("install_prompt_dismissed", { mode });
    setVisible(false);
  };


  return (
    <div
      role="dialog"
      aria-labelledby="install-fyndo-title"
      className="sheet-in fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-[55] px-3 pb-3 lg:hidden"
    >
      <div className="surface-card mx-auto max-w-lg p-4 shadow-[var(--shadow-lift)]">
        <div className="flex items-start gap-3">
          <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 3v12m0 0 4-4m-4 4-4-4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
            </svg>
          </span>
          <div className="min-w-0">
            <h2 id="install-fyndo-title" className="font-display text-base font-bold">
              {t("common.install.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("common.install.body")}</p>
          </div>
        </div>

        {showIosSteps ? (
          <ol className="mt-4 space-y-1.5 rounded-xl bg-secondary p-3 text-sm text-muted-foreground">
            {tx<readonly string[]>("common.install.iosSteps").map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        ) : null}

        <div className="mt-4 flex gap-2">
          <Button onClick={accept} className="flex-1">
            {mode === "ios-manual" ? t("common.install.iosCta") : t("common.install.cta")}
          </Button>
          <Button variant="ghost" onClick={dismiss}>
            {t("common.install.later")}
          </Button>
        </div>
      </div>
    </div>
  );
}
