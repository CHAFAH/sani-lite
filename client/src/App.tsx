import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useEffect } from "react";

// Marketing pages
import LandingPage from "./pages/LandingPage";
import About from "./pages/marketing/About";
import BookDemo from "./pages/marketing/BookDemo";
import Pricing from "./pages/marketing/Pricing";

// Platform pages
import PlatformOverview from "./pages/platform/Overview";
import PlatformEmployeeSelfService from "./pages/platform/EmployeeSelfService";
import DataAnalytics from "./pages/platform/DataAnalytics";
import PlatformWorkflows from "./pages/platform/Workflows";
import GlobalPayroll from "./pages/platform/GlobalPayroll";
import PlatformPayrollHub from "./pages/platform/PayrollHub";
import PlatformBenefits from "./pages/platform/Benefits";
import PlatformHiring from "./pages/platform/Hiring";
import PlatformLearning from "./pages/platform/Learning";
import PerformanceMgmt from "./pages/platform/PerformanceMgmt";
import PlatformCompensation from "./pages/platform/Compensation";

// Solutions pages
import ForHR from "./pages/solutions/ForHR";
import ForManagers from "./pages/solutions/ForManagers";
import ForEmployees from "./pages/solutions/ForEmployees";
import ForFinance from "./pages/solutions/ForFinance";
import Startups from "./pages/solutions/Startups";
import Enterprise from "./pages/solutions/Enterprise";
import RemoteTeams from "./pages/solutions/RemoteTeams";

// Resources pages
import Blog from "./pages/resources/Blog";
import Guides from "./pages/resources/Guides";
import Webinars from "./pages/resources/Webinars";
import HelpCenter from "./pages/resources/HelpCenter";
import ApiDocs from "./pages/resources/ApiDocs";

// App pages — Core
import AppDashboard from "./pages/app/Dashboard";
import AppEmployees from "./pages/app/Employees";
import AppEmployeeSelfService from "./pages/app/EmployeeSelfService";
import AppAnalytics from "./pages/app/Analytics";
import AppWorkflows from "./pages/app/Workflows";
import AppAnnouncements from "./pages/app/Announcements";
import AppTimeOff from "./pages/app/TimeOff";
import CoreHR from "./pages/app/CoreHR";

// App pages — Payroll Suite
import AppPayroll from "./pages/app/Payroll";
import AppPayrollHub from "./pages/app/PayrollHub";
import AppBenefits from "./pages/app/Benefits";

// App pages — Talent Suite
import AppHiring from "./pages/app/Hiring";
import AppLearning from "./pages/app/Learning";
import AppPerformance from "./pages/app/Performance";
import AppCompensation from "./pages/app/Compensation";

// App pages — Admin & Onboarding
import CompanyOnboarding from "./pages/app/CompanyOnboarding";
import AdminDashboard from "./pages/app/AdminDashboard";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      {/* Marketing */}
      <Route path="/" component={LandingPage} />
      <Route path="/about" component={About} />
      <Route path="/book-demo" component={BookDemo} />
      <Route path="/pricing" component={Pricing} />

      {/* Platform (marketing info pages) */}
      <Route path="/platform" component={PlatformOverview} />
      <Route path="/platform/overview" component={PlatformOverview} />
      <Route path="/platform/employee-self-service" component={PlatformEmployeeSelfService} />
      <Route path="/platform/data-analytics" component={DataAnalytics} />
      <Route path="/platform/workflows" component={PlatformWorkflows} />
      <Route path="/platform/global-payroll" component={GlobalPayroll} />
      <Route path="/platform/payroll-hub" component={PlatformPayrollHub} />
      <Route path="/platform/benefits" component={PlatformBenefits} />
      <Route path="/platform/hiring" component={PlatformHiring} />
      <Route path="/platform/learning" component={PlatformLearning} />
      <Route path="/platform/performance" component={PerformanceMgmt} />
      <Route path="/platform/compensation" component={PlatformCompensation} />

      {/* Solutions */}
      <Route path="/solutions/hr" component={ForHR} />
      <Route path="/solutions/managers" component={ForManagers} />
      <Route path="/solutions/employees" component={ForEmployees} />
      <Route path="/solutions/finance" component={ForFinance} />
      <Route path="/solutions/startups" component={Startups} />
      <Route path="/solutions/enterprise" component={Enterprise} />
      <Route path="/solutions/remote-teams" component={RemoteTeams} />

      {/* Resources */}
      <Route path="/resources/blog" component={Blog} />
      <Route path="/resources/guides" component={Guides} />
      <Route path="/resources/webinars" component={Webinars} />
      <Route path="/resources/help-center" component={HelpCenter} />
      <Route path="/resources/api-docs" component={ApiDocs} />

      {/* Onboarding & Admin */}
      <Route path="/onboarding" component={CompanyOnboarding} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/dashboard" component={AdminDashboard} />

      {/* App — Core */}
      <Route path="/app" component={AppDashboard} />
      <Route path="/app/dashboard" component={AppDashboard} />
      <Route path="/app/employees" component={AppEmployees} />
      <Route path="/app/self-service" component={AppEmployeeSelfService} />
      <Route path="/app/analytics" component={AppAnalytics} />
      <Route path="/app/workflows" component={AppWorkflows} />
      <Route path="/app/announcements" component={AppAnnouncements} />
      <Route path="/app/time-off" component={AppTimeOff} />
      <Route path="/app/hr" component={CoreHR} />
      <Route path="/app/hr/core" component={CoreHR} />

      {/* App — Payroll Suite */}
      <Route path="/app/payroll" component={AppPayroll} />
      <Route path="/app/payroll-hub" component={AppPayrollHub} />
      <Route path="/app/benefits" component={AppBenefits} />

      {/* App — Talent Suite */}
      <Route path="/app/hiring" component={AppHiring} />
      <Route path="/app/learning" component={AppLearning} />
      <Route path="/app/performance" component={AppPerformance} />
      <Route path="/app/compensation" component={AppCompensation} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <ScrollToTop />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
