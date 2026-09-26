import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import fyndoLogo from "@assets/FYNDO_v1.0_1770731684699.png";
import { useAdmin } from "@/lib/adminContext";
import AdminJobs from "@/components/admin/AdminJobs";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminServices from "@/components/admin/AdminServices";

type AdminTab = "jobs" | "users" | "services";

/**
 * Reads the active admin tab from the URL query parameter.
 *
 * Examples:
 * /app/admin/dashboard?tab=jobs
 * /app/admin/dashboard?tab=users
 * /app/admin/dashboard?tab=services
 *
 * Defaults to "jobs" when no valid tab is specified.
 */
const getTabFromUrl = (): AdminTab => {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");

  if (tab === "users" || tab === "services") {
    return tab;
  }

  return "jobs";
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { admin, logout } = useAdmin();

  const [activeTab, setActiveTab] = useState<AdminTab>(
    getTabFromUrl()
  );

  /**
   * Redirect to Admin Login if there is no active admin session.
   */
  useEffect(() => {
    if (!admin) {
      setLocation("/admin");
    }
  }, [admin, setLocation]);

  /**
   * Handle browser Back / Forward navigation.
   *
   * Example:
   * Users
   *   ↓
   * User Details
   *   ↓
   * Back
   *   ↓
   * Users tab
   */
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getTabFromUrl());
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  /**
   * Change the active Admin tab.
   *
   * IMPORTANT:
   * We intentionally do NOT use import.meta.env.BASE_URL here.
   *
   * Vite is already configured with:
   *   base: "/app/"
   *
   * Therefore adding BASE_URL manually can result in:
   *   /app/app/admin/dashboard
   *
   * Instead, we preserve the current pathname and only update
   * the query parameter.
   */
  const handleTabChange = (value: string) => {
    if (
      value !== "jobs" &&
      value !== "users" &&
      value !== "services"
    ) {
      return;
    }

    const tab = value as AdminTab;

    // Update React state immediately.
    setActiveTab(tab);

    // Preserve the existing pathname, including /app.
    const url = new URL(window.location.href);

    // Update only the tab query parameter.
    url.searchParams.set("tab", tab);

    // Add a browser history entry.
    //
    // Example:
    // /app/admin/dashboard?tab=jobs
    // becomes
    // /app/admin/dashboard?tab=users
    //
    // It will NEVER create /app/app/...
    window.history.pushState(
      { tab },
      "",
      `${url.pathname}?${url.searchParams.toString()}`
    );
  };

  /**
   * Logout the admin user.
   */
  const handleLogout = () => {
    logout();
    setLocation("/admin");
  };

  /**
   * Do not render the dashboard if the admin session is missing.
   */
  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-xl border-b border-card-border/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={fyndoLogo}
              alt="FYNDO"
              className="h-8"
              data-testid="img-logo"
            />

            <span className="text-sm font-medium text-muted-foreground">
              Admin
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          {/* Admin Navigation Tabs */}
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mx-auto">
            <TabsTrigger
              value="jobs"
              data-testid="tab-jobs"
            >
              Jobs
            </TabsTrigger>

            <TabsTrigger
              value="users"
              data-testid="tab-users"
            >
              Users
            </TabsTrigger>

            <TabsTrigger
              value="services"
              data-testid="tab-services"
            >
              Services
            </TabsTrigger>
          </TabsList>

          {/* Jobs */}
          <TabsContent value="jobs">
            <AdminJobs />
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          {/* Services */}
          <TabsContent value="services">
            <AdminServices />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}