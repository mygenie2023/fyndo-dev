import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { 
  User, 
  MapPin, 
  Phone, 
  Bell, 
  BellOff,
  LogOut, 
  ChevronRight,
  Tractor,
  Pencil,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/lib/userContext";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useState } from "react";

export default function Profile() {
  const { t } = useTranslation();
  const { user, setUser } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const handleLogout = () => {
    setUser(null);
    setLocation("/");
  };

  const contactNumber = "+91 98765 43210"; // FYNDO contact number


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24">
      {/* Top Bar with Branding */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-card-border/60 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md shadow-primary/20">
              <Tractor className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">{t("app.name")}</h1>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Section */}
        <div>
          <Card className="shadow-md">
            <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                      <span className="text-2xl font-bold text-primary-foreground">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{user?.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          <span className="text-xs font-medium">
                            {user?.userType?.toLowerCase() === "farmer" ? "Farmer" : "Associate"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setLocation("/edit-profile")}
                      data-testid="button-edit-profile"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{user?.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{user?.location}</span>
                    </div>
                  </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Section */}
        <div className="space-y-3">
          {/* Alerts Toggle */}
          <Card data-testid="card-alerts-toggle">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    {alertsEnabled ? (
                      <Bell className="w-5 h-5 text-foreground" />
                    ) : (
                      <BellOff className="w-5 h-5 text-foreground" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    <p className="text-xs text-muted-foreground">
                      {alertsEnabled ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={alertsEnabled}
                  onCheckedChange={setAlertsEnabled}
                  data-testid="switch-alerts"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact FYNDO */}
          <Card className="hover-elevate transition-all duration-300 cursor-pointer" data-testid="card-contact">
            <CardContent className="p-4">
              <a href={`tel:${contactNumber}`} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Phone className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Contact FYNDO</h4>
                    <p className="text-xs text-muted-foreground">{contactNumber}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      <BottomNav userType={user?.userType as "farmer" | "associate"} />
    </div>
  );
}
