import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, Plus, Search, MoreVertical, Eye, Edit, Shield, Users2, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminEmployeesPage() {
  const [, setLocation] = useLocation();
  const { data: employees = [], isLoading } = trpc.employee.list.useQuery();
  const utils = trpc.useUtils();
  const deleteMut = trpc.employee.delete.useMutation({
    onSuccess: () => {
      utils.employee.list.invalidate();
      toast.success("Employee removed");
    },
  });

  // Filters
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get unique departments and roles
  const departments = useMemo(
    () => Array.from(new Set(employees.map((e: any) => e.department).filter(Boolean))),
    [employees]
  );

  const roles = useMemo(
    () => Array.from(new Set(employees.map((e: any) => e.role || "employee").filter(Boolean))),
    [employees]
  );

  // Filter employees
  const filtered = useMemo(() => {
    return employees.filter((e: any) => {
      const matchSearch =
        !search ||
        `${e.firstName} ${e.lastName} ${e.email}`.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === "all" || e.department === deptFilter;
      const matchRole = roleFilter === "all" || (e.role || "employee") === roleFilter;
      const matchStatus = statusFilter === "all" || e.status === statusFilter;
      return matchSearch && matchDept && matchRole && matchStatus;
    });
  }, [employees, search, deptFilter, roleFilter, statusFilter]);

  const statusColors: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    inactive: "bg-slate-50 text-slate-600 border-slate-200",
    invited: "bg-blue-50 text-blue-700 border-blue-200",
    suspended: "bg-red-50 text-red-600 border-red-200",
  };

  const roleColors: Record<string, string> = {
    admin: "bg-purple-50 text-purple-700",
    manager: "bg-blue-50 text-blue-700",
    employee: "bg-slate-50 text-slate-700",
  };

  const handleDelete = (empId: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMut.mutate({ id: empId });
    }
  };

  const handleViewProfile = (empId: number) => {
    setLocation(`/admin/employees/${empId}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Employees</h1>
            <p className="text-slate-500 mt-1">
              {filtered.length} of {employees.length} employees
            </p>
          </div>
          <Button
            onClick={() => setLocation("/admin/employees/new")}
            className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
          >
            <Plus size={16} />
            Add Employee
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, email, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d: any) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="invited">Invited</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Employees Table */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-4 px-5 font-semibold text-slate-700">Profile</th>
                    <th className="text-left py-4 px-5 font-semibold text-slate-700">Job Title</th>
                    <th className="text-left py-4 px-5 font-semibold text-slate-700">Department</th>
                    <th className="text-left py-4 px-5 font-semibold text-slate-700">Role</th>
                    <th className="text-left py-4 px-5 font-semibold text-slate-700">Manager</th>
                    <th className="text-left py-4 px-5 font-semibold text-slate-700">Status</th>
                    <th className="text-right py-4 px-5 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp: any) => (
                    <tr
                      key={emp.id}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => handleViewProfile(emp.id)}
                    >
                      {/* Profile Column */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                            {emp.firstName?.[0]?.toUpperCase()}
                            {emp.lastName?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-xs text-slate-500">{emp.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Job Title */}
                      <td className="py-4 px-5 text-slate-600">{emp.position || "—"}</td>

                      {/* Department */}
                      <td className="py-4 px-5 text-slate-600">{emp.department || "—"}</td>

                      {/* Role */}
                      <td className="py-4 px-5">
                        <Badge
                          variant="outline"
                          className={`capitalize text-xs font-medium ${roleColors[emp.role || "employee"] || ""}`}
                        >
                          {emp.role || "Employee"}
                        </Badge>
                      </td>

                      {/* Manager */}
                      <td className="py-4 px-5 text-slate-600 text-sm">
                        {emp.managerName ? (
                          <button
                            className="text-teal-600 hover:underline font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (emp.managerId) {
                                setLocation(`/admin/employees/${emp.managerId}`);
                              }
                            }}
                          >
                            {emp.managerName}
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize ${statusColors[emp.status] || ""}`}
                        >
                          {emp.status}
                        </Badge>
                      </td>

                      {/* Actions Menu */}
                      <td className="py-4 px-5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical size={16} className="text-slate-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProfile(emp.id);
                              }}
                              className="cursor-pointer"
                            >
                              <Eye size={14} className="mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setLocation(`/admin/employees/${emp.id}/edit`);
                              }}
                              className="cursor-pointer"
                            >
                              <Edit size={14} className="mr-2" />
                              Edit Employee
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setLocation(`/admin/employees/${emp.id}/change-role`);
                              }}
                              className="cursor-pointer"
                            >
                              <Shield size={14} className="mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setLocation(`/admin/employees/${emp.id}/assign-manager`);
                              }}
                              className="cursor-pointer"
                            >
                              <Users2 size={14} className="mr-2" />
                              Assign Manager
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Implement deactivate
                                toast.info("Deactivate feature coming soon");
                              }}
                              className="cursor-pointer"
                            >
                              <Power size={14} className="mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(emp.id, `${emp.firstName} ${emp.lastName}`);
                              }}
                              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <Trash2 size={14} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No employees found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
