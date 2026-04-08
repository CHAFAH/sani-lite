import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";
import type { User } from "../drizzle/schema";

// Mock context
const mockUser: User = {
  id: 1,
  openId: "test-user-001",
  email: "admin@test.com",
  name: "Test Admin",
  loginMethod: "test",
  role: "admin",
  profileCompleted: true,
  companyId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("Employee Management", () => {
  let testCompanyId: number;
  let testEmployeeId: number;

  beforeAll(async () => {
    // Create test company
    const company = await db.createCompany({
      name: "Test Company",
      industry: "Technology",
      size: "10-50",
      status: "active",
    });
    testCompanyId = company.insertId;

    // Create test subscription
    await db.createSubscription({
      companyId: testCompanyId,
      tier: "growth",
      seats: 50,
      price: "299",
      billingCycle: "monthly",
      status: "active",
    });
  });

  afterAll(async () => {
    // Cleanup test data
    // Note: In a real scenario, you'd have proper cleanup logic
  });

  describe("Employee Creation", () => {
    it("should create an employee successfully", async () => {
      const result = await db.createEmployeeProfile({
        companyId: testCompanyId,
        firstName: "John",
        lastName: "Doe",
        email: "john@test.com",
        department: "Engineering",
        position: "Software Engineer",
        phone: "+1234567890",
        country: "USA",
        city: "San Francisco",
        salary: "100000",
        currency: "USD",
        startDate: new Date(),
        employmentType: "full_time",
        status: "active",
        userId: mockUser.id,
      });

      expect(result.insertId).toBeDefined();
      testEmployeeId = result.insertId;
    });

    it("should create employee with minimal info", async () => {
      const result = await db.createEmployeeProfile({
        companyId: testCompanyId,
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@test.com",
        salary: "80000",
        currency: "USD",
        startDate: new Date(),
        employmentType: "full_time",
        status: "active",
        userId: mockUser.id,
      });

      expect(result.insertId).toBeDefined();
    });
  });

  describe("Employee Retrieval", () => {
    it("should retrieve employees by company ID", async () => {
      const employees = await db.getEmployeesByCompanyId(testCompanyId);
      expect(Array.isArray(employees)).toBe(true);
      expect(employees.length).toBeGreaterThan(0);
    });

    it("should retrieve specific employee by ID", async () => {
      const employees = await db.getEmployeesByCompanyId(testCompanyId);
      const found = employees.find((e) => e.id === testEmployeeId);
      expect(found).toBeDefined();
      expect(found?.firstName).toBe("John");
      expect(found?.lastName).toBe("Doe");
    });
  });

  describe("Employee Update", () => {
    it("should update employee profile", async () => {
      await db.updateEmployeeProfile(testEmployeeId, {
        position: "Senior Software Engineer",
        salary: "120000",
      });

      const employees = await db.getEmployeesByCompanyId(testCompanyId);
      const updated = employees.find((e) => e.id === testEmployeeId);
      expect(updated?.position).toBe("Senior Software Engineer");
      expect(updated?.salary).toMatch(/^120000/); // Allow decimal format from database
    });

    it("should update employee status", async () => {
      await db.updateEmployeeProfile(testEmployeeId, {
        status: "on_leave",
      });

      const employees = await db.getEmployeesByCompanyId(testCompanyId);
      const updated = employees.find((e) => e.id === testEmployeeId);
      expect(updated?.status).toBe("on_leave");
    });
  });

  describe("Employee Deletion", () => {
    it("should delete employee", async () => {
      const beforeDelete = await db.getEmployeesByCompanyId(testCompanyId);
      const countBefore = beforeDelete.length;

      // Create an employee to delete
      const toDelete = await db.createEmployeeProfile({
        companyId: testCompanyId,
        firstName: "Delete",
        lastName: "Me",
        email: "delete@test.com",
        salary: "50000",
        currency: "USD",
        startDate: new Date(),
        employmentType: "contract",
        status: "active",
        userId: mockUser.id,
      });

      await db.deleteEmployee(toDelete.insertId);

      const afterDelete = await db.getEmployeesByCompanyId(testCompanyId);
      expect(afterDelete.length).toBeLessThan(countBefore + 1);
    });
  });

  describe("Employee Statistics", () => {
    it("should get employee count by department", async () => {
      const breakdown = await db.getEmployeeCountByDepartment(testCompanyId);
      expect(Array.isArray(breakdown)).toBe(true);
    });
  });

  describe("Employee Documents", () => {
    it("should upload employee document", async () => {
      const result = await db.uploadEmployeeDocument({
        employeeId: testEmployeeId,
        companyId: testCompanyId,
        documentType: "employment_contract",
        fileName: "contract.pdf",
        fileUrl: "https://example.com/contract.pdf",
        uploadedBy: mockUser.id,
      });

      expect(result.insertId).toBeDefined();
    });

    it("should retrieve employee documents", async () => {
      const docs = await db.getEmployeeDocuments(testEmployeeId);
      expect(Array.isArray(docs)).toBe(true);
    });
  });


});
