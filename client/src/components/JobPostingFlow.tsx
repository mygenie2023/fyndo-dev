import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Calendar as CalendarIcon, Users, Clock, DollarSign, X, ArrowLeft, ArrowRight } from "lucide-react";
import fyndoLogo from "@assets/FYNDO_v1.0_1770731684699.png";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { useUser } from "@/lib/userContext";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { format } from "date-fns";
import ServiceTypeGrid from "@/components/ServiceTypeGrid";

interface JobPostingFlowProps {
  onClose: () => void;
  editingJob?: any;
  onSuccess?: () => void;
}

export default function JobPostingFlow({ onClose, editingJob, onSuccess }: JobPostingFlowProps) {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const getDefaultDate = () => {
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    dayAfterTomorrow.setHours(0, 0, 0, 0);
    return dayAfterTomorrow;
  };

  const [formData, setFormData] = useState(() => {
    let selectedDate: Date;
    if (editingJob?.date) {
      const editDate = new Date(editingJob.date);
      const minDate = getDefaultDate();
      selectedDate = editDate >= minDate ? editDate : minDate;
    } else {
      selectedDate = getDefaultDate();
    }
    return {
      serviceType: editingJob?.serviceType || "",
      date: selectedDate,
      duration: editingJob?.duration || 1,
      associatesNeeded: editingJob?.associatesNeeded || 1,
      budget: editingJob?.budget?.toString() || "",
    };
  });

const createJobMutation = useMutation({
  mutationFn: async (jobData: any) => {
    // New job creation
    if (!editingJob) {
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
          p_latitude: Number(jobData.latitude),
          p_longitude: Number(jobData.longitude),
          p_location: jobData.location,
        }
      );

      if (error) throw error;
      return data;
    }

    // Existing job edit
    const { data, error } = await supabase.rpc(
      "update_fyndo_job",
      {
        p_job_id: editingJob.id,
        p_service_type: jobData.serviceType,
        p_date: jobData.date,
        p_time: jobData.time,
        p_duration: jobData.duration,
        p_associates_needed: jobData.associatesNeeded,
        p_skill_level: jobData.skillLevel,
        p_budget: jobData.budget,
        p_latitude: Number(jobData.latitude),
        p_longitude: Number(jobData.longitude),
        p_location: jobData.location,
      }
    );

    if (error) throw error;

    return data;
  },

  onSuccess: (result) => {
    queryClient.invalidateQueries({
      queryKey: ["farmer-jobs", user?.id],
    });

    onSuccess?.();
    onClose();
    setLocation("/jobs");
  },

  onError: (error) => {
    console.error("FYNDO job creation/edit error:", error);
  },
});

  const handleServiceTypeSelect = (type: string) => {
    setFormData({ ...formData, serviceType: type });
    setStep(2);
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    // Validate user
    if (!user) {
      return;
    }

    // Validate all required fields with strict checks
    if (!formData.serviceType || formData.serviceType.trim() === "") {
      return;
    }

    if (!formData.date) {
      return;
    }

    if (!formData.duration || formData.duration < 1) {
      return;
    }

    if (!formData.associatesNeeded || formData.associatesNeeded < 1) {
      return;
    }

    if (!formData.budget || formData.budget.trim() === "") {
      return;
    }

    // Parse budget safely
    const budgetValue = parseInt(formData.budget, 10);
    if (isNaN(budgetValue) || budgetValue <= 0) {
      return;
    }

    // Handle location: When editing, prefer existing job location; otherwise use user location
    // Use explicit null/undefined checks and handle empty strings
    const hasValidEditLocation = editingJob != null && 
                                  editingJob.latitude != null && 
                                  editingJob.latitude !== "" && 
                                  String(editingJob.latitude).trim() !== "" &&
                                  editingJob.longitude != null && 
                                  editingJob.longitude !== "" &&
                                  String(editingJob.longitude).trim() !== "";
    
    const hasValidUserLocation = user.latitude != null && 
                                 user.latitude !== "" && 
                                 String(user.latitude).trim() !== "" &&
                                 user.longitude != null && 
                                 user.longitude !== "" &&
                                 String(user.longitude).trim() !== "";
    
    // Determine which location to use
    let latitude, longitude, location;
    
    if (editingJob) {
      // When editing, use existing job location
      if (!hasValidEditLocation) {
        return;
      }
      latitude = editingJob.latitude;
      longitude = editingJob.longitude;
      location = (editingJob.location && editingJob.location.trim() !== "") 
                 ? editingJob.location 
                 : "Location on file";
    } else {
      // When creating, use user's current location
      if (!hasValidUserLocation) {
        return;
      }
      latitude = user.latitude;
      longitude = user.longitude;
      location = (user.location && user.location.trim() !== "") 
                 ? user.location 
                 : "Your location";
    }

    // Normalize and create the job data with proper types matching schema
    const jobData = {
      farmerId: user.id,
      serviceType: formData.serviceType.trim(),
      date: formData.date.toISOString().split('T')[0], // YYYY-MM-DD format
      time: "09:00",
      duration: formData.duration,
      associatesNeeded: formData.associatesNeeded,
      skillLevel: "Any",
      budget: budgetValue,
      latitude: String(latitude).trim(), // Keep as string (decimal type)
      longitude: String(longitude).trim(), // Keep as string (decimal type)
      location: (location && String(location).trim() !== "") ? String(location).trim() : "Unknown",
    };

    // Final safety check - ensure no empty strings in critical fields
    if (!jobData.latitude || !jobData.longitude || 
        jobData.latitude.trim() === "" || jobData.longitude.trim() === "") {
      return;
    }

    createJobMutation.mutate(jobData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24">
      {/* Top Bar with Branding - Always shown */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-card-border/60 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={fyndoLogo} alt="FYNDO" className="h-8" data-testid="img-logo" />
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{editingJob ? "Edit Job" : "Post a Job"}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Step {step} of 5
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Bar - Reduced Size */}
          <div className="mb-8">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

        {/* Step 1: Service Type */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>What type of work do you need?</CardTitle>
              <CardDescription>Select the service you require</CardDescription>
            </CardHeader>
            <CardContent>
              <ServiceTypeGrid
                selectedService={formData.serviceType}
                onSelectService={handleServiceTypeSelect}
              />
            </CardContent>
          </Card>
        )}

        {/* Step 2: Date */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>When do you need the work done?</CardTitle>
              <CardDescription>Select the date you need associates</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(date) => {
                  if (!date) return;
                  // Extra safety check - enforce minimum date
                  const minDate = getDefaultDate();
                  if (date < minDate) return;
                  setFormData({ ...formData, date });
                }}
                disabled={(date) => {
                  const minDate = getDefaultDate();
                  return date < minDate;
                }}
                className="rounded-md border mx-auto"
              />
            </CardContent>
          </Card>
        )}

        {/* Step 3: Duration */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>How long will the work take?</CardTitle>
              <CardDescription>Number of days required</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Duration</Label>
                  <span className="text-2xl font-bold">{formData.duration} {formData.duration === 1 ? 'day' : 'days'}</span>
                </div>
                <Slider
                  value={[formData.duration]}
                  onValueChange={([value]) => setFormData({ ...formData, duration: value })}
                  min={1}
                  max={30}
                  step={1}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Number of Associates */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>How many workers do you need?</CardTitle>
              <CardDescription>Number of agricultural associates required</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Workers Needed</Label>
                  <span className="text-2xl font-bold">{formData.associatesNeeded}</span>
                </div>
                <Slider
                  value={[formData.associatesNeeded]}
                  onValueChange={([value]) => setFormData({ ...formData, associatesNeeded: value })}
                  min={1}
                  max={20}
                  step={1}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Budget & Preview */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>What's your budget?</CardTitle>
              <CardDescription>Total budget for this work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(() => {
                const minBudget = 650 * formData.duration * formData.associatesNeeded;
                const currentBudget = parseInt(formData.budget) || 0;
                const isValidBudget = currentBudget >= minBudget;
                
                return (
                  <>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Minimum budget calculation:</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ₹650 × {formData.duration} days × {formData.associatesNeeded} workers = <span className="font-bold text-foreground">₹{minBudget}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="budget">Budget (₹) - Minimum ₹{minBudget}</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder={`Minimum ₹${minBudget}`}
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        min={minBudget}
                        data-testid="input-budget"
                      />
                      {formData.budget && !isValidBudget && (
                        <p className="text-sm text-destructive mt-1">
                          Budget must be at least ₹{minBudget}
                        </p>
                      )}
                    </div>
                  </>
                );
              })()}

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Job Preview</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="font-medium">{formData.serviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{format(formData.date, "PPP")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{formData.duration} {formData.duration === 1 ? 'day' : 'days'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Workers:</span>
                    <span className="font-medium">{formData.associatesNeeded}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-medium">₹{formData.budget || '—'}</span>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          {step < 5 && (
            <Button onClick={handleNext} className="flex-1" disabled={!formData.serviceType}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {step === 5 && (
            <Button 
              onClick={handleSubmit} 
              className="flex-1" 
              disabled={!formData.budget || parseInt(formData.budget) < (650 * formData.duration * formData.associatesNeeded) || createJobMutation.isPending}
            >
              {createJobMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
