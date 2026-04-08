import { eq, and, sql, desc, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  InsertDemoLead, demoLeads,
  InsertCompany, companies,
  InsertSubscription, subscriptions,
  InsertEmployeeProfile, employeeProfiles,
  InsertEmployeeDocument, employeeDocuments,
  InsertPayrollRecord, payrollRecords,
  InsertPerformanceReview, performanceReviews,
  InsertHiringRecord, hiringRecords,
  InsertSsoConfig, ssoConfigs,
  InsertTimeOffRequest, timeOffRequests,
  InsertWorkflow, workflows,
  InsertWorkflowInstance, workflowInstances,
  InsertPayrollCycle, payrollCycles,
  InsertBenefitPlan, benefitPlans,
  InsertBenefitEnrollment, benefitEnrollments,
  InsertGoal, goals,
  InsertJobPosting, jobPostings,
  InsertCourse, courses,
  InsertCourseAssignment, courseAssignments,
  InsertCompensationRecord, compensationRecords,
  InsertSalaryBand, salaryBands,
  InsertAnnouncement, announcements,
  expenses, corporateCards, cardTransactions, budgets,
  devices, appProvisioning, accessControl,
  predictions, recommendations, aiChatHistory,
  apiKeys, webhooks, webhookEvents, marketplaceApps, marketplaceInstallations,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// Helper to get insertId from MySQL result
function extractInsertId(result: any): number {
  return (result as any).insertId || (result as any)[0]?.insertId || 0;
}

// ============================================================
// USER QUERIES
// ============================================================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId, email: user.email || "" };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      (values as Record<string, any>)[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

// ============================================================
// COMPANY QUERIES
// ============================================================
export async function createCompany(company: InsertCompany) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(companies).values(company);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(companies).orderBy(desc(companies.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getCompanyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return result[0];
}

export async function updateCompany(id: number, updates: Partial<InsertCompany>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(companies).set(updates).where(eq(companies.id, id));
}

// ============================================================
// SUBSCRIPTION QUERIES
// ============================================================
export async function createSubscription(subscription: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(subscriptions).values(subscription);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(subscriptions).orderBy(desc(subscriptions.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getSubscriptionByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.companyId, companyId)).limit(1);
  return result[0];
}

export async function checkSeatAvailability(companyId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const subscription = await getSubscriptionByCompanyId(companyId);
  if (!subscription) return false;
  return subscription.usedSeats < subscription.seats;
}

// ============================================================
// EMPLOYEE PROFILE QUERIES
// ============================================================
export async function createEmployeeProfile(profile: InsertEmployeeProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(employeeProfiles).values(profile);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(employeeProfiles).orderBy(desc(employeeProfiles.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getEmployeesByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employeeProfiles).where(eq(employeeProfiles.companyId, companyId));
}

export async function getEmployeeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(employeeProfiles).where(eq(employeeProfiles.id, id)).limit(1);
  return result[0];
}

export async function updateEmployeeProfile(id: number, updates: Partial<InsertEmployeeProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(employeeProfiles).set(updates).where(eq(employeeProfiles.id, id));
}

export async function deleteEmployee(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(employeeProfiles).where(eq(employeeProfiles.id, id));
}

export async function getEmployeeCountByDepartment(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    department: employeeProfiles.department,
    count: count(),
  }).from(employeeProfiles)
    .where(eq(employeeProfiles.companyId, companyId))
    .groupBy(employeeProfiles.department);
}

