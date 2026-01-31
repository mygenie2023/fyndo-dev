import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/lib/userContext";
import { Tractor } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Login() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { setUser } = useUser();
  const [phoneNumber, setPhoneNumber] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (phone: string) => {
      const res = await apiRequest("POST", "/api/auth/login", { phoneNumber: phone });
      const result = await res.json();
      return { ...result, phone };
    },
    onSuccess: (data: { exists: boolean; user?: any; phone: string }) => {
      if (data.exists && data.user) {
        setUser(data.user);
        setLocation("/jobs");
      } else {
        setLocation(`/profile-setup?phone=${data.phone}`);
      }
    },
    onError: () => {
    },
  });

  const handleContinue = () => {
    if (phoneNumber.length === 10) {
      loginMutation.mutate(phoneNumber);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const truncated = rawValue.slice(0, 10);
    setPhoneNumber(truncated);
  };

  const formatPhoneDisplay = (phone: string) => {
    if (phone.length <= 5) {
      return phone;
    }
    return `${phone.slice(0, 5)} ${phone.slice(5)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.05),transparent)] pointer-events-none" />
      
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 mb-2">
            <Tractor className="w-10 h-10" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">{t("app.name")}</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              {t("app.tagline")}
            </p>
          </div>
        </div>

        <Card className="shadow-xl border-card-border/60">
          <CardHeader className="space-y-2 pb-6">
            <CardDescription className="text-lg font-bold text-foreground">
              {t("login.enterPhone")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="phone"
              type="tel"
              placeholder={t("login.phonePlaceholder")}
              value={formatPhoneDisplay(phoneNumber)}
              onChange={handlePhoneChange}
              maxLength={11}
              data-testid="input-phone"
            />
            <Button
              onClick={handleContinue}
              className="w-full"
              disabled={phoneNumber.length !== 10 || loginMutation.isPending}
              data-testid="button-continue"
            >
              {loginMutation.isPending ? t("login.sending") : t("login.continue")}
            </Button>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground">
          {t("login.termsText")}
        </p>
      </div>
    </div>
  );
}
