import { useState, useEffect, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  MoreVertical,
  Edit,
  Shield,
  Users2,
  Power,
  Trash2,
  AlertCircle,
  Save,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Germany", "France", "Australia",
  "India", "Japan", "Brazil", "Mexico", "Nigeria", "South Africa", "Kenya",
  "UAE", "Saudi Arabia", "Singapore", "Netherlands", "Sweden", "Switzerland",
  "Spain", "Italy", "China", "South Korea", "Indonesia", "Philippines",
  "Egypt", "Ghana", "Rwanda", "Tanzania", "Morocco",
];

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "INR", "JPY", "BRL", "NGN", "ZAR", "KES", "AED", "SAR", "SGD", "CHF", "SEK", "CNY", "KRW"];

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

/* ── Row Components ── */

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
      <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{title}</h3>
    </div>
  );
}

function ViewRow({ label, value, onClick }: { label: string; value: React.ReactNode; onClick?: () => void }) {
  return (
    <div className="flex items-center py-3 px-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
      <span className="text-sm text-slate-500 w-48 shrink-0 font-medium">{label}</span>
      {onClick ? (
        <button onClick={onClick} className="text-sm text-blue-600 hover:underline font-medium">
          {value || "—"}
        </button>
      ) : (
        <span className="text-sm text-slate-900 font-medium">{value || "—"}</span>
      )}
    </div>
  );
}

function EditInputRow({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex items-center py-2 px-4 border-b border-slate-100 last:border-b-0">
      <span className="text-sm text-slate-500 w-48 shrink-0 font-medium">{label}</span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="h-8 text-sm max-w-xs"
      />
    </div>
  );
}

