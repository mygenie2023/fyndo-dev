import { useTranslation } from "react-i18next";
import { Bell, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/lib/userContext";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import fyndoLogo from "@assets/FYNDO_v1.0_1770731684699.png";

export default function Notifications() {
  const { t } = useTranslation();
  const { user } = useUser();

  // Mock notifications - will be replaced with real data
  const notifications = [
    {
      id: 1,
      type: "reminder",
      title: "Job starting tomorrow",
      message: "Ploughing work at Farm A starts tomorrow",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      type: "action",
      title: "Mark job complete",
      message: "Harvesting work duration ended. Please mark as complete",
      time: "5 hours ago",
      read: false,
    },
    {
      id: 3,
      type: "review",
      title: "Review your experience",
      message: "Rate and review the completed job",
      time: "1 day ago",
      read: true,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "reminder":
        return <Calendar className="w-5 h-5 text-primary" />;
      case "action":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "review":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24">
      {/* Top Bar with Branding */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-card-border/60 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={fyndoLogo} alt="FYNDO" className="h-8" data-testid="img-logo" />
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all duration-300 hover-elevate ${
                  !notification.read ? "border-primary/30 bg-primary/5" : ""
                }`}
                data-testid={`notification-${notification.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{notification.title}</h3>
                        {!notification.read && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                No notifications yet
              </p>
              <p className="text-xs text-muted-foreground">
                We'll notify you about important updates
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNav userType={user?.userType as "farmer" | "associate"} />
    </div>
  );
}
