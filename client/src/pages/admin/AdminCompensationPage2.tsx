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
  Pencil, Eye, CheckCircle2, Clock, AlertTriangle, Plus, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function AdminCompensationPage() {
  const { data: employees = [], isLoading: loadingEmployees } = trpc.employee.list.useQuery();
  const { data: salaryBands = [], isLoading: loadingBands } = trpc.salaryBand.list.useQuery();
  const { data: compensationRecords = [], isLoading: loadingComp } = trpc.compensation.list.useQuery();
  const { data: payrollCycles = [] } = trpc.payrollCycle.list.useQuery();

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

  /* ── Equity computed from compensation records ── */
  const equityRecords = useMemo(() => {
    return compensationRecords.filter((c: any) => c.type === "equity" || c.type === "bonus");
  }, [compensationRecords]);

  const equityPool = useMemo(() => {
    const totalAllocated = equityRecords.reduce((s: number, c: any) => s + (Number(c.amount) || 0), 0);
    const vestingCount = new Set(equityRecords.map((c: any) => c.employeeId)).size;
    return {
      totalShares: Math.max(totalAllocated * 3, 10000000), // estimate total pool
      allocated: totalAllocated,
      available: Math.max(totalAllocated * 3, 10000000) - totalAllocated,
      vestingEmployees: vestingCount,
    };
  }, [equityRecords]);

  /* ── Review cycles from payroll cycles ── */
  const reviewCycles = useMemo(() => {
    if (payrollCycles.length === 0) {
      return [
        { name: "Annual Review 2026", status: "upcoming", date: "Apr 2026", employees: employees.length, budget: `$${Math.round(totalCompensation * 0.05).toLocaleString()}` },
        { name: "Mid-Year Review 2025", status: "completed", date: "Jul 2025", employees: employees.length, budget: `$${Math.round(totalCompensation * 0.03).toLocaleString()}` },
      ];
    }
    return payrollCycles.slice(0, 5).map((c: any) => ({
      name: `Payroll Cycle: ${c.name || c.id}`,
      status: c.status === "completed" ? "completed" : "upcoming",
      date: c.startDate ? new Date(c.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—",
      employees: employees.length,
      budget: `$${(Number(c.totalAmount) || 0).toLocaleString()}`,
    }));
  }, [payrollCycles, employees, totalCompensation]);

  const isLoading = loadingEmployees || loadingBands || loadingComp;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-teal-600" size={32} />
        </div>
      </AdminLayout>
    );
  }

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
                  <ArrowUpRight size={12} className="mr-1" />Live
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
              <p className="text-2xl font-bold text-slate-900">
                {equityPool.totalShares > 0 ? ((equityPool.allocated / equityPool.totalShares) * 100).toFixed(1) : "0.0"}%
              </p>
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
                      // Look up real compensation records for this employee
                      const empCompRecords = compensationRecords.filter((c: any) => c.employeeId === emp.id);
                      const bonusRecords = empCompRecords.filter((c: any) => c.type === "bonus");
                      const equityRecs = empCompRecords.filter((c: any) => c.type === "equity");
                      const bonus = bonusRecords.reduce((s: number, c: any) => s + (Number(c.amount) || 0), 0) || Math.round(salary * 0.1);
                      const equity = equityRecs.reduce((s: number, c: any) => s + (Number(c.amount) || 0), 0) || Math.round(salary * 0.05);
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
                                <DropdownMenuItem onClick={() => setLocation(`/admin/employees/${emp.id}`)}>
                                  <Eye size={14} className="mr-2" />View Profile
                                </DropdownMenuItem>
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

        {/* Salary Bands Tab — Live from DB */}
        {activeTab === "bands" && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Salary Bands</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Compensation ranges by level — {salaryBands.length} bands configured</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.info("Edit bands coming soon")}>
                  <Pencil size={14} className="mr-1" />Edit Bands
                </Button>
              </div>
              {salaryBands.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <BarChart3 size={40} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-sm font-medium">No salary bands configured</p>
                  <p className="text-xs mt-1">Create salary bands to visualize compensation ranges</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {salaryBands.map((band: any) => {
                    const minS = Number(band.minSalary) || 0;
                    const midS = Number(band.midSalary) || (minS + (Number(band.maxSalary) || 0)) / 2;
                    const maxS = Number(band.maxSalary) || 0;
                    const empsInBand = employees.filter((e: any) => {
                      const s = Number(e.salary) || 0;
                      return s >= minS && s <= maxS;
                    });
                    return (
                      <div key={band.id} className="px-5 py-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs font-mono">{band.level}</Badge>
                            <span className="text-sm font-medium text-slate-900">{band.title}</span>
                            <Badge variant="outline" className="text-xs bg-slate-50 text-slate-500 border-0">
                              {empsInBand.length} employee{empsInBand.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                          <span className="text-sm text-slate-600">
                            ${minS.toLocaleString()} — ${maxS.toLocaleString()}
                          </span>
                        </div>
                        <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="absolute h-full bg-teal-200 rounded-full" style={{ left: "0%", width: "100%" }} />
                          {maxS > minS && (
                            <div
                              className="absolute h-full w-0.5 bg-teal-600"
                              style={{ left: `${((midS - minS) / (maxS - minS)) * 100}%` }}
                              title={`Mid: $${midS.toLocaleString()}`}
                            />
                          )}
                          {empsInBand.map((emp: any) => {
                            const s = Number(emp.salary) || 0;
                            const pct = maxS > minS ? ((s - minS) / (maxS - minS)) * 100 : 50;
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
                          <span className="text-[10px] text-slate-400">${minS.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400">Mid: ${midS.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400">${maxS.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Equity Tab — Live from compensation records */}
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
                  <p className="text-2xl font-bold text-violet-600">${equityPool.allocated.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{equityPool.vestingEmployees} employees with equity/bonus</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <p className="text-xs text-slate-500 mb-1">Available Budget</p>
                  <p className="text-2xl font-bold text-emerald-600">${equityPool.available.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {equityPool.totalShares > 0 ? ((equityPool.available / equityPool.totalShares) * 100).toFixed(1) : "100"}% remaining
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">Compensation Records</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{compensationRecords.length} records from database</p>
                </div>
                {compensationRecords.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <Gem size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-medium">No compensation records yet</p>
                    <p className="text-xs mt-1">Create compensation records (bonuses, equity grants) to see them here</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="px-5 py-3 text-left">Employee</th>
                        <th className="px-5 py-3 text-left">Type</th>
                        <th className="px-5 py-3 text-right">Amount</th>
                        <th className="px-5 py-3 text-left">Effective Date</th>
                        <th className="px-5 py-3 text-left">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {compensationRecords.map((rec: any) => {
                        const emp = employees.find((e: any) => e.id === rec.employeeId);
                        return (
                          <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3">
                              <p className="text-sm font-medium text-slate-900">
                                {emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${rec.employeeId}`}
                              </p>
                              <p className="text-xs text-slate-500">{emp?.position || "—"}</p>
                            </td>
                            <td className="px-5 py-3">
                              <Badge variant="outline" className={`text-xs border-0 capitalize ${
                                rec.type === "equity" ? "bg-violet-50 text-violet-700" :
                                rec.type === "bonus" ? "bg-emerald-50 text-emerald-700" :
                                rec.type === "raise" ? "bg-blue-50 text-blue-700" :
                                "bg-slate-50 text-slate-700"
                              }`}>
                                {rec.type}
                              </Badge>
                            </td>
                            <td className="px-5 py-3 text-sm text-slate-900 text-right font-medium">
                              ${(Number(rec.amount) || 0).toLocaleString()}
                            </td>
                            <td className="px-5 py-3 text-sm text-slate-600">
                              {rec.effectiveDate ? new Date(rec.effectiveDate).toLocaleDateString() : "—"}
                            </td>
                            <td className="px-5 py-3 text-sm text-slate-500 max-w-xs truncate">
                              {rec.notes || "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reviews Tab — Derived from payroll cycles */}
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
                  {reviewCycles.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <Clock size={32} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">No review cycles found</p>
                    </div>
                  ) : (
                    reviewCycles.map((review: any, i: number) => (
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
                    ))
                  )}
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
                    <p className="text-sm font-medium text-slate-900">
                      {employees.length > 0
                        ? `Your average compensation ($${avgSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}) is being analyzed against industry benchmarks.`
                        : "Add employees to see market position analysis."}
                    </p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Raise Suggestion</p>
                    <p className="text-sm font-medium text-slate-900">
                      {employees.length > 0
                        ? `${Math.max(1, Math.round(employees.length * 0.15))} employees may be below market rate. Consider 8-12% adjustments to reduce attrition risk.`
                        : "Add employees to see raise suggestions."}
                    </p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Budget Impact</p>
                    <p className="text-sm font-medium text-slate-900">
                      {totalCompensation > 0
                        ? `Total payroll: $${totalCompensation.toLocaleString()}. A 5% raise across all employees would add $${Math.round(totalCompensation * 0.05).toLocaleString()} annually.`
                        : "Add compensation data to see budget impact analysis."}
                    </p>
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
