import EmployeeLayout from "@/components/EmployeeLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, BookOpen, Target, MessageSquare, Bell, Clock } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const { data: timeOff = [] } = trpc.timeOff.list.useQuery();
  const { data: goals = [] } = trpc.goals.list.useQuery();
  const { data: courses = [] } = trpc.learning.listAssignments.useQuery();
  const { data: announcements = [] } = trpc.announcements.list.useQuery();

  const pendingTimeOff = timeOff.filter((t: any) => t.status === "pending");
  const activeGoals = goals.filter((g: any) => g.status === "in_progress");
  const activeCourses = courses.filter((c: any) => c.status === "assigned" || c.status === "in_progress");
  const recentAnnouncements = announcements.slice(0, 3);

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Here's what's happening today</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CalendarDays size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{pendingTimeOff.length}</p>
                  <p className="text-xs text-slate-500">Pending Leave</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Target size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{activeGoals.length}</p>
                  <p className="text-xs text-slate-500">Active Goals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                  <BookOpen size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{activeCourses.length}</p>
                  <p className="text-xs text-slate-500">Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Bell size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{recentAnnouncements.length}</p>
                  <p className="text-xs text-slate-500">Announcements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Announcements */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell size={16} className="text-indigo-500" /> Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentAnnouncements.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No announcements</p>
              ) : (
                <div className="space-y-3">
                  {recentAnnouncements.map((a: any) => (
                    <div key={a.id} className="p-3 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-slate-900">{a.title}</h4>
                        <Badge variant="outline" className="text-[10px] capitalize">{a.type}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{a.content}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(a.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Goals */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target size={16} className="text-emerald-500" /> My Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeGoals.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No active goals</p>
              ) : (
                <div className="space-y-3">
                  {activeGoals.slice(0, 4).map((g: any) => (
                    <div key={g.id} className="p-3 rounded-lg bg-slate-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-slate-900">{g.title}</h4>
                        <span className="text-xs font-medium text-indigo-600">{g.progress || 0}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${g.progress || 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </EmployeeLayout>
  );
}
