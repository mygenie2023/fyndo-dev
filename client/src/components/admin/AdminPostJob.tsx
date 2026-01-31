import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, Service } from "@shared/schema";

interface AdminPostJobProps {
  onClose: () => void;
}

export default function AdminPostJob({ onClose }: AdminPostJobProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    farmerId: "",
    serviceType: "",
    date: "",
    duration: 1,
    associatesNeeded: 1,
    budget: "",
  });

  const { data: farmers = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    select: (users) => users.filter((u) => u.userType === "farmer" || u.userType === "Farmer"),
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const createJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      const res = await apiRequest("POST", "/api/admin/jobs", jobData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      toast({
        title: "Job Posted",
        description: "Job has been successfully posted on behalf of the farmer.",
      });
      onClose();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to post job.",
      });
    },
  });

  const selectedFarmer = farmers.find((f) => f.id === formData.farmerId);
  const minBudget = 650 * formData.duration * formData.associatesNeeded;

  const handleSubmit = () => {
    if (!formData.farmerId || !formData.serviceType || !formData.date || !formData.budget) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    const budgetValue = parseInt(formData.budget);
    if (budgetValue < minBudget) {
      toast({
        variant: "destructive",
        title: "Budget Too Low",
        description: `Minimum budget is ₹${minBudget}`,
      });
      return;
    }

    createJobMutation.mutate({
      farmerId: formData.farmerId,
      serviceType: formData.serviceType,
      date: formData.date,
      time: "09:00",
      duration: formData.duration,
      associatesNeeded: formData.associatesNeeded,
      budget: budgetValue,
      skillLevel: "Any",
      latitude: selectedFarmer?.latitude || "0",
      longitude: selectedFarmer?.longitude || "0",
      location: selectedFarmer?.location || "Unknown",
    });
  };

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">
      <CardHeader className="flex flex-row items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-back">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <CardTitle>Post a Job (Admin)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Select Farmer</Label>
            <Select
              value={formData.farmerId}
              onValueChange={(value) => setFormData({ ...formData, farmerId: value })}
            >
              <SelectTrigger data-testid="select-farmer">
                <SelectValue placeholder="Select a farmer" />
              </SelectTrigger>
              <SelectContent>
                {farmers.map((farmer) => (
                  <SelectItem key={farmer.id} value={farmer.id}>
                    {farmer.name} - {farmer.phoneNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Service Type</Label>
            <Select
              value={formData.serviceType}
              onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
            >
              <SelectTrigger data-testid="select-service">
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.name}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
              data-testid="input-date"
            />
          </div>

          <div className="space-y-2">
            <Label>Duration (days)</Label>
            <Input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
              min={1}
              max={30}
              data-testid="input-duration"
            />
          </div>

          <div className="space-y-2">
            <Label>Workers Needed</Label>
            <Input
              type="number"
              value={formData.associatesNeeded}
              onChange={(e) => setFormData({ ...formData, associatesNeeded: parseInt(e.target.value) || 1 })}
              min={1}
              max={20}
              data-testid="input-workers"
            />
          </div>

          <div className="space-y-2">
            <Label>Budget (₹) - Min ₹{minBudget}</Label>
            <Input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder={`Min ₹${minBudget}`}
              min={minBudget}
              data-testid="input-budget"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createJobMutation.isPending}
            className="flex-1"
            data-testid="button-submit"
          >
            {createJobMutation.isPending ? "Posting..." : "Post Job"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
