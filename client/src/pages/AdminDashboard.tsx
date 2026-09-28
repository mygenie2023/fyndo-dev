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
 * /admin/dashboard?tab=jobs
 * /admin/dashboard?tab=users
 * /admin/dashboard?tab=services
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
   * The current pathname is preserved and only the
   * tab query parameter is updated.
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

    // Preserve the current pathname and update
    // only the tab query parameter.
    const url = new URL(window.location.href);

    url.searchParams.set("tab", tab);

    // Add a browser history entry.
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

      {/* ================================================================== */}
      {/* Admin Header */}
      {/* ================================================================== */}

      <div className="sticky top-0 z-50 border-b border-card-border/60 bg-card/90 backdrop-blur-xl">

        <div className="container mx-auto px-4">

          <div className="relative flex min-h-[4.5rem] items-center justify-between">

            {/* ============================================================ */}
            {/* Logo / Admin Brand */}
            {/* ============================================================ */}

            <div className="flex shrink-0 items-center gap-2">
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

            {/* ============================================================ */}
            {/* Center Navigation */}
            {/* ============================================================ */}

            <div className="absolute left-1/2 -translate-x-1/2 overflow-x-auto">

              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
              >

                <TabsList className="inline-flex h-10 w-auto min-w-max gap-1 bg-transparent p-0">

                  {/* Jobs */}

                  <TabsTrigger
                    value="jobs"
                    data-testid="tab-jobs"
                    className="
                      rounded-xl
                      px-4
                      text-sm
                      font-semibold
                      text-muted-foreground
                      transition-all
                      data-[state=active]:bg-primary/10
                      data-[state=active]:text-primary
                      data-[state=active]:shadow-none
                    "
                  >
                    Jobs
                  </TabsTrigger>

                  {/* Users */}

                  <TabsTrigger
                    value="users"
                    data-testid="tab-users"
                    className="
                      rounded-xl
                      px-4
                      text-sm
                      font-semibold
                      text-muted-foreground
                      transition-all
                      data-[state=active]:bg-primary/10
                      data-[state=active]:text-primary
                      data-[state=active]:shadow-none
                    "
                  >
                    Users
                  </TabsTrigger>

                  {/* Services */}

                  <TabsTrigger
                    value="services"
                    data-testid="tab-services"
                    className="
                      rounded-xl
                      px-4
                      text-sm
                      font-semibold
                      text-muted-foreground
                      transition-all
                      data-[state=active]:bg-primary/10
                      data-[state=active]:text-primary
                      data-[state=active]:shadow-none
                    "
                  >
                    Services
                  </TabsTrigger>

                </TabsList>

              </Tabs>

            </div>

            {/* ============================================================ */}
            {/* Logout */}
            {/* ============================================================ */}

            <div className="shrink-0">

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

        </div>

      </div>

      {/* ================================================================== */}
      {/* Dashboard Content */}
      {/* ================================================================== */}

      <div className="container mx-auto px-4 py-8">

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >

          {/*

            The navigation is now displayed in the header.

            This hidden TabsList keeps the Radix Tabs structure
            intact so the existing TabsContent components continue
            to work normally.

          */}

          <TabsList className="hidden">

            <TabsTrigger value="jobs">
              Jobs
            </TabsTrigger>

            <TabsTrigger value="users">
              Users
            </TabsTrigger>

            <TabsTrigger value="services">
              Services
            </TabsTrigger>

          </TabsList>

          {/* ============================================================ */}
          {/* Jobs */}
          {/* ============================================================ */}

          <TabsContent value="jobs">
            <AdminJobs />
          </TabsContent>

          {/* ============================================================ */}
          {/* Users */}
          {/* ============================================================ */}

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          {/* ============================================================ */}
          {/* Services */}
          {/* ============================================================ */}

          <TabsContent value="services">
            <AdminServices />
          </TabsContent>

        </Tabs>

      </div>

    </div>
  );
}