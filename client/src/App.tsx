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
import EmployeeSelfService from "./pages/platform/EmployeeSelfService";
import DataAnalytics from "./pages/platform/DataAnalytics";
import Workflows from "./pages/platform/Workflows";
import GlobalPayroll from "./pages/platform/GlobalPayroll";
import PayrollHub from "./pages/platform/PayrollHub";
import Benefits from "./pages/platform/Benefits";
import Hiring from "./pages/platform/Hiring";
import Learning from "./pages/platform/Learning";
import PerformanceMgmt from "./pages/platform/PerformanceMgmt";
import Compensation from "./pages/platform/Compensation";

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

// App pages
import AppDashboard from "./pages/app/Dashboard";
import AppEmployees from "./pages/app/Employees";
import AppPayroll from "./pages/app/Payroll";
import AppPerformance from "./pages/app/Performance";
import AppAnalytics from "./pages/app/Analytics";
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

      {/* Platform */}
      <Route path="/platform" component={PlatformOverview} />
      <Route path="/platform/overview" component={PlatformOverview} />
      <Route path="/platform/employee-self-service" component={EmployeeSelfService} />
      <Route path="/platform/data-analytics" component={DataAnalytics} />
      <Route path="/platform/workflows" component={Workflows} />
      <Route path="/platform/global-payroll" component={GlobalPayroll} />
      <Route path="/platform/payroll-hub" component={PayrollHub} />
      <Route path="/platform/benefits" component={Benefits} />
      <Route path="/platform/hiring" component={Hiring} />
      <Route path="/platform/learning" component={Learning} />
      <Route path="/platform/performance" component={PerformanceMgmt} />
      <Route path="/platform/compensation" component={Compensation} />

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

      {/* App */}
      <Route path="/app" component={AppDashboard} />
      <Route path="/app/dashboard" component={AppDashboard} />
      <Route path="/app/employees" component={AppEmployees} />
      <Route path="/app/payroll" component={AppPayroll} />
      <Route path="/app/performance" component={AppPerformance} />
      <Route path="/app/analytics" component={AppAnalytics} />

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
