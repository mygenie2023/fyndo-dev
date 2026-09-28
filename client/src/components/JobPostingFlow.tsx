import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Calendar as CalendarIcon,
  Users,
  Clock,
  DollarSign,
  X,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  IndianRupee,
} from "lucide-react";
import fyndoLogo from "@assets/FYNDO_v1.0_1770731684699.png";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import { useUser } from "@/lib/userContext";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import ServiceTypeGrid from "@/components/ServiceTypeGrid";

interface JobPostingFlowProps {
  onClose: () => void;
  editingJob?: any;
  onSuccess?: () => void;
}

export default function JobPostingFlow({
  onClose,
  editingJob,
  onSuccess,
}: JobPostingFlowProps) {
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

    onSuccess: () => {
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
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    if (!user) {
      return;
    }

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

    const budgetValue = parseInt(formData.budget, 10);

    if (isNaN(budgetValue) || budgetValue <= 0) {
      return;
    }

    const hasValidEditLocation =
      editingJob != null &&
      editingJob.latitude != null &&
      editingJob.latitude !== "" &&
      String(editingJob.latitude).trim() !== "" &&
      editingJob.longitude != null &&
      editingJob.longitude !== "" &&
      String(editingJob.longitude).trim() !== "";

    const hasValidUserLocation =
      user.latitude != null &&
      user.latitude !== "" &&
      String(user.latitude).trim() !== "" &&
      user.longitude != null &&
      user.longitude !== "" &&
      String(user.longitude).trim() !== "";

    let latitude;
    let longitude;
    let location;

    if (editingJob) {
      if (!hasValidEditLocation) {
        return;
      }

      latitude = editingJob.latitude;
      longitude = editingJob.longitude;

      location =
        editingJob.location && editingJob.location.trim() !== ""
          ? editingJob.location
          : "Location on file";
    } else {
      if (!hasValidUserLocation) {
        return;
      }

      latitude = user.latitude;
      longitude = user.longitude;

      location =
        user.location && user.location.trim() !== ""
          ? user.location
          : "Your location";
    }

    const jobData = {
      farmerId: user.id,
      serviceType: formData.serviceType.trim(),
      date: formData.date.toISOString().split("T")[0],
      time: "09:00",
      duration: formData.duration,
      associatesNeeded: formData.associatesNeeded,
      skillLevel: "Any",
      budget: budgetValue,
      latitude: String(latitude).trim(),
      longitude: String(longitude).trim(),
      location:
        location && String(location).trim() !== ""
          ? String(location).trim()
          : "Unknown",
    };

    if (
      !jobData.latitude ||
      !jobData.longitude ||
      jobData.latitude.trim() === "" ||
      jobData.longitude.trim() === ""
    ) {
      return;
    }

    createJobMutation.mutate(jobData);
  };

  const minBudget =
    650 * formData.duration * formData.associatesNeeded;

  const currentBudget = parseInt(formData.budget) || 0;
  const isValidBudget = currentBudget >= minBudget;

  const stepLabels = [
    "Service",
    "Date",
    "Duration",
    "Workers",
    "Budget",
  ];

  return (
    <div className="min-h-screen bg-[#FDFCF7] pb-10 text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#DDE7E3] bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-2xl items-center justify-between gap-3 px-5">
          <button
            type="button"
            onClick={() => {
  onClose();
  setLocation("/jobs");
}}
            className="flex items-center rounded-lg border-0 bg-transparent p-0 transition-opacity duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Go to FYNDO home"
            data-testid="button-fyndo-home"
          >
            <img
              src={fyndoLogo}
              alt="FYNDO"
              className="h-8 w-auto"
              data-testid="img-logo"
            />
          </button>

          <div className="flex items-center gap-2">

            <Button
  type="button"
  variant="outline"
  onClick={onClose}
  className="h-10 rounded-xl border-[#DCE7E3] bg-[#F7F9F8] px-4 text-sm font-semibold text-[#1F372E] shadow-sm transition-all hover:bg-[#EAF1EE] hover:shadow-md"
  data-testid="button-close"
  aria-label="Cancel"
>
  Cancel
</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-5 sm:py-8">
        {/* Page Heading */}
        

        {/* Step 1 */}
        {step === 1 && (
          <Card className="overflow-hidden rounded-3xl border-[#DCE7E3] bg-white shadow-[0_10px_32px_rgba(31,55,46,0.075)]">
            <CardHeader className="border-b border-[#E8EFEC] bg-[#FAFCFB] px-5 py-5 sm:px-6">
              

              <CardTitle className="font-display text-xl text-[#1F372E]">
                What type of work do you need?
              </CardTitle>

              <CardDescription className="mt-1">
                Select the service you require
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 sm:p-6">
              <ServiceTypeGrid
                selectedService={formData.serviceType}
                onSelectService={handleServiceTypeSelect}
              />
            </CardContent>
          </Card>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <Card className="overflow-hidden rounded-3xl border-[#DCE7E3] bg-white shadow-[0_10px_32px_rgba(31,55,46,0.075)]">
            <CardHeader className="border-b border-[#E8EFEC] bg-[#FAFCFB] px-5 py-5 sm:px-6">
              
              <CardTitle className="font-display text-xl text-[#1F372E]">
                When do you need the work done?
              </CardTitle>

              <CardDescription className="mt-1">
                Select the date you need associates
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 sm:p-6">
              <div className="rounded-2xl border border-[#E2EAE7] bg-[#F7F9F8] p-3 sm:p-4">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => {
                    if (!date) return;

                    const minDate = getDefaultDate();

                    if (date < minDate) return;

                    setFormData({
                      ...formData,
                      date,
                    });
                  }}
                  disabled={(date) => {
                    const minDate = getDefaultDate();
                    return date < minDate;
                  }}
                  className="mx-auto rounded-2xl bg-white"
                />
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#E8DDBF] bg-[#FCF7E9] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4DFA7] text-[#856A1D]">
                  <CalendarIcon className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Selected date
                  </p>
                  <p className="font-display text-base font-semibold text-[#1F372E]">
                    {format(formData.date, "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <Card className="overflow-hidden rounded-3xl border-[#DCE7E3] bg-white shadow-[0_10px_32px_rgba(31,55,46,0.075)]">
            <CardHeader className="border-b border-[#E8EFEC] bg-[#FAFCFB] px-5 py-5 sm:px-6">
              
              <CardTitle className="font-display text-xl text-[#1F372E]">
                How long will the work take?
              </CardTitle>

              <CardDescription className="mt-1">
                Number of days required
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 sm:p-6">
              <div className="rounded-3xl border border-[#E2EAE7] bg-[#F7F9F8] p-5 sm:p-6">
                <div className="mb-7 flex items-end justify-between gap-4">
                  <div>
                    
                    <p className="mt-1 text-sm text-muted-foreground">
                      Choose how many days the work will take.
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-display text-4xl font-bold text-primary">
                      {formData.duration}
                    </span>
                    <span className="ml-1 text-sm font-medium text-muted-foreground">
                      {formData.duration === 1 ? "day" : "days"}
                    </span>
                  </div>
                </div>

                <Slider
                  value={[formData.duration]}
                  onValueChange={([value]) =>
                    setFormData({
                      ...formData,
                      duration: value,
                    })
                  }
                  min={1}
                  max={30}
                  step={1}
                  className="mt-2"
                />

                <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>1 day</span>
                  <span>30 days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <Card className="overflow-hidden rounded-3xl border-[#DCE7E3] bg-white shadow-[0_10px_32px_rgba(31,55,46,0.075)]">
            <CardHeader className="border-b border-[#E8EFEC] bg-[#FAFCFB] px-5 py-5 sm:px-6">
              

              <CardTitle className="font-display text-xl text-[#1F372E]">
                How many workers do you need?
              </CardTitle>

              <CardDescription className="mt-1">
                Number of workers required
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 sm:p-6">
              <div className="rounded-3xl border border-[#E2EAE7] bg-[#F7F9F8] p-5 sm:p-6">
                <div className="mb-7 flex items-end justify-between gap-4">
                  <div>
                    
                    <p className="mt-1 text-sm text-muted-foreground">
                      Select the number of workers required.
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-display text-4xl font-bold text-primary">
                      {formData.associatesNeeded}
                    </span>
                    <span className="ml-1 text-sm font-medium text-muted-foreground">
                      {formData.associatesNeeded === 1
                        ? "worker"
                        : "workers"}
                    </span>
                  </div>
                </div>

                <Slider
                  value={[formData.associatesNeeded]}
                  onValueChange={([value]) =>
                    setFormData({
                      ...formData,
                      associatesNeeded: value,
                    })
                  }
                  min={1}
                  max={20}
                  step={1}
                  className="mt-2"
                />

                <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>1 worker</span>
                  <span>20 workers</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <Card className="overflow-hidden rounded-3xl border-[#DCE7E3] bg-white shadow-[0_10px_32px_rgba(31,55,46,0.075)]">
            <CardHeader className="border-b border-[#E8EFEC] bg-[#FAFCFB] px-5 py-5 sm:px-6">
              
              <CardTitle className="font-display text-xl text-[#1F372E]">
                What's your budget?
              </CardTitle>

              <CardDescription className="mt-1">
                Set the total budget for this work
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 p-5 sm:p-6">
              {/* Minimum Budget */}
              <div className="rounded-2xl border border-[#E8DDBF] bg-[#FCF7E9] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4DFA7] text-[#856A1D]">
                    <IndianRupee className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#5E501F]">
                      Minimum recommended budget
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      ₹650 × {formData.duration}{" "}
                      {formData.duration === 1 ? "day" : "days"} ×{" "}
                      {formData.associatesNeeded}{" "}
                      {formData.associatesNeeded === 1
                        ? "worker"
                        : "workers"}
                    </p>

                    <p className="mt-1 font-display text-xl font-bold text-[#1F372E]">
                      ₹{minBudget.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Budget Input */}
              <div>
                <Label
                  htmlFor="budget"
                  className="mb-2 block text-sm font-semibold text-[#1F372E]"
                >
                  Budget (₹)
                </Label>

                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="budget"
                    type="number"
                    placeholder={`Minimum ₹${minBudget}`}
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget: e.target.value,
                      })
                    }
                    min={minBudget}
                    className="h-12 rounded-xl border-[#DCE7E3] bg-white pl-10 text-base shadow-sm focus-visible:ring-primary/30"
                    data-testid="input-budget"
                  />
                </div>

                {formData.budget && !isValidBudget && (
                  <p className="mt-2 text-sm text-destructive">
                    Budget must be at least ₹{minBudget}
                  </p>
                )}
              </div>

              {/* Job Preview */}
              <div className="border-t border-[#E8EFEC] pt-5">
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-semibold text-[#1F372E]">
                    Job Preview
                  </h3>
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#E2EAE7]">
                  <div className="grid grid-cols-1 divide-y divide-[#E2EAE7] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                    <div className="bg-[#F7F9F8] p-4">
                      <p className="text-xs font-medium text-muted-foreground">
                        Service
                      </p>
                      <p className="mt-1 font-semibold text-[#1F372E]">
                        {formData.serviceType}
                      </p>
                    </div>

                    <div className="bg-white p-4">
                      <p className="text-xs font-medium text-muted-foreground">
                        Date
                      </p>
                      <p className="mt-1 font-semibold text-[#1F372E]">
                        {format(formData.date, "PPP")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 divide-y divide-[#E2EAE7] border-t sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                    <div className="bg-white p-4">
                      <p className="text-xs font-medium text-muted-foreground">
                        Duration
                      </p>
                      <p className="mt-1 font-semibold text-[#1F372E]">
                        {formData.duration}{" "}
                        {formData.duration === 1 ? "day" : "days"}
                      </p>
                    </div>

                    <div className="bg-[#F7F9F8] p-4">
                      <p className="text-xs font-medium text-muted-foreground">
                        Workers
                      </p>
                      <p className="mt-1 font-semibold text-[#1F372E]">
                        {formData.associatesNeeded}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#E2EAE7] bg-primary/5 p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      Total Budget
                    </p>

                    <p className="mt-1 font-display text-xl font-bold text-primary">
                      ₹{formData.budget || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-5 flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="h-12 flex-1 rounded-xl border-[#DCE7E3] bg-white font-semibold shadow-sm hover:bg-[#F7F9F8]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          {step < 5 && (
            <Button
              onClick={handleNext}
              className="h-12 flex-1 rounded-xl bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary/95 hover:shadow-md"
              disabled={!formData.serviceType}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          {step === 5 && (
            <Button
              onClick={handleSubmit}
              className="h-12 flex-1 rounded-xl bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary/95 hover:shadow-md"
              disabled={
                !formData.budget ||
                parseInt(formData.budget) <
                  650 *
                    formData.duration *
                    formData.associatesNeeded ||
                createJobMutation.isPending
              }
            >
              {createJobMutation.isPending
                ? "Submitting..."
                : editingJob
                  ? "Update Job"
                  : "Post Job"}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}