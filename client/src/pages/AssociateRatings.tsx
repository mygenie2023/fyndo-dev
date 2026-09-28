import { useMemo } from "react";
import { useLocation, useRoute } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import {
  Briefcase,
  Check,
  Loader2,
  MapPin,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import fyndoLogo from "@assets/FYNDO_v1.0_1770731684699.png";

interface AssociateReview {
  review_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  job_id: string;
  service_type: string | null;
  job_date: string | null;
  job_location: string | null;
  job_status: string | null;
  farmer_id: string;
  farmer_name: string | null;
  farmer_location: string | null;
}

interface Associate {
  id: string;
  name: string | null;
  location: string | null;
  skills: string[] | null;
  averageRating: number;
  totalRatings: number;
  jobsCompleted: number;
}

interface JobInterest {
  associate: any;
  status: string;
}

function RatingStars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const starClass =
    size === "md"
      ? "h-5 w-5"
      : "h-4 w-4";

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starClass} ${
            star <= rating
              ? "fill-primary text-primary"
              : "text-[#CBD7D2]"
          }`}
        />
      ))}
    </div>
  );
}

export default function AssociateRatings() {
  const [, params] = useRoute(
    "/associate-ratings/:associateId"
  );

  const [, setLocation] = useLocation();

  const associateId =
    params?.associateId;

  const searchParams = useMemo(
    () =>
      new URLSearchParams(
        window.location.search
      ),
    []
  );

  const jobId =
    searchParams.get("jobId");

  // ---------------------------------------------------------------------------
  // Associate / Job Interest
  // ---------------------------------------------------------------------------

  const {
    data: interests = [],
    isLoading: interestsLoading,
    error: interestsError,
  } = useQuery<JobInterest[]>({
    queryKey: [
      "associate-rating-interest",
      jobId,
      associateId,
    ],

    enabled:
      !!jobId &&
      !!associateId,

    queryFn: async () => {
      const {
        data,
        error,
      } = await supabase.rpc(
        "get_fyndo_job_interests",
        {
          p_job_id: jobId,
        }
      );

      if (error) {
        console.error(
          "FYNDO associate interest load error:",
          error
        );

        throw error;
      }

      return (data ?? []) as JobInterest[];
    },
  });

  const associate = useMemo<Associate | null>(() => {
    const match =
      interests.find(
        (item) =>
          item?.associate?.id ===
          associateId
      );

    if (!match?.associate) {
      return null;
    }

    const raw =
      match.associate;

    return {
      id: raw.id,
      name:
        raw.name ?? "Associate",
      location:
        raw.location ?? null,
      skills:
        raw.skills ?? [],
      averageRating:
        Number(
          raw.average_rating ?? 0
        ),
      totalRatings:
        Number(
          raw.total_ratings ?? 0
        ),
      jobsCompleted:
        Number(
          raw.jobs_completed ?? 0
        ),
    };
  }, [
    interests,
    associateId,
  ]);

  const currentInterest =
    useMemo(
      () =>
        interests.find(
          (item) =>
            item?.associate?.id ===
            associateId
        ),
      [
        interests,
        associateId,
      ]
    );

  const isShortlisted =
    currentInterest?.status?.toLowerCase() ===
    "shortlisted";

  // ---------------------------------------------------------------------------
  // Associate Reviews
  // ---------------------------------------------------------------------------

  const {
    data: reviews = [],
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useQuery<AssociateReview[]>({
    queryKey: [
      "associate-ratings",
      associateId,
    ],

    enabled:
      !!associateId,

    queryFn: async () => {
      const {
        data,
        error,
      } = await supabase.rpc(
        "get_fyndo_associate_reviews",
        {
          p_associate_id:
            associateId,
        }
      );

      if (error) {
        console.error(
          "FYNDO associate reviews load error:",
          error
        );

        throw error;
      }

      return (
        data ?? []
      ) as AssociateReview[];
    },
  });

  // ---------------------------------------------------------------------------
  // Rating Summary
  // ---------------------------------------------------------------------------

  const calculatedAverage =
    useMemo(() => {
      if (
        reviews.length === 0
      ) {
        return (
          associate?.averageRating ??
          0
        );
      }

      const total =
        reviews.reduce(
          (sum, review) =>
            sum +
            Number(
              review.rating ?? 0
            ),
          0
        );

      return total / reviews.length;
    }, [
      reviews,
      associate,
    ]);

  // ---------------------------------------------------------------------------
  // Shortlist / Remove Shortlist
  // ---------------------------------------------------------------------------

  const updateInterestMutation =
    useMutation({
      mutationFn:
        async () => {
          if (
            !jobId ||
            !associateId
          ) {
            throw new Error(
              "Missing job or associate"
            );
          }

          const nextStatus =
            isShortlisted
              ? "interested"
              : "shortlisted";

          const {
            data,
            error,
          } = await supabase.rpc(
            "update_fyndo_job_interest",
            {
              p_job_id:
                jobId,

              p_associate_id:
                associateId,

              p_status:
                nextStatus,
            }
          );

          if (error) {
            throw error;
          }

          return data;
        },

      onSuccess:
        () => {
          queryClient.invalidateQueries({
            queryKey: [
              "associate-rating-interest",
              jobId,
              associateId,
            ],
          });

          queryClient.invalidateQueries({
            queryKey: [
              "job-interests",
              jobId,
            ],
          });

          queryClient.invalidateQueries({
            queryKey: [
              "job",
              jobId,
            ],
          });
        },

      onError:
        (error) => {
          console.error(
            "FYNDO shortlist update error:",
            error
          );
        },
    });

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  const isLoading =
    interestsLoading ||
    reviewsLoading;

  // ---------------------------------------------------------------------------
  // Error
  // ---------------------------------------------------------------------------

  if (
    !associateId ||
    !jobId ||
    interestsError ||
    reviewsError
  ) {
    console.error(
      "Associate Ratings page error:",
      {
        associateId,
        jobId,
        interestsError,
        reviewsError,
      }
    );

    return (
      <div className="min-h-screen bg-[#FDFCF7]">

        <header className="sticky top-0 z-40 border-b border-[#DDE7E3] bg-white/95 shadow-sm backdrop-blur-xl">

          <div className="mx-auto flex h-[4.5rem] max-w-2xl items-center justify-between px-5">

            <img
              src={fyndoLogo}
              alt="FYNDO"
              className="h-8 w-auto"
            />

            <Button
              variant="outline"
              onClick={() =>
                setLocation(
                  jobId
                    ? `/job-details/${jobId}`
                    : "/jobs"
                )
              }
              className="h-9 rounded-xl border-[#DCE7E3] bg-white px-4 text-sm font-semibold text-[#1F372E] hover:bg-[#F7F9F8]"
            >
              Close
            </Button>

          </div>

        </header>

        <main className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-2xl items-center justify-center px-5">

          <div className="w-full rounded-3xl border border-[#DCE7E3] bg-white p-6 text-center shadow-[0_8px_28px_rgba(31,55,46,0.075)]">

            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">

              <X className="h-6 w-6 text-red-600" />

            </div>

            <h1 className="font-display text-lg font-semibold text-[#1F372E]">
              Unable to load associate ratings
            </h1>

            <p className="mt-2 text-sm text-[#71827B]">
              We could not load the associate
              information or reviews.
            </p>

            <Button
              onClick={() =>
                setLocation(
                  `/job-details/${jobId}`
                )
              }
              className="mt-5 rounded-xl"
            >
              Close
            </Button>

          </div>

        </main>

      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Loading Screen
  // ---------------------------------------------------------------------------

  if (
    isLoading
  ) {
    return (
      <div className="min-h-screen bg-[#FDFCF7]">

        <header className="sticky top-0 z-40 border-b border-[#DDE7E3] bg-white/95 shadow-sm backdrop-blur-xl">

          <div className="mx-auto flex h-[4.5rem] max-w-2xl items-center justify-between gap-3 px-5">

            <img
              src={fyndoLogo}
              alt="FYNDO"
              className="h-8 w-auto"
            />

            <Button
              variant="outline"
              onClick={() =>
                setLocation(
                  `/job-details/${jobId}`
                )
              }
              className="h-9 rounded-xl border-[#DCE7E3] bg-white px-4 text-sm font-semibold text-[#1F372E] hover:bg-[#F7F9F8]"
            >
              Close
            </Button>

          </div>

        </header>

        <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center">

          <div className="flex items-center gap-2 text-sm text-muted-foreground">

            <Loader2 className="h-4 w-4 animate-spin" />

            Loading associate ratings...

          </div>

        </div>

      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Associate Not Found
  // ---------------------------------------------------------------------------

  if (!associate) {
    return (
      <div className="min-h-screen bg-[#FDFCF7]">

        <header className="sticky top-0 z-40 border-b border-[#DDE7E3] bg-white/95 shadow-sm backdrop-blur-xl">

          <div className="mx-auto flex h-[4.5rem] max-w-2xl items-center justify-between gap-3 px-5">

            <img
              src={fyndoLogo}
              alt="FYNDO"
              className="h-8 w-auto"
            />

            <Button
              variant="outline"
              onClick={() =>
                setLocation(
                  `/job-details/${jobId}`
                )
              }
              className="h-9 rounded-xl border-[#DCE7E3] bg-white px-4 text-sm font-semibold text-[#1F372E] hover:bg-[#F7F9F8]"
            >
              Close
            </Button>

          </div>

        </header>

        <main className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-2xl items-center justify-center px-5">

          <div className="text-center">

            <h1 className="font-display text-lg font-semibold text-[#1F372E]">
              Associate not found
            </h1>

            <p className="mt-2 text-sm text-[#71827B]">
              This associate is no longer associated
              with this job.
            </p>

            <Button
              onClick={() =>
                setLocation(
                  `/job-details/${jobId}`
                )
              }
              className="mt-5 rounded-xl"
            >
              Close
            </Button>

          </div>

        </main>

      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Main UI
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#FDFCF7] pb-8">

      {/* Header */}

      <header className="sticky top-0 z-40 border-b border-[#DDE7E3] bg-white/95 shadow-sm backdrop-blur-xl">

        <div className="mx-auto flex h-[4.5rem] max-w-2xl items-center justify-between gap-3 px-5">

          <img
            src={fyndoLogo}
            alt="FYNDO"
            className="h-8 w-auto"
          />

          <Button
            variant="outline"
            onClick={() =>
              setLocation(
                `/job-details/${jobId}`
              )
            }
            className="h-9 rounded-xl border-[#DCE7E3] bg-white px-4 text-sm font-semibold text-[#1F372E] hover:bg-[#F7F9F8]"
            data-testid="button-close-associate-ratings"
          >
            Close
          </Button>

        </div>

      </header>

      {/* Main */}

      <main className="mx-auto max-w-2xl px-5 py-5">

        {/* Associate Profile */}

        <section className="rounded-3xl border border-[#DCE7E3] bg-white p-5 shadow-[0_8px_28px_rgba(31,55,46,0.075)]">

          <div className="flex items-start gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">

              <Briefcase className="h-6 w-6 text-primary" />

            </div>

            <div className="min-w-0 flex-1">

              <h1 className="truncate font-display text-xl font-bold text-[#1F372E]">
                {associate.name}
              </h1>

              {associate.location && (
                <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[#71827B]">

                  <MapPin className="h-4 w-4 shrink-0 text-primary" />

                  <span className="truncate">
                    {associate.location}
                  </span>

                </div>
              )}

            </div>

          </div>

          {/* Rating Summary */}

          <div className="mt-5 rounded-2xl bg-[#F7F9F8] p-4">

            <div className="flex items-center justify-between gap-4">

              <div>

                <div className="flex items-center gap-2">

                  <span className="font-display text-2xl font-bold text-[#1F372E]">
                    {calculatedAverage.toFixed(
                      1
                    )}
                  </span>

                  <RatingStars
                    rating={Math.round(
                      calculatedAverage
                    )}
                    size="md"
                  />

                </div>

                <p className="mt-1 text-xs text-[#71827B]">
                  {associate.totalRatings}{" "}
                  {associate.totalRatings ===
                  1
                    ? "rating"
                    : "ratings"}
                </p>

              </div>

              <div className="text-right">

                <p className="font-display text-xl font-bold text-[#1F372E]">
                  {associate.jobsCompleted}
                </p>

                <p className="text-xs text-[#71827B]">
                  jobs completed
                </p>

              </div>

            </div>

          </div>

          {/* Shortlist Button */}

          {jobId && (
            <Button
              onClick={() =>
                updateInterestMutation.mutate()
              }
              disabled={
                updateInterestMutation.isPending
              }
              variant={
                isShortlisted
                  ? "outline"
                  : "default"
              }
              className={
                isShortlisted
                  ? "mt-5 h-11 w-full rounded-xl border-[#DCE7E3] bg-white text-sm font-semibold text-[#1F372E] hover:bg-[#F7F9F8]"
                  : "mt-5 h-11 w-full rounded-xl text-sm font-semibold"
              }
            >
              {updateInterestMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : isShortlisted ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Remove Shortlist
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Shortlist
                </>
              )}
            </Button>
          )}

          {updateInterestMutation.isError && (
            <p className="mt-2 text-center text-xs text-red-600">
              Unable to update shortlist. Please try
              again.
            </p>
          )}

        </section>

        {/* Work Reviews */}

        <section className="mt-6">

          <div className="mb-4">

            <h2 className="font-display text-lg font-semibold text-[#1F372E]">
              Work Reviews
            </h2>

            <p className="mt-1 text-xs text-[#71827B]">
              Reviews from farmers this associate has
              worked with
            </p>

          </div>

          {reviews.length === 0 ? (
            <div className="rounded-3xl border border-[#DCE7E3] bg-white p-6 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F9F8]">

                <Star className="h-6 w-6 text-[#AABBB4]" />

              </div>

              <h3 className="mt-3 font-display text-base font-semibold text-[#1F372E]">
                No reviews yet
              </h3>

              <p className="mt-1 text-sm text-[#71827B]">
                This associate has not received any
                written reviews yet.
              </p>

            </div>
          ) : (
            <div className="space-y-3">

              {reviews.map(
                (review) => (
                  <article
                    key={review.review_id}
                    className="rounded-2xl border border-[#DCE7E3] bg-white p-4 shadow-[0_4px_16px_rgba(31,55,46,0.05)]"
                  >

                    {/* Review Header */}

                    <div className="flex items-center justify-between gap-3">

                      <h3 className="truncate font-display text-sm font-semibold text-[#1F372E]">
                        {review.service_type ||
                          "Work"}
                      </h3>

                      <div className="flex shrink-0 items-center gap-1.5">

                        <RatingStars
                          rating={Number(
                            review.rating
                          )}
                        />

                        <span className="text-sm font-semibold text-[#1F372E]">
                          {review.rating}/5
                        </span>

                      </div>

                    </div>

                    {/* Location */}

                    {review.farmer_location && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-[#71827B]">

                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />

                        <span className="truncate">
                          {review.farmer_location}
                        </span>

                      </div>
                    )}

                    {/* Feedback */}

                    <p className="mt-3 text-sm leading-6 text-[#52655D]">

                      {review.review_text?.trim()
                        ? review.review_text
                        : "No written feedback provided."}

                    </p>

                  </article>
                )
              )}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}