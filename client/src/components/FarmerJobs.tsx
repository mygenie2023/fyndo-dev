import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Briefcase, Calendar, Users, DollarSign, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/lib/userContext";
import { useLocationName } from "@/hooks/use-location-name";
import type { Job } from "@shared/schema";

interface FarmerJobsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreateJob?: () => void;
  skipAutoNavigate?: boolean;
}

export default function FarmerJobs({ searchQuery, setSearchQuery, onCreateJob, skipAutoNavigate = false }: FarmerJobsProps) {
  const { user } = useUser();
  const [, setLocation] = useLocation();

// Fetch farmer's jobs from Supabase
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

  const activeJobs = jobs.filter(j => j.status === "Open" || j.status === "Assigned");
  const cancelledJobs = jobs.filter(j => j.status === "Cancelled");
  const completedJobs = jobs.filter(j => j.status === "Completed");

  // Auto-navigate to Post a Job if user has zero jobs (unless we just created one)
useEffect(() => {
  if (
    !isLoading &&
    !isError &&
    jobs.length === 0 &&
    onCreateJob &&
    !skipAutoNavigate
  ) {
    onCreateJob();
  }
}, [
  isLoading,
  isError,
  jobs.length,
  onCreateJob,
  skipAutoNavigate,
]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      Open: { variant: "default", label: "Active" },
      Assigned: { variant: "default", label: "Active" },
      Cancelled: { variant: "destructive", label: "Cancelled" },
      Completed: { variant: "secondary", label: "Completed" },
    };
    const config = variants[status] || { variant: "default", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const JobCard = ({ job }: { job: Job }) => {
    const locationName = useLocationName(job.location, job.latitude, job.longitude);
    const isActive = job.status === "Open" || job.status === "Assigned";
    
    return (
      <Card 
        className="hover-elevate transition-all duration-300 cursor-pointer"
        onClick={() => setLocation(`/job-details/${job.id}`)}
        data-testid={`job-card-${job.id}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-base">{job.serviceType}</h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{locationName}</span>
              </div>
            </div>
            {getStatusBadge(job.status)}
          </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{new Date(job.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{job.associatesNeeded} workers</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>₹{job.budget}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{job.duration} {job.duration === 1 ? 'day' : 'days'}</span>
          </div>
        </div>


        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">Loading jobs...</p>
      </div>
    );
  }

  if (isError) {
  return (
    <div className="px-4 py-12 text-center">
      <p className="text-sm text-destructive">
        Unable to load jobs. Please try again.
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        {error instanceof Error ? error.message : ""}
      </p>
    </div>
  );
}

  return (
    <div className="px-4 py-6 space-y-4 pb-28">
      {/* Jobs Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" data-testid="tab-active">
            Active ({activeJobs.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" data-testid="tab-cancelled">
            Cancelled ({cancelledJobs.length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">
            Completed ({completedJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3 mt-4">
          {activeJobs.length > 0 ? (
            activeJobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">No active jobs</p>
              <p className="text-xs text-muted-foreground mt-1">Post a job to get started</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-3 mt-4">
          {cancelledJobs.length > 0 ? (
            cancelledJobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">No cancelled jobs</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 mt-4">
          {completedJobs.length > 0 ? (
            completedJobs.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">No completed jobs yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
