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

// Platform pages (marketing info)
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

// Auth
import Login from "@/pages/Login";
import DemoMode from "@/pages/DemoMode";

// Company Onboarding
import CompanyOnboarding from "./pages/app/CompanyOnboarding";

// Admin Platform pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminEmployeesPage from "./pages/admin/AdminEmployeesPage";
import AdminEmployeeProfilePage from "./pages/admin/EmployeeProfilePage";
import EditEmployeePage from "./pages/admin/EditEmployeePage";
import AdminOrgChartPage from "./pages/admin/AdminOrgChartPage";
import AddEmployeeFlow from "./pages/admin/AddEmployeeFlow";
import AdminDepartmentsPage from "./pages/admin/AdminDepartmentsPage";
import AdminInvitationsPage from "./pages/admin/AdminInvitationsPage";
import AdminRbacPage from "./pages/admin/AdminRbacPage";
import AdminTimeOffPage from "./pages/admin/AdminTimeOffPage";
import AdminFinanceOSPage from "@/pages/admin/AdminFinanceOSPage";
import EmployeeExpensesPage from "@/pages/employee/EmployeeExpensesPage";
import AdminPayrollHubPage from "./pages/admin/AdminPayrollHubPage";
import {
  AdminBenefitsPage,
  AdminHiringPage,
  AdminLearningPage,
  AdminPerformancePage,
  AdminGoalsPage,
  AdminCompensationPage,
  AdminAnnouncementsPage,
  AdminAnalyticsPage,
  AdminWorkflowsPage,
  AdminSsoPage,
} from "./pages/admin/AdminModulePages";

// Manager Platform pages
import ManagerDashboardPage from "./pages/manager/ManagerDashboardPage";
import ManagerTeamPage from "./pages/manager/ManagerTeamPage";
import ManagerTimeOffPage from "./pages/manager/ManagerTimeOffPage";
import ManagerGoalsPage from "./pages/manager/ManagerGoalsPage";
import ManagerPerformancePage from "./pages/manager/ManagerPerformancePage";
import ManagerFeedbackPage from "./pages/manager/ManagerFeedbackPage";

