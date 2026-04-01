import { describe, it, expect } from "vitest";
import {
  createDepartment,
  getDepartmentsByCompanyId,
  updateDepartment,
  deleteDepartment,
  createCustomRole,
  getCustomRolesByCompanyId,
  deleteCustomRole,
  createFeedback,
  getFeedbackByCompanyId,
  upsertPersonalDetails,
  getPersonalDetailsByEmployeeId,
  createInvitation,
  getInvitationsByCompanyId,
} from "./db";

const TEST_COMPANY_ID = 99900;

describe("Department Operations", () => {
  it("should create and list departments", async () => {
    const result = await createDepartment({
      companyId: TEST_COMPANY_ID,
      name: "Engineering",
      description: "Software Engineering",
    });
    expect(result).toBeDefined();

    const departments = await getDepartmentsByCompanyId(TEST_COMPANY_ID);
    expect(departments.length).toBeGreaterThanOrEqual(1);
    const eng = departments.find((d) => d.name === "Engineering");
    expect(eng).toBeDefined();
    expect(eng!.description).toBe("Software Engineering");
  });

  it("should update a department", async () => {
    const departments = await getDepartmentsByCompanyId(TEST_COMPANY_ID);
    const eng = departments.find((d) => d.name === "Engineering");
    if (eng) {
      await updateDepartment(eng.id, { description: "Updated description" });
      const updated = await getDepartmentsByCompanyId(TEST_COMPANY_ID);
      const updatedEng = updated.find((d) => d.id === eng.id);
      expect(updatedEng?.description).toBe("Updated description");
    }
  });

  it("should delete a department", async () => {
    const departments = await getDepartmentsByCompanyId(TEST_COMPANY_ID);
    const eng = departments.find((d) => d.name === "Engineering");
    if (eng) {
      await deleteDepartment(eng.id);
      const remaining = await getDepartmentsByCompanyId(TEST_COMPANY_ID);
      expect(remaining.find((d) => d.id === eng.id)).toBeUndefined();
    }
  });
});

describe("Custom Roles", () => {
  it("should create and list custom roles", async () => {
    const result = await createCustomRole({
      companyId: TEST_COMPANY_ID,
      name: "Team Lead",
      description: "Leads a team",
    });
    expect(result).toBeDefined();

    const roles = await getCustomRolesByCompanyId(TEST_COMPANY_ID);
    expect(roles.length).toBeGreaterThanOrEqual(1);
    const lead = roles.find((r) => r.name === "Team Lead");
    expect(lead).toBeDefined();
  });

  it("should delete a custom role", async () => {
    const roles = await getCustomRolesByCompanyId(TEST_COMPANY_ID);
    const lead = roles.find((r) => r.name === "Team Lead");
    if (lead) {
      await deleteCustomRole(lead.id);
      const remaining = await getCustomRolesByCompanyId(TEST_COMPANY_ID);
      expect(remaining.find((r) => r.id === lead.id)).toBeUndefined();
    }
  });
});

describe("Feedback Operations", () => {
  it("should create and list feedback", async () => {
    const result = await createFeedback({
      companyId: TEST_COMPANY_ID,
      fromEmployeeId: 1,
      toEmployeeId: 2,
      type: "praise",
      content: "Great work on the project!",
    });
    expect(result).toBeDefined();

    const feedbacks = await getFeedbackByCompanyId(TEST_COMPANY_ID);
    expect(feedbacks.length).toBeGreaterThanOrEqual(1);
    const fb = feedbacks.find((f) => f.content === "Great work on the project!");
    expect(fb).toBeDefined();
    expect(fb!.type).toBe("praise");
  });
});

describe("Personal Details", () => {
  it("should upsert and retrieve personal details", async () => {
    await upsertPersonalDetails({
      employeeId: 99901,
      address: "123 Test St",
      emergencyContactName: "Jane Doe",
      emergencyContactPhone: "+1234567890",
    });

    const details = await getPersonalDetailsByEmployeeId(99901);
    expect(details).toBeDefined();
    expect(details!.address).toBe("123 Test St");
    expect(details!.emergencyContactName).toBe("Jane Doe");
  });
});

describe("Invitations", () => {
  it("should create and list invitations", async () => {
    const result = await createInvitation({
      companyId: TEST_COMPANY_ID,
      email: "test-invite@example.com",
      role: "employee",
      invitedBy: 1,
      token: "test-token-" + Date.now(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    expect(result).toBeDefined();

    const invitations = await getInvitationsByCompanyId(TEST_COMPANY_ID);
    expect(invitations.length).toBeGreaterThanOrEqual(1);
    const inv = invitations.find((i) => i.email === "test-invite@example.com");
    expect(inv).toBeDefined();
    expect(inv!.role).toBe("employee");
  });
});
