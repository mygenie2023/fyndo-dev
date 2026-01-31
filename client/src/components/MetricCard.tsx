import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function MetricCard({
  icon: Icon,
  label,
  value,
  description,
  trend,
}: MetricCardProps) {
  return (
    <Card className="hover-elevate group transition-all duration-300 shadow-sm hover:shadow-md border-card-border/60 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardContent className="p-5 relative">
        <div className="flex flex-col items-start gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 p-3.5 ring-1 ring-primary/10 transition-all duration-300 group-hover:scale-105 group-hover:ring-primary/20">
            <Icon className="w-5 h-5 text-primary" strokeWidth={2.25} />
          </div>
          <div className="w-full">
            <h2 className="text-2xl font-bold tracking-tight mb-1" data-testid="text-value">
              {value}
            </h2>
            <p className="text-xs text-muted-foreground font-medium" data-testid="text-label">
              {label}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-medium ${
                  trend.isPositive 
                    ? "bg-primary/10 text-primary" 
                    : "bg-destructive/10 text-destructive"
                }`}>
                  <span>{trend.isPositive ? "↑" : "↓"}</span>
                  <span>{Math.abs(trend.value)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