// Employee Platform pages
import EmployeeDashboardPage from "./pages/employee/EmployeeDashboardPage";
import EmployeeProfilePage from "./pages/employee/EmployeeProfilePage";
import EmployeeTimeOffPage from "./pages/employee/EmployeeTimeOffPage";
import EmployeeLearningPage from "./pages/employee/EmployeeLearningPage";
import EmployeeGoalsPage from "./pages/employee/EmployeeGoalsPage";
import EmployeeBenefitsPage from "./pages/employee/EmployeeBenefitsPage";
import EmployeeFeedbackPage from "./pages/employee/EmployeeFeedbackPage";
import EmployeePayslipsPage from "./pages/employee/EmployeePayslipsPage";
import EmployeeOnboardingPage from "./pages/employee/EmployeeOnboardingPage";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      {/* ── Marketing ── */}
      <Route path="/" component={LandingPage} />
      <Route path="/about" component={About} />
      <Route path="/book-demo" component={BookDemo} />
      <Route path="/pricing" component={Pricing} />

      {/* ── Platform (marketing info pages) ── */}
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

      {/* ── Solutions ── */}
      <Route path="/solutions/hr" component={ForHR} />
      <Route path="/solutions/managers" component={ForManagers} />
      <Route path="/solutions/employees" component={ForEmployees} />
      <Route path="/solutions/finance" component={ForFinance} />
      <Route path="/solutions/startups" component={Startups} />
      <Route path="/solutions/enterprise" component={Enterprise} />
      <Route path="/solutions/remote-teams" component={RemoteTeams} />

      {/* ── Resources ── */}
      <Route path="/resources/blog" component={Blog} />
      <Route path="/resources/guides" component={Guides} />
      <Route path="/resources/webinars" component={Webinars} />
      <Route path="/resources/help-center" component={HelpCenter} />
      <Route path="/resources/api-docs" component={ApiDocs} />

      {/* ── Auth ── */}
      <Route path="/login" component={Login} />
      <Route path="/demo" component={DemoMode} />

      {/* ── Company Onboarding ── */}
      <Route path="/onboarding" component={CompanyOnboarding} />

      {/* ══════════════════════════════════════════════
          ADMIN PLATFORM — /admin/*
          Full control: all modules, settings, RBAC
         ══════════════════════════════════════════════ */}
      <Route path="/admin" component={AdminDashboardPage} />
      <Route path="/admin/dashboard" component={AdminDashboardPage} />
      <Route path="/admin/employees" component={AdminEmployeesPage} />
      <Route path="/admin/employees/new" component={AddEmployeeFlow} />
      <Route path="/admin/employees/:id/edit" component={EditEmployeePage} />
      <Route path="/admin/employees/:id" component={AdminEmployeeProfilePage} />
      <Route path="/admin/org-chart" component={AdminOrgChartPage} />
      <Route path="/admin/employees/:id/change-role" component={AdminEmployeeProfilePage} />
      <Route path="/admin/employees/:id/assign-manager" component={AdminEmployeeProfilePage} />
      <Route path="/admin/departments" component={AdminDepartmentsPage} />
      <Route path="/admin/invitations" component={AdminInvitationsPage} />
      <Route path="/admin/rbac" component={AdminRbacPage} />
      <Route path="/admin/time-off" component={AdminTimeOffPage} />
      <Route path="/admin/payroll" component={AdminPayrollHubPage} />
      <Route path="/admin/payroll-hub" component={AdminPayrollHubPage} />
      <Route path="/admin/benefits" component={AdminBenefitsPage} />
      <Route path="/admin/hiring" component={AdminHiringPage} />
      <Route path="/admin/learning" component={AdminLearningPage} />
      <Route path="/admin/performance" component={AdminPerformancePage} />
      <Route path="/admin/goals" component={AdminGoalsPage} />
      <Route path="/admin/compensation" component={AdminCompensationPage} />
      <Route path="/admin/announcements" component={AdminAnnouncementsPage} />
      <Route path="/admin/analytics" component={AdminAnalyticsPage} />
      <Route path="/admin/workflows" component={AdminWorkflowsPage} />
      <Route path="/admin/sso" component={AdminSsoPage} />
      <Route path="/admin/finance" component={AdminFinanceOSPage} />

      {/* ══════════════════════════════════════════════
          MANAGER PLATFORM — /manager/*
          Team-centric: approvals, goals, reviews, feedback
         ══════════════════════════════════════════════ */}
      <Route path="/manager" component={ManagerDashboardPage} />
      <Route path="/manager/dashboard" component={ManagerDashboardPage} />
      <Route path="/manager/team" component={ManagerTeamPage} />
      <Route path="/manager/time-off" component={ManagerTimeOffPage} />
      <Route path="/manager/goals" component={ManagerGoalsPage} />
      <Route path="/manager/performance" component={ManagerPerformancePage} />
      <Route path="/manager/feedback" component={ManagerFeedbackPage} />

      {/* ══════════════════════════════════════════════
          EMPLOYEE PLATFORM — /employee/*
          Self-service: profile, leave, learning, goals, pay
         ══════════════════════════════════════════════ */}
      <Route path="/employee" component={EmployeeDashboardPage} />
      <Route path="/employee/dashboard" component={EmployeeDashboardPage} />
      <Route path="/employee/profile" component={EmployeeProfilePage} />
      <Route path="/employee/time-off" component={EmployeeTimeOffPage} />
      <Route path="/employee/learning" component={EmployeeLearningPage} />
      <Route path="/employee/goals" component={EmployeeGoalsPage} />
      <Route path="/employee/benefits" component={EmployeeBenefitsPage} />
      <Route path="/employee/feedback" component={EmployeeFeedbackPage} />
        <Route path="/employee/payslips" component={EmployeePayslipsPage} />
        <Route path="/employee/expenses" component={EmployeeExpensesPage} />
      <Route path="/employee/onboarding" component={EmployeeOnboardingPage} />

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
