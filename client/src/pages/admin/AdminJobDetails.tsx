import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  useRoute,
  useLocation,
} from "wouter";
import {
  useForm,
} from "react-hook-form";
import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  ArrowLeft,
  Save,
  Trash2,
  CheckCircle,
  Ban,
  Star,
  Users,
  Search,
  X,
  UserPlus,
  MapPin,
  Phone,
  Check,
} from "lucide-react";

import { formatPhone } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";

import { useToast } from "@/hooks/use-toast";

import {
  insertJobSchema,
} from "@shared/schema";

import type {
  Job,
  User,
  JobInterest,
  Review,
} from "@shared/schema";

import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/*
 * ============================================================================
 * Helpers
 * ============================================================================
 */

const mapJob = (job: any): Job => {
  return {
    ...job,

    farmerId:
      job.farmer_id,

    serviceType:
      job.service_type,

    associatesNeeded:
      job.associates_needed,

    skillLevel:
      job.skill_level,

    paymentMethod:
      job.payment_method,

    jobComment:
      job.job_comment,

    latitude:
      job.latitude !== null &&
      job.latitude !== undefined
        ? String(job.latitude)
        : null,

    longitude:
      job.longitude !== null &&
      job.longitude !== undefined
        ? String(job.longitude)
        : null,

    createdAt:
      job.created_at,
  } as Job;
};

const mapUser = (user: any): User => {
  return {
    ...user,

    phoneNumber:
      user.phone_number,

    userType:
      user.user_type,

    dateOfBirth:
      user.date_of_birth,

    skillLevel:
      user.skill_level,

    hourlyRate:
      user.hourly_rate,

    expectedDailySalary:
      user.expected_daily_salary,

    travelDistance:
      user.travel_distance,

    comfortableStaying:
      user.comfortable_staying,

    aadharFrontUrl:
      user.aadhar_front_url,

    aadharBackUrl:
      user.aadhar_back_url,

    averageRating:
      user.average_rating,

    totalRatings:
      user.total_ratings,

    jobsCompleted:
      user.jobs_completed,

    totalEarnings:
      user.total_earnings,

    pendingPayments:
      user.pending_payments,

    createdAt:
      user.created_at,
  } as User;
};

/*
 * ============================================================================
 * Map Job Interest
 * ============================================================================
 */

const mapInterest = (
  item: any,
): JobInterest & {
  associate: User;
} => {
  const interest =
    item?.interest || {};

  const associate =
    item?.associate || {};

  return {
    ...interest,

    associateId:
      interest.associate_id,

    jobId:
      interest.job_id,

    createdAt:
      interest.created_at,

    associate:
      mapUser(associate),
  } as JobInterest & {
    associate: User;
  };
};

/*
 * ============================================================================
 * Map Review
 * ============================================================================
 */

const mapReview = (
  item: any,
): Review & {
  farmer: User;
  associate: User;
} => {
  const review =
    item?.review || {};

  return {
    ...review,

    farmerId:
      review.farmer_id,

    associateId:
      review.associate_id,

    jobId:
      review.job_id,

    reviewText:
      review.review_text,

    createdAt:
      review.created_at,

    farmer:
      mapUser(
        item?.farmer || {},
      ),

    associate:
      mapUser(
        item?.associate || {},
      ),
  } as Review & {
    farmer: User;
    associate: User;
  };
};