// ============================================================
// EMPLOYEE DOCUMENT QUERIES
// ============================================================
export async function uploadEmployeeDocument(doc: InsertEmployeeDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(employeeDocuments).values(doc);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(employeeDocuments).orderBy(desc(employeeDocuments.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getEmployeeDocuments(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employeeDocuments).where(eq(employeeDocuments.employeeId, employeeId));
}

// ============================================================
// TIME-OFF REQUEST QUERIES
// ============================================================
export async function createTimeOffRequest(request: InsertTimeOffRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(timeOffRequests).values(request);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(timeOffRequests).orderBy(desc(timeOffRequests.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getTimeOffByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(timeOffRequests).where(eq(timeOffRequests.companyId, companyId)).orderBy(desc(timeOffRequests.createdAt));
}

export async function getTimeOffByEmployeeId(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(timeOffRequests).where(eq(timeOffRequests.employeeId, employeeId)).orderBy(desc(timeOffRequests.createdAt));
}

export async function updateTimeOffRequest(id: number, updates: Partial<InsertTimeOffRequest>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(timeOffRequests).set(updates).where(eq(timeOffRequests.id, id));
}

// ============================================================
// WORKFLOW QUERIES
// ============================================================
export async function createWorkflow(workflow: InsertWorkflow) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(workflows).values(workflow);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(workflows).orderBy(desc(workflows.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getWorkflowsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workflows).where(eq(workflows.companyId, companyId));
}

export async function getWorkflowById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(workflows).where(eq(workflows.id, id)).limit(1);
  return result[0];
}

export async function updateWorkflow(id: number, updates: Partial<InsertWorkflow>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(workflows).set(updates).where(eq(workflows.id, id));
}

export async function deleteWorkflow(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(workflows).where(eq(workflows.id, id));
}

export async function createWorkflowInstance(instance: InsertWorkflowInstance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(workflowInstances).values(instance);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(workflowInstances).orderBy(desc(workflowInstances.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getWorkflowInstancesByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workflowInstances).where(eq(workflowInstances.companyId, companyId)).orderBy(desc(workflowInstances.startedAt));
}

export async function updateWorkflowInstance(id: number, updates: Partial<InsertWorkflowInstance>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(workflowInstances).set(updates).where(eq(workflowInstances.id, id));
}

// ============================================================
// PAYROLL QUERIES
// ============================================================
export async function createPayrollRecord(record: InsertPayrollRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(payrollRecords).values(record);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(payrollRecords).orderBy(desc(payrollRecords.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getPayrollByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payrollRecords).where(eq(payrollRecords.companyId, companyId)).orderBy(desc(payrollRecords.createdAt));
}

export async function updatePayrollRecord(id: number, updates: Partial<InsertPayrollRecord>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(payrollRecords).set(updates).where(eq(payrollRecords.id, id));
}

// ============================================================
// PAYROLL CYCLE QUERIES
// ============================================================
export async function createPayrollCycle(cycle: InsertPayrollCycle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(payrollCycles).values(cycle);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(payrollCycles).orderBy(desc(payrollCycles.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getPayrollCyclesByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payrollCycles).where(eq(payrollCycles.companyId, companyId)).orderBy(desc(payrollCycles.periodStart));
}

export async function updatePayrollCycle(id: number, updates: Partial<InsertPayrollCycle>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(payrollCycles).set(updates).where(eq(payrollCycles.id, id));
}

// ============================================================
// BENEFIT PLAN QUERIES
// ============================================================
export async function createBenefitPlan(plan: InsertBenefitPlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(benefitPlans).values(plan);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(benefitPlans).orderBy(desc(benefitPlans.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getBenefitPlansByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(benefitPlans).where(eq(benefitPlans.companyId, companyId));
}

export async function updateBenefitPlan(id: number, updates: Partial<InsertBenefitPlan>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(benefitPlans).set(updates).where(eq(benefitPlans.id, id));
}

export async function deleteBenefitPlan(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(benefitPlans).where(eq(benefitPlans.id, id));
}

// ============================================================
// BENEFIT ENROLLMENT QUERIES
// ============================================================
export async function createBenefitEnrollment(enrollment: InsertBenefitEnrollment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(benefitEnrollments).values(enrollment);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(benefitEnrollments).orderBy(desc(benefitEnrollments.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getBenefitEnrollmentsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(benefitEnrollments).where(eq(benefitEnrollments.companyId, companyId));
}

export async function getBenefitEnrollmentsByEmployeeId(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(benefitEnrollments).where(eq(benefitEnrollments.employeeId, employeeId));
}

export async function updateBenefitEnrollment(id: number, updates: Partial<InsertBenefitEnrollment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(benefitEnrollments).set(updates).where(eq(benefitEnrollments.id, id));
}

// ============================================================
// PERFORMANCE REVIEW QUERIES
// ============================================================
export async function createPerformanceReview(review: InsertPerformanceReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(performanceReviews).values(review);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(performanceReviews).orderBy(desc(performanceReviews.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getPerformanceReviewsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(performanceReviews).where(eq(performanceReviews.companyId, companyId)).orderBy(desc(performanceReviews.createdAt));
}

export async function updatePerformanceReview(id: number, updates: Partial<InsertPerformanceReview>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(performanceReviews).set(updates).where(eq(performanceReviews.id, id));
}

// ============================================================
// GOALS / OKR QUERIES
// ============================================================
export async function createGoal(goal: InsertGoal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(goals).values(goal);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(goals).orderBy(desc(goals.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getGoalsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(goals).where(eq(goals.companyId, companyId));
}

export async function getGoalsByEmployeeId(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(goals).where(eq(goals.employeeId, employeeId));
}

export async function updateGoal(id: number, updates: Partial<InsertGoal>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(goals).set(updates).where(eq(goals.id, id));
}

export async function deleteGoal(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(goals).where(eq(goals.id, id));
}

// ============================================================
// JOB POSTING QUERIES
// ============================================================
export async function createJobPosting(posting: InsertJobPosting) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(jobPostings).values(posting);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(jobPostings).orderBy(desc(jobPostings.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getJobPostingsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobPostings).where(eq(jobPostings.companyId, companyId)).orderBy(desc(jobPostings.createdAt));
}

export async function updateJobPosting(id: number, updates: Partial<InsertJobPosting>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(jobPostings).set(updates).where(eq(jobPostings.id, id));
}

export async function deleteJobPosting(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(jobPostings).where(eq(jobPostings.id, id));
}

// ============================================================
// HIRING QUERIES
// ============================================================
export async function createHiringRecord(record: InsertHiringRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(hiringRecords).values(record);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(hiringRecords).orderBy(desc(hiringRecords.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getHiringByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(hiringRecords).where(eq(hiringRecords.companyId, companyId)).orderBy(desc(hiringRecords.createdAt));
}

export async function updateHiringRecord(id: number, updates: Partial<InsertHiringRecord>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(hiringRecords).set(updates).where(eq(hiringRecords.id, id));
}

export async function deleteHiringRecord(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(hiringRecords).where(eq(hiringRecords.id, id));
}

// ============================================================
// COURSE QUERIES (Learning)
// ============================================================
export async function createCourse(course: InsertCourse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(courses).values(course);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(courses).orderBy(desc(courses.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getCoursesByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses).where(eq(courses.companyId, companyId));
}

export async function updateCourse(id: number, updates: Partial<InsertCourse>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(courses).set(updates).where(eq(courses.id, id));
}

export async function deleteCourse(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(courses).where(eq(courses.id, id));
}

// ============================================================
// COURSE ASSIGNMENT QUERIES
// ============================================================
export async function createCourseAssignment(assignment: InsertCourseAssignment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(courseAssignments).values(assignment);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(courseAssignments).orderBy(desc(courseAssignments.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getCourseAssignmentsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courseAssignments).where(eq(courseAssignments.companyId, companyId));
}

export async function getCourseAssignmentsByEmployeeId(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courseAssignments).where(eq(courseAssignments.employeeId, employeeId));
}

export async function updateCourseAssignment(id: number, updates: Partial<InsertCourseAssignment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(courseAssignments).set(updates).where(eq(courseAssignments.id, id));
}

// ============================================================
// COMPENSATION QUERIES
// ============================================================
export async function createCompensationRecord(record: InsertCompensationRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(compensationRecords).values(record);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(compensationRecords).orderBy(desc(compensationRecords.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getCompensationByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(compensationRecords).where(eq(compensationRecords.companyId, companyId)).orderBy(desc(compensationRecords.effectiveDate));
}

export async function getCompensationByEmployeeId(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(compensationRecords).where(eq(compensationRecords.employeeId, employeeId)).orderBy(desc(compensationRecords.effectiveDate));
}

export async function updateCompensationRecord(id: number, updates: Partial<InsertCompensationRecord>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(compensationRecords).set(updates).where(eq(compensationRecords.id, id));
}

// ============================================================
// SALARY BAND QUERIES
// ============================================================
export async function createSalaryBand(band: InsertSalaryBand) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(salaryBands).values(band);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(salaryBands).orderBy(desc(salaryBands.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getSalaryBandsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(salaryBands).where(eq(salaryBands.companyId, companyId));
}

export async function updateSalaryBand(id: number, updates: Partial<InsertSalaryBand>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(salaryBands).set(updates).where(eq(salaryBands.id, id));
}

export async function deleteSalaryBand(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(salaryBands).where(eq(salaryBands.id, id));
}

// ============================================================
// ANNOUNCEMENT QUERIES
// ============================================================
export async function createAnnouncement(announcement: InsertAnnouncement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(announcements).values(announcement);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(announcements).orderBy(desc(announcements.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getAnnouncementsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(announcements).where(eq(announcements.companyId, companyId)).orderBy(desc(announcements.createdAt));
}

export async function updateAnnouncement(id: number, updates: Partial<InsertAnnouncement>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(announcements).set(updates).where(eq(announcements.id, id));
}

export async function deleteAnnouncement(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(announcements).where(eq(announcements.id, id));
}

// ============================================================
// DEMO LEADS (Legacy)
// ============================================================
export async function createDemoLead(lead: InsertDemoLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(demoLeads).values(lead);
}

// ============================================================
// SSO CONFIGURATION QUERIES
// ============================================================
export async function getSsoConfigsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ssoConfigs).where(eq(ssoConfigs.companyId, companyId));
}

export async function getSsoConfigById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(ssoConfigs).where(eq(ssoConfigs.id, id)).limit(1);
  return result[0];
}

export async function createSsoConfig(config: InsertSsoConfig) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(ssoConfigs).values(config);
  const insertId = extractInsertId(result);
  if (insertId > 0) return { insertId };
  const created = await db.select().from(ssoConfigs)
    .where(eq(ssoConfigs.companyId, config.companyId))
    .orderBy(desc(ssoConfigs.id))
    .limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function updateSsoConfig(id: number, updates: Partial<InsertSsoConfig>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(ssoConfigs).set(updates).where(eq(ssoConfigs.id, id));
}

export async function deleteSsoConfig(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(ssoConfigs).where(eq(ssoConfigs.id, id));
}

// ============================================================
// DEPARTMENT QUERIES
// ============================================================
import { 
  InsertDepartment, departments,
  InsertCustomRole, customRoles,
  InsertPermission, permissions,
  InsertRolePermission, rolePermissions,
  InsertUserRoleAssignment, userRoleAssignments,
  InsertEmployeePersonalDetail, employeePersonalDetails,
  InsertInvitation, invitations,
  InsertFeedback, feedbacks,
} from "../drizzle/schema";

export async function createDepartment(dept: InsertDepartment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(departments).values(dept);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(departments).orderBy(desc(departments.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getDepartmentsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(departments).where(eq(departments.companyId, companyId));
}

export async function updateDepartment(id: number, updates: Partial<InsertDepartment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(departments).set(updates).where(eq(departments.id, id));
}

export async function deleteDepartment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(departments).where(eq(departments.id, id));
}

// ============================================================
// CUSTOM ROLES QUERIES (RBAC)
// ============================================================
export async function createCustomRole(role: InsertCustomRole) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(customRoles).values(role);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(customRoles).orderBy(desc(customRoles.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getCustomRolesByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customRoles).where(eq(customRoles.companyId, companyId));
}

export async function updateCustomRole(id: number, updates: Partial<InsertCustomRole>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(customRoles).set(updates).where(eq(customRoles.id, id));
}

export async function deleteCustomRole(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(customRoles).where(eq(customRoles.id, id));
}

// ============================================================
// PERMISSIONS QUERIES
// ============================================================
export async function createPermission(perm: InsertPermission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(permissions).values(perm);
}

export async function getAllPermissions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(permissions);
}

export async function assignPermissionToRole(rp: InsertRolePermission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(rolePermissions).values(rp);
}

export async function removePermissionFromRole(roleId: number, permissionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(rolePermissions).where(and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permissionId, permissionId)));
}

export async function getPermissionsByRoleId(roleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rolePermissions).where(eq(rolePermissions.roleId, roleId));
}

// ============================================================
// USER ROLE ASSIGNMENT QUERIES
// ============================================================
export async function assignRoleToUser(assignment: InsertUserRoleAssignment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(userRoleAssignments).values(assignment);
}

export async function getUserRoleAssignments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userRoleAssignments).where(eq(userRoleAssignments.userId, userId));
}

export async function removeRoleFromUser(userId: number, roleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(userRoleAssignments).where(and(eq(userRoleAssignments.userId, userId), eq(userRoleAssignments.customRoleId, roleId)));
}

// ============================================================
// EMPLOYEE PERSONAL DETAILS QUERIES
// ============================================================
export async function upsertPersonalDetails(details: InsertEmployeePersonalDetail) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Check if exists
  const existing = await db.select().from(employeePersonalDetails).where(eq(employeePersonalDetails.employeeId, details.employeeId)).limit(1);
  if (existing.length > 0) {
    await db.update(employeePersonalDetails).set(details).where(eq(employeePersonalDetails.employeeId, details.employeeId));
    return { id: existing[0].id };
  }
  const result = await db.insert(employeePersonalDetails).values(details);
  const id = extractInsertId(result);
  return { id: id > 0 ? id : 0 };
}

export async function getPersonalDetailsByEmployeeId(employeeId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(employeePersonalDetails).where(eq(employeePersonalDetails.employeeId, employeeId)).limit(1);
  return result[0];
}

// ============================================================
// INVITATION QUERIES
// ============================================================
export async function createInvitation(invitation: InsertInvitation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(invitations).values(invitation);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(invitations).orderBy(desc(invitations.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getInvitationsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invitations).where(eq(invitations.companyId, companyId)).orderBy(desc(invitations.createdAt));
}

export async function getInvitationByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(invitations).where(eq(invitations.token, token)).limit(1);
  return result[0];
}

export async function updateInvitation(id: number, updates: Partial<InsertInvitation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(invitations).set(updates).where(eq(invitations.id, id));
}

// ============================================================
// FEEDBACK QUERIES
// ============================================================
export async function createFeedback(feedback: InsertFeedback) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(feedbacks).values(feedback);
  const id = extractInsertId(result);
  if (id > 0) return { insertId: id };
  const created = await db.select().from(feedbacks).orderBy(desc(feedbacks.id)).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getFeedbackByEmployeeId(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(feedbacks).where(eq(feedbacks.toEmployeeId, employeeId)).orderBy(desc(feedbacks.createdAt));
}

export async function getFeedbackByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(feedbacks).where(eq(feedbacks.companyId, companyId)).orderBy(desc(feedbacks.createdAt));
}

// ============================================================
// EMPLOYEE BY USER ID
// ============================================================
export async function getEmployeeByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(employeeProfiles).where(eq(employeeProfiles.userId, userId)).limit(1);
  return result[0];
}

// ============================================================
// EMPLOYEES BY MANAGER ID (for manager view)
// ============================================================
export async function getEmployeesByManagerId(managerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employeeProfiles).where(eq(employeeProfiles.managerId, managerId));
}

// ============================================================
// UPDATE USER ROLE
// ============================================================
export async function updateUserRole(userId: number, role: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(users).set({ role: role as any }).where(eq(users.id, userId));
}

export async function updateUserProfileCompleted(userId: number, completed: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(users).set({ profileCompleted: completed }).where(eq(users.id, userId));
}

export async function setUserCompanyId(openId: string, companyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(users).set({ companyId }).where(eq(users.openId, openId));
}

export async function getUsersByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).where(eq(users.companyId, companyId));
}


// ============================================================
// FINANCE OS HELPERS
// ============================================================

// Expenses
export async function createExpense(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(expenses).values(data);
  return extractInsertId(result);
}

export async function getExpensesByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenses).where(eq(expenses.companyId, companyId));
}

export async function getExpensesByEmployeeId(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenses).where(eq(expenses.employeeId, employeeId));
}

export async function updateExpenseStatus(expenseId: number, status: string, approvedBy?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const data: any = { status };
  if (approvedBy) data.approvedBy = approvedBy;
  if (status === "approved") data.approvedAt = new Date();
  if (status === "reimbursed") data.reimbursedAt = new Date();
  return db.update(expenses).set(data).where(eq(expenses.id, expenseId));
}

// Corporate Cards
export async function createCorporateCard(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(corporateCards).values(data);
  return extractInsertId(result);
}

export async function getCorporateCardsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(corporateCards).where(eq(corporateCards.companyId, companyId));
}

export async function getCorporateCardsByEmployeeId(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(corporateCards).where(eq(corporateCards.employeeId, employeeId));
}

export async function updateCardStatus(cardId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const data: any = { status };
  if (status === "cancelled") data.cancelledAt = new Date();
  return db.update(corporateCards).set(data).where(eq(corporateCards.id, cardId));
}

// Card Transactions
export async function createCardTransaction(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(cardTransactions).values(data);
  return extractInsertId(result);
}

export async function getCardTransactionsByCardId(cardId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cardTransactions).where(eq(cardTransactions.cardId, cardId));
}

// Budgets
export async function createBudget(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(budgets).values(data);
  return extractInsertId(result);
}

export async function getBudgetsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(budgets).where(eq(budgets.companyId, companyId));
}

export async function updateBudgetSpent(budgetId: number, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(budgets).set({ spent: amount }).where(eq(budgets.id, budgetId));
}

// ============================================================
// IT & IDENTITY OS HELPERS
// ============================================================

// Devices
export async function createDevice(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(devices).values(data);
  return extractInsertId(result);
}

export async function getDevicesByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(devices).where(eq(devices.companyId, companyId));
}

export async function getDevicesByEmployeeId(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(devices).where(eq(devices.employeeId, employeeId));
}

export async function updateDeviceStatus(deviceId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const data: any = { status };
  if (status === "decommissioned") data.decommissionedAt = new Date();
  return db.update(devices).set(data).where(eq(devices.id, deviceId));
}

// App Provisioning
export async function createAppProvisioning(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(appProvisioning).values(data);
  return extractInsertId(result);
}

export async function getAppProvisioningByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appProvisioning).where(eq(appProvisioning.companyId, companyId));
}

