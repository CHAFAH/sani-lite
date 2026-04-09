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
  Heart, Plus, Search, MoreVertical, Shield, Activity,
  DollarSign, Users, CheckCircle2, Clock, AlertCircle,
  Stethoscope, Umbrella, Dumbbell, Gift, Building2,
  TrendingUp, Eye, Pencil, Trash2, UserPlus, Loader2, X,
} from "lucide-react";
import { toast } from "sonner";

/* ── Benefit plan type config ── */
const PLAN_TYPES = [
  { value: "health", label: "Health Insurance", icon: Stethoscope, color: "text-red-500 bg-red-50" },
  { value: "dental", label: "Dental", icon: Activity, color: "text-blue-500 bg-blue-50" },
  { value: "vision", label: "Vision", icon: Eye, color: "text-indigo-500 bg-indigo-50" },
  { value: "life", label: "Life Insurance", icon: Shield, color: "text-emerald-500 bg-emerald-50" },
  { value: "retirement", label: "Pension/401k", icon: Building2, color: "text-amber-500 bg-amber-50" },
  { value: "wellness", label: "Wellness", icon: Dumbbell, color: "text-teal-500 bg-teal-50" },
  { value: "other", label: "Other / Perks", icon: Gift, color: "text-violet-500 bg-violet-50" },
];

