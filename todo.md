# SANI Lite — Multi-Tenant SaaS Platform TODO

## Phase 1: Database Schema & Multi-Tenant Architecture
- [x] Create companies table (name, logo, domain, colors, subscription tier)
- [x] Create subscriptions table (company_id, tier, seats, start_date, end_date, status)
- [x] Create sso_config table (company_id, provider, client_id, client_secret, enabled)
- [x] Update users table to include company_id and role (admin, employee, owner)
- [x] Create employee_profiles table (user_id, company_id, department, position, employment_contract_url)
- [x] Create employee_documents table for contracts and uploads
- [x] Create payroll_records, performance_reviews, hiring_records tables
- [x] Run migrations and verify schema

## Phase 2: Company KYC Onboarding
- [ ] Build KYC form (company name, industry, size, contact info)
- [ ] Build branding setup page (logo upload, color picker, domain configuration)
- [ ] Implement company creation flow
- [ ] Create subscription tier selection page
- [ ] Build payment integration (Stripe)
- [ ] Create company dashboard home page

## Phase 3: SSO Integration
- [ ] Implement OAuth 2.0 base layer
- [ ] Add Google SSO support
- [ ] Add Microsoft/Azure AD support
- [ ] Add Okta support
- [x] Build SSO configuration UI in admin panel
- [ ] Test SSO login flows

## Phase 4: Admin Dashboard
- [x] Build admin sidebar navigation
- [x] Create employee management page (list, add, remove, invite)
- [x] Build employee profile editor (name, email, department, position)
- [ ] Implement employee invitation system (email invites with signup links)
- [ ] Create document upload system (employment contracts, offer letters)
- [x] Build seat usage dashboard (show available/used seats)
- [x] Create employee directory with search/filter

## Phase 5: Subscription & Seat Management
- [ ] Implement seat validation on employee creation
- [ ] Build subscription management page (upgrade/downgrade)
- [ ] Create billing history page
- [ ] Implement license expiration checks
- [ ] Build seat allocation UI

## Phase 6: Core HR Module
- [x] Build employee records page (searchable, filterable)
- [x] Create employee detail page (personal info, employment history, documents)
- [ ] Implement document management (upload, download, preview)
- [ ] Build org chart visualization
- [x] Create employee self-service portal (view own profile, request time off)
- [ ] Build employee lifecycle management (onboarding, offboarding)

## Phase 7: Global Payroll Module
- [x] Build payroll dashboard (payroll cycles, status)
- [x] Create payroll processing page (calculate, review, approve)
- [ ] Implement multi-country payroll rules
- [ ] Build payroll reports (payslips, tax reports, compliance)
- [ ] Create payroll settings (tax rules, deductions, benefits)
- [ ] Implement payroll integration with accounting systems

## Phase 8: Talent Suite
- [x] Build Hiring module (job postings, applicant tracking, offer management)
- [x] Build Learning module (course library, training assignments, progress tracking)
- [x] Build Performance module (goal setting, reviews, feedback, ratings)
- [x] Build Compensation module (salary management, equity, bonus tracking)

## Phase 9: Analytics & Data Module
- [x] Build analytics dashboard (headcount, attrition, engagement)
- [ ] Create custom reports builder
- [ ] Implement data export (CSV, PDF)
- [x] Build workforce insights (trends, predictions)
- [ ] Create compliance reports

## Phase 10: Custom Branding & White-Label
- [ ] Implement dynamic branding system (load company colors/logo on every page)
- [ ] Build white-label landing page (company-specific homepage)
- [ ] Create custom domain routing
- [ ] Implement branded email templates
- [ ] Build branded login page

## Phase 11: Testing & Deployment
- [x] End-to-end testing of all modules
- [ ] Load testing (multi-tenant performance)
- [ ] Security audit (data isolation, access control)
- [ ] User acceptance testing
- [ ] Final checkpoint and deployment

## Phase 12: Full Platform Build (HiBob-like Operational Modules)

### Core Module
- [x] Platform Overview dashboard with real data (headcount, departments, recent activity)
- [x] Employee Self Service portal (view profile, request time off, update personal info)
- [x] Workflows & Automation engine (approval flows, onboarding checklists, custom triggers)

### Data & Analytics
- [x] Real-time analytics dashboard with live employee data
- [ ] Custom report builder with filters
- [ ] Data export (CSV)
- [x] Workforce insights and trend charts

### Payroll Suite
- [x] Global Payroll with multi-currency payroll runs and approval workflow
- [x] Payroll Hub with payroll cycle management and batch processing
- [x] Benefits Administration (benefit plans, enrollment, employee elections)

### Talent Suite
- [x] Hiring module (job postings, applicant pipeline, interview scheduling, offers)
- [x] Learning module (courses, assignments, progress tracking, completions)
- [x] Performance module (review cycles, goals/OKRs, feedback, ratings, calibration)
- [x] Compensation module (salary bands, equity grants, bonus plans, compensation reviews)

### Database & Backend
- [x] Add new schema tables for workflows, benefits, learning, compensation
- [x] Add new tRPC procedures for all modules
- [x] Add database helper functions for all new tables
- [x] Update AppLayout sidebar with all module navigation

### Integration & Polish
- [x] Unified sidebar navigation with module grouping
- [x] Cross-module data flow (employee data shared across modules)
- [x] Tests for new module operations

## Phase 13: Strict Role Separation & RBAC Rebuild

### RBAC & Permissions
- [x] Add roles table (admin, hr_admin, manager, employee + custom roles)
- [x] Add permissions table with module-level access control
- [x] Add role_permissions junction table
- [x] Add departments table with hierarchy support
- [x] Update employee_profiles with reportsTo/managerId hierarchy
- [x] Build RBAC middleware (adminProcedure, managerProcedure, employeeProcedure)
- [x] Implement role-based routing guards on frontend

### Admin Platform
- [x] Build Admin Dashboard (data-dense, company-wide analytics)
- [x] Build Organization Setup (departments, job roles, org structure)
- [x] Build Employee Management (add/bulk upload, assign role/dept/manager)
- [x] Build RBAC Management UI (create roles, assign permissions)
- [x] Build Payroll & Finance admin controls
- [x] Build Workflows & Automation admin panel
- [x] Build Full Analytics dashboard (headcount, attrition, salary distribution)

### Manager Platform
- [x] Build Manager Dashboard (team-centric, focused)
- [x] Build Team View (direct reports only)
- [x] Build Leave/Expense Approval queue
- [x] Build Team Performance view
- [ ] Build 1:1 Meeting scheduler (placeholder)
- [x] Restrict manager access (no payroll, no system settings, no global roles)

### Employee Platform
- [x] Build Employee Dashboard (clean, minimal, task-driven)
- [x] Build Profile Completion wizard (first login onboarding)
- [x] Build Employee Self-Service (view profile, request leave, view payslips)
- [x] Build Goal tracking and feedback
- [x] Restrict employee access (no salary visibility, no admin settings)

### Company Hierarchy
- [ ] Build dynamic org chart visualization
- [ ] Implement reporting lines (reportsTo chain)
- [ ] Build approval chains based on hierarchy

### Invitation System
- [x] Build employee invitation flow with secure link
- [x] Auto-assign RBAC on first login
- [x] Trigger onboarding checklist after signup

## Phase 14: Bug Fixes
- [x] Fix 404 error on /admin routes (was stale published version)
- [x] Fix 404 error on login route (added /login page + fixed all /app links)
