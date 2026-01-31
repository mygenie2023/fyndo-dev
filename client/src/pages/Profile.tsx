import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { 
  User, 
  MapPin, 
  Phone, 
  Bell, 
  BellOff,
  LogOut, 
  ChevronRight,
  Tractor,
  Briefcase,
  Pencil,
  Navigation,
  X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/lib/userContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SkillSelection from "@/components/SkillSelection";
import { reverseGeocode } from "@/lib/geocoding";
import { useState } from "react";

export default function Profile() {
  const { t } = useTranslation();
  const { user, setUser } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [showSkillSelection, setShowSkillSelection] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    phoneNumber: user?.phoneNumber || "",
    location: user?.location || "",
    latitude: user?.latitude || null,
    longitude: user?.longitude || null,
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      const res = await apiRequest("PATCH", `/api/users/${user?.id}`, updates);
      return await res.json();
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
      });
    },
  });

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const locationName = await reverseGeocode(lat, lng);
          setEditForm({
            ...editForm,
            location: editForm.location || locationName,
            latitude: lat.toString(),
            longitude: lng.toString(),
          });
          setIsDetectingLocation(false);
        },
        () => {
          toast({
            variant: "destructive",
            title: "Location Error",
            description: "Unable to detect your location.",
          });
          setIsDetectingLocation(false);
        }
      );
    } else {
      setIsDetectingLocation(false);
    }
  };

  const handleSaveProfile = () => {
    if (!editForm.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Name is required.",
      });
      return;
    }
    if (!editForm.location.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Location is required.",
      });
      return;
    }
    updateProfileMutation.mutate({
      name: editForm.name.trim(),
      location: editForm.location.trim(),
      latitude: editForm.latitude,
      longitude: editForm.longitude,
    });
  };

  const handleLogout = () => {
    setUser(null);
    setLocation("/");
  };

  const contactNumber = "+91 98765 43210"; // FYNDO contact number

  // Show skill selection if managing skills
  if (showSkillSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24">
        {/* Top Bar with Branding and Language Switcher */}
        <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-card-border/60 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSkillSelection(false)}
                data-testid="button-back-skills"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Tractor className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <span className="font-bold text-lg">FYNDO</span>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </header>
        
        <SkillSelection onComplete={() => {
          setShowSkillSelection(false);
          setLocation("/jobs");
        }} />
        
        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    );
  }

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
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Edit Profile</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(false)}
                      data-testid="button-cancel-edit"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Enter your name"
                      data-testid="input-edit-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <Input
                      id="phone"
                      value={editForm.phoneNumber}
                      disabled
                      className="bg-muted"
                      data-testid="input-edit-phone"
                    />
                    <p className="text-xs text-muted-foreground">Mobile number cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="Enter your location"
                      data-testid="input-edit-location"
                    />
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={handleDetectLocation}
                      disabled={isDetectingLocation}
                      data-testid="button-detect-location"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      {isDetectingLocation ? "Detecting..." : "Use Current Location"}
                    </Button>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              ) : (
                <>
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
                            {user?.userType === "farmer" ? "Farmer" : "Associate"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditForm({
                          name: user?.name || "",
                          phoneNumber: user?.phoneNumber || "",
                          location: user?.location || "",
                          latitude: user?.latitude || null,
                          longitude: user?.longitude || null,
                        });
                        setIsEditing(true);
                      }}
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
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Settings Section */}
        <div className="space-y-3">
          {/* Skills (Associate only) */}
          {user?.userType === "associate" && (
            <Card 
              className="hover-elevate transition-all duration-300 cursor-pointer" 
              data-testid="card-manage-skills"
              onClick={() => setShowSkillSelection(true)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Manage Skills</h4>
                      <p className="text-xs text-muted-foreground">Update your work preferences</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          )}

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
