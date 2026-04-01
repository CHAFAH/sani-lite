import { describe, it, expect } from "vitest";
import {
  getEmployeesByCompanyId,
  createEmployeeProfile as createEmployee,
  getTimeOffByCompanyId,
  createTimeOffRequest,
  getWorkflowsByCompanyId,
  createWorkflow,
  getPayrollCyclesByCompanyId,
  createPayrollCycle,
  getBenefitPlansByCompanyId,
  createBenefitPlan,
  getGoalsByCompanyId,
  createGoal,
  getJobPostingsByCompanyId,
  createJobPosting,
  getCoursesByCompanyId,
  createCourse,
  getSalaryBandsByCompanyId,
  createSalaryBand,
  getAnnouncementsByCompanyId,
  createAnnouncement,
  getHiringByCompanyId,
  createHiringRecord,
  getPerformanceReviewsByCompanyId,
  createPerformanceReview,
  getCompensationByCompanyId,
  createCompensationRecord as createCompensation,
} from "./db";

const TEST_COMPANY_ID = 99999;
const TEST_USER_ID = 99999;

describe("Employee Module", () => {
  it("should create and list employees", async () => {
    const result = await createEmployee({
      companyId: TEST_COMPANY_ID,
      userId: TEST_USER_ID,
      firstName: "Test",
      lastName: "Employee",
      email: `test-emp-${Date.now()}@test.com`,
      department: "Engineering",
      position: "Developer",
      status: "active",
    });
    expect(result).toBeDefined();

    const employees = await getEmployeesByCompanyId(TEST_COMPANY_ID);
    expect(employees.length).toBeGreaterThanOrEqual(1);
    const found = employees.find((e) => e.firstName === "Test" && e.lastName === "Employee");
    expect(found).toBeDefined();
  });
});

describe("Time Off Module", () => {
  it("should create and list time-off requests", async () => {
    const result = await createTimeOffRequest({
      companyId: TEST_COMPANY_ID,
      employeeId: 1,
      type: "vacation",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-06-05"),
      days: 5,
      reason: "Summer holiday",
    });
    expect(result).toBeDefined();

    const requests = await getTimeOffByCompanyId(TEST_COMPANY_ID);
    expect(requests.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Workflow Module", () => {
  it("should create and list workflows", async () => {
    const result = await createWorkflow({
      companyId: TEST_COMPANY_ID,
      name: "Test Onboarding",
      type: "onboarding",
      description: "Test workflow",
      steps: JSON.stringify([{ name: "Step 1", type: "approval" }]),
      createdBy: TEST_USER_ID,
    });
    expect(result).toBeDefined();

    const workflows = await getWorkflowsByCompanyId(TEST_COMPANY_ID);
    expect(workflows.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Payroll Module", () => {
  it("should create and list payroll cycles", async () => {
    const result = await createPayrollCycle({
      companyId: TEST_COMPANY_ID,
      name: "March 2026",
      periodStart: new Date("2026-03-01"),
      periodEnd: new Date("2026-03-31"),
      payDate: new Date("2026-04-05"),
      currency: "USD",
    });
    expect(result).toBeDefined();

    const cycles = await getPayrollCyclesByCompanyId(TEST_COMPANY_ID);
    expect(cycles.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Benefits Module", () => {
  it("should create and list benefit plans", async () => {
    const result = await createBenefitPlan({
      companyId: TEST_COMPANY_ID,
      name: "Health Insurance",
      type: "health",
      description: "Company health plan",
      provider: "BlueCross",
      costEmployee: "100.00",
      costEmployer: "400.00",
    });
    expect(result).toBeDefined();

    const plans = await getBenefitPlansByCompanyId(TEST_COMPANY_ID);
    expect(plans.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Goals Module", () => {
  it("should create and list goals", async () => {
    const result = await createGoal({
      companyId: TEST_COMPANY_ID,
      employeeId: 1,
      title: "Complete project",
      description: "Finish the Q2 project",
      type: "individual",
      status: "in_progress",
    });
    expect(result).toBeDefined();

    const goals = await getGoalsByCompanyId(TEST_COMPANY_ID);
    expect(goals.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Job Posting Module", () => {
  it("should create and list job postings", async () => {
    const result = await createJobPosting({
      companyId: TEST_COMPANY_ID,
      title: "Senior Developer",
      department: "Engineering",
      location: "Remote",
      type: "full_time",
      description: "Looking for a senior dev",
    });
    expect(result).toBeDefined();

    const postings = await getJobPostingsByCompanyId(TEST_COMPANY_ID);
    expect(postings.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Hiring Module", () => {
  it("should create and list hiring records", async () => {
    const result = await createHiringRecord({
      companyId: TEST_COMPANY_ID,
      jobTitle: "Senior Developer",
      candidateName: "Jane Doe",
      candidateEmail: `jane-${Date.now()}@test.com`,
      status: "applied",
    });
    expect(result).toBeDefined();

    const records = await getHiringByCompanyId(TEST_COMPANY_ID);
    expect(records.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Learning Module", () => {
  it("should create and list courses", async () => {
    const result = await createCourse({
      companyId: TEST_COMPANY_ID,
      title: "Security Training",
      category: "compliance",
      type: "required",
      createdBy: TEST_USER_ID,
    });
    expect(result).toBeDefined();

    const courses = await getCoursesByCompanyId(TEST_COMPANY_ID);
    expect(courses.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Performance Module", () => {
  it("should create and list performance reviews", async () => {
    const result = await createPerformanceReview({
      companyId: TEST_COMPANY_ID,
      employeeId: 1,
      reviewerId: TEST_USER_ID,
      reviewPeriod: "Q1 2026",
      status: "draft",
    });
    expect(result).toBeDefined();

    const reviews = await getPerformanceReviewsByCompanyId(TEST_COMPANY_ID);
    expect(reviews.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Compensation Module", () => {
  it("should create and list compensations", async () => {
    const result = await createCompensation({
      companyId: TEST_COMPANY_ID,
      employeeId: 1,
      type: "base_salary",
      amount: "85000.00",
      currency: "USD",
      effectiveDate: new Date("2026-01-01"),
    });
    expect(result).toBeDefined();

    const comps = await getCompensationByCompanyId(TEST_COMPANY_ID);
    expect(comps.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Salary Band Module", () => {
  it("should create and list salary bands", async () => {
    const result = await createSalaryBand({
      companyId: TEST_COMPANY_ID,
      level: "L4",
      title: "Senior Engineer",
      minSalary: "120000",
      midSalary: "145000",
      maxSalary: "170000",
      currency: "USD",
    });
    expect(result).toBeDefined();

    const bands = await getSalaryBandsByCompanyId(TEST_COMPANY_ID);
    expect(bands.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Announcements Module", () => {
  it("should create and list announcements", async () => {
    const result = await createAnnouncement({
      companyId: TEST_COMPANY_ID,
      title: "Welcome aboard!",
      content: "We are excited to have you.",
      type: "general",
      authorId: TEST_USER_ID,
    });
    expect(result).toBeDefined();

    const announcements = await getAnnouncementsByCompanyId(TEST_COMPANY_ID);
    expect(announcements.length).toBeGreaterThanOrEqual(1);
  });
});
