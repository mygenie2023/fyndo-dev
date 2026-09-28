import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Briefcase,
  Calendar,
  Users,
  DollarSign,
  MapPin,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useUser } from "@/lib/userContext";
import { useLocationName } from "@/hooks/use-location-name";
import type { Job } from "@shared/schema";

interface FarmerJobsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreateJob?: () => void;
  skipAutoNavigate?: boolean;
}

export default function FarmerJobs({
  searchQuery,
  setSearchQuery,
  onCreateJob,
  skipAutoNavigate = false,
}: FarmerJobsProps) {
  const { user } = useUser();
  const [, setLocation] = useLocation();

  // ---------------------------------------------------------------------------
  // Fetch farmer's jobs from Supabase
  // ---------------------------------------------------------------------------

  const {
    data: jobs = [],
    isLoading,
    isError,
    error,
  } = useQuery<Job[]>({
    queryKey: ["farmer-jobs", user?.id],
    enabled: !!user?.id,

    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_farmer_jobs",
        {
          p_farmer_id: user!.id,
        }
      );

      if (error) {
        throw error;
      }

      return (data ?? []).map((job: any) => ({
        ...job,
        farmerId: job.farmer_id,
        serviceType: job.service_type,
        associatesNeeded: job.associates_needed,
        skillLevel: job.skill_level,
        paymentMethod: job.payment_method,
        jobComment: job.job_comment,
        latitude: job.latitude?.toString(),
        longitude: job.longitude?.toString(),
        createdAt: job.created_at,
      })) as Job[];
    },
  });

  // ---------------------------------------------------------------------------
  // Job Status Groups
  // ---------------------------------------------------------------------------

  const activeJobs = jobs.filter(
    (j) =>
      j.status === "Open" ||
      j.status === "Assigned"
  );

  const cancelledJobs = jobs.filter(
    (j) => j.status === "Cancelled"
  );

  const completedJobs = jobs.filter(
    (j) => j.status === "Completed"
  );

  

  // ---------------------------------------------------------------------------
  // Status Badge
  // ---------------------------------------------------------------------------

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      {
        variant: any;
        label: string;
        className: string;
      }
    > = {
      Open: {
        variant: "outline",
        label: "Active",
        className:
          "border-primary/20 bg-primary/10 text-primary",
      },

      Assigned: {
        variant: "outline",
        label: "Active",
        className:
          "border-primary/20 bg-primary/10 text-primary",
      },

      Cancelled: {
        variant: "outline",
        label: "Cancelled",
        className:
          "border-destructive/20 bg-destructive/10 text-destructive",
      },

      Completed: {
        variant: "outline",
        label: "Completed",
        className:
          "border-muted bg-muted text-muted-foreground",
      },
    };

    const config = variants[status] || {
      variant: "outline",
      label: status,
      className:
        "border-border bg-muted text-muted-foreground",
    };

    return (
      <Badge
        variant={config.variant}
        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.className}`}
      >
        {config.label}
      </Badge>
    );
  };

  // ---------------------------------------------------------------------------
  // Job Card
  // ---------------------------------------------------------------------------

  const JobCard = ({ job }: { job: Job }) => {
    const locationName = useLocationName(
      job.location,
      job.latitude,
      job.longitude
    );

    return (
      <Card
        className="
          group cursor-pointer overflow-hidden rounded-3xl
          border border-[#DCE7E3]
          bg-white
          shadow-[0_8px_28px_rgba(31,55,46,0.075)]
          transition-all duration-300
          hover:-translate-y-0.5
          hover:shadow-lift
        "
        onClick={() =>
          setLocation(`/job-details/${job.id}`)
        }
        data-testid={`job-card-${job.id}`}
      >
        <CardContent className="p-5">

          {/* =============================================================== */}
          {/* Job Header */}
          {/* =============================================================== */}

          <div className="mb-5 flex items-start justify-between gap-3">

            <div className="min-w-0 flex-1">

              <div className="mb-2 flex min-w-0 items-center gap-2">

                <div className="shrink-0 rounded-xl bg-primary/10 p-2 ring-1 ring-primary/10">

                  <Briefcase
                    className="h-4 w-4 text-primary"
                    strokeWidth={2.25}
                  />

                </div>

                <h3 className="min-w-0 truncate font-display text-base font-bold tracking-tight text-[#1F372E]">
                  {job.serviceType}
                </h3>

              </div>

              <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">

                <MapPin
                  className="h-3.5 w-3.5 shrink-0 text-primary"
                  strokeWidth={2.25}
                />

                <span className="min-w-0 truncate">
                  {locationName}
                </span>

              </div>

            </div>

            {getStatusBadge(job.status)}

          </div>

          {/* =============================================================== */}
          {/* Job Information */}
          {/* =============================================================== */}

          <div className="grid grid-cols-2 gap-3">

            {/* ---------------------------------------------------------------- */}
            {/* Date */}
            {/* ---------------------------------------------------------------- */}

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

            {/* ---------------------------------------------------------------- */}
            {/* Workers */}
            {/* ---------------------------------------------------------------- */}

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

            {/* ---------------------------------------------------------------- */}
            {/* Budget */}
            {/* ---------------------------------------------------------------- */}

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

            {/* ---------------------------------------------------------------- */}
            {/* Duration */}
            {/* ---------------------------------------------------------------- */}

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

        </CardContent>
      </Card>
    );
  };

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex items-center justify-center px-4 py-16">

        <div className="rounded-2xl border border-[#DDE5E2] bg-white px-6 py-4 shadow-card">

          <p className="text-sm font-medium text-muted-foreground">
            Loading jobs...
          </p>

        </div>

      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Error
  // ---------------------------------------------------------------------------

  if (isError) {
    return (
      <div className="px-4 py-12 text-center">

        <div className="mx-auto max-w-sm rounded-3xl border border-destructive/15 bg-white p-6 shadow-card">

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">

            <Briefcase className="h-5 w-5 text-destructive" />

          </div>

          <p className="text-sm font-semibold text-destructive">
            Unable to load jobs. Please try again.
          </p>

          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {error instanceof Error
              ? error.message
              : ""}
          </p>

        </div>

      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Main Jobs UI
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-5 px-4 py-6 pb-28">

      {/* ===================================================================== */}
      {/* Jobs Tabs */}
      {/* ===================================================================== */}

      <Tabs
        defaultValue="active"
        className="w-full"
      >

        <TabsList className="grid h-auto w-full grid-cols-3 rounded-2xl border border-[#DDE5E2] bg-white p-1 shadow-sm">

          <TabsTrigger
            value="active"
            data-testid="tab-active"
            className="
              rounded-xl
              py-2.5
              text-xs
              font-semibold
              data-[state=active]:bg-primary
              data-[state=active]:text-primary-foreground
              data-[state=active]:shadow-sm
            "
          >
            Active ({activeJobs.length})
          </TabsTrigger>

          <TabsTrigger
            value="cancelled"
            data-testid="tab-cancelled"
            className="
              rounded-xl
              py-2.5
              text-xs
              font-semibold
              data-[state=active]:bg-primary
              data-[state=active]:text-primary-foreground
              data-[state=active]:shadow-sm
            "
          >
            Cancelled ({cancelledJobs.length})
          </TabsTrigger>

          <TabsTrigger
            value="completed"
            data-testid="tab-completed"
            className="
              rounded-xl
              py-2.5
              text-xs
              font-semibold
              data-[state=active]:bg-primary
              data-[state=active]:text-primary-foreground
              data-[state=active]:shadow-sm
            "
          >
            Completed ({completedJobs.length})
          </TabsTrigger>

        </TabsList>

        {/* =================================================================== */}
        {/* Active Jobs */}
        {/* =================================================================== */}

        <TabsContent
          value="active"
          className="mt-5 space-y-4"
        >
          {activeJobs.length > 0 ? (
            activeJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
              />
            ))
          ) : (
            <div className="rounded-3xl border border-[#DDE5E2] bg-white px-6 py-12 text-center shadow-card">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">

                <Briefcase
                  className="h-6 w-6 text-primary"
                  strokeWidth={2}
                />

              </div>

              <p className="text-sm font-semibold text-foreground">
                No active jobs
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Post a job to get started
              </p>

            </div>
          )}
        </TabsContent>

        {/* =================================================================== */}
        {/* Cancelled Jobs */}
        {/* =================================================================== */}

        <TabsContent
          value="cancelled"
          className="mt-5 space-y-4"
        >
          {cancelledJobs.length > 0 ? (
            cancelledJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
              />
            ))
          ) : (
            <div className="rounded-3xl border border-[#DDE5E2] bg-white px-6 py-12 text-center shadow-card">

              <p className="text-sm font-semibold text-foreground">
                No cancelled jobs
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Cancelled jobs will appear here.
              </p>

            </div>
          )}
        </TabsContent>

        {/* =================================================================== */}
        {/* Completed Jobs */}
        {/* =================================================================== */}

        <TabsContent
          value="completed"
          className="mt-5 space-y-4"
        >
          {completedJobs.length > 0 ? (
            completedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
              />
            ))
          ) : (
            <div className="rounded-3xl border border-[#DDE5E2] bg-white px-6 py-12 text-center shadow-card">

              <p className="text-sm font-semibold text-foreground">
                No completed jobs yet
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Completed jobs will appear here.
              </p>

            </div>
          )}
        </TabsContent>

      </Tabs>

    </div>
  );
}