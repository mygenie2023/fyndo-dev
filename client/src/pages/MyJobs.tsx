import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import JobCard from "@/components/JobCard";
import BottomNav from "@/components/BottomNav";
import { useUser } from "@/lib/userContext";
import { Search, Plus } from "lucide-react";
import type { Job } from "@shared/schema";

export default function MyJobs() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs/farmer", user?.id],
    enabled: !!user,
  });

  const activeJobs = jobs.filter(j => j.status === "Open" || j.status === "Assigned");
  const completedJobs = jobs.filter(j => j.status === "Completed");

  const filterJobs = (jobsList: Job[]) => {
    if (!searchQuery) return jobsList;
    return jobsList.filter(job => 
      job.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <p className="text-muted-foreground">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 bg-card border-b border-card-border z-40 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">My Jobs</h1>
          <Link href="/create-job">
            <Button size="sm" data-testid="button-create-job">
              <Plus className="w-4 h-4 mr-1" />
              Post Job
            </Button>
          </Link>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search my jobs..."
            className="pl-9"
            data-testid="input-search"
          />
        </div>
      </header>

      <div className="p-4">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="active" data-testid="tab-active">
              Active
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-0">
            {filterJobs(activeJobs).map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                serviceType={job.serviceType}
                date={job.date}
                time={job.time}
                duration={job.duration}
                associatesNeeded={job.associatesNeeded}
                budget={job.budget}
                location={job.location}
                skillLevel={job.skillLevel as any}
                status={job.status as any}
                onViewDetails={() => window.location.href = `/job-details/${job.id}`}
                showActions={false}
              />
            ))}
            {filterJobs(activeJobs).length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No active jobs
              </p>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-0">
            {filterJobs(completedJobs).map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                serviceType={job.serviceType}
                date={job.date}
                time={job.time}
                duration={job.duration}
                associatesNeeded={job.associatesNeeded}
                budget={job.budget}
                location={job.location}
                skillLevel={job.skillLevel as any}
                status={job.status as any}
                onViewDetails={() => window.location.href = `/job-details/${job.id}`}
                showActions={false}
              />
            ))}
            {filterJobs(completedJobs).length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No completed jobs yet
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav userType="farmer" />
    </div>
  );
}
