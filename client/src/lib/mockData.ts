// ============================================================
// SANI Lite — Mock Data
// Design: Warm Machine / Organic Modernism
// ============================================================

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "Active" | "On Leave" | "Offboarding";
  startDate: string;
  location: string;
  avatar: string;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  time: string;
  avatar: string;
}

export interface PayrollRecord {
  id: string;
  employee: string;
  department: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netPay: number;
  currency: string;
  status: "Processed" | "Pending" | "Failed";
  payDate: string;
}

export interface PerformanceReview {
  id: string;
  employee: string;
  department: string;
  rating: number;
  reviewer: string;
  status: "Completed" | "In Progress" | "Pending";
  cycle: string;
  goals: number;
  goalsCompleted: number;
}

// Unsplash avatar URLs for realistic mock data
const avatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face",
];

export const employees: Employee[] = [
  { id: "1", name: "Sarah Chen", email: "sarah.chen@sani.io", role: "VP of Engineering", department: "Engineering", status: "Active", startDate: "2022-03-15", location: "San Francisco", avatar: avatars[0] },
  { id: "2", name: "Marcus Johnson", email: "marcus.j@sani.io", role: "Product Designer", department: "Design", status: "Active", startDate: "2023-01-10", location: "New York", avatar: avatars[1] },
  { id: "3", name: "Emily Rodriguez", email: "emily.r@sani.io", role: "HR Manager", department: "People", status: "Active", startDate: "2022-06-01", location: "London", avatar: avatars[2] },
  { id: "4", name: "James Wilson", email: "james.w@sani.io", role: "Senior Engineer", department: "Engineering", status: "Active", startDate: "2022-09-20", location: "Berlin", avatar: avatars[3] },
  { id: "5", name: "Aisha Patel", email: "aisha.p@sani.io", role: "Marketing Lead", department: "Marketing", status: "On Leave", startDate: "2023-02-14", location: "Dubai", avatar: avatars[4] },
  { id: "6", name: "David Kim", email: "david.k@sani.io", role: "Data Scientist", department: "Engineering", status: "Active", startDate: "2023-05-08", location: "Singapore", avatar: avatars[5] },
  { id: "7", name: "Lisa Thompson", email: "lisa.t@sani.io", role: "Finance Director", department: "Finance", status: "Active", startDate: "2022-01-03", location: "San Francisco", avatar: avatars[6] },
  { id: "8", name: "Robert Martinez", email: "robert.m@sani.io", role: "DevOps Engineer", department: "Engineering", status: "Active", startDate: "2023-07-22", location: "Austin", avatar: avatars[7] },
  { id: "9", name: "Nina Kowalski", email: "nina.k@sani.io", role: "UX Researcher", department: "Design", status: "Active", startDate: "2023-04-11", location: "Warsaw", avatar: avatars[8] },
  { id: "10", name: "Tom Bradley", email: "tom.b@sani.io", role: "Sales Manager", department: "Sales", status: "Active", startDate: "2022-11-30", location: "London", avatar: avatars[9] },
  { id: "11", name: "Sophia Laurent", email: "sophia.l@sani.io", role: "Content Strategist", department: "Marketing", status: "Active", startDate: "2023-08-15", location: "Paris", avatar: avatars[10] },
  { id: "12", name: "Michael Chang", email: "michael.c@sani.io", role: "CTO", department: "Engineering", status: "Active", startDate: "2021-06-01", location: "San Francisco", avatar: avatars[11] },
];

export const recentActivity: Activity[] = [
  { id: "1", user: "Sarah Chen", action: "completed onboarding checklist", time: "10m ago", avatar: avatars[0] },
  { id: "2", user: "Marcus Johnson", action: "joined the Design team", time: "30m ago", avatar: avatars[1] },
  { id: "3", user: "Emily Rodriguez", action: "approved PTO request for Aisha Patel", time: "1h ago", avatar: avatars[2] },
  { id: "4", user: "David Kim", action: "was promoted to Senior Data Scientist", time: "2h ago", avatar: avatars[5] },
  { id: "5", user: "Lisa Thompson", action: "submitted Q1 budget report", time: "3h ago", avatar: avatars[6] },
  { id: "6", user: "Robert Martinez", action: "completed security training", time: "4h ago", avatar: avatars[7] },
];

