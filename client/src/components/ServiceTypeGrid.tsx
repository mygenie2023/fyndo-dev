import { Card } from "@/components/ui/card";
import {
  Tractor,
  Wheat,
  Droplets,
  Sprout,
  Bug,
  Users,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Service } from "@shared/schema";

const iconMap: Record<string, any> = {
  Tractor,
  Wheat,
  Droplets,
  Sprout,
  Bug,
  Users,
};

interface ServiceTypeGridProps {
  selectedService?: string;
  onSelectService?: (serviceId: string) => void;
}

export default function ServiceTypeGrid({
  selectedService,
  onSelectService,
}: ServiceTypeGridProps) {
const { data: services = [], isLoading } = useQuery<Service[]>({
  queryKey: ["services"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc(
      "get_fyndo_services"
    );

    if (error) {
      throw error;
    }

    return (data ?? []).map((service: any) => ({
      ...service,
      iconName: service.icon_name,
      isActive: service.is_active,
      createdAt: service.created_at,
    })) as Service[];
  },
});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No services available at the moment
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {services.map((service) => {
        const Icon = iconMap[service.iconName] || Tractor;
        const isSelected = selectedService === service.name;

        return (
          <Card
            key={service.id}
            onClick={() => onSelectService?.(service.name)}
            className={`p-4 cursor-pointer hover-elevate active-elevate-2 transition-all ${
              isSelected ? "bg-primary/10 border-primary" : ""
            }`}
            data-testid={`card-service-${service.id}`}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <div
                className={`rounded-full p-3 ${
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <p
                className={`text-sm font-medium text-center ${
                  isSelected ? "text-primary" : "text-foreground"
                }`}
              >
                {service.name}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
