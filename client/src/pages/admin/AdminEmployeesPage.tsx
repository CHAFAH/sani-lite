import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Eye, Edit, Shield, Users2, Power, Trash2, ChevronLeft, ChevronRight, Settings2, Filter } from "lucide-react";
import { toast } from "sonner";

export default function AdminEmployeesPage() {
  const [, setLocation] = useLocation();
  const { data: employees = [], isLoading } = trpc.employee.list.useQuery();
  const utils = trpc.useUtils();
  const deleteMut = trpc.employee.delete.useMutation({
    onSuccess: () => { utils.employee.list.invalidate(); toast.success("Employee removed"); },
  });

  const [search, setSearch] = useState("");
  const [deptFilters, setDeptFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  // Build manager lookup map
  const managerMap = useMemo(() => {
    const map = new Map<number, string>();
    employees.forEach((e: any) => map.set(e.id, `${e.firstName} ${e.lastName}`));
    return map;
  }, [employees]);

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e: any) => e.department).filter(Boolean))).sort(),
    [employees]
  );

  const filtered = useMemo(() => {
    return employees.filter((e: any) => {
      const matchSearch = !search || `${e.firstName} ${e.lastName} ${e.email} ${e.department} ${e.position}`.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilters.length === 0 || deptFilters.includes(e.department);
      const matchStatus = statusFilters.length === 0 || statusFilters.includes(e.status);
      return matchSearch && matchDept && matchStatus;
    });
  }, [employees, search, deptFilters, statusFilters]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginatedEmployees = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  // Reset page when filters change
  useMemo(() => { setPage(1); }, [search, deptFilters, statusFilters, perPage]);

  const statusColors: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    inactive: "bg-slate-50 text-slate-600 border-slate-200",
    invited: "bg-blue-50 text-blue-700 border-blue-200",
    on_leave: "bg-amber-50 text-amber-700 border-amber-200",
    offboarded: "bg-gray-50 text-gray-600 border-gray-200",
  };

  const handleDelete = (empId: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMut.mutate({ id: empId });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Showing {paginatedEmployees.length} of {filtered.length} employees
              {filtered.length !== employees.length && ` (${employees.length} total)`}
            </p>
          </div>
          <Button onClick={() => setLocation("/admin/employees/new")} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
            <Plus size={16} /> Add Employee
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search name, email, department..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 px-3 gap-1.5">
                <Filter size={14} />
                <span className="hidden sm:inline text-sm">Filters</span>
                {(deptFilters.length > 0 || statusFilters.length > 0) && (
                  <span className="min-w-[18px] h-[18px] rounded-full bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {deptFilters.length + statusFilters.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</label>
                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                  {departments.map((d: any) => (
                    <label key={d} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={deptFilters.includes(d)}
                        onChange={(e) => {
                          if (e.target.checked) setDeptFilters(prev => [...prev, d]);
                          else setDeptFilters(prev => prev.filter(x => x !== d));
                        }}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm text-slate-700">{d}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                <div className="mt-2 space-y-1">
                  {["active", "inactive", "on_leave", "offboarded"].map((s) => (
                    <label key={s} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={statusFilters.includes(s)}
                        onChange={(e) => {
                          if (e.target.checked) setStatusFilters(prev => [...prev, s]);
                          else setStatusFilters(prev => prev.filter(x => x !== s));
                        }}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm text-slate-700 capitalize">{s.replace("_", " ")}</span>
                    </label>
                  ))}
                </div>
              </div>
              {(deptFilters.length > 0 || statusFilters.length > 0) && (
                <Button variant="ghost" size="sm" className="w-full text-xs text-slate-500" onClick={() => { setDeptFilters([]); setStatusFilters([]); }}>
                  Clear All Filters
                </Button>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Employee</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Job Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Department</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Manager</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEmployees.map((emp: any) => (
                    <tr
                      key={emp.id}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => setLocation(`/admin/employees/${emp.id}`)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold text-xs">
                            {emp.firstName?.[0]}{emp.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-slate-400">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-sm">{emp.position || "—"}</td>
                      <td className="py-3 px-4 text-slate-600 text-sm">{emp.department || "—"}</td>
                      <td className="py-3 px-4">
                        {emp.managerId ? (
                          <button
                            className="text-sm text-teal-600 hover:underline font-medium"
                            onClick={(e) => { e.stopPropagation(); setLocation(`/admin/employees/${emp.managerId}`); }}
                          >
                            {managerMap.get(emp.managerId) || "—"}
                          </button>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={`text-xs capitalize ${statusColors[emp.status] || ""}`}>
                          {emp.status?.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <MoreVertical size={14} className="text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setLocation(`/admin/employees/${emp.id}`); }}>
                              <Eye size={14} className="mr-2" />View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setLocation(`/admin/employees/${emp.id}/edit`); }}>
                              <Edit size={14} className="mr-2" />Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(emp.id, `${emp.firstName} ${emp.lastName}`); }} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                              <Trash2 size={14} className="mr-2" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {paginatedEmployees.length === 0 && (
                    <tr><td colSpan={6} className="py-12 text-center text-slate-400">No employees found</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
              {/* Per page selector */}
              <div className="flex items-center gap-2">
                <Settings2 size={14} className="text-slate-400" />
                <span className="text-xs text-slate-500">Rows per page:</span>
                <Select value={String(perPage)} onValueChange={(v) => setPerPage(Number(v))}>
                  <SelectTrigger className="w-[65px] h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  Page {page} of {totalPages || 1}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
