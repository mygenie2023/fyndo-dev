import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

export default function JobPostingSuccess() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50/50 to-white dark:from-green-950/20 dark:to-background">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-lg">FYNDO</span>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Success Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6 text-center">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-foreground">
              Job posted successfully!
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Thank you for posting! The FYNDO team will get back to you within 24 hours.
            </p>
          </div>

          {/* OK Button */}
          <Button
            onClick={() => setLocation("/jobs")}
            className="w-full h-11"
            size="lg"
            data-testid="button-ok-success"
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}
