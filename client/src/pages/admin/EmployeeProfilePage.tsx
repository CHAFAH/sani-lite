import { useState, useEffect, useMemo, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft, MoreVertical, Edit, Shield, Users2, Power, Trash2,
  AlertCircle, Save, X, Loader2, Camera, Pencil,
  Star, CheckSquare, Target, FileText, MessageSquare, Rocket,
  User, Briefcase, Phone, Building2, Heart, ScrollText, CreditCard,
  Contact, Home, Info, AlertTriangle, Monitor, GraduationCap,
  ChevronLeft, ChevronRight, Lock,
} from "lucide-react";
import { toast } from "sonner";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Germany", "France", "Australia",
  "India", "Japan", "Brazil", "Mexico", "Nigeria", "South Africa", "Kenya",
  "UAE", "Saudi Arabia", "Singapore", "Netherlands", "Sweden", "Switzerland",
  "Spain", "Italy", "China", "South Korea", "Denmark", "Poland", "Ireland",
];
const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "INR", "JPY", "BRL", "DKK", "SEK", "SGD", "CHF", "NGN", "ZAR", "KES", "AED", "SAR", "CNY", "KRW"];
const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "temporary", label: "Temporary" },
];
const STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "on_leave", label: "On Leave" },
  { value: "offboarded", label: "Offboarded" },
];
const PRONOUNS = ["He / Him", "She / Her", "They / Them", "Other"];

// Quick action tabs (below header)
const ACTION_TABS = [
  { id: "performance", label: "Performance", icon: Star },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "goals", label: "My Goals", icon: Target },
  { id: "docs", label: "Docs", icon: FileText },
  { id: "1on1", label: "1 on 1", icon: MessageSquare },
  { id: "career", label: "My Career", icon: Rocket },
];

// Left sidebar menu sections
const SIDEBAR_SECTIONS = [
  { id: "basic", label: "Basic Info", icon: User },
  { id: "work", label: "Work", icon: Briefcase },
  { id: "work-contact", label: "Work Contact", icon: Phone },
  { id: "employment", label: "Employment", icon: Building2 },
  { id: "lifecycle", label: "Lifecycle", icon: Heart },
  { id: "work-permit", label: "Work Permit", icon: ScrollText },
  { id: "payroll", label: "Payroll", icon: CreditCard },
  { id: "personal", label: "Personal", icon: Contact },
  { id: "contact", label: "Contact Information", icon: Phone },
  { id: "home", label: "Home", icon: Home },
  { id: "about", label: "About", icon: Info },
  { id: "emergency", label: "Emergency", icon: AlertTriangle },
  { id: "assets", label: "Assets", icon: Monitor },
  { id: "training", label: "Training", icon: GraduationCap },
];

function SectionHeader({ title, action, adminOnly }: { title: string; action?: React.ReactNode; adminOnly?: boolean }) {
  return (
    <div className="bg-slate-50 px-4 sm:px-5 py-3 border-b border-slate-200 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h3 className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider">{title}</h3>
        {adminOnly && <Lock size={11} className="text-slate-400" />}
      </div>
      {action}
    </div>
  );
}

function ViewRow({ label, value, onClick }: { label: string; value: React.ReactNode; onClick?: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 px-4 sm:px-5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors gap-1 sm:gap-0">
      <span className="text-[13px] sm:text-[15px] text-slate-500 sm:w-52 shrink-0 font-medium">{label}</span>
      {onClick ? (
        <button onClick={onClick} className="text-[14px] sm:text-[15px] text-teal-600 hover:underline font-medium break-all">{value || "—"}</button>
      ) : (
        <span className="text-[14px] sm:text-[15px] text-slate-900 font-medium break-all">{value || "—"}</span>
      )}
    </div>
  );
}

function EditInputRow({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-2.5 px-4 sm:px-5 border-b border-slate-100 last:border-b-0 gap-1 sm:gap-0">
      <span className="text-[13px] sm:text-[15px] text-slate-500 sm:w-52 shrink-0 font-medium">{label}</span>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || label} className="h-9 text-[14px] sm:text-[15px] w-full sm:max-w-xs" />
    </div>
  );
}

