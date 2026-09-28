import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import {
  MapPin,
  Phone,
  LogOut,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/lib/userContext";
import { formatPhone } from "@/lib/utils";
import fyndoLogo from "@assets/FYNDO_v1.0_1770731684699.png";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Profile() {
  const { t } = useTranslation();
  const { user, setUser } = useUser();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    setUser(null);
    setLocation("/login");
  };

  const contactNumber = "+91 98765 43210";

  return (
    <div className="min-h-screen bg-[#FDFCF7] pb-24">

      {/* ================================================================== */}
      {/* Header */}
      {/* ================================================================== */}

      <header className="sticky top-0 z-40 border-b border-[#DDE7E3] bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-2xl items-center justify-between gap-3 px-5">

          {/* Clickable FYNDO Logo */}
          <button
            type="button"
            onClick={() => setLocation("/jobs")}
            className="flex items-center rounded-lg p-0 transition-opacity duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary/30"
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


        </div>
      </header>

      {/* ================================================================== */}
      {/* Main Content */}
      {/* ================================================================== */}

      <main className="mx-auto max-w-2xl px-5 py-6">

        {/* ================================================================= */}
        {/* Profile Card */}
        {/* ================================================================= */}

        <Card className="overflow-hidden rounded-3xl border border-[#DCE7E3] bg-white shadow-[0_8px_28px_rgba(31,55,46,0.075)]">

          <CardContent className="p-5 sm:p-6">

            {/* Profile Identity */}
            <div className="flex items-center gap-4">

              {/* Avatar */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary shadow-[0_8px_20px_rgba(31,55,46,0.14)]">
                <span className="text-2xl font-bold text-primary-foreground">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Name + Role */}
              <div className="min-w-0 flex-1">

                <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
                  {user?.name}
                </h1>

                <div className="mt-1.5 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1">
                  <span className="text-xs font-semibold text-primary">
                    {user?.userType?.toLowerCase() === "farmer"
                      ? "Farmer"
                      : "Associate"}
                  </span>
                </div>

              </div>

              {/* Edit Profile */}
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setLocation("/edit-profile")
                }
                className="h-10 w-10 shrink-0 rounded-xl border-[#DCE7E3] bg-white hover:bg-primary/5 hover:text-primary"
                data-testid="button-edit-profile"
              >
                <Pencil className="h-4 w-4" />
              </Button>

            </div>

            {/* Contact Details */}
            <div className="mt-6 grid gap-3">

              <div className="flex items-center gap-3 rounded-2xl border border-[#E2EAE7] bg-[#F7F9F8] p-3.5">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Phone className="h-4 w-4 text-primary" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Phone
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-foreground">
                    {formatPhone(user?.phoneNumber)}
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#E2EAE7] bg-[#F7F9F8] p-3.5">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/15">
                  <MapPin className="h-4 w-4 text-accent-foreground" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Location
                  </p>

                  <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                    {user?.location}
                  </p>
                </div>

              </div>

            </div>

          </CardContent>

        </Card>

        {/* ================================================================= */}
        {/* Settings */}
        {/* ================================================================= */}

        <section className="mt-6">

          <div className="mb-3 px-1">
            <h2 className="font-display text-base font-semibold text-foreground">
              Support
            </h2>
          </div>

          <div className="space-y-3">

           

            {/* Contact FYNDO */}
            <Card
              className="rounded-2xl border border-[#DCE7E3] bg-white shadow-[0_6px_20px_rgba(31,55,46,0.055)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(31,55,46,0.08)]"
              data-testid="card-contact"
            >
              <CardContent className="p-0">

                <a
                  href={`tel:${contactNumber}`}
                  className="flex items-center justify-between gap-4 rounded-2xl p-4 transition-colors hover:bg-primary/[0.025]"
                >

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15">
                      <Phone className="h-5 w-5 text-accent-foreground" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">
                        Contact FYNDO
                      </h3>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {contactNumber}
                      </p>
                    </div>

                  </div>

                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />

                </a>

              </CardContent>
            </Card>

          </div>

        </section>

        {/* ================================================================= */}
        {/* Logout */}
        {/* ================================================================= */}

        <div className="mt-6">

          <Button
            onClick={handleLogout}
            variant="outline"
            className="h-11 w-full rounded-xl border-red-200 bg-white font-semibold text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
            data-testid="button-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>

        </div>

      </main>

      {/* ================================================================== */}
      {/* Bottom Navigation */}
      {/* ================================================================== */}

      <BottomNav
        userType={
          user?.userType as
            | "farmer"
            | "associate"
        }
      />

    </div>
  );
}