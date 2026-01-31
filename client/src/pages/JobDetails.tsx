import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AssociateCard from "@/components/AssociateCard";
import JobPostingFlow from "@/components/JobPostingFlow";
import RatingDialog from "@/components/RatingDialog";
import { useUser } from "@/lib/userContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Calendar, Clock, Users, DollarSign, MapPin, Edit, X, Check, Tractor, CheckCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLocationName } from "@/hooks/use-location-name";
import { useJobCompletion } from "@/hooks/use-job-completion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Job, User } from "@shared/schema";

export default function JobDetails() {
  const [, params] = useRoute("/job-details/:id");
  const jobId = params?.id;
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Use the job completion hook
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
  } = useJobCompletion(jobId || "", user?.id);

  const { data: job, isLoading: jobLoading } = useQuery<Job>({
    queryKey: [`/api/jobs/${jobId}`],
    enabled: !!jobId,
  });

  const locationName = useLocationName(job?.location, job?.latitude, job?.longitude);

  const { data: interests = [], isLoading: interestsLoading } = useQuery<Array<{ associate: User; status: string }>>({
    queryKey: [`/api/job-interests/job/${jobId}`],
    enabled: !!jobId && user?.userType === "farmer",
  });

  const updateJobMutation = useMutation({
    mutationFn: async (updates: Partial<Job>) => {
      const res = await apiRequest("PATCH", `/api/jobs/${jobId}`, updates);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/farmer/${user?.id}`] });
    },
  });

  const updateInterestMutation = useMutation({
    mutationFn: async ({ associateId, status }: { associateId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/job-interests/${jobId}/${associateId}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/job-interests/job/${jobId}`] });
    },
  });

  const handleShortlist = (associateId: string) => {
    const newShortlisted = new Set(shortlisted);
    if (newShortlisted.has(associateId)) {
      newShortlisted.delete(associateId);
      updateInterestMutation.mutate({ associateId, status: "interested" });
    } else {
      if (job && newShortlisted.size < job.associatesNeeded) {
        newShortlisted.add(associateId);
        updateInterestMutation.mutate({ associateId, status: "shortlisted" });
      } else {
        // Limit reached - cannot select more associates
        return;
      }
    }
    setShortlisted(newShortlisted);
  };

  const handleCancelJob = () => {
    setShowCancelDialog(true);
  };

  const confirmCancelJob = () => {
    updateJobMutation.mutate({ status: "Cancelled" });
    setShowCancelDialog(false);
  };

  useEffect(() => {
    const shortlistedInterests = interests.filter((i: any) => i.status === "shortlisted");
    const newShortlistedIds = new Set(shortlistedInterests.map((i: any) => i.associate.id));
    
    const currentIds = Array.from(shortlisted).sort().join(',');
    const newIds = Array.from(newShortlistedIds).sort().join(',');
    
    if (currentIds !== newIds) {
      setShortlisted(newShortlistedIds);
    }
  }, [interests, shortlisted]);

  if (jobLoading || interestsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Job not found</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: any; label: string }> = {
      Open: { variant: "default", label: "Active" },
      Assigned: { variant: "default", label: "Active" },
      Cancelled: { variant: "destructive", label: "Cancelled" },
      Completed: { variant: "secondary", label: "Completed" },
    };
    const { variant, label } = config[status] || { variant: "default", label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const interestedCount = interests.length;

  // Show editing flow if editing
  if (isEditing) {
    return <JobPostingFlow editingJob={job} onClose={() => setIsEditing(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24">
      {/* Top Bar with Branding */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-card-border/60 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md shadow-primary/20">
              <Tractor className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">FYNDO</h1>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Dedicated Back Navigation */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/jobs")}
          className="-ml-2"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
        {/* Job Details Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-2 mb-4">
              <div>
                <h2 className="font-semibold text-base">{job.serviceType}</h2>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{locationName}</span>
                </div>
              </div>
              {getStatusBadge(job.status)}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium text-sm">{new Date(job.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-medium text-sm">{job.duration} {job.duration === 1 ? 'day' : 'days'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Workers</p>
                  <p className="font-medium text-sm">{job.associatesNeeded} needed</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="font-medium text-sm">₹{job.budget}</p>
                </div>
              </div>
            </div>

            {/* Interested Associates Count - For Farmers */}
            {user?.userType === "farmer" && interestedCount > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">Interested Associates</span>
                  </div>
                  <Badge variant="default" className="font-semibold" data-testid="badge-interested-count">
                    {interestedCount} {interestedCount === 1 ? 'person' : 'people'}
                  </Badge>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {user?.userType === "farmer" && (job.status === "Open" || job.status === "Assigned") && (
              <div className="space-y-3 mt-6 pt-4 border-t">
                {job.status === "Open" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="flex-1"
                      data-testid="button-edit-job"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={handleCancelJob}
                      variant="outline"
                      className="flex-1"
                      disabled={updateJobMutation.isPending}
                      data-testid="button-cancel-job"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
                <Button
                  onClick={handleMarkCompleted}
                  className="w-full"
                  disabled={shortlistedAssociates.length === 0 || updateJobMutation.isPending}
                  data-testid="button-mark-completed"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Completed
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shortlisted Associates & Interest Count */}
        {user?.userType === "farmer" && (
          <div>
            {/* Shortlisted Associates List */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">
                Shortlisted Associates
              </h3>
              <Badge variant="outline" data-testid="badge-shortlisted-count">
                {shortlisted.size}/{job.associatesNeeded} selected
              </Badge>
            </div>

            <div className="space-y-3">
              {shortlistedAssociates.map((interest: any) => (
                <AssociateCard
                  key={interest.associate.id}
                  id={interest.associate.id}
                  name={interest.associate.name}
                  skills={interest.associate.skills || []}
                  skillLevel={interest.associate.skillLevel || "Beginner"}
                  hourlyRate={interest.associate.hourlyRate || 100}
                  rating={parseFloat(interest.associate.averageRating) || 0}
                  workHistoryCount={interest.associate.jobsCompleted || 0}
                  isShortlisted={true}
                  minimal={true}
                />
              ))}
              {shortlistedAssociates.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="font-medium">No associates shortlisted yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cancel Job Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Job?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this job? This action cannot be undone.
              The job will be moved to the cancelled section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-cancel">No, Keep Job</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelJob}
              disabled={updateJobMutation.isPending}
              data-testid="button-confirm-cancel"
            >
              {updateJobMutation.isPending ? "Cancelling..." : "Yes, Cancel Job"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mark Completed Confirmation Dialog (no associates) */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Job as Completed?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this job as completed? This action cannot be undone.
              The job will be moved to the completed section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-complete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmMarkCompleted}
              disabled={isSubmitting}
              data-testid="button-confirm-complete"
            >
              {isSubmitting ? "Marking..." : "Mark Completed"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rating Dialog (with associates) */}
      {user?.userType === "farmer" && shortlistedAssociates.length > 0 && (
        <RatingDialog
          open={showRatingDialog}
          onOpenChange={setShowRatingDialog}
          associates={shortlistedAssociates}
          jobId={jobId!}
          farmerId={user.id}
          onSubmit={handleSubmitRatings}
          isPending={isSubmitting}
        />
      )}

      <BottomNav userType={user?.userType as "farmer" | "associate"} />
    </div>
  );
}