function EditSelectRow({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-2.5 px-4 sm:px-5 border-b border-slate-100 last:border-b-0 gap-1 sm:gap-0">
      <span className="text-[13px] sm:text-[15px] text-slate-500 sm:w-52 shrink-0 font-medium">{label}</span>
      <Select value={value || "__none__"} onValueChange={(v) => onChange(v === "__none__" ? "" : v)}>
        <SelectTrigger className="h-9 text-[14px] sm:text-[15px] w-full sm:max-w-xs">
          <SelectValue placeholder={placeholder || label} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">{placeholder || "None"}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value || "__none__"}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const getAvatarColor = (name: string) => {
  const colors = ["bg-rose-500", "bg-pink-500", "bg-fuchsia-500", "bg-purple-500", "bg-violet-500", "bg-indigo-500", "bg-blue-500", "bg-teal-500", "bg-emerald-500", "bg-amber-500"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const getStatusBadge = (status: string | undefined) => {
  switch (status) {
    case "active": return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Active</Badge>;
    case "inactive": return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">Inactive</Badge>;
    case "on_leave": return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">On Leave</Badge>;
    case "offboarded": return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">Offboarded</Badge>;
    default: return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{status || "Pending"}</Badge>;
  }
};

export default function EmployeeProfilePage() {
  const [, params] = useRoute("/admin/employees/:id");
  const [, setLocation] = useLocation();
  const employeeId = params?.id ? parseInt(params.id) : null;
  const { user } = useAuth();

  const [editingSection, setEditingSection] = useState<"personal" | "admin" | null>(null);
  const [activeTab, setActiveTab] = useState("performance");
  const [activeSection, setActiveSection] = useState("basic");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const contentRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const employee = employees.find((e: any) => e.id === employeeId);
  const emp = employee as any;

  // Determine permissions
  const isOwnProfile = useMemo(() => {
    if (!user || !emp) return false;
    return emp.userId === user.id || emp.email === user.email;
  }, [user, emp]);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return ["super_admin", "company_owner", "admin", "hr_admin"].includes(user.role);
  }, [user]);

  const departments = useMemo(() => Array.from(new Set(employees.map((e: any) => e.department).filter(Boolean))) as string[], [employees]);
  const positions = useMemo(() => Array.from(new Set(employees.map((e: any) => e.position).filter(Boolean))) as string[], [employees]);
  const managers = useMemo(
    () => employees.filter((e: any) => e.id !== employeeId).map((e: any) => ({ value: String(e.id), label: `${e.firstName} ${e.lastName}` })),
    [employees, employeeId]
  );

  // Personal form (employee-editable)
  const [personalForm, setPersonalForm] = useState({ phone: "", city: "", country: "", pronouns: "" });
  // Admin form (admin-editable)
  const [adminForm, setAdminForm] = useState({
    firstName: "", lastName: "", position: "", department: "",
    employmentType: "full_time", salary: "", currency: "USD",
    status: "active", managerId: "",
  });

  useEffect(() => {
    if (editingSection === "personal" && emp) {
      setPersonalForm({
        phone: emp.phone || "", city: emp.city || "",
        country: emp.country || "", pronouns: emp.metadata?.pronouns || "",
      });
    }
    if (editingSection === "admin" && emp) {
      setAdminForm({
        firstName: emp.firstName || "", lastName: emp.lastName || "",
        position: emp.position || "", department: emp.department || "",
        employmentType: emp.employmentType || "full_time",
        salary: emp.salary ? String(emp.salary) : "", currency: emp.currency || "USD",
        status: emp.status || "active", managerId: emp.managerId ? String(emp.managerId) : "",
      });
    }
  }, [editingSection, emp]);

  const updateMut = trpc.employee.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated");
      utils.employee.list.invalidate();
      setEditingSection(null);
    },
    onError: (err) => toast.error(err.message || "Failed to update"),
  });

  const handleSavePersonal = () => {
    if (!employeeId) return;
    updateMut.mutate({
      id: employeeId,
      phone: personalForm.phone || undefined,
      city: personalForm.city || undefined,
      country: personalForm.country || undefined,
    });
  };

  const handleSaveAdmin = () => {
    if (!employeeId) return;
    updateMut.mutate({
      id: employeeId,
      firstName: adminForm.firstName || undefined,
      lastName: adminForm.lastName || undefined,
      position: adminForm.position || undefined,
      department: adminForm.department || undefined,
      salary: adminForm.salary || undefined,
      currency: adminForm.currency || undefined,
      status: (adminForm.status as any) || undefined,
      managerId: adminForm.managerId ? parseInt(adminForm.managerId) : undefined,
    });
  };

  const handlePhotoUpload = (type: "profile" | "cover") => {
    const input = type === "cover" ? coverInputRef.current : avatarInputRef.current;
    if (input) input.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "cover") => {
    const file = e.target.files?.[0];
    if (!file || !employeeId) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const payload: any = { id: employeeId };
      if (type === "profile") payload.profilePictureUrl = dataUrl;
      else payload.coverPhotoUrl = dataUrl;
      updateMut.mutate(payload, {
        onSuccess: () => toast.success(`${type === "profile" ? "Profile picture" : "Cover photo"} updated`),
      });
    };
    reader.readAsDataURL(file);
  };

  // Scroll-based section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = Object.keys(sectionRefs.current).find(
              (key) => sectionRefs.current[key] === entry.target
            );
            if (id) setActiveSection(id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  });

  if (!employee) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 mb-4">Employee not found</p>
            <Button onClick={() => setLocation("/admin/employees")}>Back to Employees</Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const departmentOptions = departments.map((d) => ({ value: d, label: d }));
  const positionOptions = positions.map((p) => ({ value: p, label: p }));
  const countryOptions = COUNTRIES.map((c) => ({ value: c, label: c }));
  const fullName = `${emp.firstName} ${emp.lastName}`;
  const avatarColor = getAvatarColor(fullName);
  const managerEmployee = emp.managerId ? employees.find((e: any) => e.id === emp.managerId) : null;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "cover")} />
        <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "profile")} />

        <Button variant="ghost" size="sm" onClick={() => setLocation("/admin/employees")} className="mb-3">
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>

        {/* ═══ LinkedIn-Style Header ═══ */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-6">
          {/* Cover Photo */}
          <div className="relative h-44 bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 overflow-hidden">
            {emp.coverPhotoUrl && (
              <img src={emp.coverPhotoUrl} alt="Cover" className="w-full h-full object-cover" />
            )}
            {!emp.coverPhotoUrl && (
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="covergrid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <circle cx="15" cy="15" r="1" fill="white" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#covergrid)" />
                </svg>
              </div>
            )}
            {isOwnProfile && (
              <button onClick={() => handlePhotoUpload("cover")} className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 rounded-lg text-white transition-colors" title="Change cover photo">
                <Camera size={16} />
              </button>
            )}
          </div>

          {/* Profile info below cover */}
          <div className="relative px-4 sm:px-6 pb-5">
            {/* Profile Picture - half overlapping cover */}
            <div className="absolute -top-14 left-4 sm:left-6">
              <div className="relative group">
                {emp.profilePictureUrl ? (
                  <img src={emp.profilePictureUrl} alt={fullName} className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg" />
                ) : (
                  <div className={`w-28 h-28 rounded-full ${avatarColor} flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg`}>
                    {emp.firstName[0]}{emp.lastName[0]}
                  </div>
                )}
                {isOwnProfile && (
                  <button onClick={() => handlePhotoUpload("profile")} className="absolute bottom-1 right-1 p-1.5 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" title="Change profile picture">
                    <Camera size={14} className="text-slate-600" />
                  </button>
                )}
              </div>
              {/* Status badge centered under picture */}
              <div className="flex justify-center mt-2">
                {getStatusBadge(emp.status)}
              </div>
            </div>

            {/* Name on straight line, department below */}
            <div className="flex items-start justify-between ml-0 pt-[70px] sm:ml-[148px] sm:pt-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{fullName}</h1>
                <p className="text-sm sm:text-[15px] text-slate-600 mt-1">{emp.position || "No title"}</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  {[emp.department, emp.city, emp.country].filter(Boolean).join(" \u00b7 ")}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm"><MoreVertical size={16} /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isAdmin && <DropdownMenuItem onClick={() => setEditingSection("admin")}><Edit size={14} className="mr-2" />Edit Job Info</DropdownMenuItem>}
                  {isOwnProfile && <DropdownMenuItem onClick={() => setEditingSection("personal")}><Pencil size={14} className="mr-2" />Edit Personal Info</DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  {isAdmin && <DropdownMenuItem><Shield size={14} className="mr-2" />Change Role</DropdownMenuItem>}
                  {isAdmin && <DropdownMenuItem><Users2 size={14} className="mr-2" />Assign Manager</DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  {isAdmin && <DropdownMenuItem><Power size={14} className="mr-2" />Deactivate</DropdownMenuItem>}
                  {isAdmin && <DropdownMenuItem className="text-red-600"><Trash2 size={14} className="mr-2" />Delete</DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Action Tabs - equal grid, aligned icons */}
        <div className="bg-white border border-slate-200 rounded-xl mb-6 overflow-x-auto">
          <div className="grid grid-cols-6 min-w-[480px]">
            {ACTION_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center gap-1.5 py-4 border-b-2 transition-all ${
                    isActive ? "border-teal-600 bg-teal-50/50 text-teal-700" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isActive ? "bg-teal-100" : "bg-slate-100"}`}>
                    <tab.icon size={18} className={isActive ? "text-teal-600" : "text-slate-400"} />
                  </div>
                  <span className="text-[11px] font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ Main Content: Left Sidebar + Right Panel ═══ */}
        <div className="flex gap-3">
          {/* Left Sidebar Menu - hidden on mobile, collapsible on desktop */}
          <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${sidebarOpen ? "w-[180px]" : "w-[44px]"}`}>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden sticky top-4">
              {/* Toggle button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-full flex items-center justify-center py-2 border-b border-slate-100 hover:bg-slate-50 text-slate-400"
              >
                {sidebarOpen ? (
                  <ChevronLeft size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
              <nav className="py-1">
                {SIDEBAR_SECTIONS.map((section) => {
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSection(section.id);
                        const el = sectionRefs.current[section.id];
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      title={!sidebarOpen ? section.label : undefined}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-all ${
                        isActive
                          ? "bg-teal-50 text-teal-700 font-semibold border-l-2 border-teal-600"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-transparent"
                      } ${!sidebarOpen ? "justify-center px-0" : ""}`}
                    >
                      <section.icon size={14} className={`flex-shrink-0 ${isActive ? "text-teal-600" : "text-slate-400"}`} />
                      {sidebarOpen && <span className="truncate">{section.label}</span>}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Right Content Area - All sections stacked */}
          <div className="flex-1 min-w-0 space-y-5" ref={contentRef}>
            {/* Save/Cancel Bar */}
            {editingSection && (
              <div className="flex gap-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Button size="sm" onClick={editingSection === "personal" ? handleSavePersonal : handleSaveAdmin} disabled={updateMut.isPending}>
                  {updateMut.isPending ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Save size={14} className="mr-2" />}Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingSection(null)}><X size={14} className="mr-2" />Cancel</Button>
              </div>
            )}

            {/* Basic Info */}
            <div ref={(el) => { sectionRefs.current["basic"] = el; }} className="scroll-mt-4 border border-slate-200 rounded-xl overflow-hidden bg-white">
              <SectionHeader title="Basic Information" action={
                isOwnProfile && editingSection !== "personal" ? (
                  <button onClick={() => setEditingSection("personal")} className="text-xs text-teal-600 font-medium hover:underline flex items-center gap-1"><Pencil size={11} /> Edit</button>
                ) : null
              } />
              {editingSection === "personal" ? (
                <>
                  <EditInputRow label="Phone" value={personalForm.phone} onChange={(v) => setPersonalForm(p => ({ ...p, phone: v }))} placeholder="+1 234 567 890" />
                  <EditInputRow label="City" value={personalForm.city} onChange={(v) => setPersonalForm(p => ({ ...p, city: v }))} />
                  <EditSelectRow label="Country" value={personalForm.country} onChange={(v) => setPersonalForm(p => ({ ...p, country: v }))} options={countryOptions} />
                  <EditSelectRow label="Pronouns" value={personalForm.pronouns} onChange={(v) => setPersonalForm(p => ({ ...p, pronouns: v }))} options={PRONOUNS.map(p => ({ value: p, label: p }))} placeholder="Select pronouns" />
                </>
              ) : (
                <>
                  <ViewRow label="Full Name" value={fullName} />
                  <ViewRow label="Email" value={emp.email} />
                  <ViewRow label="Phone" value={emp.phone} />
                  <ViewRow label="City" value={emp.city} />
                  <ViewRow label="Country" value={emp.country} />
                  <ViewRow label="Pronouns" value={emp.metadata?.pronouns || "\u2014"} />
                  <ViewRow label="Employee ID" value={emp.employeeId || `EMP-${emp.id}`} />
                </>
              )}
            </div>

            {/* Work */}
            <div ref={(el) => { sectionRefs.current["work"] = el; }} className="scroll-mt-4 border border-slate-200 rounded-xl overflow-hidden bg-white">
              <SectionHeader title="Work" adminOnly action={
                isAdmin && editingSection !== "admin" ? (
                  <button onClick={() => setEditingSection("admin")} className="text-xs text-teal-600 font-medium hover:underline flex items-center gap-1"><Pencil size={11} /> Edit</button>
                ) : null
              } />
              {editingSection === "admin" ? (
                <>
                  <EditInputRow label="First Name" value={adminForm.firstName} onChange={(v) => setAdminForm(p => ({ ...p, firstName: v }))} />
                  <EditInputRow label="Last Name" value={adminForm.lastName} onChange={(v) => setAdminForm(p => ({ ...p, lastName: v }))} />
                  <EditSelectRow label="Job Title" value={adminForm.position} onChange={(v) => setAdminForm(p => ({ ...p, position: v }))} options={positionOptions} />
                  <EditSelectRow label="Department" value={adminForm.department} onChange={(v) => setAdminForm(p => ({ ...p, department: v }))} options={departmentOptions} />
                  <EditSelectRow label="Reports To" value={adminForm.managerId} onChange={(v) => setAdminForm(p => ({ ...p, managerId: v }))} options={[{ value: "", label: "No Manager" }, ...managers]} placeholder="Select manager" />
                </>
              ) : (
                <>
                  <ViewRow label="Job Title" value={emp.position} />
                  <ViewRow label="Department" value={emp.department} />
                  <ViewRow label="Reports To" value={managerEmployee ? `${managerEmployee.firstName} ${managerEmployee.lastName}` : "\u2014"} onClick={managerEmployee ? () => setLocation(`/admin/employees/${managerEmployee.id}`) : undefined} />
                  <ViewRow label="Start Date" value={emp.startDate ? new Date(emp.startDate).toLocaleDateString("en-GB") : "\u2014"} />
                </>
              )}
            </div>

            {/* Work Contact */}
            <div ref={(el) => { sectionRefs.current["work-contact"] = el; }} className="scroll-mt-4 border border-slate-200 rounded-xl overflow-hidden bg-white">
              <SectionHeader title="Work Contact Details" />
              <ViewRow label="Work Email" value={emp.email} />
              <ViewRow label="Work Phone" value={emp.phone || "\u2014"} />
              <ViewRow label="Office Location" value={emp.city || "\u2014"} />
            </div>

            {/* Employment */}
            <div ref={(el) => { sectionRefs.current["employment"] = el; }} className="scroll-mt-4 border border-slate-200 rounded-xl overflow-hidden bg-white">
              <SectionHeader title="Employment" adminOnly action={
                isAdmin && editingSection !== "admin" ? (
                  <button onClick={() => setEditingSection("admin")} className="text-xs text-teal-600 font-medium hover:underline flex items-center gap-1"><Pencil size={11} /> Edit</button>
                ) : null
              } />
              <ViewRow label="Employment Type" value={emp.employmentType?.replace("_", " ")} />
              <ViewRow label="Status" value={getStatusBadge(emp.status)} />
              <ViewRow label="Start Date" value={emp.startDate ? new Date(emp.startDate).toLocaleDateString("en-GB") : "\u2014"} />
              <ViewRow label="End Date" value={emp.endDate ? new Date(emp.endDate).toLocaleDateString("en-GB") : "\u2014"} />
            </div>

            {/* Lifecycle */}
            <div ref={(el) => { sectionRefs.current["lifecycle"] = el; }} className="scroll-mt-4 border border-slate-200 rounded-xl overflow-hidden bg-white">
              <SectionHeader title="Lifecycle" />
              <ViewRow label="Hire Date" value={emp.startDate ? new Date(emp.startDate).toLocaleDateString("en-GB") : "\u2014"} />
              <ViewRow label="Probation End" value={"\u2014"} />
              <ViewRow label="Last Promotion" value={"\u2014"} />
              <ViewRow label="Offboarding Date" value={emp.endDate ? new Date(emp.endDate).toLocaleDateString("en-GB") : "\u2014"} />
            </div>

            {/* Work Permit */}
            <div ref={(el) => { sectionRefs.current["work-permit"] = el; }} className="scroll-mt-4 border border-slate-200 rounded-xl overflow-hidden bg-white">
              <SectionHeader title="Work Permit" adminOnly />
              <ViewRow label="Permit Type" value={"\u2014"} />
              <ViewRow label="Permit Number" value={"\u2014"} />
              <ViewRow label="Issue Date" value={"\u2014"} />
              <ViewRow label="Expiry Date" value={"\u2014"} />
              <ViewRow label="Issuing Country" value={emp.country || "\u2014"} />
            </div>

            {/* Payroll */}
            <div ref={(el) => { sectionRefs.current["payroll"] = el; }} className="scroll-mt-4 border border-slate-200 rounded-xl overflow-hidden bg-white">
              <SectionHeader title="Payroll" adminOnly action={
                isAdmin && editingSection !== "admin" ? (
                  <button onClick={() => setEditingSection("admin")} className="text-xs text-teal-600 font-medium hover:underline flex items-center gap-1"><Pencil size={11} /> Edit</button>
                ) : null
              } />
              <ViewRow label="Salary" value={(isAdmin || isOwnProfile) && emp.salary ? `${emp.currency || "USD"} ${Number(emp.salary).toLocaleString()}` : "Restricted"} />
              <ViewRow label="Currency" value={emp.currency || "USD"} />
              <ViewRow label="Payment Method" value={"\u2014"} />
              <ViewRow label="Bank Account" value={"\u2014"} />
              <ViewRow label="Tax ID" value={"\u2014"} />
            </div>

            {/* Personal */}
            <div ref={(el) => { sectionRefs.current["personal"] = el; }} className="scroll-mt-4 border border-slate-200 rounded-xl overflow-hidden bg-white">
              <SectionHeader title="Personal" />
              <ViewRow label="Date of Birth" value={"\u2014"} />
              <ViewRow label="Gender" value={"\u2014"} />
              <ViewRow label="Pronouns" value={emp.metadata?.pronouns || "\u2014"} />
              <ViewRow label="Nationality" value={emp.country || "\u2014"} />
              <ViewRow label="Marital Status" value={"\u2014"} />
            </div>

            {/* Contact Information */}
            <div ref={(el) => { sectionRefs.current["contact"] = el; }} className="scroll-mt-4 border border-slate-200 rounded-xl overflow-hidden bg-white">
              <SectionHeader title="Contact Information" />
              <ViewRow label="Personal Email" value={"\u2014"} />
              <ViewRow label="Phone" value={emp.phone || "\u2014"} />
              <ViewRow label="Mobile" value={"\u2014"} />
            </div>

            {/* Home */}
            <div ref={(el) => { sectionRefs.current["home"] = el; }} className="scroll-mt-4 border border-slate-200 rounded-xl overflow-hidden bg-white">
              <SectionHeader title="Home Address" />
              <ViewRow label="Street" value={"\u2014"} />
              <ViewRow label="City" value={emp.city || "\u2014"} />
              <ViewRow label="State/Region" value={"\u2014"} />
              <ViewRow label="Postal Code" value={"\u2014"} />
              <ViewRow label="Country" value={emp.country || "\u2014"} />
            </div>

            {/* About */}
            <div ref={(el) => { sectionRefs.current["about"] = el; }} className="scroll-mt-4 border border-slate-200 rounded-xl overflow-hidden bg-white">
              <SectionHeader title="About" />
              <ViewRow label="Bio" value={"\u2014"} />
              <ViewRow label="Interests" value={"\u2014"} />
              <ViewRow label="Skills" value={"\u2014"} />
              <ViewRow label="Languages" value={"\u2014"} />
            </div>

            {/* Emergency */}
            <div ref={(el) => { sectionRefs.current["emergency"] = el; }} className="scroll-mt-4 border border-slate-200 rounded-xl overflow-hidden bg-white">
              <SectionHeader title="Emergency Contact" />
              <ViewRow label="Contact Name" value={"\u2014"} />
              <ViewRow label="Relationship" value={"\u2014"} />
              <ViewRow label="Phone" value={"\u2014"} />
              <ViewRow label="Email" value={"\u2014"} />
            </div>

            {/* Assets */}
            <div ref={(el) => { sectionRefs.current["assets"] = el; }} className="scroll-mt-4 border border-slate-200 rounded-xl overflow-hidden bg-white">
              <SectionHeader title="Assets" adminOnly />
              <ViewRow label="Laptop" value={"\u2014"} />
              <ViewRow label="Phone" value={"\u2014"} />
              <ViewRow label="Access Card" value={"\u2014"} />
              <ViewRow label="Other Equipment" value={"\u2014"} />
            </div>

            {/* Training */}
            <div ref={(el) => { sectionRefs.current["training"] = el; }} className="scroll-mt-4 border border-slate-200 rounded-xl overflow-hidden bg-white">
              <SectionHeader title="Training & Certifications" />
              <ViewRow label="Completed Courses" value={"\u2014"} />
              <ViewRow label="Certifications" value={"\u2014"} />
              <ViewRow label="Next Training Due" value={"\u2014"} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
