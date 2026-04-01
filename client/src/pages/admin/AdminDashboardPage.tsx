import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, CalendarDays, Briefcase, Star, TrendingUp, Clock, AlertTriangle, CheckCircle2, ArrowUpRight, DollarSign, GraduationCap, Target } from "lucide-react";
import { Link } from "wouter";

function StatCard({ title, value, icon: Icon, change, color }: { title: string; value: string | number; icon: React.ElementType; change?: string; color: string }) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            {change && <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><TrendingUp size={12} />{change}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={20} className="text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const { data: timeOff = [] } = trpc.timeOff.list.useQuery();
  const { data: postings = [] } = trpc.jobPosting.list.useQuery();
  const { data: reviews = [] } = trpc.performance.list.useQuery();
  const { data: announcements = [] } = trpc.announcements.list.useQuery();
  const { data: goals = [] } = trpc.goals.list.useQuery();
  const { data: courses = [] } = trpc.learning.listCourses.useQuery();

  const activeEmployees = employees.filter((e: any) => e.status === "active").length;
  const pendingTimeOff = timeOff.filter((t: any) => t.status === "pending").length;
  const openPositions = postings.filter((p: any) => p.status === "open").length;
  const activeReviews = reviews.filter((r: any) => r.status === "draft" || r.status === "submitted").length;

  const recentAnnouncements = [...announcements].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);
  const pendingRequests = timeOff.filter((t: any) => t.status === "pending").slice(0, 5);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Organization overview and key metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Active Employees" value={activeEmployees} icon={Users} color="bg-indigo-500" change={employees.length > 0 ? `${employees.length} total` : undefined} />
          <StatCard title="Pending Time Off" value={pendingTimeOff} icon={CalendarDays} color="bg-amber-500" />
          <StatCard title="Open Positions" value={openPositions} icon={Briefcase} color="bg-emerald-500" />
          <StatCard title="Active Reviews" value={activeReviews} icon={Star} color="bg-purple-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Approvals */}
          <Card className="border-0 shadow-sm lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Pending Approvals</CardTitle>
                <Link href="/admin/time-off"><Button variant="ghost" size="sm" className="text-indigo-600">View all <ArrowUpRight size={14} className="ml-1" /></Button></Link>
              </div>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-400" />
                  <p className="text-sm">All caught up! No pending requests.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req: any) => {
                    const emp = employees.find((e: any) => e.id === req.employeeId);
                    return (
                      <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <Clock size={16} className="text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${req.employeeId}`}</p>
                            <p className="text-xs text-slate-500 capitalize">{req.type} — {req.days} day{req.days > 1 ? "s" : ""}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Pending</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Announcements */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Announcements</CardTitle>
                <Link href="/admin/announcements"><Button variant="ghost" size="sm" className="text-indigo-600">View all</Button></Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentAnnouncements.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No announcements yet</p>
              ) : (
                <div className="space-y-3">
                  {recentAnnouncements.map((ann: any) => (
                    <div key={ann.id} className="p-3 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs capitalize">{ann.type}</Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-900">{ann.title}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ann.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/admin/employees"><Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover:border-indigo-300 hover:bg-indigo-50"><Users size={20} className="text-indigo-500" /><span className="text-xs">Manage Employees</span></Button></Link>
          <Link href="/admin/hiring"><Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover:border-emerald-300 hover:bg-emerald-50"><Briefcase size={20} className="text-emerald-500" /><span className="text-xs">Hiring Pipeline</span></Button></Link>
          <Link href="/admin/payroll"><Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover:border-amber-300 hover:bg-amber-50"><DollarSign size={20} className="text-amber-500" /><span className="text-xs">Run Payroll</span></Button></Link>
          <Link href="/admin/performance"><Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover:border-purple-300 hover:bg-purple-50"><Star size={20} className="text-purple-500" /><span className="text-xs">Performance</span></Button></Link>
        </div>
      </div>
    </AdminLayout>
  );
}
