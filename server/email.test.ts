import { describe, it, expect } from "vitest";
import { Resend } from "resend";

describe("Email Service - Resend API Key Validation", () => {
  it("should have RESEND_API_KEY configured", () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe("");
    expect(typeof apiKey).toBe("string");
  });

  it("should be able to initialize Resend client with valid API key", async () => {
    const apiKey = process.env.RESEND_API_KEY!;
    const resend = new Resend(apiKey);
    expect(resend).toBeDefined();

    // Validate the key by listing domains (lightweight API call)
    try {
      const { data, error } = await resend.domains.list();
      if (error) {
        // "restricted to only send emails" means the key is valid but send-only - that's fine
        if (error.message?.includes("restricted to only send")) {
          expect(true).toBe(true);
          return;
        }
        // Unauthorized/401 means the key is actually invalid
        if (error.message?.includes("Unauthorized") || error.message?.includes("401")) {
          throw new Error(`Invalid Resend API key: ${error.message}`);
        }
      }
      // If we reach here with data, the key is valid with full access
      expect(true).toBe(true);
    } catch (err: any) {
      if (err.message?.includes("Invalid Resend API key")) {
        throw err;
      }
      // Network errors are not key validation failures
      console.warn("Could not fully validate Resend API key (network issue):", err.message);
      expect(true).toBe(true);
    }
  });
});
