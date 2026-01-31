import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface ReviewCardProps {
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  date: string;
  reviewText: string;
  jobType?: string;
}

export default function ReviewCard({
  reviewerName,
  reviewerAvatar,
  rating,
  date,
  reviewText,
  jobType,
}: ReviewCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={reviewerAvatar} alt={reviewerName} />
            <AvatarFallback className="bg-muted text-muted-foreground">
              {getInitials(reviewerName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate" data-testid="text-reviewer-name">
                  {reviewerName}
                </h4>
                {jobType && (
                  <p className="text-xs text-muted-foreground">{jobType}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap" data-testid="text-date">
                {date}
              </span>
            </div>

            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < rating
                      ? "fill-primary text-primary"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
              <span className="text-sm font-medium ml-1" data-testid="text-rating">
                {rating.toFixed(1)}
              </span>
            </div>

            <p className="text-sm text-foreground leading-relaxed" data-testid="text-review">
              {reviewText}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
