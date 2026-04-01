import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { 
  createDemoLead, 
  createCompany, 
  getCompanyById,
  updateCompany,
  createSubscription,
  getSubscriptionByCompanyId,
  checkSeatAvailability,
  createEmployeeProfile,
  getEmployeesByCompanyId,
  updateEmployeeProfile,
  deleteEmployee,
  uploadEmployeeDocument,
  getEmployeeDocuments,
  createPayrollRecord,
  getPayrollByCompanyId,
  createPerformanceReview,
  getPerformanceReviewsByCompanyId,
  createHiringRecord,
  getHiringByCompanyId,
  upsertUser,
  getUserById
} from "./db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// ============================================================
// PROTECTED PROCEDURE WITH COMPANY CONTEXT
// ============================================================
const companyProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user.companyId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "No company associated with user" });
  }
  return next({ ctx: { ...ctx, companyId: ctx.user.companyId } });
});

export const appRouter = router({
  system: systemRouter,
  
  // ============================================================
  // AUTH ROUTER
  // ============================================================
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============================================================
  // COMPANY ROUTER (KYC, Onboarding, Setup)
  // ============================================================
  company: router({
    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          industry: z.string().optional(),
          size: z.string().optional(),
          website: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const result = await createCompany({
            name: input.name,
            industry: input.industry,
            size: input.size,
            website: input.website,
            status: "onboarding",
          });
          return { success: true, companyId: result.insertId };
        } catch (error) {
          console.error("Failed to create company:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create company" });
        }
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const company = await getCompanyById(input.id);
        if (!company) throw new TRPCError({ code: "NOT_FOUND", message: "Company not found" });
        return company;
      }),

    updateBranding: companyProcedure
      .input(
        z.object({
          logoUrl: z.string().optional(),
          primaryColor: z.string().optional(),
          secondaryColor: z.string().optional(),
          customDomain: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          await updateCompany(ctx.companyId, input);
          return { success: true };
        } catch (error) {
          console.error("Failed to update branding:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update branding" });
        }
      }),

    verifyKYC: companyProcedure.mutation(async ({ ctx }) => {
      try {
        await updateCompany(ctx.companyId, { kycVerified: true, status: "active" });
        return { success: true };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to verify KYC" });
      }
    }),
  }),

  // ============================================================
  // SUBSCRIPTION ROUTER (Seat-Based Licensing)
  // ============================================================
  subscription: router({
    create: publicProcedure
      .input(
        z.object({
          companyId: z.number(),
          tier: z.enum(["starter", "growth", "enterprise"]),
          seats: z.number().min(1),
          price: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const result = await createSubscription({
            companyId: input.companyId,
            tier: input.tier,
            seats: input.seats,
            price: input.price,
            billingCycle: "monthly",
            status: "active",
          });
          return { success: true, subscriptionId: result.insertId };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create subscription" });
        }
      }),

    getByCompanyId: companyProcedure.query(async ({ ctx }) => {
      const subscription = await getSubscriptionByCompanyId(ctx.companyId);
      return subscription || null;
    }),

    checkSeatAvailability: companyProcedure.query(async ({ ctx }) => {
      const available = await checkSeatAvailability(ctx.companyId);
      return { available };
    }),
  }),

  // ============================================================
  // EMPLOYEE ROUTER (HR Management)
  // ============================================================
  employee: router({
    create: companyProcedure
      .input(
        z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email(),
          department: z.string().optional(),
          position: z.string().optional(),
          employmentType: z.enum(["full_time", "part_time", "contract", "temporary"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Check seat availability
        const seatAvailable = await checkSeatAvailability(ctx.companyId);
        if (!seatAvailable) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No available seats in subscription" });
        }

        try {
          // Create employee profile
          const result = await createEmployeeProfile({
            companyId: ctx.companyId,
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            department: input.department,
            position: input.position,
            employmentType: input.employmentType || "full_time",
            status: "active",
            userId: ctx.user?.id || 0,
          });

          // Create user account for employee
          await upsertUser({
            openId: `employee-${result.insertId}`,
            email: input.email,
            name: `${input.firstName} ${input.lastName}`,
            role: "employee",
            companyId: ctx.companyId,
          });

          return { success: true, employeeId: result.insertId };
        } catch (error) {
          console.error("Failed to create employee:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create employee" });
        }
      }),

    list: companyProcedure.query(async ({ ctx }) => {
      return getEmployeesByCompanyId(ctx.companyId);
    }),

    getById: companyProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const employee = await getEmployeesByCompanyId(ctx.companyId);
        const found = employee.find(e => e.id === input.id);
        if (!found) throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
        return found;
      }),

    update: companyProcedure
      .input(
        z.object({
          id: z.number(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          department: z.string().optional(),
          position: z.string().optional(),
          status: z.enum(["active", "inactive", "on_leave", "offboarded"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          await updateEmployeeProfile(input.id, {
            firstName: input.firstName,
            lastName: input.lastName,
            department: input.department,
            position: input.position,
            status: input.status,
          });
          return { success: true };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update employee" });
        }
      }),

    delete: companyProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          await deleteEmployee(input.id);
          return { success: true };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete employee" });
        }
      }),

    uploadDocument: companyProcedure
      .input(
        z.object({
          employeeId: z.number(),
          documentType: z.enum(["employment_contract", "offer_letter", "nda", "handbook", "other"]),
          fileName: z.string(),
          fileUrl: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const result = await uploadEmployeeDocument({
            employeeId: input.employeeId,
            companyId: ctx.companyId,
            documentType: input.documentType,
            fileName: input.fileName,
            fileUrl: input.fileUrl,
            uploadedBy: ctx.user.id,
          });
          return { success: true, documentId: result.insertId };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to upload document" });
        }
      }),

    getDocuments: companyProcedure
      .input(z.object({ employeeId: z.number() }))
      .query(async ({ input }) => {
        return getEmployeeDocuments(input.employeeId);
      }),
  }),

  // ============================================================
  // PAYROLL ROUTER
  // ============================================================
  payroll: router({
    create: companyProcedure
      .input(
        z.object({
          employeeId: z.number(),
          payrollCycle: z.string(),
          baseSalary: z.string(),
          grossPay: z.string(),
          deductions: z.string().optional(),
          netPay: z.string(),
          currency: z.string().optional(),
          country: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const result = await createPayrollRecord({
            companyId: ctx.companyId,
            employeeId: input.employeeId,
            payrollCycle: input.payrollCycle,
            baseSalary: input.baseSalary,
            grossPay: input.grossPay,
            deductions: input.deductions || "0",
            netPay: input.netPay,
            currency: input.currency || "USD",
            country: input.country,
            status: "draft",
          });
          return { success: true, payrollId: result.insertId };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create payroll record" });
        }
      }),

    list: companyProcedure.query(async ({ ctx }) => {
      return getPayrollByCompanyId(ctx.companyId);
    }),
  }),

  // ============================================================
  // PERFORMANCE ROUTER
  // ============================================================
  performance: router({
    create: companyProcedure
      .input(
        z.object({
          employeeId: z.number(),
          reviewPeriod: z.string(),
          rating: z.number().optional(),
          comments: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const result = await createPerformanceReview({
            companyId: ctx.companyId,
            employeeId: input.employeeId,
            reviewerId: ctx.user.id,
            reviewPeriod: input.reviewPeriod,
            rating: input.rating,
            comments: input.comments,
            status: "draft",
          });
          return { success: true, reviewId: result.insertId };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create performance review" });
        }
      }),

    list: companyProcedure.query(async ({ ctx }) => {
      return getPerformanceReviewsByCompanyId(ctx.companyId);
    }),
  }),

  // ============================================================
  // HIRING ROUTER
  // ============================================================
  hiring: router({
    create: companyProcedure
      .input(
        z.object({
          jobTitle: z.string(),
          department: z.string().optional(),
          candidateName: z.string(),
          candidateEmail: z.string().email(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const result = await createHiringRecord({
            companyId: ctx.companyId,
            jobTitle: input.jobTitle,
            department: input.department,
            candidateName: input.candidateName,
            candidateEmail: input.candidateEmail,
            status: "applied",
          });
          return { success: true, hiringId: result.insertId };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create hiring record" });
        }
      }),

    list: companyProcedure.query(async ({ ctx }) => {
      return getHiringByCompanyId(ctx.companyId);
    }),
  }),

  // ============================================================
  // DEMO ROUTER (Legacy)
  // ============================================================
  demo: router({
    submitLead: publicProcedure
      .input(
        z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email(),
          company: z.string().min(1),
          jobTitle: z.string().optional(),
          companySize: z.string().optional(),
          primaryInterest: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await createDemoLead(input);
          return { success: true, message: "Demo request submitted successfully" };
        } catch (error) {
          console.error("Failed to submit demo lead:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to submit demo request" });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