function EditSelectRow({
  label, value, onChange, options, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <div className="flex items-center py-2 px-4 border-b border-slate-100 last:border-b-0">
      <span className="text-sm text-slate-500 w-48 shrink-0 font-medium">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-sm max-w-xs">
          <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ── Badge helpers ── */

const getRoleBadge = (role: string | undefined) => {
  switch (role) {
    case "admin": return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Admin</Badge>;
    case "manager": return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Manager</Badge>;
    default: return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">Employee</Badge>;
  }
};

const getStatusBadge = (status: string | undefined) => {
  switch (status) {
    case "active": return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Active</Badge>;
    case "inactive": return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">Inactive</Badge>;
    case "suspended": return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Suspended</Badge>;
    case "on_leave": return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">On Leave</Badge>;
    case "offboarded": return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">Offboarded</Badge>;
    default: return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{status || "Pending"}</Badge>;
  }
};

/* ── Main Component ── */

export default function EmployeeProfilePage() {
  const [, params] = useRoute("/admin/employees/:id");
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const employeeId = params?.id ? parseInt(params.id) : null;

  const utils = trpc.useUtils();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const employee = employees.find((e: any) => e.id === employeeId);
  const emp = employee as any;

  // Build dynamic dropdown options from existing employees
  const departments = useMemo(
    () => Array.from(new Set(employees.map((e: any) => e.department).filter(Boolean))) as string[],
    [employees]
  );
  const positions = useMemo(
    () => Array.from(new Set(employees.map((e: any) => e.position).filter(Boolean))) as string[],
    [employees]
  );
  const managers = useMemo(
    () => employees.filter((e: any) => e.id !== employeeId).map((e: any) => ({
      value: String(e.id),
      label: `${e.firstName} ${e.lastName}`,
    })),
    [employees, employeeId]
  );

  // Edit form state
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    city: "", country: "", position: "", department: "",
    employmentType: "full_time", salary: "", currency: "USD",
    status: "active", managerId: "",
  });

  // Populate form when entering edit mode
  useEffect(() => {
    if (isEditing && emp) {
      setForm({
        firstName: emp.firstName || "",
        lastName: emp.lastName || "",
        email: emp.email || "",
        phone: emp.phone || "",
        city: emp.city || "",
        country: emp.country || "",
        position: emp.position || "",
        department: emp.department || "",
        employmentType: emp.employmentType || "full_time",
        salary: emp.salary ? String(emp.salary) : "",
        currency: emp.currency || "USD",
        status: emp.status || "active",
        managerId: emp.managerId ? String(emp.managerId) : "",
      });
    }
  }, [isEditing, emp]);

  const updateMut = trpc.employee.update.useMutation({
    onSuccess: () => {
      toast.success("Employee updated successfully");
      utils.employee.list.invalidate();
      setIsEditing(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update employee");
    },
  });

  const handleSave = () => {
    if (!employeeId) return;
    updateMut.mutate({
      id: employeeId,
      firstName: form.firstName || undefined,
      lastName: form.lastName || undefined,
      phone: form.phone || undefined,
      city: form.city || undefined,
      country: form.country || undefined,
      position: form.position || undefined,
      department: form.department || undefined,
      salary: form.salary || undefined,
      currency: form.currency || undefined,
      status: (form.status as any) || undefined,
      managerId: form.managerId ? parseInt(form.managerId) : undefined,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const setField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

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

  // Build country options
  const countryOptions = useMemo(() => {
    const all = new Set([...COUNTRIES, ...(emp?.country ? [emp.country] : [])]);
    return Array.from(all).sort().map((c) => ({ value: c, label: c }));
  }, [emp?.country]);

  // Build department options
  const departmentOptions = useMemo(() => {
    const all = new Set([...departments, "Engineering", "Product", "Design", "Marketing", "Sales", "Finance", "HR", "Operations", "Legal", "Support"]);
    return Array.from(all).sort().map((d) => ({ value: d, label: d }));
  }, [departments]);

  // Build position options
  const positionOptions = useMemo(() => {
    const all = new Set([...positions, "Software Engineer", "Product Manager", "Designer", "Data Analyst", "HR Manager", "Finance Manager", "Sales Representative", "Marketing Manager", "Operations Manager", "CEO", "CTO", "CFO", "COO"]);
    return Array.from(all).sort().map((p) => ({ value: p, label: p }));
  }, [positions]);

  const currencyOptions = CURRENCIES.map((c) => ({ value: c, label: c }));
  const managerName = emp.managerId ? employees.find((e: any) => e.id === emp.managerId) : null;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/admin/employees")}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel} className="gap-2">
                  <X size={14} />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={updateMut.isPending} className="gap-2 bg-teal-600 hover:bg-teal-700">
                  {updateMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Edit size={14} />
                  Edit
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit size={14} className="mr-2" /> Edit Employee
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.info("Feature coming soon")}>
                      <Shield size={14} className="mr-2" /> Change Role
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.info("Feature coming soon")}>
                      <Users2 size={14} className="mr-2" /> Assign Manager
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => toast.info("Feature coming soon")}>
                      <Power size={14} className="mr-2" /> Deactivate
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => toast.info("Feature coming soon")}>
                      <Trash2 size={14} className="mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>

        {/* Employee Header */}
        <div className="flex items-center gap-4 pb-2">
          <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xl shrink-0">
            {emp.firstName?.[0]}{emp.lastName?.[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{emp.firstName} {emp.lastName}</h1>
            <p className="text-sm text-slate-500">{emp.position || "No position"} · {emp.department || "No department"}</p>
          </div>
          <div className="flex gap-2 ml-auto">
            {getRoleBadge((emp as any).role)}
            {getStatusBadge(emp.status)}
          </div>
        </div>

        {/* Data Sheet */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

          {/* Personal Information */}
          <SectionHeader title="Personal Information" />
          {isEditing ? (
            <>
              <EditInputRow label="First Name" value={form.firstName} onChange={(v) => setField("firstName", v)} />
              <EditInputRow label="Last Name" value={form.lastName} onChange={(v) => setField("lastName", v)} />
              <ViewRow label="Email" value={emp.email} />
              <EditInputRow label="Phone" value={form.phone} onChange={(v) => setField("phone", v)} placeholder="+1 234 567 8900" />
              <EditInputRow label="City" value={form.city} onChange={(v) => setField("city", v)} />
              <EditSelectRow label="Country" value={form.country} onChange={(v) => setField("country", v)} options={countryOptions} />
            </>
          ) : (
            <>
              <ViewRow label="Full Name" value={`${emp.firstName} ${emp.lastName}`} />
              <ViewRow label="Email" value={emp.email} />
              <ViewRow label="Phone" value={emp.phone} />
              <ViewRow label="City" value={emp.city} />
              <ViewRow label="Country" value={emp.country} />
              <ViewRow label="Employee ID" value={emp.employeeId || `EMP-${emp.id}`} />
            </>
          )}

          {/* Job Information */}
          <SectionHeader title="Job Information" />
          {isEditing ? (
            <>
              <EditSelectRow label="Job Title" value={form.position} onChange={(v) => setField("position", v)} options={positionOptions} />
              <EditSelectRow label="Department" value={form.department} onChange={(v) => setField("department", v)} options={departmentOptions} />
              <EditSelectRow label="Reports To" value={form.managerId} onChange={(v) => setField("managerId", v)} options={[{ value: "", label: "No Manager" }, ...managers]} placeholder="Select manager" />
              <EditSelectRow label="Employment Type" value={form.employmentType} onChange={(v) => setField("employmentType", v)} options={EMPLOYMENT_TYPES} />
              <EditSelectRow label="Status" value={form.status} onChange={(v) => setField("status", v)} options={STATUSES} />
            </>
          ) : (
            <>
              <ViewRow label="Job Title" value={emp.position} />
              <ViewRow label="Department" value={emp.department} />
              <ViewRow
                label="Reports To"
                value={managerName ? `${(managerName as any).firstName} ${(managerName as any).lastName}` : "Not assigned"}
                onClick={emp.managerId ? () => setLocation(`/admin/employees/${emp.managerId}`) : undefined}
              />
              <ViewRow label="Employment Type" value={emp.employmentType?.replace("_", " ")} />
              <ViewRow label="Start Date" value={emp.startDate ? new Date(emp.startDate).toLocaleDateString() : undefined} />
              <ViewRow label="End Date" value={emp.endDate ? new Date(emp.endDate).toLocaleDateString() : undefined} />
            </>
          )}

          {/* Compensation */}
          <SectionHeader title="Compensation" />
          {isEditing ? (
            <>
              <EditInputRow label="Salary" value={form.salary} onChange={(v) => setField("salary", v)} placeholder="e.g. 85000" />
              <EditSelectRow label="Currency" value={form.currency} onChange={(v) => setField("currency", v)} options={currencyOptions} />
            </>
          ) : (
            <>
              <ViewRow label="Salary" value={emp.salary ? `${emp.currency || "USD"} ${Number(emp.salary).toLocaleString()}` : undefined} />
              <ViewRow label="Currency" value={emp.currency} />
              <ViewRow label="Bonus" value="—" />
              <ViewRow label="Equity" value="—" />
            </>
          )}

          {/* Payroll */}
          <SectionHeader title="Payroll" />
          <ViewRow label="Bank Details" value="Not provided" />
          <ViewRow label="Tax Info" value="Not provided" />
          <ViewRow label="Payroll Status" value={emp.status === "active" ? "Active" : "Pending"} />

          {/* Time Off */}
          <SectionHeader title="Time Off" />
          <ViewRow label="PTO Balance" value="—" />
          <ViewRow label="Leave History" value="No records" />
          <ViewRow label="Pending Requests" value="None" />

          {/* Performance */}
          <SectionHeader title="Performance" />
          <ViewRow label="Goals / OKRs" value="Not set" />
          <ViewRow label="Reviews" value="No reviews yet" />
          <ViewRow label="Feedback" value="No feedback yet" />

          {/* Documents */}
          <SectionHeader title="Documents" />
          <ViewRow label="Contract" value={emp.contractUrl ? "Uploaded" : "Not uploaded"} />
          <ViewRow label="ID Documents" value="Not uploaded" />
          <ViewRow label="Other Files" value="None" />

          {/* Activity Log */}
          <SectionHeader title="Activity Log" />
          <ViewRow label="Account Created" value={emp.createdAt ? new Date(emp.createdAt).toLocaleString() : undefined} />
          <ViewRow label="Last Updated" value={emp.updatedAt ? new Date(emp.updatedAt).toLocaleString() : undefined} />
          <ViewRow label="Role Changes" value="No changes recorded" />
          <ViewRow label="Salary Updates" value="No changes recorded" />
          <ViewRow label="Manager Changes" value="No changes recorded" />

        </div>

        {/* Bottom Save Bar (sticky when editing) */}
        {isEditing && (
          <div className="sticky bottom-0 bg-white border border-slate-200 rounded-xl p-4 shadow-lg flex items-center justify-between">
            <p className="text-sm text-slate-500">You have unsaved changes</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updateMut.isPending} className="bg-teal-600 hover:bg-teal-700">
                {updateMut.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
