import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import ProgressSteps from "@/components/ProgressSteps";
import ServiceTypeGrid from "@/components/ServiceTypeGrid";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/lib/userContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function CreateJob() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceType: "",
    date: "",
    time: "",
    duration: 1,
    associatesNeeded: 1,
    skillLevel: "",
    budget: "",
  });

  const createJobMutation = useMutation({
  mutationFn: async (jobData: any) => {
    const { data, error } = await supabase.rpc(
      "create_fyndo_job",
      {
        p_farmer_id: jobData.farmerId,
        p_service_type: jobData.serviceType,
        p_date: jobData.date,
        p_time: jobData.time,
        p_duration: jobData.duration,
        p_associates_needed: jobData.associatesNeeded,
        p_skill_level: jobData.skillLevel,
        p_budget: jobData.budget,
        p_latitude: jobData.latitude,
        p_longitude: jobData.longitude,
        p_location: jobData.location,
      }
    );

    if (error) {
      console.error("FYNDO create job error:", error);
      throw error;
    }

    return data;
  },

  onSuccess: () => {
    toast({
      title: "Success!",
      description: "Job posted successfully",
      duration: 3000,
    });

    if (user?.id) {
      queryClient.invalidateQueries({
        queryKey: ["farmer-jobs", user.id],
      });
    }

    setLocation("/my-jobs");
  },

  onError: (error) => {
    console.error("FYNDO create job failed:", error);

    toast({
      title: "Error",
      description: "Failed to create job",
      variant: "destructive",
      duration: 3000,
    });
  },
});

  const steps = ["Service", "Schedule", "Team", "Budget", "Review"];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      if (!user?.latitude || !user?.longitude) {
        toast({ title: "Error", description: "Location not set in profile", variant: "destructive", duration: 3000 });
        return;
      }

      createJobMutation.mutate({
        farmerId: user.id,
        serviceType: formData.serviceType,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        associatesNeeded: formData.associatesNeeded,
        skillLevel: formData.skillLevel,
        budget: parseInt(formData.budget),
        latitude: user.latitude,
        longitude: user.longitude,
        location: user.location || "Unknown location",
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setLocation("/dashboard");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-base mb-3 block">Select Service Type</Label>
              <ServiceTypeGrid
                selectedService={formData.serviceType}
                onSelectService={(service) =>
                  setFormData({ ...formData, serviceType: service })
                }
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date Required</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                data-testid="input-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                data-testid="input-time"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days): {formData.duration}</Label>
              <Slider
                id="duration"
                min={1}
                max={30}
                step={1}
                value={[formData.duration]}
                onValueChange={(value) =>
                  setFormData({ ...formData, duration: value[0] })
                }
                data-testid="slider-duration"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="associates">Number of Associates: {formData.associatesNeeded}</Label>
              <Slider
                id="associates"
                min={1}
                max={20}
                step={1}
                value={[formData.associatesNeeded]}
                onValueChange={(value) =>
                  setFormData({ ...formData, associatesNeeded: value[0] })
                }
                data-testid="slider-associates"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skill">Skill Level Required</Label>
              <Select
                value={formData.skillLevel}
                onValueChange={(value) =>
                  setFormData({ ...formData, skillLevel: value })
                }
              >
                <SelectTrigger id="skill" data-testid="select-skill">
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Estimated Budget (₹)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="Enter budget amount"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
                data-testid="input-budget"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This is an estimated budget for the entire job. You can negotiate final
              payment with selected associates.
            </p>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-lg">Job Summary</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Service Type</p>
                    <p className="font-medium">{formData.serviceType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">{formData.date}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Time</p>
                    <p className="font-medium">{formData.time}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">{formData.duration} days</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Associates</p>
                    <p className="font-medium">{formData.associatesNeeded}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Skill Level</p>
                    <p className="font-medium">{formData.skillLevel}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Budget</p>
                    <p className="font-medium text-lg text-primary">₹{formData.budget}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 bg-card border-b border-card-border z-40 px-4 h-14 flex items-center">
        <Button
          size="icon"
          variant="ghost"
          onClick={handleBack}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold ml-2">Create Job</h1>
      </header>

      <div className="p-4 max-w-2xl mx-auto pb-24">
        <ProgressSteps currentStep={currentStep} totalSteps={5} steps={steps} />

        <div className="mt-6">{renderStep()}</div>

        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-card-border p-4 z-40">
          <div className="max-w-2xl mx-auto flex gap-3">
            {currentStep > 1 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1"
                data-testid="button-previous"
              >
                Previous
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1"
              disabled={createJobMutation.isPending}
              data-testid="button-next"
            >
              {createJobMutation.isPending ? "Posting..." : currentStep === 5 ? "Post Job" : "Next"}
              {currentStep < 5 && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
