import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  InsertDemoLead, demoLeads,
  InsertCompany, companies,
  InsertSubscription, subscriptions,
  InsertEmployeeProfile, employeeProfiles,
  InsertEmployeeDocument, employeeDocuments,
  InsertPayrollRecord, payrollRecords,
  InsertPerformanceReview, performanceReviews,
  InsertHiringRecord, hiringRecords,
  InsertSsoConfig, ssoConfigs
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================
// USER QUERIES
// ============================================================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      email: user.email || "",
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      (values as Record<string, any>)[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================
// COMPANY QUERIES
// ============================================================
export async function createCompany(company: InsertCompany) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(companies).values(company);
  // Get the created company to return its ID
  const created = await db.select().from(companies).orderBy((t) => t.id).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getCompanyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCompany(id: number, updates: Partial<InsertCompany>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(companies).set(updates).where(eq(companies.id, id));
}

// ============================================================
// SUBSCRIPTION QUERIES
// ============================================================
export async function createSubscription(subscription: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(subscriptions).values(subscription);
  const created = await db.select().from(subscriptions).orderBy((t) => t.id).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getSubscriptionByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.companyId, companyId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function checkSeatAvailability(companyId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const subscription = await getSubscriptionByCompanyId(companyId);
  if (!subscription) return false;
  
  return subscription.usedSeats < subscription.seats;
}

// ============================================================
// EMPLOYEE PROFILE QUERIES
// ============================================================
export async function createEmployeeProfile(profile: InsertEmployeeProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(employeeProfiles).values(profile);
  const created = await db.select().from(employeeProfiles).orderBy((t) => t.id).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getEmployeesByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employeeProfiles).where(eq(employeeProfiles.companyId, companyId));
}

export async function getEmployeeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(employeeProfiles).where(eq(employeeProfiles.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateEmployeeProfile(id: number, updates: Partial<InsertEmployeeProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(employeeProfiles).set(updates).where(eq(employeeProfiles.id, id));
}

export async function deleteEmployee(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(employeeProfiles).where(eq(employeeProfiles.id, id));
}

// ============================================================
// EMPLOYEE DOCUMENT QUERIES
// ============================================================
export async function uploadEmployeeDocument(doc: InsertEmployeeDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(employeeDocuments).values(doc);
  const created = await db.select().from(employeeDocuments).orderBy((t) => t.id).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getEmployeeDocuments(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employeeDocuments).where(eq(employeeDocuments.employeeId, employeeId));
}

// ============================================================
// PAYROLL QUERIES
// ============================================================
export async function createPayrollRecord(record: InsertPayrollRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(payrollRecords).values(record);
  const created = await db.select().from(payrollRecords).orderBy((t) => t.id).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getPayrollByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payrollRecords).where(eq(payrollRecords.companyId, companyId));
}

// ============================================================
// PERFORMANCE REVIEW QUERIES
// ============================================================
export async function createPerformanceReview(review: InsertPerformanceReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(performanceReviews).values(review);
  const created = await db.select().from(performanceReviews).orderBy((t) => t.id).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getPerformanceReviewsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(performanceReviews).where(eq(performanceReviews.companyId, companyId));
}

// ============================================================
// HIRING QUERIES
// ============================================================
export async function createHiringRecord(record: InsertHiringRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(hiringRecords).values(record);
  const created = await db.select().from(hiringRecords).orderBy((t) => t.id).limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function getHiringByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(hiringRecords).where(eq(hiringRecords.companyId, companyId));
}

// ============================================================
// DEMO LEADS (Legacy)
// ============================================================
export async function createDemoLead(lead: InsertDemoLead) {
  const db = await getDb();
  if (!db) {
    console.error("[Database] Cannot create demo lead: database not available");
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(demoLeads).values(lead);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create demo lead:", error);
    throw error;
  }
}

// ============================================================
// SSO CONFIGURATION QUERIES
// ============================================================
export async function getSsoConfigsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ssoConfigs).where(eq(ssoConfigs.companyId, companyId));
}

export async function getSsoConfigById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(ssoConfigs).where(eq(ssoConfigs.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSsoConfig(config: InsertSsoConfig) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(ssoConfigs).values(config);
  // MySQL insert returns insertId in the result
  const insertId = (result as any).insertId || (result as any)[0]?.insertId || 0;
  if (insertId > 0) {
    return { insertId };
  }
  // Fallback: get the last inserted record
  const created = await db.select().from(ssoConfigs)
    .where(eq(ssoConfigs.companyId, config.companyId))
    .orderBy((t) => t.id)
    .limit(1);
  return { insertId: created[0]?.id || 0 };
}

export async function updateSsoConfig(id: number, updates: Partial<InsertSsoConfig>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(ssoConfigs).set(updates).where(eq(ssoConfigs.id, id));
}

export async function deleteSsoConfig(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(ssoConfigs).where(eq(ssoConfigs.id, id));
}
