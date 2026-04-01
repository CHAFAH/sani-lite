/*
 * Admin module pages that wrap existing functionality in AdminLayout.
 * Each page reuses the existing tRPC procedures with admin-level access.
 */
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
  Heart, Plus, Trash2, Briefcase, GraduationCap, Star, Target, DollarSign,
  Megaphone, BarChart3, GitBranch, Shield, Building2, Check, X, Users,
  TrendingUp, Play, Edit, Eye,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import SsoConfiguration from "@/components/SsoConfiguration";

// ============ BENEFITS ============
export function AdminBenefitsPage() {
  const { data: plans = [] } = trpc.benefits.listPlans.useQuery();
  const { data: enrollments = [] } = trpc.benefits.listEnrollments.useQuery();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const utils = trpc.useUtils();
  const createPlanMut = trpc.benefits.createPlan.useMutation({ onSuccess: () => { utils.benefits.listPlans.invalidate(); toast.success("Plan created"); } });
  const deletePlanMut = trpc.benefits.deletePlan.useMutation({ onSuccess: () => { utils.benefits.listPlans.invalidate(); toast.success("Plan deleted"); } });
  const enrollMut = trpc.benefits.enroll.useMutation({ onSuccess: () => { utils.benefits.listEnrollments.invalidate(); toast.success("Enrolled"); } });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", type: "health" as any, description: "", provider: "", cost: "", employerContribution: "" });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Benefits Administration</h1><p className="text-sm text-slate-500 mt-1">{plans.length} plans, {enrollments.length} enrollments</p></div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild><Button className="bg-indigo-600 hover:bg-indigo-700"><Plus size={16} className="mr-2" />Add Plan</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Benefit Plan</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div><Label>Type</Label>
                  <Select value={form.type} onValueChange={(v: any) => setForm(p => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health">Health</SelectItem><SelectItem value="dental">Dental</SelectItem>
                      <SelectItem value="vision">Vision</SelectItem><SelectItem value="life">Life</SelectItem>
                      <SelectItem value="retirement">Retirement</SelectItem><SelectItem value="wellness">Wellness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Provider</Label><Input value={form.provider} onChange={e => setForm(p => ({ ...p, provider: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Cost</Label><Input value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} /></div>
                  <div><Label>Employer Contribution</Label><Input value={form.employerContribution} onChange={e => setForm(p => ({ ...p, employerContribution: e.target.value }))} /></div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={() => { if (!form.name) { toast.error("Name required"); return; } createPlanMut.mutate(form); setShowAdd(false); }} className="bg-indigo-600 hover:bg-indigo-700">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Tabs defaultValue="plans">
          <TabsList><TabsTrigger value="plans">Plans</TabsTrigger><TabsTrigger value="enrollments">Enrollments</TabsTrigger></TabsList>
          <TabsContent value="plans" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((p: any) => (
                <Card key={p.id} className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center"><Heart size={18} className="text-pink-600" /></div>
                        <div><h3 className="font-semibold text-slate-900">{p.name}</h3><p className="text-xs text-slate-500 capitalize">{p.type}</p></div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deletePlanMut.mutate({ id: p.id })}><Trash2 size={14} /></Button>
                    </div>
                    <div className="mt-3 text-xs text-slate-500 space-y-1">
                      {p.provider && <p>Provider: {p.provider}</p>}
                      {p.cost && <p>Cost: ${p.cost}/mo</p>}
                      {p.employerContribution && <p>Employer: ${p.employerContribution}/mo</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {plans.length === 0 && <div className="col-span-full text-center py-12 text-slate-400"><Heart size={40} className="mx-auto mb-3 text-slate-300" /><p>No benefit plans yet</p></div>}
            </div>
          </TabsContent>
          <TabsContent value="enrollments" className="mt-4">
            <Card className="border-0 shadow-sm"><CardContent className="p-0">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Enrolled</th>
                </tr></thead>
                <tbody>
                  {enrollments.map((en: any) => {
                    const emp = employees.find((e: any) => e.id === en.employeeId);
                    const plan = plans.find((p: any) => p.id === en.planId);
                    return (
                      <tr key={en.id} className="border-b border-slate-50">
                        <td className="py-3 px-4 font-medium text-slate-900">{emp ? `${emp.firstName} ${emp.lastName}` : `#${en.employeeId}`}</td>
                        <td className="py-3 px-4 text-slate-600">{plan?.name || `#${en.planId}`}</td>
                        <td className="py-3 px-4"><Badge variant="outline" className="text-xs capitalize">{en.status}</Badge></td>
                        <td className="py-3 px-4 text-xs text-slate-500">{new Date(en.enrolledAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                  {enrollments.length === 0 && <tr><td colSpan={4} className="py-12 text-center text-slate-400">No enrollments</td></tr>}
                </tbody>
              </table>
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

// ============ HIRING ============
export function AdminHiringPage() {
  const { data: postings = [] } = trpc.jobPosting.list.useQuery();
  const { data: candidates = [] } = trpc.hiring.list.useQuery();
  const utils = trpc.useUtils();
  const createPostingMut = trpc.jobPosting.create.useMutation({ onSuccess: () => { utils.jobPosting.list.invalidate(); toast.success("Job posted"); } });
  const updateStatusMut = trpc.hiring.updateStatus.useMutation({ onSuccess: () => { utils.hiring.list.invalidate(); toast.success("Status updated"); } });
  const createCandidateMut = trpc.hiring.create.useMutation({ onSuccess: () => { utils.hiring.list.invalidate(); toast.success("Candidate added"); } });

  const [showAddJob, setShowAddJob] = useState(false);
  const [jobForm, setJobForm] = useState({ title: "", department: "", location: "", type: "full_time" as any, description: "" });
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [candForm, setCandForm] = useState({ jobTitle: "", candidateName: "", candidateEmail: "", source: "" });

  const stageColors: Record<string, string> = { applied: "bg-slate-100 text-slate-700", screening: "bg-blue-50 text-blue-700", interview: "bg-purple-50 text-purple-700", offer: "bg-amber-50 text-amber-700", hired: "bg-emerald-50 text-emerald-700", rejected: "bg-red-50 text-red-600" };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Hiring</h1><p className="text-sm text-slate-500 mt-1">{postings.length} positions, {candidates.length} candidates</p></div>
          <div className="flex gap-2">
            <Dialog open={showAddCandidate} onOpenChange={setShowAddCandidate}>
              <DialogTrigger asChild><Button variant="outline"><Plus size={16} className="mr-2" />Add Candidate</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Candidate</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div><Label>Job Title *</Label><Input value={candForm.jobTitle} onChange={e => setCandForm(p => ({ ...p, jobTitle: e.target.value }))} /></div>
                  <div><Label>Name *</Label><Input value={candForm.candidateName} onChange={e => setCandForm(p => ({ ...p, candidateName: e.target.value }))} /></div>
                  <div><Label>Email *</Label><Input type="email" value={candForm.candidateEmail} onChange={e => setCandForm(p => ({ ...p, candidateEmail: e.target.value }))} /></div>
                  <div><Label>Source</Label><Input value={candForm.source} onChange={e => setCandForm(p => ({ ...p, source: e.target.value }))} placeholder="LinkedIn, Referral, etc." /></div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button onClick={() => { if (!candForm.candidateName || !candForm.candidateEmail) { toast.error("Name and email required"); return; } createCandidateMut.mutate(candForm); setShowAddCandidate(false); }} className="bg-indigo-600 hover:bg-indigo-700">Add</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={showAddJob} onOpenChange={setShowAddJob}>
              <DialogTrigger asChild><Button className="bg-indigo-600 hover:bg-indigo-700"><Plus size={16} className="mr-2" />Post Job</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Job Posting</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div><Label>Title *</Label><Input value={jobForm.title} onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Department</Label><Input value={jobForm.department} onChange={e => setJobForm(p => ({ ...p, department: e.target.value }))} /></div>
                    <div><Label>Location</Label><Input value={jobForm.location} onChange={e => setJobForm(p => ({ ...p, location: e.target.value }))} /></div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button onClick={() => { if (!jobForm.title) { toast.error("Title required"); return; } createPostingMut.mutate(jobForm); setShowAddJob(false); }} className="bg-indigo-600 hover:bg-indigo-700">Post</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Tabs defaultValue="pipeline">
          <TabsList><TabsTrigger value="pipeline">Pipeline</TabsTrigger><TabsTrigger value="postings">Job Postings</TabsTrigger></TabsList>
          <TabsContent value="pipeline" className="mt-4">
            <Card className="border-0 shadow-sm"><CardContent className="p-0">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Candidate</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Position</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Source</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Stage</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-500">Actions</th>
                </tr></thead>
                <tbody>
                  {candidates.map((c: any) => (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-3 px-4"><div><p className="font-medium text-slate-900">{c.candidateName}</p><p className="text-xs text-slate-400">{c.candidateEmail}</p></div></td>
                      <td className="py-3 px-4 text-slate-600">{c.jobTitle}</td>
                      <td className="py-3 px-4 text-slate-500 text-xs">{c.source || "—"}</td>
                      <td className="py-3 px-4"><Badge variant="outline" className={`text-xs capitalize ${stageColors[c.status] || ""}`}>{c.status}</Badge></td>
                      <td className="py-3 px-4 text-right">
                        {c.status !== "hired" && c.status !== "rejected" && (
                          <Select onValueChange={(v: any) => updateStatusMut.mutate({ id: c.id, status: v })}>
                            <SelectTrigger className="w-[120px] ml-auto"><SelectValue placeholder="Move to" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="screening">Screening</SelectItem>
                              <SelectItem value="interview">Interview</SelectItem>
                              <SelectItem value="offer">Offer</SelectItem>
                              <SelectItem value="hired">Hired</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                    </tr>
                  ))}
                  {candidates.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-slate-400">No candidates yet</td></tr>}
                </tbody>
              </table>
            </CardContent></Card>
          </TabsContent>
          <TabsContent value="postings" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {postings.map((p: any) => (
                <Card key={p.id} className="border-0 shadow-sm"><CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div><h3 className="font-semibold text-slate-900">{p.title}</h3><p className="text-xs text-slate-500 mt-1">{[p.department, p.location].filter(Boolean).join(" · ")}</p></div>
                    <Badge variant="outline" className="text-xs capitalize">{p.status}</Badge>
                  </div>
                </CardContent></Card>
              ))}
              {postings.length === 0 && <div className="col-span-full text-center py-12 text-slate-400">No job postings</div>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

// ============ LEARNING ============
export function AdminLearningPage() {
  const { data: courses = [] } = trpc.learning.listCourses.useQuery();
  const { data: assignments = [] } = trpc.learning.listAssignments.useQuery();
  const utils = trpc.useUtils();
  const createCourseMut = trpc.learning.createCourse.useMutation({ onSuccess: () => { utils.learning.listCourses.invalidate(); toast.success("Course created"); } });
  const deleteCourseMut = trpc.learning.deleteCourse.useMutation({ onSuccess: () => { utils.learning.listCourses.invalidate(); toast.success("Deleted"); } });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "", duration: 60, type: "optional" as any });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Learning & Development</h1><p className="text-sm text-slate-500 mt-1">{courses.length} courses, {assignments.length} assignments</p></div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild><Button className="bg-indigo-600 hover:bg-indigo-700"><Plus size={16} className="mr-2" />Add Course</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Course</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
                <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Category</Label><Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} /></div>
                  <div><Label>Duration (min)</Label><Input type="number" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: Number(e.target.value) }))} /></div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={() => { if (!form.title) { toast.error("Title required"); return; } createCourseMut.mutate(form); setShowAdd(false); }} className="bg-indigo-600 hover:bg-indigo-700">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c: any) => (
            <Card key={c.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center"><GraduationCap size={18} className="text-violet-600" /></div>
                    <div><h3 className="font-semibold text-slate-900">{c.title}</h3><p className="text-xs text-slate-500 capitalize">{c.category || "General"} · {c.duration}min</p></div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteCourseMut.mutate({ id: c.id })}><Trash2 size={14} /></Button>
                </div>
                {c.description && <p className="text-xs text-slate-500 mt-3 line-clamp-2">{c.description}</p>}
                <Badge variant="outline" className="mt-3 text-xs capitalize">{c.type}</Badge>
              </CardContent>
            </Card>
          ))}
          {courses.length === 0 && <div className="col-span-full text-center py-12 text-slate-400"><GraduationCap size={40} className="mx-auto mb-3 text-slate-300" /><p>No courses yet</p></div>}
        </div>
      </div>
    </AdminLayout>
  );
}

// ============ PERFORMANCE ============
export function AdminPerformancePage() {
  const { data: reviews = [] } = trpc.performance.list.useQuery();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const utils = trpc.useUtils();
  const createMut = trpc.performance.create.useMutation({ onSuccess: () => { utils.performance.list.invalidate(); toast.success("Review created"); } });
  const updateMut = trpc.performance.update.useMutation({ onSuccess: () => { utils.performance.list.invalidate(); toast.success("Updated"); } });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ employeeId: 0, reviewPeriod: "", rating: 3 });

  const getEmpName = (id: number) => { const e = employees.find((e: any) => e.id === id); return e ? `${e.firstName} ${e.lastName}` : `#${id}`; };
  const statusColors: Record<string, string> = { draft: "bg-slate-50 text-slate-600", submitted: "bg-blue-50 text-blue-700", completed: "bg-emerald-50 text-emerald-700" };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Performance Reviews</h1><p className="text-sm text-slate-500 mt-1">{reviews.length} reviews</p></div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild><Button className="bg-indigo-600 hover:bg-indigo-700"><Plus size={16} className="mr-2" />New Review</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Performance Review</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Employee</Label>
                  <Select onValueChange={(v) => setForm(p => ({ ...p, employeeId: Number(v) }))}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>{employees.map((e: any) => <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Review Period</Label><Input value={form.reviewPeriod} onChange={e => setForm(p => ({ ...p, reviewPeriod: e.target.value }))} placeholder="e.g. Q1 2026" /></div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={() => { if (!form.employeeId) { toast.error("Select employee"); return; } createMut.mutate(form); setShowAdd(false); }} className="bg-indigo-600 hover:bg-indigo-700">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Card className="border-0 shadow-sm"><CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100">
              <th className="text-left py-3 px-4 font-medium text-slate-500">Employee</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Period</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Rating</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
              <th className="text-right py-3 px-4 font-medium text-slate-500">Actions</th>
            </tr></thead>
            <tbody>
              {reviews.map((r: any) => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-slate-900">{getEmpName(r.employeeId)}</td>
                  <td className="py-3 px-4 text-slate-600">{r.reviewPeriod}</td>
                  <td className="py-3 px-4">{r.rating ? <span className="flex items-center gap-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />)}</span> : "—"}</td>
                  <td className="py-3 px-4"><Badge variant="outline" className={`text-xs capitalize ${statusColors[r.status] || ""}`}>{r.status}</Badge></td>
                  <td className="py-3 px-4 text-right">
                    {r.status === "draft" && <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => updateMut.mutate({ id: r.id, status: "submitted" })}>Submit</Button>}
                    {r.status === "submitted" && <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => updateMut.mutate({ id: r.id, status: "completed" })}>Complete</Button>}
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-slate-400">No reviews yet</td></tr>}
            </tbody>
          </table>
        </CardContent></Card>
      </div>
    </AdminLayout>
  );
}

// ============ GOALS ============
export function AdminGoalsPage() {
  const { data: goals = [] } = trpc.goals.list.useQuery();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const utils = trpc.useUtils();
  const createMut = trpc.goals.create.useMutation({ onSuccess: () => { utils.goals.list.invalidate(); toast.success("Goal created"); } });
  const deleteMut = trpc.goals.delete.useMutation({ onSuccess: () => { utils.goals.list.invalidate(); toast.success("Deleted"); } });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ employeeId: 0, title: "", description: "", type: "individual" as any });

  const getEmpName = (id: number) => { const e = employees.find((e: any) => e.id === id); return e ? `${e.firstName} ${e.lastName}` : `#${id}`; };
  const statusColors: Record<string, string> = { not_started: "bg-slate-50 text-slate-600", in_progress: "bg-blue-50 text-blue-700", completed: "bg-emerald-50 text-emerald-700", cancelled: "bg-red-50 text-red-600" };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Goals & OKRs</h1><p className="text-sm text-slate-500 mt-1">{goals.length} goals</p></div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild><Button className="bg-indigo-600 hover:bg-indigo-700"><Plus size={16} className="mr-2" />Create Goal</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Goal</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Employee</Label>
                  <Select onValueChange={(v) => setForm(p => ({ ...p, employeeId: Number(v) }))}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>{employees.map((e: any) => <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
                <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
                <div><Label>Type</Label>
                  <Select value={form.type} onValueChange={(v: any) => setForm(p => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="individual">Individual</SelectItem><SelectItem value="team">Team</SelectItem><SelectItem value="company">Company</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={() => { if (!form.title || !form.employeeId) { toast.error("Employee and title required"); return; } createMut.mutate(form); setShowAdd(false); }} className="bg-indigo-600 hover:bg-indigo-700">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Card className="border-0 shadow-sm"><CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100">
              <th className="text-left py-3 px-4 font-medium text-slate-500">Goal</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Employee</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Type</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Progress</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
              <th className="text-right py-3 px-4 font-medium text-slate-500">Actions</th>
            </tr></thead>
            <tbody>
              {goals.map((g: any) => (
                <tr key={g.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 px-4"><div><p className="font-medium text-slate-900">{g.title}</p>{g.description && <p className="text-xs text-slate-400 line-clamp-1">{g.description}</p>}</div></td>
                  <td className="py-3 px-4 text-slate-600">{getEmpName(g.employeeId)}</td>
                  <td className="py-3 px-4"><Badge variant="outline" className="text-xs capitalize">{g.type}</Badge></td>
                  <td className="py-3 px-4"><div className="flex items-center gap-2"><div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${g.progress || 0}%` }} /></div><span className="text-xs text-slate-500">{g.progress || 0}%</span></div></td>
                  <td className="py-3 px-4"><Badge variant="outline" className={`text-xs capitalize ${statusColors[g.status] || ""}`}>{g.status?.replace("_", " ")}</Badge></td>
                  <td className="py-3 px-4 text-right"><Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMut.mutate({ id: g.id })}><Trash2 size={14} /></Button></td>
                </tr>
              ))}
              {goals.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-slate-400">No goals yet</td></tr>}
            </tbody>
          </table>
        </CardContent></Card>
      </div>
    </AdminLayout>
  );
}

// ============ COMPENSATION ============
export function AdminCompensationPage() {
  const { data: records = [] } = trpc.compensation.list.useQuery();
  const { data: bands = [] } = trpc.salaryBand.list.useQuery();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const utils = trpc.useUtils();
  const createBandMut = trpc.salaryBand.create.useMutation({ onSuccess: () => { utils.salaryBand.list.invalidate(); toast.success("Band created"); } });
  const deleteBandMut = trpc.salaryBand.delete.useMutation({ onSuccess: () => { utils.salaryBand.list.invalidate(); toast.success("Deleted"); } });
  const approveMut = trpc.compensation.approve.useMutation({ onSuccess: () => { utils.compensation.list.invalidate(); toast.success("Approved"); } });

  const [showAddBand, setShowAddBand] = useState(false);
  const [bandForm, setBandForm] = useState({ level: "", title: "", department: "", minSalary: "", midSalary: "", maxSalary: "", currency: "USD" });

  const getEmpName = (id: number) => { const e = employees.find((e: any) => e.id === id); return e ? `${e.firstName} ${e.lastName}` : `#${id}`; };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-slate-900">Compensation</h1><p className="text-sm text-slate-500 mt-1">Salary bands and compensation records</p></div>
        <Tabs defaultValue="bands">
          <TabsList><TabsTrigger value="bands">Salary Bands</TabsTrigger><TabsTrigger value="records">Records</TabsTrigger></TabsList>
          <TabsContent value="bands" className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Dialog open={showAddBand} onOpenChange={setShowAddBand}>
                <DialogTrigger asChild><Button className="bg-indigo-600 hover:bg-indigo-700"><Plus size={16} className="mr-2" />Add Band</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create Salary Band</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Level *</Label><Input value={bandForm.level} onChange={e => setBandForm(p => ({ ...p, level: e.target.value }))} placeholder="e.g. L4" /></div>
                      <div><Label>Title *</Label><Input value={bandForm.title} onChange={e => setBandForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Senior Engineer" /></div>
                    </div>
                    <div><Label>Department</Label><Input value={bandForm.department} onChange={e => setBandForm(p => ({ ...p, department: e.target.value }))} /></div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><Label>Min *</Label><Input value={bandForm.minSalary} onChange={e => setBandForm(p => ({ ...p, minSalary: e.target.value }))} /></div>
                      <div><Label>Mid *</Label><Input value={bandForm.midSalary} onChange={e => setBandForm(p => ({ ...p, midSalary: e.target.value }))} /></div>
                      <div><Label>Max *</Label><Input value={bandForm.maxSalary} onChange={e => setBandForm(p => ({ ...p, maxSalary: e.target.value }))} /></div>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={() => { if (!bandForm.level || !bandForm.title) { toast.error("Level and title required"); return; } createBandMut.mutate(bandForm); setShowAddBand(false); }} className="bg-indigo-600 hover:bg-indigo-700">Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <Card className="border-0 shadow-sm"><CardContent className="p-0">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Level</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Department</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Range</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-500">Actions</th>
                </tr></thead>
                <tbody>
                  {bands.map((b: any) => (
                    <tr key={b.id} className="border-b border-slate-50">
                      <td className="py-3 px-4 font-semibold text-indigo-600">{b.level}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{b.title}</td>
                      <td className="py-3 px-4 text-slate-600">{b.department || "All"}</td>
                      <td className="py-3 px-4 text-slate-600">{b.currency} {b.minSalary} — {b.maxSalary}</td>
                      <td className="py-3 px-4 text-right"><Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteBandMut.mutate({ id: b.id })}><Trash2 size={14} /></Button></td>
                    </tr>
                  ))}
                  {bands.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-slate-400">No salary bands</td></tr>}
                </tbody>
              </table>
            </CardContent></Card>
          </TabsContent>
          <TabsContent value="records" className="mt-4">
            <Card className="border-0 shadow-sm"><CardContent className="p-0">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Employee</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Effective</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-500">Actions</th>
                </tr></thead>
                <tbody>
                  {records.map((r: any) => (
                    <tr key={r.id} className="border-b border-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-900">{getEmpName(r.employeeId)}</td>
                      <td className="py-3 px-4 capitalize text-slate-600">{r.type?.replace("_", " ")}</td>
                      <td className="py-3 px-4 font-semibold">{r.currency} {r.amount}</td>
                      <td className="py-3 px-4 text-xs text-slate-500">{new Date(r.effectiveDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4"><Badge variant="outline" className="text-xs capitalize">{r.status}</Badge></td>
                      <td className="py-3 px-4 text-right">{r.status === "pending" && <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => approveMut.mutate({ id: r.id })}><Check size={14} className="mr-1" />Approve</Button>}</td>
                    </tr>
                  ))}
                  {records.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-slate-400">No compensation records</td></tr>}
                </tbody>
              </table>
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

// ============ ANNOUNCEMENTS ============
export function AdminAnnouncementsPage() {
  const { data: announcements = [] } = trpc.announcements.list.useQuery();
  const utils = trpc.useUtils();
  const createMut = trpc.announcements.create.useMutation({ onSuccess: () => { utils.announcements.list.invalidate(); toast.success("Announcement created"); } });
  const deleteMut = trpc.announcements.delete.useMutation({ onSuccess: () => { utils.announcements.list.invalidate(); toast.success("Deleted"); } });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", type: "general" as any });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Announcements</h1><p className="text-sm text-slate-500 mt-1">{announcements.length} announcements</p></div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild><Button className="bg-indigo-600 hover:bg-indigo-700"><Plus size={16} className="mr-2" />New Announcement</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Announcement</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
                <div><Label>Content *</Label><textarea className="w-full border rounded-lg p-3 text-sm min-h-[100px]" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} /></div>
                <div><Label>Type</Label>
                  <Select value={form.type} onValueChange={(v: any) => setForm(p => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="general">General</SelectItem><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="celebration">Celebration</SelectItem><SelectItem value="policy">Policy</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={() => { if (!form.title || !form.content) { toast.error("Title and content required"); return; } createMut.mutate(form); setShowAdd(false); }} className="bg-indigo-600 hover:bg-indigo-700">Publish</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-3">
          {announcements.map((a: any) => (
            <Card key={a.id} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1"><Badge variant="outline" className="text-xs capitalize">{a.type}</Badge><span className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleDateString()}</span></div>
                    <h3 className="font-semibold text-slate-900">{a.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{a.content}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMut.mutate({ id: a.id })}><Trash2 size={14} /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {announcements.length === 0 && <div className="text-center py-12 text-slate-400"><Megaphone size={40} className="mx-auto mb-3 text-slate-300" /><p>No announcements yet</p></div>}
        </div>
      </div>
    </AdminLayout>
  );
}

// ============ ANALYTICS ============
export function AdminAnalyticsPage() {
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const { data: timeOff = [] } = trpc.timeOff.list.useQuery();
  const { data: goals = [] } = trpc.goals.list.useQuery();
  const { data: reviews = [] } = trpc.performance.list.useQuery();

  const activeCount = employees.filter((e: any) => e.status === "active").length;
  const deptBreakdown = employees.reduce((acc: Record<string, number>, e: any) => { acc[e.department || "Unassigned"] = (acc[e.department || "Unassigned"] || 0) + 1; return acc; }, {});
  const avgRating = reviews.filter((r: any) => r.rating).reduce((sum: number, r: any, _, arr: any[]) => sum + (r.rating || 0) / arr.length, 0);
  const goalCompletion = goals.length > 0 ? Math.round((goals.filter((g: any) => g.status === "completed").length / goals.length) * 100) : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-slate-900">Analytics & Reports</h1><p className="text-sm text-slate-500 mt-1">Organization insights</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm"><CardContent className="p-5"><p className="text-sm text-slate-500">Total Employees</p><p className="text-3xl font-bold text-slate-900 mt-1">{employees.length}</p><p className="text-xs text-emerald-600 mt-1">{activeCount} active</p></CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-5"><p className="text-sm text-slate-500">Time Off Requests</p><p className="text-3xl font-bold text-slate-900 mt-1">{timeOff.length}</p><p className="text-xs text-amber-600 mt-1">{timeOff.filter((t: any) => t.status === "pending").length} pending</p></CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-5"><p className="text-sm text-slate-500">Avg Performance</p><p className="text-3xl font-bold text-slate-900 mt-1">{avgRating.toFixed(1)}</p><p className="text-xs text-slate-500 mt-1">out of 5.0</p></CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-5"><p className="text-sm text-slate-500">Goal Completion</p><p className="text-3xl font-bold text-slate-900 mt-1">{goalCompletion}%</p><p className="text-xs text-slate-500 mt-1">{goals.filter((g: any) => g.status === "completed").length}/{goals.length} goals</p></CardContent></Card>
        </div>
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">Department Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(deptBreakdown).sort((a, b) => b[1] - a[1]).map(([dept, count]) => (
                <div key={dept} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-32 truncate">{dept}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(count / employees.length) * 100}%` }} /></div>
                  <span className="text-sm font-medium text-slate-900 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

// ============ WORKFLOWS ============
export function AdminWorkflowsPage() {
  const { data: workflows = [] } = trpc.workflow.list.useQuery();
  const { data: instances = [] } = trpc.workflow.listInstances.useQuery();
  const utils = trpc.useUtils();
  const createMut = trpc.workflow.create.useMutation({ onSuccess: () => { utils.workflow.list.invalidate(); toast.success("Workflow created"); } });
  const deleteMut = trpc.workflow.delete.useMutation({ onSuccess: () => { utils.workflow.list.invalidate(); toast.success("Deleted"); } });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", triggerType: "new_hire" as any });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Workflows</h1><p className="text-sm text-slate-500 mt-1">{workflows.length} workflows, {instances.length} instances</p></div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild><Button className="bg-indigo-600 hover:bg-indigo-700"><Plus size={16} className="mr-2" />Create Workflow</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Workflow</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
                <div><Label>Trigger</Label>
                  <Select value={form.triggerType} onValueChange={(v: any) => setForm(p => ({ ...p, triggerType: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new_hire">New Hire</SelectItem><SelectItem value="offboarding">Offboarding</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem><SelectItem value="time_off">Time Off</SelectItem>
                      <SelectItem value="review_cycle">Review Cycle</SelectItem><SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={() => { if (!form.name) { toast.error("Name required"); return; } createMut.mutate(form); setShowAdd(false); }} className="bg-indigo-600 hover:bg-indigo-700">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflows.map((w: any) => (
            <Card key={w.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center"><GitBranch size={18} className="text-cyan-600" /></div>
                    <div><h3 className="font-semibold text-slate-900">{w.name}</h3><p className="text-xs text-slate-500 capitalize">{w.triggerType?.replace("_", " ")}</p></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className={`text-xs ${w.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"}`}>{w.isActive ? "Active" : "Inactive"}</Badge>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMut.mutate({ id: w.id })}><Trash2 size={14} /></Button>
                  </div>
                </div>
                {w.description && <p className="text-xs text-slate-500 mt-3">{w.description}</p>}
              </CardContent>
            </Card>
          ))}
          {workflows.length === 0 && <div className="col-span-full text-center py-12 text-slate-400"><GitBranch size={40} className="mx-auto mb-3 text-slate-300" /><p>No workflows yet</p></div>}
        </div>
      </div>
    </AdminLayout>
  );
}

// ============ SSO ============
export function AdminSsoPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-slate-900">SSO Configuration</h1><p className="text-sm text-slate-500 mt-1">Configure single sign-on providers</p></div>
        <SsoConfiguration />
      </div>
    </AdminLayout>
  );
}

// ============ COMPANY SETTINGS ============
export function AdminCompanyPage() {
  const { data: subscription } = trpc.subscription.getByCompanyId.useQuery();
  const { data: seatCheck } = trpc.subscription.checkSeatAvailability.useQuery();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-slate-900">Company Settings</h1><p className="text-sm text-slate-500 mt-1">Organization configuration</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Subscription</CardTitle></CardHeader>
            <CardContent>
              {subscription ? (
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-sm text-slate-500">Plan</span><Badge className="capitalize">{subscription.tier}</Badge></div>
                  <div className="flex justify-between"><span className="text-sm text-slate-500">Seats</span><span className="text-sm font-medium">{subscription.seats}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-slate-500">Price</span><span className="text-sm font-medium">${subscription.price}/{subscription.billingCycle}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-slate-500">Status</span><Badge variant="outline" className="capitalize">{subscription.status}</Badge></div>
                  <div className="flex justify-between"><span className="text-sm text-slate-500">Seats Available</span><Badge variant="outline" className={seatCheck?.available ? "text-emerald-600" : "text-red-600"}>{seatCheck?.available ? "Yes" : "No"}</Badge></div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No subscription found</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => toast("Feature coming soon")}><Building2 size={16} className="mr-2" />Edit Company Profile</Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => toast("Feature coming soon")}><Shield size={16} className="mr-2" />Security Settings</Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => toast("Feature coming soon")}><Users size={16} className="mr-2" />Manage Integrations</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
