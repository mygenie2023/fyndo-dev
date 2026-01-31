import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, DollarSign, MapPin } from "lucide-react";
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
    Beginner: "bg-secondary text-secondary-foreground",
    Intermediate: "bg-accent text-accent-foreground",
    Expert: "bg-primary text-primary-foreground",
  };

  const statusColors = {
    Open: "bg-primary/10 text-primary",
    Assigned: "bg-accent text-accent-foreground",
    Completed: "bg-muted text-muted-foreground",
  };

  return (
    <Card className="hover-elevate active-elevate-2 transition-all duration-300 shadow-sm hover:shadow-md border-card-border/60 group">
      <CardHeader className="pb-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-bold leading-tight tracking-tight" data-testid="text-service-type">
              {serviceType}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" strokeWidth={2.25} />
              <span data-testid="text-location">{displayLocation}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge className={`${skillLevelColors[skillLevel]} font-medium px-2.5 py-1`} data-testid="badge-skill-level">
              {skillLevel}
            </Badge>
            <Badge className={`${statusColors[status]} font-medium px-2.5 py-1`} data-testid="badge-status">
              {status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/30 transition-colors group-hover:bg-muted/50">
            <div className="rounded-md bg-background p-1.5 ring-1 ring-border/50">
              <Calendar className="w-3.5 h-3.5 text-primary" strokeWidth={2.25} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">Date</p>
              <p className="font-semibold text-sm truncate" data-testid="text-date">{date}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/30 transition-colors group-hover:bg-muted/50">
            <div className="rounded-md bg-background p-1.5 ring-1 ring-border/50">
              <Clock className="w-3.5 h-3.5 text-primary" strokeWidth={2.25} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">Time</p>
              <p className="font-semibold text-sm truncate" data-testid="text-time">{time}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/30 transition-colors group-hover:bg-muted/50">
            <div className="rounded-md bg-background p-1.5 ring-1 ring-border/50">
              <Users className="w-3.5 h-3.5 text-primary" strokeWidth={2.25} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">Associates</p>
              <p className="font-semibold text-sm truncate" data-testid="text-associates">
                {associatesNeeded} needed
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/30 transition-colors group-hover:bg-muted/50">
            <div className="rounded-md bg-background p-1.5 ring-1 ring-border/50">
              <DollarSign className="w-3.5 h-3.5 text-primary" strokeWidth={2.25} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">Budget</p>
              <p className="font-semibold text-sm truncate" data-testid="text-budget">₹{budget}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm pt-3 border-t border-border/50">
          <span className="text-muted-foreground font-medium">Duration: <span className="text-foreground">{duration} days</span></span>
          {interestedCount !== undefined && interestedCount > 0 && (
            <span className="text-primary font-semibold flex items-center gap-1" data-testid="text-interested-count">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {interestedCount} interested
            </span>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="gap-2.5 pt-0 pb-4">
          {onExpressInterest && (
            <Button
              onClick={onExpressInterest}
              className="flex-1 shadow-sm font-semibold"
              data-testid="button-express-interest"
            >
              Express Interest
            </Button>
          )}
          {onViewDetails && (
            <Button
              onClick={onViewDetails}
              variant="outline"
              className="flex-1 font-semibold"
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
