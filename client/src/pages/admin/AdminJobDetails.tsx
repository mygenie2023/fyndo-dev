import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Trash2, CheckCircle, Ban, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertJobSchema } from "@shared/schema";
import type { Job, User, JobInterest, Review } from "@shared/schema";
import { z } from "zod";

export default function AdminJobDetails() {
  const [, params] = useRoute("/admin/job/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const jobId = params?.id;

  const { data: job, isLoading } = useQuery<Job>({
    queryKey: [`/api/jobs/${jobId}`],
    enabled: !!jobId,
  });

  const { data: farmer } = useQuery<User>({
    queryKey: [`/api/users/${job?.farmerId}`],
    enabled: !!job?.farmerId,
  });

  const { data: interests = [] } = useQuery<Array<JobInterest & { associate: User }>>({
    queryKey: [`/api/job-interests/job/${jobId}`],
    enabled: !!jobId,
  });

  const { data: reviews = [] } = useQuery<Array<Review & { farmer: User; associate: User }>>({
    queryKey: [`/api/admin/reviews/job/${jobId}`],
    enabled: !!jobId,
  });

  const updateJobMutation = useMutation({
    mutationFn: async (data: Partial<Job>) => {
      return apiRequest("PATCH", `/api/jobs/${jobId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      setIsEditing(false);
      toast({
        title: "Job Updated",
        description: "Job has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update job.",
      });
    },
  });

  const shortlistMutation = useMutation({
    mutationFn: async (associateId: string) => {
      return apiRequest("PATCH", `/api/job-interests/${jobId}/${associateId}`, { status: "shortlisted" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/job-interests/job/${jobId}`] });
      toast({
        title: "Associate Shortlisted",
        description: "Associate has been shortlisted for this job.",
      });
    },
  });

  const removeShortlistMutation = useMutation({
    mutationFn: async (associateId: string) => {
      return apiRequest("PATCH", `/api/job-interests/${jobId}/${associateId}`, { status: "interested" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/job-interests/job/${jobId}`] });
      toast({
        title: "Shortlist Removed",
        description: "Associate has been removed from shortlist.",
      });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return apiRequest("DELETE", `/api/admin/reviews/${reviewId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/reviews/job/${jobId}`] });
      toast({
        title: "Review Deleted",
        description: "Review has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Failed to delete review.",
      });
    },
  });

  const updateJobSchema = insertJobSchema.extend({
    status: z.enum(["Open", "Assigned", "Completed", "Cancelled"]),
  });

  const form = useForm({
    resolver: zodResolver(updateJobSchema),
    values: job || undefined,
  });

  if (isLoading || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="text-center py-8">Loading job details...</div>
      </div>
    );
  }

  const handleUpdate = async (data: any) => {
    updateJobMutation.mutate(data);
  };

  const handleCancel = () => {
    updateJobMutation.mutate({ status: "Cancelled" });
  };

  const handleComplete = () => {
    updateJobMutation.mutate({ status: "Completed" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => setLocation("/admin/dashboard")}
          className="mb-4"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="space-y-6">
          <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Job Details</CardTitle>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      data-testid="button-edit"
                    >
                      Edit
                    </Button>
                    {job.status !== "Cancelled" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        data-testid="button-cancel-job"
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Cancel Job
                      </Button>
                    )}
                    {job.status !== "Completed" && job.status !== "Cancelled" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleComplete}
                        data-testid="button-complete-job"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Completed
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    data-testid="button-cancel-edit"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="serviceType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Type</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-service-type" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-status">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Open">Open</SelectItem>
                                <SelectItem value="Assigned">Assigned</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" data-testid="input-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (days)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                data-testid="input-duration" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="associatesNeeded"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Associates Needed</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                data-testid="input-associates" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget (Rs.)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                data-testid="input-budget" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="jobComment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Comment</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value || ""}
                              data-testid="input-job-comment"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" data-testid="button-update-job">
                      <Save className="w-4 h-4 mr-2" />
                      Update Job
                    </Button>
                  </form>
                </Form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge>{job.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Farmer</p>
                    <p>{farmer?.name || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mobile</p>
                    <p>{farmer?.phoneNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Service Type</p>
                    <p>{job.serviceType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p>{job.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p>{job.duration} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Associates Needed</p>
                    <p>{job.associatesNeeded}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p>Rs. {job.budget}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="text-sm">{job.location}</p>
                    {job.latitude && job.longitude && (
                      <a
                        href={`https://www.google.com/maps?q=${job.latitude},${job.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-sm hover:underline inline-flex items-center gap-1 mt-1"
                        data-testid="link-job-map"
                      >
                        View on Map
                      </a>
                    )}
                  </div>
                  {job.jobComment && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Job Comment</p>
                      <p className="text-sm">{job.jobComment}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">
            <CardHeader>
              <CardTitle>Interested Associates ({interests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {interests.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No associates have expressed interest yet
                </p>
              ) : (
                <div className="space-y-3">
                  {interests.map((interest) => (
                    <Card key={interest.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{interest.associate.name}</p>
                            <Badge
                              variant={interest.status === "shortlisted" ? "default" : "outline"}
                            >
                              {interest.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {interest.associate.phoneNumber}
                          </p>
                          {interest.associate.skills && interest.associate.skills.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {interest.associate.skills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {interest.status === "shortlisted" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeShortlistMutation.mutate(interest.associateId)}
                              disabled={removeShortlistMutation.isPending}
                              data-testid={`button-remove-shortlist-${interest.associateId}`}
                            >
                              Remove
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => shortlistMutation.mutate(interest.associateId)}
                              disabled={shortlistMutation.isPending}
                              data-testid={`button-shortlist-${interest.associateId}`}
                            >
                              Shortlist
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-xl border-card-border/60">
            <CardHeader>
              <CardTitle>Reviews & Ratings ({reviews.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No reviews yet
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} className="p-4" data-testid={`review-${review.id}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium">{review.associate.name}</p>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {review.rating}/5
                            </span>
                          </div>
                          {review.reviewText && (
                            <p className="text-sm text-muted-foreground">{review.reviewText}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            By {review.farmer.name} on{" "}
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteReviewMutation.mutate(review.id)}
                          data-testid={`button-delete-review-${review.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
