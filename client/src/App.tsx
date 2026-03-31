import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import LandingPage from "./pages/LandingPage";
import Platform from "./pages/marketing/Platform";
import Solutions from "./pages/marketing/Solutions";
import About from "./pages/marketing/About";
import Resources from "./pages/marketing/Resources";
import PricingPage from "./pages/marketing/Pricing";
import AppDashboard from "./pages/app/Dashboard";
import AppEmployees from "./pages/app/Employees";
import AppPayroll from "./pages/app/Payroll";
import AppPerformance from "./pages/app/Performance";
import AppAnalytics from "./pages/app/Analytics";

function Router() {
  return (
    <Switch>
      {/* Marketing pages */}
      <Route path="/" component={LandingPage} />
      <Route path="/platform" component={Platform} />
      <Route path="/solutions" component={Solutions} />
      <Route path="/about" component={About} />
      <Route path="/resources" component={Resources} />
      <Route path="/pricing" component={PricingPage} />

      {/* App pages */}
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
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
