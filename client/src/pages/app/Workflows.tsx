/*
 * Workflows — Workflow automation management
 */
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, GitBranch, Play, Trash2, CheckCircle2, Clock, Zap } from "lucide-react";

const TRIGGER_TYPES = ["new_hire", "offboarding", "promotion", "time_off", "review_cycle", "custom"] as const;

export default function WorkflowsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", triggerType: "new_hire" as typeof TRIGGER_TYPES[number] });

  const utils = trpc.useUtils();
  const { data: workflows, isLoading } = trpc.workflow.list.useQuery();
  const { data: instances } = trpc.workflow.listInstances.useQuery();
  const createMut = trpc.workflow.create.useMutation({ onSuccess: () => { utils.workflow.list.invalidate(); setIsOpen(false); setForm({ name: "", description: "", triggerType: "new_hire" }); toast.success("Workflow created"); } });
  const deleteMut = trpc.workflow.delete.useMutation({ onSuccess: () => { utils.workflow.list.invalidate(); toast.success("Workflow deleted"); } });
  const completeMut = trpc.workflow.completeInstance.useMutation({ onSuccess: () => { utils.workflow.listInstances.invalidate(); toast.success("Instance completed"); } });

  const activeWorkflows = (workflows || []).filter(w => w.isActive);
  const activeInstances = (instances || []).filter(i => i.status === "in_progress");

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-normal tracking-tight font-serif">Workflows</h1>
            <p className="text-muted-foreground text-sm mt-1">Automate HR processes and approvals</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2"><Plus size={16} />New Workflow</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Workflow</DialogTitle></DialogHeader>
              <div className="space-y-3 mt-4">
                <Input placeholder="Workflow Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                <Textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                <Select value={form.triggerType} onValueChange={v => setForm(p => ({ ...p, triggerType: v as any }))}>
                  <SelectTrigger><SelectValue placeholder="Trigger Type" /></SelectTrigger>
                  <SelectContent>{TRIGGER_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white" disabled={createMut.isPending} onClick={() => {
                  if (!form.name) { toast.error("Name is required"); return; }
                  createMut.mutate({ name: form.name, description: form.description || undefined, triggerType: form.triggerType });
                }}>{createMut.isPending ? "Creating..." : "Create"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-semibold text-teal-600">{(workflows || []).length}</p><p className="text-sm text-muted-foreground mt-1">Total Workflows</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-semibold text-emerald-600">{activeWorkflows.length}</p><p className="text-sm text-muted-foreground mt-1">Active</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-semibold text-amber-600">{activeInstances.length}</p><p className="text-sm text-muted-foreground mt-1">Running Instances</p></CardContent></Card>
        </div>

        <Tabs defaultValue="templates">
          <TabsList><TabsTrigger value="templates">Workflow Templates</TabsTrigger><TabsTrigger value="instances">Running Instances</TabsTrigger></TabsList>

          <TabsContent value="templates" className="mt-4">
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}</div>
            ) : (workflows || []).length === 0 ? (
              <Card className="py-12 text-center"><CardContent><GitBranch size={48} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">No workflows created yet</p></CardContent></Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {(workflows || []).map(wf => (
                  <motion.div key={wf.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-border/50 shadow-sm p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><Zap size={20} className="text-purple-600" /></div>
                        <div>
                          <p className="font-semibold text-sm">{wf.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{(wf.triggerType || "custom").replace(/_/g, " ")}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="outline" className={wf.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-600 border-gray-200"}>{wf.isActive ? "Active" : "Inactive"}</Badge>
                        <Button size="sm" variant="ghost" className="text-red-500 h-8 w-8 p-0" onClick={() => { if (confirm("Delete this workflow?")) deleteMut.mutate({ id: wf.id }); }}><Trash2 size={14} /></Button>
                      </div>
                    </div>
                    {wf.description && <p className="text-xs text-muted-foreground line-clamp-2">{wf.description}</p>}
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="instances" className="mt-4">
            {(instances || []).length === 0 ? (
              <Card className="py-12 text-center"><CardContent><Play size={48} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">No workflow instances running</p></CardContent></Card>
            ) : (
              <div className="space-y-3">
                {(instances || []).map(inst => (
                  <div key={inst.id} className="bg-white rounded-xl border border-border/50 shadow-sm p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Play size={18} className="text-amber-600" /></div>
                      <div>
                        <p className="text-sm font-medium">Workflow #{inst.workflowId}</p>
                        <p className="text-xs text-muted-foreground">Step {inst.currentStep + 1} · Started {new Date(inst.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={inst.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>{inst.status}</Badge>
                      {inst.status === "in_progress" && (
                        <Button size="sm" variant="outline" onClick={() => completeMut.mutate({ id: inst.id })}><CheckCircle2 size={14} className="mr-1" />Complete</Button>
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