export async function getAppProvisioningByEmployeeId(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appProvisioning).where(eq(appProvisioning.employeeId, employeeId));
}

export async function updateAppProvisioningStatus(provisioningId: number, status: string, approvedBy?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const data: any = { status };
  if (status === "provisioned" && approvedBy) {
    data.approvedAt = new Date();
    data.approvedBy = approvedBy;
  }
  if (status === "revoked") data.revokedAt = new Date();
  return db.update(appProvisioning).set(data).where(eq(appProvisioning.id, provisioningId));
}

// Access Control
export async function createAccessControl(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(accessControl).values(data);
  return extractInsertId(result);
}

export async function getAccessControlByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(accessControl).where(eq(accessControl.companyId, companyId));
}

export async function getAccessControlByEmployeeId(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(accessControl).where(eq(accessControl.employeeId, employeeId));
}

export async function revokeAccessControl(accessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(accessControl).set({ revokedAt: new Date() }).where(eq(accessControl.id, accessId));
}

// ============================================================
// AI INTELLIGENCE HELPERS
// ============================================================

// Predictions
export async function createPrediction(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(predictions).values(data);
  return extractInsertId(result);
}

export async function getPredictionsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(predictions).where(eq(predictions.companyId, companyId));
}

export async function getPredictionsByEmployeeId(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(predictions).where(eq(predictions.employeeId, employeeId));
}

