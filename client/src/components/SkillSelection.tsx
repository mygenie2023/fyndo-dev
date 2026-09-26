import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/userContext";
import { supabase } from "@/lib/supabase";
import type { Service } from "@shared/schema";

interface SkillSelectionProps {
  onComplete?: () => void;
}

export default function SkillSelection({ onComplete }: SkillSelectionProps = {}) {
  const { user, setUser } = useUser();
  const [selectedSkills, setSelectedSkills] = useState<string[]>(user?.skills || []);

const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
  queryKey: ["services"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("get_fyndo_services");

    if (error) {
      throw error;
    }

    return data || [];
  },
});

  const updateSkillsMutation = useMutation({
  mutationFn: async (skills: string[]) => {
    if (!user?.id) {
      throw new Error("User ID is missing");
    }

    const { error } = await supabase.rpc("update_fyndo_user", {
      p_user_id: user.id,
      p_name: user.name ?? null,
      p_user_type: user.userType ?? null,
      p_latitude: user.latitude ?? null,
      p_longitude: user.longitude ?? null,
      p_location: user.location ?? null,
      p_skills: skills,
      p_skill_level: user.skillLevel ?? null,
      p_hourly_rate: user.hourlyRate ?? null,
      p_gender: user.gender ?? null,
      p_date_of_birth: user.dateOfBirth ?? null,
      p_expected_daily_salary: user.expectedDailySalary ?? null,
      p_travel_distance: user.travelDistance ?? null,
      p_comfortable_staying: user.comfortableStaying ?? null,
      p_aadhar_front_url: user.aadharFrontUrl ?? null,
      p_aadhar_back_url: user.aadharBackUrl ?? null,
    });

    if (error) {
      throw error;
    }

    return skills;
  },

  onSuccess: (skills) => {
    if (user) {
      setUser({
        ...user,
        skills,
      });
    }

    if (onComplete) {
      onComplete();
    }
  },

  onError: (error) => {
    console.error("FYNDO skill update error:", error);
  },
});

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = () => {
    if (selectedSkills.length > 0) {
      updateSkillsMutation.mutate(selectedSkills);
    }
  };

  if (servicesLoading) {
    return (
      <div className="px-4 py-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading services...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

const activeServices = services.filter(s => s.is_active === true);

  return (
    <div className="px-4 py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Select Your Skills</CardTitle>
          <CardDescription>
            Choose the types of work you're interested in. This helps us match you with relevant jobs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {activeServices.map((service) => (
              <Button
                key={service.id}
                variant={selectedSkills.includes(service.name) ? "default" : "outline"}
                className="h-auto py-4 text-left justify-start relative"
                onClick={() => toggleSkill(service.name)}
                data-testid={`skill-${service.name}`}
              >
                {service.name}
                {selectedSkills.includes(service.name) && (
                  <Check className="w-4 h-4 ml-auto" />
                )}
              </Button>
            ))}
          </div>

          {activeServices.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No services available at this time.
            </p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={selectedSkills.length === 0 || updateSkillsMutation.isPending}
            className="w-full mt-6"
            data-testid="button-save-skills"
          >
            {updateSkillsMutation.isPending ? "Saving..." : `Continue with ${selectedSkills.length} skill${selectedSkills.length !== 1 ? 's' : ''}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
