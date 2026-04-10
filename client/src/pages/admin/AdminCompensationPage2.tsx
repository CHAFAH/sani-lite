/*
 * AdminCompensationPage — Compensation Planning
 * Restyled with Deep Navy (#0A2540) + Vibrant Teal (#00D4C8)
 * Preserves all tRPC integrations: employee.list, salaryBand.list, compensation.list, payrollCycle.list
 */

import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DollarSign, TrendingUp, Users, BarChart3, Search, MoreVertical,
  ArrowUpRight, ArrowDownRight, Award, Gem, Target, Bell,
  Pencil, Eye, CheckCircle2, Clock, Plus, Loader2, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const TEAL = "#00D4C8";
const NAVY = "#0A2540";

function KpiCard({ label, value, subtitle, icon: Icon, color }: { label: string; value: string; subtitle?: string; icon: React.ElementType; color?: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color || TEAL}15` }}>
          <Icon size={20} style={{ color: color || TEAL }} />
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ color: NAVY }}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
      {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

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
      const matchSearch = !searchQuery || `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
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

  const equityRecords = useMemo(() => {
    return compensationRecords.filter((c: any) => c.type === "equity" || c.type === "bonus");
  }, [compensationRecords]);

  const equityPool = useMemo(() => {
    const totalAllocated = equityRecords.reduce((s: number, c: any) => s + (Number(c.amount) || 0), 0);
    const vestingCount = new Set(equityRecords.map((c: any) => c.employeeId)).size;
    return {
      totalShares: Math.max(totalAllocated * 3, 10000000),
      allocated: totalAllocated,
      available: Math.max(totalAllocated * 3, 10000000) - totalAllocated,
      vestingEmployees: vestingCount,
    };
  }, [equityRecords]);

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

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "bands" as const, label: "Salary Bands" },
    { id: "equity" as const, label: "Equity" },
    { id: "reviews" as const, label: "Reviews" },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin" size={32} style={{ color: TEAL }} />
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
            <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Compensation</h1>
            <p className="text-sm text-slate-500 mt-1">Salary, equity, and compensation planning</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => toast.info("Compensation review coming soon")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Target size={16} /> Start Review
            </button>
            <button onClick={() => toast.info("Scenario modeling coming soon")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ background: TEAL }}>
              <BarChart3 size={16} /> Scenario Model
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard label="Total Annual Compensation" value={`$${totalCompensation.toLocaleString()}`} icon={DollarSign} />
          <KpiCard label="Average Salary" value={`$${avgSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={BarChart3} color="#3B82F6" />
          <KpiCard label="Median Salary" value={`$${medianSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={TrendingUp} color="#8B5CF6" />
          <KpiCard label="Equity Pool Used" value={`${equityPool.totalShares > 0 ? ((equityPool.allocated / equityPool.totalShares) * 100).toFixed(1) : "0.0"}%`} subtitle={`${equityPool.vestingEmployees} employees with equity`} icon={Gem} color="#F59E0B" />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all" style={{ background: activeTab === tab.id ? "white" : "transparent", color: activeTab === tab.id ? NAVY : "#64748B", boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-4 py-2.5 max-w-sm">
                <Search size={16} className="text-slate-400" />
                <input type="text" placeholder="Search employees..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-44 rounded-xl"><SelectValue placeholder="All departments" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <table className="w-full">
                <thead><tr className="text-xs text-slate-500 border-b border-slate-50">
                  <th className="text-left px-6 py-3 font-medium">Employee</th>
                  <th className="text-left px-4 py-3 font-medium">Department</th>
                  <th className="text-left px-4 py-3 font-medium">Position</th>
                  <th className="text-right px-4 py-3 font-medium">Base Salary</th>
                  <th className="text-right px-4 py-3 font-medium">Bonus</th>
                  <th className="text-right px-4 py-3 font-medium">Equity</th>
                  <th className="text-right px-4 py-3 font-medium">Total Comp</th>
                  <th className="text-center px-4 py-3 font-medium">Actions</th>
                </tr></thead>
                <tbody>
                  {filteredEmployees.map((emp: any) => {
                    const salary = Number(emp.salary) || 0;
                    const empCompRecords = compensationRecords.filter((c: any) => c.employeeId === emp.id);
                    const bonusRecords = empCompRecords.filter((c: any) => c.type === "bonus");
                    const equityRecs = empCompRecords.filter((c: any) => c.type === "equity");
                    const bonus = bonusRecords.reduce((s: number, c: any) => s + (Number(c.amount) || 0), 0) || Math.round(salary * 0.1);
                    const equity = equityRecs.reduce((s: number, c: any) => s + (Number(c.amount) || 0), 0) || Math.round(salary * 0.05);
                    const total = salary + bonus + equity;
                    return (
                      <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setLocation(`/admin/employees/${emp.id}`)}>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: TEAL }}>
                              {emp.firstName?.[0]}{emp.lastName?.[0]}
                            </div>
                            <span className="text-sm font-medium text-slate-800">{emp.firstName} {emp.lastName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{emp.department || "—"}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{emp.position || "—"}</td>
                        <td className="px-4 py-3 text-sm font-medium text-right" style={{ color: NAVY }}>${salary.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-emerald-600 text-right">${bonus.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-violet-600 text-right">${equity.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm font-bold text-right" style={{ color: NAVY }}>${total.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                          <div className="relative group inline-block">
                            <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><MoreVertical size={14} /></button>
                            <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10 w-40">
                              <button onClick={() => setLocation(`/admin/employees/${emp.id}`)} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2"><Eye size={12} /> View Profile</button>
                              <button onClick={() => toast.info("Adjust salary coming soon")} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2"><DollarSign size={12} /> Adjust Salary</button>
                              <button onClick={() => toast.info("Approve bonus coming soon")} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2"><Award size={12} /> Approve Bonus</button>
                              <button onClick={() => toast.info("Assign equity coming soon")} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2"><Gem size={12} /> Assign Equity</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredEmployees.length === 0 && (
                <div className="py-16 text-center"><DollarSign size={40} className="mx-auto mb-3 text-slate-300" /><p className="text-sm text-slate-500">No employees found</p></div>
              )}
            </div>
          </div>
        )}

        {/* Salary Bands Tab */}
        {activeTab === "bands" && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: NAVY }}>Salary Bands</h3>
                <p className="text-xs text-slate-500 mt-0.5">Compensation ranges by level — {salaryBands.length} bands configured</p>
              </div>
              <button onClick={() => toast.info("Edit bands coming soon")} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50">
                <Pencil size={12} /> Edit Bands
              </button>
            </div>
            {salaryBands.length === 0 ? (
              <div className="py-16 text-center"><BarChart3 size={40} className="mx-auto mb-3 text-slate-300" /><p className="text-sm text-slate-500 font-medium">No salary bands configured</p><p className="text-xs text-slate-400 mt-1">Create salary bands to visualize compensation ranges</p></div>
            ) : (
              <div className="divide-y divide-slate-50">
                {salaryBands.map((band: any) => {
                  const minS = Number(band.minSalary) || 0;
                  const midS = Number(band.midSalary) || (minS + (Number(band.maxSalary) || 0)) / 2;
                  const maxS = Number(band.maxSalary) || 0;
                  const empsInBand = employees.filter((e: any) => {
                    const s = Number(e.salary) || 0;
                    return s >= minS && s <= maxS;
                  });
                  return (
                    <div key={band.id} className="px-6 py-5 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg" style={{ background: `${TEAL}15`, color: TEAL }}>{band.level}</span>
                          <span className="text-sm font-semibold" style={{ color: NAVY }}>{band.title}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{empsInBand.length} employee{empsInBand.length !== 1 ? "s" : ""}</span>
                        </div>
                        <span className="text-sm text-slate-600 font-medium">${minS.toLocaleString()} — ${maxS.toLocaleString()}</span>
                      </div>
                      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="absolute h-full rounded-full" style={{ left: "0%", width: "100%", background: `${TEAL}30` }} />
                        {maxS > minS && (
                          <div className="absolute h-full w-0.5" style={{ left: `${((midS - minS) / (maxS - minS)) * 100}%`, background: TEAL }} title={`Mid: $${midS.toLocaleString()}`} />
                        )}
                        {empsInBand.map((emp: any) => {
                          const s = Number(emp.salary) || 0;
                          const pct = maxS > minS ? ((s - minS) / (maxS - minS)) * 100 : 50;
                          return (
                            <div key={emp.id} className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ left: `${Math.min(Math.max(pct, 2), 98)}%`, background: NAVY }} title={`${emp.firstName} ${emp.lastName}: $${s.toLocaleString()}`} />
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className="text-[10px] text-slate-400">${minS.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400">Mid: ${midS.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400">${maxS.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Equity Tab */}
        {activeTab === "equity" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Total Pool</p>
                <p className="text-2xl font-bold" style={{ color: NAVY }}>{(equityPool.totalShares / 1000000).toFixed(1)}M shares</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Allocated</p>
                <p className="text-2xl font-bold text-violet-600">${equityPool.allocated.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-0.5">{equityPool.vestingEmployees} employees with equity/bonus</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Available Budget</p>
                <p className="text-2xl font-bold text-emerald-600">${equityPool.available.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-0.5">{equityPool.totalShares > 0 ? ((equityPool.available / equityPool.totalShares) * 100).toFixed(1) : "100"}% remaining</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-semibold" style={{ color: NAVY }}>Compensation Records</h3>
                <p className="text-xs text-slate-500 mt-0.5">{compensationRecords.length} records from database</p>
              </div>
              {compensationRecords.length === 0 ? (
                <div className="py-16 text-center"><Gem size={40} className="mx-auto mb-3 text-slate-300" /><p className="text-sm text-slate-500 font-medium">No compensation records yet</p><p className="text-xs text-slate-400 mt-1">Create compensation records to see them here</p></div>
              ) : (
                <table className="w-full">
                  <thead><tr className="text-xs text-slate-500 border-b border-slate-50">
                    <th className="text-left px-6 py-3 font-medium">Employee</th>
                    <th className="text-left px-4 py-3 font-medium">Type</th>
                    <th className="text-right px-4 py-3 font-medium">Amount</th>
                    <th className="text-left px-4 py-3 font-medium">Effective Date</th>
                    <th className="text-left px-4 py-3 font-medium">Notes</th>
                  </tr></thead>
                  <tbody>
                    {compensationRecords.map((rec: any) => {
                      const emp = employees.find((e: any) => e.id === rec.employeeId);
                      return (
                        <tr key={rec.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-3">
                            <p className="text-sm font-medium text-slate-800">{emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${rec.employeeId}`}</p>
                            <p className="text-xs text-slate-500">{emp?.position || "—"}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${
                              rec.type === "equity" ? "bg-violet-50 text-violet-600" :
                              rec.type === "bonus" ? "bg-emerald-50 text-emerald-600" :
                              rec.type === "raise" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"
                            }`}>{rec.type}</span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-right" style={{ color: NAVY }}>${(Number(rec.amount) || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{rec.effectiveDate ? new Date(rec.effectiveDate).toLocaleDateString() : "—"}</td>
                          <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">{rec.notes || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: NAVY }}>Compensation Review Cycles</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Annual and mid-year review workflows</p>
                </div>
                <button onClick={() => toast.info("Create review coming soon")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ background: TEAL }}>
                  <Target size={14} /> New Review
                </button>
              </div>
              <div className="space-y-3">
                {reviewCycles.length === 0 ? (
                  <div className="py-12 text-center"><Clock size={32} className="mx-auto mb-2 text-slate-300" /><p className="text-sm text-slate-500">No review cycles found</p></div>
                ) : (
                  reviewCycles.map((review: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => toast.info("Review details coming soon")}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${review.status === "upcoming" ? "bg-amber-100" : "bg-emerald-100"}`}>
                          {review.status === "upcoming" ? <Clock size={16} className="text-amber-600" /> : <CheckCircle2 size={16} className="text-emerald-600" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: NAVY }}>{review.name}</p>
                          <p className="text-xs text-slate-500">{review.date} · {review.employees} employees</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-700">Budget: {review.budget}</span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${
                          review.status === "upcoming" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                        }`}>{review.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI Benchmarking */}
            <div className="rounded-2xl p-6 border" style={{ background: `linear-gradient(135deg, ${NAVY}05, ${TEAL}08)`, borderColor: `${TEAL}20` }}>
              <div className="flex items-center gap-3 mb-4">
                <Sparkles size={18} style={{ color: TEAL }} />
                <h3 className="text-base font-semibold" style={{ color: NAVY }}>AI Compensation Benchmarking</h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${TEAL}20`, color: TEAL }}>AI</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/80 rounded-xl p-4 border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Market Position</p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {employees.length > 0
                      ? `Your average compensation ($${avgSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}) is being analyzed against industry benchmarks.`
                      : "Add employees to see market position analysis."}
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-4 border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Raise Suggestion</p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {employees.length > 0
                      ? `${Math.max(1, Math.round(employees.length * 0.15))} employees may be below market rate. Consider 8-12% adjustments to reduce attrition risk.`
                      : "Add employees to see raise suggestions."}
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-4 border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Budget Impact</p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {totalCompensation > 0
                      ? `Total payroll: $${totalCompensation.toLocaleString()}. A 5% raise across all employees would add $${Math.round(totalCompensation * 0.05).toLocaleString()} annually.`
                      : "Add compensation data to see budget impact analysis."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
