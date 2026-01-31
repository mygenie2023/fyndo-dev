import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "./lib/userContext";
import { AdminProvider } from "./lib/adminContext";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
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
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminJobDetails from "@/pages/admin/AdminJobDetails";
import AdminUserDetails from "@/pages/admin/AdminUserDetails";
import "./i18n/config";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/profile-setup" component={ProfileSetup} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/create-job" component={CreateJob} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/my-jobs" component={MyJobs} />
      <Route path="/edit-profile" component={EditProfile} />
      <Route path="/job-details/:id" component={JobDetails} />
      <Route path="/submit-review/:id" component={SubmitReview} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/alerts" component={Notifications} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/more" component={ProfilePage} />
      
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/job/:id" component={AdminJobDetails} />
      <Route path="/admin/user/:id" component={AdminUserDetails} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <AdminProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AdminProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
