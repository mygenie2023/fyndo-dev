import { Briefcase, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";

interface BottomNavProps {
  userType?: "farmer" | "associate";
}

export default function BottomNav({ userType = "farmer" }: BottomNavProps) {
  const { t } = useTranslation();
  const [location] = useLocation();

  const navItems = [
    { path: "/jobs", icon: Briefcase, label: t("nav.jobs") },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 px-4 pb-safe"
      style={{ 
        "--bottom-nav-height": "5.5rem",
        zIndex: 10000
      } as React.CSSProperties}
    >
      <div className="max-w-2xl mx-auto pb-4 pt-2">
        <div className="bg-card/80 backdrop-blur-xl border border-card-border/60 rounded-2xl shadow-lg px-2 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <button
                    className={`
                      relative flex flex-col items-center justify-center gap-1
                      w-16 h-14 rounded-xl transition-all duration-300
                      ${isActive 
                        ? "text-primary" 
                        : "text-muted-foreground hover:text-foreground"
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-primary/10 rounded-xl ring-1 ring-primary/20 transition-all duration-300" />
                    )}
                    <Icon 
                      className={`relative w-5 h-5 transition-all duration-300 ${
                        isActive ? "scale-110" : "scale-100"
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className={`relative text-[10px] font-semibold tracking-tight transition-all duration-300 ${
                      isActive ? "opacity-100" : "opacity-70"
                    }`}>
                      {item.label}
                    </span>
                  </button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
