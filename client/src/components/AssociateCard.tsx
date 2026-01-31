import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, DollarSign, Briefcase } from "lucide-react";

interface AssociateCardProps {
  id: string;
  name: string;
  avatar?: string;
  skills: string[];
  skillLevel: "Beginner" | "Intermediate" | "Expert";
  hourlyRate: number;
  rating: number;
  workHistoryCount: number;
  onShortlist?: () => void;
  onViewProfile?: () => void;
  isShortlisted?: boolean;
  minimal?: boolean; // When true, hide hourly rate, skill level badge, work history, View Profile & Shortlisted buttons
}

export default function AssociateCard({
  name,
  avatar,
  skills,
  skillLevel,
  hourlyRate,
  rating,
  workHistoryCount,
  onShortlist,
  onViewProfile,
  isShortlisted = false,
  minimal = false,
}: AssociateCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const skillLevelColors = {
    Beginner: "bg-secondary text-secondary-foreground",
    Intermediate: "bg-accent text-accent-foreground",
    Expert: "bg-primary text-primary-foreground",
  };

  return (
    <Card className="hover-elevate active-elevate-2">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate" data-testid="text-name">
                  {name}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="font-medium text-sm" data-testid="text-rating">
                    {rating.toFixed(1)}
                  </span>
                  {!minimal && (
                    <span className="text-xs text-muted-foreground">
                      ({workHistoryCount} jobs)
                    </span>
                  )}
                </div>
              </div>
              {!minimal && (
                <Badge className={skillLevelColors[skillLevel]} data-testid="badge-skill-level">
                  {skillLevel}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-1 mt-3">
              {skills.slice(0, 3).map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs"
                  data-testid={`badge-skill-${idx}`}
                >
                  {skill}
                </Badge>
              ))}
              {skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{skills.length - 3}
                </Badge>
              )}
            </div>

            {!minimal && (
              <div className="flex items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium" data-testid="text-hourly-rate">
                    ₹{hourlyRate}/hr
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Briefcase className="w-4 h-4" />
                  <span data-testid="text-work-history">{workHistoryCount} jobs</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {!minimal && (
        <CardFooter className="gap-2 pt-0">
          {onViewProfile && (
            <Button
              onClick={onViewProfile}
              variant="outline"
              className="flex-1"
              data-testid="button-view-profile"
            >
              View Profile
            </Button>
          )}
          {onShortlist && (
            <Button
              onClick={onShortlist}
              variant={isShortlisted ? "secondary" : "default"}
              className="flex-1"
              data-testid="button-shortlist"
            >
              {isShortlisted ? "Shortlisted" : "Shortlist"}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
