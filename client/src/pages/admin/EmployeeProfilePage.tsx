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
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <div className="flex items-center py-2 px-4 border-b border-slate-100 last:border-b-0">
      <span className="text-sm text-slate-500 w-48 shrink-0 font-medium">{label}</span>
      <Select value={value || "__none__"} onValueChange={(v) => onChange(v === "__none__" ? "" : v)}>
        <SelectTrigger className="h-8 text-sm max-w-xs">
          <SelectValue placeholder={placeholder || label} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">{placeholder || "None"}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value || "__none__"}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const countryOptions = COUNTRIES.map((c) => ({ value: c, label: c }));

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
  // All hooks MUST be called at the top level, before any early returns
  const [, params] = useRoute("/admin/employees/:id");
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const employeeId = params?.id ? parseInt(params.id) : null;

  const utils = trpc.useUtils();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const employee = employees.find((e: any) => e.id === employeeId);
  const emp = employee as any;

  // Build dynamic dropdown options from existing employees - MUST be before early return
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

  // NOW we can do early returns after all hooks are called
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

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/admin/employees")}>
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">{emp.firstName} {emp.lastName}</h1>
            {getStatusBadge(emp.status)}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(!isEditing)}>
                <Edit size={14} className="mr-2" />
                {isEditing ? "Cancel Edit" : "Edit"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Shield size={14} className="mr-2" />
                Change Role
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users2 size={14} className="mr-2" />
                Assign Manager
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Power size={14} className="mr-2" />
                Deactivate
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 size={14} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Save/Cancel Bar (when editing) */}
        {isEditing && (
          <div className="flex gap-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Button size="sm" onClick={handleSave} disabled={updateMut.isPending}>
              {updateMut.isPending ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Save size={14} className="mr-2" />}
              Save Changes
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X size={14} className="mr-2" />
              Cancel
            </Button>
          </div>
        )}

        {/* Data Sheet */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          {/* Personal Information */}
          <SectionHeader title="Personal Information" />
          {isEditing ? (
            <>
              <EditInputRow label="First Name" value={form.firstName} onChange={(v) => setField("firstName", v)} />
              <EditInputRow label="Last Name" value={form.lastName} onChange={(v) => setField("lastName", v)} />
              <EditInputRow label="Email" value={form.email} onChange={(v) => setField("email", v)} />
              <EditInputRow label="Phone" value={form.phone} onChange={(v) => setField("phone", v)} />
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
              <ViewRow label="Reports To" value={emp.managerId ? managers.find((m) => m.value === String(emp.managerId))?.label || "—" : "—"} />
              <ViewRow label="Employment Type" value={emp.employmentType} />
              <ViewRow label="Status" value={emp.status} />
            </>
          )}

          {/* Compensation */}
          <SectionHeader title="Compensation" />
          {isEditing ? (
            <>
              <EditInputRow label="Salary" value={form.salary} onChange={(v) => setField("salary", v)} placeholder="0.00" />
              <EditSelectRow label="Currency" value={form.currency} onChange={(v) => setField("currency", v)} options={CURRENCIES.map((c) => ({ value: c, label: c }))} />
            </>
          ) : (
            <>
              <ViewRow label="Salary" value={emp.salary ? `${emp.currency || "USD"} ${emp.salary.toLocaleString()}` : "—"} />
              <ViewRow label="Currency" value={emp.currency || "USD"} />
            </>
          )}

          {/* Payroll Information */}
          <SectionHeader title="Payroll Information" />
          <ViewRow label="Bank Account" value={emp.bankAccount || "Not provided"} />
          <ViewRow label="Tax ID" value={emp.taxId || "Not provided"} />

          {/* Time Off */}
          <SectionHeader title="Time Off" />
          <ViewRow label="PTO Balance" value={emp.ptoBalance || "0 days"} />
          <ViewRow label="Sick Days Used" value={emp.sickDaysUsed || "0 days"} />

          {/* Performance */}
          <SectionHeader title="Performance" />
          <ViewRow label="Last Review" value={emp.lastReviewDate || "No review yet"} />
          <ViewRow label="Performance Rating" value={emp.performanceRating || "—"} />

          {/* Documents */}
          <SectionHeader title="Documents" />
          <ViewRow label="Employment Contract" value={emp.contractUrl ? <a href={emp.contractUrl} className="text-blue-600 hover:underline">View Contract</a> : "Not uploaded"} />
          <ViewRow label="Offer Letter" value={emp.offerLetterUrl ? <a href={emp.offerLetterUrl} className="text-blue-600 hover:underline">View Offer</a> : "Not uploaded"} />

          {/* Activity Log */}
          <SectionHeader title="Activity Log" />
          <ViewRow label="Created" value={emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : "—"} />
          <ViewRow label="Last Updated" value={emp.updatedAt ? new Date(emp.updatedAt).toLocaleDateString() : "—"} />
        </div>
      </div>
    </AdminLayout>
  );
}
