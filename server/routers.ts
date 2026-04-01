import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
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
  // COMPANY ROUTER
  // ============================================================
  company: router({
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        industry: z.string().optional(),
        size: z.string().optional(),
        website: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await createCompany({ name: input.name, industry: input.industry, size: input.size, website: input.website, status: "onboarding" });
        return { success: true, companyId: result.insertId };
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
