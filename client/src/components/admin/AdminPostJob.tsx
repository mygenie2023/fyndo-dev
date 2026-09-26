import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { User, Service } from "@shared/schema";
import { supabase } from "@/lib/supabase";

interface AdminPostJobProps {
  onClose: () => void;
}

export default function AdminPostJob({
  onClose,
}: AdminPostJobProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    farmerId: "",
    serviceType: "",
    date: "",
    duration: 1,
    associatesNeeded: 1,
    budget: "",
  });

  const { data: farmerResults = [], isLoading: farmersLoading } =
    useQuery<any[]>({
      queryKey: ["admin", "farmers"],
      queryFn: async () => {
        const { data, error } = await supabase.rpc(
          "admin_get_farmers"
        );

        if (error) {
          console.error(
            "Failed to load farmers:",
            error
          );
          throw error;
        }

        return data || [];
      },
    });

  const farmers: User[] = farmerResults.map((farmer) => ({
    ...farmer,

    phoneNumber: farmer.phone_number,
    userType: farmer.user_type,
    skillLevel: farmer.skill_level,
    hourlyRate: farmer.hourly_rate,
    dateOfBirth: farmer.date_of_birth,
    expectedDailySalary:
      farmer.expected_daily_salary,
    travelDistance: farmer.travel_distance,
    comfortableStaying:
      farmer.comfortable_staying,
    aadharFrontUrl:
      farmer.aadhar_front_url,
    aadharBackUrl:
      farmer.aadhar_back_url,
    averageRating:
      farmer.average_rating,
    totalRatings:
      farmer.total_ratings,
    jobsCompleted:
      farmer.jobs_completed,
    totalEarnings:
      farmer.total_earnings,
    pendingPayments:
      farmer.pending_payments,
    createdAt:
      farmer.created_at,
  }));

  const {
    data: serviceResults = [],
    isLoading: servicesLoading,
  } = useQuery<any[]>({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_fyndo_services"
      );

      if (error) {
        console.error(
          "Failed to load services:",
          error
        );
        throw error;
      }

      return data || [];
    },
  });

  const services: Service[] = serviceResults.map(
    (service) => ({
      ...service,

      iconName:
        service.icon_name ??
        service.iconName,

      isActive:
        service.is_active === true ||
        service.is_active === 1 ||
        service.isActive === true ||
        service.isActive === 1,

      createdAt:
        service.created_at ??
        service.createdAt,
    })
  );

  const createJobMutation = useMutation({
    mutationFn: async (jobData: {
      farmerId: string;
      serviceType: string;
      date: string;
      time: string;
      duration: number;
      associatesNeeded: number;
      skillLevel: string;
      budget: number;
      latitude: number;
      longitude: number;
      location: string;
    }) => {
      const { data, error } = await supabase.rpc(
        "create_fyndo_job",
        {
          p_farmer_id: jobData.farmerId,
          p_service_type: jobData.serviceType,
          p_date: jobData.date,
          p_time: jobData.time,
          p_duration: jobData.duration,
          p_associates_needed:
            jobData.associatesNeeded,
          p_skill_level:
            jobData.skillLevel,
          p_budget: jobData.budget,
          p_latitude:
            jobData.latitude,
          p_longitude:
            jobData.longitude,
          p_location:
            jobData.location,
        }
      );

      if (error) {
        console.error(
          "Failed to create admin job:",
          error
        );
        throw error;
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "jobs"],
      });

      toast({
        title: "Job Posted",
        description:
          "Job has been successfully posted on behalf of the farmer.",
      });

      onClose();
    },

    onError: (error) => {
      console.error(
        "Admin job creation error:",
        error
      );

      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Failed to post job.",
      });
    },
  });

  const selectedFarmer = farmers.find(
    (farmer) =>
      farmer.id === formData.farmerId
  );

  const minBudget =
    650 *
    formData.duration *
    formData.associatesNeeded;

  const handleSubmit = () => {
    if (
      !formData.farmerId ||
      !formData.serviceType ||
      !formData.date ||
      !formData.budget
    ) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description:
          "Please fill in all required fields.",
      });

      return;
    }

    const budgetValue = parseInt(
      formData.budget,
      10
    );

    if (
      Number.isNaN(budgetValue) ||
      budgetValue < minBudget
    ) {
      toast({
        variant: "destructive",
        title: "Budget Too Low",
        description:
          `Minimum budget is ₹${minBudget}`,
      });

      return;
    }

    const latitude = Number(
      selectedFarmer?.latitude ?? 0
    );

    const longitude = Number(
      selectedFarmer?.longitude ?? 0
    );

    createJobMutation.mutate({
      farmerId:
        formData.farmerId,

      serviceType:
        formData.serviceType,

      date:
        formData.date,

      time:
        "09:00",

      duration:
        formData.duration,

      associatesNeeded:
        formData.associatesNeeded,

      skillLevel:
        "Any",

      budget:
        budgetValue,

      latitude:
        Number.isFinite(latitude)
          ? latitude
          : 0,

      longitude:
        Number.isFinite(longitude)
          ? longitude
          : 0,

      location:
        selectedFarmer?.location ||
        "Unknown",
    });
  };

  const isLoading =
    farmersLoading ||
    servicesLoading;

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">
      <CardHeader className="flex flex-row items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <CardTitle>
          Post a Job (Admin)
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Select Farmer
            </Label>

            <Select
              value={formData.farmerId}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  farmerId: value,
                })
              }
              disabled={isLoading}
            >
              <SelectTrigger
                data-testid="select-farmer"
              >
                <SelectValue
                  placeholder={
                    farmersLoading
                      ? "Loading farmers..."
                      : "Select a farmer"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {farmers.map((farmer) => (
                  <SelectItem
                    key={farmer.id}
                    value={farmer.id}
                  >
                    {farmer.name} -{" "}
                    {farmer.phoneNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Service Type
            </Label>

            <Select
              value={formData.serviceType}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  serviceType: value,
                })
              }
              disabled={isLoading}
            >
              <SelectTrigger
                data-testid="select-service"
              >
                <SelectValue
                  placeholder={
                    servicesLoading
                      ? "Loading services..."
                      : "Select service"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {services
                  .filter(
                    (service) =>
                      service.isActive
                  )
                  .map((service) => (
                    <SelectItem
                      key={service.id}
                      value={service.name}
                    >
                      {service.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Date
            </Label>

            <Input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  date: e.target.value,
                })
              }
              min={
                new Date(
                  Date.now() +
                    2 *
                      24 *
                      60 *
                      60 *
                      1000
                )
                  .toISOString()
                  .split("T")[0]
              }
              data-testid="input-date"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Duration (days)
            </Label>

            <Input
              type="number"
              value={formData.duration}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  duration:
                    parseInt(
                      e.target.value,
                      10
                    ) || 1,
                })
              }
              min={1}
              max={30}
              data-testid="input-duration"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Workers Needed
            </Label>

            <Input
              type="number"
              value={
                formData.associatesNeeded
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  associatesNeeded:
                    parseInt(
                      e.target.value,
                      10
                    ) || 1,
                })
              }
              min={1}
              max={20}
              data-testid="input-workers"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Budget (₹) - Min ₹
              {minBudget}
            </Label>

            <Input
              type="number"
              value={formData.budget}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  budget: e.target.value,
                })
              }
              placeholder={`Min ₹${minBudget}`}
              min={minBudget}
              data-testid="input-budget"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={
              createJobMutation.isPending ||
              isLoading
            }
            className="flex-1"
            data-testid="button-submit"
          >
            {createJobMutation.isPending
              ? "Posting..."
              : "Post Job"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}