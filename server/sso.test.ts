import { describe, it, expect, beforeAll } from "vitest";
import {
  getSsoConfigsByCompanyId,
  getSsoConfigById,
  createSsoConfig,
  updateSsoConfig,
  deleteSsoConfig,
  createCompany,
} from "./db";

describe("SSO Configuration Operations", () => {
  let companyId: number;
  let googleConfigId: number;

  beforeAll(async () => {
    // Create a test company first
    const companyResult = await createCompany({
      name: "SSO Test Company",
      industry: "Technology",
      size: "50-100",
      website: "https://ssotest.com",
      status: "active",
    });
    companyId = companyResult.insertId;
  });

  it("should create an SSO configuration", async () => {
    const result = await createSsoConfig({
      companyId,
      provider: "google",
      clientId: "test-client-id-123",
      clientSecret: "test-client-secret-456",
      redirectUri: "https://ssotest.com/auth/callback",
      enabled: true,
    });

    expect(result).toBeDefined();
    expect(result.insertId).toBeGreaterThan(0);
    googleConfigId = result.insertId;
  });

  it("should retrieve SSO configs by company ID", async () => {
    const configs = await getSsoConfigsByCompanyId(companyId);
    expect(configs).toBeDefined();
    expect(Array.isArray(configs)).toBe(true);
    expect(configs.length).toBeGreaterThan(0);
  });

  it("should retrieve specific SSO config by ID", async () => {
    const config = await getSsoConfigById(googleConfigId);
    expect(config).toBeDefined();
    expect(config?.provider).toBe("google");
    expect(config?.clientId).toBe("test-client-id-123");
    expect(config?.enabled).toBe(true);
  });

  it("should update an SSO configuration", async () => {
    await updateSsoConfig(googleConfigId, {
      clientId: "updated-client-id",
      enabled: false,
    });

    const updated = await getSsoConfigById(googleConfigId);
    expect(updated?.clientId).toBe("updated-client-id");
    expect(updated?.enabled).toBe(false);
  });

  it("should create multiple SSO configurations for same company", async () => {
    const result = await createSsoConfig({
      companyId,
      provider: "okta",
      clientId: "okta-client-id",
      clientSecret: "okta-client-secret",
      redirectUri: "https://ssotest.com/auth/okta",
      enabled: true,
    });

    expect(result.insertId).toBeGreaterThan(0);

    const configs = await getSsoConfigsByCompanyId(companyId);
    expect(configs.length).toBeGreaterThanOrEqual(2);
  });

  it("should delete an SSO configuration", async () => {
    const result = await createSsoConfig({
      companyId,
      provider: "custom_oidc",
      clientId: "custom-oidc-id",
      clientSecret: "custom-oidc-secret",
      redirectUri: "https://ssotest.com/auth/custom",
      enabled: true,
    });

    const deleteId = result.insertId;
    await deleteSsoConfig(deleteId);

    const deleted = await getSsoConfigById(deleteId);
    expect(deleted).toBeUndefined();
  });
});
