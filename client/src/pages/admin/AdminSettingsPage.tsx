import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
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
  const [activeSection, setActiveSection] = useState("general");
  const [twoFactor, setTwoFactor] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [slackNotifs, setSlackNotifs] = useState(false);
  const [auditLog, setAuditLog] = useState(true);

  return (
    <AdminLayout>
      <div className="flex gap-6 h-full">
        {/* Left nav */}
        <div className="w-[220px] flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden sticky top-4">
            <div className="px-4 py-3 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-800">Settings</h2>
            </div>
            <nav className="py-1">
              {SETTINGS_SECTIONS.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-all ${
                      isActive
                        ? "bg-teal-50 text-teal-700 font-semibold border-l-2 border-teal-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-transparent"
                    }`}
                  >
                    <section.icon size={15} className={isActive ? "text-teal-600" : "text-slate-400"} />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 min-w-0">
          {activeSection === "general" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">General</h3>
                <p className="text-sm text-slate-500 mt-0.5">Company information and preferences</p>
              </div>
              <SettingRow label="Company Name" description="Your organization's display name">
                <Input defaultValue="SANI" className="w-56 h-9 text-sm" />
              </SettingRow>
              <SettingRow label="Industry" description="Your company's sector">
                <Input defaultValue="Technology / SaaS" className="w-56 h-9 text-sm" />
              </SettingRow>
              <SettingRow label="Company Size" description="Number of employees">
                <Input defaultValue="51-200" className="w-56 h-9 text-sm" />
              </SettingRow>
              <SettingRow label="Timezone" description="Default timezone for the company">
                <Input defaultValue="Europe/Copenhagen" className="w-56 h-9 text-sm" />
              </SettingRow>
              <SettingRow label="Date Format" description="How dates are displayed">
                <Input defaultValue="DD/MM/YYYY" className="w-56 h-9 text-sm" />
              </SettingRow>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => toast.success("Settings saved")}>Save Changes</Button>
              </div>
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
                  <div className="w-8 h-8 rounded-lg bg-teal-600 border border-slate-200" />
                  <Input defaultValue="#00D4C8" className="w-28 h-9 text-sm" />
                </div>
              </SettingRow>
              <SettingRow label="Favicon" description="Browser tab icon">
                <Button variant="outline" size="sm">Upload</Button>
              </SettingRow>
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
                  <Input defaultValue="sani.io" className="w-44 h-9 text-sm" />
                  <Badge className="bg-emerald-100 text-emerald-700">Verified</Badge>
                </div>
              </SettingRow>
              <SettingRow label="Custom App Domain" description="White-label domain for your workspace">
                <Input placeholder="app.yourcompany.com" className="w-56 h-9 text-sm" />
              </SettingRow>
            </div>
          )}

          {activeSection === "security" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Security</h3>
                <p className="text-sm text-slate-500 mt-0.5">Protect your organization's data</p>
              </div>
              <SettingRow label="Two-Factor Authentication" description="Require 2FA for all users">
                <ToggleSwitch enabled={twoFactor} onToggle={() => setTwoFactor(!twoFactor)} />
              </SettingRow>
              <SettingRow label="Session Timeout" description="Auto-logout after inactivity">
                <Input defaultValue="8 hours" className="w-32 h-9 text-sm" />
              </SettingRow>
              <SettingRow label="Password Policy" description="Minimum password requirements">
                <Badge className="bg-blue-50 text-blue-700">Strong (12+ chars)</Badge>
              </SettingRow>
              <SettingRow label="IP Allowlist" description="Restrict access to specific IPs">
                <Button variant="outline" size="sm">Configure</Button>
              </SettingRow>
              <SettingRow label="Audit Logging" description="Track all user actions">
                <ToggleSwitch enabled={auditLog} onToggle={() => setAuditLog(!auditLog)} />
              </SettingRow>
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
                <Badge>1 user</Badge>
              </SettingRow>
              <SettingRow label="Admin" description="Manage employees, payroll, settings">
                <Badge>2 users</Badge>
              </SettingRow>
              <SettingRow label="HR Admin" description="Manage employees and time off">
                <Badge>3 users</Badge>
              </SettingRow>
              <SettingRow label="Manager" description="View team, approve requests">
                <Badge>8 users</Badge>
              </SettingRow>
              <SettingRow label="Employee" description="Self-service access only">
                <Badge>37 users</Badge>
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
              <SettingRow label="Admins" description="Users with admin privileges">
                <Button variant="outline" size="sm">Manage</Button>
              </SettingRow>
              <SettingRow label="Invite Method" description="How new employees join">
                <Badge className="bg-blue-50 text-blue-700">Email Invite</Badge>
              </SettingRow>
              <SettingRow label="Auto-Join Domain" description="Users with @sani.io auto-join">
                <ToggleSwitch enabled={true} onToggle={() => toast.info("Coming soon")} />
              </SettingRow>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Notifications</h3>
                <p className="text-sm text-slate-500 mt-0.5">Configure how notifications are delivered</p>
              </div>
              <SettingRow label="Email Notifications" description="Send notifications via email">
                <ToggleSwitch enabled={emailNotifs} onToggle={() => setEmailNotifs(!emailNotifs)} />
              </SettingRow>
              <SettingRow label="Slack Integration" description="Post updates to Slack channels">
                <ToggleSwitch enabled={slackNotifs} onToggle={() => setSlackNotifs(!slackNotifs)} />
              </SettingRow>
              <SettingRow label="New Employee Alert" description="Notify admins when someone joins">
                <ToggleSwitch enabled={true} onToggle={() => {}} />
              </SettingRow>
              <SettingRow label="Payroll Reminders" description="Remind before payroll deadlines">
                <ToggleSwitch enabled={true} onToggle={() => {}} />
              </SettingRow>
            </div>
          )}

          {activeSection === "billing" && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Billing & Plans</h3>
                <p className="text-sm text-slate-500 mt-0.5">Manage your subscription and billing</p>
              </div>
              <SettingRow label="Current Plan" description="Your active subscription tier">
                <Badge className="bg-teal-100 text-teal-700">Growth Plan</Badge>
              </SettingRow>
              <SettingRow label="Seats Used" description="Active employee seats">
                <span className="text-sm font-medium text-slate-700">51 / 100</span>
              </SettingRow>
              <SettingRow label="Billing Cycle" description="How often you are charged">
                <span className="text-sm text-slate-600">Monthly</span>
              </SettingRow>
              <SettingRow label="Next Invoice" description="Upcoming payment date">
                <span className="text-sm text-slate-600">July 16, 2026</span>
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
                <Input defaultValue="2 years" className="w-32 h-9 text-sm" />
              </SettingRow>
              <SettingRow label="GDPR Compliance" description="EU data protection compliance">
                <Badge className="bg-emerald-100 text-emerald-700">Compliant</Badge>
              </SettingRow>
              <SettingRow label="Export All Data" description="Download a full data export">
                <Button variant="outline" size="sm">Export</Button>
              </SettingRow>
              <SettingRow label="Delete Company Data" description="Permanently remove all data">
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">Delete</Button>
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