export async function updatePredictionStatus(predictionId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(predictions).set({ status }).where(eq(predictions.id, predictionId));
}

// Recommendations
export async function createRecommendation(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(recommendations).values(data);
  return extractInsertId(result);
}

export async function getRecommendationsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(recommendations).where(eq(recommendations.companyId, companyId));
}

export async function getRecommendationsByEmployeeId(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(recommendations).where(eq(recommendations.employeeId, employeeId));
}

export async function updateRecommendationStatus(recommendationId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const data: any = { status };
  if (status === "completed") data.completedAt = new Date();
  return db.update(recommendations).set(data).where(eq(recommendations.id, recommendationId));
}

// AI Chat History
export async function createAIChatHistory(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aiChatHistory).values(data);
  return extractInsertId(result);
}

export async function getAIChatHistoryByCompanyId(companyId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiChatHistory).where(eq(aiChatHistory.companyId, companyId)).limit(limit);
}

// ============================================================
// DEVELOPER PLATFORM HELPERS
// ============================================================

// API Keys
export async function createAPIKey(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(apiKeys).values(data);
  return extractInsertId(result);
}

export async function getAPIKeysByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(apiKeys).where(eq(apiKeys.companyId, companyId));
}

export async function revokeAPIKey(keyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(apiKeys).set({ status: "revoked", revokedAt: new Date() }).where(eq(apiKeys.id, keyId));
}

