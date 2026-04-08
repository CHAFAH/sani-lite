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
  TrendingUp, Eye, Pencil, Trash2, UserPlus,
} from "lucide-react";
import { toast } from "sonner";

/* ── Benefit plan types ── */
const PLAN_TYPES = [
  { value: "health", label: "Health Insurance", icon: Stethoscope, color: "text-red-500 bg-red-50" },
  { value: "dental", label: "Dental", icon: Activity, color: "text-blue-500 bg-blue-50" },
  { value: "vision", label: "Vision", icon: Eye, color: "text-indigo-500 bg-indigo-50" },
  { value: "life", label: "Life Insurance", icon: Shield, color: "text-emerald-500 bg-emerald-50" },
  { value: "pension", label: "Pension/401k", icon: Building2, color: "text-amber-500 bg-amber-50" },
  { value: "wellness", label: "Wellness", icon: Dumbbell, color: "text-teal-500 bg-teal-50" },
  { value: "perks", label: "Perks & Stipends", icon: Gift, color: "text-violet-500 bg-violet-50" },
  { value: "insurance", label: "Disability Insurance", icon: Umbrella, color: "text-orange-500 bg-orange-50" },
];

/* ── Mock benefit plans ── */
const MOCK_PLANS = [
  { id: 1, name: "Premium Health Plan", type: "health", provider: "Aetna", monthlyCost: 450, employerContribution: 80, enrolled: 42, eligible: 50, status: "active", countries: ["US", "CA"] },
  { id: 2, name: "Standard Dental", type: "dental", provider: "Delta Dental", monthlyCost: 45, employerContribution: 100, enrolled: 38, eligible: 50, status: "active", countries: ["US"] },
  { id: 3, name: "Vision Care Plus", type: "vision", provider: "VSP", monthlyCost: 25, employerContribution: 100, enrolled: 35, eligible: 50, status: "active", countries: ["US", "CA"] },
  { id: 4, name: "Group Life Insurance", type: "life", provider: "MetLife", monthlyCost: 30, employerContribution: 100, enrolled: 50, eligible: 50, status: "active", countries: ["US", "GB", "DE"] },
  { id: 5, name: "Company 401k Match", type: "pension", provider: "Fidelity", monthlyCost: 0, employerContribution: 100, enrolled: 40, eligible: 50, status: "active", countries: ["US"] },
  { id: 6, name: "Wellness Stipend", type: "wellness", provider: "Internal", monthlyCost: 100, employerContribution: 100, enrolled: 30, eligible: 50, status: "active", countries: ["US", "GB", "DE", "FR", "CA"] },
  { id: 7, name: "Remote Work Perks", type: "perks", provider: "Internal", monthlyCost: 150, employerContribution: 100, enrolled: 48, eligible: 50, status: "active", countries: ["US", "GB", "DE", "FR", "CA", "AU", "IN"] },
  { id: 8, name: "Short-Term Disability", type: "insurance", provider: "Guardian", monthlyCost: 20, employerContribution: 100, enrolled: 50, eligible: 50, status: "active", countries: ["US"] },
];

