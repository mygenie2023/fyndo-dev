import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import JobPostingFlow from "@/components/JobPostingFlow";
import RatingDialog from "@/components/RatingDialog";
import { useUser } from "@/lib/userContext";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Edit,
  X,
  Check,
  CheckCircle,
  Star,
  BriefcaseBusiness,
  Phone,
} from "lucide-react";
import fyndoLogo from "@assets/FYNDO_v1.0_1770731684699.png";
import BottomNav from "@/components/BottomNav";
import { useLocationName } from "@/hooks/use-location-name";
import { useJobCompletion } from "@/hooks/use-job-completion";
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
import type { Job, User } from "@shared/schema";

export default function JobDetails() {
  const [, params] = useRoute("/job-details/:id");
  const jobId = params?.id;
  const [, setLocation] = useLocation();
  const { user } = useUser();

  const [shortlisted, setShortlisted] = useState<Set<string>>(
    new Set()
  );

  const [isEditing, setIsEditing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // ---------------------------------------------------------------------------
  // Job Completion
  // ---------------------------------------------------------------------------

  const {
    showCompleteDialog,
    showRatingDialog,
    shortlistedAssociates,
    handleMarkCompleted,
    confirmMarkCompleted,
    handleSubmitRatings,
    setShowCompleteDialog,
    setShowRatingDialog,
    isSubmitting,
  } = useJobCompletion(
    jobId || "",
    user?.id
  );

  // ---------------------------------------------------------------------------
  // Job Details
  // ---------------------------------------------------------------------------

  const {
    data: job,
    isLoading: jobLoading,
  } = useQuery<Job>({
    queryKey: ["job", jobId],
    enabled: !!jobId,

    queryFn: async () => {
      const {
        data,
        error,
      } = await supabase.rpc(
        "get_fyndo_job",
        {
          p_job_id: jobId,
        }
      );

      if (error) {
        throw error;
      }

      if (!data) {
        return null;
      }

      return {
        ...data,

        farmerId:
          data.farmer_id,

        serviceType:
          data.service_type,

        associatesNeeded:
          data.associates_needed,

        skillLevel:
          data.skill_level,

        paymentMethod:
          data.payment_method,

        jobComment:
          data.job_comment,

        latitude:
          data.latitude?.toString(),

        longitude:
          data.longitude?.toString(),

        createdAt:
          data.created_at,
      } as Job;
    },
  });

  const locationName =
    useLocationName(
      job?.location,
      job?.latitude,
      job?.longitude
    );

  // ---------------------------------------------------------------------------
  // Job Interests
  // ---------------------------------------------------------------------------

  const {
    data: interests = [],
    isLoading: interestsLoading,
  } = useQuery<
    Array<{
      associate: User;
      status: string;
    }>
  >({
    queryKey: [
      "job-interests",
      jobId,
    ],

    enabled:
      !!jobId &&
      user?.userType === "farmer",

    staleTime: 0,

    refetchOnMount: "always",

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
        throw error;
      }

      return (
        data ?? []
      ).map(
        (item: any) => ({
          associate: {
            ...item.associate,

            phoneNumber:
              item.associate.phone_number,

            userType:
              item.associate.user_type,

            skillLevel:
              item.associate.skill_level,

            hourlyRate:
              item.associate.hourly_rate,

            dateOfBirth:
              item.associate.date_of_birth,

            expectedDailySalary:
              item.associate.expected_daily_salary,

            travelDistance:
              item.associate.travel_distance,

            comfortableStaying:
              item.associate.comfortable_staying,

            aadharFrontUrl:
              item.associate.aadhar_front_url,

            aadharBackUrl:
              item.associate.aadhar_back_url,

            averageRating:
              item.associate.average_rating,

            totalRatings:
              item.associate.total_ratings,

            jobsCompleted:
              item.associate.jobs_completed,

            totalEarnings:
              item.associate.total_earnings,

            pendingPayments:
              item.associate.pending_payments,

            createdAt:
              item.associate.created_at,
          },

          status:
            item.status,
        })
      ) as Array<{
        associate: User;
        status: string;
      }>;
    },
  });

  // ---------------------------------------------------------------------------
  // Cancel Job
  // ---------------------------------------------------------------------------

  const updateJobMutation =
    useMutation({
      mutationFn:
        async () => {
          const {
            data,
            error,
          } = await supabase.rpc(
            "cancel_fyndo_job",
            {
              p_job_id: jobId,
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
              "job",
              jobId,
            ],
          });

          queryClient.invalidateQueries({
            queryKey: [
              "farmer-jobs",
              user?.id,
            ],
          });
        },

      onError:
        (error) => {
          console.error(
            "FYNDO job cancellation error:",
            error
          );
        },
    });

  // ---------------------------------------------------------------------------
  // Update Job Interest
  // ---------------------------------------------------------------------------

  const updateInterestMutation =
    useMutation({
      mutationFn:
        async ({
          associateId,
          status,
        }: {
          associateId: string;
          status: string;
        }) => {
          const {
            data,
            error,
          } = await supabase.rpc(
            "update_fyndo_job_interest",
            {
              p_job_id: jobId,
              p_associate_id:
                associateId,
              p_status:
                status,
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
              "job-interests",
              jobId,
            ],
          });
        },

      onError:
        (error) => {
          console.error(
            "FYNDO job interest update error:",
            error
          );
        },
    });

  // ---------------------------------------------------------------------------
  // Shortlist / Remove Shortlist
  // ---------------------------------------------------------------------------

  const handleShortlist = (
    associateId: string
  ) => {
    if (
      job?.status ===
      "Completed"
    ) {
      return;
    }

    const isCurrentlyShortlisted =
      shortlisted.has(
        associateId
      );

    if (
      isCurrentlyShortlisted
    ) {
      const newShortlisted =
        new Set(
          shortlisted
        );

      newShortlisted.delete(
        associateId
      );

      setShortlisted(
        newShortlisted
      );

      updateInterestMutation.mutate({
        associateId,
        status:
          "interested",
      });

      return;
    }

    if (
      job &&
      shortlisted.size <
        job.associatesNeeded
    ) {
      const newShortlisted =
        new Set(
          shortlisted
        );

      newShortlisted.add(
        associateId
      );

      setShortlisted(
        newShortlisted
      );

      updateInterestMutation.mutate({
        associateId,
        status:
          "shortlisted",
      });

      return;
    }
  };

  // ---------------------------------------------------------------------------
  // Cancel Job
  // ---------------------------------------------------------------------------

  const handleCancelJob = () => {
    setShowCancelDialog(
      true
    );
  };

  const confirmCancelJob = () => {
    updateJobMutation.mutate();

    setShowCancelDialog(
      false
    );
  };

  // ---------------------------------------------------------------------------
  // Synchronize Shortlisted State
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const shortlistedInterests =
      interests.filter(
        (interest) =>
          interest.status.toLowerCase() ===
          "shortlisted"
      );

    const newShortlistedIds =
      new Set(
        shortlistedInterests.map(
          (interest) =>
            interest.associate.id
        )
      );

    const currentIds =
      Array.from(shortlisted)
        .sort()
        .join(",");

    const newIds =
      Array.from(
        newShortlistedIds
      )
        .sort()
        .join(",");

    if (
      currentIds !==
      newIds
    ) {
      setShortlisted(
        newShortlistedIds
      );
    }
  }, [
    interests,
    shortlisted,
  ]);

  // ---------------------------------------------------------------------------
  // Real-time Job Interest Updates
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (
      !jobId ||
      user?.userType !== "farmer"
    ) {
      return;
    }

    const channel = supabase
      .channel(`job-interests-${jobId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "job_interests",
          filter: `job_id=eq.${jobId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: [
              "job-interests",
              jobId,
            ],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    jobId,
    user?.userType,
  ]);

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  if (
    jobLoading ||
    interestsLoading
  ) {
    return (
      <div className="min-h-screen bg-[#FDFCF7]">

        <header className="sticky top-0 z-40 border-b border-[#DDE7E3] bg-white/95 shadow-sm backdrop-blur-xl">

          <div className="mx-auto flex h-[4.5rem] max-w-2xl items-center justify-between px-5">

            <button
              type="button"
              onClick={() =>
                setLocation("/jobs")
              }
              className="rounded-lg transition-opacity hover:opacity-80"
              aria-label="Go to FYNDO home"
            >
              <img
                src={fyndoLogo}
                alt="FYNDO"
                className="h-8 w-auto"
              />
            </button>

          </div>

        </header>

        <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-6">

          <p className="text-sm text-muted-foreground">
            Loading job details...
          </p>

        </div>

      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Job Not Found
  // ---------------------------------------------------------------------------

  if (!job) {
    return (
      <div className="min-h-screen bg-[#FDFCF7]">

        <header className="sticky top-0 z-40 border-b border-[#DDE7E3] bg-white/95 shadow-sm backdrop-blur-xl">

          <div className="mx-auto flex h-[4.5rem] max-w-2xl items-center justify-between px-5">

            <button
              type="button"
              onClick={() =>
                setLocation("/jobs")
              }
              className="rounded-lg transition-opacity hover:opacity-80"
              aria-label="Go to FYNDO home"
            >
              <img
                src={fyndoLogo}
                alt="FYNDO"
                className="h-8 w-auto"
              />
            </button>

          </div>

        </header>

        <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-6">

          <p className="text-sm text-muted-foreground">
            Job not found
          </p>

        </div>

      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Job Status Badge
  // ---------------------------------------------------------------------------

  const getStatusBadge = (
    status: string
  ) => {
    const config: Record<
      string,
      {
        label: string;
        className: string;
      }
    > = {
      Open: {
        label: "Active",
        className:
          "border-primary/20 bg-primary/10 text-primary",
      },

      Assigned: {
        label: "Active",
        className:
          "border-primary/20 bg-primary/10 text-primary",
      },

      Cancelled: {
        label: "Cancelled",
        className:
          "border-red-200 bg-red-50 text-red-700",
      },

      Completed: {
        label: "Completed",
        className:
          "border-amber-200 bg-amber-50 text-amber-700",
      },
    };

    const {
      label,
      className
    } =
      config[status] || {
        label: status,
        className:
          "border-border bg-muted text-muted-foreground",
      };

    return (
      <Badge
        variant="outline"
        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`}
      >
        {label}
      </Badge>
    );
  };

  const interestedCount =
    interests.filter(
      (interest) => {
        const status =
          interest.status?.toLowerCase();

        return (
          status === "interested" ||
          status === "shortlisted"
        );
      }
    ).length;

  // ---------------------------------------------------------------------------
  // Navigate to Associate Ratings
  // ---------------------------------------------------------------------------

  const openAssociateRatings = (
    associateId: string
  ) => {
    setLocation(
      `/associate-ratings/${associateId}?jobId=${jobId}`
    );
  };

  // ---------------------------------------------------------------------------
  // Editing
  // ---------------------------------------------------------------------------

  if (isEditing) {
    return (
      <JobPostingFlow
        editingJob={job}
        onClose={() =>
          setIsEditing(false)
        }
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Main UI
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#FDFCF7] pb-24">

      {/* Header */}

      <header className="sticky top-0 z-40 border-b border-[#DDE7E3] bg-white/95 shadow-sm backdrop-blur-xl">

        <div className="mx-auto flex h-[4.5rem] max-w-2xl items-center justify-between gap-3 px-5">

          <button
            type="button"
            onClick={() =>
              setLocation("/jobs")
            }
            className="flex items-center rounded-lg p-0 transition-opacity duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary/30"
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

        </div>

      </header>

      {/* Main Content */}

      <main className="mx-auto max-w-2xl px-5 py-5">

        {/* Back */}

        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setLocation("/jobs")
          }
          className="-ml-2 mb-4 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>

        {/* ================================================================= */}
        {/* Job Card */}
        {/* ================================================================= */}

        <Card
          className="
            group cursor-pointer overflow-hidden rounded-3xl
            border border-[#DCE7E3]
            bg-white
            shadow-[0_8px_28px_rgba(31,55,46,0.075)]
            transition-all duration-300
            hover:shadow-lift
          "
        >

          <CardContent className="p-5">

            {/* Job Header */}

            <div className="mb-5 flex items-start justify-between gap-3">

              <div className="min-w-0 flex-1">

                <div className="mb-2 flex min-w-0 items-center gap-2">

                  <div className="shrink-0 rounded-xl bg-primary/10 p-2 ring-1 ring-primary/10">

                    <BriefcaseBusiness
                      className="h-4 w-4 text-primary"
                      strokeWidth={2.25}
                    />

                  </div>

                  <h1 className="min-w-0 truncate font-display text-base font-bold tracking-tight text-[#1F372E]">
                    {job.serviceType}
                  </h1>

                </div>

                <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">

                  <MapPin
                    className="h-3.5 w-3.5 shrink-0 text-primary"
                    strokeWidth={2.25}
                  />

                  <span className="truncate">
                    {locationName}
                  </span>

                </div>

              </div>

              <div className="shrink-0">
                {getStatusBadge(
                  job.status
                )}
              </div>

            </div>

            {/* Job Information */}

            <div className="grid grid-cols-2 gap-3">

              {/* Date */}

              <div className="min-w-0 rounded-2xl border border-[#E2EAE7] bg-[#F7F9F8] p-3">

                <div className="flex min-w-0 items-center gap-2.5">

                  <div className="shrink-0 rounded-xl bg-primary/10 p-2 ring-1 ring-primary/10">

                    <Calendar
                      className="h-3.5 w-3.5 text-primary"
                      strokeWidth={2.25}
                    />

                  </div>

                  <div className="min-w-0">

                    <p className="mb-0.5 text-[11px] font-medium text-muted-foreground">
                      Date
                    </p>

                    <p className="whitespace-nowrap text-sm font-semibold text-[#1F372E]">
                      {new Date(
                        job.date
                      ).toLocaleDateString(
                        "en-GB"
                      )}
                    </p>

                  </div>

                </div>

              </div>

              {/* Workers */}

              <div className="min-w-0 rounded-2xl border border-[#E2EAE7] bg-[#F7F9F8] p-3">

                <div className="flex min-w-0 items-center gap-2.5">

                  <div className="shrink-0 rounded-xl bg-primary/10 p-2 ring-1 ring-primary/10">

                    <Users
                      className="h-3.5 w-3.5 text-primary"
                      strokeWidth={2.25}
                    />

                  </div>

                  <div className="min-w-0">

                    <p className="mb-0.5 text-[11px] font-medium text-muted-foreground">
                      Workers
                    </p>

                    <p className="whitespace-nowrap text-sm font-semibold text-[#1F372E]">
                      {job.associatesNeeded}
                    </p>

                  </div>

                </div>

              </div>

              {/* Budget */}

              <div className="min-w-0 rounded-2xl border border-[#E2EAE7] bg-[#F7F9F8] p-3">

                <div className="flex min-w-0 items-center gap-2.5">

                  <div className="shrink-0 rounded-xl bg-accent/15 p-2 ring-1 ring-accent/20">

                    <DollarSign
                      className="h-3.5 w-3.5 text-accent-foreground"
                      strokeWidth={2.25}
                    />

                  </div>

                  <div className="min-w-0">

                    <p className="mb-0.5 text-[11px] font-medium text-muted-foreground">
                      Budget
                    </p>

                    <p className="whitespace-nowrap text-sm font-semibold text-[#1F372E]">
                      ₹{job.budget}
                    </p>

                  </div>

                </div>

              </div>

              {/* Duration */}

              <div className="min-w-0 rounded-2xl border border-[#E2EAE7] bg-[#F7F9F8] p-3">

                <div className="flex min-w-0 items-center gap-2.5">

                  <div className="shrink-0 rounded-xl bg-primary/10 p-2 ring-1 ring-primary/10">

                    <Calendar
                      className="h-3.5 w-3.5 text-primary"
                      strokeWidth={2.25}
                    />

                  </div>

                  <div className="min-w-0">

                    <p className="mb-0.5 text-[11px] font-medium text-muted-foreground">
                      Duration
                    </p>

                    <p className="whitespace-nowrap text-sm font-semibold text-[#1F372E]">
                      {job.duration}{" "}
                      {job.duration === 1
                        ? "day"
                        : "days"}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* =============================================================== */}
            {/* Interested Associates */}
            {/* =============================================================== */}

            {user?.userType === "farmer" &&
              interestedCount > 0 && (

                <div className="mt-6 border-t border-[#E2EAE7] pt-5">

                  <div className="mb-4 flex items-center justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-2.5">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">

                        <Users className="h-4 w-4 text-primary" />

                      </div>

                      <div className="min-w-0">

                        <h2 className="truncate font-display text-base font-semibold text-[#1F372E]">
                          People Interested
                        </h2>

                        

                      </div>

                    </div>

                    <Badge
                      variant="outline"
                      className="shrink-0 rounded-full border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                      data-testid="badge-interested-count"
                    >
                      {interestedCount}{" "}
                      {interestedCount === 1
                        ? "person"
                        : "people"}
                    </Badge>

                  </div>

                  <div className="space-y-3">

                    {interests
                      .filter(
                        (interest) => {
                          const status =
                            interest.status?.toLowerCase();

                          return (
                            status ===
                              "interested" ||
                            status ===
                              "shortlisted"
                          );
                        }
                      )
                      .map((interest) => {

                        const associate =
                          interest.associate;

                        const isShortlisted =
                          interest.status?.toLowerCase() ===
                          "shortlisted";

                        const rating =
                          Number(
                            associate.averageRating ??
                              0
                          );

                        const jobsCompleted =
                          Number(
                            associate.jobsCompleted ??
                              0
                          );

                        return (
                          <div
                            key={associate.id}
                            className="
                              rounded-2xl
                              border border-[#E2EAE7]
                              bg-[#F7F9F8]
                              p-3.5
                              transition-all
                              duration-200
                              hover:shadow-[0_8px_22px_rgba(31,55,46,0.07)]
                            "
                          >

                            <div className="flex items-center justify-between gap-3">

                              {/* Associate Information */}
                              <div className="min-w-0 flex-1">

                                {/* Clickable Name */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    openAssociateRatings(
                                      associate.id
                                    )
                                  }
                                  className="
                                    block
                                    max-w-full
                                    rounded-md
                                    text-left
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-primary/30
                                    focus:ring-offset-2
                                  "
                                  data-testid={`button-associate-name-${associate.id}`}
                                >
                                  <h3
                                    className="
                                      truncate
                                      font-display
                                      text-base
                                      font-semibold
                                      text-[#1F372E]
                                      transition-colors
                                      hover:text-primary
                                    "
                                  >
                                    {associate.name ||
                                      "Associate"}
                                  </h3>
                                </button>

                               {/* Clickable Rating */}
<button
  type="button"
  onClick={() =>
    openAssociateRatings(
      associate.id
    )
  }
  className="
    mt-1.5
    flex
    items-center
    gap-1.5
    rounded-md
    text-left
    transition-opacity
    hover:opacity-80
    focus:outline-none
    focus:ring-2
    focus:ring-primary/30
    focus:ring-offset-2
  "
  data-testid={`button-associate-rating-${associate.id}`}
  aria-label={`View ratings for ${
    associate.name ||
    "Associate"
  }`}
>
  <Star
    className="
      h-4
      w-4
      shrink-0
      fill-primary
      text-primary
    "
    strokeWidth={2}
  />

  <span className="text-sm font-semibold text-[#1F372E]">
    {rating.toFixed(
      1
    )}
  </span>

  <span className="text-xs text-[#71827B]">
    (
    {
      jobsCompleted
    }{" "}
    {jobsCompleted ===
    1
      ? "job"
      : "jobs"}
    )
  </span>
</button>

{/* Associate Contact Number */}
{associate.phoneNumber && (
  <a
    href={`tel:${associate.phoneNumber}`}
    onClick={(e) =>
      e.stopPropagation()
    }
    className="
      mt-1.5
      inline-flex
      items-center
      gap-1.5
      rounded-md
      text-xs
      font-medium
      text-primary
      transition-opacity
      hover:opacity-80
      hover:underline
      focus:outline-none
      focus:ring-2
      focus:ring-primary/30
      focus:ring-offset-2
    "
    data-testid={`link-associate-phone-${associate.id}`}
  >
    <Phone
      className="h-3.5 w-3.5 shrink-0"
      strokeWidth={2.25}
    />

    <span>
      {associate.phoneNumber}
    </span>
  </a>
)}
                                

                              </div>

                              {/* Shortlist / Remove */}
                              {job.status !==
                                "Completed" && (

                                <Button
                                  size="sm"
                                  variant={
                                    isShortlisted
                                      ? "outline"
                                      : "default"
                                  }
                                  onClick={() =>
                                    handleShortlist(
                                      associate.id
                                    )
                                  }
                                  disabled={
                                    updateInterestMutation.isPending ||
                                    (
                                      !isShortlisted &&
                                      shortlisted.size >=
                                        job.associatesNeeded
                                    )
                                  }
                                  className={
                                    isShortlisted
                                      ? `
                                        h-9
                                        shrink-0
                                        rounded-lg
                                        border-[#DCE7E3]
                                        bg-white
                                        px-3
                                        text-xs
                                        font-semibold
                                      `
                                      : `
                                        h-9
                                        shrink-0
                                        rounded-lg
                                        px-3
                                        text-xs
                                        font-semibold
                                      `
                                  }
                                  data-testid={
                                    isShortlisted
                                      ? `button-remove-shortlist-${associate.id}`
                                      : `button-shortlist-${associate.id}`
                                  }
                                >
                                  {isShortlisted ? (
                                    <>
                                      <X className="mr-1 h-3.5 w-3.5" />
                                      Remove
                                    </>
                                  ) : (
                                    <>
                                      <Check className="mr-1 h-3.5 w-3.5" />
                                      Shortlist
                                    </>
                                  )}
                                </Button>

                              )}

                            </div>

                          </div>
                        );
                      })}

                  </div>

                </div>
              )}

            {/* =============================================================== */}
            {/* Farmer Actions */}
            {/* =============================================================== */}

            {user?.userType === "farmer" &&
              (
                job.status === "Open" ||
                job.status === "Assigned"
              ) && (

                <div className="mt-6 border-t border-[#E2EAE7] pt-5">

                  {job.status === "Open" && (

                    <div className="mb-2.5 grid grid-cols-2 gap-2.5">

                      <Button
                        onClick={() =>
                          setIsEditing(true)
                        }
                        variant="outline"
                        className="h-10 rounded-xl border-[#DCE7E3] bg-[#F7F9F8] px-3 text-sm font-semibold text-[#1F372E] hover:bg-[#EAF1EE] hover:text-[#1F372E]"
                        data-testid="button-edit-job"
                      >
                        <Edit className="mr-1.5 h-4 w-4" />
                        Edit
                      </Button>

                      <Button
                        onClick={
                          handleCancelJob
                        }
                        variant="outline"
                        className="h-10 rounded-xl border-[#DCE7E3] bg-[#F7F9F8] px-3 text-sm font-semibold text-[#1F372E] hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                        disabled={
                          updateJobMutation.isPending
                        }
                        data-testid="button-cancel-job"
                      >
                        <X className="mr-1.5 h-4 w-4" />
                        Cancel
                      </Button>

                    </div>

                  )}

                  <Button
                    onClick={
                      handleMarkCompleted
                    }
                    className="h-11 w-full rounded-xl px-4 text-sm font-semibold shadow-sm"
                    disabled={
                      updateJobMutation.isPending
                    }
                    data-testid="button-mark-completed"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark Completed
                  </Button>

                </div>
              )}

          </CardContent>

        </Card>

      </main>

      {/* ===================================================================== */}
      {/* Cancel Job Confirmation */}
      {/* ===================================================================== */}

      <AlertDialog
        open={
          showCancelDialog
        }
        onOpenChange={
          setShowCancelDialog
        }
      >

        <AlertDialogContent>

          <AlertDialogHeader>

            <AlertDialogTitle>
              Cancel Job?
            </AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to cancel this job?
              This action cannot be undone. The job will be
              moved to the cancelled section.
            </AlertDialogDescription>

          </AlertDialogHeader>

          <AlertDialogFooter>

            <AlertDialogCancel
              data-testid="button-cancel-cancel"
            >
              No, Keep Job
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={
                confirmCancelJob
              }
              disabled={
                updateJobMutation.isPending
              }
              data-testid="button-confirm-cancel"
            >
              {updateJobMutation.isPending
                ? "Cancelling..."
                : "Yes, Cancel Job"}
            </AlertDialogAction>

          </AlertDialogFooter>

        </AlertDialogContent>

      </AlertDialog>

      {/* ===================================================================== */}
      {/* Mark Completed Confirmation */}
      {/* ===================================================================== */}

      <AlertDialog
        open={
          showCompleteDialog
        }
        onOpenChange={
          setShowCompleteDialog
        }
      >

        <AlertDialogContent>

          <AlertDialogHeader>

            <AlertDialogTitle>
              Mark Job as Completed?
            </AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to mark this job as completed?
              This action cannot be undone. The job will be moved
              to the completed section.
            </AlertDialogDescription>

          </AlertDialogHeader>

          <AlertDialogFooter>

            <AlertDialogCancel
              data-testid="button-cancel-complete"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={
                confirmMarkCompleted
              }
              disabled={
                isSubmitting
              }
              data-testid="button-confirm-complete"
            >
              {isSubmitting
                ? "Marking..."
                : "Mark Completed"}
            </AlertDialogAction>

          </AlertDialogFooter>

        </AlertDialogContent>

      </AlertDialog>

      {/* ===================================================================== */}
      {/* Rating Dialog */}
      {/* ===================================================================== */}

      {user?.userType === "farmer" &&
        shortlistedAssociates.length > 0 && (

          <RatingDialog
            open={
              showRatingDialog
            }
            onOpenChange={
              setShowRatingDialog
            }
            associates={
              shortlistedAssociates
            }
            jobId={
              jobId!
            }
            farmerId={
              user.id
            }
            onSubmit={
              handleSubmitRatings
            }
            isPending={
              isSubmitting
            }
          />

        )}

      {/* ===================================================================== */}
      {/* Bottom Navigation */}
      {/* ===================================================================== */}

      {!showRatingDialog && (
        <BottomNav
          userType={
            user?.userType as
              | "farmer"
              | "associate"
          }
        />
      )}

    </div>
  );
}