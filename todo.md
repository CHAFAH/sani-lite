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
- [ ] Build SSO configuration UI in admin panel
- [ ] Test SSO login flows

## Phase 4: Admin Dashboard
- [ ] Build admin sidebar navigation
- [ ] Create employee management page (list, add, remove, invite)
- [ ] Build employee profile editor (name, email, department, position)
- [ ] Implement employee invitation system (email invites with signup links)
- [ ] Create document upload system (employment contracts, offer letters)
- [ ] Build seat usage dashboard (show available/used seats)
- [ ] Create employee directory with search/filter

## Phase 5: Subscription & Seat Management
- [ ] Implement seat validation on employee creation
- [ ] Build subscription management page (upgrade/downgrade)
- [ ] Create billing history page
- [ ] Implement license expiration checks
- [ ] Build seat allocation UI

## Phase 6: Core HR Module
- [ ] Build employee records page (searchable, filterable)
- [ ] Create employee detail page (personal info, employment history, documents)
- [ ] Implement document management (upload, download, preview)
- [ ] Build org chart visualization
- [ ] Create employee self-service portal (view own profile, request time off)
- [ ] Build employee lifecycle management (onboarding, offboarding)

## Phase 7: Global Payroll Module
- [ ] Build payroll dashboard (payroll cycles, status)
- [ ] Create payroll processing page (calculate, review, approve)
- [ ] Implement multi-country payroll rules
- [ ] Build payroll reports (payslips, tax reports, compliance)
- [ ] Create payroll settings (tax rules, deductions, benefits)
- [ ] Implement payroll integration with accounting systems

## Phase 8: Talent Suite
- [ ] Build Hiring module (job postings, applicant tracking, offer management)
- [ ] Build Learning module (course library, training assignments, progress tracking)
- [ ] Build Performance module (goal setting, reviews, feedback, ratings)
- [ ] Build Compensation module (salary management, equity, bonus tracking)

## Phase 9: Analytics & Data Module
- [ ] Build analytics dashboard (headcount, attrition, engagement)
- [ ] Create custom reports builder
- [ ] Implement data export (CSV, PDF)
- [ ] Build workforce insights (trends, predictions)
- [ ] Create compliance reports

## Phase 10: Custom Branding & White-Label
- [ ] Implement dynamic branding system (load company colors/logo on every page)
- [ ] Build white-label landing page (company-specific homepage)
- [ ] Create custom domain routing
- [ ] Implement branded email templates
- [ ] Build branded login page

## Phase 11: Testing & Deployment
- [ ] End-to-end testing of all modules
- [ ] Load testing (multi-tenant performance)
- [ ] Security audit (data isolation, access control)
- [ ] User acceptance testing
- [ ] Final checkpoint and deployment
