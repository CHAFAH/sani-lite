import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";

function getGoogleClient() {
  return new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
}

function getDashboardPathForRole(role: string): string {
  switch (role) {
    case "super_admin": case "company_owner": case "admin": case "hr_admin":
      return "/admin";
    case "manager":
      return "/manager";
    default:
      return "/employee";
  }
}

async function createSessionAndRedirect(res: Response, req: Request, openId: string, name: string, redirectPath: string) {
  const sessionToken = await sdk.createSessionToken(openId, { name, expiresInMs: ONE_YEAR_MS });
  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
  return redirectPath;
}

export function registerAuthRoutes(app: Express) {
  // ── Google OAuth: Initiate ──
  app.get("/api/auth/google", (req: Request, res: Response) => {
    const returnPath = (req.query.returnPath as string) || "";
    if (!GOOGLE_CLIENT_ID) {
      res.status(500).json({ error: "Google OAuth not configured. Set GOOGLE_CLIENT_ID in .env" });
      return;
    }
    const client = getGoogleClient();
    const state = returnPath ? Buffer.from(JSON.stringify({ returnPath })).toString("base64") : "default";
    const url = client.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "email", "profile"],
      prompt: "select_account",
      state,
    });
    res.redirect(url);
  });

  // ── Google OAuth: Callback ──
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const state = req.query.state as string;
    if (!code) { res.status(400).json({ error: "Missing code" }); return; }

    try {
      const client = getGoogleClient();
      const { tokens } = await client.getToken(code);
      client.setCredentials(tokens);

      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload()!;
      const email = payload.email!;
      const name = payload.name || email.split("@")[0];
      const googleOpenId = `google-${payload.sub}`;

      // Check if user already exists by email (may have been created via invite or dev-login)
      let existingUser = await db.getUserByEmail(email);
      let openId: string;

      if (existingUser) {
        // User exists — use their existing openId, update login method
        openId = existingUser.openId;
        await db.upsertUser({
          openId,
          email,
          name: existingUser.name || name,
          loginMethod: "google",
          lastSignedIn: new Date(),
        });
      } else {
        // New user — create with google openId
        openId = googleOpenId;
        await db.upsertUser({
          openId,
          name,
          email,
          loginMethod: "google",
          lastSignedIn: new Date(),
        });
      }

      let user = await db.getUserByOpenId(openId);

      // If user has no company, create one (for new sign-ups)
      if (user && !user.companyId && (user.role === "admin" || user.role === "company_owner")) {
        const company = await db.createCompany({
          name: `${name}'s Workspace`,
          status: "active",
          kycVerified: true,
        });
        await db.createSubscription({
          companyId: company.insertId,
          tier: "growth",
          seats: 50,
          price: "299",
          billingCycle: "monthly",
          status: "active",
        });
        await db.setUserCompanyId(openId, company.insertId);
        user = await db.getUserByOpenId(openId);
      }

      let redirectPath = user ? getDashboardPathForRole(user.role) : "/admin";

      // Check state for returnPath
      if (state && state !== "default") {
        try {
          const parsed = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
          if (parsed.returnPath) redirectPath = parsed.returnPath;
        } catch {}
      }

      if (user && !user.companyId && !redirectPath.startsWith("/invite")) {
        redirectPath = "/onboarding";
      }

      await createSessionAndRedirect(res, req, openId, name, redirectPath);
      res.redirect(302, redirectPath);
    } catch (error) {
      console.error("[Google OAuth] Callback failed:", error);
      res.redirect("/login?error=google_failed");
    }
  });

  // ── Email/Password: Register ──
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body || {};
      if (!email || !password) { res.status(400).json({ error: "Email and password required" }); return; }
      if (password.length < 8) { res.status(400).json({ error: "Password must be at least 8 characters" }); return; }

      const existing = await db.getUserByEmail(email);
      if (existing) { res.status(409).json({ error: "An account with this email already exists" }); return; }

      const passwordHash = await bcrypt.hash(password, 12);
      const openId = `email-${email.replace(/[^a-z0-9]/gi, "-")}`;

      await db.upsertUser({
        openId,
        name: name || email.split("@")[0],
        email,
        loginMethod: "email",
        lastSignedIn: new Date(),
        role: "company_owner",
      });

      // Set password hash directly
      const user = await db.getUserByOpenId(openId);
      if (user) {
        await db.updateUserPassword(user.id, passwordHash);
      }

      const sessionToken = await sdk.createSessionToken(openId, { name: name || email, expiresInMs: ONE_YEAR_MS });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true, redirect: "/onboarding" });
    } catch (error: any) {
      console.error("[Auth] Register failed:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // ── Email/Password: Login ──
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) { res.status(400).json({ error: "Email and password required" }); return; }

      const user = await db.getUserByEmail(email);
      if (!user) { res.status(401).json({ error: "Invalid email or password" }); return; }
      if (!user.passwordHash) { res.status(401).json({ error: "This account uses Google sign-in. Please use 'Continue with Google'." }); return; }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) { res.status(401).json({ error: "Invalid email or password" }); return; }

      await db.upsertUser({ openId: user.openId, email: user.email, lastSignedIn: new Date() });

      const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name || email, expiresInMs: ONE_YEAR_MS });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      const redirectPath = getDashboardPathForRole(user.role);
      res.json({ success: true, redirect: redirectPath });
    } catch (error: any) {
      console.error("[Auth] Login failed:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // ── Invite: Get invitation info ──
  app.get("/api/auth/invite/:token", async (req: Request, res: Response) => {
    try {
      const invitation = await db.getInvitationByToken(req.params.token);
      if (!invitation) { res.status(404).json({ error: "Invitation not found" }); return; }
      if (invitation.status !== "pending") { res.status(400).json({ error: "Invitation already used or expired" }); return; }
      if (new Date() > new Date(invitation.expiresAt)) { res.status(400).json({ error: "Invitation has expired" }); return; }

      const company = await db.getCompanyById(invitation.companyId);
      res.json({
        email: invitation.email,
        role: invitation.role,
        companyName: company?.name || "Company",
      });
    } catch (error) {
      console.error("[Auth] Invite info failed:", error);
      res.status(500).json({ error: "Failed to get invitation info" });
    }
  });

  // ── Invite: Accept with password creation ──
  app.post("/api/auth/invite/accept", async (req: Request, res: Response) => {
    try {
      const { token, password, name } = req.body || {};
      if (!token || !password) { res.status(400).json({ error: "Token and password required" }); return; }
      if (password.length < 8) { res.status(400).json({ error: "Password must be at least 8 characters" }); return; }

      const invitation = await db.getInvitationByToken(token);
      if (!invitation || invitation.status !== "pending") {
        res.status(400).json({ error: "Invalid or expired invitation" }); return;
      }
      if (new Date() > new Date(invitation.expiresAt)) {
        res.status(400).json({ error: "Invitation has expired" }); return;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const email = invitation.email;
      const openId = `email-${email.replace(/[^a-z0-9]/gi, "-")}`;
      const userName = name || email.split("@")[0];

      // Create or update user
      await db.upsertUser({
        openId,
        name: userName,
        email,
        role: invitation.role as any,
        loginMethod: "email",
        lastSignedIn: new Date(),
      });

      const user = await db.getUserByOpenId(openId);
      if (user) {
        await db.updateUserPassword(user.id, passwordHash);
        if (!user.companyId) {
          await db.setUserCompanyId(openId, invitation.companyId);
        }

        // Create employee profile if it doesn't exist
        const employees = await db.getEmployeesByCompanyId(invitation.companyId);
        const hasProfile = employees.some((e: any) => e.email === email);
        if (!hasProfile) {
          const nameParts = userName.split(" ");
          await db.createEmployeeProfile({
            userId: user.id, companyId: invitation.companyId,
            firstName: nameParts[0] || "New", lastName: nameParts.slice(1).join(" ") || "Employee",
            email, employmentType: "full_time", status: "active",
          });
        }
      }

      // Mark invitation as accepted
      await db.updateInvitation(invitation.id, { status: "accepted", acceptedAt: new Date() });

      const sessionToken = await sdk.createSessionToken(openId, { name: userName, expiresInMs: ONE_YEAR_MS });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      const redirectPath = getDashboardPathForRole(invitation.role);
      res.json({ success: true, redirect: redirectPath });
    } catch (error: any) {
      console.error("[Auth] Invite accept failed:", error);
      res.status(500).json({ error: "Failed to accept invitation" });
    }
  });
}
