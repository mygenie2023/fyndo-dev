import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useJobCompletion(jobId: string, userId?: string) {
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);

  const { data: interests = [], isLoading: interestsLoading } = useQuery<Array<{ associate: User; status: string }>>({
    queryKey: [`/api/job-interests/job/${jobId}`],
    enabled: !!jobId && !!userId,
  });

  const shortlistedAssociates = interests.filter((i) => i.status === "shortlisted");

  const submitReviewsMutation = useMutation({
    mutationFn: async ({ ratings, jobComment }: { ratings: Array<{ associateId: string; rating: number; reviewText: string }>; jobComment: string }) => {
      for (const rating of ratings) {
        const res = await apiRequest("POST", "/api/reviews", {
          jobId,
          farmerId: userId,
          associateId: rating.associateId,
          rating: rating.rating,
          reviewText: rating.reviewText,
        });
        if (!res.ok) {
          throw new Error(`Failed to submit review for associate ${rating.associateId}`);
        }
      }
      const res = await apiRequest("PATCH", `/api/jobs/${jobId}`, { 
        status: "Completed",
        jobComment,
      });
      if (!res.ok) {
        throw new Error("Failed to mark job as completed");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/farmer/${userId}`] });
      setShowRatingDialog(false);
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/jobs/${jobId}`, { status: "Completed" });
      if (!res.ok) {
        throw new Error("Failed to mark job as completed");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/farmer/${userId}`] });
      setShowCompleteDialog(false);
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
