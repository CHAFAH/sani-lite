/*
 * Payroll — Global payroll management with real data
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
import { toast } from "sonner";
import { Plus, Wallet, Globe, Clock, DollarSign } from "lucide-react";

export default function PayrollPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ employeeId: "", payrollCycle: "", baseSalary: "", grossPay: "", deductions: "", netPay: "", currency: "USD", country: "" });

  const utils = trpc.useUtils();
  const { data: payroll, isLoading } = trpc.payroll.list.useQuery();
  const { data: employees } = trpc.employee.list.useQuery();
  const createMut = trpc.payroll.create.useMutation({ onSuccess: () => { utils.payroll.list.invalidate(); setIsOpen(false); toast.success("Payroll record created"); } });
  const approveMut = trpc.payroll.approve.useMutation({ onSuccess: () => { utils.payroll.list.invalidate(); toast.success("Payroll approved"); } });
  const processMut = trpc.payroll.process.useMutation({ onSuccess: () => { utils.payroll.list.invalidate(); toast.success("Payroll processed"); } });
  const paidMut = trpc.payroll.markPaid.useMutation({ onSuccess: () => { utils.payroll.list.invalidate(); toast.success("Marked as paid"); } });

  const totalGross = (payroll || []).reduce((s, p) => s + Number(p.grossPay || 0), 0);
  const totalNet = (payroll || []).reduce((s, p) => s + Number(p.netPay || 0), 0);
  const pendingCount = (payroll || []).filter(p => p.status === "draft" || p.status === "approved").length;

  const statusColor: Record<string, string> = { draft: "bg-gray-50 text-gray-600", approved: "bg-blue-50 text-blue-600", processed: "bg-amber-50 text-amber-700", paid: "bg-emerald-50 text-emerald-700" };

  const getEmployeeName = (id: number) => {
    const emp = employees?.find(e => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${id}`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-normal tracking-tight font-serif">Global Payroll</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage payroll across all entities</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2"><Plus size={16} />Add Payroll</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Payroll Record</DialogTitle></DialogHeader>
              <div className="space-y-3 mt-4">
                <Select value={form.employeeId} onValueChange={v => setForm(p => ({ ...p, employeeId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                  <SelectContent>{(employees || []).map(e => <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                </Select>
                <Input placeholder="Payroll Cycle (e.g. March 2026)" value={form.payrollCycle} onChange={e => setForm(p => ({ ...p, payrollCycle: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Base Salary" type="number" value={form.baseSalary} onChange={e => setForm(p => ({ ...p, baseSalary: e.target.value }))} />
                  <Input placeholder="Gross Pay" type="number" value={form.grossPay} onChange={e => setForm(p => ({ ...p, grossPay: e.target.value }))} />
                  <Input placeholder="Deductions" type="number" value={form.deductions} onChange={e => setForm(p => ({ ...p, deductions: e.target.value }))} />
                  <Input placeholder="Net Pay" type="number" value={form.netPay} onChange={e => setForm(p => ({ ...p, netPay: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select value={form.currency} onValueChange={v => setForm(p => ({ ...p, currency: v }))}>
                    <SelectTrigger><SelectValue placeholder="Currency" /></SelectTrigger>
                    <SelectContent>{["USD", "EUR", "GBP", "NGN", "CAD"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input placeholder="Country" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white" disabled={createMut.isPending} onClick={() => {
                  if (!form.employeeId || !form.payrollCycle || !form.grossPay || !form.netPay) { toast.error("Please fill required fields"); return; }
                  createMut.mutate({ employeeId: Number(form.employeeId), payrollCycle: form.payrollCycle, baseSalary: form.baseSalary || "0", grossPay: form.grossPay, deductions: form.deductions || "0", netPay: form.netPay, currency: form.currency, country: form.country || undefined });
                }}>{createMut.isPending ? "Creating..." : "Create"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center"><DollarSign size={20} className="text-teal-600" /></div><div><p className="text-2xl font-semibold">${totalGross.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Gross</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><Wallet size={20} className="text-emerald-600" /></div><div><p className="text-2xl font-semibold">${totalNet.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Net</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Clock size={20} className="text-amber-600" /></div><div><p className="text-2xl font-semibold">{pendingCount}</p><p className="text-xs text-muted-foreground">Pending</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><Globe size={20} className="text-purple-600" /></div><div><p className="text-2xl font-semibold">{(payroll || []).length}</p><p className="text-xs text-muted-foreground">Records</p></div></div></CardContent></Card>
        </div>

        {/* Payroll Table */}
        {isLoading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : (payroll || []).length === 0 ? (
          <Card className="py-12 text-center"><CardContent><Wallet size={48} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">No payroll records yet. Add your first payroll record to get started.</p></CardContent></Card>
        ) : (
          <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b bg-gray-50/50">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">Employee</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">Cycle</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase px-4 py-3">Gross</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase px-4 py-3">Deductions</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase px-4 py-3">Net</th>
                <th className="text-center text-xs font-medium text-muted-foreground uppercase px-4 py-3">Status</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase px-4 py-3">Actions</th>
              </tr></thead>
              <tbody>
                {(payroll || []).map(p => (
                  <tr key={p.id} className="border-b border-border/30 hover:bg-gray-50/30">
                    <td className="px-4 py-3 text-sm font-medium">{getEmployeeName(p.employeeId)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{p.payrollCycle}</td>
                    <td className="px-4 py-3 text-sm text-right">{p.currency} {Number(p.grossPay).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">-{Number(p.deductions || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">{p.currency} {Number(p.netPay).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center"><Badge variant="outline" className={statusColor[p.status || "draft"]}>{p.status}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      {p.status === "draft" && <Button size="sm" variant="outline" onClick={() => approveMut.mutate({ id: p.id })}>Approve</Button>}
                      {p.status === "approved" && <Button size="sm" variant="outline" onClick={() => processMut.mutate({ id: p.id })}>Process</Button>}
                      {p.status === "processed" && <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => paidMut.mutate({ id: p.id })}>Mark Paid</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
