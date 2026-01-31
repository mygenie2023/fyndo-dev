import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { User } from "@shared/schema";

interface AssociateRating {
  associateId: string;
  rating: number;
  reviewText: string;
}

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  associates: Array<{ associate: User }>;
  jobId: string;
  farmerId: string;
  onSubmit: (ratings: AssociateRating[], jobComment: string) => void;
  isPending: boolean;
}

export default function RatingDialog({
  open,
  onOpenChange,
  associates,
  jobId,
  farmerId,
  onSubmit,
  isPending,
}: RatingDialogProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [jobComment, setJobComment] = useState("");

  const handleRatingClick = (associateId: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [associateId]: rating }));
  };

  const handleCommentChange = (associateId: string, comment: string) => {
    setComments((prev) => ({ ...prev, [associateId]: comment }));
  };

  const handleSubmit = () => {
    const associateRatings: AssociateRating[] = associates.map(({ associate }) => ({
      associateId: associate.id,
      rating: ratings[associate.id],
      reviewText: comments[associate.id] || "",
    }));
    onSubmit(associateRatings, jobComment);
  };

  const allRated = associates.every(({ associate }) => 
    ratings[associate.id] !== undefined && ratings[associate.id] > 0
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Rate Associates & Complete Job</AlertDialogTitle>
          <AlertDialogDescription>
            Please rate each associate's work and add any comments. This helps us maintain quality and helps associates improve.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          {/* Rate Each Associate */}
          {associates.map(({ associate }) => (
            <div key={associate.id} className="space-y-3 p-4 bg-card/50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{associate.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {associate.skills?.slice(0, 2).join(", ")}
                  </p>
                </div>
                <div className="flex gap-1" data-testid={`star-rating-${associate.id}`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(associate.id, star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                      data-testid={`star-${associate.id}-${star}`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (ratings[associate.id] || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor={`comment-${associate.id}`} className="text-xs">
                  Comment (optional)
                </Label>
                <Textarea
                  id={`comment-${associate.id}`}
                  placeholder="Share your experience working with this associate..."
                  value={comments[associate.id] || ""}
                  onChange={(e) => handleCommentChange(associate.id, e.target.value)}
                  rows={2}
                  className="mt-1 text-sm"
                  data-testid={`input-comment-${associate.id}`}
                />
              </div>
            </div>
          ))}

          {/* Overall Job Comment */}
          <div className="space-y-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <Label htmlFor="job-comment" className="font-medium text-sm">
                Overall Job Feedback (optional)
              </Label>
            </div>
            <Textarea
              id="job-comment"
              placeholder="Share any general feedback about this job..."
              value={jobComment}
              onChange={(e) => setJobComment(e.target.value)}
              rows={3}
              className="text-sm"
              data-testid="input-job-comment"
            />
          </div>

          {!allRated && (
            <p className="text-sm text-muted-foreground text-center">
              Please rate all associates before submitting
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} data-testid="button-cancel-rating">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={!allRated || isPending}
            data-testid="button-submit-rating"
          >
            {isPending ? "Submitting..." : "Submit & Mark Complete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
