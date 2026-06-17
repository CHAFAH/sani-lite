import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure, hrAdminProcedure, managerProcedure } from "./_core/trpc";
import { 
  createDemoLead, createCompany, getCompanyById, updateCompany,
  createSubscription, getSubscriptionByCompanyId, checkSeatAvailability,
  createEmployeeProfile, getEmployeesByCompanyId, updateEmployeeProfile, deleteEmployee, getEmployeeCountByDepartment,
  uploadEmployeeDocument, getEmployeeDocuments,
  createTimeOffRequest, getTimeOffByCompanyId, getTimeOffByEmployeeId, updateTimeOffRequest,
  createWorkflow, getWorkflowsByCompanyId, getWorkflowById, updateWorkflow, deleteWorkflow,
  createWorkflowInstance, getWorkflowInstancesByCompanyId, updateWorkflowInstance,
  createPayrollRecord, getPayrollByCompanyId, updatePayrollRecord,
  createPayrollCycle, getPayrollCyclesByCompanyId, updatePayrollCycle,
  createBenefitPlan, getBenefitPlansByCompanyId, updateBenefitPlan, deleteBenefitPlan,
  createBenefitEnrollment, getBenefitEnrollmentsByCompanyId, getBenefitEnrollmentsByEmployeeId, updateBenefitEnrollment,
  createPerformanceReview, getPerformanceReviewsByCompanyId, updatePerformanceReview,
  createGoal, getGoalsByCompanyId, getGoalsByEmployeeId, updateGoal, deleteGoal,
  createJobPosting, getJobPostingsByCompanyId, updateJobPosting, deleteJobPosting,
  createHiringRecord, getHiringByCompanyId, updateHiringRecord, deleteHiringRecord,
  createCourse, getCoursesByCompanyId, updateCourse, deleteCourse,
  createCourseAssignment, getCourseAssignmentsByCompanyId, getCourseAssignmentsByEmployeeId, updateCourseAssignment,
  createCompensationRecord, getCompensationByCompanyId, getCompensationByEmployeeId, updateCompensationRecord,
  createSalaryBand, getSalaryBandsByCompanyId, updateSalaryBand, deleteSalaryBand,
  createAnnouncement, getAnnouncementsByCompanyId, updateAnnouncement, deleteAnnouncement,
  upsertUser, getUserById,
  getSsoConfigsByCompanyId, getSsoConfigById, createSsoConfig, updateSsoConfig, deleteSsoConfig,
  createDepartment, getDepartmentsByCompanyId, updateDepartment, deleteDepartment,
  createCustomRole, getCustomRolesByCompanyId, updateCustomRole, deleteCustomRole,
  getAllPermissions, assignPermissionToRole, removePermissionFromRole, getPermissionsByRoleId,
  assignRoleToUser, getUserRoleAssignments, removeRoleFromUser,
  upsertPersonalDetails, getPersonalDetailsByEmployeeId,
  createInvitation, getInvitationsByCompanyId, getInvitationByToken, updateInvitation,
  createFeedback, getFeedbackByEmployeeId, getFeedbackByCompanyId,
  getEmployeeByUserId, getEmployeesByManagerId, updateUserRole, updateUserProfileCompleted, getUsersByCompanyId,
  setUserCompanyId,
  // Payslips
  createPayslip, getPayslipsByCompany, getPayslipsByEmployee, updatePayslip, getPayslipById,
  getEmployeeById,
  // Finance OS
  createExpense, getExpensesByCompanyId, updateExpenseStatus,
  createCorporateCard, getCorporateCardsByCompanyId, updateCardStatus,
  createBudget, getBudgetsByCompanyId, updateBudgetSpent,
  // IT & Identity OS
  createDevice, getDevicesByCompanyId, updateDeviceStatus,
  createAppProvisioning, getAppProvisioningByCompanyId, updateAppProvisioningStatus,
  createAccessControl, getAccessControlByCompanyId,
  // AI Intelligence
  createPrediction, getPredictionsByCompanyId, updatePredictionStatus,
  createRecommendation, getRecommendationsByCompanyId, updateRecommendationStatus,
  createAIChatHistory, getAIChatHistoryByCompanyId,
  // Developer Platform
  createWebhook, getWebhooksByCompanyId, updateWebhookStatus,
  getMarketplaceApps, createMarketplaceInstallation, getMarketplaceInstallationsByCompanyId,
  deletePayslip,
} from "./db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { sendInvitationEmail } from "./email";

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
  // COMPANY ROUTER
  // ============================================================
  company: router({
    get: companyProcedure.query(async ({ ctx }) => {
      return getCompanyById(ctx.companyId);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        industry: z.string().optional(),
        size: z.string().optional(),
        website: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createCompany({ name: input.name, industry: input.industry, size: input.size, website: input.website, status: "onboarding" });
        const companyId = result.insertId;
        // Link this company to the user who created it
        await setUserCompanyId(ctx.user.openId, companyId);
        return { success: true, companyId };
      }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const company = await getCompanyById(input.id);
        if (!company) throw new TRPCError({ code: "NOT_FOUND", message: "Company not found" });
        return company;
      }),
    updateBranding: companyProcedure
      .input(z.object({ logoUrl: z.string().optional(), primaryColor: z.string().optional(), secondaryColor: z.string().optional(), customDomain: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        await updateCompany(ctx.companyId, input);
        return { success: true };
      }),
    verifyKYC: companyProcedure.mutation(async ({ ctx }) => {
      await updateCompany(ctx.companyId, { kycVerified: true, status: "active" });
      return { success: true };
    }),
    update: companyProcedure
      .input(z.object({
        name: z.string().optional(),
        industry: z.string().optional(),
        size: z.string().optional(),
        website: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        country: z.string().optional(),
        address: z.string().optional(),
        customDomain: z.string().optional(),
        logoUrl: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await updateCompany(ctx.companyId, input);
        return { success: true };
      }),
    completeOnboarding: companyProcedure.mutation(async ({ ctx }) => {
      await updateCompany(ctx.companyId, { onboardingCompleted: true, status: "active" });
      return { success: true };
    }),
    uploadLogo: companyProcedure
      .input(z.object({ logoData: z.string(), mimeType: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const { storagePut } = await import("./storage");
        const buffer = Buffer.from(input.logoData, "base64");
        const ext = input.mimeType.split("/")[1] || "png";
        const fileKey = `company-${ctx.companyId}/logo-${Date.now()}.${ext}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        await updateCompany(ctx.companyId, { logoUrl: url });
        return { success: true, logoUrl: url };
      }),
  }),

  // ============================================================
  // SUBSCRIPTION ROUTER
  // ============================================================
  subscription: router({
    create: publicProcedure
      .input(z.object({ companyId: z.number(), tier: z.enum(["starter", "growth", "enterprise"]), seats: z.number().min(1), price: z.string() }))
      .mutation(async ({ input }) => {
        const result = await createSubscription({ companyId: input.companyId, tier: input.tier, seats: input.seats, price: input.price, billingCycle: "monthly", status: "active" });
        return { success: true, subscriptionId: result.insertId };
      }),
    getByCompanyId: companyProcedure.query(async ({ ctx }) => {
      return (await getSubscriptionByCompanyId(ctx.companyId)) || null;
    }),
    checkSeatAvailability: companyProcedure.query(async ({ ctx }) => {
      return { available: await checkSeatAvailability(ctx.companyId) };
    }),
  }),

  // ============================================================
  // EMPLOYEE ROUTER
  // ============================================================
  employee: router({
    create: companyProcedure
      .input(z.object({
        firstName: z.string().min(1), lastName: z.string().min(1), email: z.string().email(),
        department: z.string().optional(), position: z.string().optional(), phone: z.string().optional(),
        country: z.string().optional(), city: z.string().optional(), managerId: z.number().optional(),
        salary: z.string().optional(), currency: z.string().optional(), startDate: z.string().optional(),
        employmentType: z.enum(["full_time", "part_time", "contract", "temporary"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const seatAvailable = await checkSeatAvailability(ctx.companyId);
        if (!seatAvailable) throw new TRPCError({ code: "FORBIDDEN", message: "No available seats in subscription" });
        const result = await createEmployeeProfile({
          companyId: ctx.companyId, firstName: input.firstName, lastName: input.lastName, email: input.email,
          department: input.department, position: input.position, phone: input.phone,
          country: input.country, city: input.city, managerId: input.managerId,
          salary: input.salary, currency: input.currency || "USD",
          startDate: input.startDate ? new Date(input.startDate) : new Date(),
          employmentType: input.employmentType || "full_time", status: "active", userId: ctx.user?.id || 0,
        });
        await upsertUser({ openId: `employee-${result.insertId}`, email: input.email, name: `${input.firstName} ${input.lastName}`, role: "employee", companyId: ctx.companyId });
        return { success: true, employeeId: result.insertId };
      }),
    list: companyProcedure.query(async ({ ctx }) => getEmployeesByCompanyId(ctx.companyId)),
    getById: companyProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
      const employees = await getEmployeesByCompanyId(ctx.companyId);
      const found = employees.find(e => e.id === input.id);
      if (!found) throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
      return found;
    }),
    update: companyProcedure
      .input(z.object({
        id: z.number(), firstName: z.string().optional(), lastName: z.string().optional(),
        department: z.string().optional(), position: z.string().optional(), phone: z.string().optional(),
        country: z.string().optional(), city: z.string().optional(), managerId: z.number().optional(),
        salary: z.string().optional(), currency: z.string().optional(),
        status: z.enum(["active", "inactive", "on_leave", "offboarded"]).optional(),
        profilePictureUrl: z.string().optional(), coverPhotoUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateEmployeeProfile(id, updates);
        return { success: true };
      }),
    delete: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteEmployee(input.id);
      return { success: true };
    }),
    uploadDocument: companyProcedure
      .input(z.object({ employeeId: z.number(), documentType: z.enum(["employment_contract", "offer_letter", "nda", "handbook", "other"]), fileName: z.string(), fileUrl: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const result = await uploadEmployeeDocument({ employeeId: input.employeeId, companyId: ctx.companyId, documentType: input.documentType, fileName: input.fileName, fileUrl: input.fileUrl, uploadedBy: ctx.user.id });
        return { success: true, documentId: result.insertId };
      }),
    getDocuments: companyProcedure.input(z.object({ employeeId: z.number() })).query(async ({ input }) => getEmployeeDocuments(input.employeeId)),
    departmentBreakdown: companyProcedure.query(async ({ ctx }) => getEmployeeCountByDepartment(ctx.companyId)),
  }),

  // ============================================================
  // TIME-OFF ROUTER
  // ============================================================
  timeOff: router({
    create: companyProcedure
      .input(z.object({
        employeeId: z.number(), type: z.enum(["vacation", "sick", "personal", "parental", "bereavement", "other"]),
        startDate: z.string(), endDate: z.string(), days: z.number().min(1), reason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createTimeOffRequest({
          companyId: ctx.companyId, employeeId: input.employeeId, type: input.type,
          startDate: new Date(input.startDate), endDate: new Date(input.endDate), days: input.days, reason: input.reason,
        });
        return { success: true, requestId: result.insertId };
      }),
    list: companyProcedure.query(async ({ ctx }) => getTimeOffByCompanyId(ctx.companyId)),
    listByEmployee: companyProcedure.input(z.object({ employeeId: z.number() })).query(async ({ input }) => getTimeOffByEmployeeId(input.employeeId)),
    approve: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      await updateTimeOffRequest(input.id, { status: "approved", approvedBy: ctx.user.id, approvedAt: new Date() });
      return { success: true };
    }),
    reject: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await updateTimeOffRequest(input.id, { status: "rejected" });
      return { success: true };
    }),
    cancel: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await updateTimeOffRequest(input.id, { status: "cancelled" });
      return { success: true };
    }),
  }),

  // ============================================================
  // WORKFLOW ROUTER
  // ============================================================
  workflow: router({
    create: companyProcedure
      .input(z.object({
        name: z.string().min(1), description: z.string().optional(),
        triggerType: z.enum(["new_hire", "offboarding", "promotion", "time_off", "review_cycle", "custom"]),
        steps: z.array(z.object({ name: z.string(), type: z.string(), assignee: z.string().optional(), description: z.string().optional() })).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createWorkflow({ companyId: ctx.companyId, name: input.name, description: input.description, triggerType: input.triggerType, steps: input.steps || [], createdBy: ctx.user.id });
        return { success: true, workflowId: result.insertId };
      }),
    list: companyProcedure.query(async ({ ctx }) => getWorkflowsByCompanyId(ctx.companyId)),
    getById: companyProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const wf = await getWorkflowById(input.id);
      if (!wf) throw new TRPCError({ code: "NOT_FOUND", message: "Workflow not found" });
      return wf;
    }),
    update: companyProcedure.input(z.object({
      id: z.number(), name: z.string().optional(), description: z.string().optional(), isActive: z.boolean().optional(),
      steps: z.array(z.object({ name: z.string(), type: z.string(), assignee: z.string().optional(), description: z.string().optional() })).optional(),
    })).mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await updateWorkflow(id, updates);
      return { success: true };
    }),
    delete: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteWorkflow(input.id);
      return { success: true };
    }),
    // Workflow Instances
    startInstance: companyProcedure.input(z.object({ workflowId: z.number(), employeeId: z.number().optional(), data: z.record(z.string(), z.any()).optional() }))
      .mutation(async ({ input, ctx }) => {
        const result = await createWorkflowInstance({ workflowId: input.workflowId, companyId: ctx.companyId, employeeId: input.employeeId, data: input.data });
        return { success: true, instanceId: result.insertId };
      }),
    listInstances: companyProcedure.query(async ({ ctx }) => getWorkflowInstancesByCompanyId(ctx.companyId)),
    advanceInstance: companyProcedure.input(z.object({ id: z.number(), currentStep: z.number() })).mutation(async ({ input }) => {
      await updateWorkflowInstance(input.id, { currentStep: input.currentStep });
      return { success: true };
    }),
    completeInstance: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await updateWorkflowInstance(input.id, { status: "completed", completedAt: new Date() });
      return { success: true };
    }),
  }),

  // ============================================================
  // PAYROLL ROUTER
  // ============================================================
  payroll: router({
    create: companyProcedure
      .input(z.object({
        employeeId: z.number(), payrollCycle: z.string(), baseSalary: z.string(), grossPay: z.string(),
        deductions: z.string().optional(), netPay: z.string(), currency: z.string().optional(), country: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createPayrollRecord({
          companyId: ctx.companyId, employeeId: input.employeeId, payrollCycle: input.payrollCycle,
          baseSalary: input.baseSalary, grossPay: input.grossPay, deductions: input.deductions || "0",
          netPay: input.netPay, currency: input.currency || "USD", country: input.country, status: "draft",
        });
        return { success: true, payrollId: result.insertId };
      }),
    list: companyProcedure.query(async ({ ctx }) => getPayrollByCompanyId(ctx.companyId)),
    approve: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await updatePayrollRecord(input.id, { status: "approved" });
      return { success: true };
    }),
    process: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await updatePayrollRecord(input.id, { status: "processed" });
      return { success: true };
    }),
    markPaid: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await updatePayrollRecord(input.id, { status: "paid", paymentDate: new Date() });
      return { success: true };
    }),
  }),

  // ============================================================
  // PAYROLL CYCLE ROUTER
  // ============================================================
  payrollCycle: router({
    create: companyProcedure
      .input(z.object({
        name: z.string().min(1), periodStart: z.string(), periodEnd: z.string(), payDate: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createPayrollCycle({
          companyId: ctx.companyId, name: input.name,
          periodStart: new Date(input.periodStart), periodEnd: new Date(input.periodEnd), payDate: new Date(input.payDate),
        });
        return { success: true, cycleId: result.insertId };
      }),
    list: companyProcedure.query(async ({ ctx }) => getPayrollCyclesByCompanyId(ctx.companyId)),
    approve: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      await updatePayrollCycle(input.id, { status: "approved", approvedBy: ctx.user.id, approvedAt: new Date() });
      return { success: true };
    }),
    process: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await updatePayrollCycle(input.id, { status: "processing" });
      return { success: true };
    }),
    markPaid: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await updatePayrollCycle(input.id, { status: "paid" });
      return { success: true };
    }),
  }),

  // ============================================================
  // BENEFITS ROUTER
  // ============================================================
  benefits: router({
    createPlan: companyProcedure
      .input(z.object({
        name: z.string().min(1), type: z.enum(["health", "dental", "vision", "life", "retirement", "wellness", "other"]),
        description: z.string().optional(), provider: z.string().optional(),
        cost: z.string().optional(), employerContribution: z.string().optional(), eligibility: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createBenefitPlan({ companyId: ctx.companyId, name: input.name, type: input.type, description: input.description, provider: input.provider, cost: input.cost, employerContribution: input.employerContribution, eligibility: input.eligibility });
        return { success: true, planId: result.insertId };
      }),
    listPlans: companyProcedure.query(async ({ ctx }) => getBenefitPlansByCompanyId(ctx.companyId)),
    updatePlan: companyProcedure.input(z.object({
      id: z.number(), name: z.string().optional(), description: z.string().optional(), provider: z.string().optional(),
      cost: z.string().optional(), employerContribution: z.string().optional(), isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await updateBenefitPlan(id, updates);
      return { success: true };
    }),
    deletePlan: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteBenefitPlan(input.id);
      return { success: true };
    }),
    enroll: companyProcedure
      .input(z.object({ employeeId: z.number(), planId: z.number(), effectiveDate: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const result = await createBenefitEnrollment({
          companyId: ctx.companyId, employeeId: input.employeeId, planId: input.planId,
          status: "enrolled", enrolledAt: new Date(), effectiveDate: input.effectiveDate ? new Date(input.effectiveDate) : new Date(),
        });
        return { success: true, enrollmentId: result.insertId };
      }),
    listEnrollments: companyProcedure.query(async ({ ctx }) => getBenefitEnrollmentsByCompanyId(ctx.companyId)),
    listEnrollmentsByEmployee: companyProcedure.input(z.object({ employeeId: z.number() })).query(async ({ input }) => getBenefitEnrollmentsByEmployeeId(input.employeeId)),
    updateEnrollment: companyProcedure.input(z.object({
      id: z.number(), status: z.enum(["enrolled", "pending", "waived", "terminated"]).optional(),
    })).mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await updateBenefitEnrollment(id, updates);
      return { success: true };
    }),
  }),

  // ============================================================
  // PERFORMANCE ROUTER
  // ============================================================
  performance: router({
    create: companyProcedure
      .input(z.object({
        employeeId: z.number(), reviewPeriod: z.string(), rating: z.number().optional(),
        comments: z.string().optional(), strengths: z.string().optional(), improvements: z.string().optional(),
        goals: z.array(z.object({ title: z.string(), status: z.string(), progress: z.number() })).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createPerformanceReview({
          companyId: ctx.companyId, employeeId: input.employeeId, reviewerId: ctx.user.id,
          reviewPeriod: input.reviewPeriod, rating: input.rating, comments: input.comments,
          strengths: input.strengths, improvements: input.improvements, goals: input.goals, status: "draft",
        });
        return { success: true, reviewId: result.insertId };
      }),
    list: companyProcedure.query(async ({ ctx }) => getPerformanceReviewsByCompanyId(ctx.companyId)),
    update: companyProcedure.input(z.object({
      id: z.number(), rating: z.number().optional(), comments: z.string().optional(),
      strengths: z.string().optional(), improvements: z.string().optional(),
      status: z.enum(["draft", "submitted", "completed"]).optional(),
    })).mutation(async ({ input }) => {
      const { id, ...updates } = input;
      if (updates.status === "submitted") (updates as any).submittedAt = new Date();
      await updatePerformanceReview(id, updates);
      return { success: true };
    }),
  }),

  // ============================================================
  // GOALS / OKR ROUTER
  // ============================================================
  goals: router({
    create: companyProcedure
      .input(z.object({
        employeeId: z.number(), title: z.string().min(1), description: z.string().optional(),
        type: z.enum(["individual", "team", "company"]).optional(),
        dueDate: z.string().optional(), period: z.string().optional(), parentGoalId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createGoal({
          companyId: ctx.companyId, employeeId: input.employeeId, title: input.title, description: input.description,
          type: input.type || "individual", dueDate: input.dueDate ? new Date(input.dueDate) : undefined, period: input.period, parentGoalId: input.parentGoalId,
        });
        return { success: true, goalId: result.insertId };
      }),
    list: companyProcedure.query(async ({ ctx }) => getGoalsByCompanyId(ctx.companyId)),
    listByEmployee: companyProcedure.input(z.object({ employeeId: z.number() })).query(async ({ input }) => getGoalsByEmployeeId(input.employeeId)),
    update: companyProcedure.input(z.object({
      id: z.number(), title: z.string().optional(), description: z.string().optional(),
      status: z.enum(["not_started", "in_progress", "completed", "cancelled"]).optional(), progress: z.number().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await updateGoal(id, updates);
      return { success: true };
    }),
    delete: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteGoal(input.id);
      return { success: true };
    }),
  }),

  // ============================================================
  // JOB POSTING ROUTER (Hiring)
  // ============================================================
  jobPosting: router({
    create: companyProcedure
      .input(z.object({
        title: z.string().min(1), department: z.string().optional(), location: z.string().optional(),
        type: z.enum(["full_time", "part_time", "contract", "internship"]).optional(),
        description: z.string().optional(), requirements: z.string().optional(),
        salaryMin: z.string().optional(), salaryMax: z.string().optional(), currency: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createJobPosting({
          companyId: ctx.companyId, title: input.title, department: input.department, location: input.location,
          type: input.type || "full_time", description: input.description, requirements: input.requirements,
          salaryMin: input.salaryMin, salaryMax: input.salaryMax, currency: input.currency || "USD",
          status: "draft", hiringManagerId: ctx.user.id,
        });
        return { success: true, postingId: result.insertId };
      }),
    list: companyProcedure.query(async ({ ctx }) => getJobPostingsByCompanyId(ctx.companyId)),
    update: companyProcedure.input(z.object({
      id: z.number(), title: z.string().optional(), department: z.string().optional(),
      location: z.string().optional(), description: z.string().optional(), requirements: z.string().optional(),
      status: z.enum(["draft", "open", "closed", "on_hold"]).optional(),
    })).mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await updateJobPosting(id, updates);
      return { success: true };
    }),
    delete: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteJobPosting(input.id);
      return { success: true };
    }),
  }),

  // ============================================================
  // HIRING (APPLICANT TRACKING) ROUTER
  // ============================================================
  hiring: router({
    create: companyProcedure
      .input(z.object({
        jobPostingId: z.number().optional(), jobTitle: z.string(), department: z.string().optional(),
        candidateName: z.string(), candidateEmail: z.string().email(), candidatePhone: z.string().optional(),
        resumeUrl: z.string().optional(), source: z.string().optional(), notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createHiringRecord({
          companyId: ctx.companyId, jobPostingId: input.jobPostingId, jobTitle: input.jobTitle, department: input.department,
          candidateName: input.candidateName, candidateEmail: input.candidateEmail, candidatePhone: input.candidatePhone,
          resumeUrl: input.resumeUrl, source: input.source, notes: input.notes, status: "applied",
        });
        return { success: true, hiringId: result.insertId };
      }),
    list: companyProcedure.query(async ({ ctx }) => getHiringByCompanyId(ctx.companyId)),
    updateStatus: companyProcedure.input(z.object({
      id: z.number(), status: z.enum(["applied", "screening", "interview", "offer", "hired", "rejected"]),
      notes: z.string().optional(), rating: z.number().optional(), interviewDate: z.string().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const data: any = { ...updates };
      if (updates.interviewDate) data.interviewDate = new Date(updates.interviewDate);
      await updateHiringRecord(id, data);
      return { success: true };
    }),
    delete: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteHiringRecord(input.id);
      return { success: true };
    }),
  }),

  // ============================================================
  // LEARNING ROUTER
  // ============================================================
  learning: router({
    createCourse: companyProcedure
      .input(z.object({
        title: z.string().min(1), description: z.string().optional(), category: z.string().optional(),
        duration: z.number().optional(), type: z.enum(["required", "optional", "recommended"]).optional(),
        contentUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createCourse({ companyId: ctx.companyId, title: input.title, description: input.description, category: input.category, duration: input.duration, type: input.type || "optional", contentUrl: input.contentUrl, createdBy: ctx.user.id });
        return { success: true, courseId: result.insertId };
      }),
    listCourses: companyProcedure.query(async ({ ctx }) => getCoursesByCompanyId(ctx.companyId)),
    updateCourse: companyProcedure.input(z.object({
      id: z.number(), title: z.string().optional(), description: z.string().optional(),
      category: z.string().optional(), duration: z.number().optional(), isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await updateCourse(id, updates);
      return { success: true };
    }),
    deleteCourse: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteCourse(input.id);
      return { success: true };
    }),
    assignCourse: companyProcedure
      .input(z.object({ courseId: z.number(), employeeId: z.number(), dueDate: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const result = await createCourseAssignment({
          companyId: ctx.companyId, courseId: input.courseId, employeeId: input.employeeId,
          dueDate: input.dueDate ? new Date(input.dueDate) : undefined, assignedBy: ctx.user.id,
        });
        return { success: true, assignmentId: result.insertId };
      }),
    listAssignments: companyProcedure.query(async ({ ctx }) => getCourseAssignmentsByCompanyId(ctx.companyId)),
    listAssignmentsByEmployee: companyProcedure.input(z.object({ employeeId: z.number() })).query(async ({ input }) => getCourseAssignmentsByEmployeeId(input.employeeId)),
    updateAssignment: companyProcedure.input(z.object({
      id: z.number(), status: z.enum(["assigned", "in_progress", "completed", "overdue"]).optional(), progress: z.number().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...updates } = input;
      if (updates.status === "completed") (updates as any).completedAt = new Date();
      await updateCourseAssignment(id, updates);
      return { success: true };
    }),
  }),

  // ============================================================
  // COMPENSATION ROUTER
  // ============================================================
  compensation: router({
    create: companyProcedure
      .input(z.object({
        employeeId: z.number(), type: z.enum(["base_salary", "bonus", "equity", "commission", "adjustment"]),
        amount: z.string(), currency: z.string().optional(), effectiveDate: z.string(), reason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createCompensationRecord({
          companyId: ctx.companyId, employeeId: input.employeeId, type: input.type,
          amount: input.amount, currency: input.currency || "USD",
          effectiveDate: new Date(input.effectiveDate), reason: input.reason, approvedBy: ctx.user.id, status: "pending",
        });
        return { success: true, recordId: result.insertId };
      }),
    list: companyProcedure.query(async ({ ctx }) => getCompensationByCompanyId(ctx.companyId)),
    listByEmployee: companyProcedure.input(z.object({ employeeId: z.number() })).query(async ({ input }) => getCompensationByEmployeeId(input.employeeId)),
    approve: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      await updateCompensationRecord(input.id, { status: "approved", approvedBy: ctx.user.id });
      return { success: true };
    }),
    activate: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await updateCompensationRecord(input.id, { status: "active" });
      return { success: true };
    }),
  }),

  // ============================================================
  // SALARY BAND ROUTER
  // ============================================================
  salaryBand: router({
    create: companyProcedure
      .input(z.object({
        level: z.string().min(1), title: z.string().min(1), department: z.string().optional(),
        minSalary: z.string(), midSalary: z.string(), maxSalary: z.string(), currency: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createSalaryBand({ companyId: ctx.companyId, level: input.level, title: input.title, department: input.department, minSalary: input.minSalary, midSalary: input.midSalary, maxSalary: input.maxSalary, currency: input.currency || "USD" });
        return { success: true, bandId: result.insertId };
      }),
    list: companyProcedure.query(async ({ ctx }) => getSalaryBandsByCompanyId(ctx.companyId)),
    update: companyProcedure.input(z.object({
      id: z.number(), level: z.string().optional(), title: z.string().optional(),
      minSalary: z.string().optional(), midSalary: z.string().optional(), maxSalary: z.string().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await updateSalaryBand(id, updates);
      return { success: true };
    }),
    delete: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteSalaryBand(input.id);
      return { success: true };
    }),
  }),

  // ============================================================
  // ANNOUNCEMENTS ROUTER
  // ============================================================
  announcements: router({
    create: companyProcedure
      .input(z.object({
        title: z.string().min(1), content: z.string().min(1),
        type: z.enum(["general", "urgent", "celebration", "policy"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createAnnouncement({ companyId: ctx.companyId, title: input.title, content: input.content, type: input.type || "general", authorId: ctx.user.id });
        return { success: true, announcementId: result.insertId };
      }),
    list: companyProcedure.query(async ({ ctx }) => getAnnouncementsByCompanyId(ctx.companyId)),
    update: companyProcedure.input(z.object({ id: z.number(), title: z.string().optional(), content: z.string().optional(), isActive: z.boolean().optional() }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateAnnouncement(id, updates);
        return { success: true };
      }),
    delete: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteAnnouncement(input.id);
      return { success: true };
    }),
  }),

  // ============================================================
  // SSO ROUTER
  // ============================================================
  sso: router({
    list: companyProcedure.query(async ({ ctx }) => getSsoConfigsByCompanyId(ctx.companyId)),
    getById: companyProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => getSsoConfigById(input.id)),
    create: companyProcedure
      .input(z.object({ provider: z.enum(["google", "microsoft", "okta", "custom_oidc"]), clientId: z.string().min(1), clientSecret: z.string().min(1), redirectUri: z.string().url(), enabled: z.boolean().default(true), metadata: z.record(z.string(), z.any()).optional() }))
      .mutation(async ({ input, ctx }) => {
        const result = await createSsoConfig({ companyId: ctx.companyId, provider: input.provider, clientId: input.clientId, clientSecret: input.clientSecret, redirectUri: input.redirectUri, enabled: input.enabled, metadata: input.metadata });
        return { success: true, ssoId: result.insertId };
      }),
    update: companyProcedure
      .input(z.object({ id: z.number(), provider: z.enum(["google", "microsoft", "okta", "custom_oidc"]).optional(), clientId: z.string().optional(), clientSecret: z.string().optional(), redirectUri: z.string().url().optional(), enabled: z.boolean().optional(), metadata: z.record(z.string(), z.any()).optional() }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateSsoConfig(id, updates);
        return { success: true };
      }),
    delete: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteSsoConfig(input.id);
      return { success: true };
    }),
  }),

  // ============================================================
  // DEPARTMENT ROUTER
  // ============================================================
  department: router({
    create: companyProcedure
      .input(z.object({ name: z.string().min(1), description: z.string().optional(), parentDepartmentId: z.number().optional(), headId: z.number().optional() }))
      .mutation(async ({ input, ctx }) => {
        const result = await createDepartment({ companyId: ctx.companyId, ...input });
        return { success: true, departmentId: result.insertId };
      }),
    list: companyProcedure.query(async ({ ctx }) => getDepartmentsByCompanyId(ctx.companyId)),
    update: companyProcedure.input(z.object({ id: z.number(), name: z.string().optional(), description: z.string().optional(), parentDepartmentId: z.number().optional(), headId: z.number().optional() }))
      .mutation(async ({ input }) => { const { id, ...updates } = input; await updateDepartment(id, updates); return { success: true }; }),
    delete: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await deleteDepartment(input.id); return { success: true }; }),
  }),

  // ============================================================
  // RBAC ROUTER
  // ============================================================
  rbac: router({
    createRole: companyProcedure
      .input(z.object({ name: z.string().min(1), description: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const result = await createCustomRole({ companyId: ctx.companyId, ...input });
        return { success: true, roleId: result.insertId };
      }),
    listRoles: companyProcedure.query(async ({ ctx }) => getCustomRolesByCompanyId(ctx.companyId)),
    updateRole: companyProcedure.input(z.object({ id: z.number(), name: z.string().optional(), description: z.string().optional() }))
      .mutation(async ({ input }) => { const { id, ...updates } = input; await updateCustomRole(id, updates); return { success: true }; }),
    deleteRole: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await deleteCustomRole(input.id); return { success: true }; }),
    listPermissions: protectedProcedure.query(async () => getAllPermissions()),
    assignPermission: companyProcedure.input(z.object({ roleId: z.number(), permissionId: z.number() }))
      .mutation(async ({ input }) => { await assignPermissionToRole(input); return { success: true }; }),
    removePermission: companyProcedure.input(z.object({ roleId: z.number(), permissionId: z.number() }))
      .mutation(async ({ input }) => { await removePermissionFromRole(input.roleId, input.permissionId); return { success: true }; }),
    getRolePermissions: companyProcedure.input(z.object({ roleId: z.number() })).query(async ({ input }) => getPermissionsByRoleId(input.roleId)),
    assignRoleToUser: companyProcedure.input(z.object({ userId: z.number(), customRoleId: z.number() }))
      .mutation(async ({ input, ctx }) => { await assignRoleToUser({ ...input, companyId: ctx.companyId }); return { success: true }; }),
    getUserRoles: companyProcedure.input(z.object({ userId: z.number() })).query(async ({ input }) => getUserRoleAssignments(input.userId)),
    removeRoleFromUser: companyProcedure.input(z.object({ userId: z.number(), roleId: z.number() }))
      .mutation(async ({ input }) => { await removeRoleFromUser(input.userId, input.roleId); return { success: true }; }),
  }),

  // ============================================================
  // PERSONAL DETAILS ROUTER (Employee Self-Service)
  // ============================================================
  personalDetails: router({
    get: protectedProcedure.input(z.object({ employeeId: z.number() })).query(async ({ input }) => {
      return (await getPersonalDetailsByEmployeeId(input.employeeId)) || null;
    }),
    upsert: protectedProcedure
      .input(z.object({
        employeeId: z.number(),
        dateOfBirth: z.string().optional(), gender: z.string().optional(), nationality: z.string().optional(),
        maritalStatus: z.string().optional(), emergencyContactName: z.string().optional(),
        emergencyContactPhone: z.string().optional(), emergencyContactRelation: z.string().optional(),
        bankName: z.string().optional(), bankAccountNumber: z.string().optional(),
        bankRoutingNumber: z.string().optional(), taxId: z.string().optional(), address: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const data: any = { ...input };
        if (input.dateOfBirth) data.dateOfBirth = new Date(input.dateOfBirth);
        await upsertPersonalDetails(data);
        return { success: true };
      }),
  }),

  // ============================================================
  // INVITATION ROUTER
  // ============================================================
  invitation: router({
    create: companyProcedure
      .input(z.object({
        email: z.string().email(), role: z.enum(["admin", "hr_admin", "manager", "employee"]).optional(),
        departmentId: z.number().optional(), managerId: z.number().optional(),
        origin: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        const result = await createInvitation({
          companyId: ctx.companyId, email: input.email, role: input.role || "employee",
          departmentId: input.departmentId, managerId: input.managerId,
          token, invitedBy: ctx.user.id, expiresAt,
        });

        // Send invitation email
        const company = await getCompanyById(ctx.companyId);
        const origin = input.origin || "http://localhost:3000";
        const inviteLink = `${origin}/invite?token=${token}`;
        let emailSent = false;
        try {
          const emailResult = await sendInvitationEmail({
            recipientEmail: input.email,
            companyName: company?.name || "Your Company",
            companyLogo: company?.logoUrl,
            inviterName: ctx.user.name || "Admin",
            role: input.role || "employee",
            inviteLink,
            expiresAt,
          });
          emailSent = emailResult.success;
          if (!emailResult.success) {
            console.warn(`[Invitation] Email failed for ${input.email}: ${emailResult.error}`);
          }
        } catch (err) {
          console.warn(`[Invitation] Email error for ${input.email}:`, err);
        }

        return { success: true, invitationId: result.insertId, token, emailSent };
      }),
    resend: companyProcedure
      .input(z.object({ id: z.number(), origin: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const invitations = await getInvitationsByCompanyId(ctx.companyId);
        const invitation = invitations.find((i: any) => i.id === input.id);
        if (!invitation) throw new TRPCError({ code: "NOT_FOUND", message: "Invitation not found" });
        if (invitation.status !== "pending") throw new TRPCError({ code: "BAD_REQUEST", message: "Can only resend pending invitations" });

        const company = await getCompanyById(ctx.companyId);
        const origin = input.origin || "http://localhost:3000";
        const inviteLink = `${origin}/invite?token=${invitation.token}`;
        const emailResult = await sendInvitationEmail({
          recipientEmail: invitation.email,
          companyName: company?.name || "Your Company",
          companyLogo: company?.logoUrl,
          inviterName: ctx.user.name || "Admin",
          role: invitation.role,
          inviteLink,
          expiresAt: invitation.expiresAt,
        });

        if (!emailResult.success) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Failed to send email: ${emailResult.error}` });
        }
        return { success: true, messageId: emailResult.messageId };
      }),
    list: companyProcedure.query(async ({ ctx }) => getInvitationsByCompanyId(ctx.companyId)),
    revoke: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await updateInvitation(input.id, { status: "revoked" as any });
      return { success: true };
    }),
    validate: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
      const invitation = await getInvitationByToken(input.token);
      if (!invitation) return { valid: false, error: "Invalid invitation" };
      if (invitation.status !== "pending") return { valid: false, error: "Invitation already used" };
      if (new Date() > invitation.expiresAt) return { valid: false, error: "Invitation expired" };
      const company = await getCompanyById(invitation.companyId);
      return { valid: true, companyName: company?.name || "Unknown", role: invitation.role, email: invitation.email };
    }),
    accept: protectedProcedure.input(z.object({ token: z.string() })).mutation(async ({ input, ctx }) => {
      const invitation = await getInvitationByToken(input.token);
      if (!invitation) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid invitation" });
      if (invitation.status !== "pending") throw new TRPCError({ code: "BAD_REQUEST", message: "Invitation already used" });
      if (new Date() > invitation.expiresAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Invitation expired" });
      // Update user with company and role
      await upsertUser({ openId: ctx.user.openId, email: ctx.user.email, role: invitation.role, companyId: invitation.companyId });
      await setUserCompanyId(ctx.user.openId, invitation.companyId);
      // Create employee profile if it doesn't exist
      const existingEmployees = await getEmployeesByCompanyId(invitation.companyId);
      const hasProfile = existingEmployees.some((e: any) => e.email === invitation.email);
      if (!hasProfile) {
        const nameParts = (ctx.user.name || invitation.email.split("@")[0]).split(" ");
        await createEmployeeProfile({
          userId: ctx.user.id, companyId: invitation.companyId,
          firstName: nameParts[0] || "New", lastName: nameParts.slice(1).join(" ") || "Employee",
          email: invitation.email, employmentType: "full_time", status: "active",
        });
      }
      await updateInvitation(invitation.id, { status: "accepted" as any, acceptedAt: new Date() });
      return { success: true, companyId: invitation.companyId, role: invitation.role };
    }),
  }),

  // ============================================================
  // ============================================================
  // PAYSLIP ROUTER
  // ============================================================
  payslip: router({
    create: companyProcedure
      .input(z.object({
        employeeId: z.number(),
        month: z.number().min(1).max(12),
        year: z.number(),
        grossSalary: z.string(),
        netPay: z.string(),
        currency: z.string().default("DKK"),
        hoursWorked: z.string().optional(),
        hourlyRate: z.string().optional(),
        amContribution: z.string().optional(),
        aTax: z.string().optional(),
        pension: z.string().optional(),
        atp: z.string().optional(),
        otherDeductions: z.string().optional(),
        otherAdditions: z.string().optional(),
        bankAccount: z.string().optional(),
        deductionDetails: z.any().optional(),
        additionDetails: z.any().optional(),
        payrollRunId: z.string().optional(),
        taxDeduction: z.string().optional(),
        companyPension: z.string().optional(),
        holidayData: z.any().optional(),
        balanceData: z.any().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const start = new Date(input.year, input.month - 1, 1);
        const end = new Date(input.year, input.month, 0);
        const result = await createPayslip({
          companyId: ctx.companyId, employeeId: input.employeeId,
          month: input.month, year: input.year,
          salaryPeriodStart: start, salaryPeriodEnd: end,
          grossSalary: input.grossSalary, netPay: input.netPay,
          currency: input.currency,
          hoursWorked: input.hoursWorked || null, hourlyRate: input.hourlyRate || null,
          amContribution: input.amContribution || "0", aTax: input.aTax || "0",
          pension: input.pension || "0", atp: input.atp || "0",
          otherDeductions: input.otherDeductions || "0", otherAdditions: input.otherAdditions || "0",
          bankAccount: input.bankAccount || null,
          deductionDetails: input.deductionDetails
            ? typeof input.deductionDetails === "string"
              ? JSON.parse(input.deductionDetails)
              : input.deductionDetails
            : null,
          additionDetails: input.additionDetails
            ? typeof input.additionDetails === "string"
              ? JSON.parse(input.additionDetails)
              : input.additionDetails
            : null,
          payrollRunId: input.payrollRunId || null,
          availabilityDate: end,
          taxDeduction: input.taxDeduction || "0",
          companyPension: input.companyPension || "0",
          holidayData: input.holidayData
            ? typeof input.holidayData === "string"
              ? JSON.parse(input.holidayData)
              : input.holidayData
            : null,
          balanceData: input.balanceData
            ? typeof input.balanceData === "string"
              ? JSON.parse(input.balanceData)
              : input.balanceData
            : null,
          status: "draft",
        });
        return { success: true, payslipId: result.insertId };
      }),
    listByCompany: companyProcedure.query(async ({ ctx }) => getPayslipsByCompany(ctx.companyId)),
    listByEmployee: companyProcedure.input(z.object({ employeeId: z.number() })).query(async ({ input }) => getPayslipsByEmployee(input.employeeId)),
    myPayslips: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user.companyId) return [];
      const employees = await getEmployeesByCompanyId(ctx.user.companyId);
      const myEmp = employees.find((e: any) => e.userId === ctx.user.id || e.email === ctx.user.email);
      if (!myEmp) return [];
      return getPayslipsByEmployee(myEmp.id);
    }),
    validate: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await updatePayslip(input.id, { status: "validated" });
      return { success: true };
    }),
    send: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const payslip = await getPayslipById(input.id);
      if (!payslip) throw new TRPCError({ code: "NOT_FOUND" });

      // Fetch employee and company data
      const emp = await getEmployeeById(payslip.employeeId);
      if (!emp || emp.companyId !== ctx.companyId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found for this payslip." });
      }
      const company = await getCompanyById(ctx.companyId);

      try {
        // Generate PDF using pdfkit
        // @ts-ignore
        const PDFKit = (await import("pdfkit")).default;
        const doc = new PDFKit({ size: "A4", margin: 40 });
        const chunks: Uint8Array[] = [];
        doc.on("data", (c: Uint8Array) => chunks.push(c));

        const ML = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        const cur = payslip.currency || "DKK";
        const gross = Number(payslip.grossSalary) || 0;
        const net = Number(payslip.netPay) || 0;
        const hours = Number(payslip.hoursWorked) || 160.33;
        const rate = Number(payslip.hourlyRate) || (gross / hours);
        const pen = Number(payslip.pension) || 0;
        const am = Number(payslip.amContribution) || 0;
        const tax = Number(payslip.aTax) || 0;
        const atpVal = Number(payslip.atp) || 0;
        const fmt = (n: number) => n.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Helper: draw a row of text cells at fixed columns on same Y
        const ROW_HEIGHT = 14;
        const drawRow = (y: number, cols: { x: number; w: number; text: string; align?: string; font?: string; size?: number; color?: string }[]) => {
          cols.forEach(col => {
            doc.font(col.font || "Helvetica").fontSize(col.size || 8).fillColor(col.color || "#334155");
            doc.text(col.text, col.x, y, { width: col.w, align: (col.align as any) || "left" });
          });
        };

        // ─── Company Header ───
        doc.font("Helvetica-Bold").fontSize(14).fillColor("#0f172a").text(company?.name || "Company", 40, 40);
        doc.font("Helvetica").fontSize(9).fillColor("#64748b");
        doc.text(company?.address || "", 40, 58);
        doc.text(`CVR: ${(company as any)?.cvr || "—"}`, 40, 70);

        // ─── Employee Header (right side) ───
        doc.font("Helvetica-Bold").fontSize(10).fillColor("#0f172a");
        doc.text(`${emp?.firstName || ""} ${emp?.lastName || ""}`, 350, 40, { width: 205, align: "right" });
        doc.font("Helvetica").fontSize(8).fillColor("#64748b");
        doc.text(`CPR: ${(emp as any)?.metadata?.cprNumber || "—"}`, 350, 54, { width: 205, align: "right" });
        doc.text(`EMP-${emp?.id} · ${(emp as any)?.department || "—"}`, 350, 65, { width: 205, align: "right" });

        // ─── Meta box ───
        let cy = 95;
        doc.rect(40, cy, 515, 50).fill("#f8fafc").stroke("#e2e8f0");
        cy += 8;
        doc.font("Helvetica-Bold").fontSize(10).fillColor("#0f172a").text(`Payslip — ${ML[payslip.month - 1]} ${payslip.year}`, 50, cy);
        cy += 15;
        doc.font("Helvetica").fontSize(8).fillColor("#64748b");
        doc.text(`Salary period: ${new Date(payslip.salaryPeriodStart).toLocaleDateString("en-GB")} – ${new Date(payslip.salaryPeriodEnd).toLocaleDateString("en-GB")}`, 50, cy);
        doc.text(`Account: ${payslip.bankAccount || (emp as any)?.metadata?.bankAccount || "—"}`, 320, cy);
        cy += 12;
        doc.text(`Availability: ${payslip.availabilityDate ? new Date(payslip.availabilityDate).toLocaleDateString("en-GB") : "—"}`, 50, cy);
        doc.text(`Currency: ${cur}`, 320, cy);

        // ─── Table ───
        cy = 165;
        // Table header background
        doc.rect(40, cy, 515, ROW_HEIGHT + 2).fill("#1e293b");
        drawRow(cy + 3, [
          { x: 44, w: 200, text: "Text", font: "Helvetica-Bold", color: "#ffffff" },
          { x: 244, w: 70, text: "Basis", align: "right", font: "Helvetica-Bold", color: "#ffffff" },
          { x: 318, w: 55, text: "Rate", align: "right", font: "Helvetica-Bold", color: "#ffffff" },
          { x: 377, w: 80, text: "Paid out", align: "right", font: "Helvetica-Bold", color: "#ffffff" },
          { x: 461, w: 80, text: "Deducted", align: "right", font: "Helvetica-Bold", color: "#ffffff" },
        ]);
        cy += ROW_HEIGHT + 4;

        const details: any[] = payslip.deductionDetails
          ? (typeof payslip.deductionDetails === "string" ? JSON.parse(payslip.deductionDetails) : payslip.deductionDetails)
          : null;

        const tableRows: { text: string; basis?: string; rate?: string; paidOut?: number; deducted?: number }[] = details && details.length > 0
          ? details
          : [
              { text: "Salary", basis: hours.toFixed(2), rate: rate.toFixed(2), paidOut: gross },
              { text: "ATP", basis: hours.toFixed(2), deducted: atpVal },
              { text: "Pension (employee)", basis: gross.toFixed(2), deducted: pen },
              { text: "AM contribution", basis: (gross - pen).toFixed(2), rate: "8%", deducted: am },
              { text: "A-tax", basis: (gross - pen - am).toFixed(2), rate: "38%", deducted: tax },
            ];

        tableRows.forEach((line, i) => {
          if (i % 2 === 0) doc.rect(40, cy - 1, 515, ROW_HEIGHT).fill("#f8fafc");
          drawRow(cy + 2, [
            { x: 44, w: 200, text: line.text || "" },
            { x: 244, w: 70, text: line.basis || "", align: "right" },
            { x: 318, w: 55, text: line.rate || "", align: "right" },
            { x: 377, w: 80, text: line.paidOut ? fmt(Number(line.paidOut)) : "", align: "right", color: "#047857" },
            { x: 461, w: 80, text: line.deducted ? fmt(Number(line.deducted)) : "", align: "right", color: "#dc2626" },
          ]);
          cy += ROW_HEIGHT;
        });

        // ─── Net pay row ───
        cy += 4;
        doc.rect(40, cy, 515, 22).fill("#f0fdfa");
        doc.moveTo(40, cy).lineTo(555, cy).strokeColor("#0d9488").lineWidth(1.5).stroke();
        doc.font("Helvetica-Bold").fontSize(11).fillColor("#0d9488");
        doc.text("Net pay", 44, cy + 5);
        doc.text(`${cur} ${fmt(net)}`, 377, cy + 5, { width: 164, align: "right" });

        // ─── Balance Section ───
        cy += 38;
        doc.font("Helvetica-Bold").fontSize(9).fillColor("#334155").text("Balance", 40, cy);
        cy += 14;
        drawRow(cy, [
          { x: 44, w: 180, text: "", font: "Helvetica-Bold" },
          { x: 350, w: 80, text: "Period", align: "right", font: "Helvetica-Bold" },
          { x: 440, w: 100, text: "Year to date", align: "right", font: "Helvetica-Bold" },
        ]);
        cy += ROW_HEIGHT;
        const balData = [
          ["AM income base", fmt(gross - pen), fmt((gross - pen) * payslip.month)],
          ["A-tax", fmt(tax), fmt(tax * payslip.month)],
          ["AM contribution", fmt(am), fmt(am * payslip.month)],
          ["ATP", fmt(atpVal), fmt(atpVal * payslip.month)],
          ["Pension (employee)", fmt(pen), fmt(pen * payslip.month)],
          ["Hours", hours.toFixed(2), (hours * payslip.month).toFixed(2)],
        ];
        balData.forEach(([label, period, ytd]) => {
          drawRow(cy, [
            { x: 44, w: 180, text: label },
            { x: 350, w: 80, text: period, align: "right" },
            { x: 440, w: 100, text: ytd, align: "right" },
          ]);
          cy += ROW_HEIGHT - 2;
        });

        // ─── Footer ───
        cy += 20;
        doc.font("Helvetica").fontSize(7).fillColor("#94a3b8");
        doc.text(`Generated by SANI · ${company?.name || "Company"} · ${new Date().toLocaleDateString("en-GB")}`, 40, cy, { width: 515, align: "center" });

        doc.end();

        // Wait for PDF to finish
        await new Promise<void>((resolve, reject) => {
          doc.once("end", () => resolve());
          doc.once("error", (err: any) => reject(err));
        });

        const pdfBuffer = Buffer.concat(chunks as any);
        let pdfUrl: string | null = null;

        try {
          const { storagePut } = await import("./storage");
          const fileKey = `company-${ctx.companyId}/payslips/payslip-${input.id}-${payslip.month}-${payslip.year}.pdf`;
          const { url } = await storagePut(fileKey, pdfBuffer, "application/pdf");
          pdfUrl = url;
          await updatePayslip(input.id, { pdfUrl: url });
        } catch (err) {
          console.error("[Payslip] PDF upload failed:", err);
        }

        if (!emp?.email) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Employee has no email address configured." });
        }

        const { sendPayslipEmail } = await import("./email");
        const emailResult = await sendPayslipEmail({
          recipientEmail: emp.email,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          companyName: company?.name || "Company",
          month: payslip.month,
          year: payslip.year,
          netPay: payslip.netPay,
          currency: payslip.currency || "DKK",
          pdfBuffer,
          pdfFileName: `Payslip-${payslip.month}-${payslip.year}.pdf`,
          pdfUrl: pdfUrl || undefined,
        });

        if (!emailResult.success) {
          console.error("[Payslip] Email not delivered:", emailResult.error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: emailResult.error || "Failed to send payslip email." });
        }

        await updatePayslip(input.id, {
          status: "sent",
          sentAt: new Date(),
          ...(pdfUrl ? { pdfUrl } : {}),
          ...(emailResult.messageId ? { emailMessageId: emailResult.messageId } : {}),
        });
        return { success: true, pdfUrl, messageId: emailResult.messageId };
      } catch (err: any) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[Payslip] Send failed:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: message || "Failed to send payslip" });
      }
    }),
    delete: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const payslip = await getPayslipById(input.id);
      if (!payslip || payslip.companyId !== ctx.companyId) throw new TRPCError({ code: "NOT_FOUND" });
      await deletePayslip(input.id);
      return { success: true };
    }),
    update: companyProcedure.input(z.object({
      id: z.number(),
      grossSalary: z.string().optional(),
      netPay: z.string().optional(),
      hoursWorked: z.string().optional(),
      hourlyRate: z.string().optional(),
      amContribution: z.string().optional(),
      aTax: z.string().optional(),
      pension: z.string().optional(),
      atp: z.string().optional(),
      otherDeductions: z.string().optional(),
      otherAdditions: z.string().optional(),
      deductionDetails: z.any().optional(),
      taxDeduction: z.string().optional(),
      companyPension: z.string().optional(),
      status: z.enum(["draft", "validated"]).optional(),
    })).mutation(async ({ input, ctx }) => {
      const payslip = await getPayslipById(input.id);
      if (!payslip || payslip.companyId !== ctx.companyId) throw new TRPCError({ code: "NOT_FOUND" });
      const { id, deductionDetails, ...rest } = input;
      const updateData: any = { ...rest };
      if (deductionDetails !== undefined) {
        updateData.deductionDetails = typeof deductionDetails === "string" ? JSON.parse(deductionDetails) : deductionDetails;
      }
      await updatePayslip(id, updateData);
      return { success: true };
    }),
  }),

  // FEEDBACK ROUTER
  // ============================================================
  feedback: router({
    create: companyProcedure
      .input(z.object({
        fromEmployeeId: z.number(), toEmployeeId: z.number(),
        type: z.enum(["praise", "constructive", "one_on_one", "peer_review"]).optional(),
        content: z.string().min(1), isPrivate: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createFeedback({ companyId: ctx.companyId, ...input, type: input.type || "praise" });
        return { success: true, feedbackId: result.insertId };
      }),
    listByEmployee: protectedProcedure.input(z.object({ employeeId: z.number() })).query(async ({ input }) => getFeedbackByEmployeeId(input.employeeId)),
    listByCompany: companyProcedure.query(async ({ ctx }) => getFeedbackByCompanyId(ctx.companyId)),
  }),

  // ============================================================
  // USER MANAGEMENT ROUTER (Admin)
  // ============================================================
  userManagement: router({
    listUsers: companyProcedure.query(async ({ ctx }) => getUsersByCompanyId(ctx.companyId)),
    updateRole: companyProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["admin", "hr_admin", "manager", "employee"]) }))
      .mutation(async ({ input }) => {
        await updateUserRole(input.userId, input.role);
        return { success: true };
      }),
    getMyEmployee: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return null;
      return (await getEmployeeByUserId(ctx.user.id)) || null;
    }),
    getMyTeam: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      const myEmployee = await getEmployeeByUserId(ctx.user.id);
      if (!myEmployee) return [];
      return getEmployeesByManagerId(myEmployee.id);
    }),
    completeProfile: protectedProcedure.mutation(async ({ ctx }) => {
      await updateUserProfileCompleted(ctx.user.id, true);
      return { success: true };
    }),
  }),

  // ============================================================
  // FINANCE OS ROUTER
  // ============================================================
  finance: router({
    createExpense: companyProcedure.input(z.object({ employeeId: z.number(), amount: z.string(), category: z.string(), description: z.string(), receiptUrl: z.string().optional() })).mutation(async ({ input }) => {
      const result = await createExpense(input);
      return { success: true, expenseId: result };
    }),
    listExpenses: companyProcedure.query(async ({ ctx }) => getExpensesByCompanyId(ctx.companyId)),
    approveExpense: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await updateExpenseStatus(input.id, "approved" as any);
      return { success: true };
    }),
    rejectExpense: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await updateExpenseStatus(input.id, "rejected" as any);
      return { success: true };
    }),
    registerCard: companyProcedure.input(z.object({ employeeId: z.number(), cardNumber: z.string(), cardholderName: z.string(), expiryDate: z.string(), limit: z.string() })).mutation(async ({ input, ctx }) => {
      const result = await createCorporateCard({ ...input, companyId: ctx.companyId });
      return { success: true, cardId: result };
    }),
    listCards: companyProcedure.query(async ({ ctx }) => getCorporateCardsByCompanyId(ctx.companyId)),
    suspendCard: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await updateCardStatus(input.id, "suspended" as any);
      return { success: true };
    }),
    createBudget: companyProcedure.input(z.object({ departmentId: z.number(), amount: z.string(), period: z.string() })).mutation(async ({ input, ctx }) => {
      const result = await createBudget({ ...input, companyId: ctx.companyId });
      return { success: true, budgetId: result };
    }),
    listBudgets: companyProcedure.query(async ({ ctx }) => getBudgetsByCompanyId(ctx.companyId)),
  }),

  // ============================================================
  // IT & IDENTITY OS ROUTER
  // ============================================================
  it: router({
    registerDevice: companyProcedure.input(z.object({ employeeId: z.number(), deviceType: z.string(), serialNumber: z.string(), osVersion: z.string().optional() })).mutation(async ({ input, ctx }) => {
      const result = await createDevice({ ...input, companyId: ctx.companyId });
      return { success: true, deviceId: result };
    }),
    listDevices: companyProcedure.query(async ({ ctx }) => getDevicesByCompanyId(ctx.companyId)),
    updateDeviceStatus: companyProcedure.input(z.object({ id: z.number(), status: z.string() })).mutation(async ({ input }) => {
      await updateDeviceStatus(input.id, input.status as any);
      return { success: true };
    }),
    requestAppProvisioning: companyProcedure.input(z.object({ employeeId: z.number(), appName: z.string(), reason: z.string().optional() })).mutation(async ({ input, ctx }) => {
      const result = await createAppProvisioning({ ...input, companyId: ctx.companyId });
      return { success: true, requestId: result };
    }),
    listAppRequests: companyProcedure.query(async ({ ctx }) => getAppProvisioningByCompanyId(ctx.companyId)),
    approveAppRequest: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await updateAppProvisioningStatus(input.id, "approved" as any);
      return { success: true };
    }),
    grantAccess: companyProcedure.input(z.object({ employeeId: z.number(), resourceName: z.string(), accessLevel: z.string() })).mutation(async ({ input, ctx }) => {
      const result = await createAccessControl({ ...input, companyId: ctx.companyId });
      return { success: true, accessId: result };
    }),
    listAccessControls: companyProcedure.query(async ({ ctx }) => getAccessControlByCompanyId(ctx.companyId)),
  }),

  // ============================================================
  // AI INTELLIGENCE ROUTER
  // ============================================================
  ai: router({
    listPredictions: companyProcedure.query(async ({ ctx }) => getPredictionsByCompanyId(ctx.companyId)),
    updatePredictionStatus: companyProcedure.input(z.object({ id: z.number(), status: z.enum(["active", "archived", "addressed"]) })).mutation(async ({ input }) => {
      await updatePredictionStatus(input.id, input.status);
      return { success: true };
    }),
    listRecommendations: companyProcedure.query(async ({ ctx }) => getRecommendationsByCompanyId(ctx.companyId)),
    updateRecommendationStatus: companyProcedure.input(z.object({ id: z.number(), status: z.enum(["active", "inactive"]) })).mutation(async ({ input }) => {
      await updateRecommendationStatus(input.id, input.status as any);
      return { success: true };
    }),
    chat: protectedProcedure.input(z.object({ message: z.string(), conversationId: z.string().optional() })).mutation(async ({ input, ctx }) => {
      const result = await createAIChatHistory({ employeeId: ctx.user.id || 0, userMessage: input.message, aiResponse: "AI response pending", conversationId: input.conversationId || crypto.randomUUID() });
      return { success: true, chatId: result, response: "AI response pending" };
    }),
    getChatHistory: companyProcedure.input(z.object({ conversationId: z.string() })).query(async ({ input, ctx }) => getAIChatHistoryByCompanyId(ctx.companyId)),
  }),

  // ============================================================
  // DEVELOPER PLATFORM ROUTER
  // ============================================================
  developer: router({
    createApiKey: companyProcedure.input(z.object({ name: z.string(), scopes: z.string().optional() })).mutation(async ({ input, ctx }) => {
      return { success: true, message: "API key creation not yet implemented" };
    }),
    listApiKeys: companyProcedure.query(async ({ ctx }) => []),
    revokeApiKey: companyProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      return { success: true };
    }),
    createWebhook: companyProcedure.input(z.object({ url: z.string().url(), events: z.string() })).mutation(async ({ input, ctx }) => {
      const result = await createWebhook({ ...input, companyId: ctx.companyId });
      return { success: true, webhookId: result };
    }),
    listWebhooks: companyProcedure.query(async ({ ctx }) => getWebhooksByCompanyId(ctx.companyId)),
    updateWebhookStatus: companyProcedure.input(z.object({ id: z.number(), status: z.enum(["active", "inactive"]) })).mutation(async ({ input }) => {
      await updateWebhookStatus(input.id, input.status);
      return { success: true };
    }),
    listMarketplaceApps: publicProcedure.query(async () => getMarketplaceApps("published")),
    installMarketplaceApp: companyProcedure.input(z.object({ appId: z.number() })).mutation(async ({ input, ctx }) => {
      const result = await createMarketplaceInstallation({ appId: input.appId, companyId: ctx.companyId });
      return { success: true, installationId: result };
    }),
    listInstalledApps: companyProcedure.query(async ({ ctx }) => getMarketplaceInstallationsByCompanyId(ctx.companyId)),
  }),

  // ============================================================
  // DEMO ROUTER (Legacy)
  // ============================================================
  demo: router({
    submitLead: publicProcedure
      .input(z.object({ firstName: z.string().min(1), lastName: z.string().min(1), email: z.string().email(), company: z.string().min(1), jobTitle: z.string().optional(), companySize: z.string().optional(), primaryInterest: z.string().optional(), notes: z.string().optional() }))
      .mutation(async ({ input }) => {
        await createDemoLead(input);
        return { success: true, message: "Demo request submitted successfully" };
      }),
  }),
});

export type AppRouter = typeof appRouter;
