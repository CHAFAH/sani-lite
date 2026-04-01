/*
 * Employee Self Service — Personal profile, time-off, goals, and documents
 */
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { User, CalendarDays, Target, BookOpen, Star, Building2 } from "lucide-react";

export default function EmployeeSelfServicePage() {
  const { user } = useAuth();
  const { data: employees } = trpc.employee.list.useQuery();
  const { data: timeOff } = trpc.timeOff.list.useQuery();
  const { data: allGoals } = trpc.goals.list.useQuery();
  const { data: assignments } = trpc.learning.listAssignments.useQuery();
  const { data: reviews } = trpc.performance.list.useQuery();
  const { data: allAnnouncements } = trpc.announcements.list.useQuery();

  const myEmployee = employees?.find((e: { userId: number }) => e.userId === user?.id);
  const myTimeOff = myEmployee ? (timeOff || []).filter((t: { employeeId: number }) => t.employeeId === myEmployee.id) : [];
  const myGoals = myEmployee ? (allGoals || []).filter((g: { employeeId: number }) => g.employeeId === myEmployee.id) : [];
  const myAssignments = myEmployee ? (assignments || []).filter((a: { employeeId: number }) => a.employeeId === myEmployee.id) : [];
  const myReviews = myEmployee ? (reviews || []).filter((r: { employeeId: number }) => r.employeeId === myEmployee.id) : [];
  const recentAnnouncements = (allAnnouncements || []).slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-normal tracking-tight font-serif">My Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Your personal dashboard and self-service portal</p>
        </motion.div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600"><User size={36} /></div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{myEmployee ? `${myEmployee.firstName} ${myEmployee.lastName}` : user?.name || "Employee"}</h2>
                <p className="text-sm text-muted-foreground">{myEmployee?.position || "Team Member"}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  {myEmployee?.department && <span className="flex items-center gap-1"><Building2 size={12} />{myEmployee.department}</span>}
                  {myEmployee?.email && <span>{myEmployee.email}</span>}
                  {myEmployee?.status && <Badge variant="outline" className={myEmployee.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>{myEmployee.status}</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6 text-center"><CalendarDays size={24} className="mx-auto text-amber-600 mb-2" /><p className="text-2xl font-semibold">{myTimeOff.filter((t: { status: string }) => t.status === "approved").length}</p><p className="text-xs text-muted-foreground">Approved Leave</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><Target size={24} className="mx-auto text-teal-600 mb-2" /><p className="text-2xl font-semibold">{myGoals.length}</p><p className="text-xs text-muted-foreground">Active Goals</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><BookOpen size={24} className="mx-auto text-purple-600 mb-2" /><p className="text-2xl font-semibold">{myAssignments.length}</p><p className="text-xs text-muted-foreground">Courses</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><Star size={24} className="mx-auto text-amber-600 mb-2" /><p className="text-2xl font-semibold">{myReviews.length}</p><p className="text-xs text-muted-foreground">Reviews</p></CardContent></Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeoff">Time Off</TabsTrigger>
            <TabsTrigger value="goals">My Goals</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Recent Announcements</CardTitle></CardHeader>
              <CardContent>
                {recentAnnouncements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No announcements</p>
                ) : (
                  <div className="space-y-3">
                    {recentAnnouncements.map((ann: { id: number; type: string; title: string; content: string }) => (
                      <div key={ann.id} className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0">
                        <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: ann.type === "urgent" ? "#EF4444" : ann.type === "celebration" ? "#F59E0B" : "#3B82F6" }} />
                        <div>
                          <p className="text-sm font-medium">{ann.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{ann.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {myReviews.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Performance Reviews</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {myReviews.map((review: { id: number; reviewPeriod: string; rating: number | null; status: string }) => (
                      <div key={review.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <div>
                          <p className="text-sm font-medium">{review.reviewPeriod}</p>
                          {review.rating != null && (
                            <div className="flex items-center gap-1 mt-1">
                              {[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= review.rating! ? "text-amber-400 fill-amber-400" : "text-gray-200"} />)}
                            </div>
                          )}
                        </div>
                        <Badge variant="outline" className={review.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-600"}>{review.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeoff" className="mt-4">
            {myTimeOff.length === 0 ? (
              <Card className="py-12 text-center"><CardContent><CalendarDays size={48} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">No time-off requests</p></CardContent></Card>
            ) : (
              <div className="space-y-3">
                {myTimeOff.map((t: { id: number; type: string; startDate: Date; endDate: Date; reason: string | null; status: string }) => (
                  <Card key={t.id}>
                    <CardContent className="pt-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium capitalize">{(t.type || "vacation").replace("_", " ")}</p>
                        <p className="text-xs text-muted-foreground">{new Date(t.startDate).toLocaleDateString()} — {new Date(t.endDate).toLocaleDateString()}</p>
                        {t.reason && <p className="text-xs text-muted-foreground mt-1">{t.reason}</p>}
                      </div>
                      <Badge variant="outline" className={t.status === "approved" ? "bg-emerald-50 text-emerald-700" : t.status === "rejected" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}>{t.status}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="goals" className="mt-4">
            {myGoals.length === 0 ? (
              <Card className="py-12 text-center"><CardContent><Target size={48} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">No goals assigned</p></CardContent></Card>
            ) : (
              <div className="space-y-3">
                {myGoals.map((goal: { id: number; title: string; description: string | null; status: string; progress: number | null }) => (
                  <Card key={goal.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium">{goal.title}</p>
                          {goal.description && <p className="text-xs text-muted-foreground">{goal.description}</p>}
                        </div>
                        <Badge variant="outline" className={goal.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-600"}>{goal.status.replace("_", " ")}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <Progress value={goal.progress || 0} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground">{goal.progress || 0}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="learning" className="mt-4">
            {myAssignments.length === 0 ? (
              <Card className="py-12 text-center"><CardContent><BookOpen size={48} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">No courses assigned</p></CardContent></Card>
            ) : (
              <div className="space-y-3">
                {myAssignments.map((a: { id: number; courseId: number; progress: number | null; status: string }) => (
                  <Card key={a.id}>
                    <CardContent className="pt-4 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">Course #{a.courseId}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Progress value={a.progress || 0} className="h-2 flex-1 max-w-[200px]" />
                          <span className="text-xs text-muted-foreground">{a.progress || 0}%</span>
                        </div>
                      </div>
                      <Badge variant="outline" className={a.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-600"}>{a.status.replace("_", " ")}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
