import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import fyndoLogo from "@assets/FYNDO_v1.0_1770731684699.png";
import { useAdmin } from "@/lib/adminContext";
import AdminJobs from "@/components/admin/AdminJobs";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminServices from "@/components/admin/AdminServices";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { admin, logout } = useAdmin();
  const params = new URLSearchParams(window.location.search);
  const initialTab = params.get("tab") || "jobs";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (!admin) {
      setLocation("/admin");
    }
  }, [admin, setLocation]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      setLocation("/admin");
    }
  };

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Top Bar */}
      <div className="bg-card/80 backdrop-blur-xl border-b border-card-border/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={fyndoLogo} alt="FYNDO" className="h-8" data-testid="img-logo" />
            <span className="text-sm font-medium text-muted-foreground">Admin</span>
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mx-auto">
            <TabsTrigger value="jobs" data-testid="tab-jobs">
              Jobs
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">
              Users
            </TabsTrigger>
            <TabsTrigger value="services" data-testid="tab-services">
              Services
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs">
            <AdminJobs />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="services">
            <AdminServices />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
