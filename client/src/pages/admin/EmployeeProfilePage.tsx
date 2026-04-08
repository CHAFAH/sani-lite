import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function EmployeeProfilePage() {
  const [, params] = useRoute("/admin/employees/:id");
  const [, setLocation] = useLocation();
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
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setLocation("/admin/employees")}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Employees
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statusColors: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700",
    inactive: "bg-slate-50 text-slate-700",
    invited: "bg-blue-50 text-blue-700",
    suspended: "bg-red-50 text-red-700",
  };

  const roleColors: Record<string, string> = {
    admin: "bg-purple-50 text-purple-700",
    manager: "bg-blue-50 text-blue-700",
    employee: "bg-slate-50 text-slate-700",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/admin/employees")}
              className="mt-1"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold text-xl">
                  {employee.firstName?.[0]?.toUpperCase()}
                  {employee.lastName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    {employee.firstName} {employee.lastName}
                  </h1>
                  <p className="text-slate-600 mt-1">{employee.position || "No position set"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className={`capitalize text-xs font-medium ${roleColors[(employee as any)?.role || "employee"] || ""}`}
                    >
                      {(employee as any)?.role || "Employee"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`capitalize text-xs ${statusColors[employee.status] || ""}`}
                    >
                      {employee.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                <MoreVertical size={18} className="text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => setLocation(`/admin/employees/${employeeId}/edit`)}
                className="cursor-pointer"
              >
                <Edit size={14} className="mr-2" />
                Edit Employee
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocation(`/admin/employees/${employeeId}/change-role`)}
                className="cursor-pointer"
              >
                <Shield size={14} className="mr-2" />
                Change Role
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocation(`/admin/employees/${employeeId}/assign-manager`)}
                className="cursor-pointer"
              >
                <Users2 size={14} className="mr-2" />
                Assign Manager
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => toast.info("Deactivate feature coming soon")}
                className="cursor-pointer"
              >
                <Power size={14} className="mr-2" />
                Deactivate
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                <Trash2 size={14} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1 bg-slate-100 p-1 rounded-lg">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="job" className="text-xs sm:text-sm">
              Job Info
            </TabsTrigger>
            <TabsTrigger value="compensation" className="text-xs sm:text-sm">
              Compensation
            </TabsTrigger>
            <TabsTrigger value="payroll" className="text-xs sm:text-sm">
              Payroll
            </TabsTrigger>
            <TabsTrigger value="timeoff" className="text-xs sm:text-sm">
              Time Off
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs sm:text-sm">
              Performance
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs sm:text-sm">
              Documents
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs sm:text-sm">
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="font-medium text-slate-900">{employee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="font-medium text-slate-900">{employee.phone || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Location</p>
                      <p className="font-medium text-slate-900">
                        {employee.city && employee.country
                          ? `${employee.city}, ${employee.country}`
                          : employee.country || "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500">Name</p>
                    <p className="font-medium text-slate-900">—</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Relationship</p>
                    <p className="font-medium text-slate-900">—</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="font-medium text-slate-900">—</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Job Info Tab */}
          <TabsContent value="job" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600">Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Briefcase size={16} className="text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Job Title</p>
                      <p className="font-medium text-slate-900">{employee.position || "—"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Department</p>
                    <p className="font-medium text-slate-900">{employee.department || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Reports To</p>
                    <p className="font-medium text-slate-900">{(employee as any)?.managerName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Employment Type</p>
                    <p className="font-medium text-slate-900 capitalize">
                      {employee.employmentType?.replace("_", " ") || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Start Date</p>
                    <p className="font-medium text-slate-900">—</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compensation Tab */}
          <TabsContent value="compensation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600">Compensation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <DollarSign size={16} className="text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Base Salary</p>
                      <p className="font-medium text-slate-900">
                        {employee.salary ? `${employee.currency} ${employee.salary}` : "—"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Bonus</p>
                    <p className="font-medium text-slate-900">—</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Equity</p>
                    <p className="font-medium text-slate-900">—</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600">Payroll Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500">Bank Details</p>
                  <p className="font-medium text-slate-900">—</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tax Information</p>
                  <p className="font-medium text-slate-900">—</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Payroll Status</p>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Time Off Tab */}
          <TabsContent value="timeoff" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600">Time Off & Leave</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">PTO Balance</p>
                    <p className="font-medium text-slate-900 text-lg">20 days</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Used This Year</p>
                    <p className="font-medium text-slate-900 text-lg">5 days</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Pending Requests</p>
                    <p className="font-medium text-slate-900 text-lg">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600">Performance & Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500">Active Goals</p>
                  <p className="font-medium text-slate-900">0 goals</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Recent Reviews</p>
                  <p className="font-medium text-slate-900">No reviews yet</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Feedback Received</p>
                  <p className="font-medium text-slate-900">0 feedback items</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600">Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500">Employment Contract</p>
                  <p className="font-medium text-slate-900">—</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">ID Documents</p>
                  <p className="font-medium text-slate-900">—</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Uploaded Files</p>
                  <p className="font-medium text-slate-900">0 files</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600">Activity Log</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8 text-slate-500">
                  <Clock size={32} className="mx-auto mb-2 text-slate-300" />
                  <p>No activity recorded yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
