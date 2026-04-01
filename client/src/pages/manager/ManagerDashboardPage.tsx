import ManagerLayout from "@/components/ManagerLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CalendarDays, Target, Star, Clock, TrendingUp } from "lucide-react";

export default function ManagerDashboardPage() {
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const { data: timeOff = [] } = trpc.timeOff.list.useQuery();
  const { data: goals = [] } = trpc.goals.list.useQuery();
  const { data: reviews = [] } = trpc.performance.list.useQuery();

  const activeEmployees = employees.filter((e: any) => e.status === "active");
  const pendingTimeOff = timeOff.filter((t: any) => t.status === "pending");
  const activeGoals = goals.filter((g: any) => g.status === "in_progress");
  const pendingReviews = reviews.filter((r: any) => r.status === "draft");

  const getEmpName = (id: number) => {
    const e = employees.find((e: any) => e.id === id);
    return e ? `${e.firstName} ${e.lastName}` : `Employee #${id}`;
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of your team's activity</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center"><Users size={20} className="text-indigo-600" /></div>
                <div><p className="text-2xl font-bold text-slate-900">{activeEmployees.length}</p><p className="text-xs text-slate-500">Team Members</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center"><Clock size={20} className="text-amber-600" /></div>
                <div><p className="text-2xl font-bold text-slate-900">{pendingTimeOff.length}</p><p className="text-xs text-slate-500">Pending Approvals</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center"><Target size={20} className="text-emerald-600" /></div>
                <div><p className="text-2xl font-bold text-slate-900">{activeGoals.length}</p><p className="text-xs text-slate-500">Active Goals</p></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center"><Star size={20} className="text-purple-600" /></div>
                <div><p className="text-2xl font-bold text-slate-900">{pendingReviews.length}</p><p className="text-xs text-slate-500">Pending Reviews</p></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Pending Time Off Requests</CardTitle></CardHeader>
            <CardContent>
              {pendingTimeOff.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No pending requests</p>
              ) : (
                <div className="space-y-3">
                  {pendingTimeOff.slice(0, 5).map((req: any) => (
                    <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{getEmpName(req.employeeId)}</p>
                        <p className="text-xs text-slate-500">{new Date(req.startDate).toLocaleDateString()} — {new Date(req.endDate).toLocaleDateString()} · {req.days} days</p>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize bg-amber-50 text-amber-700">{req.type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Team Goals Progress</CardTitle></CardHeader>
            <CardContent>
              {activeGoals.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No active goals</p>
              ) : (
                <div className="space-y-3">
                  {activeGoals.slice(0, 5).map((goal: any) => (
                    <div key={goal.id} className="p-3 rounded-lg bg-slate-50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-900">{goal.title}</p>
                        <span className="text-xs font-medium text-indigo-600">{goal.progress || 0}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${goal.progress || 0}%` }} />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{getEmpName(goal.employeeId)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ManagerLayout>
  );
}
