import { useState, useEffect, useRef } from "react";
import { CheckCircle } from "lucide-react";
import { useUser } from "@/lib/userContext";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import FarmerJobs from "@/components/FarmerJobs";
import AssociateJobs from "@/components/AssociateJobs";

interface JobsProps {
  onPostJob?: () => void;
}

export default function Jobs({ onPostJob }: JobsProps) {
  const { user } = useUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccessIndicator, setShowSuccessIndicator] = useState(false);

  const successTimerRef = useRef<number | null>(null);

  /**
   * Open the job posting flow only when Profile Setup
   * explicitly sends the user to /jobs?createJob=true.
   *
   * The query parameter is removed immediately so that
   * refreshing /jobs does not reopen the job posting flow.
   *
   * The actual job-posting flow is controlled by the parent
   * application through onPostJob.
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("createJob") === "true") {
      // Remove the one-time parameter immediately.
      window.history.replaceState({}, "", "/jobs");

      // Trigger the existing job-posting flow.
      onPostJob?.();
    }
  }, [onPostJob]);

  /**
   * Show a temporary success message after a job is posted.
   */
  const handleJobPostSuccess = () => {
    setShowSuccessIndicator(true);

    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
    }

    successTimerRef.current = window.setTimeout(() => {
      setShowSuccessIndicator(false);
      successTimerRef.current = null;
    }, 3000);
  };

  /**
   * Cleanup success timer.
   */
  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#FDFCF7] pb-24">
      {/* App Header */}
      <AppHeader onPostJob={onPostJob} />

      {/* Success Indicator */}
      {showSuccessIndicator && (
        <div
          className="fixed left-1/2 top-20 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-300"
          data-testid="success-indicator"
        >
          <div className="flex items-center gap-3 rounded-full border border-primary/15 bg-white/95 px-6 py-3 text-primary shadow-lift backdrop-blur-xl">
            <CheckCircle
              className="h-5 w-5"
              strokeWidth={2.5}
            />

            <span className="text-sm font-medium">
              Job posted successfully!
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-2xl">
        {user?.userType === "farmer" ? (
          <FarmerJobs
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onCreateJob={onPostJob}
          />
        ) : (
          <AssociateJobs
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav
        userType={user?.userType as "farmer" | "associate"}
      />
    </div>
  );
}