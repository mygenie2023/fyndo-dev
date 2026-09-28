import { useState } from "react";
import {
  Star,
  MessageSquare,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import fyndoLogo from "@assets/FYNDO_v1.0_1770731684699.png";
import { useLocation } from "wouter";
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
  onSubmit: (
    ratings: AssociateRating[],
    jobComment: string
  ) => void;
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
  const [, setLocation] = useLocation();

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [jobComment, setJobComment] = useState("");

  /*
   * Keep these props in the component interface because JobDetails
   * already passes them. They are intentionally not required for
   * the visual rating flow itself.
   */
  void jobId;
  void farmerId;

  if (!open) {
    return null;
  }

  const handleRatingClick = (
    associateId: string,
    rating: number
  ) => {
    setRatings((prev) => ({
      ...prev,
      [associateId]: rating,
    }));
  };

  const handleCommentChange = (
    associateId: string,
    comment: string
  ) => {
    setComments((prev) => ({
      ...prev,
      [associateId]: comment,
    }));
  };

  const handleSubmit = () => {
    const associateRatings: AssociateRating[] =
      associates.map(({ associate }) => ({
        associateId: associate.id,
        rating: ratings[associate.id],
        reviewText: comments[associate.id] || "",
      }));

    onSubmit(associateRatings, jobComment);
  };

  const handleCancel = () => {
    if (isPending) {
      return;
    }

    onOpenChange(false);
    setLocation("/jobs");
  };

  const allRated = associates.every(
    ({ associate }) =>
      ratings[associate.id] !== undefined &&
      ratings[associate.id] > 0
  );

  const ratedCount = associates.filter(
    ({ associate }) =>
      ratings[associate.id] !== undefined &&
      ratings[associate.id] > 0
  ).length;

  const getInitials = (name?: string) => {
    if (!name) {
      return "A";
    }

    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex min-h-screen flex-col bg-[#FDFCF7] text-foreground">
      {/* Header - same visual language as Post/Edit Job */}
      <header className="sticky top-0 z-40 shrink-0 border-b border-[#DDE7E3] bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-2xl items-center justify-between gap-3 px-5">
          <button
            type="button"
            onClick={() => {
              if (!isPending) {
                onOpenChange(false);
                setLocation("/jobs");
              }
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
              onClick={handleCancel}
              disabled={isPending}
              className="
                h-10
                rounded-xl
                border-[#DCE7E3]
                bg-[#F7F9F8]
                px-4
                text-sm
                font-semibold
                text-[#1F372E]
                shadow-sm
                transition-all
                hover:bg-[#EAF1EE]
                hover:shadow-md
              "
              data-testid="button-cancel-rating"
              aria-label="Cancel"
            >
              Cancel
            </Button>
          </div>
        </div>
      </header>

      {/* Scrollable content */}
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 py-5 pb-8 sm:px-5">
          {/* Page heading */}
          <section className="mb-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users
                  className="h-5 w-5"
                  strokeWidth={2}
                />
              </div>

              <div className="min-w-0">
                <h1 className="font-display text-xl font-bold text-[#1F372E]">
                  Rate Your Experience
                </h1>

                <p className="mt-1 text-sm leading-5 text-[#70867E]">
                  Your ratings will help us improve.
                </p>
              </div>
            </div>
           
          </section>

          {/* Associate rating cards */}
          <section className="space-y-4">
            {associates.map(
              ({ associate }, index) => {
                const rating =
                  ratings[associate.id] || 0;

                const skills =
                  associate.skills
                    ?.slice(0, 2)
                    .join(", ");

                return (
                  <div
                    key={associate.id}
                    className="
                      rounded-3xl
                      border
                      border-[#DCE7E3]
                      bg-white
                      p-4
                      shadow-[0_8px_28px_rgba(31,55,46,0.075)]
                    "
                  >
                    {/* Associate header */}
                    <div className="flex items-start gap-3">
                     
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="truncate font-display text-base font-bold text-[#1F372E]">
                              {associate.name ||
                                "Associate"}
                            </h2>

                            <p className="mt-0.5 truncate text-xs text-[#70867E]">
                              {skills ||
                                "No skills listed"}
                            </p>
                          </div>

                          
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div
  className="flex shrink-0 items-center"
  data-testid={`star-rating-${associate.id}`}
>
  {[1, 2, 3, 4, 5].map((star) => (
    <button
      key={star}
      type="button"
      onClick={() =>
        handleRatingClick(associate.id, star)
      }
      className="
        flex
        h-8
        w-8
        shrink-0
        items-center
        justify-center
        rounded-lg
        p-0
        transition-transform
        duration-150
        hover:bg-white
        focus:outline-none
        focus:ring-2
        focus:ring-primary/25
        active:scale-95
      "
      data-testid={`star-${associate.id}-${star}`}
      aria-label={`Rate ${star} out of 5`}
    >
      <Star
        className={`h-5 w-5 shrink-0 ${
          star <= rating
            ? "fill-[#E5A93A] text-[#E5A93A]"
            : "fill-transparent text-[#B9C9C3]"
        }`}
        strokeWidth={1.8}
      />
    </button>
  ))}
</div>

                    {/* Individual comment */}
                    <div className="mt-4">
                      <div className="mb-2 flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5 text-primary" />

                        <Label
                          htmlFor={`comment-${associate.id}`}
                          className="
                            text-xs
                            font-semibold
                            text-[#1F372E]
                          "
                        >
                          Comment
                        </Label>

                        <span className="text-[11px] text-[#8A9B95]">
                          Optional
                        </span>
                      </div>

                      <Textarea
                        id={`comment-${associate.id}`}
                        placeholder="Share your experience working with this worker."
                        value={
                          comments[
                            associate.id
                          ] || ""
                        }
                        onChange={(e) =>
                          handleCommentChange(
                            associate.id,
                            e.target.value
                          )
                        }
                        rows={2}
                        className="
                          resize-none
                          rounded-2xl
                          border-[#DCE7E3]
                          bg-[#F7F9F8]
                          text-sm
                          text-[#1F372E]
                          placeholder:text-[#8A9B95]
                          focus-visible:ring-primary/25
                        "
                        data-testid={`input-comment-${associate.id}`}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </section>

          {/* Overall job feedback */}
          <section
            className="
              mt-4
              rounded-3xl
              border
              border-primary/15
              bg-primary/5
              p-4
            "
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <MessageSquare
                  className="h-4 w-4 text-primary"
                  strokeWidth={2}
                />
              </div>

              <div>
                <Label
                  htmlFor="job-comment"
                  className="
                    text-sm
                    font-semibold
                    text-[#1F372E]
                  "
                >
                  Overall Job Feedback
                </Label>

                <p className="text-[11px] text-[#70867E]">
                  Optional
                </p>
              </div>
            </div>

            <Textarea
              id="job-comment"
              placeholder="Share any general feedback about this job..."
              value={jobComment}
              onChange={(e) =>
                setJobComment(e.target.value)
              }
              rows={3}
              className="
                resize-none
                rounded-2xl
                border-[#DCE7E3]
                bg-white
                text-sm
                text-[#1F372E]
                placeholder:text-[#8A9B95]
                focus-visible:ring-primary/25
              "
              data-testid="input-job-comment"
            />
          </section>

          {/* Validation message */}
          {!allRated && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
              <p className="text-xs font-medium text-amber-800">
                Please rate the {" "}
                {associates.length === 1
                  ? "associate"
                  : "associates"}{" "}
                before submitting.
              </p>
            </div>
          )}

          {/* Submit */}
          <div className="mt-5">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!allRated || isPending}
              className="
                h-12
                w-full
                rounded-xl
                bg-primary
                text-sm
                font-semibold
                text-primary-foreground
                shadow-sm
                transition-all
                hover:bg-primary/95
                hover:shadow-md
                active:scale-[0.98]
              "
              data-testid="button-submit-rating"
            >
              {isPending
                ? "Submitting..."
                : "Submit & Complete"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}