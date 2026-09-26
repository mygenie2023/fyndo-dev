import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";

import {
  ArrowLeft,
  Eye,
  FileText,
  MapPin,
  Phone,
  Star,
  Briefcase,
  IndianRupee,
  Clock,
  Calendar,
  Users,
  CheckCircle2,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { User, Job } from "@shared/schema";

/*
 * ============================================================================
 * Associate Details Types
 * ============================================================================
 */

type AssociateJobActivity = {
  job: any;
  farmer: any;
  status: string;
  createdAt: string;
  interestId: string;
  review?: any;
};

type AssociateReview = {
  job: any;
  farmer: any;
  review: any;
};

type AssociateDetails = {
  user: any;

  performance: {
    totalRatings: number;
    averageRating: number;
    jobsCompleted: number;
    totalEarnings: number;
    pendingPayments: number;
  };

  reviews: AssociateReview[];

  interestedJobs: AssociateJobActivity[];

  shortlistedJobs: AssociateJobActivity[];

  completedJobs: AssociateJobActivity[];

  notShortlistedJobs: AssociateJobActivity[];
};

/*
 * ============================================================================
 * Main Component
 * ============================================================================
 */

export default function AdminUserDetails() {
  const [, params] = useRoute("/admin/user/:id");
  const [, setLocation] = useLocation();

  /*
   * --------------------------------------------------------------------------
   * Aadhaar Preview State
   * --------------------------------------------------------------------------
   */

  const [aadharPreview, setAadharPreview] = useState<{
    url: string;
    label: string;
  } | null>(null);

  const [aadharFrontPreviewUrl, setAadharFrontPreviewUrl] =
    useState<string | null>(null);

  const [aadharBackPreviewUrl, setAadharBackPreviewUrl] =
    useState<string | null>(null);

  const userId = params?.id;

  /*
   * --------------------------------------------------------------------------
   * Map Database User -> Frontend User
   * --------------------------------------------------------------------------
   */

  const mapUser = (user: any): User => {
    return {
      ...user,

      phoneNumber: user.phone_number,
      userType: user.user_type,

      dateOfBirth: user.date_of_birth,
      skillLevel: user.skill_level,
      hourlyRate: user.hourly_rate,

      expectedDailySalary: user.expected_daily_salary,
      travelDistance: user.travel_distance,
      comfortableStaying: user.comfortable_staying,

      aadharFrontUrl: user.aadhar_front_url,
      aadharBackUrl: user.aadhar_back_url,

      averageRating: user.average_rating,
      totalRatings: user.total_ratings,
      jobsCompleted: user.jobs_completed,
      totalEarnings: user.total_earnings,
      pendingPayments: user.pending_payments,

      createdAt: user.created_at,
    } as User;
  };

  /*
   * ==========================================================================
   * Load User
   * ==========================================================================
   */

  const {
    data: user,
    isLoading,
    error: userError,
  } = useQuery<User | null>({
    queryKey: ["admin", "user", userId],

    enabled: !!userId,

    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "admin_get_all_users",
      );

      if (error) {
        console.error(
          "Failed to load user details:",
          error,
        );

        throw new Error(error.message);
      }

      const matchingUser = (data ?? []).find(
        (item: any) => item.id === userId,
      );

      if (!matchingUser) {
        return null;
      }

      return mapUser(matchingUser);
    },
  });

  /*
   * ==========================================================================
   * Load Associate Details
   * ==========================================================================
   */

  const {
    data: associateDetails,
    isLoading: associateDetailsLoading,
    error: associateDetailsError,
  } = useQuery<AssociateDetails | null>({
    queryKey: [
      "admin",
      "associate-details",
      userId,
    ],

    enabled:
      !!userId &&
      user?.userType?.toLowerCase() === "associate",

    queryFn: async () => {
      if (!userId) {
        return null;
      }

      const {
        data,
        error,
      } = await supabase.rpc(
        "admin_get_associate_details",
        {
          p_associate_id: userId,
        },
      );

      if (error) {
        console.error(
          "Failed to load associate details:",
          error,
        );

        throw new Error(error.message);
      }

      if (!data) {
        return null;
      }

      return data as AssociateDetails;
    },
  });

  /*
   * ==========================================================================
   * Load Farmer Jobs
   * ==========================================================================
   */

  const {
    data: farmerJobs = [],
    isLoading: farmerJobsLoading,
  } = useQuery<Job[]>({
    queryKey: [
      "admin",
      "farmer-jobs",
      userId,
    ],

    enabled:
      !!userId &&
      user?.userType?.toLowerCase() === "farmer",

    queryFn: async () => {
      if (!userId) {
        return [];
      }

      const {
        data,
        error,
      } = await supabase.rpc(
        "get_farmer_jobs",
        {
          p_farmer_id: userId,
        },
      );

      if (error) {
        console.error(
          "Failed to load farmer jobs:",
          error,
        );

        throw new Error(error.message);
      }

      return (data ?? []).map((job: any) => ({
        ...job,

        farmerId: job.farmer_id,
        serviceType: job.service_type,

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

        latitude:
          job.latitude,

        longitude:
          job.longitude,

        location:
          job.location,

        date:
          job.date,

        time:
          job.time,

        duration:
          job.duration,

        budget:
          job.budget,

        status:
          job.status,
      })) as Job[];
    },
  });

  /*
   * ==========================================================================
   * Create Supabase Storage Signed URLs for Aadhaar
   * ==========================================================================
   */

  const createAadharPreviewUrl = async (
    value: string | null | undefined,
  ): Promise<string | null> => {
    if (!value) {
      return null;
    }

    /*
     * Database may contain a complete URL.
     */

    if (
      value.startsWith("http://") ||
      value.startsWith("https://")
    ) {
      return value;
    }

    /*
     * Otherwise treat it as a Supabase Storage path.
     */

    const {
      data,
      error,
    } = await supabase.storage
      .from("aadhar-documents")
      .createSignedUrl(
        value,
        60 * 60,
      );

    if (error) {
      console.error(
        "Failed to create Aadhaar signed URL:",
        error,
      );

      return null;
    }

    return data?.signedUrl ?? null;
  };

  /*
   * ==========================================================================
   * Load Aadhaar Preview URLs
   * ==========================================================================
   */

  useEffect(() => {
    let cancelled = false;

    const loadAadharUrls = async () => {
      if (!user) {
        setAadharFrontPreviewUrl(null);
        setAadharBackPreviewUrl(null);
        return;
      }

      const [
        frontUrl,
        backUrl,
      ] = await Promise.all([
        createAadharPreviewUrl(
          user.aadharFrontUrl,
        ),

        createAadharPreviewUrl(
          user.aadharBackUrl,
        ),
      ]);

      if (cancelled) {
        return;
      }

      setAadharFrontPreviewUrl(frontUrl);
      setAadharBackPreviewUrl(backUrl);
    };

    loadAadharUrls();

    return () => {
      cancelled = true;
    };
  }, [
    user?.id,
    user?.aadharFrontUrl,
    user?.aadharBackUrl,
  ]);

  /*
   * ==========================================================================
   * Status Badge
   * ==========================================================================
   */

  const getStatusBadge = (
    status: string,
  ) => {
    const variants: Record<
      string,
      {
        variant: any;
        label: string;
      }
    > = {
      Open: {
        variant: "default",
        label: "Active",
      },

      Assigned: {
        variant: "default",
        label: "Assigned",
      },

      Completed: {
        variant: "secondary",
        label: "Completed",
      },

      Cancelled: {
        variant: "outline",
        label: "Cancelled",
      },
    };

    const config =
      variants[status] || {
        variant: "default",
        label: status,
      };

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  /*
   * ==========================================================================
   * Loading
   * ==========================================================================
   */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="text-center py-8">
          Loading user details...
        </div>
      </div>
    );
  }

  /*
   * ==========================================================================
   * Error
   * ==========================================================================
   */

  if (userError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="container mx-auto max-w-6xl">

          <Button
            variant="ghost"
            onClick={() =>
              setLocation(
                "/admin/dashboard?tab=users",
              )
            }
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card>
            <CardContent className="py-8 text-center text-destructive">

              Failed to load user details.

              <div className="text-sm mt-2">
                {userError instanceof Error
                  ? userError.message
                  : "Unknown error"}
              </div>

            </CardContent>
          </Card>

        </div>
      </div>
    );
  }

  /*
   * ==========================================================================
   * User Not Found
   * ==========================================================================
   */

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="container mx-auto max-w-6xl">

          <Button
            variant="ghost"
            onClick={() =>
              setLocation(
                "/admin/dashboard?tab=users",
              )
            }
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              User not found.
            </CardContent>
          </Card>

        </div>
      </div>
    );
  }

  /*
   * ==========================================================================
   * Main UI
   * ==========================================================================
   */

  const isAssociate =
    user.userType?.toLowerCase() ===
    "associate";

  const isFarmer =
    user.userType?.toLowerCase() ===
    "farmer";

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">

      <div className="container mx-auto max-w-6xl">

        {/* ================================================================== */}
        {/* Back Button */}
        {/* ================================================================== */}

        <Button
          variant="ghost"
          onClick={() =>
            setLocation(
              "/admin/dashboard?tab=users",
            )
          }
          className="mb-4"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="space-y-6">

          {/* ================================================================= */}
          {/* ASSOCIATE PROFILE HERO */}
          {/* ================================================================= */}

          {isAssociate && (
            <Card className="bg-card/80 backdrop-blur-xl border-card-border/60 overflow-hidden">

              <CardContent className="p-6">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                  {/* Profile */}
                  <div className="flex items-start gap-4">

                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">

                      <span className="text-2xl font-semibold text-primary">
                        {user.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "A"}
                      </span>

                    </div>

                    <div>

                      <div className="flex flex-wrap items-center gap-2">

                        <h1 className="text-2xl font-bold">
                          {user.name}
                        </h1>

                        <Badge variant="default">
                          Associate
                        </Badge>

                      </div>

                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-5 gap-y-2 mt-2 text-sm text-muted-foreground">

                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {formatPhone(
                            user.phoneNumber,
                          )}
                        </span>

                        {user.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {user.location}
                          </span>
                        )}

                      </div>

                    </div>

                  </div>

                  {/* Summary */}
                  <div className="flex flex-wrap gap-6">

                    <div className="min-w-[80px]">

                      <div className="flex items-center gap-1">

                        <Star className="w-4 h-4 fill-current" />

                        <span className="text-lg font-semibold">
                          {associateDetails?.performance?.averageRating ??
                            0}
                        </span>

                      </div>

                      <p className="text-xs text-muted-foreground">
                        Rating
                      </p>

                    </div>

                    <div className="min-w-[80px]">

                      <p className="text-lg font-semibold">
                        {associateDetails?.performance?.totalRatings ??
                          0}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Ratings
                      </p>

                    </div>

                    <div className="min-w-[100px]">

                      <p className="text-lg font-semibold">
                        {associateDetails?.performance?.jobsCompleted ??
                          0}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Completed
                      </p>

                    </div>

                  </div>

                </div>

              </CardContent>

            </Card>
          )}

          {/* ================================================================= */}
          {/* ASSOCIATE PERFORMANCE */}
          {/* ================================================================= */}

          {isAssociate && (
            <div>

              <div className="mb-3">

                <h2 className="text-lg font-semibold">
                  Performance
                </h2>

                <p className="text-sm text-muted-foreground">
                  Associate activity and performance summary
                </p>

              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

                {/* Rating */}
                <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">

                  <CardContent className="p-4">

                    <div className="flex items-center gap-2 mb-2">

                      <Star className="w-5 h-5 fill-current" />

                      <span className="text-sm text-muted-foreground">
                        Rating
                      </span>

                    </div>

                    <p className="text-2xl font-bold">
                      {associateDetails?.performance?.averageRating ??
                        0}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      out of 5
                    </p>

                  </CardContent>

                </Card>

                {/* Ratings */}
                <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">

                  <CardContent className="p-4">

                    <div className="flex items-center gap-2 mb-2">

                      <Star className="w-5 h-5" />

                      <span className="text-sm text-muted-foreground">
                        Ratings
                      </span>

                    </div>

                    <p className="text-2xl font-bold">
                      {associateDetails?.performance?.totalRatings ??
                        0}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      total reviews
                    </p>

                  </CardContent>

                </Card>

                {/* Completed */}
                <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">

                  <CardContent className="p-4">

                    <div className="flex items-center gap-2 mb-2">

                      <CheckCircle2 className="w-5 h-5" />

                      <span className="text-sm text-muted-foreground">
                        Completed
                      </span>

                    </div>

                    <p className="text-2xl font-bold">
                      {associateDetails?.performance?.jobsCompleted ??
                        0}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      jobs completed
                    </p>

                  </CardContent>

                </Card>

                {/* Earnings */}
                <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">

                  <CardContent className="p-4">

                    <div className="flex items-center gap-2 mb-2">

                      <IndianRupee className="w-5 h-5" />

                      <span className="text-sm text-muted-foreground">
                        Earnings
                      </span>

                    </div>

                    <p className="text-2xl font-bold">
                      ₹{associateDetails?.performance?.totalEarnings ??
                        0}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      total earnings
                    </p>

                  </CardContent>

                </Card>

                {/* Pending Payments */}
                <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">

                  <CardContent className="p-4">

                    <div className="flex items-center gap-2 mb-2">

                      <Clock className="w-5 h-5" />

                      <span className="text-sm text-muted-foreground">
                        Pending
                      </span>

                    </div>

                    <p className="text-2xl font-bold">
                      ₹{associateDetails?.performance?.pendingPayments ??
                        0}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      pending payments
                    </p>

                  </CardContent>

                </Card>

              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* ASSOCIATE PROFILE INFORMATION */}
          {/* ================================================================= */}

          {isAssociate && (
            <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">

              <CardHeader>
                <CardTitle>
                  Profile Information
                </CardTitle>
              </CardHeader>

              <CardContent>

                <div className="space-y-6">

                  {/* Skills */}
                  <div>

                    <p className="text-sm text-muted-foreground mb-2">
                      Skills
                    </p>

                    {Array.isArray(user.skills) &&
                    user.skills.length > 0 ? (

                      <div className="flex flex-wrap gap-2">

                        {user.skills.map(
                          (skill: string) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                            >
                              {skill}
                            </Badge>
                          ),
                        )}

                      </div>

                    ) : (

                      <p className="text-sm text-muted-foreground">
                        No skills added
                      </p>

                    )}

                  </div>

                  {/* Profile Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                     <div>
                      <p className="text-sm text-muted-foreground">
                        Expected Daily Salary
                      </p>

                      <p className="font-medium mt-1">
                        {user.expectedDailySalary !== null &&
                        user.expectedDailySalary !== undefined
                          ? `₹${user.expectedDailySalary}/day`
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Travel Distance
                      </p>

                      <p className="font-medium mt-1">
                        {user.travelDistance !== null &&
                        user.travelDistance !== undefined
                          ? `${user.travelDistance} km`
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Comfortable Staying
                      </p>

                      <p className="font-medium mt-1 capitalize">
                        {user.comfortableStaying || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Gender
                      </p>

                      <p className="font-medium mt-1 capitalize">
                        {user.gender || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Date of Birth
                      </p>

                      <p className="font-medium mt-1">
                        {user.dateOfBirth || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Location
                      </p>

                      <p className="font-medium mt-1">
                        {user.location || "N/A"}
                      </p>
                    </div>

                  </div>

                </div>

              </CardContent>

            </Card>
          )}

          {/* ================================================================= */}
          {/* FARMER USER DETAILS */}
          {/* ================================================================= */}

          {isFarmer && (
            <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">

              <CardHeader>
                <CardTitle>
                  User Details
                </CardTitle>
              </CardHeader>

              <CardContent>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Name */}
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Name
                    </p>

                    <p className="font-medium">
                      {user.name}
                    </p>
                  </div>

                  {/* Mobile */}
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Mobile Number
                    </p>

                    <p>
                      {formatPhone(
                        user.phoneNumber,
                      )}
                    </p>
                  </div>

                  {/* Role */}
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Role
                    </p>

                    <Badge variant="default">
                      {user.userType}
                    </Badge>
                  </div>

                  {/* Location */}
                  <div className="md:col-span-2">

                    <p className="text-sm text-muted-foreground">
                      Location
                    </p>

                    <p className="text-sm">
                      {user.location || "N/A"}
                    </p>

                    {user.latitude !== null &&
                      user.latitude !== undefined &&
                      user.longitude !== null &&
                      user.longitude !== undefined && (

                      <a
                        href={`https://www.google.com/maps?q=${user.latitude},${user.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-sm hover:underline inline-flex items-center gap-1 mt-1"
                        data-testid="link-user-map"
                      >
                        View on Map
                      </a>

                    )}

                  </div>

                </div>

              </CardContent>

            </Card>
          )}

          {/* ================================================================= */}
          {/* KYC DOCUMENTS */}
          {/* ================================================================= */}

          {isAssociate && (
            <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">

              <CardHeader>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                  <div>

                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      KYC Documents
                    </CardTitle>

                    <p className="text-sm text-muted-foreground mt-1">
                      Aadhaar card documents submitted by the associate
                    </p>

                  </div>

                  <Badge
                    variant={
                      user.aadharFrontUrl &&
                      user.aadharBackUrl
                        ? "default"
                        : "outline"
                    }
                  >
                    {user.aadharFrontUrl &&
                    user.aadharBackUrl
                      ? "Documents Uploaded"
                      : "Incomplete"}
                  </Badge>

                </div>

              </CardHeader>

              <CardContent>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* Aadhaar Front */}
                  <div className="border rounded-lg p-4 space-y-4">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="font-medium">
                          Aadhaar Card - Front
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Front side of Aadhaar card
                        </p>

                      </div>

                      {user.aadharFrontUrl ? (
                        <Badge variant="secondary">
                          Uploaded
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Not Uploaded
                        </Badge>
                      )}

                    </div>

                    {aadharFrontPreviewUrl ? (
                      <>

                        <div
                          className="relative border rounded-md overflow-hidden bg-muted cursor-pointer group"
                          onClick={() =>
                            setAadharPreview({
                              url: aadharFrontPreviewUrl,
                              label:
                                "Aadhaar Card - Front Side",
                            })
                          }
                        >

                          <img
                            src={
                              aadharFrontPreviewUrl
                            }
                            alt="Aadhaar card front"
                            className="w-full h-48 object-cover"
                          />

                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">

                            <Eye className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" />

                          </div>

                        </div>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() =>
                            setAadharPreview({
                              url: aadharFrontPreviewUrl,
                              label:
                                "Aadhaar Card - Front Side",
                            })
                          }
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Document
                        </Button>

                      </>
                    ) : (

                      <div className="h-48 rounded-md bg-muted flex items-center justify-center">

                        <div className="text-center text-muted-foreground">

                          <FileText className="w-8 h-8 mx-auto mb-2" />

                          <p className="text-sm">
                            Aadhaar front not uploaded
                          </p>

                        </div>

                      </div>

                    )}

                  </div>

                  {/* Aadhaar Back */}
                  <div className="border rounded-lg p-4 space-y-4">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="font-medium">
                          Aadhaar Card - Back
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Back side of Aadhaar card
                        </p>

                      </div>

                      {user.aadharBackUrl ? (
                        <Badge variant="secondary">
                          Uploaded
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Not Uploaded
                        </Badge>
                      )}

                    </div>

                    {aadharBackPreviewUrl ? (
                      <>

                        <div
                          className="relative border rounded-md overflow-hidden bg-muted cursor-pointer group"
                          onClick={() =>
                            setAadharPreview({
                              url: aadharBackPreviewUrl,
                              label:
                                "Aadhaar Card - Back Side",
                            })
                          }
                        >

                          <img
                            src={
                              aadharBackPreviewUrl
                            }
                            alt="Aadhaar card back"
                            className="w-full h-48 object-cover"
                          />

                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">

                            <Eye className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" />

                          </div>

                        </div>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() =>
                            setAadharPreview({
                              url: aadharBackPreviewUrl,
                              label:
                                "Aadhaar Card - Back Side",
                            })
                          }
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Document
                        </Button>

                      </>
                    ) : (

                      <div className="h-48 rounded-md bg-muted flex items-center justify-center">

                        <div className="text-center text-muted-foreground">

                          <FileText className="w-8 h-8 mx-auto mb-2" />

                          <p className="text-sm">
                            Aadhaar back not uploaded
                          </p>

                        </div>

                      </div>

                    )}

                  </div>

                </div>

              </CardContent>

            </Card>
          )}

          {/* ================================================================= */}
          {/* AADHAAR PREVIEW DIALOG */}
          {/* ================================================================= */}

          <Dialog
            open={!!aadharPreview}
            onOpenChange={() =>
              setAadharPreview(null)
            }
          >

            <DialogContent className="max-w-2xl">

              <DialogHeader>

                <DialogTitle>
                  {aadharPreview?.label}
                </DialogTitle>

              </DialogHeader>

              {aadharPreview && (
                <div className="flex items-center justify-center">

                  <img
                    src={aadharPreview.url}
                    alt={aadharPreview.label}
                    className="max-w-full max-h-[70vh] object-contain rounded-md"
                    data-testid="aadhar-full-preview"
                  />

                </div>
              )}

            </DialogContent>

          </Dialog>

          {/* ================================================================= */}
          {/* ASSOCIATE JOB ACTIVITY */}
          {/* ================================================================= */}

          {isAssociate && (
            <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">

              <CardHeader>

                <CardTitle>
                  Job Activity
                </CardTitle>

                <p className="text-sm text-muted-foreground">
                  Jobs and opportunities associated with this profile
                </p>

              </CardHeader>

              <CardContent>

                {associateDetailsLoading ? (

                  <div className="py-10 text-center text-muted-foreground">
                    Loading job activity...
                  </div>

                ) : associateDetailsError ? (

                  <div className="py-10 text-center text-destructive">
                    Failed to load job activity.
                    <div className="text-sm mt-2">
                      {associateDetailsError instanceof Error
                        ? associateDetailsError.message
                        : "Unknown error"}
                    </div>
                  </div>

                ) : (

                  <Tabs
                    defaultValue="interested"
                    className="w-full"
                  >

                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">

                      <TabsTrigger
                        value="interested"
                        className="py-3"
                      >
                        Interested

                        <span className="ml-2 text-xs">
                          (
                          {associateDetails?.interestedJobs?.length ??
                            0}
                          )
                        </span>

                      </TabsTrigger>

                      <TabsTrigger
                        value="shortlisted"
                        className="py-3"
                      >
                        Shortlisted

                        <span className="ml-2 text-xs">
                          (
                          {associateDetails?.shortlistedJobs?.length ??
                            0}
                          )
                        </span>

                      </TabsTrigger>

                      <TabsTrigger
                        value="completed"
                        className="py-3"
                      >
                        Completed

                        <span className="ml-2 text-xs">
                          (
                          {associateDetails?.completedJobs?.length ??
                            0}
                          )
                        </span>

                      </TabsTrigger>

                      <TabsTrigger
                        value="not-shortlisted"
                        className="py-3"
                      >
                        Not Shortlisted

                        <span className="ml-2 text-xs">
                          (
                          {associateDetails?.notShortlistedJobs?.length ??
                            0}
                          )
                        </span>

                      </TabsTrigger>

                    </TabsList>

                    {/* Interested */}
                    <TabsContent
                      value="interested"
                      className="mt-6"
                    >
                      <AssociateJobList
                        jobs={
                          associateDetails?.interestedJobs ??
                          []
                        }
                        type="interested"
                        setLocation={setLocation}
                      />
                    </TabsContent>

                    {/* Shortlisted */}
                    <TabsContent
                      value="shortlisted"
                      className="mt-6"
                    >
                      <AssociateJobList
                        jobs={
                          associateDetails?.shortlistedJobs ??
                          []
                        }
                        type="shortlisted"
                        setLocation={setLocation}
                      />
                    </TabsContent>

                    {/* Completed */}
                    <TabsContent
                      value="completed"
                      className="mt-6"
                    >
                      <AssociateJobList
                        jobs={
                          associateDetails?.completedJobs ??
                          []
                        }
                        type="completed"
                        setLocation={setLocation}
                      />
                    </TabsContent>

                    {/* Not Shortlisted */}
                    <TabsContent
                      value="not-shortlisted"
                      className="mt-6"
                    >
                      <AssociateJobList
                        jobs={
                          associateDetails?.notShortlistedJobs ??
                          []
                        }
                        type="not-shortlisted"
                        setLocation={setLocation}
                      />
                    </TabsContent>

                  </Tabs>

                )}

              </CardContent>

            </Card>
          )}

          {/* ================================================================= */}
          {/* FARMER POSTED JOBS */}
          {/* ================================================================= */}

          {isFarmer && (
            <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">

              <CardHeader>

                <CardTitle>
                  Posted Jobs (
                  {farmerJobsLoading
                    ? "..."
                    : farmerJobs.length}
                  )
                </CardTitle>

              </CardHeader>

              <CardContent>

                <div className="overflow-x-auto">

                  <Table>

                    <TableHeader>

                      <TableRow>

                        <TableHead>
                          Service Type
                        </TableHead>

                        <TableHead>
                          Date
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

                      {farmerJobs.length === 0 ? (

                        <TableRow>

                          <TableCell
                            colSpan={4}
                            className="text-center text-muted-foreground py-8"
                          >
                            {farmerJobsLoading
                              ? "Loading jobs..."
                              : "No jobs posted"}
                          </TableCell>

                        </TableRow>

                      ) : (

                        farmerJobs.map(
                          (job) => (

                            <TableRow
                              key={job.id}
                              data-testid={`row-job-${job.id}`}
                            >

                              <TableCell>
                                {job.serviceType}
                              </TableCell>

                              <TableCell>
                                {job.date}
                              </TableCell>

                              <TableCell>
                                {getStatusBadge(
                                  job.status,
                                )}
                              </TableCell>

                              <TableCell className="text-right">

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setLocation(
                                      `/admin/job/${job.id}`,
                                    )
                                  }
                                  data-testid={`button-view-job-${job.id}`}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Details
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
          )}

        </div>

      </div>

    </div>
  );
}

/*
 * ============================================================================
 * Associate Job List
 * ============================================================================
 */

type AssociateJobListProps = {
  jobs: AssociateJobActivity[];

  type:
    | "interested"
    | "shortlisted"
    | "completed"
    | "not-shortlisted";

  setLocation: (path: string) => void;
};

function AssociateJobList({
  jobs,
  type,
  setLocation,
}: AssociateJobListProps) {

  /*
   * --------------------------------------------------------------------------
   * Empty State
   * --------------------------------------------------------------------------
   */

  if (jobs.length === 0) {
    return (
      <div className="py-12 text-center border rounded-lg bg-muted/30">

        <Briefcase className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />

        <p className="font-medium">
          No jobs found
        </p>

        <p className="text-sm text-muted-foreground mt-1">
          There are no jobs in this category.
        </p>

      </div>
    );
  }

  /*
   * --------------------------------------------------------------------------
   * Job Cards
   * --------------------------------------------------------------------------
   */

  return (
    <div className="space-y-3">

      {jobs.map((item) => {

        const job = item.job;
        const farmer = item.farmer;
        const review = item.review;

        return (
          <Card
            key={item.interestId}
            className="border-card-border/60"
          >

            <CardContent className="p-4">

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                {/* Job Information */}
                <div className="space-y-2">

                  <div className="flex flex-wrap items-center gap-2">

                    <h3 className="font-semibold">
                      {job?.service_type ||
                        job?.serviceType ||
                        "Job"}
                    </h3>

                    {type === "interested" && (
                      <Badge variant="secondary">
                        Interested
                      </Badge>
                    )}

                    {type === "shortlisted" && (
                      <Badge variant="default">
                        Shortlisted
                      </Badge>
                    )}

                    {type === "completed" && (
                      <Badge variant="secondary">
                        Completed
                      </Badge>
                    )}

                    {type === "not-shortlisted" && (
                      <Badge variant="outline">
                        Not Shortlisted
                      </Badge>
                    )}

                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">

                    <span className="inline-flex items-center gap-1">

                      <Users className="w-4 h-4" />

                      Farmer:{" "}
                      {farmer?.name ||
                        "Unknown"}

                    </span>

                    {job?.date && (
                      <span className="inline-flex items-center gap-1">

                        <Calendar className="w-4 h-4" />

                        {job.date}

                      </span>
                    )}

                    {job?.location && (
                      <span className="inline-flex items-center gap-1">

                        <MapPin className="w-4 h-4" />

                        {job.location}

                      </span>
                    )}

                  </div>

                </div>

                {/* Right Side */}
                <div className="flex items-center gap-3">

                  {job?.budget !== null &&
                    job?.budget !== undefined && (

                      <div className="text-right">

                        <p className="font-semibold">
                          ₹{job.budget}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Budget
                        </p>

                      </div>

                    )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setLocation(
                        `/admin/job/${job.id}`,
                      )
                    }
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Details
                  </Button>

                </div>

              </div>

              {/* ============================================================ */}
              {/* Completed Job Review */}
              {/* ============================================================ */}

              {type === "completed" && (
                <div className="mt-4 pt-4 border-t">

                  {review ? (

                    <>

                      <div className="flex items-center gap-2">

                        <Star className="w-4 h-4 fill-current" />

                        <span className="font-medium">
                          {review.rating ?? 0}/5
                        </span>

                        <span className="text-sm text-muted-foreground">
                          Farmer rating
                        </span>

                      </div>

                      {review.review_text && (
                        <p className="text-sm text-muted-foreground mt-2">
                          "{review.review_text}"
                        </p>
                      )}

                    </>

                  ) : (

                    <p className="text-sm text-muted-foreground">
                      No review available for this job.
                    </p>

                  )}

                </div>
              )}

            </CardContent>

          </Card>
        );

      })}

    </div>
  );
}