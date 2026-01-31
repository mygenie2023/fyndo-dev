import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, X } from "lucide-react";
import { useUser } from "@/lib/userContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const availableSkills = [
  "Ploughing",
  "Harvesting",
  "Sowing",
  "Irrigation",
  "Fertilizing",
  "Weeding",
  "Pesticide Application",
  "General Farm Work",
  "Livestock Care",
  "Machinery Operation",
];

export default function EditProfile() {
  const [, setLocation] = useLocation();
  const { user, setUser } = useUser();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phoneNumber || "",
    skills: (user?.skills || []) as string[],
    skillLevel: user?.skillLevel || "Beginner",
    hourlyRate: user?.hourlyRate || 100,
  });

  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phoneNumber,
        skills: (user.skills || []) as string[],
        skillLevel: user.skillLevel || "Beginner",
        hourlyRate: user.hourlyRate || 100,
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", `/api/users/${user?.id}`, data);
      return await res.json();
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}`] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
        duration: 3000,
      });
      setLocation("/profile");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const handleSave = () => {
    if (!user || !user.id) {
      toast({
        title: "Error",
        description: "User information not available",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!formData.name || formData.name.trim() === "") {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const updates: any = {
      name: formData.name.trim(),
    };

    if (user.userType === "associate") {
      if (formData.skills.length === 0) {
        toast({
          title: "Error",
          description: "Please select at least one skill",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      updates.skills = formData.skills;
      updates.skillLevel = formData.skillLevel;
      updates.hourlyRate = formData.hourlyRate;
    }

    updateProfileMutation.mutate(updates);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 bg-card border-b border-card-border z-40 px-4 h-14 flex items-center">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setLocation("/profile")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold ml-2">Edit Profile</h1>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                data-testid="input-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                disabled
                data-testid="input-phone"
              />
              <p className="text-xs text-muted-foreground">
                Contact support to change your phone number
              </p>
            </div>
          </CardContent>
        </Card>

        {user.userType === "associate" && (
          <Card>
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skill-level">Skill Level</Label>
                <Select
                  value={formData.skillLevel}
                  onValueChange={(value) =>
                    setFormData({ ...formData, skillLevel: value })
                  }
                >
                  <SelectTrigger id="skill-level" data-testid="select-skill-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Your Skills</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} className="gap-1" data-testid={`badge-skill-${skill}`}>
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover-elevate rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Select value={newSkill} onValueChange={addSkill}>
                  <SelectTrigger data-testid="select-add-skill">
                    <SelectValue placeholder="Add a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSkills
                      .filter((skill) => !formData.skills.includes(skill))
                      .map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate">
                  Hourly Rate: ₹{formData.hourlyRate}
                </Label>
                <Slider
                  id="rate"
                  min={50}
                  max={500}
                  step={10}
                  value={[formData.hourlyRate]}
                  onValueChange={(value) =>
                    setFormData({ ...formData, hourlyRate: value[0] })
                  }
                  data-testid="slider-hourly-rate"
                />
                <p className="text-xs text-muted-foreground">
                  Set your hourly rate between ₹50 - ₹500
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="sticky bottom-0 bg-background pt-4">
          <Button
            onClick={handleSave}
            disabled={updateProfileMutation.isPending}
            className="w-full h-12"
            data-testid="button-save"
          >
            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
