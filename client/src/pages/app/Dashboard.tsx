/*
 * Dashboard — Main app dashboard with real data
 */
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Users, UserPlus, CalendarDays, Briefcase, Clock, TrendingUp, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function AppDashboard() {
  const { data: employees, isLoading: empLoading } = trpc.employee.list.useQuery();
  const { data: timeOff, isLoading: toLoading } = trpc.timeOff.list.useQuery();
  const { data: postings, isLoading: jpLoading } = trpc.jobPosting.list.useQuery();
  const { data: reviews } = trpc.performance.list.useQuery();
  const { data: announcements } = trpc.announcements.list.useQuery();
  const { data: workflows } = trpc.workflow.listInstances.useQuery();

  const activeEmployees = employees?.filter(e => e.status === "active") || [];
  const pendingTimeOff = timeOff?.filter(t => t.status === "pending") || [];
  const openPositions = postings?.filter(p => p.status === "open") || [];
  const activeReviews = reviews?.filter(r => r.status === "draft" || r.status === "submitted") || [];
  const activeWorkflows = workflows?.filter(w => w.status === "in_progress") || [];
  const recentAnnouncements = (announcements || []).slice(0, 3);

  // Department breakdown
  const deptMap: Record<string, number> = {};
  activeEmployees.forEach(e => { const d = e.department || "Unassigned"; deptMap[d] = (deptMap[d] || 0) + 1; });
  const departments = Object.entries(deptMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const deptColors = ["#0D9488", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];

  const stats = [
    { label: "Total Employees", value: activeEmployees.length, icon: Users, color: "bg-teal-50 text-teal-600" },
    { label: "Pending Time Off", value: pendingTimeOff.length, icon: CalendarDays, color: "bg-amber-50 text-amber-600" },
    { label: "Open Positions", value: openPositions.length, icon: Briefcase, color: "bg-purple-50 text-purple-600" },
    { label: "Active Reviews", value: activeReviews.length, icon: TrendingUp, color: "bg-rose-50 text-rose-600" },
    { label: "Active Workflows", value: activeWorkflows.length, icon: Clock, color: "bg-cyan-50 text-cyan-600" },
    { label: "Announcements", value: recentAnnouncements.length, icon: Megaphone, color: "bg-emerald-50 text-emerald-600" },
  ];

  const isLoading = empLoading || toLoading || jpLoading;

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <h1 className="text-3xl font-normal tracking-tight font-serif">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Your organization at a glance</p>
        </motion.div>

        {/* Stats grid */}
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={fadeUp} className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon size={18} />
                </div>
              </div>
              {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-semibold">{stat.value}</p>}
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Department Breakdown */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Departments</CardTitle>
              <p className="text-sm text-muted-foreground">Headcount by team</p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-8 w-full" />)}</div>
              ) : departments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No employees yet</p>
              ) : (
                <div className="space-y-3">
                  {departments.map(([name, count], i) => (
                    <div key={name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: deptColors[i % deptColors.length] }} />
                      <span className="text-sm flex-1 truncate">{name}</span>
                      <span className="text-sm font-semibold">{count}</span>
                      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(count / activeEmployees.length) * 100}%`, backgroundColor: deptColors[i % deptColors.length] }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Time Off Requests */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Pending Time Off</CardTitle>
                <Link href="/app/time-off"><Button variant="ghost" size="sm">View All</Button></Link>
              </div>
            </CardHeader>
            <CardContent>
              {toLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : pendingTimeOff.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No pending requests</p>
              ) : (
                <div className="space-y-3">
                  {pendingTimeOff.slice(0, 5).map(req => (
                    <div key={req.id} className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium">Employee #{req.employeeId}</p>
                        <p className="text-xs text-muted-foreground capitalize">{req.type} · {req.days} day{req.days > 1 ? "s" : ""}</p>
                      </div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              {recentAnnouncements.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No announcements yet</p>
              ) : (
                <div className="space-y-3">
                  {recentAnnouncements.map(a => (
                    <div key={a.id} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs capitalize">{a.type}</Badge>
                      </div>
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{a.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/app/employees"><Button variant="outline" className="w-full justify-start gap-2 h-12"><UserPlus size={18} />Add Employee</Button></Link>
              <Link href="/app/hiring"><Button variant="outline" className="w-full justify-start gap-2 h-12"><Briefcase size={18} />Post a Job</Button></Link>
              <Link href="/app/performance"><Button variant="outline" className="w-full justify-start gap-2 h-12"><TrendingUp size={18} />Start Review</Button></Link>
              <Link href="/app/payroll"><Button variant="outline" className="w-full justify-start gap-2 h-12"><Clock size={18} />Run Payroll</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
