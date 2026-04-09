import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import OrgChart from "@/components/OrgChart";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, GitBranch } from "lucide-react";

export default function AdminOrgChartPage() {
  const [, setLocation] = useLocation();
  const { data: employees = [], isLoading } = trpc.employee.list.useQuery();
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // Get unique departments
  const departments = useMemo(
    () => Array.from(new Set(employees.map((e: any) => e.department).filter(Boolean))).sort(),
    [employees]
  );

  // Filter employees — when filtering, we need to keep the full hierarchy chain
  const filteredEmployees = useMemo(() => {
    if (search === "" && departmentFilter === "all") return employees;

    // Find matching employees
    const matchingIds = new Set<number>();
    employees.forEach((e: any) => {
      const matchesSearch =
        search === "" ||
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        e.position?.toLowerCase().includes(search.toLowerCase()) ||
        e.email?.toLowerCase().includes(search.toLowerCase());

      const matchesDept = departmentFilter === "all" || e.department === departmentFilter;

      if (matchesSearch && matchesDept) {
        matchingIds.add(e.id);
      }
    });

    // Also include all ancestors of matching employees to keep tree structure
    const includedIds = new Set(matchingIds);
    const addAncestors = (empId: number) => {
      const emp = employees.find((e: any) => e.id === empId);
      if (emp && (emp as any).managerId) {
        includedIds.add((emp as any).managerId);
        addAncestors((emp as any).managerId);
      }
    };
    matchingIds.forEach((id) => addAncestors(id));

    return employees.filter((e: any) => includedIds.has(e.id));
  }, [employees, search, departmentFilter]);

  const handleEmployeeClick = (employee: any) => {
    setLocation(`/admin/employees/${employee.id}`);
  };

  // Stats
  const totalEmployees = employees.length;
  const managersCount = useMemo(() => {
    const managerIds = new Set(employees.map((e: any) => e.managerId).filter(Boolean));
    return managerIds.size;
  }, [employees]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <GitBranch size={24} className="text-teal-600" />
              Org Chart
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {totalEmployees} employees across {departments.length} departments
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <Input
              placeholder="Search by name, title, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Org Chart */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6 min-h-[500px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
            </div>
          ) : (
            <OrgChart
              employees={filteredEmployees}
              onEmployeeClick={handleEmployeeClick}
              companyName="SANI"
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
