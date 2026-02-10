import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import fyndoLogo from "@assets/FYNDO_v1.0_1770731684699.png";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo and Branding */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mx-auto mb-6">
            <img src={fyndoLogo} alt="FYNDO" className="h-16 mx-auto" data-testid="img-logo" />
          </div>
          <p className="text-lg text-center text-muted-foreground font-medium">
            {t("tagline")}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="w-full max-w-md space-y-4 mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-6 border border-card-border/60 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {t("landing.connectWorkers")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("landing.connectWorkersDesc")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-6 border border-card-border/60 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {t("landing.locationBased")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("landing.locationBasedDesc")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-6 border border-card-border/60 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {t("landing.skillMatching")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("landing.skillMatchingDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Get Started Button */}
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
          <Button
            onClick={() => setLocation("/login")}
            className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            data-testid="button-get-started"
          >
            {t("landing.getStarted")}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center text-sm text-muted-foreground">
        <p>© 2024 FYNDO. All rights reserved.</p>
      </div>
    </div>
  );
}
