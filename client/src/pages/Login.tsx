import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/lib/userContext";
import { supabase } from "@/lib/supabase";
import fyndoLogo from "@assets/FYNDO_v1.0_1770731684699.png";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Login() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { setUser } = useUser();
  const [phoneNumber, setPhoneNumber] = useState("");

  const loginMutation = useMutation({
  mutationFn: async (phone: string) => {
    const { data, error } = await supabase.rpc(
      "find_user_by_phone",
      {
        p_phone_number: phone,
      }
    );

    if (error) {
      throw error;
    }

const dbUser = Array.isArray(data) ? data[0] : data;

if (!dbUser) {
  return {
    exists: false,
    user: undefined,
    phone,
  };
}

const user = {
  id: dbUser.id,

  phoneNumber:
    dbUser.phone_number ??
    dbUser.phoneNumber ??
    phone,

  name:
    dbUser.name ??
    "",

  userType:
    dbUser.user_type ??
    dbUser.userType ??
    null,

  location:
    dbUser.location ??
    null,

  latitude:
    dbUser.latitude ??
    null,

  longitude:
    dbUser.longitude ??
    null,

  skills:
    Array.isArray(dbUser.skills)
      ? dbUser.skills
      : [],

  skillLevel:
    dbUser.skill_level ??
    dbUser.skillLevel ??
    null,

  hourlyRate:
    dbUser.hourly_rate ??
    dbUser.hourlyRate ??
    null,

  gender:
    dbUser.gender ??
    null,

  dateOfBirth:
    dbUser.date_of_birth ??
    dbUser.dateOfBirth ??
    null,

  expectedDailySalary:
    dbUser.expected_daily_salary ??
    dbUser.expectedDailySalary ??
    null,

  travelDistance:
    dbUser.travel_distance ??
    dbUser.travelDistance ??
    null,

  comfortableStaying:
    dbUser.comfortable_staying ??
    dbUser.comfortableStaying ??
    null,

  aadharFrontUrl:
    dbUser.aadhar_front_url ??
    dbUser.aadharFrontUrl ??
    null,

  aadharBackUrl:
    dbUser.aadhar_back_url ??
    dbUser.aadharBackUrl ??
    null,

  averageRating:
    dbUser.average_rating ??
    dbUser.averageRating ??
    null,

  jobsCompleted:
    dbUser.jobs_completed ??
    dbUser.jobsCompleted ??
    0,

  totalRatings:
    dbUser.total_ratings ??
    dbUser.totalRatings ??
    0,

  createdAt:
    dbUser.created_at ??
    dbUser.createdAt ??
    null,
};

return {
  exists: true,
  user,
  phone,
};
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
          <div className="mb-2">
            <img src={fyndoLogo} alt="FYNDO" className="h-14 mx-auto" data-testid="img-logo" />
          </div>
          <div>
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
