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

## Phase 15: Post-Login Redirect & Demo Mode
- [x] Fix OAuth callback to redirect to role-based dashboard after login
- [x] Create demo/bypass mode with fake company seed data (DemoMode.tsx page)
- [x] Build demo role switcher to test Admin/Manager/Employee dashboards
- [x] Add "Try Demo" button to landing page linking to /demo
- [x] Test all three dashboards with demo data

## Phase 16: Company OS Expansion (HiBob Killer Features)

### Finance OS
- [ ] Add expenses table (employee, amount, category, receipt, approval status)
- [ ] Add corporate_cards table (employee, card number, limit, balance, transactions)
- [ ] Add budgets table (department, category, amount, period)
- [ ] Build expense management backend (submit, approve, reimburse)
- [ ] Build corporate card management backend
- [ ] Build budget tracking and forecasting
- [ ] Create Finance Dashboard frontend (expense overview, card management, budget tracking)
- [ ] Create Expense Request page (submit, track, approve)
- [ ] Create Corporate Cards page (manage, view transactions, set limits)
- [ ] Create Budget Planning page (set budgets, track spending, forecasts)

### IT & Identity OS
- [ ] Add devices table (employee, device_type, serial, os, status, assigned_date)
- [ ] Add app_provisioning table (employee, app, access_level, status, date_assigned)
- [ ] Add access_control table (employee, resource, permission, granted_by, date)
- [ ] Build device lifecycle management (assign, revoke, track)
- [ ] Build app provisioning workflow (request, approve, auto-provision)
- [ ] Build access control engine (tied to HR role changes)
- [ ] Build auto-deprovision on offboarding
- [ ] Create IT Dashboard frontend (device inventory, app access, pending requests)
- [ ] Create Device Management page (assign, revoke, track)
- [ ] Create App Provisioning page (request, approve, manage access)
- [ ] Create Access Control page (view permissions, audit trail)

### AI Intelligence Layer
- [ ] Add predictions table (employee, prediction_type, score, date)
- [ ] Add recommendations table (employee, recommendation_type, action, status)
- [ ] Build attrition prediction model
- [ ] Build promotion recommendation engine
- [ ] Build burnout detection
- [ ] Build org optimization suggestions
- [ ] Build AI chat interface (query company data)
- [ ] Create AI Intelligence Dashboard (predictions, recommendations, insights)
- [ ] Create Attrition Risk page (identify at-risk employees, interventions)
- [ ] Create Promotion Recommendations page (suggested promotions with reasoning)
- [ ] Create Burnout Detection page (identify burnout risks, wellness recommendations)
- [ ] Create AI Chat page (ask questions about company data)

### Developer Platform
- [ ] Design REST API specification (OpenAPI/Swagger)
- [ ] Build webhook system (events: employee.created, payroll.processed, etc.)
- [ ] Create API keys management (generate, revoke, rate limiting)
- [ ] Build SDK (JavaScript/Python)
- [ ] Create API documentation page
- [ ] Create Webhooks management page (configure, test, logs)
- [ ] Create Developer Console (API keys, webhooks, usage)
- [ ] Create Marketplace page (integrations, apps)

### Navigation & Integration
- [ ] Update sidebar with Finance OS, IT OS, AI Intelligence, Developer sections
- [ ] Add Finance OS to all role-based layouts
- [ ] Add IT OS to admin/manager layouts
- [ ] Add AI Intelligence to admin/manager layouts
- [ ] Add Developer Platform to admin layout
- [ ] Update main navigation structure
- [ ] Integrate all new modules with existing employee/payroll data


## Phase 17: Enterprise-Grade Employees Module Rebuild

### Employees List Page
- [x] Build Employees list page with search (name, email, department)
- [x] Implement department filter dropdown
- [x] Implement role filter (Admin/Manager/Employee)
- [x] Implement status filter (Active/Inactive/Pending)
- [x] Build employee table with columns: Profile, Job Title, Department, Role, Manager, Status, Last Active
- [x] Implement 3-dot actions menu (View Profile, Edit, Change Role, Assign Manager, Deactivate, Delete)
- [x] Add "+  Add Employee" button with primary styling
- [x] Implement row click navigation to employee profile page

