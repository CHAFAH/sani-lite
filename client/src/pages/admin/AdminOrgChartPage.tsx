import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import OrgChart from "@/components/OrgChart";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, GitBranch, X, ExternalLink, Mail, Phone, Calendar, Building2, Users } from "lucide-react";

function formatTenure(startDate: string | null | undefined): string {
  if (!startDate) return "—";
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30.44);
  const remainingDays = Math.floor(days % 30.44);
  if (months === 0) return `${remainingDays} days`;
  return `${months} month${months > 1 ? "s" : ""} and ${remainingDays} day${remainingDays !== 1 ? "s" : ""}`;
}

function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB");
}

export default function AdminOrgChartPage() {
  const [, setLocation] = useLocation();
  const { data: employees = [], isLoading } = trpc.employee.list.useQuery();
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e: any) => e.department).filter(Boolean))).sort(),
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    if (search === "" && departmentFilter === "all") return employees;

    const matchingIds = new Set<number>();
    employees.forEach((e: any) => {
      const matchesSearch =
        search === "" ||
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        e.position?.toLowerCase().includes(search.toLowerCase()) ||
        e.email?.toLowerCase().includes(search.toLowerCase());
      const matchesDept = departmentFilter === "all" || e.department === departmentFilter;
      if (matchesSearch && matchesDept) matchingIds.add(e.id);
    });

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
    setSelectedEmployee(employee);
  };

  const manager = useMemo(() => {
    if (!selectedEmployee?.managerId) return null;
    return employees.find((e: any) => e.id === selectedEmployee.managerId);
  }, [selectedEmployee, employees]);

  const directReports = useMemo(() => {
    if (!selectedEmployee) return [];
    return employees.filter((e: any) => e.managerId === selectedEmployee.id);
  }, [selectedEmployee, employees]);

  const totalEmployees = employees.length;

  return (
    <AdminLayout>
      <div className="flex h-full gap-0">
        {/* Main chart area */}
        <div className={`flex-1 space-y-4 transition-all duration-300 ${selectedEmployee ? "pr-0" : ""}`}>
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
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chart */}
          <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4">
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

        {/* Right Side Panel */}
        {selectedEmployee && (
          <>
            {/* Mobile backdrop */}
            <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSelectedEmployee(null)} />
            <div className="fixed inset-y-0 right-0 w-[85vw] max-w-[320px] z-50 lg:relative lg:inset-auto lg:w-[320px] lg:z-auto flex-shrink-0 lg:ml-4 bg-white border-l lg:border border-slate-200 lg:rounded-2xl overflow-hidden shadow-lg animate-in slide-in-from-right-5 duration-200">
            {/* Panel pointer/header */}
            <div className="relative bg-gradient-to-br from-teal-600 to-teal-700 px-5 py-5 text-white">
              {/* Close button */}
              <button
                onClick={() => setSelectedEmployee(null)}
                className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X size={16} />
              </button>

              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold mb-3">
                {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
              </div>

              <h3 className="font-bold text-lg leading-tight">
                {selectedEmployee.firstName} {selectedEmployee.lastName}
              </h3>
              <p className="text-teal-100 text-sm mt-0.5">
                {selectedEmployee.position || "No title"}
              </p>
              <p className="text-teal-200 text-xs mt-1">
                {[selectedEmployee.department, selectedEmployee.city].filter(Boolean).join(", ")}
              </p>
            </div>

            {/* Info rows */}
            <div className="px-5 py-4 space-y-3 overflow-y-auto max-h-[calc(100vh-420px)]">
              <InfoRow label="Employee ID" value={String(selectedEmployee.id)} />
              <InfoRow label="Email" value={selectedEmployee.email || "—"} icon={<Mail size={12} />} />
              <InfoRow label="Job title" value={selectedEmployee.position || "—"} />
              <InfoRow label="Department" value={selectedEmployee.department || "—"} icon={<Building2 size={12} />} />
              <InfoRow label="Country" value={selectedEmployee.country || "—"} />
              <InfoRow label="City" value={selectedEmployee.city || "—"} />
              <InfoRow label="Start date" value={formatDate(selectedEmployee.startDate)} icon={<Calendar size={12} />} />
              <InfoRow label="Tenure" value={formatTenure(selectedEmployee.startDate)} />
              <InfoRow label="Employment type" value={selectedEmployee.employmentType?.replace("_", " ") || "—"} />
              <InfoRow label="Status" value={
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  selectedEmployee.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {selectedEmployee.status}
                </span>
              } />

              {/* Reports to */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Reports to</p>
                {manager ? (
                  <button
                    onClick={() => setSelectedEmployee(manager)}
                    className="flex items-center gap-2 text-sm text-teal-700 hover:text-teal-900 font-medium hover:underline"
                  >
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-[10px] font-bold text-teal-700">
                      {manager.firstName[0]}{manager.lastName[0]}
                    </div>
                    {manager.firstName} {manager.lastName}
                  </button>
                ) : (
                  <p className="text-sm text-slate-500">—</p>
                )}
                {manager && (
                  <p className="text-xs text-slate-400 ml-8">{manager.position}</p>
                )}
              </div>

              {/* Direct reports */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1 flex items-center gap-1">
                  <Users size={10} /> Direct reports
                </p>
                {directReports.length > 0 ? (
                  <div className="space-y-1">
                    {directReports.slice(0, 5).map((dr: any) => (
                      <button
                        key={dr.id}
                        onClick={() => setSelectedEmployee(dr)}
                        className="flex items-center gap-2 text-xs text-slate-700 hover:text-teal-700 w-full text-left"
                      >
                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-600">
                          {dr.firstName[0]}{dr.lastName[0]}
                        </div>
                        <span className="truncate">{dr.firstName} {dr.lastName}</span>
                      </button>
                    ))}
                    {directReports.length > 5 && (
                      <p className="text-xs text-slate-400 ml-7">+{directReports.length - 5} more</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">—</p>
                )}
              </div>
            </div>

            {/* View full profile button */}
            <div className="px-5 py-3 border-t border-slate-100">
              <button
                onClick={() => setLocation(`/admin/employees/${selectedEmployee.id}`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <ExternalLink size={14} />
                View Full Profile
              </button>
            </div>
          </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold min-w-[90px]">
        {icon}
        {label}
      </div>
      <div className="text-sm text-slate-800 text-right font-medium truncate max-w-[160px]">
        {value}
      </div>
    </div>
  );
}
