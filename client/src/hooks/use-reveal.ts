import { useEffect, useRef, useState } from "react";

/**
 * Lightweight scroll reveal — IntersectionObserver only, no animation library.
 * Returns a ref plus the `data-visible` value to spread on the element.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.15,
) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;

    if (!el || visible) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold, visible]);

  return { ref, visible } as const;
}
