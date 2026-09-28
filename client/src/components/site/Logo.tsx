import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/website/provider";

export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src="/icons/icon-192.png"
      alt=""
      aria-hidden="true"
      width={36}
      height={36}
      className={cn("size-9 shrink-0 object-contain", className)}
    />
  );
}

export function Logo({ className }: { className?: string }) {
  const t = useT();

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center",
        className,
      )}
      aria-label={t("common.a11y.fyndoHome")}
    >
      <img
        src="/fyndo-logo.png"
        alt="FYNDO"
        width={1920}
        height={517}
        className="h-7 w-auto transition-transform duration-300 group-hover:-translate-y-0.5 sm:h-8"
      />
    </Link>
  );
}