import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";

// Mock database helpers
vi.mock("./db", async () => {
  const actual = await vi.importActual("./db");
  return {
    ...actual,
    createCompany: vi.fn().mockResolvedValue([{ insertId: 1 }]),
    getCompanyById: vi.fn().mockResolvedValue({ id: 1, name: "Test Corp", industry: "tech" }),
    // Payroll
    createPayrollRecord: vi.fn().mockResolvedValue({ insertId: 1 }),
    getPayrollByCompanyId: vi.fn().mockResolvedValue([
      { id: 1, companyId: 1, employeeId: 1, payrollCycle: "2026-03", baseSalary: "8333.00", grossPay: "8333.00", deductions: "2083.00", netPay: "6250.00", status: "paid", currency: "USD" },
      { id: 2, companyId: 1, employeeId: 2, payrollCycle: "2026-03", baseSalary: "7500.00", grossPay: "7500.00", deductions: "1875.00", netPay: "5625.00", status: "pending", currency: "USD" },
    ]),
    updatePayrollRecord: vi.fn().mockResolvedValue([{ affectedRows: 1 }]),
    // Payroll Cycles
    createPayrollCycle: vi.fn().mockResolvedValue({ insertId: 1 }),
    getPayrollCyclesByCompanyId: vi.fn().mockResolvedValue([
      { id: 1, companyId: 1, name: "March 2026", periodStart: new Date("2026-03-01"), periodEnd: new Date("2026-03-31"), payDate: new Date("2026-03-31"), status: "completed" },
    ]),
    updatePayrollCycle: vi.fn().mockResolvedValue([{ affectedRows: 1 }]),
    // Benefit Plans
    createBenefitPlan: vi.fn().mockResolvedValue({ insertId: 1 }),
    getBenefitPlansByCompanyId: vi.fn().mockResolvedValue([
      { id: 1, companyId: 1, name: "Premium Health", type: "health", provider: "Aetna", cost: "450.00", employerContribution: "360.00", status: "active" },
      { id: 2, companyId: 1, name: "Standard Dental", type: "dental", provider: "Delta Dental", cost: "45.00", employerContribution: "45.00", status: "active" },
    ]),
    updateBenefitPlan: vi.fn().mockResolvedValue([{ affectedRows: 1 }]),
    deleteBenefitPlan: vi.fn().mockResolvedValue([{ affectedRows: 1 }]),
    // Benefit Enrollments
    createBenefitEnrollment: vi.fn().mockResolvedValue({ insertId: 1 }),
    getBenefitEnrollmentsByCompanyId: vi.fn().mockResolvedValue([
      { id: 1, companyId: 1, employeeId: 1, planId: 1, status: "enrolled", enrolledAt: new Date() },
    ]),
    getBenefitEnrollmentsByEmployeeId: vi.fn().mockResolvedValue([
      { id: 1, companyId: 1, employeeId: 1, planId: 1, status: "enrolled", enrolledAt: new Date() },
    ]),
    updateBenefitEnrollment: vi.fn().mockResolvedValue([{ affectedRows: 1 }]),
    // Compensation
    createCompensationRecord: vi.fn().mockResolvedValue({ insertId: 1 }),
    getCompensationByCompanyId: vi.fn().mockResolvedValue([
      { id: 1, companyId: 1, employeeId: 1, type: "base_salary", amount: "100000.00", currency: "USD", effectiveDate: new Date("2026-01-01"), status: "active" },
    ]),
    getCompensationByEmployeeId: vi.fn().mockResolvedValue([
      { id: 1, companyId: 1, employeeId: 1, type: "base_salary", amount: "100000.00", currency: "USD", effectiveDate: new Date("2026-01-01"), status: "active" },
    ]),
    updateCompensationRecord: vi.fn().mockResolvedValue([{ affectedRows: 1 }]),
    // Salary Bands
    createSalaryBand: vi.fn().mockResolvedValue({ insertId: 1 }),
    getSalaryBandsByCompanyId: vi.fn().mockResolvedValue([
      { id: 1, companyId: 1, title: "Senior Engineer", level: "L5", minSalary: "120000.00", midSalary: "145000.00", maxSalary: "170000.00", currency: "USD" },
    ]),
    updateSalaryBand: vi.fn().mockResolvedValue([{ affectedRows: 1 }]),
    deleteSalaryBand: vi.fn().mockResolvedValue([{ affectedRows: 1 }]),
  };
});

const companyCtx = {
  user: { id: 1, openId: "test-open-id", name: "Admin", role: "admin", companyId: 1, profileCompleted: true },
  companyId: 1,
};

const caller = appRouter.createCaller(companyCtx as any);

