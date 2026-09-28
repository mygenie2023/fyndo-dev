import { useState } from "react";
import {
  Switch,
  Route,
  Router as WouterRouter,
  Redirect,
  useLocation,
} from "wouter";

import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";

import { UserProvider } from "./lib/userContext";
import { AdminProvider } from "./lib/adminContext";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { LanguageProvider } from "@/i18n/website/provider";

import NotFound from "@/pages/not-found";
import AssociateRatings from "@/pages/AssociateRatings";

/* =========================================================
   PUBLIC WEBSITE
   ========================================================= */

import PublicHome from "@/pages/PublicHome";
import HowItWorks from "@/pages/HowItWorks";
import Services from "@/pages/Services";
import ServiceDetails from "@/pages/ServiceDetails";
import About from "@/pages/About";
import FaqPage from "@/pages/FaqPage";
import ForWorkProviders from "@/pages/ForWorkProviders";
import ForOperators from "@/pages/ForOperators";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Trust from "@/pages/Trust";

/* =========================================================
   FYNDO USER APP
   ========================================================= */

import Login from "@/pages/Login";
import ProfileSetup from "@/pages/ProfileSetup";
import Dashboard from "@/pages/Dashboard";
import CreateJob from "@/pages/CreateJob";
import Jobs from "@/pages/Jobs";
import MyJobs from "@/pages/MyJobs";
import JobDetails from "@/pages/JobDetails";
import SubmitReview from "@/pages/SubmitReview";
import Notifications from "@/pages/Notifications";
import ProfilePage from "@/pages/Profile";
import EditProfile from "@/pages/EditProfile";
import Ratings from "@/pages/Ratings";

/* =========================================================
   ADMIN
   ========================================================= */

import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminJobDetails from "@/pages/admin/AdminJobDetails";
import AdminUserDetails from "@/pages/admin/AdminUserDetails";

/* =========================================================
   APP COMPONENTS
   ========================================================= */

import JobPostingFlow from "@/components/JobPostingFlow";
import AppHeader from "@/components/AppHeader";

import "./i18n/config";

/*
 * ==========================================================
 * APP SHELL
 * ==========================================================
 *
 * The global AppHeader is rendered BEFORE the routed page.
 *
 * This prevents the header from appearing underneath / after
 * the page content.
 *
 * AppHeader is shown only on regular FYNDO application pages.
 *
 * Public website pages, Login, Profile Setup and Admin pages
 * do not use the regular application header.
 * ==========================================================
 */

function AppShell() {
  const [location] = useLocation();

  /*
   * Edit Profile no longer has its own page-level header,
   * so it uses the global AppHeader from AppShell.
   *
   * All other app pages retain their existing page-level
   * headers to avoid duplicate headers.
   */
  const isEditProfilePage = location === "/edit-profile";

  const [showJobPosting, setShowJobPosting] = useState(false);

  return (
    <>
      {/* ======================================================
          EDIT PROFILE GLOBAL HEADER
          ====================================================== */}

      {isEditProfilePage && <AppHeader />}

      {/* ======================================================
          ROUTES
          ====================================================== */}

      <Switch>

        {/* ====================================================
            PUBLIC WEBSITE
            ==================================================== */}

        <Route
          path="/"
          component={PublicHome}
        />

        <Route
          path="/how-it-works"
          component={HowItWorks}
        />

        <Route
          path="/services"
          component={Services}
        />

        <Route
          path="/services/:service"
          component={ServiceDetails}
        />

        <Route
          path="/about"
          component={About}
        />

        <Route
          path="/faq"
          component={FaqPage}
        />

        <Route
          path="/for-work-providers"
          component={ForWorkProviders}
        />

        <Route
          path="/for-operators"
          component={ForOperators}
        />

        <Route
          path="/privacy"
          component={Privacy}
        />

        <Route
          path="/terms"
          component={Terms}
        />

        <Route
          path="/trust"
          component={Trust}
        />

        <Route path="/contact">
          <Redirect to="/" />
        </Route>

        {/* ====================================================
            FYNDO USER APP
            ==================================================== */}

        <Route
          path="/login"
          component={Login}
        />

        <Route
          path="/profile-setup"
          component={ProfileSetup}
        />

        <Route
          path="/dashboard"
          component={Dashboard}
        />

        <Route
          path="/create-job"
          component={CreateJob}
        />

        {/* Jobs gets the Post Your Job callback */}
        <Route path="/jobs">
          <Jobs
            onPostJob={() => setShowJobPosting(true)}
          />
        </Route>

        <Route
          path="/my-jobs"
          component={MyJobs}
        />

        <Route
          path="/edit-profile"
          component={EditProfile}
        />

        <Route
          path="/job-details/:id"
          component={JobDetails}
        />

        <Route
          path="/associate-ratings/:associateId"
          component={AssociateRatings}
        />

        <Route
          path="/submit-review/:id"
          component={SubmitReview}
        />

        <Route
          path="/notifications"
          component={Notifications}
        />

        <Route
          path="/alerts"
          component={Notifications}
        />

        <Route
          path="/profile"
          component={ProfilePage}
        />

        <Route
         path="/ratings"
         component={Ratings}
        />

        <Route
          path="/more"
          component={ProfilePage}
        />

        {/* ====================================================
            ADMIN
            ==================================================== */}

        <Route
          path="/admin"
          component={AdminLogin}
        />

        <Route
          path="/admin/dashboard"
          component={AdminDashboard}
        />

        <Route
          path="/admin/job/:id"
          component={AdminJobDetails}
        />

        <Route
          path="/admin/user/:id"
          component={AdminUserDetails}
        />

        {/* ====================================================
            404
            ==================================================== */}

        <Route component={NotFound} />

      </Switch>

      {/* ======================================================
          POST YOUR JOB FLOW
          ====================================================== */}

      {showJobPosting && (
  <div className="fixed inset-0 z-[10000] overflow-y-auto bg-[#FDFCF7]">
    <JobPostingFlow
      onClose={() => setShowJobPosting(false)}
    />
  </div>
)}
    </>
  );
}

/*
 * ==========================================================
 * ROOT APP
 * ==========================================================
 */

function App() {
  return (
    <QueryClientProvider
      client={queryClient}
    >
      <LanguageProvider>
        <UserProvider>
          <AdminProvider>
            <TooltipProvider>

              <Toaster />

              <WouterRouter>
                <AppShell />
              </WouterRouter>

            </TooltipProvider>
          </AdminProvider>
        </UserProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;