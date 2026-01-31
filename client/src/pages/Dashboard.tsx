import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import MetricCard from "@/components/MetricCard";
import JobCard from "@/components/JobCard";
import BottomNav from "@/components/BottomNav";
import { useUser } from "@/lib/userContext";
import { DollarSign, Briefcase, Star, Clock, CheckCircle, Plus, Bell } from "lucide-react";
import type { Job, JobInterest } from "@shared/schema";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useUser();

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: user?.userType === "farmer" 
      ? ["/api/jobs/farmer", user?.id]
      : ["/api/jobs/nearby", user?.latitude, user?.longitude],
    enabled: !!user && (user.userType === "farmer" || (!!user.latitude && !!user.longitude)),
  });

  const { data: associateInterests = [] } = useQuery<Array<JobInterest & { job: Job }>>({
    queryKey: ["/api/job-interests/associate", user?.id],
    enabled: !!user && user?.userType === "associate",
  });

  const shortlistedJobsCount = user?.userType === "associate" 
    ? associateInterests.filter((interest) => interest.status.toLowerCase() === "shortlisted").length 
    : 0;

  const farmerMetrics = [
    { icon: Briefcase, label: t("metrics.activeJobs"), value: jobs.filter(j => j.status === "Open" || j.status === "Assigned").length },
    { icon: DollarSign, label: t("metrics.totalSpent"), value: "₹0" },
    { icon: Star, label: t("metrics.avgRatingGiven"), value: "-" },
    { icon: Clock, label: t("metrics.pending"), value: jobs.filter(j => j.status === "Open").length },
  ];

  const associateMetrics = [
    { icon: DollarSign, label: t("metrics.totalEarnings"), value: `₹${user?.totalEarnings || 0}` },
    { icon: Briefcase, label: t("metrics.jobsCompleted"), value: user?.jobsCompleted || 0 },
    { icon: Star, label: t("metrics.averageRating"), value: user?.averageRating || "-" },
    { icon: CheckCircle, label: t("metrics.shortlistedJobs"), value: shortlistedJobsCount },
  ];

  const metrics = user?.userType === "farmer" ? farmerMetrics : associateMetrics;
  const recentJobs = jobs.slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 bg-card/90 backdrop-blur-lg border-b border-card-border/60 z-40 px-5 h-16 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t("dashboard.title")}</h1>
          <p className="text-xs text-muted-foreground">{t("dashboard.welcome")}</p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button size="icon" variant="ghost" className="relative" data-testid="button-notifications">
            <Bell className="w-5 h-5" strokeWidth={2} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-card" />
          </Button>
        </div>
      </header>

      <div className="p-5 space-y-8 max-w-2xl mx-auto">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t("dashboard.overview")}</h2>
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((metric, idx) => (
              <MetricCard key={idx} {...metric} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {user?.userType === "farmer" ? t("dashboard.recentJobs") : t("dashboard.nearbyJobs")}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {user?.userType === "farmer" ? t("dashboard.manageJobs") : t("dashboard.findOpportunities")}
              </p>
            </div>
            {user?.userType === "farmer" && (
              <Link href="/create-job">
                <Button size="sm" className="shadow-sm" data-testid="button-create-job">
                  <Plus className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
                  {t("dashboard.post")}
                </Button>
              </Link>
            )}
          </div>

          <div className="space-y-4">
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
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
                  showActions={user?.userType === "associate"}
                  onExpressInterest={user?.userType === "associate" ? async () => {
                    console.log("Express interest:", job.id);
                  } : undefined}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                  <Briefcase className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {user?.userType === "farmer" ? t("dashboard.noJobsPosted") : t("dashboard.noJobsAvailable")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.userType === "farmer" ? t("dashboard.createFirstJob") : t("dashboard.checkBackSoon")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav userType={user?.userType as any} />
    </div>
  );
}