export const payrollRecords: PayrollRecord[] = [
  { id: "1", employee: "Sarah Chen", department: "Engineering", baseSalary: 18500, bonus: 2000, deductions: 4200, netPay: 16300, currency: "USD", status: "Processed", payDate: "2026-03-28" },
  { id: "2", employee: "Marcus Johnson", department: "Design", baseSalary: 12000, bonus: 500, deductions: 2800, netPay: 9700, currency: "USD", status: "Processed", payDate: "2026-03-28" },
  { id: "3", employee: "Emily Rodriguez", department: "People", baseSalary: 10500, bonus: 0, deductions: 2400, netPay: 8100, currency: "GBP", status: "Pending", payDate: "2026-03-31" },
  { id: "4", employee: "James Wilson", department: "Engineering", baseSalary: 14000, bonus: 1500, deductions: 3600, netPay: 11900, currency: "EUR", status: "Processed", payDate: "2026-03-28" },
  { id: "5", employee: "Aisha Patel", department: "Marketing", baseSalary: 13000, bonus: 800, deductions: 3100, netPay: 10700, currency: "AED", status: "Pending", payDate: "2026-03-31" },
  { id: "6", employee: "David Kim", department: "Engineering", baseSalary: 15000, bonus: 1200, deductions: 3500, netPay: 12700, currency: "SGD", status: "Processed", payDate: "2026-03-28" },
  { id: "7", employee: "Lisa Thompson", department: "Finance", baseSalary: 16000, bonus: 2500, deductions: 4000, netPay: 14500, currency: "USD", status: "Processed", payDate: "2026-03-28" },
  { id: "8", employee: "Robert Martinez", department: "Engineering", baseSalary: 13500, bonus: 0, deductions: 3200, netPay: 10300, currency: "USD", status: "Failed", payDate: "2026-03-28" },
];

export const performanceReviews: PerformanceReview[] = [
  { id: "1", employee: "Sarah Chen", department: "Engineering", rating: 4.8, reviewer: "Michael Chang", status: "Completed", cycle: "Q1 2026", goals: 5, goalsCompleted: 5 },
  { id: "2", employee: "Marcus Johnson", department: "Design", rating: 4.5, reviewer: "Sarah Chen", status: "Completed", cycle: "Q1 2026", goals: 4, goalsCompleted: 3 },
  { id: "3", employee: "Emily Rodriguez", department: "People", rating: 4.2, reviewer: "Lisa Thompson", status: "In Progress", cycle: "Q1 2026", goals: 6, goalsCompleted: 4 },
  { id: "4", employee: "James Wilson", department: "Engineering", rating: 4.6, reviewer: "Sarah Chen", status: "Completed", cycle: "Q1 2026", goals: 5, goalsCompleted: 4 },
  { id: "5", employee: "Aisha Patel", department: "Marketing", rating: 3.9, reviewer: "Tom Bradley", status: "Pending", cycle: "Q1 2026", goals: 4, goalsCompleted: 2 },
  { id: "6", employee: "David Kim", department: "Engineering", rating: 4.7, reviewer: "Sarah Chen", status: "Completed", cycle: "Q1 2026", goals: 5, goalsCompleted: 5 },
  { id: "7", employee: "Lisa Thompson", department: "Finance", rating: 4.4, reviewer: "Michael Chang", status: "In Progress", cycle: "Q1 2026", goals: 4, goalsCompleted: 3 },
  { id: "8", employee: "Robert Martinez", department: "Engineering", rating: 4.1, reviewer: "Sarah Chen", status: "Completed", cycle: "Q1 2026", goals: 5, goalsCompleted: 3 },
];

// Chart data
export const headcountByMonth = [
  { month: "Apr", total: 186, newHires: 12 },
  { month: "May", total: 192, newHires: 8 },
  { month: "Jun", total: 198, newHires: 10 },
  { month: "Jul", total: 205, newHires: 11 },
  { month: "Aug", total: 212, newHires: 9 },
  { month: "Sep", total: 218, newHires: 8 },
  { month: "Oct", total: 225, newHires: 10 },
  { month: "Nov", total: 230, newHires: 7 },
  { month: "Dec", total: 234, newHires: 6 },
  { month: "Jan", total: 238, newHires: 8 },
  { month: "Feb", total: 243, newHires: 9 },
  { month: "Mar", total: 247, newHires: 12 },
];

export const departmentBreakdown = [
  { name: "Engineering", value: 99, color: "#0D9488" },
  { name: "Sales", value: 42, color: "#F59E0B" },
  { name: "Marketing", value: 35, color: "#8B5CF6" },
  { name: "People", value: 25, color: "#EC4899" },
  { name: "Finance", value: 22, color: "#06B6D4" },
  { name: "Design", value: 24, color: "#10B981" },
];

