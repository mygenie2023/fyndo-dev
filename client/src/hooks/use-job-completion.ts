import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import type { User } from "@shared/schema";

export function useJobCompletion(jobId: string, userId?: string) {
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);

const { data: interests = [], isLoading: interestsLoading } =
  useQuery<Array<{ associate: User; status: string }>>({
    queryKey: ["job-interests", jobId],
    enabled: !!jobId && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_fyndo_job_interests",
        {
          p_job_id: jobId,
        }
      );

      if (error) {
        console.error("FYNDO job interests error:", error);
        throw error;
      }

      return (data ?? []).map((item: any) => ({
        associate: {
          ...item.associate,
          phoneNumber: item.associate.phone_number,
          userType: item.associate.user_type,
          skillLevel: item.associate.skill_level,
          hourlyRate: item.associate.hourly_rate,
          dateOfBirth: item.associate.date_of_birth,
          expectedDailySalary: item.associate.expected_daily_salary,
          travelDistance: item.associate.travel_distance,
          comfortableStaying: item.associate.comfortable_staying,
          aadharFrontUrl: item.associate.aadhar_front_url,
          aadharBackUrl: item.associate.aadhar_back_url,
          averageRating: item.associate.average_rating,
          totalRatings: item.associate.total_ratings,
          jobsCompleted: item.associate.jobs_completed,
          totalEarnings: item.associate.total_earnings,
          pendingPayments: item.associate.pending_payments,
          createdAt: item.associate.created_at,
        },
        status: item.status,
      })) as Array<{ associate: User; status: string }>;
    },
  });

  const shortlistedAssociates = interests.filter((i) => i.status === "shortlisted");

  const submitReviewsMutation = useMutation({
  mutationFn: async ({
    ratings,
    jobComment,
  }: {
    ratings: Array<{
      associateId: string;
      rating: number;
      reviewText: string;
    }>;
    jobComment: string;
  }) => {
    if (!userId) {
      throw new Error("Farmer ID is missing");
    }

    if (!ratings.length) {
      throw new Error("At least one rating is required");
    }

    const results = [];

    for (const rating of ratings) {
      const { data, error } = await supabase.rpc(
        "complete_fyndo_job_with_rating",
        {
          p_job_id: jobId,
          p_farmer_id: userId,
          p_associate_id: rating.associateId,
          p_rating: rating.rating,
          p_review_text: rating.reviewText || null,
          p_job_comment: jobComment || null,
        }
      );

      if (error) {
        console.error(
          "FYNDO rating submission error:",
          error
        );
        throw error;
      }

      results.push(data);
    }

    return results;
  },

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["job", jobId],
    });

    queryClient.invalidateQueries({
      queryKey: ["job-interests", jobId],
    });

    queryClient.invalidateQueries({
      queryKey: ["farmer-jobs", userId],
    });

    setShowRatingDialog(false);
  },

  onError: (error) => {
    console.error(
      "FYNDO submit ratings failed:",
      error
    );
  },
});

  const updateJobMutation = useMutation({
  mutationFn: async () => {
    if (!userId) {
      throw new Error("Farmer ID is missing");
    }

    const { data, error } = await supabase.rpc(
      "complete_fyndo_job",
      {
        p_job_id: jobId,
        p_farmer_id: userId,
      }
    );

    if (error) {
      console.error("FYNDO job completion error:", error);
      throw error;
    }

    return data;
  },

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["job", jobId],
    });

    queryClient.invalidateQueries({
      queryKey: ["farmer-jobs", userId],
    });

    setShowCompleteDialog(false);
  },

  onError: (error) => {
    console.error("FYNDO mark job completed failed:", error);
  },
});

  const handleMarkCompleted = () => {
    if (shortlistedAssociates.length > 0) {
      setShowRatingDialog(true);
    } else {
      setShowCompleteDialog(true);
    }
  };

  const confirmMarkCompleted = () => {
    updateJobMutation.mutate();
  };

  const handleSubmitRatings = (ratings: Array<{ associateId: string; rating: number; reviewText: string }>, jobComment: string) => {
    submitReviewsMutation.mutate({ ratings, jobComment });
  };

  const closeDialogs = () => {
    setShowCompleteDialog(false);
    setShowRatingDialog(false);
  };

  return {
    showCompleteDialog,
    showRatingDialog,
    shortlistedAssociates,
    handleMarkCompleted,
    confirmMarkCompleted,
    handleSubmitRatings,
    closeDialogs,
    setShowCompleteDialog,
    setShowRatingDialog,
    isSubmitting: submitReviewsMutation.isPending || updateJobMutation.isPending,
    interestsLoading,
  };
}
