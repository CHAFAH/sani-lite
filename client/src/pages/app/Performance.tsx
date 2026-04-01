/*
 * Performance — Performance reviews and goals with real data
 */
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Plus, Star, Target, Send, CheckCircle2 } from "lucide-react";

export default function PerformancePage() {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ employeeId: "", reviewPeriod: "", rating: "", comments: "", strengths: "", improvements: "" });
  const [goalForm, setGoalForm] = useState({ employeeId: "", title: "", description: "", dueDate: "" });

  const utils = trpc.useUtils();
  const { data: reviews, isLoading } = trpc.performance.list.useQuery();
  const { data: allGoals } = trpc.goals.list.useQuery();
  const { data: employees } = trpc.employee.list.useQuery();
  const createReview = trpc.performance.create.useMutation({ onSuccess: () => { utils.performance.list.invalidate(); setReviewOpen(false); toast.success("Review created"); } });
  const updateReview = trpc.performance.update.useMutation({ onSuccess: () => { utils.performance.list.invalidate(); toast.success("Review updated"); } });
  const createGoal = trpc.goals.create.useMutation({ onSuccess: () => { utils.goals.list.invalidate(); setGoalOpen(false); toast.success("Goal created"); } });
  const updateGoal = trpc.goals.update.useMutation({ onSuccess: () => { utils.goals.list.invalidate(); toast.success("Goal updated"); } });

  const getEmployeeName = (id: number) => {
    const emp = employees?.find(e => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${id}`;
  };

  const ratingColor = (r: number) => r >= 4 ? "text-emerald-600" : r >= 3 ? "text-amber-600" : "text-red-600";

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-normal tracking-tight font-serif">Performance</h1>
            <p className="text-muted-foreground text-sm mt-1">Reviews, goals, and employee development</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
              <DialogTrigger asChild><Button variant="outline" className="gap-2"><Target size={16} />Add Goal</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Goal</DialogTitle></DialogHeader>
                <div className="space-y-3 mt-4">
                  <Select value={goalForm.employeeId} onValueChange={v => setGoalForm(p => ({ ...p, employeeId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                    <SelectContent>{(employees || []).map(e => <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input placeholder="Goal Title" value={goalForm.title} onChange={e => setGoalForm(p => ({ ...p, title: e.target.value }))} />
                  <Textarea placeholder="Description" value={goalForm.description} onChange={e => setGoalForm(p => ({ ...p, description: e.target.value }))} />
                  <div><label className="text-xs text-muted-foreground">Due Date</label><Input type="date" value={goalForm.dueDate} onChange={e => setGoalForm(p => ({ ...p, dueDate: e.target.value }))} /></div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setGoalOpen(false)}>Cancel</Button>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white" disabled={createGoal.isPending} onClick={() => {
                    if (!goalForm.employeeId || !goalForm.title) { toast.error("Employee and title required"); return; }
                    createGoal.mutate({ employeeId: Number(goalForm.employeeId), title: goalForm.title, description: goalForm.description || undefined, dueDate: goalForm.dueDate || undefined });
                  }}>{createGoal.isPending ? "Creating..." : "Create"}</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
              <DialogTrigger asChild><Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2"><Plus size={16} />New Review</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Performance Review</DialogTitle></DialogHeader>
                <div className="space-y-3 mt-4">
                  <Select value={reviewForm.employeeId} onValueChange={v => setReviewForm(p => ({ ...p, employeeId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Employee" /></SelectTrigger>
                    <SelectContent>{(employees || []).map(e => <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input placeholder="Review Period (e.g. Q1 2026)" value={reviewForm.reviewPeriod} onChange={e => setReviewForm(p => ({ ...p, reviewPeriod: e.target.value }))} />
                  <Input placeholder="Rating (1-5)" type="number" min="1" max="5" value={reviewForm.rating} onChange={e => setReviewForm(p => ({ ...p, rating: e.target.value }))} />
                  <Textarea placeholder="Comments" value={reviewForm.comments} onChange={e => setReviewForm(p => ({ ...p, comments: e.target.value }))} />
                  <Textarea placeholder="Strengths" value={reviewForm.strengths} onChange={e => setReviewForm(p => ({ ...p, strengths: e.target.value }))} />
                  <Textarea placeholder="Areas for Improvement" value={reviewForm.improvements} onChange={e => setReviewForm(p => ({ ...p, improvements: e.target.value }))} />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white" disabled={createReview.isPending} onClick={() => {
                    if (!reviewForm.employeeId || !reviewForm.reviewPeriod) { toast.error("Fill required fields"); return; }
                    createReview.mutate({ employeeId: Number(reviewForm.employeeId), reviewPeriod: reviewForm.reviewPeriod, rating: reviewForm.rating ? Number(reviewForm.rating) : undefined, comments: reviewForm.comments || undefined, strengths: reviewForm.strengths || undefined, improvements: reviewForm.improvements || undefined });
                  }}>{createReview.isPending ? "Creating..." : "Create"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-semibold text-teal-600">{(reviews || []).length}</p><p className="text-sm text-muted-foreground mt-1">Reviews</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-semibold text-purple-600">{(allGoals || []).length}</p><p className="text-sm text-muted-foreground mt-1">Goals</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-semibold text-amber-600">{(reviews || []).filter(r => r.status === "draft").length}</p><p className="text-sm text-muted-foreground mt-1">Pending</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-semibold text-emerald-600">{(allGoals || []).filter(g => g.status === "completed").length}</p><p className="text-sm text-muted-foreground mt-1">Goals Met</p></CardContent></Card>
        </div>

        <Tabs defaultValue="reviews">
          <TabsList><TabsTrigger value="reviews">Reviews</TabsTrigger><TabsTrigger value="goals">Goals</TabsTrigger></TabsList>

          <TabsContent value="reviews" className="mt-4">
            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
            ) : (reviews || []).length === 0 ? (
              <Card className="py-12 text-center"><CardContent><Star size={48} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">No performance reviews yet</p></CardContent></Card>
            ) : (
              <div className="space-y-3">
                {(reviews || []).map(review => (
                  <motion.div key={review.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-border/50 shadow-sm p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Star size={20} className="text-amber-600" /></div>
                      <div>
                        <p className="font-medium text-sm">{getEmployeeName(review.employeeId)}</p>
                        <p className="text-xs text-muted-foreground">{review.reviewPeriod} review</p>
                        {review.rating != null && (
                          <div className="flex items-center gap-1 mt-1">
                            {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= review.rating! ? "text-amber-400 fill-amber-400" : "text-gray-200"} />)}
                            <span className={`text-xs font-semibold ml-1 ${ratingColor(review.rating)}`}>{review.rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={review.status === "completed" ? "bg-emerald-50 text-emerald-700" : review.status === "submitted" ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-600"}>{review.status}</Badge>
                      {review.status === "draft" && <Button size="sm" variant="outline" onClick={() => updateReview.mutate({ id: review.id, status: "submitted" })}><Send size={14} className="mr-1" />Submit</Button>}
                      {review.status === "submitted" && <Button size="sm" variant="outline" onClick={() => updateReview.mutate({ id: review.id, status: "completed" })}><CheckCircle2 size={14} className="mr-1" />Complete</Button>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="goals" className="mt-4">
            {(allGoals || []).length === 0 ? (
              <Card className="py-12 text-center"><CardContent><Target size={48} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">No goals set yet</p></CardContent></Card>
            ) : (
              <div className="space-y-3">
                {(allGoals || []).map(goal => (
                  <motion.div key={goal.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-border/50 shadow-sm p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{goal.title}</p>
                        <p className="text-xs text-muted-foreground">{getEmployeeName(goal.employeeId)}{goal.dueDate ? ` · Due ${new Date(goal.dueDate).toLocaleDateString()}` : ""}</p>
                      </div>
                      <Badge variant="outline" className={goal.status === "completed" ? "bg-emerald-50 text-emerald-700" : goal.status === "in_progress" ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-600"}>{goal.status.replace("_", " ")}</Badge>
                    </div>
                    {goal.description && <p className="text-xs text-muted-foreground mb-2">{goal.description}</p>}
                    <div className="flex items-center gap-3">
                      <Progress value={goal.progress || 0} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-10 text-right">{goal.progress || 0}%</span>
                      {goal.status !== "completed" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => updateGoal.mutate({ id: goal.id, progress: Math.min((goal.progress || 0) + 25, 100) })}>+25%</Button>
                          <Button size="sm" variant="outline" className="text-xs h-7 text-emerald-600" onClick={() => updateGoal.mutate({ id: goal.id, status: "completed", progress: 100 })}>Done</Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