export const attritionData = [
  { month: "Apr", rate: 3.8 },
  { month: "May", rate: 3.5 },
  { month: "Jun", rate: 3.9 },
  { month: "Jul", rate: 3.2 },
  { month: "Aug", rate: 2.8 },
  { month: "Sep", rate: 3.1 },
  { month: "Oct", rate: 2.9 },
  { month: "Nov", rate: 3.4 },
  { month: "Dec", rate: 3.6 },
  { month: "Jan", rate: 3.3 },
  { month: "Feb", rate: 3.0 },
  { month: "Mar", rate: 3.2 },
];

export const engagementScores = [
  { month: "Apr", score: 72 },
  { month: "May", score: 74 },
  { month: "Jun", score: 73 },
  { month: "Jul", score: 76 },
  { month: "Aug", score: 78 },
  { month: "Sep", score: 77 },
  { month: "Oct", score: 80 },
  { month: "Nov", score: 79 },
  { month: "Dec", score: 81 },
  { month: "Jan", score: 82 },
  { month: "Feb", score: 84 },
  { month: "Mar", score: 85 },
];

export const payrollByCountry = [
  { country: "United States", employees: 98, totalPayroll: 1450000, currency: "USD" },
  { country: "United Kingdom", employees: 42, totalPayroll: 580000, currency: "GBP" },
  { country: "Germany", employees: 35, totalPayroll: 490000, currency: "EUR" },
  { country: "Singapore", employees: 28, totalPayroll: 420000, currency: "SGD" },
  { country: "UAE", employees: 22, totalPayroll: 380000, currency: "AED" },
  { country: "France", employees: 22, totalPayroll: 310000, currency: "EUR" },
];

// Stats
export const dashboardStats = {
  totalEmployees: 247,
  newHires: 12,
  attritionRate: 3.2,
  openPositions: 18,
  avgTenure: 2.4,
  engagementScore: 85,
};

// Testimonials for landing page
export const testimonials = [
  {
    quote: "SANI replaced four separate tools for us. Our HR team went from spending 60% of their time on admin to focusing on what matters — our people.",
    author: "Jessica Liu",
    role: "VP of People",
    company: "Meridian Health",
    avatar: avatars[0],
  },
  {
    quote: "The global payroll feature alone saved us $200K annually in integration costs. Running payroll across 12 countries from one dashboard is a game-changer.",
    author: "Thomas Bergmann",
    role: "CFO",
    company: "NovaTech GmbH",
    avatar: avatars[3],
  },
  {
    quote: "We evaluated HiBob, Rippling, and Deel. SANI won because of the AI insights and the fact that everything just works together natively.",
    author: "Priya Sharma",
    role: "Head of Operations",
    company: "Skyline Ventures",
    avatar: avatars[4],
  },
];

// Pricing tiers
export const pricingTiers = [
  {
    name: "Starter",
    price: 8,
    description: "For growing teams getting started with modern HR",
    features: [
      "Core HR & employee database",
      "Org chart & directory",
      "Leave management",
      "Basic reporting",
      "Employee self-service",
      "Up to 50 employees",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Growth",
    price: 16,
    description: "For scaling companies that need the full platform",
    features: [
      "Everything in Starter",
      "Global payroll (5 countries)",
      "Performance reviews & OKRs",
      "AI-powered insights",
      "Advanced analytics",
      "Custom workflows",
      "API access",
      "Up to 500 employees",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: null,
    description: "For large organizations with complex needs",
    features: [
      "Everything in Growth",
      "Unlimited global payroll",
      "IT & identity management",
      "Finance & spend management",
      "Custom integrations",
      "Dedicated success manager",
      "SLA & priority support",
      "SSO & advanced security",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

// Comparison data
export const comparisonData = [
  { feature: "Core HR", sani: true, hibob: true },
  { feature: "Native Global Payroll", sani: true, hibob: false },
  { feature: "IT & Identity Management", sani: true, hibob: false },
  { feature: "Finance & Spend Management", sani: true, hibob: false },
  { feature: "AI-Powered Insights", sani: true, hibob: false },
  { feature: "Predictive Analytics", sani: true, hibob: false },
  { feature: "Custom Workflow Builder", sani: true, hibob: true },
  { feature: "API-First Architecture", sani: true, hibob: false },
  { feature: "Self-Serve Onboarding", sani: true, hibob: false },
  { feature: "Real-Time Dashboards", sani: true, hibob: true },
];
