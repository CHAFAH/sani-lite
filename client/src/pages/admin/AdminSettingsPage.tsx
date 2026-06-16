import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Building2, Globe, Shield, Lock, Users, Bell, Palette, CreditCard,
  Database, Plug, Mail, Key, Monitor, FileText,
} from "lucide-react";
import { toast } from "sonner";

const SETTINGS_SECTIONS = [
  { id: "general", label: "General", icon: Building2 },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "domains", label: "Domains", icon: Globe },
  { id: "security", label: "Security", icon: Shield },
  { id: "sso", label: "SSO / Authentication", icon: Key },
  { id: "roles", label: "Roles & Permissions", icon: Lock },
  { id: "team", label: "Team Management", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing & Plans", icon: CreditCard },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "email", label: "Email Templates", icon: Mail },
  { id: "data", label: "Data & Privacy", icon: Database },
  { id: "api", label: "API & Webhooks", icon: Monitor },
  { id: "audit", label: "Audit Log", icon: FileText },
];

function SettingRow({ label, description, children, viewValue }: { label: string; description?: string; children: React.ReactNode; viewValue?: string }) {
  return (
    <div className="flex items-center justify-between py-4 px-5 border-b border-slate-100 last:border-b-0">
      <div>
        <p className="text-[15px] font-medium text-slate-900">{label}</p>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function ViewValue({ value }: { value: string }) {
  return <span className="text-[15px] text-slate-700 font-medium">{value || "\u2014"}</span>;
}

function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-teal-600" : "bg-slate-300"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const { data: company } = trpc.company.get.useQuery(undefined, { retry: false });
  const { data: subscription } = trpc.subscription.getByCompanyId.useQuery(undefined, { retry: false });
  const { data: employees = [] } = trpc.employee.list.useQuery(undefined, { retry: false });
  const utils = trpc.useUtils();
  const updateCompanyMut = trpc.company.update.useMutation({
    onSuccess: () => { utils.company.get.invalidate(); toast.success("Settings saved"); },
    onError: () => toast.error("Failed to save"),
  });

  // Persist active section in URL hash
  const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
  const [activeSection, setActiveSectionState] = useState(hash && SETTINGS_SECTIONS.some(s => s.id === hash) ? hash : "general");
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const setActiveSection = (id: string) => {
    setActiveSectionState(id);
    window.location.hash = id;
  };

  // Form state - initialized from company data
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [timezone, setTimezone] = useState("Europe/Copenhagen");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [fiscalYearStart, setFiscalYearStart] = useState("january");
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("DKK");
  const [workWeekStart, setWorkWeekStart] = useState("monday");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyCountry, setCompanyCountry] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#00D4C8");
  const [customDomain, setCustomDomain] = useState("");

  // Populate form when company data loads
  useEffect(() => {
    if (company) {
      setCompanyName(company.name || "");
      setIndustry(company.industry || "");
      setCompanySize(company.size || "");
      setCompanyEmail(company.email || "");
      setCompanyPhone(company.phone || "");
      setCompanyWebsite(company.website || "");
      setCompanyAddress(company.address || "");
      setCompanyCountry(company.country || "");
      setPrimaryColor(company.primaryColor || "#00D4C8");
      setCustomDomain(company.customDomain || "");
    }
  }, [company]);

  const handleSaveGeneral = () => {
    updateCompanyMut.mutate({
      name: companyName, industry, size: companySize,
      email: companyEmail, phone: companyPhone,
      website: companyWebsite, country: companyCountry, address: companyAddress,
    });
  };

  const handleSaveBranding = () => {
    updateCompanyMut.mutate({ primaryColor, customDomain: customDomain || undefined });
  };

  // Security
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("8");
  const [passwordMinLength, setPasswordMinLength] = useState("12");
  const [passwordPolicy, setPasswordPolicy] = useState("strong");
  const [ipRestriction, setIpRestriction] = useState(false);
  const [auditLog, setAuditLog] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState("5");

  // Notifications
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [slackNotifs, setSlackNotifs] = useState(false);
  const [newEmployeeAlert, setNewEmployeeAlert] = useState(true);
  const [payrollReminder, setPayrollReminder] = useState(true);
  const [leaveRequestAlert, setLeaveRequestAlert] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Team
  const [autoJoinDomain, setAutoJoinDomain] = useState(true);
  const [inviteMethod, setInviteMethod] = useState("email");
  const [approvalRequired, setApprovalRequired] = useState(false);

  // Data
  const [dataRetention, setDataRetention] = useState("2-years");

  const handleSectionClick = (id: string) => {
    setActiveSection(id);
    setSettingsMenuOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Section tabs - horizontal scrollable on mobile */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <div className="flex items-center gap-1 p-2 min-w-max">
              {SETTINGS_SECTIONS.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionClick(section.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-teal-50 text-teal-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                  >
                    <section.icon size={14} className={isActive ? "text-teal-600" : "text-slate-400"} />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0">
          {activeSection === "general" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">General</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Company information and preferences</p>
                </div>
                {!editing ? (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>
                ) : (
                  <Button variant="ghost" size="sm" className="text-slate-500" onClick={() => setEditing(false)}>Cancel</Button>
                )}
              </div>

              <SettingRow label="Company Name">{editing ? <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-56 h-9 text-sm" /> : <ViewValue value={companyName} />}</SettingRow>
              <SettingRow label="Industry">{editing ? (
                <Select value={industry} onValueChange={setIndustry}><SelectTrigger className="w-56 h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="Technology">Technology / SaaS</SelectItem><SelectItem value="Finance & Banking">Finance & Banking</SelectItem><SelectItem value="Healthcare">Healthcare</SelectItem><SelectItem value="Education">Education</SelectItem><SelectItem value="Retail & E-Commerce">Retail & E-commerce</SelectItem><SelectItem value="Manufacturing">Manufacturing</SelectItem><SelectItem value="Consulting">Consulting</SelectItem><SelectItem value="Media & Entertainment">Media & Entertainment</SelectItem><SelectItem value="Other">Other</SelectItem>
                </SelectContent></Select>
              ) : <ViewValue value={industry} />}</SettingRow>
              <SettingRow label="Company Size">{editing ? (
                <Select value={companySize} onValueChange={setCompanySize}><SelectTrigger className="w-56 h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="1-10">1–10</SelectItem><SelectItem value="11-50">11–50</SelectItem><SelectItem value="51-200">51–200</SelectItem><SelectItem value="201-500">201–500</SelectItem><SelectItem value="501-1000">501–1,000</SelectItem><SelectItem value="1001-5000">1,001–5,000</SelectItem><SelectItem value="5001+">5,001+</SelectItem>
                </SelectContent></Select>
              ) : <ViewValue value={companySize} />}</SettingRow>
              <SettingRow label="Timezone">{editing ? (
                <Select value={timezone} onValueChange={setTimezone}><SelectTrigger className="w-56 h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="America/New_York">Eastern (UTC-5)</SelectItem><SelectItem value="America/Chicago">Central (UTC-6)</SelectItem><SelectItem value="America/Los_Angeles">Pacific (UTC-8)</SelectItem><SelectItem value="Europe/London">London (UTC+0)</SelectItem><SelectItem value="Europe/Copenhagen">Copenhagen (UTC+1)</SelectItem><SelectItem value="Europe/Paris">Paris/Berlin (UTC+1)</SelectItem><SelectItem value="Asia/Dubai">Dubai (UTC+4)</SelectItem><SelectItem value="Asia/Singapore">Singapore (UTC+8)</SelectItem><SelectItem value="Asia/Tokyo">Tokyo (UTC+9)</SelectItem><SelectItem value="Australia/Sydney">Sydney (UTC+11)</SelectItem>
                </SelectContent></Select>
              ) : <ViewValue value={timezone} />}</SettingRow>
              <SettingRow label="Date Format">{editing ? (
                <Select value={dateFormat} onValueChange={setDateFormat}><SelectTrigger className="w-56 h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem><SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem><SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent></Select>
              ) : <ViewValue value={dateFormat} />}</SettingRow>
              <SettingRow label="Default Currency">{editing ? (
                <Select value={currency} onValueChange={setCurrency}><SelectTrigger className="w-56 h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="GBP">GBP</SelectItem><SelectItem value="DKK">DKK</SelectItem><SelectItem value="SEK">SEK</SelectItem><SelectItem value="CAD">CAD</SelectItem><SelectItem value="AUD">AUD</SelectItem><SelectItem value="INR">INR</SelectItem><SelectItem value="JPY">JPY</SelectItem><SelectItem value="CHF">CHF</SelectItem>
                </SelectContent></Select>
              ) : <ViewValue value={currency} />}</SettingRow>
              <SettingRow label="Default Language">{editing ? (
                <Select value={language} onValueChange={setLanguage}><SelectTrigger className="w-56 h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="en">English</SelectItem><SelectItem value="da">Danish</SelectItem><SelectItem value="de">German</SelectItem><SelectItem value="fr">French</SelectItem><SelectItem value="es">Spanish</SelectItem>
                </SelectContent></Select>
              ) : <ViewValue value={language} />}</SettingRow>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 border-b border-b-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Details</span>
              </div>
              <SettingRow label="Company Email">{editing ? <Input value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} className="w-56 h-9 text-sm" /> : <ViewValue value={companyEmail} />}</SettingRow>
              <SettingRow label="Phone">{editing ? <Input value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} className="w-56 h-9 text-sm" /> : <ViewValue value={companyPhone} />}</SettingRow>
              <SettingRow label="Website">{editing ? <Input value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} className="w-56 h-9 text-sm" /> : <ViewValue value={companyWebsite} />}</SettingRow>
              <SettingRow label="Address">{editing ? <Input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className="w-56 h-9 text-sm" /> : <ViewValue value={companyAddress} />}</SettingRow>
              <SettingRow label="Country">{editing ? <Input value={companyCountry} onChange={(e) => setCompanyCountry(e.target.value)} className="w-56 h-9 text-sm" /> : <ViewValue value={companyCountry} />}</SettingRow>

              {editing && (
                <div className="px-5 py-4 border-t border-slate-200 flex justify-center">
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white px-8" disabled={updateCompanyMut.isPending} onClick={() => { handleSaveGeneral(); setEditing(false); }}>Save Changes</Button>
                </div>
              )}
            </div>
          )}

          {activeSection === "branding" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Branding</h3>
                <p className="text-sm text-slate-500 mt-0.5">Customize your workspace appearance</p>
              </div>
              <SettingRow label="Logo" description="Your company logo (displayed in sidebar)">
                <Button variant="outline" size="sm">Upload Logo</Button>
              </SettingRow>
              <SettingRow label="Primary Color" description="Brand accent color">
                <div className="flex items-center gap-2">
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer" />
                  <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-28 h-9 text-sm" />
                </div>
              </SettingRow>
              <SettingRow label="Favicon" description="Browser tab icon">
                <Button variant="outline" size="sm">Upload</Button>
              </SettingRow>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" disabled={updateCompanyMut.isPending} onClick={handleSaveBranding}>Save Changes</Button>
              </div>
            </div>
          )}

          {activeSection === "domains" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Domains</h3>
                <p className="text-sm text-slate-500 mt-0.5">Manage custom domains and email verification</p>
              </div>
              <SettingRow label="Primary Domain" description="Used for SSO and email matching">
                <div className="flex items-center gap-2">
                  <Input value={companyWebsite?.replace("https://", "").replace("http://", "") || ""} readOnly className="w-44 h-9 text-sm bg-slate-50" />
                  <Badge className="bg-emerald-100 text-emerald-700">Verified</Badge>
                </div>
              </SettingRow>
              <SettingRow label="Custom App Domain" description="White-label domain for your workspace">
                <Input value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} placeholder="app.yourcompany.com" className="w-56 h-9 text-sm" />
              </SettingRow>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" disabled={updateCompanyMut.isPending} onClick={handleSaveBranding}>Save Changes</Button>
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Security</h3>
                <p className="text-sm text-slate-500 mt-0.5">Protect your organization's data</p>
              </div>
              <SettingRow label="Two-Factor Authentication" description="Require 2FA for all users">
                <ToggleSwitch enabled={twoFactor} onToggle={() => { setTwoFactor(!twoFactor); toast.success(twoFactor ? "2FA disabled" : "2FA enabled"); }} />
              </SettingRow>
              <SettingRow label="Session Timeout" description="Auto-logout after inactivity">
                <Select value={sessionTimeout} onValueChange={(v) => { setSessionTimeout(v); toast.success("Session timeout updated"); }}>
                  <SelectTrigger className="w-44 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="8">8 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="72">3 days</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
              <SettingRow label="Password Policy" description="Minimum password requirements">
                <Select value={passwordPolicy} onValueChange={(v) => { setPasswordPolicy(v); toast.success("Password policy updated"); }}>
                  <SelectTrigger className="w-56 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                    <SelectItem value="moderate">Moderate (10+ chars, 1 number)</SelectItem>
                    <SelectItem value="strong">Strong (12+ chars, mixed case, number, symbol)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (16+ chars, all requirements)</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
              <SettingRow label="Max Login Attempts" description="Lock account after failed attempts">
                <Select value={loginAttempts} onValueChange={(v) => { setLoginAttempts(v); toast.success("Login attempts updated"); }}>
                  <SelectTrigger className="w-44 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 attempts</SelectItem>
                    <SelectItem value="5">5 attempts</SelectItem>
                    <SelectItem value="10">10 attempts</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
              <SettingRow label="IP Restriction" description="Only allow access from specific IPs">
                <ToggleSwitch enabled={ipRestriction} onToggle={() => { setIpRestriction(!ipRestriction); toast.success(ipRestriction ? "IP restriction disabled" : "IP restriction enabled"); }} />
              </SettingRow>
              <SettingRow label="Audit Logging" description="Track all user actions">
                <ToggleSwitch enabled={auditLog} onToggle={() => { setAuditLog(!auditLog); toast.success(auditLog ? "Audit logging disabled" : "Audit logging enabled"); }} />
              </SettingRow>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => toast.success("Security settings saved")}>Save Changes</Button>
              </div>
            </div>
          )}

          {activeSection === "sso" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">SSO / Authentication</h3>
                <p className="text-sm text-slate-500 mt-0.5">Configure single sign-on providers</p>
              </div>
              <SettingRow label="Google SSO" description="Allow sign in with Google Workspace">
                <Badge className="bg-emerald-100 text-emerald-700">Connected</Badge>
              </SettingRow>
              <SettingRow label="Microsoft Azure AD" description="Enterprise SSO via Azure">
                <Button variant="outline" size="sm">Connect</Button>
              </SettingRow>
              <SettingRow label="Okta" description="Enterprise identity provider">
                <Button variant="outline" size="sm">Connect</Button>
              </SettingRow>
              <SettingRow label="SAML 2.0" description="Custom SAML provider">
                <Button variant="outline" size="sm">Configure</Button>
              </SettingRow>
            </div>
          )}

          {activeSection === "roles" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Roles & Permissions</h3>
                <p className="text-sm text-slate-500 mt-0.5">Manage access control for your team</p>
              </div>
              <SettingRow label="Company Owner" description="Full access to everything">
                <Badge>{employees.length} employees</Badge>
              </SettingRow>
              <SettingRow label="Admin" description="Manage employees, payroll, settings">
                <Badge>—</Badge>
              </SettingRow>
              <SettingRow label="HR Admin" description="Manage employees and time off">
                <Badge>—</Badge>
              </SettingRow>
              <SettingRow label="Manager" description="View team, approve requests">
                <Badge>—</Badge>
              </SettingRow>
              <SettingRow label="Employee" description="Self-service access only">
                <Badge>{employees.length} users</Badge>
              </SettingRow>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">
                <Button variant="outline" size="sm">Create Custom Role</Button>
              </div>
            </div>
          )}

          {activeSection === "team" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Team Management</h3>
                <p className="text-sm text-slate-500 mt-0.5">Manage admin and team access</p>
              </div>
              <SettingRow label="Invite Method" description="How new employees are added">
                <Select value={inviteMethod} onValueChange={(v) => { setInviteMethod(v); toast.success("Invite method updated"); }}>
                  <SelectTrigger className="w-56 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email Invitation</SelectItem>
                    <SelectItem value="link">Shareable Invite Link</SelectItem>
                    <SelectItem value="sso-auto">Auto-provision via SSO</SelectItem>
                    <SelectItem value="manual">Manual (Admin creates account)</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
              <SettingRow label="Auto-Join Domain" description="Users with @sani.io auto-join the workspace">
                <ToggleSwitch enabled={autoJoinDomain} onToggle={() => { setAutoJoinDomain(!autoJoinDomain); toast.success(autoJoinDomain ? "Auto-join disabled" : "Auto-join enabled"); }} />
              </SettingRow>
              <SettingRow label="Admin Approval Required" description="New signups require admin approval">
                <ToggleSwitch enabled={approvalRequired} onToggle={() => { setApprovalRequired(!approvalRequired); toast.success(approvalRequired ? "Approval not required" : "Approval required for new signups"); }} />
              </SettingRow>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => toast.success("Team settings saved")}>Save Changes</Button>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Notifications</h3>
                <p className="text-sm text-slate-500 mt-0.5">Configure how notifications are delivered</p>
              </div>
              <SettingRow label="Email Notifications" description="Send notifications via email">
                <ToggleSwitch enabled={emailNotifs} onToggle={() => { setEmailNotifs(!emailNotifs); toast.success(emailNotifs ? "Email notifications disabled" : "Email notifications enabled"); }} />
              </SettingRow>
              <SettingRow label="Slack Integration" description="Post updates to Slack channels">
                <ToggleSwitch enabled={slackNotifs} onToggle={() => { setSlackNotifs(!slackNotifs); toast.success(slackNotifs ? "Slack disabled" : "Slack enabled"); }} />
              </SettingRow>
              <SettingRow label="New Employee Alert" description="Notify admins when someone joins">
                <ToggleSwitch enabled={newEmployeeAlert} onToggle={() => { setNewEmployeeAlert(!newEmployeeAlert); }} />
              </SettingRow>
              <SettingRow label="Payroll Reminders" description="Remind 3 days before payroll deadline">
                <ToggleSwitch enabled={payrollReminder} onToggle={() => { setPayrollReminder(!payrollReminder); }} />
              </SettingRow>
              <SettingRow label="Leave Request Alerts" description="Notify managers of new leave requests">
                <ToggleSwitch enabled={leaveRequestAlert} onToggle={() => { setLeaveRequestAlert(!leaveRequestAlert); }} />
              </SettingRow>
              <SettingRow label="Weekly Digest" description="Send a summary email every Monday">
                <ToggleSwitch enabled={weeklyDigest} onToggle={() => { setWeeklyDigest(!weeklyDigest); }} />
              </SettingRow>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => toast.success("Notification settings saved")}>Save Changes</Button>
              </div>
            </div>
          )}

          {activeSection === "billing" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Billing & Plans</h3>
                <p className="text-sm text-slate-500 mt-0.5">Manage your subscription and billing</p>
              </div>
              <SettingRow label="Current Plan" description="Your active subscription tier">
                <Badge className="bg-teal-100 text-teal-700 capitalize">{subscription?.tier || "Free"} Plan</Badge>
              </SettingRow>
              <SettingRow label="Seats Used" description="Active employee seats">
                <span className="text-sm font-medium text-slate-700">{employees.length} / {subscription?.seats || 10}</span>
              </SettingRow>
              <SettingRow label="Monthly Price" description="Current billing amount">
                <span className="text-sm font-medium text-slate-700">${subscription?.price || "0"}/mo</span>
              </SettingRow>
              <SettingRow label="Billing Cycle" description="How often you are charged">
                <span className="text-sm text-slate-600 capitalize">{subscription?.billingCycle || "monthly"}</span>
              </SettingRow>
              <SettingRow label="Status" description="Subscription status">
                <Badge className={`capitalize ${subscription?.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{subscription?.status || "inactive"}</Badge>
              </SettingRow>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex gap-2">
                <Button variant="outline" size="sm">View Invoices</Button>
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">Upgrade Plan</Button>
              </div>
            </div>
          )}

          {activeSection === "integrations" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Integrations</h3>
                <p className="text-sm text-slate-500 mt-0.5">Connect third-party services</p>
              </div>
              <SettingRow label="Slack" description="Team messaging and alerts">
                <Button variant="outline" size="sm">Connect</Button>
              </SettingRow>
              <SettingRow label="Google Workspace" description="Calendar, Drive, and SSO">
                <Badge className="bg-emerald-100 text-emerald-700">Connected</Badge>
              </SettingRow>
              <SettingRow label="Jira" description="Project management sync">
                <Button variant="outline" size="sm">Connect</Button>
              </SettingRow>
              <SettingRow label="QuickBooks" description="Accounting and payroll sync">
                <Button variant="outline" size="sm">Connect</Button>
              </SettingRow>
            </div>
          )}

          {activeSection === "email" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Email Templates</h3>
                <p className="text-sm text-slate-500 mt-0.5">Customize automated emails</p>
              </div>
              <SettingRow label="Invite Email" description="Sent when inviting new employees">
                <Button variant="outline" size="sm">Edit Template</Button>
              </SettingRow>
              <SettingRow label="Welcome Email" description="Sent after first login">
                <Button variant="outline" size="sm">Edit Template</Button>
              </SettingRow>
              <SettingRow label="Payslip Email" description="Sent with monthly payslips">
                <Button variant="outline" size="sm">Edit Template</Button>
              </SettingRow>
              <SettingRow label="Leave Approval" description="Sent when leave is approved/denied">
                <Button variant="outline" size="sm">Edit Template</Button>
              </SettingRow>
            </div>
          )}

          {activeSection === "data" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Data & Privacy</h3>
                <p className="text-sm text-slate-500 mt-0.5">Data management and compliance</p>
              </div>
              <SettingRow label="Data Retention" description="How long data is kept after offboarding">
                <Select value={dataRetention} onValueChange={(v) => { setDataRetention(v); toast.success("Data retention updated"); }}>
                  <SelectTrigger className="w-56 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6-months">6 months</SelectItem>
                    <SelectItem value="1-year">1 year</SelectItem>
                    <SelectItem value="2-years">2 years</SelectItem>
                    <SelectItem value="5-years">5 years</SelectItem>
                    <SelectItem value="7-years">7 years (tax compliance)</SelectItem>
                    <SelectItem value="forever">Indefinite</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>
              <SettingRow label="GDPR Compliance" description="EU data protection compliance">
                <Badge className="bg-emerald-100 text-emerald-700">Compliant</Badge>
              </SettingRow>
              <SettingRow label="Export All Data" description="Download a full data export (JSON/CSV)">
                <Button variant="outline" size="sm" onClick={() => toast.success("Export started. You'll receive an email when ready.")}>Export</Button>
              </SettingRow>
              <SettingRow label="Delete Company Data" description="Permanently remove all data (irreversible)">
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => toast.error("Contact support to delete company data")}>Request Deletion</Button>
              </SettingRow>
            </div>
          )}

          {activeSection === "api" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">API & Webhooks</h3>
                <p className="text-sm text-slate-500 mt-0.5">Developer access and automation</p>
              </div>
              <SettingRow label="API Key" description="Use for programmatic access">
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded">sk_live_•••••••••</code>
                  <Button variant="outline" size="sm">Regenerate</Button>
                </div>
              </SettingRow>
              <SettingRow label="Webhooks" description="Receive events via HTTP callbacks">
                <Button variant="outline" size="sm">Configure</Button>
              </SettingRow>
              <SettingRow label="Rate Limit" description="API requests per minute">
                <span className="text-sm text-slate-600">100 req/min</span>
              </SettingRow>
            </div>
          )}

          {activeSection === "audit" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Audit Log</h3>
                <p className="text-sm text-slate-500 mt-0.5">Track all actions in your workspace</p>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { user: "Prince Sani", action: "Updated employee profile", target: "James Chen", time: "2 min ago" },
                  { user: "Prince Sani", action: "Logged in", target: "Dev Bypass", time: "15 min ago" },
                  { user: "System", action: "Payroll cycle created", target: "March 2026", time: "1 hour ago" },
                  { user: "System", action: "Employee invited", target: "new.hire@sani.io", time: "3 hours ago" },
                  { user: "Prince Sani", action: "Changed role", target: "Elena Volkov → VP", time: "Yesterday" },
                ].map((log, i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-800"><span className="font-medium">{log.user}</span> {log.action}</p>
                      <p className="text-xs text-slate-400">{log.target}</p>
                    </div>
                    <span className="text-xs text-slate-400">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
