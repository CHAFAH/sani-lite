import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
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
  DollarSign, TrendingUp, Users, BarChart3, Search, MoreVertical,
  ArrowUpRight, ArrowDownRight, Award, Gem, Target, Bell,
  Pencil, Eye, CheckCircle2, Clock, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

/* ── Salary bands ── */
const SALARY_BANDS = [
  { level: "IC1", title: "Junior", minSalary: 45000, midSalary: 55000, maxSalary: 65000 },
  { level: "IC2", title: "Mid-Level", minSalary: 65000, midSalary: 80000, maxSalary: 95000 },
  { level: "IC3", title: "Senior", minSalary: 90000, midSalary: 110000, maxSalary: 130000 },
  { level: "IC4", title: "Staff", minSalary: 120000, midSalary: 145000, maxSalary: 170000 },
  { level: "IC5", title: "Principal", minSalary: 150000, midSalary: 180000, maxSalary: 210000 },
  { level: "M1", title: "Manager", minSalary: 100000, midSalary: 125000, maxSalary: 150000 },
  { level: "M2", title: "Senior Manager", minSalary: 130000, midSalary: 160000, maxSalary: 190000 },
  { level: "D1", title: "Director", minSalary: 160000, midSalary: 200000, maxSalary: 240000 },
  { level: "VP", title: "VP", minSalary: 200000, midSalary: 260000, maxSalary: 320000 },
];