describe("Payroll Module", () => {
  it("should create a payroll record", async () => {
    const result = await caller.payroll.create({
      employeeId: 1,
      payrollCycle: "2026-03",
      baseSalary: "8333.00",
      grossPay: "8333.00",
      deductions: "2083.00",
      netPay: "6250.00",
      currency: "USD",
    });
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.payrollId).toBeDefined();
  });

  it("should list payroll records for company", async () => {
    const records = await caller.payroll.list();
    expect(records).toHaveLength(2);
    expect(records[0].grossPay).toBe("8333.00");
    expect(records[0].status).toBe("paid");
  });

  it("should approve a payroll record", async () => {
    const result = await caller.payroll.approve({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("should mark a payroll record as paid", async () => {
    const result = await caller.payroll.markPaid({ id: 1 });
    expect(result.success).toBe(true);
  });
});

describe("Payroll Cycle Module", () => {
  it("should create a payroll cycle", async () => {
    const result = await caller.payrollCycle.create({
      name: "April 2026",
      periodStart: "2026-04-01",
      periodEnd: "2026-04-30",
      payDate: "2026-04-30",
    });
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.cycleId).toBeDefined();
  });

  it("should list payroll cycles", async () => {
    const cycles = await caller.payrollCycle.list();
    expect(cycles).toHaveLength(1);
    expect(cycles[0].name).toBe("March 2026");
    expect(cycles[0].status).toBe("completed");
  });

  it("should approve a payroll cycle", async () => {
    const result = await caller.payrollCycle.approve({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("should mark a payroll cycle as paid", async () => {
    const result = await caller.payrollCycle.markPaid({ id: 1 });
    expect(result.success).toBe(true);
  });
});

describe("Benefits Module", () => {
  it("should create a benefit plan", async () => {
    const result = await caller.benefits.createPlan({
      name: "Vision Care Plus",
      type: "vision",
      provider: "VSP",
      cost: "25.00",
      employerContribution: "25.00",
    });
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.planId).toBeDefined();
  });

  it("should list benefit plans for company", async () => {
    const plans = await caller.benefits.listPlans();
    expect(plans).toHaveLength(2);
    expect(plans[0].name).toBe("Premium Health");
    expect(plans[0].type).toBe("health");
  });

  it("should update a benefit plan", async () => {
    const result = await caller.benefits.updatePlan({
      id: 1,
      cost: "475.00",
    });
    expect(result.success).toBe(true);
  });

  it("should delete a benefit plan", async () => {
    const result = await caller.benefits.deletePlan({ id: 2 });
    expect(result.success).toBe(true);
  });

  it("should enroll employee in benefit plan", async () => {
    const result = await caller.benefits.enroll({
      employeeId: 1,
      planId: 1,
      effectiveDate: "2026-04-01",
    });
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.enrollmentId).toBeDefined();
  });

  it("should list enrollments by company", async () => {
    const enrollments = await caller.benefits.listEnrollments();
    expect(enrollments).toHaveLength(1);
    expect(enrollments[0].status).toBe("enrolled");
  });

  it("should list enrollments by employee", async () => {
    const enrollments = await caller.benefits.listEnrollmentsByEmployee({ employeeId: 1 });
    expect(enrollments).toHaveLength(1);
  });

  it("should update enrollment status", async () => {
    const result = await caller.benefits.updateEnrollment({
      id: 1,
      status: "waived",
    });
    expect(result.success).toBe(true);
  });
});

describe("Compensation Module", () => {
  it("should create a compensation record", async () => {
    const result = await caller.compensation.create({
      employeeId: 1,
      type: "base_salary",
      amount: "100000.00",
      currency: "USD",
      effectiveDate: "2026-01-01",
      reason: "Annual review",
    });
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.recordId).toBeDefined();
  });

  it("should list compensation records for company", async () => {
    const records = await caller.compensation.list();
    expect(records).toHaveLength(1);
    expect(records[0].amount).toBe("100000.00");
  });

  it("should list compensation by employee", async () => {
    const records = await caller.compensation.listByEmployee({ employeeId: 1 });
    expect(records).toHaveLength(1);
    expect(records[0].currency).toBe("USD");
  });

  it("should approve a compensation record", async () => {
    const result = await caller.compensation.approve({ id: 1 });
    expect(result.success).toBe(true);
  });
});

describe("Salary Band Module", () => {
  it("should create a salary band", async () => {
    const result = await caller.salaryBand.create({
      title: "Staff Engineer",
      level: "L6",
      minSalary: "160000.00",
      midSalary: "190000.00",
      maxSalary: "220000.00",
      currency: "USD",
    });
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.bandId).toBeDefined();
  });

  it("should list salary bands", async () => {
    const bands = await caller.salaryBand.list();
    expect(bands).toHaveLength(1);
    expect(bands[0].title).toBe("Senior Engineer");
    expect(bands[0].level).toBe("L5");
  });

  it("should update a salary band", async () => {
    const result = await caller.salaryBand.update({
      id: 1,
      minSalary: "130000.00",
    });
    expect(result.success).toBe(true);
  });

  it("should delete a salary band", async () => {
    const result = await caller.salaryBand.delete({ id: 1 });
    expect(result.success).toBe(true);
  });
});
