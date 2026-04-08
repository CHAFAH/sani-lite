import { useRoute, useLocation } from "wouter";
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

  const getRoleBadgeColor = (role: string | undefined) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-800";
    case "inactive":
      return "bg-slate-100 text-slate-800";
    case "suspended":
      return "bg-red-100 text-red-800";
    default:
      return "bg-yellow-100 text-yellow-800";
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
            <p className="text-slate-600">Employee not found</p>
            <Button onClick={() => setLocation("/admin/employees")} className="mt-4">
              Back to Employees
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
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
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{employee?.firstName} {employee?.lastName}</h1>
              <p className="text-slate-600 mt-1">{employee?.position || "No position set"}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <Edit size={16} className="mr-2" />
                Edit Employee
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Shield size={16} className="mr-2" />
                Change Role
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users2 size={16} className="mr-2" />
                Assign Manager
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Power size={16} className="mr-2" />
                Deactivate
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 size={16} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Badges */}
        <div className="flex gap-2">
          <Badge className={getRoleBadgeColor((employee as any)?.role || "user")}>
            {(employee as any)?.role || "Employee"}
          </Badge>
          <Badge className={getStatusBadgeColor(employee?.status || "active")}>
            {employee?.status || "Active"}
          </Badge>
        </div>

        {/* Main Content - All Details on One Page */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contact & Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-slate-400" />
                  <div>
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Email</p>
                    <p className="text-sm font-medium text-slate-900">{employee?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-slate-400" />
                  <div>
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Phone</p>
                    <p className="text-sm font-medium text-slate-900">{employee?.phone || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-slate-400" />
                  <div>
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Location</p>
                    <p className="text-sm font-medium text-slate-900">
                      {employee?.city && employee?.country
                        ? `${employee.city}, ${employee.country}`
                        : "Not provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Information */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Briefcase size={18} className="text-slate-400" />
                  <div>
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Position</p>
                    <p className="text-sm font-medium text-slate-900">{employee?.position || "Not set"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users2 size={18} className="text-slate-400" />
                  <div>
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Department</p>
                    <p className="text-sm font-medium text-slate-900">{employee?.department || "Not set"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-slate-400" />
                  <div>
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Employment Type</p>
                    <p className="text-sm font-medium text-slate-900 capitalize">
                      {employee?.employmentType?.replace("_", " ") || "Not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users2 size={18} className="text-slate-400" />
                  <div>
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Manager</p>
                    <p className="text-sm font-medium text-slate-900">
                      {employee?.manager ? (
                        <button
                          onClick={() => setLocation(`/admin/employees/${employee.managerId}`)}
                          className="text-blue-600 hover:underline"
                        >
                          {employee.manager}
                        </button>
                      ) : (
                        "Not assigned"
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compensation Information */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Compensation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-slate-400" />
                  <div>
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Salary</p>
                    <p className="text-sm font-medium text-slate-900">
                      {employee?.salary ? `${employee.currency} ${employee.salary}` : "Not set"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employment Dates */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Employment Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-slate-400" />
                  <div>
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Start Date</p>
                    <p className="text-sm font-medium text-slate-900">
                      {employee?.startDate
                        ? new Date(employee.startDate).toLocaleDateString()
                        : "Not set"}
                    </p>
                  </div>
                </div>
                {employee?.endDate && (
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-slate-400" />
                    <div>
                      <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">End Date</p>
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(employee.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Summary */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Employee ID</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{employee?.id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Status</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1 capitalize">{employee?.status}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Role</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1 capitalize">{(employee as any)?.role}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => setIsEditOpen(true)}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Edit size={16} className="mr-2" />
                  Edit Profile
                </Button>
                <Button
                  onClick={() => setLocation(`/admin/employees/${employee?.id}/edit`)}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <FileText size={16} className="mr-2" />
                  Full Edit
                </Button>
              </CardContent>
            </Card>
          </div>
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
