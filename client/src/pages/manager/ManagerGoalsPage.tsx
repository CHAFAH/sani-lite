import ManagerLayout from "@/components/ManagerLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Target, Plus, Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ManagerGoalsPage() {
  const { data: goals = [] } = trpc.goals.list.useQuery();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const utils = trpc.useUtils();
  const createMut = trpc.goals.create.useMutation({ onSuccess: () => { utils.goals.list.invalidate(); toast.success("Goal created"); setShowAdd(false); } });
  const updateMut = trpc.goals.update.useMutation({ onSuccess: () => { utils.goals.list.invalidate(); toast.success("Updated"); } });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ employeeId: 0, title: "", description: "", type: "individual" as any });
  const getEmpName = (id: number) => { const e = employees.find((e: any) => e.id === id); return e ? `${e.firstName} ${e.lastName}` : `#${id}`; };
  const statusColors: Record<string, string> = { not_started: "bg-slate-50 text-slate-600", in_progress: "bg-blue-50 text-blue-700", completed: "bg-emerald-50 text-emerald-700" };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Team Goals</h1><p className="text-sm text-slate-500 mt-1">{goals.length} goals</p></div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild><Button className="bg-indigo-600 hover:bg-indigo-700"><Plus size={16} className="mr-2" />Assign Goal</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Assign Goal</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Employee</Label>
                  <Select onValueChange={(v) => setForm(p => ({ ...p, employeeId: Number(v) }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{employees.map((e: any) => <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
                <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={() => { if (!form.title || !form.employeeId) { toast.error("Required"); return; } createMut.mutate(form); }} className="bg-indigo-600 hover:bg-indigo-700">Assign</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-3">
          {goals.map((g: any) => (
            <Card key={g.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><Target size={18} className="text-emerald-600" /></div>
                    <div>
                      <h3 className="font-medium text-slate-900">{g.title}</h3>
                      <p className="text-xs text-slate-500">{getEmpName(g.employeeId)} · {g.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${g.progress || 0}%` }} /></div>
                      <span className="text-xs text-slate-500">{g.progress || 0}%</span>
                    </div>
                    <Badge variant="outline" className={`text-xs capitalize ${statusColors[g.status] || ""}`}>{g.status?.replace("_", " ")}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {goals.length === 0 && <div className="text-center py-12 text-slate-400"><Target size={40} className="mx-auto mb-3 text-slate-300" /><p>No goals assigned</p></div>}
        </div>
      </div>
    </ManagerLayout>
  );
}
