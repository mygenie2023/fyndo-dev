import { Briefcase, Star, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";

interface BottomNavProps {
  userType?: "farmer" | "associate";
}

export default function BottomNav({
  userType = "farmer",
}: BottomNavProps) {
  const { t } = useTranslation();
  const [location] = useLocation();

  const navItems =
    userType === "associate"
      ? [
          {
            path: "/jobs",
            icon: Briefcase,
            label: t("nav.jobs"),
          },
          {
            path: "/ratings",
            icon: Star,
            label: "Ratings",
          },
          {
            path: "/profile",
            icon: User,
            label: "Profile",
          },
        ]
      : [
          {
            path: "/jobs",
            icon: Briefcase,
            label: t("nav.jobs"),
          },
          {
            path: "/profile",
            icon: User,
            label: "Profile",
          },
        ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[10000]"
      style={
        {
          "--bottom-nav-height": "5.5rem",
        } as React.CSSProperties
      }
    >
      <div className="mx-auto w-full max-w-2xl">
        <div
          className="
            border-t border-[#DDE7E3]
            bg-white/95
            px-3
            pt-2
            shadow-[0_-8px_24px_rgba(31,55,46,0.06)]
            backdrop-blur-xl
            pb-[calc(0.5rem+env(safe-area-inset-bottom))]
          "
        >
          <div
            className={`grid ${
              userType === "associate"
                ? "grid-cols-3"
                : "grid-cols-2"
            } gap-2`}
          >
            {navItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                item.path === "/jobs"
                  ? location === "/jobs"
                  : location === item.path;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className="
                    relative flex
                    min-h-[3.75rem]
                    items-center
                    justify-center
                    rounded-xl
                    transition-all
                    duration-200
                  "
                  data-testid={`nav-${item.path.replace("/", "")}`}
                >
                  {isActive && (
                    <div
                      className="
                        absolute
                        inset-0
                        rounded-xl
                        bg-primary/10
                        ring-1
                        ring-primary/15
                      "
                    />
                  )}

                  <div
                    className={`
                      relative
                      z-10
                      flex
                      flex-col
                      items-center
                      justify-center
                      gap-1
                      ${
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground"
                      }
                    `}
                  >
                    <Icon
                      className="h-5 w-5"
                      strokeWidth={isActive ? 2.4 : 2}
                    />

                    <span
                      className={`
                        text-[11px]
                        font-semibold
                        ${
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground"
                        }
                      `}
                    >
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}