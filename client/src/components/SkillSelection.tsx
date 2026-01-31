import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/userContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Service } from "@shared/schema";

interface SkillSelectionProps {
  onComplete?: () => void;
}

export default function SkillSelection({ onComplete }: SkillSelectionProps = {}) {
  const { user, setUser } = useUser();
  const [selectedSkills, setSelectedSkills] = useState<string[]>(user?.skills || []);

  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const updateSkillsMutation = useMutation({
    mutationFn: async (skills: string[]) => {
      const res = await apiRequest("PATCH", `/api/users/${user?.id}/skills`, { skills });
      return await res.json();
    },
    onSuccess: (data) => {
      setUser(data);
      // Invalidate all nearby jobs queries to refetch with updated skills
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/nearby'] });
      if (onComplete) {
        onComplete();
      }
    },
    onError: () => {
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

  const activeServices = services.filter(s => s.isActive === 1);

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
