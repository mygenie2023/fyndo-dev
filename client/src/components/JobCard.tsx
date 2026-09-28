import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  MapPin,
} from "lucide-react";
import { getLocationDisplay } from "@/lib/geocoding";

interface JobCardProps {
  id: string;
  serviceType: string;
  date: string;
  time: string;
  duration: number;
  associatesNeeded: number;
  budget: number;
  location: string;
  latitude?: string | null;
  longitude?: string | null;
  skillLevel: "Beginner" | "Intermediate" | "Expert";
  status?: "Open" | "Assigned" | "Completed";
  interestedCount?: number;
  onExpressInterest?: () => void;
  onViewDetails?: () => void;
  showActions?: boolean;
}

export default function JobCard({
  serviceType,
  date,
  time,
  duration,
  associatesNeeded,
  budget,
  location,
  latitude,
  longitude,
  skillLevel,
  status = "Open",
  interestedCount,
  onExpressInterest,
  onViewDetails,
  showActions = true,
}: JobCardProps) {
  const displayLocation = getLocationDisplay(location, latitude, longitude);

  const skillLevelColors = {
    Beginner:
      "border-secondary bg-secondary/70 text-secondary-foreground",
    Intermediate:
      "border-accent/30 bg-accent/15 text-accent-foreground",
    Expert:
      "border-primary/20 bg-primary/10 text-primary",
  };

  const statusColors = {
    Open:
      "border-primary/20 bg-primary/10 text-primary",
    Assigned:
      "border-accent/30 bg-accent/15 text-accent-foreground",
    Completed:
      "border-muted bg-muted text-muted-foreground",
  };

  return (
    <Card
      className="
        group overflow-hidden rounded-3xl
        border border-border/70
        bg-card
        shadow-card
        transition-all duration-300
        hover:-translate-y-0.5
        hover:shadow-lift
      "
    >
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <h3
              className="font-display text-lg font-bold leading-tight tracking-tight"
              data-testid="text-service-type"
            >
              {serviceType}
            </h3>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin
                className="h-3.5 w-3.5 shrink-0 text-primary"
                strokeWidth={2.25}
              />
              <span className="truncate" data-testid="text-location">
                {displayLocation}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <Badge
              variant="outline"
              className={`${skillLevelColors[skillLevel]} rounded-full px-2.5 py-1 text-[11px] font-semibold`}
              data-testid="badge-skill-level"
            >
              {skillLevel}
            </Badge>

            <Badge
              variant="outline"
              className={`${statusColors[status]} rounded-full px-2.5 py-1 text-[11px] font-semibold`}
              data-testid="badge-status"
            >
              {status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors group-hover:bg-muted/40">
            <div className="flex items-start gap-2.5">
              <div className="rounded-xl bg-primary/10 p-2 ring-1 ring-primary/10">
                <Calendar
                  className="h-3.5 w-3.5 text-primary"
                  strokeWidth={2.25}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="mb-0.5 text-[11px] font-medium text-muted-foreground">
                  Date
                </p>
                <p
                  className="truncate text-sm font-semibold"
                  data-testid="text-date"
                >
                  {date}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors group-hover:bg-muted/40">
            <div className="flex items-start gap-2.5">
              <div className="rounded-xl bg-primary/10 p-2 ring-1 ring-primary/10">
                <Clock
                  className="h-3.5 w-3.5 text-primary"
                  strokeWidth={2.25}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="mb-0.5 text-[11px] font-medium text-muted-foreground">
                  Time
                </p>
                <p
                  className="truncate text-sm font-semibold"
                  data-testid="text-time"
                >
                  {time}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors group-hover:bg-muted/40">
            <div className="flex items-start gap-2.5">
              <div className="rounded-xl bg-primary/10 p-2 ring-1 ring-primary/10">
                <Users
                  className="h-3.5 w-3.5 text-primary"
                  strokeWidth={2.25}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="mb-0.5 text-[11px] font-medium text-muted-foreground">
                  Associates
                </p>
                <p
                  className="truncate text-sm font-semibold"
                  data-testid="text-associates"
                >
                  {associatesNeeded} needed
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors group-hover:bg-muted/40">
            <div className="flex items-start gap-2.5">
              <div className="rounded-xl bg-accent/15 p-2 ring-1 ring-accent/20">
                <DollarSign
                  className="h-3.5 w-3.5 text-accent-foreground"
                  strokeWidth={2.25}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="mb-0.5 text-[11px] font-medium text-muted-foreground">
                  Budget
                </p>
                <p
                  className="truncate text-sm font-semibold"
                  data-testid="text-budget"
                >
                  â‚¹{budget}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-sm">
          <span className="font-medium text-muted-foreground">
            Duration:{" "}
            <span className="text-foreground">
              {duration} days
            </span>
          </span>

          {interestedCount !== undefined && interestedCount > 0 && (
            <span
              className="flex items-center gap-1.5 font-semibold text-primary"
              data-testid="text-interested-count"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              {interestedCount} interested
            </span>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="gap-2.5 pb-5 pt-0">
          {onExpressInterest && (
            <Button
              onClick={onExpressInterest}
              className="flex-1 rounded-xl font-semibold shadow-sm"
              data-testid="button-express-interest"
            >
              Express Interest
            </Button>
          )}

          {onViewDetails && (
            <Button
              onClick={onViewDetails}
              variant="outline"
              className="flex-1 rounded-xl font-semibold"
              data-testid="button-view-details"
            >
              View Details
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}