import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeCtx(overrides: Partial<TrpcContext> = {}): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      role: "admin",
      loginMethod: "email",
      companyId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    ...overrides,
  };
}

function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ── system.health ─────────────────────────────────────────────────────────────

describe("system.health", () => {
  it("returns ok: true", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.system.health({ timestamp: Date.now() });
    expect(result).toEqual({ ok: true });
  });

  it("rejects negative timestamp", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.system.health({ timestamp: -1 })).rejects.toThrow();
  });
});

// ── auth ──────────────────────────────────────────────────────────────────────

describe("auth.me", () => {
  it("returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user when authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.auth.me();
    expect(result).toMatchObject({ email: "test@example.com" });
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const clearCookie = vi.fn();
    const ctx = makeCtx({
      res: { clearCookie } as unknown as TrpcContext["res"],
    });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearCookie).toHaveBeenCalledOnce();
    expect(clearCookie.mock.calls[0][0]).toBe(COOKIE_NAME);
    expect(clearCookie.mock.calls[0][1]).toMatchObject({ maxAge: -1 });
  });
});

// ── company ───────────────────────────────────────────────────────────────────

describe("company", () => {
  beforeEach(() => {
    vi.mock("./db", async (importOriginal) => {
      const actual = await importOriginal<typeof import("./db")>();
      return {
        ...actual,
        getCompanyById: vi.fn().mockResolvedValue({
          id: 1,
          name: "Acme Corp",
          status: "active",
        }),
        createCompany: vi.fn().mockResolvedValue({ insertId: 42 }),
        setUserCompanyId: vi.fn().mockResolvedValue(undefined),
        updateCompany: vi.fn().mockResolvedValue(undefined),
      };
    });
  });

  it("get returns company for authenticated user with companyId", async () => {
    const { getCompanyById } = await import("./db");
    vi.mocked(getCompanyById).mockResolvedValue({
      id: 1, name: "Acme Corp", status: "active",
    } as any);

    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.company.get();
    expect(result).toMatchObject({ name: "Acme Corp" });
  });

  it("get throws FORBIDDEN when user has no companyId", async () => {
    const ctx = makeCtx({
      user: { ...makeCtx().user!, companyId: null as any },
    });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.company.get()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("getById throws NOT_FOUND for missing company", async () => {
    const { getCompanyById } = await import("./db");
    vi.mocked(getCompanyById).mockResolvedValue(undefined as any);

    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.company.getById({ id: 999 })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});

// ── employee ──────────────────────────────────────────────────────────────────

describe("employee", () => {
  beforeEach(() => {
    vi.mock("./db", async (importOriginal) => {
      const actual = await importOriginal<typeof import("./db")>();
      return {
        ...actual,
        getEmployeesByCompanyId: vi.fn().mockResolvedValue([
          { id: 1, firstName: "Jane", lastName: "Smith", email: "jane@acme.com", companyId: 1 },
        ]),
        checkSeatAvailability: vi.fn().mockResolvedValue(true),
        createEmployeeProfile: vi.fn().mockResolvedValue({ insertId: 10 }),
        upsertUser: vi.fn().mockResolvedValue(undefined),
        deleteEmployee: vi.fn().mockResolvedValue(undefined),
      };
    });
  });

  it("list returns employees for company", async () => {
    const { getEmployeesByCompanyId } = await import("./db");
    vi.mocked(getEmployeesByCompanyId).mockResolvedValue([
      { id: 1, firstName: "Jane", lastName: "Smith", email: "jane@acme.com", companyId: 1 } as any,
    ]);

    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.employee.list();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ firstName: "Jane" });
  });

  it("create fails when no seats available", async () => {
    const { checkSeatAvailability } = await import("./db");
    vi.mocked(checkSeatAvailability).mockResolvedValue(false);

    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.employee.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@acme.com",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("delete removes employee", async () => {
    const { deleteEmployee } = await import("./db");
    vi.mocked(deleteEmployee).mockResolvedValue(undefined as any);

    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.employee.delete({ id: 1 });
    expect(result).toEqual({ success: true });
    expect(deleteEmployee).toHaveBeenCalledWith(1);
  });
});

// ── invitation.validate ───────────────────────────────────────────────────────

describe("invitation.validate", () => {
  it("returns valid: false for unknown token", async () => {
    const { getInvitationByToken } = await import("./db");
    vi.mocked(getInvitationByToken as any).mockResolvedValue(undefined);

    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.invitation.validate({ token: "bad-token" });
    expect(result).toMatchObject({ valid: false });
  });

  it("returns valid: false for expired invitation", async () => {
    const { getInvitationByToken } = await import("./db");
    vi.mocked(getInvitationByToken as any).mockResolvedValue({
      status: "pending",
      expiresAt: new Date(Date.now() - 1000),
      companyId: 1,
      role: "employee",
      email: "test@example.com",
    });

    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.invitation.validate({ token: "expired-token" });
    expect(result).toMatchObject({ valid: false, error: "Invitation expired" });
  });
});