export default function AdminBenefitsPage() {
  const { data: plans = [], isLoading: plansLoading } = trpc.benefits.listPlans.useQuery();
  const { data: enrollments = [] } = trpc.benefits.listEnrollments.useQuery();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const utils = trpc.useUtils();

  const createPlanMut = trpc.benefits.createPlan.useMutation({
    onSuccess: () => { utils.benefits.listPlans.invalidate(); toast.success("Benefit plan created"); setShowAddPlan(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const updatePlanMut = trpc.benefits.updatePlan.useMutation({
    onSuccess: () => { utils.benefits.listPlans.invalidate(); toast.success("Plan updated"); },
    onError: (e) => toast.error(e.message),
  });
  const deletePlanMut = trpc.benefits.deletePlan.useMutation({
    onSuccess: () => { utils.benefits.listPlans.invalidate(); toast.success("Plan deleted"); },
    onError: (e) => toast.error(e.message),
  });
  const enrollMut = trpc.benefits.enroll.useMutation({
    onSuccess: () => { utils.benefits.listEnrollments.invalidate(); toast.success("Employee enrolled"); setShowEnroll(false); },
    onError: (e) => toast.error(e.message),
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"plans" | "enrollment" | "analytics">("plans");
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [showEnroll, setShowEnroll] = useState(false);
  const [enrollPlanId, setEnrollPlanId] = useState<number | null>(null);
  const [enrollEmployeeId, setEnrollEmployeeId] = useState("");
  const [form, setForm] = useState({
    name: "", type: "health" as "health" | "dental" | "vision" | "life" | "retirement" | "wellness" | "other", description: "", provider: "",
    cost: "", employerContribution: "", eligibility: "",
  });

  const resetForm = () => setForm({ name: "", type: "health", description: "", provider: "", cost: "", employerContribution: "", eligibility: "" });

  // Compute enrollment counts per plan
  const enrollmentCountByPlan = useMemo(() => {
    const map: Record<number, number> = {};
    enrollments.forEach((e: any) => {
      if (e.status === "enrolled") {
        map[e.planId] = (map[e.planId] || 0) + 1;
      }
    });
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
    ? Math.round((totalEnrolled / (activePlans.length * employees.length)) * 100)
    : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Benefits Administration</h1>
            <p className="text-sm text-slate-500 mt-1">Global benefits management across all entities</p>
          </div>
          <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setShowAddPlan(true)}>
            <Plus size={16} className="mr-2" />Add Plan
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center mb-2">
                <Heart size={20} className="text-rose-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{activePlans.length}</p>
              <p className="text-xs text-slate-500 mt-1">Active Plans</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-2">
                <DollarSign size={20} className="text-teal-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">${totalMonthlyCost.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Monthly Benefits Cost</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-2">
                <Users size={20} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{avgEnrollmentRate}%</p>
              <p className="text-xs text-slate-500 mt-1">Avg Enrollment Rate</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-2">
                <CheckCircle2 size={20} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{totalEnrolled}</p>
              <p className="text-xs text-slate-500 mt-1">Total Enrollments</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
          {(["plans", "enrollment", "analytics"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "plans" ? "Benefit Plans" : tab === "enrollment" ? "Enrollment" : "Analytics"}
            </button>
          ))}
        </div>

        {/* Add Plan Form */}
        {showAddPlan && (
          <Card className="border-0 shadow-sm border-l-4 border-l-teal-500">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Create Benefit Plan</h3>
                <Button variant="ghost" size="sm" onClick={() => { setShowAddPlan(false); resetForm(); }}>
                  <X size={16} />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Plan Name *</label>
                  <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Premium Health Plan" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Type *</label>
                  <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as typeof p.type }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PLAN_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Provider</label>
                  <Input value={form.provider} onChange={e => setForm(p => ({ ...p, provider: e.target.value }))} placeholder="e.g. Aetna" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Monthly Cost ($)</label>
                  <Input type="number" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} placeholder="0.00" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Employer Contribution (%)</label>
                  <Input type="number" value={form.employerContribution} onChange={e => setForm(p => ({ ...p, employerContribution: e.target.value }))} placeholder="80" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Eligibility</label>
                  <Input value={form.eligibility} onChange={e => setForm(p => ({ ...p, eligibility: e.target.value }))} placeholder="e.g. Full-time employees" />
                </div>
                <div className="md:col-span-3">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Description</label>
                  <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of the plan" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => { setShowAddPlan(false); resetForm(); }}>Cancel</Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-700"
                  disabled={createPlanMut.isPending || !form.name}
                  onClick={() => createPlanMut.mutate(form)}
                >
                  {createPlanMut.isPending && <Loader2 size={14} className="mr-2 animate-spin" />}
                  Create Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enroll Employee Modal */}
        {showEnroll && enrollPlanId && (
          <Card className="border-0 shadow-sm border-l-4 border-l-blue-500">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Enroll Employee</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowEnroll(false)}>
                  <X size={16} />
                </Button>
              </div>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Select Employee</label>
                  <Select value={enrollEmployeeId} onValueChange={setEnrollEmployeeId}>
                    <SelectTrigger><SelectValue placeholder="Choose employee..." /></SelectTrigger>
                    <SelectContent>
                      {employees.map((e: any) => (
                        <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={enrollMut.isPending || !enrollEmployeeId}
                  onClick={() => enrollMut.mutate({ employeeId: Number(enrollEmployeeId), planId: enrollPlanId })}
                >
                  {enrollMut.isPending && <Loader2 size={14} className="mr-2 animate-spin" />}
                  Enroll
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans Tab */}
        {activeTab === "plans" && (
          <>
            <div className="flex gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Search plans..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9" />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-44 h-9">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {PLAN_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {plansLoading ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 size={32} className="mx-auto mb-3 animate-spin text-slate-300" />
                <p className="text-sm">Loading benefit plans...</p>
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Heart size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm">No benefit plans found</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowAddPlan(true)}>
                  Create First Plan
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPlans.map((plan: any) => {
                  const typeConfig = PLAN_TYPES.find(t => t.value === plan.type);
                  const Icon = typeConfig?.icon || Heart;
                  const enrolled = enrollmentCountByPlan[plan.id] || 0;
                  const eligible = employees.length;
                  const enrollmentPct = eligible > 0 ? Math.round((enrolled / eligible) * 100) : 0;
                  const cost = Number(plan.cost) || 0;
                  const contribution = Number(plan.employerContribution) || 0;

                  return (
                    <Card key={plan.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeConfig?.color || "bg-slate-100 text-slate-500"}`}>
                              <Icon size={20} />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900">{plan.name}</h3>
                              <p className="text-xs text-slate-500">{plan.provider || "—"}</p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreVertical size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEnrollPlanId(plan.id); setShowEnroll(true); setEnrollEmployeeId(""); }}>
                                <UserPlus size={14} className="mr-2" />Enroll Employee
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.info("Edit plan coming soon")}>
                                <Pencil size={14} className="mr-2" />Edit Plan
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this plan?")) {
                                    deletePlanMut.mutate({ id: plan.id });
                                  }
                                }}
                              >
                                <Trash2 size={14} className="mr-2" />Delete Plan
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {plan.description && (
                          <p className="text-xs text-slate-500 mb-3">{plan.description}</p>
                        )}

                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-slate-500">Monthly Cost</p>
                            <p className="text-sm font-semibold text-slate-900">${cost}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Employer Pays</p>
                            <p className="text-sm font-semibold text-emerald-600">{contribution}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Enrolled</p>
                            <p className="text-sm font-semibold text-slate-900">{enrolled} / {eligible}</p>
                          </div>
                        </div>

                        {/* Enrollment Progress Bar */}
                        <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="absolute h-full bg-teal-500 rounded-full transition-all"
                            style={{ width: `${enrollmentPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-slate-400">{enrollmentPct}% enrolled</span>
                          {plan.eligibility && <span className="text-[10px] text-slate-400">{plan.eligibility}</span>}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Enrollment Tab */}
        {activeTab === "enrollment" && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Employee Enrollments</h3>
                  <p className="text-xs text-slate-500 mt-0.5">All benefit enrollments across plans</p>
                </div>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Employee</th>
                    <th className="px-5 py-3 text-left">Plan</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Enrolled Date</th>
                    <th className="px-5 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrollments.map((enrollment: any) => {
                    const emp = employees.find((e: any) => e.id === enrollment.employeeId);
                    const plan = plans.find((p: any) => p.id === enrollment.planId);
                    return (
                      <tr key={enrollment.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold">
                              {emp?.firstName?.[0]}{emp?.lastName?.[0]}
                            </div>
                            <p className="text-sm font-medium text-slate-900">{emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${enrollment.employeeId}`}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600">{plan?.name || `Plan #${enrollment.planId}`}</td>
                        <td className="px-5 py-3">
                          <Badge variant="outline" className={`text-xs border-0 capitalize ${
                            enrollment.status === "enrolled" ? "bg-emerald-50 text-emerald-700" :
                            enrollment.status === "pending" ? "bg-amber-50 text-amber-700" :
                            "bg-slate-100 text-slate-600"
                          }`}>
                            {enrollment.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600">
                          {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreVertical size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toast.info("View details coming soon")}>
                                <Eye size={14} className="mr-2" />View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => toast.info("Terminate enrollment coming soon")}>
                                <Trash2 size={14} className="mr-2" />Terminate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {enrollments.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                  <Users size={40} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">No enrollments yet</p>
                  <p className="text-xs mt-1">Enroll employees from the Plans tab</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-4">
            {/* Cost by Plan Type */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-semibold text-slate-900 mb-4">Cost Breakdown by Plan Type</h3>
                <div className="space-y-3">
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
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${type.color}`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-900">{type.label}</span>
                            <span className="text-sm text-slate-600">${typeCost.toLocaleString()}/mo · {typeEnrolled} enrolled</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-rose-50 to-pink-50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                    <TrendingUp size={16} className="text-rose-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">AI Benefits Insights</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/80 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Enrollment Gap</p>
                    <p className="text-sm font-medium text-slate-900">
                      {employees.length - totalEnrolled > 0
                        ? `${employees.length - totalEnrolled} employees have no benefit enrollments. Consider outreach to improve coverage.`
                        : "All employees are enrolled in at least one plan. Great coverage!"}
                    </p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Cost Optimization</p>
                    <p className="text-sm font-medium text-slate-900">
                      Monthly benefits cost is ${totalMonthlyCost.toLocaleString()}. {totalMonthlyCost > 0 ? "Review low-enrollment plans for potential consolidation." : "Add plans to start tracking costs."}
                    </p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Plan Coverage</p>
                    <p className="text-sm font-medium text-slate-900">
                      {activePlans.length} active plans across {new Set(plans.map((p: any) => p.type)).size} categories. {activePlans.length < 3 ? "Consider adding more plan types for comprehensive coverage." : "Good variety of plan types."}
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
