/*
 * PayrollHub — Payroll cycle management
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Receipt, CheckCircle2, Clock, ArrowRight } from "lucide-react";

export default function PayrollHubPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: "", periodStart: "", periodEnd: "", payDate: "" });

  const utils = trpc.useUtils();
  const { data: cycles, isLoading } = trpc.payrollCycle.list.useQuery();
  const createMut = trpc.payrollCycle.create.useMutation({ onSuccess: () => { utils.payrollCycle.list.invalidate(); setIsOpen(false); toast.success("Payroll cycle created"); } });
  const approveMut = trpc.payrollCycle.approve.useMutation({ onSuccess: () => { utils.payrollCycle.list.invalidate(); toast.success("Cycle approved"); } });
  const processMut = trpc.payrollCycle.process.useMutation({ onSuccess: () => { utils.payrollCycle.list.invalidate(); toast.success("Processing started"); } });
  const paidMut = trpc.payrollCycle.markPaid.useMutation({ onSuccess: () => { utils.payrollCycle.list.invalidate(); toast.success("Marked as paid"); } });

  const statusColor: Record<string, string> = { draft: "bg-gray-50 text-gray-600", approved: "bg-blue-50 text-blue-600", processing: "bg-amber-50 text-amber-700", paid: "bg-emerald-50 text-emerald-700" };

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-normal tracking-tight font-serif">Payroll Hub</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage payroll cycles and processing</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2"><Plus size={16} />New Cycle</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Payroll Cycle</DialogTitle></DialogHeader>
              <div className="space-y-3 mt-4">
                <Input placeholder="Cycle Name (e.g. March 2026)" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-muted-foreground">Period Start</label><Input type="date" value={form.periodStart} onChange={e => setForm(p => ({ ...p, periodStart: e.target.value }))} /></div>
                  <div><label className="text-xs text-muted-foreground">Period End</label><Input type="date" value={form.periodEnd} onChange={e => setForm(p => ({ ...p, periodEnd: e.target.value }))} /></div>
                </div>
                <div><label className="text-xs text-muted-foreground">Pay Date</label><Input type="date" value={form.payDate} onChange={e => setForm(p => ({ ...p, payDate: e.target.value }))} /></div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white" disabled={createMut.isPending} onClick={() => {
                  if (!form.name || !form.periodStart || !form.periodEnd || !form.payDate) { toast.error("All fields are required"); return; }
                  createMut.mutate(form);
                }}>{createMut.isPending ? "Creating..." : "Create"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        ) : (cycles || []).length === 0 ? (
          <Card className="py-12 text-center"><CardContent><Receipt size={48} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">No payroll cycles yet</p></CardContent></Card>
        ) : (
          <div className="space-y-4">
            {(cycles || []).map(cycle => (
              <motion.div key={cycle.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-border/50 shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center"><Receipt size={24} className="text-purple-600" /></div>
                    <div>
                      <p className="font-semibold">{cycle.name}</p>
                      <p className="text-sm text-muted-foreground">{new Date(cycle.periodStart).toLocaleDateString()} — {new Date(cycle.periodEnd).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Pay date: {new Date(cycle.payDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={statusColor[cycle.status || "draft"]}>{cycle.status}</Badge>
                    {cycle.status === "draft" && <Button size="sm" variant="outline" onClick={() => approveMut.mutate({ id: cycle.id })}>Approve</Button>}
                    {cycle.status === "approved" && <Button size="sm" variant="outline" onClick={() => processMut.mutate({ id: cycle.id })}>Process</Button>}
                    {cycle.status === "processing" && <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => paidMut.mutate({ id: cycle.id })}>Mark Paid</Button>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
