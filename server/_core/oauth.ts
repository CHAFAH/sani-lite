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
        res.redirect(302, "/admin/dashboard");
      } catch (error) {
        console.error("[DevLogin] Failed", error);
        res.status(500).json({ error: "Dev login failed" });
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

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

<<<<<<< Updated upstream
      res.redirect(302, "/admin/dashboard");
=======
      // Redirect to the correct dashboard based on user role
      const user = await db.getUserByOpenId(userInfo.openId);
      const redirectPath = user ? getDashboardPathForRole(user.role) : "/admin";

      res.redirect(302, redirectPath);
>>>>>>> Stashed changes
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
