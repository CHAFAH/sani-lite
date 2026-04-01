import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Receipt, Plus, Check, Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminPayrollHubPage() {
  const { data: cycles = [] } = trpc.payrollCycle.list.useQuery();
  const utils = trpc.useUtils();
  const createMut = trpc.payrollCycle.create.useMutation({ onSuccess: () => { utils.payrollCycle.list.invalidate(); toast.success("Cycle created"); setShowAdd(false); } });
  const approveMut = trpc.payrollCycle.approve.useMutation({ onSuccess: () => { utils.payrollCycle.list.invalidate(); toast.success("Approved"); } });
  const processMut = trpc.payrollCycle.process.useMutation({ onSuccess: () => { utils.payrollCycle.list.invalidate(); toast.success("Processing"); } });
  const paidMut = trpc.payrollCycle.markPaid.useMutation({ onSuccess: () => { utils.payrollCycle.list.invalidate(); toast.success("Paid"); } });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", periodStart: "", periodEnd: "", payDate: "" });
  const statusColors: Record<string, string> = { draft: "bg-slate-50 text-slate-600", approved: "bg-blue-50 text-blue-700", processing: "bg-amber-50 text-amber-700", paid: "bg-emerald-50 text-emerald-700" };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Payroll Hub</h1><p className="text-sm text-slate-500 mt-1">Manage payroll cycles</p></div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild><Button className="bg-indigo-600 hover:bg-indigo-700"><Plus size={16} className="mr-2" />New Cycle</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Payroll Cycle</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. March 2026" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Period Start</Label><Input type="date" value={form.periodStart} onChange={e => setForm(p => ({ ...p, periodStart: e.target.value }))} /></div>
                  <div><Label>Period End</Label><Input type="date" value={form.periodEnd} onChange={e => setForm(p => ({ ...p, periodEnd: e.target.value }))} /></div>
                </div>
                <div><Label>Pay Date</Label><Input type="date" value={form.payDate} onChange={e => setForm(p => ({ ...p, payDate: e.target.value }))} /></div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={() => { if (!form.name) { toast.error("Name required"); return; } createMut.mutate(form); }} className="bg-indigo-600 hover:bg-indigo-700">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cycles.map((c: any) => (
            <Card key={c.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">{c.name}</h3>
                  <Badge variant="outline" className={`text-xs capitalize ${statusColors[c.status] || ""}`}>{c.status}</Badge>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>Period: {new Date(c.periodStart).toLocaleDateString()} — {new Date(c.periodEnd).toLocaleDateString()}</p>
                  <p>Pay Date: {new Date(c.payDate).toLocaleDateString()}</p>
                </div>
                <div className="mt-3 flex gap-2">
                  {c.status === "draft" && <Button size="sm" variant="outline" onClick={() => approveMut.mutate({ id: c.id })}><Check size={14} className="mr-1" />Approve</Button>}
                  {c.status === "approved" && <Button size="sm" variant="outline" onClick={() => processMut.mutate({ id: c.id })}><Play size={14} className="mr-1" />Process</Button>}
                  {c.status === "processing" && <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => paidMut.mutate({ id: c.id })}>Mark Paid</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
          {cycles.length === 0 && <div className="col-span-full text-center py-12 text-slate-400"><Receipt size={40} className="mx-auto mb-3 text-slate-300" /><p>No payroll cycles yet</p></div>}
        </div>
      </div>
    </AdminLayout>
  );
}
