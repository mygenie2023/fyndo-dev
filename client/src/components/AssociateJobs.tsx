import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, Star, Briefcase, Calendar, MapPin, DollarSign, Users, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/lib/userContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import SkillSelection from "@/components/SkillSelection";
import { useLocationName } from "@/hooks/use-location-name";
import type { Job } from "@shared/schema";

interface AssociateJobsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function AssociateJobs({ searchQuery, setSearchQuery }: AssociateJobsProps) {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"available" | "interested" | "shortlisted" | "completed">("available");

  // Check if user has selected skills
  const hasSkills = user?.skills && Array.isArray(user.skills) && user.skills.length > 0;

  // Fetch nearby jobs (20km radius)
  const hasLocation = user?.latitude && user?.longitude && 
                       user.latitude !== null && user.longitude !== null;
  
  const { data: nearbyJobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs/nearby', user?.latitude, user?.longitude],
    queryFn: async () => {
      const res = await fetch(`/api/jobs/nearby/${user?.latitude}/${user?.longitude}`);
      if (!res.ok) throw new Error('Failed to fetch jobs');
      return res.json();
    },
    enabled: Boolean(hasLocation && hasSkills),
  });

  // Fetch associate's interested jobs (returns JobInterest & { job: Job })
  const { data: interestData = [], isLoading: interestsLoading } = useQuery<Array<{ jobId: string; status: string; job: Job }>>({
    queryKey: [`/api/job-interests/associate/${user?.id}`],
    enabled: Boolean(user && hasSkills),
  });

  // Track dismissed jobs using React state (synced with localStorage)
  const [dismissedJobIds, setDismissedJobIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(`dismissed_jobs_${user?.id}`);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Sync with localStorage when user changes
  useEffect(() => {
    const stored = localStorage.getItem(`dismissed_jobs_${user?.id}`);
    setDismissedJobIds(stored ? new Set(JSON.parse(stored)) : new Set());
  }, [user?.id]);

  const dismissJob = (jobId: string) => {
    // Update React state immediately for instant UI update
    setDismissedJobIds(prev => {
      const newSet = new Set(prev);
      newSet.add(jobId);
      // Also persist to localStorage
      localStorage.setItem(`dismissed_jobs_${user?.id}`, JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  // Helper to remove job from dismissed list (used when expressing interest)
  const undismissJob = (jobId: string) => {
    setDismissedJobIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(jobId);
      localStorage.setItem(`dismissed_jobs_${user?.id}`, JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  // Express interest mutation
  const expressInterestMutation = useMutation({
    mutationFn: async ({ jobId }: { jobId: string }) => {
      const res = await apiRequest("POST", "/api/job-interests", {
        jobId,
        associateId: user?.id,
      });
      return await res.json();
    },
    onSuccess: (_, { jobId }) => {
      // If the job was previously dismissed, remove it from dismissed list
      undismissJob(jobId);
      queryClient.invalidateQueries({ queryKey: [`/api/job-interests/associate/${user?.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/nearby'] });
    },
  });

  if (!hasSkills) {
    return <SkillSelection />;
  }

  if (!hasLocation) {
    return (
      <div className="px-4 py-16 text-center">
        <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Location Required</h3>
        <p className="text-sm text-muted-foreground mb-4">
          We need your location to show jobs within 20km radius
        </p>
        <p className="text-xs text-muted-foreground">
          Please allow location access in your browser settings
        </p>
      </div>
    );
  }

  if (jobsLoading || interestsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">Loading jobs...</p>
      </div>
    );
  }

  // Get all job IDs that user has expressed interest in
  const interestedJobIds = new Set(interestData.map((i) => i.jobId));
  const shortlistedJobIds = new Set(interestData.filter(i => i.status.toLowerCase() === "shortlisted").map(i => i.jobId));
  
  // Filter available jobs: must match user skills, not already interacted with, not dismissed, and status is Open
  const userSkills = user?.skills || [];
  // Normalize user skills for case-insensitive comparison
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase());
  
  const availableJobs = nearbyJobs.filter(job => {
    // Exclude jobs the user has already expressed interest in
    if (interestedJobIds.has(job.id)) return false;
    // Exclude dismissed jobs (only for Available tab - these jobs have no interest record)
    if (dismissedJobIds.has(job.id)) return false;
    // Only show Open jobs
    if (job.status !== "Open") return false;
    // Filter by user's skills - job serviceType must match one of user's skills (case-insensitive)
    if (normalizedUserSkills.length > 0 && !normalizedUserSkills.includes(job.serviceType.toLowerCase())) return false;
    return true;
  });
  
  // Other tabs are NOT affected by dismissedJobIds - they show all jobs user has interacted with
  const interestedJobs = interestData
    .filter(i => i.status.toLowerCase() === "interested" && i.job.status === "Open")
    .map(i => i.job);
  const shortlistedJobs = interestData
    .filter(i => i.status.toLowerCase() === "shortlisted")
    .map(i => i.job);
  const completedJobs = interestData
    .filter(i => i.job.status === "Completed")
    .map(i => i.job);

  const filterJobs = (jobs: Job[]) => {
    if (!searchQuery) return jobs;
    return jobs.filter(job => 
      job.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const JobCard = ({ job, showActions = true, showReview = false }: { job: Job; showActions?: boolean; showReview?: boolean }) => {
    const locationName = useLocationName(job.location, job.latitude, job.longitude);
    
    return (
      <Card 
        className="hover-elevate transition-all duration-300"
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

        {showReview && (
          <div className="mb-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="font-semibold text-sm">Rating pending</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Review will be available after farmer submits</p>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => dismissJob(job.id)}
              data-testid={`button-not-interested-${job.id}`}
            >
              Not Interested
            </Button>
            <Button 
              className="flex-1"
              onClick={() => expressInterestMutation.mutate({ jobId: job.id })}
              disabled={expressInterestMutation.isPending}
              data-testid={`button-interested-${job.id}`}
            >
              Interested
            </Button>
          </div>
        )}

        {!showActions && (
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => setLocation(`/job-details/${job.id}`)}
          >
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
    );
  };

  return (
    <div className="px-4 py-6 space-y-4">
      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{user?.jobsCompleted || 0}</p>
              <p className="text-xs text-muted-foreground">Jobs Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{user?.averageRating ? parseFloat(user.averageRating.toString()).toFixed(1) : "—"}</p>
              <p className="text-xs text-muted-foreground">Average Rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search jobs..."
          className="pl-9"
          data-testid="input-search-jobs"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-card-border pb-2 overflow-x-auto">
        <Button
          variant={activeTab === "available" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("available")}
          data-testid="tab-available"
        >
          Available ({availableJobs.length})
        </Button>
        <Button
          variant={activeTab === "interested" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("interested")}
          data-testid="tab-interested"
        >
          Interested ({interestedJobs.length})
        </Button>
        <Button
          variant={activeTab === "shortlisted" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("shortlisted")}
          data-testid="tab-shortlisted"
        >
          Shortlisted ({shortlistedJobs.length})
        </Button>
        <Button
          variant={activeTab === "completed" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("completed")}
          data-testid="tab-completed"
        >
          Completed ({completedJobs.length})
        </Button>
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {activeTab === "available" && (
          <>
            {filterJobs(availableJobs).length > 0 ? (
              filterJobs(availableJobs).map((job) => (
                <JobCard key={job.id} job={job} showActions={true} />
              ))
            ) : (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium">No jobs available nearby</p>
                <p className="text-xs text-muted-foreground mt-1">Check back soon for new opportunities</p>
              </div>
            )}
          </>
        )}

        {activeTab === "interested" && (
          <>
            {interestedJobs.length > 0 ? (
              interestedJobs.map((job) => (
                <JobCard key={job.id} job={job} showActions={false} />
              ))
            ) : (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium">No interested jobs yet</p>
                <p className="text-xs text-muted-foreground mt-1">Express interest in jobs to see them here</p>
              </div>
            )}
          </>
        )}

        {activeTab === "shortlisted" && (
          <>
            {shortlistedJobs.length > 0 ? (
              shortlistedJobs.map((job) => (
                <JobCard key={job.id} job={job} showActions={false} />
              ))
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium">No shortlisted jobs yet</p>
                <p className="text-xs text-muted-foreground mt-1">FYNDO will shortlist you for suitable jobs</p>
              </div>
            )}
          </>
        )}

        {activeTab === "completed" && (
          <>
            {completedJobs.length > 0 ? (
              completedJobs.map((job) => (
                <JobCard key={job.id} job={job} showActions={false} showReview={true} />
              ))
            ) : (
              <div className="text-center py-12">
                <Star className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium">No completed jobs yet</p>
                <p className="text-xs text-muted-foreground mt-1">Your work history will appear here</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
