import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { formatPhone } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Plus } from "lucide-react";
import type { Job, User, JobInterest } from "@shared/schema";
import AdminPostJob from "./AdminPostJob";

export default function AdminJobs() {
  const [, setLocation] = useLocation();
  const [showPostJob, setShowPostJob] = useState(false);

  const { data: jobs = [], isLoading } = useQuery<Array<Job & { farmer: User }>>({
    queryKey: ["/api/admin/jobs"],
  });

  // Fetch all job interests to get interested counts
  const { data: allInterests = [] } = useQuery<Array<JobInterest & { job: Job }>>({
    queryKey: ["/api/admin/all-interests"],
  });

  // Create a map of jobId -> interested count
  const interestCountMap = new Map<string, number>();
  allInterests.forEach((interest) => {
    const count = interestCountMap.get(interest.jobId) || 0;
    interestCountMap.set(interest.jobId, count + 1);
  });

  // Sort jobs by creation date (newest first) - using date as proxy if no createdAt
  const sortedJobs = [...jobs].sort((a, b) => {
    // Sort by date descending (newest first)
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      Open: { variant: "default", label: "Active" },
      Assigned: { variant: "default", label: "Assigned" },
      Completed: { variant: "secondary", label: "Completed" },
      Cancelled: { variant: "outline", label: "Cancelled" },
    };

    const config = variants[status] || { variant: "default", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading jobs...
        </CardContent>
      </Card>
    );
  }

  if (showPostJob) {
    return <AdminPostJob onClose={() => setShowPostJob(false)} />;
  }

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>All Jobs</CardTitle>
        <Button onClick={() => setShowPostJob(true)} data-testid="button-post-job">
          <Plus className="w-4 h-4 mr-2" />
          Post a Job
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requested By</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Workers</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Interested</TableHead>
                <TableHead>Created on</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                    No jobs found
                  </TableCell>
                </TableRow>
              ) : (
                sortedJobs.map((job) => (
                  <TableRow key={job.id} data-testid={`row-job-${job.id}`}>
                    <TableCell>{job.farmer?.name || "Unknown"}</TableCell>
                    <TableCell>{formatPhone(job.farmer?.phoneNumber) || "N/A"}</TableCell>
                    <TableCell>{job.serviceType}</TableCell>
                    <TableCell>{job.associatesNeeded}</TableCell>
                    <TableCell>{job.duration}</TableCell>
                    <TableCell>₹{job.budget}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" data-testid={`badge-interested-${job.id}`}>
                        {interestCountMap.get(job.id) || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>{job.date}</TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setLocation(`/admin/job/${job.id}`)}
                        data-testid={`button-view-job-${job.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
