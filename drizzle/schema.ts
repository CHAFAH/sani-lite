import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json } from "drizzle-orm/mysql-core";

// ============================================================
// CORE USERS TABLE (Global)
// ============================================================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: text("name"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["super_admin", "company_owner", "admin", "employee"]).default("employee").notNull(),
  companyId: int("companyId"), // NULL for super_admin or during signup
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// COMPANIES TABLE (Multi-Tenant)
// ============================================================
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 100 }),
  size: varchar("size", { length: 50 }),
  website: varchar("website", { length: 255 }),
  customDomain: varchar("customDomain", { length: 255 }).unique(),
  logoUrl: text("logoUrl"),
  primaryColor: varchar("primaryColor", { length: 7 }).default("#0D9488"),
  secondaryColor: varchar("secondaryColor", { length: 7 }).default("#F59E0B"),
  subscriptionTier: mysqlEnum("subscriptionTier", ["starter", "growth", "enterprise"]).default("starter").notNull(),
  status: mysqlEnum("status", ["onboarding", "active", "suspended", "cancelled"]).default("onboarding").notNull(),
  kycVerified: boolean("kycVerified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// ============================================================
// SUBSCRIPTIONS TABLE (Seat-Based)
// ============================================================
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  tier: mysqlEnum("tier", ["starter", "growth", "enterprise"]).notNull(),
  seats: int("seats").notNull(),
  usedSeats: int("usedSeats").default(0).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  billingCycle: mysqlEnum("billingCycle", ["monthly", "annual"]).default("monthly").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  status: mysqlEnum("status", ["active", "expired", "cancelled"]).default("active").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ============================================================
// SSO CONFIGURATION TABLE
// ============================================================
export const ssoConfigs = mysqlTable("sso_configs", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  provider: mysqlEnum("provider", ["google", "microsoft", "okta", "custom_oidc"]).notNull(),
  clientId: varchar("clientId", { length: 255 }).notNull(),
  clientSecret: text("clientSecret").notNull(),
  redirectUri: varchar("redirectUri", { length: 255 }).notNull(),
  enabled: boolean("enabled").default(true),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SsoConfig = typeof ssoConfigs.$inferSelect;
export type InsertSsoConfig = typeof ssoConfigs.$inferInsert;

// ============================================================
// EMPLOYEE PROFILES TABLE
// ============================================================
export const employeeProfiles = mysqlTable("employee_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  companyId: int("companyId").notNull(),
  employeeId: varchar("employeeId", { length: 50 }),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  department: varchar("department", { length: 100 }),
  position: varchar("position", { length: 100 }),
  manager: varchar("manager", { length: 100 }),
  managerId: int("managerId"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  employmentType: mysqlEnum("employmentType", ["full_time", "part_time", "contract", "temporary"]).default("full_time"),
  status: mysqlEnum("status", ["active", "inactive", "on_leave", "offboarded"]).default("active").notNull(),
  contractUrl: text("contractUrl"),
  profilePictureUrl: text("profilePictureUrl"),
  salary: decimal("salary", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmployeeProfile = typeof employeeProfiles.$inferSelect;
export type InsertEmployeeProfile = typeof employeeProfiles.$inferInsert;

// ============================================================
// EMPLOYEE DOCUMENTS TABLE
// ============================================================
export const employeeDocuments = mysqlTable("employee_documents", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  companyId: int("companyId").notNull(),
  documentType: mysqlEnum("documentType", ["employment_contract", "offer_letter", "nda", "handbook", "other"]).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  uploadedBy: int("uploadedBy").notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type EmployeeDocument = typeof employeeDocuments.$inferSelect;
export type InsertEmployeeDocument = typeof employeeDocuments.$inferInsert;

// ============================================================
// TIME-OFF REQUESTS TABLE
// ============================================================
export const timeOffRequests = mysqlTable("time_off_requests", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  employeeId: int("employeeId").notNull(),
  type: mysqlEnum("type", ["vacation", "sick", "personal", "parental", "bereavement", "other"]).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  days: int("days").notNull(),
  reason: text("reason"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "cancelled"]).default("pending").notNull(),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TimeOffRequest = typeof timeOffRequests.$inferSelect;
export type InsertTimeOffRequest = typeof timeOffRequests.$inferInsert;

// ============================================================
// WORKFLOWS TABLE (Automation Engine)
// ============================================================
export const workflows = mysqlTable("workflows", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  triggerType: mysqlEnum("triggerType", ["new_hire", "offboarding", "promotion", "time_off", "review_cycle", "custom"]).notNull(),
  steps: json("steps"), // Array of workflow step objects
  isActive: boolean("isActive").default(true),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = typeof workflows.$inferInsert;

// ============================================================
// WORKFLOW INSTANCES TABLE (Running workflows)
// ============================================================
export const workflowInstances = mysqlTable("workflow_instances", {
  id: int("id").autoincrement().primaryKey(),
  workflowId: int("workflowId").notNull(),
  companyId: int("companyId").notNull(),
  employeeId: int("employeeId"),
  currentStep: int("currentStep").default(0).notNull(),
  status: mysqlEnum("status", ["in_progress", "completed", "cancelled", "paused"]).default("in_progress").notNull(),
  data: json("data"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorkflowInstance = typeof workflowInstances.$inferSelect;
export type InsertWorkflowInstance = typeof workflowInstances.$inferInsert;

// ============================================================
// PAYROLL RECORDS TABLE
// ============================================================
export const payrollRecords = mysqlTable("payroll_records", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  employeeId: int("employeeId").notNull(),
  payrollCycle: varchar("payrollCycle", { length: 50 }).notNull(),
  baseSalary: decimal("baseSalary", { precision: 12, scale: 2 }).notNull(),
  grossPay: decimal("grossPay", { precision: 12, scale: 2 }).notNull(),
  deductions: decimal("deductions", { precision: 12, scale: 2 }).default("0"),
  netPay: decimal("netPay", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  country: varchar("country", { length: 100 }),
  status: mysqlEnum("status", ["draft", "approved", "processed", "paid"]).default("draft").notNull(),
  paymentDate: timestamp("paymentDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PayrollRecord = typeof payrollRecords.$inferSelect;
export type InsertPayrollRecord = typeof payrollRecords.$inferInsert;

// ============================================================
// PAYROLL CYCLES TABLE
// ============================================================
export const payrollCycles = mysqlTable("payroll_cycles", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  payDate: timestamp("payDate").notNull(),
  status: mysqlEnum("status", ["draft", "processing", "approved", "paid", "cancelled"]).default("draft").notNull(),
  totalGross: decimal("totalGross", { precision: 14, scale: 2 }).default("0"),
  totalNet: decimal("totalNet", { precision: 14, scale: 2 }).default("0"),
  totalDeductions: decimal("totalDeductions", { precision: 14, scale: 2 }).default("0"),
  employeeCount: int("employeeCount").default(0),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PayrollCycle = typeof payrollCycles.$inferSelect;
export type InsertPayrollCycle = typeof payrollCycles.$inferInsert;

// ============================================================
// BENEFIT PLANS TABLE
// ============================================================
export const benefitPlans = mysqlTable("benefit_plans", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["health", "dental", "vision", "life", "retirement", "wellness", "other"]).notNull(),
  description: text("description"),
  provider: varchar("provider", { length: 255 }),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  employerContribution: decimal("employerContribution", { precision: 10, scale: 2 }),
  isActive: boolean("isActive").default(true),
  eligibility: varchar("eligibility", { length: 255 }).default("all_employees"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BenefitPlan = typeof benefitPlans.$inferSelect;
export type InsertBenefitPlan = typeof benefitPlans.$inferInsert;

// ============================================================
// BENEFIT ENROLLMENTS TABLE
// ============================================================
export const benefitEnrollments = mysqlTable("benefit_enrollments", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  employeeId: int("employeeId").notNull(),
  planId: int("planId").notNull(),
  status: mysqlEnum("status", ["enrolled", "pending", "waived", "terminated"]).default("pending").notNull(),
  enrolledAt: timestamp("enrolledAt"),
  effectiveDate: timestamp("effectiveDate"),
  terminationDate: timestamp("terminationDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BenefitEnrollment = typeof benefitEnrollments.$inferSelect;
export type InsertBenefitEnrollment = typeof benefitEnrollments.$inferInsert;

// ============================================================
// PERFORMANCE REVIEWS TABLE
// ============================================================
export const performanceReviews = mysqlTable("performance_reviews", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  employeeId: int("employeeId").notNull(),
  reviewerId: int("reviewerId").notNull(),
  reviewPeriod: varchar("reviewPeriod", { length: 50 }).notNull(),
  rating: int("rating"),
  comments: text("comments"),
  goals: json("goals"),
  strengths: text("strengths"),
  improvements: text("improvements"),
  status: mysqlEnum("status", ["draft", "submitted", "completed"]).default("draft").notNull(),
  submittedAt: timestamp("submittedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PerformanceReview = typeof performanceReviews.$inferSelect;
export type InsertPerformanceReview = typeof performanceReviews.$inferInsert;

// ============================================================
// GOALS / OKRs TABLE
// ============================================================
export const goals = mysqlTable("goals", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  employeeId: int("employeeId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["individual", "team", "company"]).default("individual").notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed", "cancelled"]).default("not_started").notNull(),
  progress: int("progress").default(0),
  dueDate: timestamp("dueDate"),
  parentGoalId: int("parentGoalId"),
  period: varchar("period", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = typeof goals.$inferInsert;

// ============================================================
// JOB POSTINGS TABLE (Hiring)
// ============================================================
export const jobPostings = mysqlTable("job_postings", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  department: varchar("department", { length: 100 }),
  location: varchar("location", { length: 255 }),
  type: mysqlEnum("type", ["full_time", "part_time", "contract", "internship"]).default("full_time"),
  description: text("description"),
  requirements: text("requirements"),
  salaryMin: decimal("salaryMin", { precision: 12, scale: 2 }),
  salaryMax: decimal("salaryMax", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  status: mysqlEnum("status", ["draft", "open", "closed", "on_hold"]).default("draft").notNull(),
  hiringManagerId: int("hiringManagerId"),
  applicantCount: int("applicantCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JobPosting = typeof jobPostings.$inferSelect;
export type InsertJobPosting = typeof jobPostings.$inferInsert;

// ============================================================
// HIRING RECORDS TABLE (Applicant Tracking)
// ============================================================
export const hiringRecords = mysqlTable("hiring_records", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  jobPostingId: int("jobPostingId"),
  jobTitle: varchar("jobTitle", { length: 255 }).notNull(),
  department: varchar("department", { length: 100 }),
  candidateName: varchar("candidateName", { length: 255 }).notNull(),
  candidateEmail: varchar("candidateEmail", { length: 320 }).notNull(),
  candidatePhone: varchar("candidatePhone", { length: 20 }),
  resumeUrl: text("resumeUrl"),
  source: varchar("source", { length: 100 }),
  status: mysqlEnum("status", ["applied", "screening", "interview", "offer", "hired", "rejected"]).default("applied").notNull(),
  stage: int("stage").default(1),
  interviewDate: timestamp("interviewDate"),
  notes: text("notes"),
  rating: int("rating"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HiringRecord = typeof hiringRecords.$inferSelect;
export type InsertHiringRecord = typeof hiringRecords.$inferInsert;

// ============================================================
// COURSES TABLE (Learning)
// ============================================================
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  duration: int("duration"), // in minutes
  type: mysqlEnum("type", ["required", "optional", "recommended"]).default("optional"),
  contentUrl: text("contentUrl"),
  thumbnailUrl: text("thumbnailUrl"),
  isActive: boolean("isActive").default(true),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

// ============================================================
// COURSE ASSIGNMENTS TABLE
// ============================================================
export const courseAssignments = mysqlTable("course_assignments", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  courseId: int("courseId").notNull(),
  employeeId: int("employeeId").notNull(),
  status: mysqlEnum("status", ["assigned", "in_progress", "completed", "overdue"]).default("assigned").notNull(),
  progress: int("progress").default(0),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  assignedBy: int("assignedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CourseAssignment = typeof courseAssignments.$inferSelect;
export type InsertCourseAssignment = typeof courseAssignments.$inferInsert;

// ============================================================
// COMPENSATION TABLE
// ============================================================
export const compensationRecords = mysqlTable("compensation_records", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  employeeId: int("employeeId").notNull(),
  type: mysqlEnum("type", ["base_salary", "bonus", "equity", "commission", "adjustment"]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  effectiveDate: timestamp("effectiveDate").notNull(),
  endDate: timestamp("endDate"),
  reason: text("reason"),
  approvedBy: int("approvedBy"),
  status: mysqlEnum("status", ["pending", "approved", "active", "expired"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CompensationRecord = typeof compensationRecords.$inferSelect;
export type InsertCompensationRecord = typeof compensationRecords.$inferInsert;

// ============================================================
// SALARY BANDS TABLE
// ============================================================
export const salaryBands = mysqlTable("salary_bands", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  level: varchar("level", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  department: varchar("department", { length: 100 }),
  minSalary: decimal("minSalary", { precision: 12, scale: 2 }).notNull(),
  midSalary: decimal("midSalary", { precision: 12, scale: 2 }).notNull(),
  maxSalary: decimal("maxSalary", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SalaryBand = typeof salaryBands.$inferSelect;
export type InsertSalaryBand = typeof salaryBands.$inferInsert;

// ============================================================
// ANNOUNCEMENTS TABLE
// ============================================================
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["general", "urgent", "celebration", "policy"]).default("general").notNull(),
  authorId: int("authorId").notNull(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

// ============================================================
// DEMO LEADS TABLE (Legacy)
// ============================================================
export const demoLeads = mysqlTable("demo_leads", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  jobTitle: varchar("jobTitle", { length: 255 }),
  companySize: varchar("companySize", { length: 50 }),
  primaryInterest: varchar("primaryInterest", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DemoLead = typeof demoLeads.$inferSelect;
export type InsertDemoLead = typeof demoLeads.$inferInsert;