/*
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function AdminJobDetails() {
  const [, params] =
    useRoute("/admin/job/:id");

  const [, setLocation] =
    useLocation();

  const { toast } =
    useToast();

  const queryClient =
    useQueryClient();

  const [
    isEditing,
    setIsEditing,
  ] = useState(false);

  const [
    showAssignDialog,
    setShowAssignDialog,
  ] = useState(false);

  const [
    associateSearch,
    setAssociateSearch,
  ] = useState("");

  const jobId =
    params?.id;

  /*
   * ==========================================================================
   * Load Job + Farmer
   * ==========================================================================
   */

  const {
    data: jobDetails,
    isLoading,
    error: jobError,
  } = useQuery<{
    job: Job;
    farmer: User | null;
  }>({
    queryKey: [
      "admin",
      "job",
      jobId,
    ],

    enabled:
      !!jobId,

    queryFn: async () => {
      if (!jobId) {
        throw new Error(
          "Job ID is missing",
        );
      }

      const {
        data,
        error,
      } = await supabase.rpc(
        "admin_get_job_details",
        {
          p_job_id:
            jobId,
        },
      );

      if (error) {
        console.error(
          "Failed to load admin job details:",
          error,
        );

        throw new Error(
          error.message,
        );
      }

      if (!data) {
        throw new Error(
          "Job not found",
        );
      }

      return {
        job:
          mapJob(
            data.job,
          ),

        farmer:
          data.farmer
            ? mapUser(
                data.farmer,
              )
            : null,
      };
    },
  });

  const job =
    jobDetails?.job;

  const farmer =
    jobDetails?.farmer;

  /*
   * ==========================================================================
   * Job Status
   * ==========================================================================
   */

  const isActiveJob =
    job?.status === "Open" ||
    job?.status === "Assigned";

  const isReadOnlyJob =
    job?.status === "Completed" ||
    job?.status === "Cancelled";

  /*
   * ==========================================================================
   * Load Interested Associates
   * ==========================================================================
   */

  const {
    data: interests = [],
    isLoading:
      interestsLoading,
  } = useQuery<
    Array<
      JobInterest & {
        associate: User;
      }
    >
  >({
    queryKey: [
      "admin",
      "job-interests",
      jobId,
    ],

    enabled:
      !!jobId,

    queryFn: async () => {
      if (!jobId) {
        return [];
      }

      const {
        data,
        error,
      } = await supabase.rpc(
        "admin_get_job_interests",
        {
          p_job_id:
            jobId,
        },
      );

      if (error) {
        console.error(
          "Failed to load job interests:",
          error,
        );

        throw new Error(
          error.message,
        );
      }

      return (
        data || []
      ).map(
        mapInterest,
      );
    },
  });

  /*
   * ==========================================================================
   * Load Reviews
   * ==========================================================================
   */

  const {
    data: reviews = [],
    isLoading:
      reviewsLoading,
  } = useQuery<
    Array<
      Review & {
        farmer: User;
        associate: User;
      }
    >
  >({
    queryKey: [
      "admin",
      "job-reviews",
      jobId,
    ],

    enabled:
      !!jobId,

    queryFn: async () => {
      if (!jobId) {
        return [];
      }

      const {
        data,
        error,
      } = await supabase.rpc(
        "admin_get_job_reviews",
        {
          p_job_id:
            jobId,
        },
      );

      if (error) {
        console.error(
          "Failed to load job reviews:",
          error,
        );

        throw new Error(
          error.message,
        );
      }

      return (
        data || []
      ).map(
        mapReview,
      );
    },
  });

  /*
   * ==========================================================================
   * Load All Associates
   * ==========================================================================
   */

  const {
    data: allAssociates = [],
    isLoading:
      associatesLoading,
  } = useQuery<User[]>({
    queryKey: [
      "admin",
      "associates",
    ],

    queryFn: async () => {
      const {
        data,
        error,
      } = await supabase.rpc(
        "admin_get_all_users",
      );

      if (error) {
        console.error(
          "Failed to load associates:",
          error,
        );

        throw new Error(
          error.message,
        );
      }

      return (
        data || []
      )
        .filter(
          (item: any) =>
            String(
              item.user_type || "",
            ).toLowerCase() ===
            "associate",
        )
        .map(
          mapUser,
        );
    },
  });

  /*
   * ==========================================================================
   * Associates Already Associated With This Job
   * ==========================================================================
   */

  const associatedIds =
    new Set(
      interests.map(
        (interest) =>
          interest.associateId,
      ),
    );

  /*
   * ==========================================================================
   * Filter Associates For Assignment
   * ==========================================================================
   */

  const filteredAssociates =
    allAssociates
      .filter(
        (associate) =>
          !associatedIds.has(
            associate.id,
          ),
      )
      .filter(
        (associate) => {
          const search =
            associateSearch
              .trim()
              .toLowerCase();

          if (!search) {
            return true;
          }

          const searchableValues = [
            associate.name,
            associate.phoneNumber,
            associate.location,
            associate.userType,
            associate.skillLevel,
            associate.gender,
            associate.dateOfBirth,
            associate.hourlyRate,
            associate.expectedDailySalary,
            associate.travelDistance,
            associate.comfortableStaying,
            associate.averageRating,
            associate.jobsCompleted,
            ...(Array.isArray(
              associate.skills,
            )
              ? associate.skills
              : []),
          ];

          return searchableValues
            .filter(
              (value) =>
                value !== null &&
                value !== undefined,
            )
            .some(
              (value) =>
                String(value)
                  .toLowerCase()
                  .includes(
                    search,
                  ),
            );
        },
      );

  /*
   * ==========================================================================
   * Update Job
   * ==========================================================================
   */

  const updateJobMutation =
    useMutation({
      mutationFn:
        async (
          data: any,
        ) => {
          if (!job) {
            throw new Error(
              "Job not loaded",
            );
          }

          if (!isActiveJob) {
            throw new Error(
              "Completed or Cancelled jobs cannot be edited.",
            );
          }

          const {
            data:
              updatedJob,
            error,
          } =
            await supabase.rpc(
              "admin_update_job",
              {
                p_job_id:
                  job.id,

                p_service_type:
                  data.serviceType,

                p_date:
                  data.date,

                p_time:
                  data.time ||
                  job.time ||
                  "09:00",

                p_duration:
                  Number(
                    data.duration,
                  ),

                p_associates_needed:
                  Number(
                    data.associatesNeeded,
                  ),

                p_skill_level:
                  data.skillLevel ||
                  job.skillLevel ||
                  "Any",

                p_budget:
                  Number(
                    data.budget,
                  ),

                p_latitude:
                  Number(
                    job.latitude,
                  ),

                p_longitude:
                  Number(
                    job.longitude,
                  ),

                p_location:
                  job.location ||
                  "Location on file",

                p_status:
                  data.status,

                p_job_comment:
                  data.jobComment ||
                  null,
              },
            );

          if (error) {
            throw new Error(
              error.message,
            );
          }

          return updatedJob;
        },

      onSuccess:
        () => {
          queryClient.invalidateQueries({
            queryKey: [
              "admin",
              "job",
              jobId,
            ],
          });

          queryClient.invalidateQueries({
            queryKey: [
              "admin",
              "jobs",
            ],
          });

          queryClient.invalidateQueries({
            queryKey: [
              "farmer-jobs",
              job?.farmerId,
            ],
          });

          setIsEditing(
            false,
          );

          toast({
            title:
              "Job Updated",

            description:
              "Job has been successfully updated.",
          });
        },

      onError:
        (error) => {
          toast({
            variant:
              "destructive",

            title:
              "Update Failed",

            description:
              error instanceof Error
                ? error.message
                : "Failed to update job.",
          });
        },
    });

  /*
   * ==========================================================================
   * Cancel Job
   * ==========================================================================
   */

  const cancelJobMutation =
    useMutation({
      mutationFn:
        async () => {
          if (!jobId) {
            throw new Error(
              "Job ID is missing",
            );
          }

          if (!isActiveJob) {
            throw new Error(
              "Completed or Cancelled jobs cannot be cancelled.",
            );
          }

          const {
            data,
            error,
          } =
            await supabase.rpc(
              "admin_update_job",
              {
                p_job_id:
                  jobId,

                p_service_type:
                  job?.serviceType,

                p_date:
                  job?.date,

                p_time:
                  job?.time ||
                  "09:00",

                p_duration:
                  Number(
                    job?.duration,
                  ),

                p_associates_needed:
                  Number(
                    job?.associatesNeeded,
                  ),

                p_skill_level:
                  job?.skillLevel ||
                  "Any",

                p_budget:
                  Number(
                    job?.budget,
                  ),

                p_latitude:
                  Number(
                    job?.latitude,
                  ),

                p_longitude:
                  Number(
                    job?.longitude,
                  ),

                p_location:
                  job?.location ||
                  "Location on file",

                p_status:
                  "Cancelled",

                p_job_comment:
                  job?.jobComment ||
                  null,
              },
            );

          if (error) {
            throw new Error(
              error.message,
            );
          }

          return data;
        },

      onSuccess:
        () => {
          queryClient.invalidateQueries({
            queryKey: [
              "admin",
              "job",
              jobId,
            ],
          });

          queryClient.invalidateQueries({
            queryKey: [
              "admin",
              "jobs",
            ],
          });

          queryClient.invalidateQueries({
            queryKey: [
              "farmer-jobs",
              job?.farmerId,
            ],
          });

          toast({
            title:
              "Job Cancelled",

            description:
              "The job has been cancelled.",
          });
        },

      onError:
        (error) => {
          toast({
            variant:
              "destructive",

            title:
              "Cancellation Failed",

            description:
              error instanceof Error
                ? error.message
                : "Failed to cancel job.",
          });
        },
    });

  /*
   * ==========================================================================
   * Complete Job
   * ==========================================================================
   */

  const completeJobMutation =
    useMutation({
      mutationFn:
        async () => {
          if (!jobId) {
            throw new Error(
              "Job ID is missing",
            );
          }

          if (!isActiveJob) {
            throw new Error(
              "This job is already Completed or Cancelled.",
            );
          }

          const {
            data,
            error,
          } =
            await supabase.rpc(
              "admin_update_job",
              {
                p_job_id:
                  jobId,

                p_service_type:
                  job?.serviceType,

                p_date:
                  job?.date,

                p_time:
                  job?.time ||
                  "09:00",

                p_duration:
                  Number(
                    job?.duration,
                  ),

                p_associates_needed:
                  Number(
                    job?.associatesNeeded,
                  ),

                p_skill_level:
                  job?.skillLevel ||
                  "Any",

                p_budget:
                  Number(
                    job?.budget,
                  ),

                p_latitude:
                  Number(
                    job?.latitude,
                  ),

                p_longitude:
                  Number(
                    job?.longitude,
                  ),

                p_location:
                  job?.location ||
                  "Location on file",

                p_status:
                  "Completed",

                p_job_comment:
                  job?.jobComment ||
                  null,
              },
            );

          if (error) {
            throw new Error(
              error.message,
            );
          }

          return data;
        },

      onSuccess:
        () => {
          queryClient.invalidateQueries({
            queryKey: [
              "admin",
              "job",
              jobId,
            ],
          });

          queryClient.invalidateQueries({
            queryKey: [
              "admin",
              "jobs",
            ],
          });

          queryClient.invalidateQueries({
            queryKey: [
              "farmer-jobs",
              job?.farmerId,
            ],
          });

          toast({
            title:
              "Job Completed",

            description:
              "The job has been marked as completed.",
          });
        },

      onError:
        (error) => {
          toast({
            variant:
              "destructive",

            title:
              "Completion Failed",

            description:
              error instanceof Error
                ? error.message
                : "Failed to complete job.",
          });
        },
    });

  /*
   * ==========================================================================
   * Admin Assign Associate
   * ==========================================================================
   */

  const assignAssociateMutation =
    useMutation({
      mutationFn:
        async (
          associateId: string,
        ) => {
          if (!jobId) {
            throw new Error(
              "Job ID is missing",
            );
          }

          if (!isActiveJob) {
            throw new Error(
              "Associates cannot be assigned to a Completed or Cancelled job.",
            );
          }

          if (!associateId) {
            throw new Error(
              "Associate ID is missing",
            );
          }

          const {
            data,
            error,
          } =
            await supabase.rpc(
              "admin_assign_job_associate",
              {
                p_job_id:
                  jobId,

                p_associate_id:
                  associateId,
              },
            );

          if (error) {
            throw new Error(
              error.message,
            );
          }

          return data;
        },

      onSuccess:
        () => {
          queryClient.invalidateQueries({
            queryKey: [
              "admin",
              "job-interests",
              jobId,
            ],
          });

          setAssociateSearch("");

          setShowAssignDialog(
            false,
          );

          toast({
            title:
              "Associate Assigned",

            description:
              "The associate has been added as an interested associate.",
          });
        },

      onError:
        (error) => {
          toast({
            variant:
              "destructive",

            title:
              "Assignment Failed",

            description:
              error instanceof Error
                ? error.message
                : "Failed to assign associate.",
          });
        },
    });

  /*
   * ==========================================================================
   * Shortlist / Remove Shortlist
   * ==========================================================================
   *
   * IMPORTANT:
   *
   * We intentionally use update_fyndo_job_interest for BOTH operations.
   *
   * Shortlist:
   *     interested -> shortlisted
   *
   * Remove shortlist:
   *     shortlisted -> interested
   *
   * We DO NOT delete the job_interests record.
   * ==========================================================================
   */

  const updateInterestMutation =
    useMutation({
      mutationFn:
        async ({
          associateId,
          status,
        }: {
          associateId: string;
          status: "interested" | "shortlisted";
        }) => {
          if (!jobId) {
            throw new Error(
              "Job ID is missing",
            );
          }

          if (!isActiveJob) {
            throw new Error(
              "Associates cannot be updated for a Completed or Cancelled job.",
            );
          }

          const {
            data,
            error,
          } =
            await supabase.rpc(
              "update_fyndo_job_interest",
              {
                p_job_id:
                  jobId,

                p_associate_id:
                  associateId,

                p_status:
                  status,
              },
            );

          if (error) {
            throw new Error(
              error.message,
            );
          }

          if (!data) {
            throw new Error(
              "No interest record was updated.",
            );
          }

          return data;
        },

      onSuccess:
        () => {
          queryClient.invalidateQueries({
            queryKey: [
              "admin",
              "job-interests",
              jobId,
            ],
          });

          toast({
            title:
              "Associate Updated",

            description:
              "Associate status has been updated successfully.",
          });
        },

      onError:
        (error) => {
          toast({
            variant:
              "destructive",

            title:
              "Update Failed",

            description:
              error instanceof Error
                ? error.message
                : "Failed to update associate status.",
          });
        },
    });

  /*
   * ==========================================================================
   * Delete Review
   * ==========================================================================
   */

  const deleteReviewMutation =
    useMutation({
      mutationFn:
        async (
          reviewId: string,
        ) => {
          const {
            data,
            error,
          } =
            await supabase.rpc(
              "admin_delete_review",
              {
                p_review_id:
                  reviewId,
              },
            );

          if (error) {
            throw new Error(
              error.message,
            );
          }

          return data;
        },

      onSuccess:
        () => {
          queryClient.invalidateQueries({
            queryKey: [
              "admin",
              "job-reviews",
              jobId,
            ],
          });

          toast({
            title:
              "Review Deleted",

            description:
              "Review has been successfully deleted.",
          });
        },

      onError:
        (error) => {
          toast({
            variant:
              "destructive",

            title:
              "Delete Failed",

            description:
              error instanceof Error
                ? error.message
                : "Failed to delete review.",
          });
        },
    });

  /*
   * ==========================================================================
   * Form Schema
   * ==========================================================================
   */

  const updateJobSchema =
    insertJobSchema.extend({
      status:
        z.enum([
          "Open",
          "Assigned",
          "Completed",
          "Cancelled",
        ]),
    });

  const form =
    useForm({
      resolver:
        zodResolver(
          updateJobSchema,
        ),

      values:
        job
          ? {
              ...job,

              serviceType:
                job.serviceType,

              date:
                job.date,

              time:
                job.time,

              duration:
                job.duration,

              associatesNeeded:
                job.associatesNeeded,

              budget:
                job.budget,

              jobComment:
                job.jobComment ||
                "",

              status:
                job.status,
            }
          : undefined,
    });

  /*
   * ==========================================================================
   * Loading
   * ==========================================================================
   */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="text-center py-8">
          Loading job details...
        </div>
      </div>
    );
  }

  /*
   * ==========================================================================
   * Error
   * ==========================================================================
   */

  if (
    jobError ||
    !job
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="container mx-auto max-w-6xl">

          <Button
            variant="ghost"
            onClick={() =>
              setLocation(
                "/admin/dashboard?tab=jobs",
              )
            }
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>

          <Card>
            <CardContent className="py-8 text-center">

              <p className="text-destructive">
                Failed to load job details.
              </p>

              <p className="text-sm text-muted-foreground mt-2">
                {jobError instanceof Error
                  ? jobError.message
                  : "Job not found"}
              </p>

            </CardContent>
          </Card>

        </div>
      </div>
    );
  }

  /*
   * ==========================================================================
   * Actions
   * ==========================================================================
   */

  const handleUpdate =
    async (
      data: any,
    ) => {
      if (!isActiveJob) {
        toast({
          variant:
            "destructive",

          title:
            "Update Not Allowed",

          description:
            "Completed or Cancelled jobs cannot be edited.",
        });

        return;
      }

      updateJobMutation.mutate(
        data,
      );
    };

  const handleCancel =
    () => {
      if (!isActiveJob) {
        return;
      }

      cancelJobMutation.mutate();
    };

  const handleComplete =
    () => {
      if (!isActiveJob) {
        return;
      }

      completeJobMutation.mutate();
    };

  /*
   * ==========================================================================
   * Render
   * ==========================================================================
   */

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">

      <div className="container mx-auto max-w-6xl">

        {/* Back */}

        <Button
          variant="ghost"
          onClick={() =>
            setLocation(
              "/admin/dashboard?tab=jobs",
            )
          }
          className="mb-4"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        <div className="space-y-6">

          {/* ================================================================= */}
          {/* Job Details */}
          {/* ================================================================= */}

          <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">

            <CardHeader className="flex flex-row items-center justify-between">

              <CardTitle>
                Job Details
              </CardTitle>

              <div className="flex gap-2 flex-wrap justify-end">

                {!isEditing ? (
                  <>
                    {/* Edit */}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setIsEditing(
                          true,
                        )
                      }
                      disabled={
                        !isActiveJob
                      }
                      data-testid="button-edit"
                    >
                      Edit
                    </Button>

                    {/* Cancel */}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={
                        handleCancel
                      }
                      disabled={
                        !isActiveJob ||
                        cancelJobMutation.isPending
                      }
                      data-testid="button-cancel-job"
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Cancel Job
                    </Button>

                    {/* Complete */}

                    {isActiveJob && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={
                          handleComplete
                        }
                        disabled={
                          completeJobMutation.isPending
                        }
                        data-testid="button-complete-job"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />

                        {completeJobMutation.isPending
                          ? "Completing..."
                          : "Mark Completed"}
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setIsEditing(
                        false,
                      )
                    }
                    data-testid="button-cancel-edit"
                  >
                    Cancel
                  </Button>
                )}

              </div>

            </CardHeader>

            <CardContent>

              {isEditing ? (
                <Form {...form}>

                  <form
                    onSubmit={
                      form.handleSubmit(
                        handleUpdate,
                      )
                    }
                    className="space-y-4"
                  >

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      {/* Service */}

                      <FormField
                        control={
                          form.control
                        }
                        name="serviceType"
                        render={({
                          field,
                        }) => (
                          <FormItem>

                            <FormLabel>
                              Service Type
                            </FormLabel>

                            <FormControl>
                              <Input
                                {...field}
                                data-testid="input-service-type"
                              />
                            </FormControl>

                            <FormMessage />

                          </FormItem>
                        )}
                      />

                      {/* Status */}

                      <FormField
                        control={
                          form.control
                        }
                        name="status"
                        render={({
                          field,
                        }) => (
                          <FormItem>

                            <FormLabel>
                              Status
                            </FormLabel>

                            <Select
                              onValueChange={
                                field.onChange
                              }
                              value={
                                field.value
                              }
                            >
                              <FormControl>

                                <SelectTrigger
                                  data-testid="select-status"
                                >
                                  <SelectValue />
                                </SelectTrigger>

                              </FormControl>

                              <SelectContent>

                                <SelectItem value="Open">
                                  Open
                                </SelectItem>

                                <SelectItem value="Assigned">
                                  Assigned
                                </SelectItem>

                                <SelectItem value="Completed">
                                  Completed
                                </SelectItem>

                                <SelectItem value="Cancelled">
                                  Cancelled
                                </SelectItem>

                              </SelectContent>
                            </Select>

                            <FormMessage />

                          </FormItem>
                        )}
                      />

                      {/* Date */}

                      <FormField
                        control={
                          form.control
                        }
                        name="date"
                        render={({
                          field,
                        }) => (
                          <FormItem>

                            <FormLabel>
                              Date
                            </FormLabel>

                            <FormControl>

                              <Input
                                {...field}
                                type="date"
                                data-testid="input-date"
                              />

                            </FormControl>

                            <FormMessage />

                          </FormItem>
                        )}
                      />

                      {/* Time */}

                      <FormField
                        control={
                          form.control
                        }
                        name="time"
                        render={({
                          field,
                        }) => (
                          <FormItem>

                            <FormLabel>
                              Time
                            </FormLabel>

                            <FormControl>

                              <Input
                                {...field}
                                type="time"
                                data-testid="input-time"
                              />

                            </FormControl>

                            <FormMessage />

                          </FormItem>
                        )}
                      />

                      {/* Duration */}

                      <FormField
                        control={
                          form.control
                        }
                        name="duration"
                        render={({
                          field,
                        }) => (
                          <FormItem>

                            <FormLabel>
                              Duration (days)
                            </FormLabel>

                            <FormControl>

                              <Input
                                {...field}
                                type="number"
                                onChange={(
                                  e,
                                ) =>
                                  field.onChange(
                                    parseInt(
                                      e.target
                                        .value,
                                      10,
                                    ),
                                  )
                                }
                                data-testid="input-duration"
                              />

                            </FormControl>

                            <FormMessage />

                          </FormItem>
                        )}
                      />

                      {/* Associates */}

                      <FormField
                        control={
                          form.control
                        }
                        name="associatesNeeded"
                        render={({
                          field,
                        }) => (
                          <FormItem>

                            <FormLabel>
                              Associates Needed
                            </FormLabel>

                            <FormControl>

                              <Input
                                {...field}
                                type="number"
                                onChange={(
                                  e,
                                ) =>
                                  field.onChange(
                                    parseInt(
                                      e.target
                                        .value,
                                      10,
                                    ),
                                  )
                                }
                                data-testid="input-associates"
                              />

                            </FormControl>

                            <FormMessage />

                          </FormItem>
                        )}
                      />

                      {/* Budget */}

                      <FormField
                        control={
                          form.control
                        }
                        name="budget"
                        render={({
                          field,
                        }) => (
                          <FormItem>

                            <FormLabel>
                              Budget (Rs.)
                            </FormLabel>

                            <FormControl>

                              <Input
                                {...field}
                                type="number"
                                onChange={(
                                  e,
                                ) =>
                                  field.onChange(
                                    parseInt(
                                      e.target
                                        .value,
                                      10,
                                    ),
                                  )
                                }
                                data-testid="input-budget"
                              />

                            </FormControl>

                            <FormMessage />

                          </FormItem>
                        )}
                      />

                    </div>

                    {/* Comment */}

                    <FormField
                      control={
                        form.control
                      }
                      name="jobComment"
                      render={({
                        field,
                      }) => (
                        <FormItem>

                          <FormLabel>
                            Job Comment
                          </FormLabel>

                          <FormControl>

                            <Textarea
                              {...field}
                              value={
                                field.value ||
                                ""
                              }
                              data-testid="input-job-comment"
                            />

                          </FormControl>

                          <FormMessage />

                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={
                        updateJobMutation.isPending ||
                        !isActiveJob
                      }
                      data-testid="button-update-job"
                    >
                      {updateJobMutation.isPending
                        ? "Updating..."
                        : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Update Job
                          </>
                        )}
                    </Button>

                  </form>

                </Form>
              ) : (

                /* ============================================================
                 * Read-only Details
                 * ============================================================ */

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>

                    <p className="text-sm text-muted-foreground">
                      Status
                    </p>

                    <Badge
                      variant={
                        job.status ===
                        "Cancelled"
                          ? "destructive"
                          : job.status ===
                            "Completed"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {job.status}
                    </Badge>

                  </div>

                  <div>

                    <p className="text-sm text-muted-foreground">
                      Farmer
                    </p>

                    <p>
                      {farmer?.name ||
                        "Unknown"}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-muted-foreground">
                      Mobile
                    </p>

                    <p>
                      {farmer?.phoneNumber
                        ? formatPhone(
                            farmer.phoneNumber,
                          )
                        : "N/A"}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-muted-foreground">
                      Service Type
                    </p>

                    <p>
                      {job.serviceType}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-muted-foreground">
                      Date
                    </p>

                    <p>
                      {job.date}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-muted-foreground">
                      Time
                    </p>

                    <p>
                      {job.time ||
                        "N/A"}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-muted-foreground">
                      Duration
                    </p>

                    <p>
                      {job.duration} days
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-muted-foreground">
                      Associates Needed
                    </p>

                    <p>
                      {job.associatesNeeded}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-muted-foreground">
                      Budget
                    </p>

                    <p>
                      Rs. {job.budget}
                    </p>

                  </div>

                  <div className="md:col-span-2">

                    <p className="text-sm text-muted-foreground">
                      Location
                    </p>

                    <p className="text-sm">
                      {job.location ||
                        "N/A"}
                    </p>

                    {job.latitude &&
                      job.longitude && (
                        <a
                          href={`https://www.google.com/maps?q=${job.latitude},${job.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-sm hover:underline inline-flex items-center gap-1 mt-1"
                          data-testid="link-job-map"
                        >
                          View on Map
                        </a>
                      )}

                  </div>

                  {job.jobComment && (
                    <div className="md:col-span-2">

                      <p className="text-sm text-muted-foreground">
                        Job Comment
                      </p>

                      <p className="text-sm">
                        {job.jobComment}
                      </p>

                    </div>
                  )}

                </div>
              )}

            </CardContent>
          </Card>

          {/* ================================================================= */}
          {/* Interested Associates */}
          {/* ================================================================= */}

          <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">

            <CardHeader>

              <div className="flex items-center justify-between gap-3 flex-wrap">

                <CardTitle>
                  Interested Associates (
                  {interests.length}
                  )
                </CardTitle>

                <Button
                  size="sm"
                  onClick={() =>
                    setShowAssignDialog(
                      true,
                    )
                  }
                  disabled={
                    !isActiveJob
                  }
                  data-testid="button-assign-associate"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign Associate
                </Button>

              </div>

              {isReadOnlyJob && (
                <p className="text-xs text-muted-foreground mt-2">
                  Associates cannot be added, shortlisted, or removed from a{" "}
                  {job.status.toLowerCase()} job.
                </p>
              )}

            </CardHeader>

            <CardContent>

              {interestsLoading ? (

                <p className="text-sm text-muted-foreground text-center py-4">
                  Loading associates...
                </p>

              ) : interests.length === 0 ? (

                <p className="text-sm text-muted-foreground text-center py-4">
                  No associates have expressed interest yet
                </p>

              ) : (

                <div className="space-y-3">

                  {interests.map(
                    (
                      interest,
                    ) => {

                      const normalizedStatus =
                        String(
                          interest.status ||
                            "",
                        ).toLowerCase();

                      const isShortlisted =
                        normalizedStatus ===
                        "shortlisted";

                      const isInterested =
                        normalizedStatus ===
                        "interested";

                      return (
                        <Card
                          key={
                            interest.id
                          }
                          className="p-4"
                        >

                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                            <div className="flex-1">

                              <div className="flex items-center gap-2 flex-wrap">

                                <p className="font-medium">
                                  {
                                    interest
                                      .associate
                                      .name
                                  }
                                </p>

                                {/* Interested / Shortlisted Status */}

                                {isShortlisted ? (

                                  <Badge
  variant="default"
  data-testid={`badge-shortlisted-${interest.associateId}`}
>
  Shortlisted
</Badge>

                                ) : isInterested ? (

                                  <Badge
                                    className="bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-50"
                                    data-testid={`badge-interested-${interest.associateId}`}
                                  >
                                    Interested
                                  </Badge>

                                ) : (

                                  <Badge
                                    variant="outline"
                                  >
                                    {interest.status}
                                  </Badge>

                                )}

                              </div>

                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">

                                <p className="text-sm text-muted-foreground flex items-center gap-1">

                                  <Phone className="w-3 h-3" />

                                  {
                                    interest
                                      .associate
                                      .phoneNumber
                                      ? formatPhone(
                                          interest
                                            .associate
                                            .phoneNumber,
                                        )
                                      : "N/A"
                                  }

                                </p>

                                {interest.associate.location && (
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">

                                    <MapPin className="w-3 h-3" />

                                    {
                                      interest
                                        .associate
                                        .location
                                    }

                                  </p>
                                )}

                              </div>

                              {interest.associate
                                .skills &&
                                interest.associate
                                  .skills.length >
                                  0 && (

                                  <div className="flex gap-1 mt-2 flex-wrap">

                                    {interest.associate.skills.map(
                                      (
                                        skill,
                                      ) => (

                                        <Badge
                                          key={
                                            skill
                                          }
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {
                                            skill
                                          }
                                        </Badge>

                                      ),
                                    )}

                                  </div>

                                )}

                            </div>

                            <div className="flex gap-2 shrink-0">

                              {/* =================================================
                               * Shortlisted -> Remove shortlist
                               * ================================================= */}

                              {isShortlisted ? (

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateInterestMutation.mutate(
                                      {
                                        associateId:
                                          interest.associateId,
                                        status:
                                          "interested",
                                      },
                                    )
                                  }
                                  disabled={
                                    !isActiveJob ||
                                    updateInterestMutation.isPending
                                  }
                                  data-testid={`button-remove-shortlist-${interest.associateId}`}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Remove shortlist
                                </Button>

                              ) : (

                                /* ===============================================
                                 * Interested -> Shortlist
                                 * =============================================== */

                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateInterestMutation.mutate(
                                      {
                                        associateId:
                                          interest.associateId,
                                        status:
                                          "shortlisted",
                                      },
                                    )
                                  }
                                  disabled={
                                    !isActiveJob ||
                                    updateInterestMutation.isPending
                                  }
                                  data-testid={`button-shortlist-${interest.associateId}`}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Shortlist
                                </Button>

                              )}

                            </div>

                          </div>

                        </Card>
                      );
                    },
                  )}

                </div>

              )}

            </CardContent>
          </Card>

          {/* ================================================================= */}
          {/* Reviews */}
          {/* ================================================================= */}

          <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">

            <CardHeader>

              <CardTitle>
                Reviews & Ratings (
                {reviews.length}
                )
              </CardTitle>

            </CardHeader>

            <CardContent>

              {reviewsLoading ? (

                <p className="text-sm text-muted-foreground text-center py-4">
                  Loading reviews...
                </p>

              ) : reviews.length === 0 ? (

                <p className="text-sm text-muted-foreground text-center py-4">
                  No reviews yet
                </p>

              ) : (

                <div className="space-y-4">

                  {reviews.map(
                    (
                      review,
                    ) => (

                      <Card
                        key={
                          review.id
                        }
                        className="p-4"
                        data-testid={`review-${review.id}`}
                      >

                        <div className="flex items-start justify-between">

                          <div className="flex-1">

                            <div className="flex items-center gap-2 mb-2">

                              <p className="font-medium">
                                {
                                  review
                                    .associate
                                    .name
                                }
                              </p>

                              <div className="flex items-center gap-1">

                                {Array.from(
                                  {
                                    length: 5,
                                  },
                                ).map(
                                  (
                                    _,
                                    i,
                                  ) => (

                                    <Star
                                      key={
                                        i
                                      }
                                      className={`w-4 h-4 ${
                                        i <
                                        review.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />

                                  ),
                                )}

                              </div>

                              <span className="text-sm text-muted-foreground">
                                {
                                  review.rating
                                }
                                /5
                              </span>

                            </div>

                            {review.reviewText && (
                              <p className="text-sm text-muted-foreground">
                                {
                                  review.reviewText
                                }
                              </p>
                            )}

                            <p className="text-xs text-muted-foreground mt-2">

                              By{" "}

                              {
                                review
                                  .farmer
                                  .name
                              }{" "}

                              on{" "}

                              {
                                review.createdAt
                                  ? new Date(
                                      review.createdAt,
                                    ).toLocaleDateString()
                                  : "N/A"
                              }

                            </p>

                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              deleteReviewMutation.mutate(
                                review.id,
                              )
                            }
                            disabled={
                              deleteReviewMutation.isPending
                            }
                            data-testid={`button-delete-review-${review.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>

                        </div>

                      </Card>

                    ),
                  )}

                </div>

              )}

            </CardContent>
          </Card>

        </div>

      </div>

      {/* ===================================================================== */}
      {/* Assign Associate Dialog */}
      {/* ===================================================================== */}

      <Dialog
        open={
          showAssignDialog
        }
        onOpenChange={(
          open,
        ) => {
          setShowAssignDialog(
            open,
          );

          if (!open) {
            setAssociateSearch(
              "",
            );
          }
        }}
      >

        <DialogContent className="max-w-2xl max-h-[85vh]">

          <DialogHeader>

            <DialogTitle>
              Assign Associate
            </DialogTitle>

            <DialogDescription>
              Select any Associate to add them as an interested associate for
              this active job. Location is not used as a restriction.
            </DialogDescription>

          </DialogHeader>

          {/* Search */}

          <div className="relative">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

            <Input
              value={
                associateSearch
              }
              onChange={(
                event,
              ) =>
                setAssociateSearch(
                  event.target
                    .value,
                )
              }
              placeholder="Search by name, mobile, location, skill..."
              className="pl-9 pr-9"
              data-testid="input-associate-search"
            />

            {associateSearch && (
              <button
                type="button"
                onClick={() =>
                  setAssociateSearch(
                    "",
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

          </div>

          {/* Associate list */}

          <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">

            {associatesLoading ? (

              <div className="py-8 text-center text-sm text-muted-foreground">
                Loading associates...
              </div>

            ) : filteredAssociates.length === 0 ? (

              <div className="py-8 text-center">

                <Users className="w-10 h-10 mx-auto text-muted-foreground mb-2" />

                <p className="font-medium">
                  No associates found
                </p>

                <p className="text-sm text-muted-foreground mt-1">
                  {associateSearch
                    ? "Try a different search keyword."
                    : "All associates are already associated with this job."}
                </p>

              </div>

            ) : (

              filteredAssociates.map(
                (
                  associate,
                ) => (

                  <Card
                    key={
                      associate.id
                    }
                    className="p-3"
                  >

                    <div className="flex items-center justify-between gap-3">

                      <div className="flex-1 min-w-0">

                        <div className="flex items-center gap-2 flex-wrap">

                          <p className="font-medium">
                            {
                              associate.name ||
                              "Associate"
                            }
                          </p>

                          {associate.averageRating !==
                            null &&
                            associate.averageRating !==
                              undefined && (
                              <Badge
                                variant="secondary"
                                className="text-xs"
                              >
                                ★{" "}
                                {Number(
                                  associate.averageRating,
                                ).toFixed(
                                  1,
                                )}
                              </Badge>
                            )}

                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">

                          {associate.phoneNumber && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">

                              <Phone className="w-3 h-3" />

                              {
                                formatPhone(
                                  associate.phoneNumber,
                                )
                              }

                            </p>
                          )}

                          {associate.location && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">

                              <MapPin className="w-3 h-3" />

                              {
                                associate.location
                              }

                            </p>
                          )}

                        </div>

                        {associate.skills &&
                          associate.skills.length >
                            0 && (

                            <div className="flex gap-1 mt-2 flex-wrap">

                              {associate.skills
                                .slice(
                                  0,
                                  5,
                                )
                                .map(
                                  (
                                    skill,
                                  ) => (

                                    <Badge
                                      key={
                                        skill
                                      }
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {
                                        skill
                                      }
                                    </Badge>

                                  ),
                                )}

                            </div>

                          )}

                      </div>

                      <Button
                        size="sm"
                        onClick={() =>
                          assignAssociateMutation.mutate(
                            associate.id,
                          )
                        }
                        disabled={
                          !isActiveJob ||
                          assignAssociateMutation.isPending
                        }
                        data-testid={`button-assign-associate-${associate.id}`}
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Assign
                      </Button>

                    </div>

                  </Card>
                ),
              )

            )}

          </div>

          <DialogFooter>

            <Button
              variant="outline"
              onClick={() =>
                setShowAssignDialog(
                  false,
                )
              }
            >
              Close
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

    </div>
  );
}