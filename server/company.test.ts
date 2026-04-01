import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createCompany, getCompanyById, updateCompany } from "./db";
import { getDb } from "./db";

describe("Company Operations", () => {
  let companyId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) {
      console.warn("Database not available for tests");
    }
  });

  it("should create a company", async () => {
    const result = await createCompany({
      name: "Test Company",
      industry: "Technology",
      size: "50-100",
      website: "https://testcompany.com",
      status: "active",
    });

    expect(result).toBeDefined();
    expect(result.insertId).toBeGreaterThan(0);
    companyId = result.insertId;
  });

  it("should retrieve a company by ID", async () => {
    if (companyId === 0) {
      console.warn("Skipping test: company not created");
      return;
    }

    const company = await getCompanyById(companyId);
    expect(company).toBeDefined();
    expect(company?.industry).toBe("Technology");
  });

  it("should update a company", async () => {
    if (companyId === 0) {
      console.warn("Skipping test: company not created");
      return;
    }

    await updateCompany(companyId, {
      name: "Updated Test Company",
      size: "100-500",
    });

    const updated = await getCompanyById(companyId);
    expect(updated?.name).toBe("Updated Test Company");
    expect(updated?.size).toBe("100-500");
    expect(updated?.industry).toBe("Technology");
  });
});
