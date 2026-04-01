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
  size: varchar("size", { length: 50 }), // e.g., "1-50", "51-200", "201-500", "501-1000", "1000+"
  website: varchar("website", { length: 255 }),
  customDomain: varchar("customDomain", { length: 255 }).unique(), // e.g., "acme.sani.app"
  logoUrl: text("logoUrl"), // S3 URL
  primaryColor: varchar("primaryColor", { length: 7 }).default("#0D9488"), // Hex color
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
  seats: int("seats").notNull(), // Total seats available
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
  clientSecret: text("clientSecret").notNull(), // Encrypted in production
  redirectUri: varchar("redirectUri", { length: 255 }).notNull(),
  enabled: boolean("enabled").default(true),
  metadata: json("metadata"), // Additional provider-specific config
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
  employeeId: varchar("employeeId", { length: 50 }), // Unique within company
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  department: varchar("department", { length: 100 }),
  position: varchar("position", { length: 100 }),
  manager: varchar("manager", { length: 100 }), // Manager name or ID
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"), // NULL if still employed
  employmentType: mysqlEnum("employmentType", ["full_time", "part_time", "contract", "temporary"]).default("full_time"),
  status: mysqlEnum("status", ["active", "inactive", "on_leave", "offboarded"]).default("active").notNull(),
  contractUrl: text("contractUrl"), // S3 URL to employment contract
  profilePictureUrl: text("profilePictureUrl"), // S3 URL
  metadata: json("metadata"), // Additional custom fields
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
  fileUrl: text("fileUrl").notNull(), // S3 URL
  uploadedBy: int("uploadedBy").notNull(), // User ID
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type EmployeeDocument = typeof employeeDocuments.$inferSelect;
export type InsertEmployeeDocument = typeof employeeDocuments.$inferInsert;

// ============================================================
// PAYROLL RECORDS TABLE
// ============================================================
export const payrollRecords = mysqlTable("payroll_records", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  employeeId: int("employeeId").notNull(),
  payrollCycle: varchar("payrollCycle", { length: 50 }).notNull(), // e.g., "2026-03-01 to 2026-03-31"
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
// PERFORMANCE REVIEWS TABLE
// ============================================================
export const performanceReviews = mysqlTable("performance_reviews", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  employeeId: int("employeeId").notNull(),
  reviewerId: int("reviewerId").notNull(), // User ID of reviewer
  reviewPeriod: varchar("reviewPeriod", { length: 50 }).notNull(), // e.g., "Q1 2026"
  rating: int("rating"), // 1-5
  comments: text("comments"),
  goals: json("goals"), // Array of goal objects
  status: mysqlEnum("status", ["draft", "submitted", "completed"]).default("draft").notNull(),
  submittedAt: timestamp("submittedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PerformanceReview = typeof performanceReviews.$inferSelect;
export type InsertPerformanceReview = typeof performanceReviews.$inferInsert;

// ============================================================
// HIRING RECORDS TABLE
// ============================================================
export const hiringRecords = mysqlTable("hiring_records", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  jobTitle: varchar("jobTitle", { length: 255 }).notNull(),
  department: varchar("department", { length: 100 }),
  candidateName: varchar("candidateName", { length: 255 }).notNull(),
  candidateEmail: varchar("candidateEmail", { length: 320 }).notNull(),
  status: mysqlEnum("status", ["applied", "screening", "interview", "offer", "hired", "rejected"]).default("applied").notNull(),
  stage: int("stage").default(1), // Current stage in pipeline
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HiringRecord = typeof hiringRecords.$inferSelect;
export type InsertHiringRecord = typeof hiringRecords.$inferInsert;

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
