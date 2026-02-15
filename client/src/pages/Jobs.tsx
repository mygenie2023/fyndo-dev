import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, CheckCircle } from "lucide-react";
import fyndoLogo from "@assets/FYNDO_v1.0_1770731684699.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/lib/userContext";
import BottomNav from "@/components/BottomNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import JobPostingFlow from "@/components/JobPostingFlow";
import { useTranslation } from "react-i18next";
import FarmerJobs from "@/components/FarmerJobs";
import AssociateJobs from "@/components/AssociateJobs";

export default function Jobs() {
  const { t } = useTranslation();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [showJobPosting, setShowJobPosting] = useState(false);
  const [showSuccessIndicator, setShowSuccessIndicator] = useState(false);
  const [skipAutoNavigate, setSkipAutoNavigate] = useState(false);
  const successTimerRef = useRef<number | null>(null);

  // Callback for successful job creation
  const handleJobPostSuccess = () => {
    setShowSuccessIndicator(true);
    setSkipAutoNavigate(true);
    
    // Clear any existing timer
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
    }
    
    // Hide success indicator and re-enable auto-navigate after 3 seconds
    successTimerRef.current = window.setTimeout(() => {
      setShowSuccessIndicator(false);
      setSkipAutoNavigate(false);
      successTimerRef.current = null;
    }, 3000);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  // If showing job posting flow, render it full screen
  if (showJobPosting) {
    return (
      <JobPostingFlow 
        onClose={() => setShowJobPosting(false)} 
        onSuccess={handleJobPostSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24 relative">
      {/* Success Indicator */}
      {showSuccessIndicator && (
        <div 
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300"
          data-testid="success-indicator"
        >
          <div className="bg-primary/95 backdrop-blur-xl text-primary-foreground px-6 py-3 rounded-full shadow-xl flex items-center gap-3 border border-primary-foreground/20">
            <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
            <span className="font-medium text-sm">Job posted successfully!</span>
          </div>
        </div>
      )}

      {/* Top Bar with Branding */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-card-border/60 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={fyndoLogo} alt="FYNDO" className="h-8" data-testid="img-logo" />
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto">
        {user?.userType === "farmer" ? (
          <FarmerJobs 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            onCreateJob={() => setShowJobPosting(true)}
            skipAutoNavigate={skipAutoNavigate}
          />
        ) : (
          <AssociateJobs searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        )}
      </div>

      {/* Floating Action Button - OUTSIDE scrollable container - Positioned relative to screen */}
      {user?.userType === "farmer" && (
        <Button
          onClick={() => setShowJobPosting(true)}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          style={{
            position: "absolute",
            bottom: "140px",
            right: "20px",
            zIndex: 9999
          }}
          size="icon"
          data-testid="button-create-job"
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}

      <BottomNav userType={user?.userType as "farmer" | "associate"} />
    </div>
  );
}
