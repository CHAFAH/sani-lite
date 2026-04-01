/*
 * Hiring — Job postings and candidate management
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
import { toast } from "sonner";
import { Plus, Briefcase, MapPin, Trash2, UserPlus, ArrowRight } from "lucide-react";

const DEPARTMENTS = ["Engineering", "Product", "Design", "Marketing", "Sales", "HR", "Finance", "Operations"];
const JOB_TYPES = ["full_time", "part_time", "contract", "internship"] as const;

export default function HiringPage() {
  const [jobOpen, setJobOpen] = useState(false);
  const [candOpen, setCandOpen] = useState(false);
  const [form, setForm] = useState({ title: "", department: "", location: "", description: "", requirements: "", salaryMin: "", salaryMax: "", currency: "USD", type: "full_time" as typeof JOB_TYPES[number] });
  const [candForm, setCandForm] = useState({ jobPostingId: "", jobTitle: "", candidateName: "", candidateEmail: "", candidatePhone: "", resumeUrl: "", department: "" });

  const utils = trpc.useUtils();
  const { data: postings, isLoading } = trpc.jobPosting.list.useQuery();
  const { data: hiringRecords } = trpc.hiring.list.useQuery();
  const createJob = trpc.jobPosting.create.useMutation({ onSuccess: () => { utils.jobPosting.list.invalidate(); setJobOpen(false); toast.success("Job posted"); } });
  const updateJob = trpc.jobPosting.update.useMutation({ onSuccess: () => { utils.jobPosting.list.invalidate(); toast.success("Job updated"); } });
  const deleteJob = trpc.jobPosting.delete.useMutation({ onSuccess: () => { utils.jobPosting.list.invalidate(); toast.success("Job deleted"); } });
  const addCandidate = trpc.hiring.create.useMutation({ onSuccess: () => { utils.hiring.list.invalidate(); setCandOpen(false); toast.success("Candidate added"); } });
  const updateCandStatus = trpc.hiring.updateStatus.useMutation({ onSuccess: () => { utils.hiring.list.invalidate(); toast.success("Status updated"); } });
  const deleteCandidate = trpc.hiring.delete.useMutation({ onSuccess: () => { utils.hiring.list.invalidate(); toast.success("Candidate removed"); } });

  const openJobs = (postings || []).filter((p: { status: string }) => p.status === "open");
  const totalCandidates = (hiringRecords || []).length;

  const stageColor: Record<string, string> = { applied: "bg-blue-50 text-blue-700", screening: "bg-purple-50 text-purple-700", interview: "bg-amber-50 text-amber-700", offer: "bg-teal-50 text-teal-700", hired: "bg-emerald-50 text-emerald-700", rejected: "bg-red-50 text-red-600" };

  const stageOrder = ["applied", "screening", "interview", "offer", "hired"];
  const advanceStage = (currentStage: string) => {
    const idx = stageOrder.indexOf(currentStage);
    return idx >= 0 && idx < stageOrder.length - 1 ? stageOrder[idx + 1] : null;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-normal tracking-tight font-serif">Hiring</h1>
            <p className="text-muted-foreground text-sm mt-1">{openJobs.length} open positions · {totalCandidates} candidates</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={candOpen} onOpenChange={setCandOpen}>
              <DialogTrigger asChild><Button variant="outline" className="gap-2"><UserPlus size={16} />Add Candidate</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Candidate</DialogTitle></DialogHeader>
                <div className="space-y-3 mt-4">
                  <Select value={candForm.jobPostingId} onValueChange={v => {
                    const job = openJobs.find((j: { id: number }) => j.id === Number(v));
                    setCandForm(p => ({ ...p, jobPostingId: v, jobTitle: job?.title || "", department: job?.department || "" }));
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select Job" /></SelectTrigger>
                    <SelectContent>{openJobs.map((j: { id: number; title: string }) => <SelectItem key={j.id} value={String(j.id)}>{j.title}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input placeholder="Candidate Full Name" value={candForm.candidateName} onChange={e => setCandForm(p => ({ ...p, candidateName: e.target.value }))} />
                  <Input placeholder="Email" type="email" value={candForm.candidateEmail} onChange={e => setCandForm(p => ({ ...p, candidateEmail: e.target.value }))} />
                  <Input placeholder="Phone" value={candForm.candidatePhone} onChange={e => setCandForm(p => ({ ...p, candidatePhone: e.target.value }))} />
                  <Input placeholder="Resume URL" value={candForm.resumeUrl} onChange={e => setCandForm(p => ({ ...p, resumeUrl: e.target.value }))} />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setCandOpen(false)}>Cancel</Button>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white" disabled={addCandidate.isPending} onClick={() => {
                    if (!candForm.jobTitle || !candForm.candidateName || !candForm.candidateEmail) { toast.error("Fill required fields"); return; }
                    addCandidate.mutate({
                      jobPostingId: candForm.jobPostingId ? Number(candForm.jobPostingId) : undefined,
                      jobTitle: candForm.jobTitle,
                      candidateName: candForm.candidateName,
                      candidateEmail: candForm.candidateEmail,
                      candidatePhone: candForm.candidatePhone || undefined,
                      resumeUrl: candForm.resumeUrl || undefined,
                      department: candForm.department || undefined,
                    });
                  }}>{addCandidate.isPending ? "Adding..." : "Add"}</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={jobOpen} onOpenChange={setJobOpen}>
              <DialogTrigger asChild><Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2"><Plus size={16} />Post Job</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Post a Job</DialogTitle></DialogHeader>
                <div className="space-y-3 mt-4">
                  <Input placeholder="Job Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-3">
                    <Select value={form.department} onValueChange={v => setForm(p => ({ ...p, department: v }))}>
                      <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                      <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input placeholder="Location" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                  </div>
                  <Textarea placeholder="Job Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                  <Textarea placeholder="Requirements" value={form.requirements} onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))} />
                  <div className="grid grid-cols-3 gap-3">
                    <Input placeholder="Min Salary" type="number" value={form.salaryMin} onChange={e => setForm(p => ({ ...p, salaryMin: e.target.value }))} />
                    <Input placeholder="Max Salary" type="number" value={form.salaryMax} onChange={e => setForm(p => ({ ...p, salaryMax: e.target.value }))} />
                    <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as typeof JOB_TYPES[number] }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{JOB_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setJobOpen(false)}>Cancel</Button>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white" disabled={createJob.isPending} onClick={() => {
                    if (!form.title) { toast.error("Title is required"); return; }
                    createJob.mutate({ title: form.title, department: form.department || undefined, location: form.location || undefined, description: form.description || undefined, requirements: form.requirements || undefined, salaryMin: form.salaryMin || undefined, salaryMax: form.salaryMax || undefined, currency: form.currency, type: form.type });
                  }}>{createJob.isPending ? "Posting..." : "Post Job"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <Tabs defaultValue="jobs">
          <TabsList><TabsTrigger value="jobs">Job Postings</TabsTrigger><TabsTrigger value="candidates">Candidates</TabsTrigger></TabsList>

          <TabsContent value="jobs" className="mt-4">
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
            ) : (postings || []).length === 0 ? (
              <Card className="py-12 text-center"><CardContent><Briefcase size={48} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">No job postings yet</p></CardContent></Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {(postings || []).map(job => {
                  const jobCandidates = (hiringRecords || []).filter((c: { jobPostingId: number | null }) => c.jobPostingId === job.id);
                  return (
                    <motion.div key={job.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-border/50 shadow-sm p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{job.title}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            {job.department && <span>{job.department}</span>}
                            {job.location && <span className="flex items-center gap-1"><MapPin size={10} />{job.location}</span>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Badge variant="outline" className={job.status === "open" ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-600"}>{job.status}</Badge>
                          <Button size="sm" variant="ghost" className="text-red-500 h-7 w-7 p-0" onClick={() => { if (confirm("Delete?")) deleteJob.mutate({ id: job.id }); }}><Trash2 size={12} /></Button>
                        </div>
                      </div>
                      {job.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{job.description}</p>}
                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">{jobCandidates.length} candidates</span>
                        <div className="flex gap-1 items-center">
                          {job.salaryMin && job.salaryMax && <span className="text-xs font-medium">{job.currency} {Number(job.salaryMin).toLocaleString()} - {Number(job.salaryMax).toLocaleString()}</span>}
                          {job.status === "open" && <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => updateJob.mutate({ id: job.id, status: "closed" })}>Close</Button>}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="candidates" className="mt-4">
            {(hiringRecords || []).length === 0 ? (
              <Card className="py-12 text-center"><CardContent><UserPlus size={48} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">No candidates yet</p></CardContent></Card>
            ) : (
              <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead><tr className="border-b bg-gray-50/50">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">Candidate</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">Position</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase px-4 py-3">Stage</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase px-4 py-3">Actions</th>
                  </tr></thead>
                  <tbody>
                    {(hiringRecords || []).map((c: { id: number; candidateName: string; candidateEmail: string; jobTitle: string; status: string }) => {
                      const nextStage = advanceStage(c.status);
                      return (
                        <tr key={c.id} className="border-b border-border/30">
                          <td className="px-4 py-3"><p className="text-sm font-medium">{c.candidateName}</p><p className="text-xs text-muted-foreground">{c.candidateEmail}</p></td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{c.jobTitle}</td>
                          <td className="px-4 py-3 text-center"><Badge variant="outline" className={stageColor[c.status] || stageColor.applied}>{c.status.replace("_", " ")}</Badge></td>
                          <td className="px-4 py-3 text-right">
                            {c.status !== "hired" && c.status !== "rejected" && (
                              <div className="flex gap-1 justify-end">
                                {nextStage && <Button size="sm" variant="outline" onClick={() => updateCandStatus.mutate({ id: c.id, status: nextStage as "screening" | "interview" | "offer" | "hired" })}><ArrowRight size={14} className="mr-1" />{nextStage}</Button>}
                                <Button size="sm" variant="outline" className="text-red-600" onClick={() => updateCandStatus.mutate({ id: c.id, status: "rejected" })}>Reject</Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
