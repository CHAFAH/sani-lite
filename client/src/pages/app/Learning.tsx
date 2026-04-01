/*
 * Learning — LMS with courses and assignments
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
import { Plus, BookOpen, GraduationCap, Trash2, Users, Clock } from "lucide-react";

const CATEGORIES = ["compliance", "technical", "leadership", "onboarding", "soft_skills", "product", "other"] as const;
const COURSE_TYPES = ["required", "optional", "recommended"] as const;

export default function LearningPage() {
  const [courseOpen, setCourseOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "technical" as string, duration: "", type: "optional" as typeof COURSE_TYPES[number] });
  const [assignForm, setAssignForm] = useState({ employeeId: "", courseId: "" });

  const utils = trpc.useUtils();
  const { data: courses, isLoading } = trpc.learning.listCourses.useQuery();
  const { data: assignments } = trpc.learning.listAssignments.useQuery();
  const { data: employees } = trpc.employee.list.useQuery();
  const createCourse = trpc.learning.createCourse.useMutation({ onSuccess: () => { utils.learning.listCourses.invalidate(); setCourseOpen(false); toast.success("Course created"); } });
  const deleteCourse = trpc.learning.deleteCourse.useMutation({ onSuccess: () => { utils.learning.listCourses.invalidate(); toast.success("Course deleted"); } });
  const assignCourse = trpc.learning.assignCourse.useMutation({ onSuccess: () => { utils.learning.listAssignments.invalidate(); setAssignOpen(false); toast.success("Course assigned"); } });
  const updateAssignment = trpc.learning.updateAssignment.useMutation({ onSuccess: () => { utils.learning.listAssignments.invalidate(); toast.success("Progress updated"); } });

  const getEmployeeName = (id: number) => {
    const emp = employees?.find((e: { id: number }) => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${id}`;
  };

  const getCourseName = (id: number) => {
    const c = courses?.find((c: { id: number }) => c.id === id);
    return c ? c.title : `Course #${id}`;
  };

  const catColor: Record<string, string> = { compliance: "bg-red-50 text-red-600", technical: "bg-blue-50 text-blue-600", leadership: "bg-purple-50 text-purple-600", onboarding: "bg-teal-50 text-teal-600", soft_skills: "bg-amber-50 text-amber-600", product: "bg-emerald-50 text-emerald-600", other: "bg-gray-50 text-gray-600" };

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-normal tracking-tight font-serif">Learning</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage training courses and employee development</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
              <DialogTrigger asChild><Button variant="outline" className="gap-2"><Users size={16} />Assign Course</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Assign Course</DialogTitle></DialogHeader>
                <div className="space-y-3 mt-4">
                  <Select value={assignForm.employeeId} onValueChange={v => setAssignForm(p => ({ ...p, employeeId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                    <SelectContent>{(employees || []).map((e: { id: number; firstName: string; lastName: string }) => <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={assignForm.courseId} onValueChange={v => setAssignForm(p => ({ ...p, courseId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                    <SelectContent>{(courses || []).map((c: { id: number; title: string }) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white" disabled={assignCourse.isPending} onClick={() => {
                    if (!assignForm.employeeId || !assignForm.courseId) { toast.error("Select both fields"); return; }
                    assignCourse.mutate({ employeeId: Number(assignForm.employeeId), courseId: Number(assignForm.courseId) });
                  }}>{assignCourse.isPending ? "Assigning..." : "Assign"}</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={courseOpen} onOpenChange={setCourseOpen}>
              <DialogTrigger asChild><Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2"><Plus size={16} />Add Course</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Course</DialogTitle></DialogHeader>
                <div className="space-y-3 mt-4">
                  <Input placeholder="Course Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                  <Textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-3">
                    <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input placeholder="Duration (minutes)" type="number" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
                  </div>
                  <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as typeof COURSE_TYPES[number] }))}>
                    <SelectTrigger><SelectValue placeholder="Course Type" /></SelectTrigger>
                    <SelectContent>{COURSE_TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setCourseOpen(false)}>Cancel</Button>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white" disabled={createCourse.isPending} onClick={() => {
                    if (!form.title) { toast.error("Title is required"); return; }
                    createCourse.mutate({ title: form.title, description: form.description || undefined, category: form.category, duration: form.duration ? Number(form.duration) : undefined, type: form.type });
                  }}>{createCourse.isPending ? "Creating..." : "Create"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-semibold text-teal-600">{(courses || []).length}</p><p className="text-sm text-muted-foreground mt-1">Courses</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-semibold text-purple-600">{(assignments || []).length}</p><p className="text-sm text-muted-foreground mt-1">Assignments</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-semibold text-emerald-600">{(assignments || []).filter((a: { status: string | null }) => a.status === "completed").length}</p><p className="text-sm text-muted-foreground mt-1">Completed</p></CardContent></Card>
        </div>

        <Tabs defaultValue="courses">
          <TabsList><TabsTrigger value="courses">Courses</TabsTrigger><TabsTrigger value="assignments">Assignments</TabsTrigger></TabsList>

          <TabsContent value="courses" className="mt-4">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
            ) : (courses || []).length === 0 ? (
              <Card className="py-12 text-center"><CardContent><BookOpen size={48} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">No courses yet</p></CardContent></Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(courses || []).map((course: { id: number; title: string; description: string | null; category: string | null; duration: number | null; type: string | null }) => {
                  const enrolled = (assignments || []).filter((a: { courseId: number }) => a.courseId === course.id).length;
                  return (
                    <motion.div key={course.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-border/50 shadow-sm p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><GraduationCap size={20} className="text-blue-600" /></div>
                          <div>
                            <p className="font-semibold text-sm">{course.title}</p>
                            <Badge variant="outline" className={`text-xs mt-0.5 ${catColor[course.category || "other"]}`}>{(course.category || "other").replace("_", " ")}</Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-red-500 h-7 w-7 p-0" onClick={() => { if (confirm("Delete?")) deleteCourse.mutate({ id: course.id }); }}><Trash2 size={12} /></Button>
                      </div>
                      {course.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{course.description}</p>}
                      <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground">
                        <span>{enrolled} enrolled</span>
                        <div className="flex items-center gap-2">
                          {course.duration && <span className="flex items-center gap-1"><Clock size={10} />{course.duration} min</span>}
                          {course.type === "required" && <Badge variant="outline" className="bg-red-50 text-red-600 text-xs">Required</Badge>}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="assignments" className="mt-4">
            {(assignments || []).length === 0 ? (
              <Card className="py-12 text-center"><CardContent><Users size={48} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">No assignments yet</p></CardContent></Card>
            ) : (
              <div className="space-y-3">
                {(assignments || []).map((a: { id: number; employeeId: number; courseId: number; status: string | null; progress: number | null }) => (
                  <div key={a.id} className="bg-white rounded-xl border border-border/50 shadow-sm p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><BookOpen size={18} className="text-purple-600" /></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{getEmployeeName(a.employeeId)}</p>
                        <p className="text-xs text-muted-foreground">{getCourseName(a.courseId)}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <Progress value={a.progress || 0} className="h-2 flex-1 max-w-[200px]" />
                          <span className="text-xs text-muted-foreground">{a.progress || 0}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={a.status === "completed" ? "bg-emerald-50 text-emerald-700" : a.status === "in_progress" ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-600"}>{(a.status || "assigned").replace("_", " ")}</Badge>
                      {a.status !== "completed" && (
                        <Button size="sm" variant="outline" onClick={() => {
                          const newProgress = Math.min((a.progress || 0) + 25, 100);
                          updateAssignment.mutate({ id: a.id, progress: newProgress, status: newProgress >= 100 ? "completed" : "in_progress" });
                        }}>+25%</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
