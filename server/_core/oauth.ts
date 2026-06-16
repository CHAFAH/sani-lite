import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function getDashboardPathForRole(role: string): string {
  switch (role) {
    case "super_admin":
    case "company_owner":
    case "admin":
    case "hr_admin":
      return "/admin";
    case "manager":
      return "/manager";
    case "employee":
    default:
      return "/employee";
  }
}

export function registerOAuthRoutes(app: Express) {
  // ── Dev bypass login (development only) ──────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    app.get("/api/dev-login", async (req: Request, res: Response) => {
      const DEV_OPEN_ID = "dev-bypass-user-001";
      try {
        // 1. Upsert the dev user
        await db.upsertUser({
          openId: DEV_OPEN_ID,
          name: "Dev Admin",
          email: "dev@sani.local",
          role: "company_owner",
          loginMethod: "dev",
          lastSignedIn: new Date(),
        });

        // 2. Create a dev company + subscription if the user has no companyId yet
        const user = await db.getUserByOpenId(DEV_OPEN_ID);
        if (user && !user.companyId) {
          const company = await db.createCompany({
            name: "Acme Corp (Dev)",
            industry: "Technology",
            size: "51-200",
            status: "active",
            kycVerified: true,
          });
          const companyId = company.insertId;

          await db.createSubscription({
            companyId,
            tier: "growth",
            seats: 50,
            price: "299",
            billingCycle: "monthly",
            status: "active",
          });

          await db.setUserCompanyId(DEV_OPEN_ID, companyId);
        }

        const sessionToken = await sdk.createSessionToken(DEV_OPEN_ID, {
          name: "Dev Admin",
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        const redirectTo = (req.query.redirect as string) || "/admin/dashboard";
        res.redirect(302, redirectTo);
      } catch (error) {
        console.error("[DevLogin] Failed", error);
        res.status(500).json({ error: "Dev login failed" });
      }
    });

    // Employee login bypass (Elena Volkov)
    app.get("/api/employee-login", async (req: Request, res: Response) => {
      const EMPLOYEE_OPEN_ID = "employee-elena-volkov";
      try {
        await db.upsertUser({
          openId: EMPLOYEE_OPEN_ID,
          name: "Forchu Chafah",
          email: "forchu.cha@gmail.com",
          role: "company_owner",
          loginMethod: "google",
          lastSignedIn: new Date(),
        });

        const user = await db.getUserByOpenId(EMPLOYEE_OPEN_ID);
        if (user && !user.companyId) {
          await db.setUserCompanyId(EMPLOYEE_OPEN_ID, 2);
        }

        const sessionToken = await sdk.createSessionToken(EMPLOYEE_OPEN_ID, {
          name: "Forchu Chafah",
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        const redirectTo = (req.query.redirect as string) || "/admin/dashboard";
        res.redirect(302, redirectTo);
      } catch (error) {
        console.error("[EmployeeLogin] Failed", error);
        res.status(500).json({ error: "Employee login failed" });
      }
    });

    // Generic email login (dev only) — looks up user by email
    app.post("/api/email-login", async (req: Request, res: Response) => {
      try {
        const { email } = req.body || {};
        if (!email) { res.status(400).json({ error: "Email required" }); return; }
        const user = await db.getUserByEmail(email);
        if (!user) { res.status(404).json({ error: "No account found with this email" }); return; }
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || email,
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        const redirectPath = user.role === "employee" ? "/employee" : "/admin";
        res.json({ success: true, redirect: redirectPath });
      } catch (error) {
        console.error("[EmailLogin] Failed", error);
        res.status(500).json({ error: "Login failed" });
      }
    });

    // Invite accept login
    app.get("/api/invite-login", async (req: Request, res: Response) => {
      const token = req.query.token as string;
      if (!token) { res.status(400).json({ error: "Token required" }); return; }
      try {
        const invitation = await db.getInvitationByToken(token);
        if (!invitation || invitation.status !== "pending") {
          res.status(400).json({ error: "Invalid or expired invitation" }); return;
        }
        const openId = `invite-${invitation.email.replace(/[^a-z0-9]/gi, "-")}`;
        await db.upsertUser({
          openId,
          name: invitation.email.split("@")[0],
          email: invitation.email,
          role: invitation.role || "employee",
          loginMethod: "invite",
          lastSignedIn: new Date(),
        });
        const user = await db.getUserByOpenId(openId);
        if (user && !user.companyId) {
          await db.setUserCompanyId(openId, invitation.companyId);
        }
        const sessionToken = await sdk.createSessionToken(openId, {
          name: invitation.email.split("@")[0],
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        res.redirect(302, `/invite?token=${token}`);
      } catch (error) {
        console.error("[InviteLogin] Failed", error);
        res.status(500).json({ error: "Login failed" });
      }
    });
  }

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? `user-${userInfo.openId}@sani.local`,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      // Get the user and assign company if needed
      let user = await db.getUserByOpenId(userInfo.openId);
      
      if (user && !user.companyId && (user.role === "admin" || user.role === "company_owner")) {
        try {
          const company = await db.createCompany({
            name: `${user.name || "Company"}'s Workspace`,
            status: "active",
            kycVerified: true,
          });
          const companyId = company.insertId;

          await db.createSubscription({
            companyId,
            tier: "growth",
            seats: 50,
            price: "299",
            billingCycle: "monthly",
            status: "active",
          });

          await db.setUserCompanyId(userInfo.openId, companyId);
          user = await db.getUserByOpenId(userInfo.openId);
        } catch (error) {
          console.error("[OAuth] Failed to create company:", error);
        }
      }

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Check if state contains a returnPath (e.g., from invite flow)
      let redirectPath = user ? getDashboardPathForRole(user.role) : "/admin";
      try {
        const decoded = Buffer.from(state, "base64").toString("utf-8");
        if (decoded.startsWith("{")) {
          const parsed = JSON.parse(decoded);
          if (parsed.returnPath) {
            redirectPath = parsed.returnPath;
          }
        }
      } catch {
        // state is not JSON, use default redirect
      }

      // If user has no company and no returnPath override, redirect to onboarding
      if (user && !user.companyId && !redirectPath.startsWith("/invite")) {
        redirectPath = "/onboarding";
      }

      res.redirect(302, redirectPath);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