export default function AdminCompensationPage() {
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"overview" | "bands" | "equity" | "reviews">("overview");

  const departments = useMemo(() => {
    const set = new Set(employees.map((e: any) => e.department).filter(Boolean));
    return Array.from(set) as string[];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((e: any) => {
      const matchSearch = !searchQuery ||
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = departmentFilter === "all" || e.department === departmentFilter;
      return matchSearch && matchDept;
    });
  }, [employees, searchQuery, departmentFilter]);

  const totalCompensation = employees.reduce((s: number, e: any) => s + (Number(e.salary) || 0), 0);
  const avgSalary = employees.length > 0 ? totalCompensation / employees.length : 0;
  const medianSalary = useMemo(() => {
    const salaries = employees.map((e: any) => Number(e.salary) || 0).sort((a: number, b: number) => a - b);
    if (salaries.length === 0) return 0;
    const mid = Math.floor(salaries.length / 2);
    return salaries.length % 2 ? salaries[mid] : (salaries[mid - 1] + salaries[mid]) / 2;
  }, [employees]);

  // Mock equity data
  const equityPool = { totalShares: 10000000, allocated: 3500000, available: 6500000, vestingEmployees: 25 };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Compensation</h1>
            <p className="text-sm text-slate-500 mt-1">Salary, equity, and compensation planning</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info("Compensation review coming soon")}>
              <Target size={16} className="mr-2" />Start Review Cycle
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => toast.info("Scenario modeling coming soon")}>
              <BarChart3 size={16} className="mr-2" />Scenario Model
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                  <DollarSign size={20} className="text-teal-600" />
                </div>
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-0">
                  <ArrowUpRight size={12} className="mr-1" />+5.8%
                </Badge>
              </div>
              <p className="text-2xl font-bold text-slate-900">${totalCompensation.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Total Annual Compensation</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-2">
                <BarChart3 size={20} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">${avgSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-slate-500 mt-1">Average Salary</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-2">
                <TrendingUp size={20} className="text-violet-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">${medianSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-slate-500 mt-1">Median Salary</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-2">
                <Gem size={20} className="text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{((equityPool.allocated / equityPool.totalShares) * 100).toFixed(1)}%</p>
              <p className="text-xs text-slate-500 mt-1">Equity Pool Used</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
          {(["overview", "bands", "equity", "reviews"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "overview" ? "Overview" : tab === "bands" ? "Salary Bands" : tab === "equity" ? "Equity" : "Reviews"}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            <div className="flex gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Search employees..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9" />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-44 h-9">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-5 py-3 text-left">Employee</th>
                      <th className="px-5 py-3 text-left">Department</th>
                      <th className="px-5 py-3 text-left">Position</th>
                      <th className="px-5 py-3 text-right">Base Salary</th>
                      <th className="px-5 py-3 text-right">Bonus</th>
                      <th className="px-5 py-3 text-right">Equity</th>
                      <th className="px-5 py-3 text-right">Total Comp</th>
                      <th className="px-5 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.map((emp: any) => {
                      const salary = Number(emp.salary) || 0;
                      const bonus = Math.round(salary * 0.1);
                      const equity = Math.round(salary * 0.05);
                      const total = salary + bonus + equity;
                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setLocation(`/admin/employees/${emp.id}`)}>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold">
                                {emp.firstName?.[0]}{emp.lastName?.[0]}
                              </div>
                              <p className="text-sm font-medium text-slate-900">{emp.firstName} {emp.lastName}</p>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-sm text-slate-600">{emp.department || "—"}</td>
                          <td className="px-5 py-3 text-sm text-slate-600">{emp.position || "—"}</td>
                          <td className="px-5 py-3 text-sm text-slate-900 text-right font-medium">${salary.toLocaleString()}</td>
                          <td className="px-5 py-3 text-sm text-emerald-600 text-right">${bonus.toLocaleString()}</td>
                          <td className="px-5 py-3 text-sm text-violet-600 text-right">${equity.toLocaleString()}</td>
                          <td className="px-5 py-3 text-sm text-slate-900 text-right font-bold">${total.toLocaleString()}</td>
                          <td className="px-5 py-3 text-center" onClick={e => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <MoreVertical size={14} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toast.info("Adjust salary coming soon")}>
                                  <DollarSign size={14} className="mr-2" />Adjust Salary
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast.info("Approve bonus coming soon")}>
                                  <Award size={14} className="mr-2" />Approve Bonus
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast.info("Assign equity coming soon")}>
                                  <Gem size={14} className="mr-2" />Assign Equity
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => toast.info("Notification coming soon")}>
                                  <Bell size={14} className="mr-2" />Send Notification
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredEmployees.length === 0 && (
                  <div className="py-12 text-center text-slate-400">
                    <DollarSign size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm">No employees found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Salary Bands Tab */}
        {activeTab === "bands" && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Salary Bands</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Compensation ranges by level</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.info("Edit bands coming soon")}>
                  <Pencil size={14} className="mr-1" />Edit Bands
                </Button>
              </div>
              <div className="divide-y divide-slate-100">
                {SALARY_BANDS.map(band => {
                  const empsInBand = employees.filter((e: any) => {
                    const s = Number(e.salary) || 0;
                    return s >= band.minSalary && s <= band.maxSalary;
                  });
                  return (
                    <div key={band.level} className="px-5 py-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs font-mono">{band.level}</Badge>
                          <span className="text-sm font-medium text-slate-900">{band.title}</span>
                          <Badge variant="outline" className="text-xs bg-slate-50 text-slate-500 border-0">
                            {empsInBand.length} employees
                          </Badge>
                        </div>
                        <span className="text-sm text-slate-600">
                          ${band.minSalary.toLocaleString()} — ${band.maxSalary.toLocaleString()}
                        </span>
                      </div>
                      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-teal-200 rounded-full"
                          style={{
                            left: "0%",
                            width: "100%",
                          }}
                        />
                        <div
                          className="absolute h-full w-0.5 bg-teal-600"
                          style={{ left: "50%" }}
                          title={`Mid: $${band.midSalary.toLocaleString()}`}
                        />
                        {empsInBand.map((emp: any) => {
                          const s = Number(emp.salary) || 0;
                          const pct = ((s - band.minSalary) / (band.maxSalary - band.minSalary)) * 100;
                          return (
                            <div
                              key={emp.id}
                              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 border border-white"
                              style={{ left: `${Math.min(Math.max(pct, 2), 98)}%` }}
                              title={`${emp.firstName} ${emp.lastName}: $${s.toLocaleString()}`}
                            />
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-slate-400">${band.minSalary.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400">Mid: ${band.midSalary.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400">${band.maxSalary.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Equity Tab */}
        {activeTab === "equity" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <p className="text-xs text-slate-500 mb-1">Total Pool</p>
                  <p className="text-2xl font-bold text-slate-900">{(equityPool.totalShares / 1000000).toFixed(1)}M shares</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <p className="text-xs text-slate-500 mb-1">Allocated</p>
                  <p className="text-2xl font-bold text-violet-600">{(equityPool.allocated / 1000000).toFixed(1)}M shares</p>
                  <p className="text-xs text-slate-400 mt-0.5">{equityPool.vestingEmployees} employees vesting</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <p className="text-xs text-slate-500 mb-1">Available</p>
                  <p className="text-2xl font-bold text-emerald-600">{(equityPool.available / 1000000).toFixed(1)}M shares</p>
                  <p className="text-xs text-slate-400 mt-0.5">{((equityPool.available / equityPool.totalShares) * 100).toFixed(1)}% remaining</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">Equity Grants</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-5 py-3 text-left">Employee</th>
                      <th className="px-5 py-3 text-right">Shares</th>
                      <th className="px-5 py-3 text-right">Vested</th>
                      <th className="px-5 py-3 text-left">Vesting Schedule</th>
                      <th className="px-5 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employees.slice(0, 8).map((emp: any, i: number) => {
                      const shares = [50000, 30000, 25000, 20000, 15000, 10000, 8000, 5000][i] || 5000;
                      const vestedPct = [75, 50, 25, 100, 50, 25, 0, 0][i] || 0;
                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3">
                            <p className="text-sm font-medium text-slate-900">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-slate-500">{emp.position || "—"}</p>
                          </td>
                          <td className="px-5 py-3 text-sm text-slate-900 text-right font-medium">{shares.toLocaleString()}</td>
                          <td className="px-5 py-3 text-sm text-right">
                            <span className={vestedPct === 100 ? "text-emerald-600 font-medium" : "text-slate-600"}>
                              {vestedPct}%
                            </span>
                          </td>
                          <td className="px-5 py-3 text-sm text-slate-600">4-year, 1-year cliff</td>
                          <td className="px-5 py-3">
                            <Badge variant="outline" className={`text-xs border-0 ${
                              vestedPct === 100 ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                            }`}>
                              {vestedPct === 100 ? "Fully Vested" : "Vesting"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">Compensation Review Cycles</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Annual and mid-year review workflows</p>
                  </div>
                  <Button className="bg-teal-600 hover:bg-teal-700" size="sm" onClick={() => toast.info("Create review coming soon")}>
                    <Target size={14} className="mr-2" />New Review
                  </Button>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Annual Review 2026", status: "upcoming", date: "Apr 2026", employees: employees.length, budget: "$150,000" },
                    { name: "Mid-Year Review 2025", status: "completed", date: "Jul 2025", employees: employees.length, budget: "$80,000" },
                    { name: "Annual Review 2025", status: "completed", date: "Jan 2025", employees: employees.length, budget: "$120,000" },
                  ].map((review, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => toast.info("Review details coming soon")}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          review.status === "upcoming" ? "bg-amber-100" : "bg-emerald-100"
                        }`}>
                          {review.status === "upcoming" ? <Clock size={16} className="text-amber-600" /> : <CheckCircle2 size={16} className="text-emerald-600" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{review.name}</p>
                          <p className="text-xs text-slate-500">{review.date} · {review.employees} employees</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-700">Budget: {review.budget}</span>
                        <Badge variant="outline" className={`text-xs border-0 capitalize ${
                          review.status === "upcoming" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                        }`}>
                          {review.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Benchmarking */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-amber-50 to-orange-50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <TrendingUp size={16} className="text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">AI Compensation Benchmarking</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/80 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Market Position</p>
                    <p className="text-sm font-medium text-slate-900">Your average compensation is at the 62nd percentile compared to industry benchmarks.</p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Raise Suggestion</p>
                    <p className="text-sm font-medium text-slate-900">3 senior engineers are below market rate. Consider 8-12% adjustments to reduce attrition risk.</p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Promotion Impact</p>
                    <p className="text-sm font-medium text-slate-900">Promoting 2 pending candidates would increase monthly payroll by $4,200 (1.8%).</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
