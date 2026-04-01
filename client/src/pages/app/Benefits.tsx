/*
 * Benefits — Benefits administration and enrollment
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
import { Plus, Heart, Shield, Trash2, Users } from "lucide-react";

const PLAN_TYPES = ["health", "dental", "vision", "life", "retirement", "wellness", "other"] as const;

export default function BenefitsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "health" as typeof PLAN_TYPES[number], description: "", provider: "", cost: "" });
  const [enrollForm, setEnrollForm] = useState({ employeeId: "", planId: "" });

  const utils = trpc.useUtils();
  const { data: plans, isLoading } = trpc.benefits.listPlans.useQuery();
  const { data: enrollments } = trpc.benefits.listEnrollments.useQuery();
  const { data: employees } = trpc.employee.list.useQuery();
  const createMut = trpc.benefits.createPlan.useMutation({ onSuccess: () => { utils.benefits.listPlans.invalidate(); setIsOpen(false); toast.success("Plan created"); } });
  const deleteMut = trpc.benefits.deletePlan.useMutation({ onSuccess: () => { utils.benefits.listPlans.invalidate(); toast.success("Plan deleted"); } });
  const enrollMut = trpc.benefits.enroll.useMutation({ onSuccess: () => { utils.benefits.listEnrollments.invalidate(); setEnrollOpen(false); toast.success("Employee enrolled"); } });
  const updateEnrollment = trpc.benefits.updateEnrollment.useMutation({ onSuccess: () => { utils.benefits.listEnrollments.invalidate(); toast.success("Enrollment updated"); } });

  const getEmployeeName = (id: number) => {
    const emp = employees?.find(e => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${id}`;
  };

  const getPlanName = (id: number) => {
    const plan = plans?.find(p => p.id === id);
    return plan ? plan.name : `Plan #${id}`;
  };

  const typeIcon: Record<string, string> = { health: "bg-red-50 text-red-600", dental: "bg-blue-50 text-blue-600", vision: "bg-purple-50 text-purple-600", life: "bg-emerald-50 text-emerald-600", retirement: "bg-teal-50 text-teal-600", wellness: "bg-pink-50 text-pink-600", other: "bg-gray-50 text-gray-600" };

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-normal tracking-tight font-serif">Benefits</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage benefit plans and employee enrollment</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2"><Users size={16} />Enroll Employee</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Enroll Employee</DialogTitle></DialogHeader>
                <div className="space-y-3 mt-4">
                  <Select value={enrollForm.employeeId} onValueChange={v => setEnrollForm(p => ({ ...p, employeeId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                    <SelectContent>{(employees || []).map(e => <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={enrollForm.planId} onValueChange={v => setEnrollForm(p => ({ ...p, planId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select Plan" /></SelectTrigger>
                    <SelectContent>{(plans || []).map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setEnrollOpen(false)}>Cancel</Button>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white" disabled={enrollMut.isPending} onClick={() => {
                    if (!enrollForm.employeeId || !enrollForm.planId) { toast.error("Select both employee and plan"); return; }
                    enrollMut.mutate({ employeeId: Number(enrollForm.employeeId), planId: Number(enrollForm.planId) });
                  }}>{enrollMut.isPending ? "Enrolling..." : "Enroll"}</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2"><Plus size={16} />Add Plan</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Benefit Plan</DialogTitle></DialogHeader>
                <div className="space-y-3 mt-4">
                  <Input placeholder="Plan Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as typeof PLAN_TYPES[number] }))}>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>{PLAN_TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
                  <Textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                  <Input placeholder="Provider" value={form.provider} onChange={e => setForm(p => ({ ...p, provider: e.target.value }))} />
                  <Input placeholder="Monthly Cost" type="number" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white" disabled={createMut.isPending} onClick={() => {
                    if (!form.name) { toast.error("Plan name is required"); return; }
                    createMut.mutate({ name: form.name, type: form.type, description: form.description || undefined, provider: form.provider || undefined, cost: form.cost || undefined });
                  }}>{createMut.isPending ? "Creating..." : "Create"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <Tabs defaultValue="plans">
          <TabsList><TabsTrigger value="plans">Benefit Plans</TabsTrigger><TabsTrigger value="enrollments">Enrollments</TabsTrigger></TabsList>

          <TabsContent value="plans" className="mt-4">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
            ) : (plans || []).length === 0 ? (
              <Card className="py-12 text-center"><CardContent><Heart size={48} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">No benefit plans created yet</p></CardContent></Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(plans || []).map(plan => {
                  const enrolled = (enrollments || []).filter(e => e.planId === plan.id && e.status === "enrolled").length;
                  return (
                    <motion.div key={plan.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-border/50 shadow-sm p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeIcon[plan.type] || typeIcon.other}`}><Shield size={20} /></div>
                          <div>
                            <p className="font-semibold text-sm">{plan.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{plan.type}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-red-500 h-8 w-8 p-0" onClick={() => { if (confirm("Delete this plan?")) deleteMut.mutate({ id: plan.id }); }}><Trash2 size={14} /></Button>
                      </div>
                      {plan.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{plan.description}</p>}
                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">{enrolled} enrolled</span>
                        {plan.cost && <span className="text-sm font-semibold">${Number(plan.cost).toLocaleString()}/mo</span>}
                      </div>
                      {plan.provider && <p className="text-xs text-muted-foreground mt-1">Provider: {plan.provider}</p>}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="enrollments" className="mt-4">
            {(enrollments || []).length === 0 ? (
              <Card className="py-12 text-center"><CardContent><Users size={48} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">No enrollments yet</p></CardContent></Card>
            ) : (
              <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead><tr className="border-b bg-gray-50/50">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">Employee</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">Plan</th>
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase px-4 py-3">Status</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase px-4 py-3">Actions</th>
                  </tr></thead>
                  <tbody>
                    {(enrollments || []).map(e => (
                      <tr key={e.id} className="border-b border-border/30">
                        <td className="px-4 py-3 text-sm">{getEmployeeName(e.employeeId)}</td>
                        <td className="px-4 py-3 text-sm">{getPlanName(e.planId)}</td>
                        <td className="px-4 py-3 text-center"><Badge variant="outline" className={e.status === "enrolled" ? "bg-emerald-50 text-emerald-700" : e.status === "terminated" ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-600"}>{e.status}</Badge></td>
                        <td className="px-4 py-3 text-right">
                          {e.status === "enrolled" && <Button size="sm" variant="outline" className="text-red-600" onClick={() => updateEnrollment.mutate({ id: e.id, status: "terminated" })}>Terminate</Button>}
                          {e.status === "pending" && <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => updateEnrollment.mutate({ id: e.id, status: "enrolled" })}>Approve</Button>}
                        </td>
                      </tr>
                    ))}
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
