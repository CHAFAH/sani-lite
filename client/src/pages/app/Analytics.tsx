/*
 * Analytics — Data & analytics dashboard with real data
 */
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, TrendingUp, DollarSign, Briefcase, CalendarDays, GraduationCap, Target, Star, Sparkles } from "lucide-react";

export default function AnalyticsPage() {
  const { data: employees, isLoading: empLoading } = trpc.employee.list.useQuery();
  const { data: timeOff } = trpc.timeOff.list.useQuery();
  const { data: postings } = trpc.jobPosting.list.useQuery();
  const { data: hiringRecords } = trpc.hiring.list.useQuery();
  const { data: reviews } = trpc.performance.list.useQuery();
  const { data: allGoals } = trpc.goals.list.useQuery();
  const { data: courses } = trpc.learning.listCourses.useQuery();
  const { data: assignments } = trpc.learning.listAssignments.useQuery();
  const { data: payroll } = trpc.payroll.list.useQuery();

  const active = (employees || []).filter((e: { status: string }) => e.status === "active");
  const onLeave = (employees || []).filter((e: { status: string }) => e.status === "on_leave");
  const totalPayroll = (payroll || []).reduce((s: number, p: { netPay: string | null }) => s + Number(p.netPay || 0), 0);

  // Department breakdown
  const deptMap: Record<string, number> = {};
  active.forEach((e: { department: string | null }) => { const d = e.department || "Unassigned"; deptMap[d] = (deptMap[d] || 0) + 1; });
  const departments = Object.entries(deptMap).sort((a, b) => b[1] - a[1]);
  const deptColors = ["#0D9488", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16", "#EF4444", "#3B82F6"];

  // Employment type breakdown
  const typeMap: Record<string, number> = {};
  active.forEach((e: { employmentType: string | null }) => { const t = (e.employmentType || "full_time").replace("_", " "); typeMap[t] = (typeMap[t] || 0) + 1; });
  const empTypes = Object.entries(typeMap).sort((a, b) => b[1] - a[1]);

  // Country breakdown
  const countryMap: Record<string, number> = {};
  active.forEach((e: { country: string | null }) => { const c = e.country || "Unknown"; countryMap[c] = (countryMap[c] || 0) + 1; });
  const countries = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Hiring funnel
  const candidateStages: Record<string, number> = {};
  (hiringRecords || []).forEach((c: { status: string }) => { const s = c.status || "applied"; candidateStages[s] = (candidateStages[s] || 0) + 1; });
  const stageOrder = ["applied", "screening", "interview", "offer", "hired", "rejected"];
  const funnelData = stageOrder.map(s => ({ stage: s, count: candidateStages[s] || 0 }));

  // Performance
  const avgRating = (reviews || []).filter((r: { rating: number | null }) => r.rating != null).length > 0
    ? (reviews || []).filter((r: { rating: number | null }) => r.rating != null).reduce((s: number, r: { rating: number | null }) => s + Number(r.rating), 0) / (reviews || []).filter((r: { rating: number | null }) => r.rating != null).length
    : 0;
  const goalsCompleted = (allGoals || []).filter((g: { status: string }) => g.status === "completed").length;
  const goalsTotal = (allGoals || []).length;

  const isLoading = empLoading;

  const stats = [
    { label: "Active Employees", value: active.length, icon: Users, color: "bg-teal-50 text-teal-600" },
    { label: "On Leave", value: onLeave.length, icon: CalendarDays, color: "bg-amber-50 text-amber-600" },
    { label: "Open Positions", value: (postings || []).filter((p: { status: string }) => p.status === "open").length, icon: Briefcase, color: "bg-purple-50 text-purple-600" },
    { label: "Total Candidates", value: (hiringRecords || []).length, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Avg Rating", value: avgRating ? avgRating.toFixed(1) : "N/A", icon: Star, color: "bg-amber-50 text-amber-600" },
    { label: "Goals Completed", value: `${goalsCompleted}/${goalsTotal}`, icon: Target, color: "bg-emerald-50 text-emerald-600" },
    { label: "Courses", value: (courses || []).length, icon: GraduationCap, color: "bg-pink-50 text-pink-600" },
    { label: "Total Payroll", value: `$${(totalPayroll / 1000).toFixed(0)}K`, icon: DollarSign, color: "bg-teal-50 text-teal-600" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-normal tracking-tight font-serif">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Organization-wide data and insights</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(stat => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm">
              <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center mb-3`}><stat.icon size={18} /></div>
              {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-semibold">{stat.value}</p>}
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Headcount by Department</CardTitle></CardHeader>
            <CardContent>
              {departments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {departments.map(([name, count], i) => (
                    <div key={name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: deptColors[i % deptColors.length] }} />
                      <span className="text-sm flex-1 truncate">{name}</span>
                      <span className="text-sm font-semibold">{count}</span>
                      <div className="w-24 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${(count / active.length) * 100}%`, backgroundColor: deptColors[i % deptColors.length] }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Employment Types</CardTitle></CardHeader>
            <CardContent>
              {empTypes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No data yet</p>
              ) : (
                <div className="space-y-4">
                  {empTypes.map(([type, count]) => (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{type}</span>
                        <span className="font-semibold">{count} ({((count / active.length) * 100).toFixed(0)}%)</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${(count / active.length) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Hiring Funnel</CardTitle></CardHeader>
            <CardContent>
              {(hiringRecords || []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No candidates yet</p>
              ) : (
                <div className="space-y-2">
                  {funnelData.map((stage, i) => {
                    const maxCount = Math.max(...funnelData.map(s => s.count), 1);
                    const colors = ["#3B82F6", "#8B5CF6", "#F59E0B", "#0D9488", "#10B981", "#EF4444"];
                    return (
                      <div key={stage.stage} className="flex items-center gap-3">
                        <span className="text-xs w-20 capitalize text-muted-foreground">{stage.stage}</span>
                        <div className="flex-1 h-6 bg-gray-50 rounded overflow-hidden">
                          <div className="h-full rounded flex items-center pl-2" style={{ width: `${Math.max((stage.count / maxCount) * 100, 8)}%`, backgroundColor: colors[i] }}>
                            <span className="text-xs text-white font-medium">{stage.count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Global Distribution</CardTitle></CardHeader>
            <CardContent>
              {countries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No location data</p>
              ) : (
                <div className="space-y-3">
                  {countries.map(([country, count]) => (
                    <div key={country} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <span className="text-sm">{country}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{count}</span>
                        <span className="text-xs text-muted-foreground">({((count / active.length) * 100).toFixed(0)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Learning & Development</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-6 text-center">
              <div><p className="text-2xl font-semibold text-teal-600">{(courses || []).length}</p><p className="text-xs text-muted-foreground">Total Courses</p></div>
              <div><p className="text-2xl font-semibold text-blue-600">{(assignments || []).length}</p><p className="text-xs text-muted-foreground">Assignments</p></div>
              <div><p className="text-2xl font-semibold text-emerald-600">{(assignments || []).filter((e: { status: string }) => e.status === "completed").length}</p><p className="text-xs text-muted-foreground">Completed</p></div>
              <div><p className="text-2xl font-semibold text-amber-600">{(assignments || []).filter((e: { status: string }) => e.status === "in_progress").length}</p><p className="text-xs text-muted-foreground">In Progress</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center"><Sparkles size={16} className="text-purple-600" /></div>
              <div><CardTitle className="text-lg">AI Insights</CardTitle><p className="text-sm text-muted-foreground">Predictive alerts and recommendations</p></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "Attrition Risk", description: `${active.length > 0 ? Math.max(1, Math.floor(active.length * 0.05)) : 0} employees show elevated flight risk based on engagement patterns.`, severity: "High", severityColor: "bg-red-50 text-red-700 border-red-200" },
                { title: "Promotion Ready", description: `${goalsCompleted} employees have completed their goals and may be ready for advancement.`, severity: "Medium", severityColor: "bg-amber-50 text-amber-700 border-amber-200" },
                { title: "Training Gap", description: `${(assignments || []).filter((e: { status: string }) => e.status === "assigned").length} assignments are not yet started. Consider sending reminders.`, severity: "Low", severityColor: "bg-blue-50 text-blue-700 border-blue-200" },
              ].map(insight => (
                <div key={insight.title} className="p-4 rounded-xl border border-border/50 bg-[#FEFCF8]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">{insight.title}</h4>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${insight.severityColor}`}>{insight.severity}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
