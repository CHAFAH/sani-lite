/*
 * AdminBenefitsPage — Benefits Administration
 * Restyled with Deep Navy (#0A2540) + Vibrant Teal (#00D4C8)
 * Preserves all tRPC integrations: benefits.listPlans, benefits.listEnrollments, etc.
 */

import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Heart, Plus, Search, MoreVertical, Shield, Activity,
  DollarSign, Users, CheckCircle2, Clock, AlertCircle,
  Stethoscope, Umbrella, Dumbbell, Gift, Building2,
  TrendingUp, Eye, Pencil, Trash2, UserPlus, Loader2, X,
  ArrowUpRight, ArrowDownRight, Sparkles, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

const TEAL = "#00D4C8";
const NAVY = "#0A2540";

const PLAN_TYPES = [
  { value: "health", label: "Health Insurance", icon: Stethoscope, color: "bg-red-50 text-red-500" },
  { value: "dental", label: "Dental", icon: Activity, color: "bg-blue-50 text-blue-500" },
  { value: "vision", label: "Vision", icon: Eye, color: "bg-indigo-50 text-indigo-500" },
  { value: "life", label: "Life Insurance", icon: Shield, color: "bg-emerald-50 text-emerald-500" },
  { value: "retirement", label: "Pension/401k", icon: Building2, color: "bg-amber-50 text-amber-500" },
  { value: "wellness", label: "Wellness", icon: Dumbbell, color: "bg-teal-50 text-teal-500" },
  { value: "other", label: "Other / Perks", icon: Gift, color: "bg-violet-50 text-violet-500" },
];

function KpiCard({ label, value, change, changeType, icon: Icon }: { label: string; value: string; change: string; changeType: "up" | "down"; icon: React.ElementType }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${TEAL}15` }}>
          <Icon size={20} style={{ color: TEAL }} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${changeType === "up" ? "text-emerald-600" : "text-red-500"}`}>
          {changeType === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ color: NAVY }}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

