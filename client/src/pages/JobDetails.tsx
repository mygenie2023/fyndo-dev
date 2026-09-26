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
  Clock,
  Users,
  DollarSign,
  MapPin,
  Edit,
  X,
  Check,
  CheckCircle,
  Star,
} from "lucide-react";
import fyndoLogo from "@assets/FYNDO_v1.0_1770731684699.png";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
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

    // -------------------------------------------------------------------------
    // Remove shortlist
    //
    // IMPORTANT:
    // Do NOT delete the job_interest record.
    // Change status back to "interested".
    // -------------------------------------------------------------------------

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

    // -------------------------------------------------------------------------
    // Shortlist
    // -------------------------------------------------------------------------

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

    // Maximum number reached.
    return;
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">
          Loading job details...
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Job Not Found
  // ---------------------------------------------------------------------------

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">
          Job not found
        </p>
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
        variant: any;
        label: string;
      }
    > = {
      Open: {
        variant:
          "default",

        label:
          "Active",
      },

      Assigned: {
        variant:
          "default",

        label:
          "Active",
      },

      Cancelled: {
        variant:
          "destructive",

        label:
          "Cancelled",
      },

      Completed: {
        variant:
          "secondary",

        label:
          "Completed",
      },
    };

    const {
      variant,
      label,
    } =
      config[status] || {
        variant:
          "default",

        label:
          status,
      };

    return (
      <Badge
        variant={variant}
      >
        {label}
      </Badge>
    );
  };

  const interestedCount = interests.filter(
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24">

      {/* ===================================================================== */}
      {/* Header */}
      {/* ===================================================================== */}

      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-card-border/60 shadow-sm">

        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <img
              src={fyndoLogo}
              alt="FYNDO"
              className="h-8"
              data-testid="img-logo"
            />

          </div>

          <LanguageSwitcher />

        </div>

      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* =================================================================== */}
        {/* Back Navigation */}
        {/* =================================================================== */}

        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setLocation(
              "/jobs"
            )
          }
          className="-ml-2"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        {/* =================================================================== */}
        {/* Job Details Card */}
        {/* =================================================================== */}

        <Card>

          <CardContent className="pt-6">

            <div className="flex items-start justify-between gap-2 mb-4">

              <div>

                <h2 className="font-semibold text-base">
                  {job.serviceType}
                </h2>

                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">

                  <MapPin className="w-3 h-3" />

                  <span>
                    {locationName}
                  </span>

                </div>

              </div>

              {getStatusBadge(
                job.status
              )}

            </div>

            {/* ================================================================= */}
            {/* Job Information */}
            {/* ================================================================= */}

            <div className="grid grid-cols-2 gap-3">

              <div className="flex items-center gap-2">

                <Calendar className="w-4 h-4 text-muted-foreground" />

                <div>

                  <p className="text-xs text-muted-foreground">
                    Date
                  </p>

                  <p className="font-medium text-sm">
                    {new Date(
                      job.date
                    ).toLocaleDateString()}
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2">

                <Clock className="w-4 h-4 text-muted-foreground" />

                <div>

                  <p className="text-xs text-muted-foreground">
                    Duration
                  </p>

                  <p className="font-medium text-sm">
                    {job.duration}{" "}
                    {job.duration ===
                    1
                      ? "day"
                      : "days"}
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2">

                <Users className="w-4 h-4 text-muted-foreground" />

                <div>

                  <p className="text-xs text-muted-foreground">
                    Workers
                  </p>

                  <p className="font-medium text-sm">
                    {
                      job.associatesNeeded
                    }{" "}
                    needed
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2">

                <DollarSign className="w-4 h-4 text-muted-foreground" />

                <div>

                  <p className="text-xs text-muted-foreground">
                    Budget
                  </p>

                  <p className="font-medium text-sm">
                    ₹{job.budget}
                  </p>

                </div>

              </div>

            </div>

            {/* ================================================================= */}
            {/* Interested Associates */}
            {/* ================================================================= */}

            {user?.userType ===
              "farmer" &&
              interestedCount >
                0 && (

                <div className="mt-4 pt-4 border-t">

                  {/* ----------------------------------------------------------- */}
                  {/* Interested Header */}
                  {/* ----------------------------------------------------------- */}

                  <div className="flex items-center justify-between mb-3">

                    <div className="flex items-center gap-2">

                      <Users className="w-4 h-4 text-primary" />

                      <span className="font-semibold text-sm">
                        Interested Associates
                      </span>

                    </div>

                    <Badge
                      variant="default"
                      className="font-semibold"
                      data-testid="badge-interested-count"
                    >
                      {interestedCount}{" "}
                      {interestedCount ===
                      1
                        ? "person"
                        : "people"}
                    </Badge>

                  </div>

                  {/* ----------------------------------------------------------- */}
                  {/* Associate List */}
                  {/* ----------------------------------------------------------- */}

                  <div className="space-y-3">

                    {interests
                      .filter(
                        (
                          interest
                        ) =>
                          interest.status
                            .toLowerCase() ===
                            "interested" ||
                          interest.status
                            .toLowerCase() ===
                            "shortlisted"
                      )
                      .map(
                        (
                          interest
                        ) => {

                          const associate =
                            interest.associate;

                          const isShortlisted =
                            interest.status
                              .toLowerCase() ===
                            "shortlisted";

                          return (
                            <Card
                              key={
                                associate.id
                              }
                            >

                              <CardContent className="p-4">

                                <div className="flex items-start justify-between gap-3">

                                  {/* ================================================= */}
                                  {/* Associate Information */}
                                  {/* ================================================= */}

                                  <div className="flex-1">

                                    <h4 className="font-semibold">
                                      {
                                        associate.name ||
                                        "Associate"
                                      }
                                    </h4>

                                    <p className="text-sm text-muted-foreground mt-1">

                                      {associate
                                        .skills
                                        ?.length
                                        ? associate.skills.join(
                                            ", "
                                          )
                                        : "No skills listed"}

                                    </p>

                                    <div className="flex items-center gap-1 mt-1">

                                      <Star className="w-4 h-4 fill-primary text-primary" />

                                      <span className="font-medium text-sm">

                                        {Number(
                                          associate.averageRating ??
                                            0
                                        ).toFixed(
                                          1
                                        )}

                                      </span>

                                      <span className="text-xs text-muted-foreground">

                                        (
                                        {
                                          associate.jobsCompleted ??
                                          0
                                        }{" "}
                                        jobs)

                                      </span>

                                    </div>

                                  </div>

                                  {/* ================================================= */}
                                  {/* Status and Action */}
                                  {/* ================================================= */}

                                  <div className="flex flex-col items-end gap-2">

                                    {/* ----------------------------------------- */}
                                    {/* Interested Badge */}
                                    {/* ----------------------------------------- */}

                                    {!isShortlisted && (
                                      <Badge
                                        className="bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-50"
                                        data-testid={`badge-interested-${associate.id}`}
                                      >
                                        Interested
                                      </Badge>
                                    )}

                                    {/* ----------------------------------------- */}
                                    {/* Shortlisted Badge */}
                                    {/* ----------------------------------------- */}
                                    {/*
                                      IMPORTANT:
                                      This is intentionally the exact same
                                      Badge variant used by the Active job
                                      status above: variant="default".
                                    */}

                                    {isShortlisted && (
                                      <Badge
                                        variant="default"
                                        data-testid={`badge-shortlisted-${associate.id}`}
                                      >
                                        Shortlisted
                                      </Badge>
                                    )}

                                    {/* ----------------------------------------- */}
                                    {/* Shortlist / Remove Shortlist */}
                                    {/* ----------------------------------------- */}

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
                                        data-testid={
                                          isShortlisted
                                            ? `button-remove-shortlist-${associate.id}`
                                            : `button-shortlist-${associate.id}`
                                        }
                                      >

                                        {isShortlisted ? (
                                          <>
                                            <X className="w-4 h-4 mr-1" />
                                            Remove shortlist
                                          </>
                                        ) : (
                                          <>
                                            <Check className="w-4 h-4 mr-1" />
                                            Shortlist
                                          </>
                                        )}

                                      </Button>

                                    )}

                                  </div>

                                </div>

                              </CardContent>

                            </Card>
                          );
                        }
                      )}

                  </div>

                </div>
              )}

            {/* ================================================================= */}
            {/* Farmer Actions */}
            {/* ================================================================= */}

            {user?.userType ===
              "farmer" &&
              (
                job.status ===
                  "Open" ||
                job.status ===
                  "Assigned"
              ) && (

                <div className="space-y-3 mt-6 pt-4 border-t">

                  {/* ----------------------------------------------------------- */}
                  {/* Edit / Cancel */}
                  {/* ----------------------------------------------------------- */}

                  {job.status ===
                    "Open" && (

                    <div className="flex gap-2">

                      <Button
                        onClick={() =>
                          setIsEditing(
                            true
                          )
                        }
                        variant="outline"
                        className="flex-1"
                        data-testid="button-edit-job"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>

                      <Button
                        onClick={
                          handleCancelJob
                        }
                        variant="outline"
                        className="flex-1"
                        disabled={
                          updateJobMutation.isPending
                        }
                        data-testid="button-cancel-job"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>

                    </div>
                  )}

                  {/* ----------------------------------------------------------- */}
                  {/* Complete */}
                  {/* ----------------------------------------------------------- */}

                  <Button
                    onClick={
                      handleMarkCompleted
                    }
                    className="w-full"
                    disabled={
                      updateJobMutation.isPending
                    }
                    data-testid="button-mark-completed"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Completed
                  </Button>

                </div>
              )}

          </CardContent>

        </Card>

      </div>

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

      {user?.userType ===
        "farmer" &&
        shortlistedAssociates.length >
          0 && (

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

      <BottomNav
        userType={
          user?.userType as
            | "farmer"
            | "associate"
        }
      />

    </div>
  );
}