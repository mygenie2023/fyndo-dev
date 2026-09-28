import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  MapPin,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
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

    onSuccess: (
      data: {
        exists: boolean;
        user?: any;
        phone: string;
      }
    ) => {
      if (data.exists && data.user) {
        setUser(data.user);
        setLocation("/jobs");
      } else {
        setLocation(`/profile-setup?phone=${data.phone}`);
      }
    },

    onError: () => {
      // Existing login behavior retained.
    },
  });

  const handleContinue = () => {
    if (phoneNumber.length === 10) {
      loginMutation.mutate(phoneNumber);
    }
  };

  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
    <div className="public-site relative min-h-screen overflow-hidden bg-background text-foreground">

      {/* =====================================================
          Background
          ===================================================== */}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(
              55rem 32rem at 8% 0%,
              color-mix(
                in oklab,
                oklch(0.52 0.095 176) 13%,
                transparent
              ),
              transparent 68%
            ),
            radial-gradient(
              42rem 28rem at 95% 8%,
              color-mix(
                in oklab,
                oklch(0.79 0.142 76) 18%,
                transparent
              ),
              transparent 65%
            ),
            radial-gradient(
              45rem 30rem at 50% 110%,
              color-mix(
                in oklab,
                oklch(0.52 0.095 176) 10%,
                transparent
              ),
              transparent 70%
            )
          `,
        }}
      />

      {/* Decorative circles */}

      <div className="pointer-events-none absolute -left-24 top-24 h-56 w-56 rounded-full border border-primary/10 bg-primary/5 blur-sm" />

      <div className="pointer-events-none absolute -right-20 bottom-20 h-72 w-72 rounded-full border border-accent/15 bg-accent/10 blur-sm" />

      {/* =====================================================
          Header
          ===================================================== */}

      <header className="relative z-20 flex items-center justify-between px-5 py-5 sm:px-8">

        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />

          <span>
            Visit FYNDO Website
          </span>
        </Link>


      </header>

      {/* =====================================================
          Main
          ===================================================== */}

      <main className="relative z-10 flex min-h-[calc(100vh-88px)] items-center justify-center px-4 pb-10 pt-4 sm:px-6 sm:pb-14">

        <div className="w-full max-w-5xl">

          <div className="grid items-center gap-10 lg:grid-cols-[1fr_440px] lg:gap-16">

            {/* =================================================
                Desktop Brand Section
                ================================================= */}

            <section className="hidden lg:block">

              <div className="max-w-xl">

                <Link
                  href="/"
                  className="inline-block"
                >
                  <img
                    src={fyndoLogo}
                    alt="FYNDO"
                    className="h-16 w-auto object-contain"
                    data-testid="img-logo"
                  />
                </Link>

                <div className="mt-8">

                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-primary shadow-sm backdrop-blur">

                    <MapPin className="h-3.5 w-3.5" />

                    Local work & services

                  </span>

                  <h1 className="mt-5 max-w-lg text-4xl font-extrabold leading-[1.04] tracking-tight text-foreground xl:text-5xl">

                    Connect with opportunities{" "}

                    <span className="text-primary">
                      near you.
                    </span>

                  </h1>

                  <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
                    {t("app.tagline")}
                  </p>

                </div>

                

              </div>

            </section>

            {/* =================================================
                Login Section
                ================================================= */}

            <section className="w-full">

              {/* Mobile logo */}

              <div className="mb-5 text-center lg:hidden">

                <Link
                  href="/"
                  className="inline-block"
                >
                  <img
                    src={fyndoLogo}
                    alt="FYNDO"
                    className="mx-auto h-14 w-auto object-contain"
                    data-testid="img-logo"
                  />
                </Link>

                <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
                  {t("app.tagline")}
                </p>

              </div>

              {/* Login Card */}

              <Card className="overflow-hidden rounded-3xl border-white/70 bg-white/90 shadow-[0_24px_70px_-28px_rgba(20,70,60,0.45)] backdrop-blur-xl">

                <CardHeader className="space-y-2 px-6 pb-5 pt-7 sm:px-8 sm:pt-8">
  <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
    Welcome to FYNDO
  </h2>
  <CardDescription className="text-sm leading-6">
    {t("login.enterPhone")}
  </CardDescription>
</CardHeader>

                <CardContent className="space-y-5 px-6 pb-7 sm:px-8 sm:pb-8">

                  {/* Mobile number */}

                  <div className="space-y-2">

                    <label
                      htmlFor="phone"
                      className="text-sm font-bold text-foreground"
                    >
                      Mobile Number
                    </label>

                    <div className="flex overflow-hidden rounded-xl border border-input bg-background/70 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">

                      <div className="flex items-center border-r border-input px-3 text-sm font-semibold text-muted-foreground">
                        +91
                      </div>

                      <Input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        placeholder={t("login.phonePlaceholder")}
                        value={formatPhoneDisplay(phoneNumber)}
                        onChange={handlePhoneChange}
                        maxLength={11}
                        className="h-12 border-0 bg-transparent shadow-none focus-visible:ring-0"
                        data-testid="input-phone"
                      />

                    </div>

                    <p className="text-xs leading-5 text-muted-foreground">
                      Enter your 10-digit mobile number to continue.
                    </p>

                  </div>

                  {/* Continue */}

                  <Button
                    onClick={handleContinue}
                    className="h-12 w-full rounded-xl text-sm font-bold shadow-lg shadow-primary/15"
                    disabled={
                      phoneNumber.length !== 10 ||
                      loginMutation.isPending
                    }
                    data-testid="button-continue"
                  >

                    {loginMutation.isPending
                      ? t("login.sending")
                      : t("login.continue")}

                    {!loginMutation.isPending && (
                      <ArrowRight className="ml-2 h-4 w-4" />
                    )}

                  </Button>

                  {/* Divider */}

                  <div className="flex items-center gap-3 py-1">

                    <div className="h-px flex-1 bg-border" />

                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      FYNDO
                    </span>

                    <div className="h-px flex-1 bg-border" />

                  </div>

                  {/* Admin */}

                  <Link
                    href="/admin"
                    className="flex h-11 w-full items-center justify-center rounded-xl border border-border bg-background/60 text-sm font-bold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                  >
                    Admin Login
                  </Link>

                  {/* Terms */}

                  <p className="text-center text-xs leading-5 text-muted-foreground">
                    {t("login.termsText")}
                  </p>

                </CardContent>

              </Card>

              {/* Mobile website link */}

              <div className="mt-5 flex justify-center lg:hidden">

                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
                >
                  <ArrowLeft className="h-4 w-4" />

                  Visit FYNDO Website

                </Link>

              </div>

            </section>

          </div>

        </div>

      </main>

    </div>
  );
}