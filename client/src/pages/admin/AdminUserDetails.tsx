import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Eye, FileText, ImageIcon } from "lucide-react";
import { formatPhone } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function AdminUserDetails() {
  const [, params] = useRoute("/admin/user/:id");
  const [, setLocation] = useLocation();
  const [aadharPreview, setAadharPreview] = useState<{ url: string; label: string } | null>(null);

  const userId = params?.id;

  const { data: user, isLoading } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  const { data: farmerJobs = [] } = useQuery<Job[]>({
    queryKey: [`/api/jobs/farmer/${userId}`],
    enabled: !!userId && user?.userType?.toLowerCase() === "farmer",
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="text-center py-8">Loading user details...</div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => setLocation("/admin/dashboard?tab=users")}
          className="mb-4"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="space-y-6">
          <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">
            <CardHeader>
              <CardTitle>User Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mobile Number</p>
                  <p>{formatPhone(user.phoneNumber)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge variant={user.userType?.toLowerCase() === "farmer" ? "default" : "secondary"}>
                    {user.userType}
                  </Badge>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="text-sm">{user.location || "N/A"}</p>
                  {user.latitude && user.longitude && (
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
                {user.userType?.toLowerCase() === "associate" && user.skills && user.skills.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground mb-2">Skills</p>
                    <div className="flex gap-2 flex-wrap">
                      {user.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {user.userType?.toLowerCase() === "associate" && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Average Rating</p>
                      <p className="text-lg font-semibold">{user.averageRating}/5</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Ratings</p>
                      <p>{user.totalRatings || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Jobs Completed</p>
                      <p>{user.jobsCompleted || 0}</p>
                    </div>
                    {user.gender && (
                      <div>
                        <p className="text-sm text-muted-foreground">Gender</p>
                        <p className="capitalize">{user.gender}</p>
                      </div>
                    )}
                    {user.dateOfBirth && (
                      <div>
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p>{user.dateOfBirth}</p>
                      </div>
                    )}
                    {user.expectedDailySalary && (
                      <div>
                        <p className="text-sm text-muted-foreground">Expected Daily Salary</p>
                        <p>Rs. {user.expectedDailySalary}</p>
                      </div>
                    )}
                    {user.travelDistance && (
                      <div>
                        <p className="text-sm text-muted-foreground">Travel Distance</p>
                        <p>{user.travelDistance} km</p>
                      </div>
                    )}
                    {user.comfortableStaying && (
                      <div>
                        <p className="text-sm text-muted-foreground">Comfortable Staying</p>
                        <p className="capitalize">{user.comfortableStaying}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Aadhar KYC Documents Section */}
          {user.userType?.toLowerCase() === "associate" && (user.aadharFrontUrl || user.aadharBackUrl) && (
            <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  KYC Documents - Aadhar Card
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Aadhar Front */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Front Side</p>
                    {user.aadharFrontUrl ? (
                      <div
                        className="relative border rounded-md overflow-hidden cursor-pointer group"
                        onClick={() => setAadharPreview({ url: `/api/admin/users/${user.id}/aadhar/front`, label: "Aadhar Card - Front Side" })}
                        data-testid="aadhar-front-preview"
                      >
                        <img
                          src={`/api/admin/users/${user.id}/aadhar/front`}
                          alt="Aadhar Front"
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden w-full h-48 flex items-center justify-center bg-muted">
                          <div className="text-center text-muted-foreground">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-xs">Unable to load image</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground">Not uploaded</p>
                      </div>
                    )}
                  </div>

                  {/* Aadhar Back */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Back Side</p>
                    {user.aadharBackUrl ? (
                      <div
                        className="relative border rounded-md overflow-hidden cursor-pointer group"
                        onClick={() => setAadharPreview({ url: `/api/admin/users/${user.id}/aadhar/back`, label: "Aadhar Card - Back Side" })}
                        data-testid="aadhar-back-preview"
                      >
                        <img
                          src={`/api/admin/users/${user.id}/aadhar/back`}
                          alt="Aadhar Back"
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden w-full h-48 flex items-center justify-center bg-muted">
                          <div className="text-center text-muted-foreground">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-xs">Unable to load image</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground">Not uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Aadhar Image Preview Dialog */}
          <Dialog open={!!aadharPreview} onOpenChange={() => setAadharPreview(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{aadharPreview?.label}</DialogTitle>
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

          {user.userType?.toLowerCase() === "farmer" && (
            <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">
              <CardHeader>
                <CardTitle>Posted Jobs ({farmerJobs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {farmerJobs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No jobs posted
                          </TableCell>
                        </TableRow>
                      ) : (
                        farmerJobs.map((job) => (
                          <TableRow key={job.id} data-testid={`row-job-${job.id}`}>
                            <TableCell>{job.serviceType}</TableCell>
                            <TableCell>{job.date}</TableCell>
                            <TableCell>{getStatusBadge(job.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLocation(`/admin/job/${job.id}`)}
                                data-testid={`button-view-job-${job.id}`}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Details
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
          )}
        </div>
      </div>
    </div>
  );
}