export default function AdminBenefitsPage() {
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"plans" | "enrollment" | "analytics">("plans");
  const [showAddPlan, setShowAddPlan] = useState(false);

  const filteredPlans = useMemo(() => {
    return MOCK_PLANS.filter(p => {
      const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === "all" || p.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [searchQuery, typeFilter]);

  const totalMonthlyCost = MOCK_PLANS.reduce((s, p) => s + p.monthlyCost * p.enrolled, 0);
  const avgEnrollmentRate = Math.round(MOCK_PLANS.reduce((s, p) => s + (p.enrolled / p.eligible) * 100, 0) / MOCK_PLANS.length);

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
              <p className="text-2xl font-bold text-slate-900">{MOCK_PLANS.length}</p>
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
              <p className="text-2xl font-bold text-slate-900">7</p>
              <p className="text-xs text-slate-500 mt-1">Countries Covered</p>
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

        {/* Plans Tab */}
        {activeTab === "plans" && (
          <>
            {/* Filters */}
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

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPlans.map(plan => {
                const typeConfig = PLAN_TYPES.find(t => t.value === plan.type);
                const Icon = typeConfig?.icon || Heart;
                const enrollmentPct = Math.round((plan.enrolled / plan.eligible) * 100);
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
                            <p className="text-xs text-slate-500">{plan.provider}</p>
                          </div>
                        </div>
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
                            <DropdownMenuItem onClick={() => toast.info("Edit plan coming soon")}>
                              <Pencil size={14} className="mr-2" />Edit Plan
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info("Manage enrollment coming soon")}>
                              <UserPlus size={14} className="mr-2" />Manage Enrollment
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => toast.info("Deactivate coming soon")}>
                              <Trash2 size={14} className="mr-2" />Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-slate-500">Monthly Cost</p>
                          <p className="text-sm font-semibold text-slate-900">${plan.monthlyCost}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Employer Pays</p>
                          <p className="text-sm font-semibold text-teal-600">{plan.employerContribution}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Enrolled</p>
                          <p className="text-sm font-semibold text-slate-900">{plan.enrolled}/{plan.eligible}</p>
                        </div>
                      </div>

                      {/* Enrollment bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-500">Enrollment</span>
                          <span className="text-xs font-medium text-slate-700">{enrollmentPct}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${enrollmentPct > 80 ? "bg-emerald-500" : enrollmentPct > 50 ? "bg-blue-500" : "bg-amber-500"}`}
                            style={{ width: `${enrollmentPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Countries */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {plan.countries.map(c => (
                          <Badge key={c} variant="outline" className="text-[10px] px-1.5 py-0">{c}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Enrollment Tab */}
        {activeTab === "enrollment" && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Employee Enrollment</h3>
                <p className="text-xs text-slate-500 mt-0.5">View and manage individual employee benefit enrollments</p>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Employee</th>
                    <th className="px-5 py-3 text-left">Health</th>
                    <th className="px-5 py-3 text-left">Dental</th>
                    <th className="px-5 py-3 text-left">Vision</th>
                    <th className="px-5 py-3 text-left">Life</th>
                    <th className="px-5 py-3 text-left">Pension</th>
                    <th className="px-5 py-3 text-left">Wellness</th>
                    <th className="px-5 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.slice(0, 10).map((emp: any) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold">
                            {emp.firstName?.[0]}{emp.lastName?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-slate-500">{emp.department || "—"}</p>
                          </div>
                        </div>
                      </td>
                      {["health", "dental", "vision", "life", "pension", "wellness"].map(type => (
                        <td key={type} className="px-5 py-3">
                          {Math.random() > 0.3 ? (
                            <CheckCircle2 size={16} className="text-emerald-500" />
                          ) : (
                            <AlertCircle size={16} className="text-slate-300" />
                          )}
                        </td>
                      ))}
                      <td className="px-5 py-3 text-center">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toast.info("Manage enrollment coming soon")}>
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {employees.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                  <Users size={40} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">No employees to display</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-slate-900 mb-4">Cost by Plan Type</h3>
                  <div className="space-y-3">
                    {PLAN_TYPES.map(type => {
                      const plans = MOCK_PLANS.filter(p => p.type === type.value);
                      const cost = plans.reduce((s, p) => s + p.monthlyCost * p.enrolled, 0);
                      const pct = totalMonthlyCost > 0 ? Math.round((cost / totalMonthlyCost) * 100) : 0;
                      if (cost === 0) return null;
                      return (
                        <div key={type.value}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-700">{type.label}</span>
                            <span className="text-sm font-medium text-slate-900">${cost.toLocaleString()} ({pct}%)</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-slate-900 mb-4">Enrollment Trends</h3>
                  <div className="space-y-3">
                    {MOCK_PLANS.map(plan => {
                      const pct = Math.round((plan.enrolled / plan.eligible) * 100);
                      return (
                        <div key={plan.id} className="flex items-center gap-3">
                          <span className="text-xs text-slate-600 w-36 truncate">{plan.name}</span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct > 80 ? "bg-emerald-500" : pct > 50 ? "bg-blue-500" : "bg-amber-500"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-700 w-10 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Recommendations */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-rose-50 to-pink-50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                    <TrendingUp size={16} className="text-rose-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">AI Benefits Recommendations</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/80 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Cost Optimization</p>
                    <p className="text-sm font-medium text-slate-900">Switching dental provider to Cigna could save $2,400/month with comparable coverage.</p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Enrollment Gap</p>
                    <p className="text-sm font-medium text-slate-900">12 eligible employees haven't enrolled in the wellness program. Consider a reminder campaign.</p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Satisfaction Insight</p>
                    <p className="text-sm font-medium text-slate-900">Remote work perks have 96% enrollment — consider expanding the stipend to boost retention.</p>
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