### Employee Profile Page
- [x] Build dedicated employee profile page at /admin/employees/:id
- [x] Implement header section (avatar, name, title, department, status, manager)
- [x] Build tabbed navigation (Overview, Job Info, Compensation, Payroll, Time Off, Performance, Documents, Activity Log)
- [x] Implement Overview tab (personal info, emergency contact)
- [x] Implement Job Info tab (title, department, manager, employment type, start date)
- [x] Implement Compensation tab (salary, bonus, equity, history)
- [x] Implement Payroll tab (bank details, tax info, payroll status)
- [x] Implement Time Off tab (PTO balance, leave history, requests)
- [x] Implement Performance tab (goals, reviews, feedback)
- [x] Implement Documents tab (contracts, ID documents, uploaded files)
- [x] Implement Activity Log tab (all role/salary/manager changes)
- [x] Add 3-dot actions menu (Edit, Promote, Transfer, Deactivate, Delete)

### Edit Employee Side Drawer
- [x] Build edit employee side drawer (not modal)
- [x] Implement Personal Info section in drawer
- [x] Implement Job Info section in drawer
- [x] Implement Compensation section in drawer
- [x] Implement Access/Role section in drawer
- [x] Add Save and Cancel buttons
- [x] Implement form validation and error handling

### Add Employee Multi-Step Flow
- [x] Build multi-step form (not single form)
- [x] Step 1: Basic Info (name, email, phone)
- [x] Step 2: Job Details (title, department, employment type, start date)
- [x] Step 3: Manager Assignment (select manager from dropdown)
- [x] Step 4: Role Assignment (select RBAC role)
- [x] Step 5: Review & Invite (summary, send email invitation)
- [x] Implement step navigation (Next, Previous, Skip)
- [x] Implement email invitation sending

### RBAC & Org Hierarchy
- [x] Integrate role assignment with RBAC system
- [x] Implement manager assignment with org hierarchy
- [x] Build "reports to" navigation (click manager → go to their profile)
- [ ] Implement role change functionality (admin can change role anytime)

### Design & Polish
- [x] Apply enterprise SaaS styling (Linear/Stripe/Notion-like)
- [x] Use 2xl rounded corners throughout
- [x] Implement soft shadows
- [x] Add color-coded status badges
- [x] Implement smooth hover states
- [x] Ensure responsive design (mobile-friendly)

### Testing & Validation
- [x] Test employee list filtering and search
- [x] Test navigation to employee profile
- [x] Test edit employee flow
- [x] Test add employee multi-step flow
- [x] Test RBAC role assignment
- [x] Test manager assignment and org hierarchy
- [x] Test all action menu items


## Phase 18: Organizational Chart

- [x] Build org chart component with interactive visualization
- [x] Create org chart page at /admin/org-chart
- [x] Implement hierarchical tree layout showing reporting structure
- [x] Add department filter to show specific teams
- [x] Implement search to find employees in org chart
- [x] Add click-to-view-profile functionality
- [x] Implement expand/collapse for large teams
- [x] Add visual indicators for different roles (Admin, Manager, Employee)
- [x] Show team member count per manager
- [x] Add export org chart as image/PDF


## Phase 19: Employee Management UX Redesign

- [x] Rebuild edit employee page as single form (not tabs)
- [x] Add autofill dropdowns for department, position, role, manager
- [x] Add "Create new" option in dropdowns for items not in list
- [x] Rebuild add employee as single long page (not multi-step)
- [x] Implement email invite sending on employee creation
- [x] Create auto-join workflow when employee accepts email invite
- [x] Remove Departments page from navigation
- [x] Remove Invitations page from navigation
- [x] Update employee profile to single-page read-only view
- [x] Test email invite and join flow


## Phase 20: Employee Onboarding Flow

- [x] Create onboarding_progress table to track completion status
- [x] Build OnboardingChecklist component with progress tracking
- [x] Create WelcomePage with company info and onboarding intro
- [x] Build ProfileCompletionFlow with personal, job, and banking sections
- [x] Implement email invite acceptance with token validation
- [x] Auto-redirect to onboarding after email invite acceptance
- [x] Add onboarding status to employee profile
- [x] Create onboarding completion notification
- [x] Write tests for onboarding features
- [x] Test email invite to onboarding flow
