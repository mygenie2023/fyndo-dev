import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, Eye, Plus } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { formatPhone } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Job, User } from "@shared/schema";
import AdminPostJob from "./AdminPostJob";

type AdminJobResult = {
  job: Record<string, any>;
  farmer: Record<string, any> | null;
};

type AdminInterestResult = {
  id: string;
  job_id: string;
  associate_id: string;
  status: string;
  created_at: string;
  job: Record<string, any>;
};

export default function AdminJobs() {
  const [, setLocation] = useLocation();

  const [showPostJob, setShowPostJob] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /*
   * Load all jobs with farmer information
   */
  const {
    data: jobs = [],
    isLoading,
    isError,
    error,
  } = useQuery<Array<Job & { farmer: User | null }>>({
    queryKey: ["admin", "jobs"],

    queryFn: async () => {
      const {
        data,
        error,
      } = await supabase.rpc(
        "admin_get_all_jobs",
      );

      if (error) {
        throw error;
      }

      const results =
        (data ?? []) as AdminJobResult[];

      return results.map((item) => {
        const job =
          item.job || {};

        const farmer =
          item.farmer || null;

        return {
          ...job,

          // Job field mappings
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

          createdAt:
            job.created_at,

          // Farmer mapping
          farmer: farmer
            ? {
                ...farmer,

                phoneNumber:
                  farmer.phone_number,

                userType:
                  farmer.user_type,

                dateOfBirth:
                  farmer.date_of_birth,

                skillLevel:
                  farmer.skill_level,

                hourlyRate:
                  farmer.hourly_rate,

                expectedDailySalary:
                  farmer.expected_daily_salary,

                travelDistance:
                  farmer.travel_distance,

                comfortableStaying:
                  farmer.comfortable_staying,

                aadharFrontUrl:
                  farmer.aadhar_front_url,

                aadharBackUrl:
                  farmer.aadhar_back_url,

                averageRating:
                  farmer.average_rating,

                totalRatings:
                  farmer.total_ratings,

                jobsCompleted:
                  farmer.jobs_completed,

                totalEarnings:
                  farmer.total_earnings,

                pendingPayments:
                  farmer.pending_payments,

                createdAt:
                  farmer.created_at,
              }
            : null,
        } as Job & {
          farmer: User | null;
        };
      });
    },
  });

  /*
   * Fetch all job interests to calculate interested count
   */
  const {
    data: allInterests = [],
  } =
    useQuery<AdminInterestResult[]>({
      queryKey: [
        "admin",
        "all-interests",
      ],

      queryFn: async () => {
        const {
          data,
          error,
        } =
          await supabase.rpc(
            "admin_get_all_interests",
          );

        if (error) {
          throw error;
        }

        return (data ??
          []) as AdminInterestResult[];
      },
    });

  /*
   * Create map:
   * job ID -> number of interested/shortlisted associates
   */
  const interestCountMap =
    useMemo(() => {
      const map =
        new Map<string, number>();

      allInterests.forEach(
        (interest) => {
          const jobId =
            interest.job_id;

          if (!jobId) {
            return;
          }

          const count =
            map.get(jobId) || 0;

          map.set(
            jobId,
            count + 1,
          );
        },
      );

      return map;
    }, [allInterests]);

  /*
   * Sort jobs newest first.
   * Prefer createdAt when available,
   * otherwise fall back to job date.
   */
  const sortedJobs =
    useMemo(() => {
      return [...jobs].sort(
        (a, b) => {
          const createdA =
            a.createdAt
              ? new Date(
                  a.createdAt,
                ).getTime()
              : new Date(
                  a.date,
                ).getTime();

          const createdB =
            b.createdAt
              ? new Date(
                  b.createdAt,
                ).getTime()
              : new Date(
                  b.date,
                ).getTime();

          return (
            createdB -
            createdA
          );
        },
      );
    }, [jobs]);

  /*
   * Search jobs across multiple fields.
   */
  const filteredJobs =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      if (!query) {
        return sortedJobs;
      }

      return sortedJobs.filter(
        (job) => {
          const farmer =
            job.farmer;

          const searchableValues = [
            // Job information
            job.id,
            job.serviceType,
            job.service_type,
            job.date,
            job.time,
            job.duration,
            job.associatesNeeded,
            job.associates_needed,
            job.skillLevel,
            job.skill_level,
            job.budget,
            job.location,
            job.status,
            job.paymentMethod,
            job.payment_method,
            job.jobComment,
            job.job_comment,
            job.createdAt,
            job.created_at,

            // Farmer information
            farmer?.id,
            farmer?.name,
            farmer?.phoneNumber,
            farmer?.phone_number,
            farmer?.location,
            farmer?.userType,
            farmer?.user_type,
          ];

          return searchableValues.some(
            (value) =>
              String(
                value ?? "",
              )
                .toLowerCase()
                .includes(query),
          );
        },
      );
    }, [
      sortedJobs,
      searchQuery,
    ]);

  /*
   * ==========================================================================
   * Job Status Badge
   * ==========================================================================
   *
   * IMPORTANT:
   * "Open" is displayed as "Open" rather than "Active"
   * to remain consistent with the actual FYNDO job status.
   */
  const getStatusBadge =
    (status: string) => {
      const variants: Record<
        string,
        {
          variant: any;
          label: string;
        }
      > = {
        Open: {
          variant:
            "default",
          label: "Open",
        },

        Assigned: {
          variant:
            "default",
          label: "Assigned",
        },

        Completed: {
          variant:
            "secondary",
          label: "Completed",
        },

        Cancelled: {
          variant:
            "outline",
          label: "Cancelled",
        },
      };

      const config =
        variants[status] || {
          variant:
            "default",
          label: status,
        };

      return (
        <Badge
          variant={
            config.variant
          }
        >
          {config.label}
        </Badge>
      );
    };

  /*
   * Loading
   */
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading jobs...
        </CardContent>
      </Card>
    );
  }

  /*
   * Error
   */
  if (isError) {
    return (
      <Card>
        <CardContent className="py-8 text-center">

          <p className="text-destructive font-medium">
            Unable to load jobs
          </p>

          <p className="text-sm text-muted-foreground mt-2">
            {error instanceof
            Error
              ? error.message
              : "An unexpected error occurred."}
          </p>

        </CardContent>
      </Card>
    );
  }

  /*
   * Post Job screen
   */
  if (showPostJob) {
    return (
      <AdminPostJob
        onClose={() =>
          setShowPostJob(
            false,
          )
        }
      />
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">

      <CardHeader className="space-y-4">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <CardTitle>
            All Jobs (
            {
              filteredJobs.length
            }
            )
          </CardTitle>

          <Button
            onClick={() =>
              setShowPostJob(
                true,
              )
            }
            data-testid="button-post-job"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post a Job
          </Button>

        </div>

        {/* Search */}

        <div className="relative">

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

          <Input
            value={
              searchQuery
            }
            onChange={(e) =>
              setSearchQuery(
                e.target.value,
              )
            }
            placeholder="Search jobs by farmer, mobile, service, location, status, budget..."
            className="pl-9"
            data-testid="input-search-jobs"
          />

        </div>

      </CardHeader>

      <CardContent>

        <div className="overflow-x-auto">

          <Table>

            <TableHeader>

              <TableRow>

                <TableHead>
                  Requested By
                </TableHead>

                <TableHead>
                  Mobile
                </TableHead>

                <TableHead>
                  Service
                </TableHead>

                <TableHead>
                  Workers
                </TableHead>

                <TableHead>
                  Days
                </TableHead>

                <TableHead>
                  Budget
                </TableHead>

                <TableHead>
                  Interested
                </TableHead>

                <TableHead>
                  Created on
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead className="text-right">
                  Action
                </TableHead>

              </TableRow>

            </TableHeader>

            <TableBody>

              {filteredJobs.length ===
              0 ? (

                <TableRow>

                  <TableCell
                    colSpan={10}
                    className="text-center text-muted-foreground py-8"
                  >
                    {searchQuery.trim()
                      ? "No jobs match your search."
                      : "No jobs found."}
                  </TableCell>

                </TableRow>

              ) : (

                filteredJobs.map(
                  (job) => (

                    <TableRow
                      key={
                        job.id
                      }
                      data-testid={`row-job-${job.id}`}
                    >

                      {/* Farmer Name */}

                      <TableCell>

                        {job.farmer?.id ? (

                          <button
                            type="button"
                            onClick={() =>
                              setLocation(
                                `/admin/user/${job.farmer?.id}`,
                              )
                            }
                            className="font-medium text-primary hover:underline hover:text-primary/80 transition-colors text-left"
                            data-testid={`link-farmer-${job.farmer.id}`}
                          >
                            {
                              job.farmer
                                .name ||
                              "Unknown"
                            }
                          </button>

                        ) : (

                          <span className="text-muted-foreground">
                            Unknown
                          </span>

                        )}

                      </TableCell>

                      {/* Mobile */}

                      <TableCell>
                        {
                          formatPhone(
                            job.farmer
                              ?.phoneNumber,
                          ) ||
                          "N/A"
                        }
                      </TableCell>

                      {/* Service */}

                      <TableCell>
                        {
                          job.serviceType ||
                          "N/A"
                        }
                      </TableCell>

                      {/* Workers */}

                      <TableCell>
                        {
                          job.associatesNeeded ??
                          0
                        }
                      </TableCell>

                      {/* Days */}

                      <TableCell>
                        {
                          job.duration ??
                          0
                        }
                      </TableCell>

                      {/* Budget */}

                      <TableCell>
                        ₹
                        {
                          job.budget ??
                          0
                        }
                      </TableCell>

                      {/* Interested */}

                      <TableCell>

                        <Badge
                          variant="secondary"
                          data-testid={`badge-interested-${job.id}`}
                        >
                          {
                            interestCountMap.get(
                              job.id,
                            ) || 0
                          }
                        </Badge>

                      </TableCell>

                      {/* Created on */}

                      <TableCell>

                        {job.createdAt
                          ? new Date(
                              job.createdAt,
                            ).toLocaleDateString()
                          : job.date ||
                            "N/A"}

                      </TableCell>

                      {/* Status */}

                      <TableCell>
                        {
                          getStatusBadge(
                            job.status,
                          )
                        }
                      </TableCell>

                      {/* Action */}

                      <TableCell className="text-right">

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setLocation(
                              `/admin/job/${job.id}`,
                            )
                          }
                          data-testid={`button-view-job-${job.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                      </TableCell>

                    </TableRow>

                  ),
                )

              )}

            </TableBody>

          </Table>

        </div>

      </CardContent>

    </Card>
  );
}