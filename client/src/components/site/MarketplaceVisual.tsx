import workersFallback from "@/assets/img/workers-1280.jpg";
import workersAvif640 from "@/assets/img/workers-640.avif";
import workersAvif960 from "@/assets/img/workers-960.avif";
import workersAvif1280 from "@/assets/img/workers-1280.avif";
import workersWebp640 from "@/assets/img/workers-640.webp";
import workersWebp960 from "@/assets/img/workers-960.webp";
import workersWebp1280 from "@/assets/img/workers-1280.webp";
import { useI18n } from "@/i18n/website/provider";

const POSITIONS = [
  { top: "6%", left: "4%", delay: "0s" },
  { top: "44%", left: "56%", delay: "1.4s" },
  { top: "76%", left: "8%", delay: "2.6s" },
];

interface SampleCard {
  trade: string;
  rating: string;
  distance: string;
  tag: string;
}

/**
 * Hero visual: a local map surface with nearby operator cards over an
 * authentic photo grid. Illustrative UI only — not real listings.
 */
export function MarketplaceVisual() {
  const { t, tx } = useI18n();
  const cards = tx<readonly SampleCard[]>("home.nearby.sample").map((c, i) => ({
    ...c,
    ...POSITIONS[i]!,
  }));

  return (
    <div className="relative">
      <div className="surface-card relative overflow-hidden p-2 sm:p-3">
        <div className="relative overflow-hidden rounded-[1.1rem]">
          <picture>
            <source
              type="image/avif"
              srcSet={`${workersAvif640} 640w, ${workersAvif960} 960w, ${workersAvif1280} 1280w`}
              sizes="(max-width: 1024px) 92vw, 45vw"
            />
            <source
              type="image/webp"
              srcSet={`${workersWebp640} 640w, ${workersWebp960} 960w, ${workersWebp1280} 1280w`}
              sizes="(max-width: 1024px) 92vw, 45vw"
            />
            <img
              src={workersFallback}
              alt={t("home.hero.visualAlt")}
              width={1280}
              height={960}
              fetchPriority="high"
              decoding="async"
              loading="eager"
              className="h-[22rem] w-full object-cover sm:h-[26rem] lg:h-[30rem]"
            />
          </picture>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,color-mix(in_oklab,var(--primary-deep)_78%,transparent))]"
          />

          {/* location pings */}
          <div aria-hidden="true" className="absolute inset-0">
            {cards.map((c) => (
              <span
                key={c.trade}
                className="absolute size-3 rounded-full bg-accent"
                style={{ top: c.top, left: `calc(${c.left} + 12%)`, animationDelay: c.delay }}
              >
                <span className="pin-pulse absolute inset-0 rounded-full bg-accent" />
              </span>
            ))}
          </div>

          <p className="absolute right-3 bottom-3 rounded-full bg-background/85 px-3 py-1 text-[0.68rem] font-medium text-muted-foreground backdrop-blur">
            {t("home.hero.visualNote")}
          </p>
        </div>
      </div>

      {/* floating operator cards */}
      <ul className="pointer-events-none absolute inset-0 hidden sm:block">
        {cards.map((c, i) => (
          <li
            key={c.trade}
            className="float-slow surface-card absolute w-[11.5rem] p-3"
            style={{ top: c.top, left: c.left, animationDelay: `${i * 1.3}s` }}
          >
            <p className="font-display text-sm font-bold">{c.trade}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <span className="text-accent" aria-hidden="true">
                ★
              </span>
              {c.rating} · {c.distance}
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 text-[0.7rem] font-semibold text-primary">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
              {t("home.hero.visualAvailable")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
