import { describe, it, expect, beforeAll } from "vitest";
import { createSubscription, getSubscriptionByCompanyId, checkSeatAvailability } from "./db";
import { createCompany } from "./db";

describe("Subscription Operations", () => {
  let companyId: number;
  let subscriptionId: number;

  beforeAll(async () => {
    // Create a test company first
    const companyResult = await createCompany({
      name: "Subscription Test Company",
      industry: "Finance",
      size: "10-50",
      website: "https://subtest.com",
      status: "active",
    });
    companyId = companyResult.insertId;
  });

  it("should create a subscription", async () => {
    const result = await createSubscription({
      companyId,
      tier: "starter",
      seats: 10,
      usedSeats: 0,
      price: 490,
      status: "active",
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    expect(result).toBeDefined();
    expect(result.insertId).toBeGreaterThan(0);
    subscriptionId = result.insertId;
  });

  it("should retrieve subscription by company ID", async () => {
    const subscription = await getSubscriptionByCompanyId(companyId);
    expect(subscription).toBeDefined();
    expect(subscription?.tier).toBe("starter");
    expect(subscription?.seats).toBe(10);
  });

  it("should check seat availability", async () => {
    const available = await checkSeatAvailability(companyId);
    expect(available).toBe(true);
  });
});
