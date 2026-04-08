import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EditEmployeeDrawer from "@/components/EditEmployeeDrawer";
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
} from "lucide-react";
import { toast } from "sonner";

function InfoRow({ label, value, onClick }: { label: string; value: React.ReactNode; onClick?: () => void }) {
  return (
    <div className="flex items-start py-3 px-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
      <span className="text-sm text-slate-500 w-44 shrink-0 font-medium">{label}</span>
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

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
      <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{title}</h3>
    </div>
  );
}

const getRoleBadge = (role: string | undefined) => {
  switch (role) {
    case "admin":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Admin</Badge>;
    case "manager":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Manager</Badge>;
    default:
      return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">Employee</Badge>;
  }
};

const getStatusBadge = (status: string | undefined) => {
  switch (status) {
    case "active":
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Active</Badge>;
    case "inactive":
      return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">Inactive</Badge>;
    case "suspended":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Suspended</Badge>;
    default:
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{status || "Pending"}</Badge>;
  }
};

export default function EmployeeProfilePage() {
  const [, params] = useRoute("/admin/employees/:id");
  const [, setLocation] = useLocation();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const employeeId = params?.id ? parseInt(params.id) : null;

  const { data: employees = [] } = trpc.employee.list.useQuery();
  const employee = employees.find((e: any) => e.id === employeeId);

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

  const emp = employee as any;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/admin/employees")}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
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
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
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
            {getRoleBadge(emp.role)}
            {getStatusBadge(emp.status)}
          </div>
        </div>

        {/* Data Sheet */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

          {/* Overview / Personal Info */}
          <SectionHeader title="Personal Information" />
          <InfoRow label="Full Name" value={`${emp.firstName} ${emp.lastName}`} />
          <InfoRow label="Email" value={emp.email} />
          <InfoRow label="Phone" value={emp.phone} />
          <InfoRow label="City" value={emp.city} />
          <InfoRow label="Country" value={emp.country} />
          <InfoRow label="Employee ID" value={emp.employeeId || `EMP-${emp.id}`} />

          {/* Job Info */}
          <SectionHeader title="Job Information" />
          <InfoRow label="Job Title" value={emp.position} />
          <InfoRow label="Department" value={emp.department} />
          <InfoRow
            label="Reports To"
            value={emp.manager || "Not assigned"}
            onClick={emp.managerId ? () => setLocation(`/admin/employees/${emp.managerId}`) : undefined}
          />
          <InfoRow label="Employment Type" value={emp.employmentType?.replace("_", " ")} />
          <InfoRow label="Start Date" value={emp.startDate ? new Date(emp.startDate).toLocaleDateString() : undefined} />
          <InfoRow label="End Date" value={emp.endDate ? new Date(emp.endDate).toLocaleDateString() : undefined} />

          {/* Compensation */}
          <SectionHeader title="Compensation" />
          <InfoRow label="Salary" value={emp.salary ? `${emp.currency || "USD"} ${Number(emp.salary).toLocaleString()}` : undefined} />
          <InfoRow label="Currency" value={emp.currency} />
          <InfoRow label="Bonus" value="—" />
          <InfoRow label="Equity" value="—" />

          {/* Payroll */}
          <SectionHeader title="Payroll" />
          <InfoRow label="Bank Details" value="Not provided" />
          <InfoRow label="Tax Info" value="Not provided" />
          <InfoRow label="Payroll Status" value={emp.status === "active" ? "Active" : "Pending"} />

          {/* Time Off */}
          <SectionHeader title="Time Off" />
          <InfoRow label="PTO Balance" value="—" />
          <InfoRow label="Leave History" value="No records" />
          <InfoRow label="Pending Requests" value="None" />

          {/* Performance */}
          <SectionHeader title="Performance" />
          <InfoRow label="Goals / OKRs" value="Not set" />
          <InfoRow label="Reviews" value="No reviews yet" />
          <InfoRow label="Feedback" value="No feedback yet" />

          {/* Documents */}
          <SectionHeader title="Documents" />
          <InfoRow label="Contract" value={emp.contractUrl ? "Uploaded" : "Not uploaded"} />
          <InfoRow label="ID Documents" value="Not uploaded" />
          <InfoRow label="Other Files" value="None" />

          {/* Activity Log */}
          <SectionHeader title="Activity Log" />
          <InfoRow label="Account Created" value={emp.createdAt ? new Date(emp.createdAt).toLocaleString() : undefined} />
          <InfoRow label="Last Updated" value={emp.updatedAt ? new Date(emp.updatedAt).toLocaleString() : undefined} />
          <InfoRow label="Role Changes" value="No changes recorded" />
          <InfoRow label="Salary Updates" value="No changes recorded" />
          <InfoRow label="Manager Changes" value="No changes recorded" />

        </div>
      </div>

      {/* Edit Drawer */}
      <EditEmployeeDrawer
        employee={employee}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </AdminLayout>
  );
}