export default function AdminBenefitsPage() {
  const { data: plans = [], isLoading: plansLoading } = trpc.benefits.listPlans.useQuery();
  const { data: enrollments = [] } = trpc.benefits.listEnrollments.useQuery();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const utils = trpc.useUtils();

  const createPlanMut = trpc.benefits.createPlan.useMutation({
    onSuccess: () => { utils.benefits.listPlans.invalidate(); toast.success("Benefit plan created"); setShowAddPlan(false); resetForm(); },
    onError: (e: any) => toast.error(e.message),
  });
  const deletePlanMut = trpc.benefits.deletePlan.useMutation({
    onSuccess: () => { utils.benefits.listPlans.invalidate(); toast.success("Plan deleted"); },
    onError: (e: any) => toast.error(e.message),
  });
  const enrollMut = trpc.benefits.enroll.useMutation({
    onSuccess: () => { utils.benefits.listEnrollments.invalidate(); toast.success("Employee enrolled"); setShowEnroll(false); },
    onError: (e: any) => toast.error(e.message),
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"plans" | "enrollment" | "analytics">("plans");
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [showEnroll, setShowEnroll] = useState(false);
  const [enrollPlanId, setEnrollPlanId] = useState<number | null>(null);
  const [enrollEmployeeId, setEnrollEmployeeId] = useState("");
  const [form, setForm] = useState({
    name: "", type: "health" as "health" | "dental" | "vision" | "life" | "retirement" | "wellness" | "other",
    description: "", provider: "", cost: "", employerContribution: "", eligibility: "",
  });

  const resetForm = () => setForm({ name: "", type: "health", description: "", provider: "", cost: "", employerContribution: "", eligibility: "" });

  const enrollmentCountByPlan = useMemo(() => {
    const map: Record<number, number> = {};
    enrollments.forEach((e: any) => { if (e.status === "enrolled") map[e.planId] = (map[e.planId] || 0) + 1; });
    return map;
  }, [enrollments]);

  const filteredPlans = useMemo(() => {
    return plans.filter((p: any) => {
      const matchSearch = !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === "all" || p.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [plans, searchQuery, typeFilter]);

  const activePlans = plans.filter((p: any) => p.isActive !== false);
  const totalMonthlyCost = activePlans.reduce((s: number, p: any) => {
    const cost = Number(p.cost) || 0;
    const enrolled = enrollmentCountByPlan[p.id] || 0;
    return s + cost * enrolled;
  }, 0);
  const totalEnrolled = Object.values(enrollmentCountByPlan).reduce((s, c) => s + c, 0);
  const avgEnrollmentRate = activePlans.length > 0 && employees.length > 0
    ? Math.round((totalEnrolled / (activePlans.length * employees.length)) * 100) : 0;

  const tabs = [
    { id: "plans" as const, label: "Benefit Plans" },
    { id: "enrollment" as const, label: "Enrollment" },
    { id: "analytics" as const, label: "Analytics" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Benefits Administration</h1>
            <p className="text-sm text-slate-500 mt-1">Global benefits management across all entities</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ background: TEAL }} onClick={() => setShowAddPlan(true)}>
            <Plus size={16} /> Add Plan
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard label="Active Plans" value={String(activePlans.length)} change="+2 this quarter" changeType="up" icon={Heart} />
          <KpiCard label="Monthly Benefits Cost" value={`$${totalMonthlyCost.toLocaleString()}`} change="4.2%" changeType="up" icon={DollarSign} />
          <KpiCard label="Avg Enrollment Rate" value={`${avgEnrollmentRate}%`} change="2.1%" changeType="up" icon={Users} />
          <KpiCard label="Total Enrollments" value={String(totalEnrolled)} change="+5 this month" changeType="up" icon={CheckCircle2} />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all" style={{ background: activeTab === tab.id ? "white" : "transparent", color: activeTab === tab.id ? NAVY : "#64748B", boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Add Plan Form */}
        <AnimatePresence>
          {showAddPlan && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-2xl border border-slate-100 p-6" style={{ borderLeft: `4px solid ${TEAL}` }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold" style={{ color: NAVY }}>Create Benefit Plan</h3>
                <button onClick={() => { setShowAddPlan(false); resetForm(); }} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Plan Name *</label>
                  <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Premium Health Plan" className="rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Type *</label>
                  <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as typeof p.type }))}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{PLAN_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Provider</label>
                  <Input value={form.provider} onChange={e => setForm(p => ({ ...p, provider: e.target.value }))} placeholder="e.g. Aetna" className="rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Monthly Cost ($)</label>
                  <Input type="number" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} placeholder="0.00" className="rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Employer Contribution (%)</label>
                  <Input type="number" value={form.employerContribution} onChange={e => setForm(p => ({ ...p, employerContribution: e.target.value }))} placeholder="80" className="rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Eligibility</label>
                  <Input value={form.eligibility} onChange={e => setForm(p => ({ ...p, eligibility: e.target.value }))} placeholder="e.g. Full-time employees" className="rounded-xl" />
                </div>
                <div className="col-span-3">
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Description</label>
                  <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of the plan" className="rounded-xl" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => { setShowAddPlan(false); resetForm(); }} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button disabled={createPlanMut.isPending || !form.name} onClick={() => createPlanMut.mutate(form)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50" style={{ background: TEAL }}>
                  {createPlanMut.isPending && <Loader2 size={14} className="animate-spin" />} Create Plan
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enroll Employee */}
        <AnimatePresence>
          {showEnroll && enrollPlanId && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-2xl border border-slate-100 p-6" style={{ borderLeft: "4px solid #3B82F6" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold" style={{ color: NAVY }}>Enroll Employee</h3>
                <button onClick={() => setShowEnroll(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Select Employee</label>
                  <Select value={enrollEmployeeId} onValueChange={setEnrollEmployeeId}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Choose employee..." /></SelectTrigger>
                    <SelectContent>{employees.map((e: any) => <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <button disabled={enrollMut.isPending || !enrollEmployeeId} onClick={() => enrollMut.mutate({ employeeId: Number(enrollEmployeeId), planId: enrollPlanId })} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50" style={{ background: "#3B82F6" }}>
                  {enrollMut.isPending && <Loader2 size={14} className="animate-spin" />} Enroll
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plans Tab */}
        {activeTab === "plans" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-4 py-2.5 max-w-sm">
                <Search size={16} className="text-slate-400" />
                <input type="text" placeholder="Search plans..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-44 rounded-xl"><SelectValue placeholder="All types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {PLAN_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {plansLoading ? (
              <div className="py-16 text-center"><Loader2 size={32} className="mx-auto mb-3 animate-spin" style={{ color: TEAL }} /><p className="text-sm text-slate-500">Loading benefit plans...</p></div>
            ) : filteredPlans.length === 0 ? (
              <div className="py-16 text-center">
                <Heart size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm text-slate-500">No benefit plans found</p>
                <button onClick={() => setShowAddPlan(true)} className="mt-3 text-sm font-medium hover:underline" style={{ color: TEAL }}>Create First Plan</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredPlans.map((plan: any) => {
                  const typeConfig = PLAN_TYPES.find(t => t.value === plan.type);
                  const Icon = typeConfig?.icon || Heart;
                  const enrolled = enrollmentCountByPlan[plan.id] || 0;
                  const eligible = employees.length;
                  const enrollmentPct = eligible > 0 ? Math.round((enrolled / eligible) * 100) : 0;
                  const cost = Number(plan.cost) || 0;
                  const contribution = Number(plan.employerContribution) || 0;

                  return (
                    <div key={plan.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeConfig?.color || "bg-slate-100 text-slate-500"}`}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold" style={{ color: NAVY }}>{plan.name}</h3>
                            <p className="text-xs text-slate-500">{plan.provider || "—"}</p>
                          </div>
                        </div>
                        <div className="relative group">
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><MoreVertical size={14} /></button>
                          <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10 w-40">
                            <button onClick={() => { setEnrollPlanId(plan.id); setShowEnroll(true); setEnrollEmployeeId(""); }} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2"><UserPlus size={12} /> Enroll Employee</button>
                            <button onClick={() => toast.info("Edit plan coming soon")} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2"><Pencil size={12} /> Edit Plan</button>
                            <button onClick={() => { if (confirm("Delete this plan?")) deletePlanMut.mutate({ id: plan.id }); }} className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 text-red-500 flex items-center gap-2"><Trash2 size={12} /> Delete</button>
                          </div>
                        </div>
                      </div>

                      {plan.description && <p className="text-xs text-slate-500 mb-3 leading-relaxed">{plan.description}</p>}

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-slate-50">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide">Monthly Cost</p>
                          <p className="text-sm font-bold" style={{ color: NAVY }}>${cost}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide">Employer Pays</p>
                          <p className="text-sm font-bold text-emerald-600">{contribution}%</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide">Enrolled</p>
                          <p className="text-sm font-bold" style={{ color: NAVY }}>{enrolled} / {eligible}</p>
                        </div>
                      </div>

                      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="absolute h-full rounded-full transition-all" style={{ width: `${enrollmentPct}%`, background: TEAL }} />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className="text-[10px] text-slate-400">{enrollmentPct}% enrolled</span>
                        {plan.eligibility && <span className="text-[10px] text-slate-400">{plan.eligibility}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Enrollment Tab */}
        {activeTab === "enrollment" && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: NAVY }}>Employee Enrollments</h3>
                <p className="text-xs text-slate-500 mt-0.5">All benefit enrollments across plans</p>
              </div>
            </div>
            <table className="w-full">
              <thead><tr className="text-xs text-slate-500 border-b border-slate-50">
                <th className="text-left px-6 py-3 font-medium">Employee</th>
                <th className="text-left px-4 py-3 font-medium">Plan</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Enrolled Date</th>
                <th className="text-center px-4 py-3 font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {enrollments.map((enrollment: any) => {
                  const emp = employees.find((e: any) => e.id === enrollment.employeeId);
                  const plan = plans.find((p: any) => p.id === enrollment.planId);
                  return (
                    <tr key={enrollment.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: TEAL }}>
                            {emp?.firstName?.[0]}{emp?.lastName?.[0]}
                          </div>
                          <span className="text-sm font-medium text-slate-800">{emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${enrollment.employeeId}`}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{plan?.name || `Plan #${enrollment.planId}`}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${
                          enrollment.status === "enrolled" ? "bg-emerald-50 text-emerald-600" :
                          enrollment.status === "pending" ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"
                        }`}>{enrollment.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <button className="text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-400" onClick={() => toast("View details coming soon")}><Eye size={12} className="inline mr-1" /> View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {enrollments.length === 0 && (
              <div className="py-16 text-center"><Users size={40} className="mx-auto mb-3 text-slate-300" /><p className="text-sm text-slate-500">No enrollments yet</p><p className="text-xs text-slate-400 mt-1">Enroll employees from the Plans tab</p></div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="text-sm font-semibold mb-5" style={{ color: NAVY }}>Cost Breakdown by Plan Type</h3>
              <div className="space-y-4">
                {PLAN_TYPES.map(type => {
                  const typePlans = plans.filter((p: any) => p.type === type.value);
                  const typeCost = typePlans.reduce((s: number, p: any) => {
                    const cost = Number(p.cost) || 0;
                    const enrolled = enrollmentCountByPlan[p.id] || 0;
                    return s + cost * enrolled;
                  }, 0);
                  const typeEnrolled = typePlans.reduce((s: number, p: any) => s + (enrollmentCountByPlan[p.id] || 0), 0);
                  if (typePlans.length === 0) return null;
                  const Icon = type.icon;
                  const pct = totalMonthlyCost > 0 ? (typeCost / totalMonthlyCost) * 100 : 0;
                  return (
                    <div key={type.value} className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${type.color}`}><Icon size={16} /></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium" style={{ color: NAVY }}>{type.label}</span>
                          <span className="text-sm text-slate-500">${typeCost.toLocaleString()}/mo · {typeEnrolled} enrolled</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: TEAL }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl p-6 border" style={{ background: `linear-gradient(135deg, ${NAVY}05, ${TEAL}08)`, borderColor: `${TEAL}20` }}>
              <div className="flex items-center gap-3 mb-4">
                <Sparkles size={18} style={{ color: TEAL }} />
                <h3 className="text-base font-semibold" style={{ color: NAVY }}>AI Benefits Insights</h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${TEAL}20`, color: TEAL }}>AI</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/80 rounded-xl p-4 border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Enrollment Gap</p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {employees.length - totalEnrolled > 0
                      ? `${employees.length - totalEnrolled} employees have no benefit enrollments. Consider outreach to improve coverage.`
                      : "All employees are enrolled in at least one plan. Great coverage!"}
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-4 border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Cost Optimization</p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Monthly benefits cost is ${totalMonthlyCost.toLocaleString()}. {totalMonthlyCost > 0 ? "Review low-enrollment plans for potential consolidation." : "Add plans to start tracking costs."}
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-4 border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Plan Coverage</p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {activePlans.length} active plans across {new Set(plans.map((p: any) => p.type)).size} categories. {activePlans.length < 3 ? "Consider adding more plan types." : "Good variety of plan types."}
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
