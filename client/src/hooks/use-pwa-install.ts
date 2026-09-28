import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type InstallMode = "native" | "ios-manual" | "unavailable";

let deferredEvent: BeforeInstallPromptEvent | null = null;
let installed = false;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    deferredEvent = e as BeforeInstallPromptEvent;
    emit();
  });

  window.addEventListener("appinstalled", () => {
    deferredEvent = null;
    installed = true;
    emit();
  });
}

export function useInstallPrompt() {
  const [, force] = useState(0);
  const [standalone, setStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const rerender = () => force((n) => n + 1);

    listeners.add(rerender);

    const ua = window.navigator.userAgent;

    const iosLike =
      /iPad|iPhone|iPod/.test(ua) ||
      (/Macintosh/.test(ua) && "ontouchend" in document);

    setIsIos(iosLike);

    setIsMobile(
      iosLike ||
        /Android|Mobile|Tablet/i.test(ua) ||
        window.innerWidth < 1024
    );

    setStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & { standalone?: boolean })
          .standalone === true
    );

    return () => {
      listeners.delete(rerender);
    };
  }, []);

  const mode: InstallMode = deferredEvent
    ? "native"
    : isIos && !standalone
      ? "ios-manual"
      : "unavailable";

  const install = useCallback(
    async (): Promise<"accepted" | "dismissed" | "unsupported"> => {
      const evt = deferredEvent;

      if (!evt) {
        return "unsupported";
      }

      await evt.prompt();

      const { outcome } = await evt.userChoice;

      deferredEvent = null;

      if (outcome === "accepted") {
        installed = true;
      }

      emit();

      return outcome;
    },
    []
  );

  const snooze = useCallback(() => {
    // Dismissals are intentionally not remembered across refreshes.
  }, []);

  return {
    mode,
    isMobile,
    isIos,
    installed: installed || standalone,
    standalone,
    snoozed: false,
    canPromote:
      isMobile &&
      !standalone &&
      !installed &&
      mode !== "unavailable",
    install,
    snooze,
  } as const;
}