// Webhooks
export async function createWebhook(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(webhooks).values(data);
  return extractInsertId(result);
}

export async function getWebhooksByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(webhooks).where(eq(webhooks.companyId, companyId));
}

export async function updateWebhookStatus(webhookId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(webhooks).set({ status }).where(eq(webhooks.id, webhookId));
}

// Webhook Events
export async function createWebhookEvent(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(webhookEvents).values(data);
  return extractInsertId(result);
}

export async function getWebhookEventsByWebhookId(webhookId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(webhookEvents).where(eq(webhookEvents.webhookId, webhookId));
}

export async function updateWebhookEventStatus(eventId: number, status: string, retries?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const data: any = { status };
  if (retries !== undefined) data.retries = retries;
  return db.update(webhookEvents).set(data).where(eq(webhookEvents.id, eventId));
}

// Marketplace Apps
export async function createMarketplaceApp(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(marketplaceApps).values(data);
  return extractInsertId(result);
}

export async function getMarketplaceApps(status: string = "published") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(marketplaceApps).where(eq(marketplaceApps.status, status));
}

export async function updateMarketplaceAppStatus(appId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(marketplaceApps).set({ status }).where(eq(marketplaceApps.id, appId));
}

// Marketplace Installations
export async function createMarketplaceInstallation(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(marketplaceInstallations).values(data);
  return extractInsertId(result);
}

export async function getMarketplaceInstallationsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(marketplaceInstallations).where(eq(marketplaceInstallations.companyId, companyId));
}

export async function updateMarketplaceInstallationStatus(installationId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const data: any = { status };
  if (status === "uninstalled") data.uninstalledAt = new Date();
  return db.update(marketplaceInstallations).set(data).where(eq(marketplaceInstallations.id, installationId));
}
