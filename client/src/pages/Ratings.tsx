import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, MapPin, Briefcase, Loader2 } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/userContext";
import BottomNav from "@/components/BottomNav";

interface RatingReview {
  id: string;
  rating: number;
  reviewText: string;
  createdAt: string | null;

  job: {
    id: string;
    serviceType: string;
    date: string | null;
    location: string | null;
    status: string | null;
  } | null;

  farmer: {
    id: string;
    name: string;
    location: string | null;
  } | null;
}

function formatDate(date: string | null) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-GB");
}

function RatingStars({
  rating,
  size = "h-4 w-4",
}: {
  rating: number;
  size?: string;
}) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= rating
              ? "fill-[#E3A62F] text-[#E3A62F]"
              : "text-[#D7DFDC]"
          }`}
          strokeWidth={1.8}
        />
      ))}
    </div>
  );
}

export default function Ratings() {
  const { user } = useUser();

  const {
    data: reviews = [],
    isLoading,
    error,
  } = useQuery<RatingReview[]>({
    queryKey: ["associate-ratings", user?.id],
    enabled: Boolean(user?.id && user?.userType === "associate"),

    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      const { data, error } = await supabase.rpc(
        "get_fyndo_associate_reviews",
        {
          p_associate_id: user.id,
        },
      );

      if (error) {
        throw error;
      }

      return (data ?? []).map((item: any) => ({
        id: item.review_id,
        rating: Number(item.rating ?? 0),
        reviewText: item.review_text ?? "",
        createdAt: item.created_at ?? null,

        job: item.job_id
          ? {
              id: item.job_id,
              serviceType: item.service_type ?? "Job",
              date: item.job_date ?? null,
              location: item.job_location ?? null,
              status: item.job_status ?? null,
            }
          : null,

        farmer: item.farmer_id
          ? {
              id: item.farmer_id,
              name: item.farmer_name ?? "Farmer",
              location: item.farmer_location ?? null,
            }
          : null,
      }));
    },
  });

  const averageRating = Number(user?.averageRating ?? 0);
  const totalRatings = Number(
    user?.totalRatings ?? reviews.length ?? 0,
  );
  const jobsCompleted = Number(user?.jobsCompleted ?? 0);

  const ratingDistribution = useMemo(() => {
    return [5, 4, 3, 2, 1].map((rating) => {
      const count = reviews.filter(
        (review) => review.rating === rating,
      ).length;

      const percentage =
        reviews.length > 0
          ? Math.round((count / reviews.length) * 100)
          : 0;

      return {
        rating,
        count,
        percentage,
      };
    });
  }, [reviews]);

  return (
    <div className="min-h-screen bg-[#FDFCF7] pb-24 text-[#1F372E]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#DDE7E3] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-2xl items-center px-4">
          <button
            type="button"
            onClick={() => {
              window.location.href = "/jobs";
            }}
            className="flex items-center"
            aria-label="Go to Jobs"
          >
            <img
              src="/fyndo-logo.png"
              alt="FYNDO"
              className="h-9 w-auto object-contain"
            />
          </button>

          
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-5">
        {/* Page intro */}
        <section className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight text-[#1F372E]">
            Your Average Ratings
          </h2>

        </section>

        {/* Rating summary */}
        <section className="mb-5 overflow-hidden rounded-3xl border border-[#DCE7E3] bg-white shadow-[0_10px_30px_rgba(31,55,46,0.06)]">
          <div className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                

                <div className="mt-2 flex items-center gap-3">
                  <span className="text-4xl font-bold leading-none text-[#1F372E]">
                    {averageRating > 0
                      ? averageRating.toFixed(1)
                      : "0.0"}
                  </span>

                  <div>
                    <RatingStars
                      rating={Math.round(averageRating)}
                      size="h-5 w-5"
                    />

                    <p className="mt-1 text-xs text-[#71817B]">
                      {totalRatings}{" "}
                      {totalRatings === 1 ? "rating" : "ratings"}
                    </p>
                  </div>
                </div>
              </div>

              
            </div>

            {/* Rating distribution */}
            {reviews.length > 0 && (
              <div className="mt-5 space-y-2.5">
                {ratingDistribution.map((item) => (
                  <div
                    key={item.rating}
                    className="flex items-center gap-3"
                  >
                    <span className="w-7 text-xs font-semibold text-[#536760]">
                      {item.rating}★
                    </span>

                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#EEF2F0]">
                      <div
                        className="h-full rounded-full bg-[#E3A62F]"
                        style={{
                          width: `${item.percentage}%`,
                        }}
                      />
                    </div>

                    <span className="w-6 text-right text-xs font-medium text-[#71817B]">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed jobs */}
          <div className="border-t border-[#E5ECE9] bg-[#F7F9F8] px-5 py-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-[#1F372E]">
                  Jobs Completed
                </span>
              </div>

              <span className="text-sm font-bold text-[#1F372E]">
                {jobsCompleted}
              </span>
            </div>
          </div>
        </section>

        {/* Reviews heading */}
        <section className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1F372E]">
              Work Reviews
            </h2>
          </div>

          
        </section>

        {/* Loading */}
        {isLoading && (
          <div className="flex min-h-[180px] items-center justify-center rounded-3xl border border-[#DCE7E3] bg-white">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />

              <p className="text-sm text-[#71817B]">
                Loading your reviews...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="rounded-3xl border border-red-100 bg-white p-5 shadow-[0_8px_24px_rgba(31,55,46,0.04)]">
            <p className="text-sm font-semibold text-red-600">
              Unable to load reviews
            </p>

            <p className="mt-1 text-xs text-[#71817B]">
              Please try again in a moment.
            </p>
          </div>
        )}

        {/* No reviews */}
        {!isLoading && !error && reviews.length === 0 && (
          <div className="rounded-3xl border border-[#DCE7E3] bg-white px-6 py-10 text-center shadow-[0_8px_24px_rgba(31,55,46,0.04)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF7F3]">
              <Star className="h-7 w-7 text-primary" strokeWidth={1.8} />
            </div>

            <h3 className="mt-4 text-base font-bold text-[#1F372E]">
              No ratings yet
            </h3>

            <p className="mx-auto mt-1.5 max-w-xs text-sm leading-6 text-[#71817B]">
              Complete jobs and get feedback from farmers to see your
              ratings here.
            </p>
          </div>
        )}

        {/* Individual reviews */}
{!isLoading && !error && reviews.length > 0 && (
  <div className="space-y-3">
    {reviews.map((review) => (
      <article
        key={review.id}
        className="rounded-3xl border border-[#DCE7E3] bg-white p-4 shadow-[0_8px_24px_rgba(31,55,46,0.04)]"
      >
        {/* Job Type / Job Name */}
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-[#1F372E]">
            {review.job?.serviceType ?? "Job"}
          </p>
        </div>

        {/* Farmer Location */}
        {review.farmer?.location && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#71817B]">
            
            <span className="truncate">
              {review.farmer.location}
            </span>
          </div>
        )}

        {/* Completed Date + Star Rating */}
        <div className="mt-3 flex items-center justify-between gap-3">
  <p className="text-xs font-semibold text-[#536760]">
    Rated on: {formatDate(review.createdAt)}
  </p>

  <div className="flex shrink-0 items-center gap-1.5">
    <RatingStars rating={review.rating} />

    <span className="text-xs font-semibold text-[#536760]">
      {review.rating}/5
    </span>
  </div>
</div>

        {/* Written Feedback */}
        {review.reviewText ? (
          <div className="mt-3 rounded-2xl bg-[#F7F9F8] px-3.5 py-3">
            <p className="text-sm leading-6 text-[#536760]">
              “{review.reviewText}”
            </p>
          </div>
        ) : (
          <div className="mt-3 rounded-2xl bg-[#F7F9F8] px-3.5 py-3">
            <p className="text-sm italic text-[#9AA6A1]">
              No written feedback provided.
            </p>
          </div>
        )}
      </article>
    ))}
  </div>
)}
      </main>

      <BottomNav userType="associate" />
    </div>
  );
}