import fyndoLogo from "@assets/FYNDO_v1.0_1770731684699.png";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/userContext";
import { useLocation } from "wouter";

interface AppHeaderProps {
  showPostJob?: boolean;
  onPostJob?: () => void;
}

export default function AppHeader({
  showPostJob = true,
  onPostJob,
}: AppHeaderProps) {
  const { user } = useUser();
  const [, navigate] = useLocation();

  const isFarmer =
    user?.userType?.toLowerCase() === "farmer";

  const handleLogoClick = () => {
    navigate("/jobs");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#DDE7E3] bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-2xl items-center justify-between gap-3 px-5">
        {/* FYNDO Logo */}
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center rounded-lg border-0 bg-transparent p-0 transition-opacity duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Go to FYNDO home"
          data-testid="button-fyndo-home"
        >
          <img
            src={fyndoLogo}
            alt="FYNDO"
            className="h-8 w-auto"
            data-testid="img-logo"
          />
        </button>

        {/* Right-side actions */}
        <div className="flex items-center gap-2">
          {showPostJob && isFarmer && onPostJob && (
            <Button
              type="button"
              onClick={onPostJob}
              className="
                h-9 rounded-xl bg-primary px-3.5 text-xs font-semibold
                text-primary-foreground shadow-sm transition-all duration-200
                hover:bg-primary/95 hover:shadow-md
                active:scale-[0.98]
              "
              data-testid="button-post-job"
            >
              Post Your Job
            </Button>
          )}

        </div>
      </div>
    </header>
  );
}