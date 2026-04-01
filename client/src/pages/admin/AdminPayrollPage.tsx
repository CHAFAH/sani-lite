import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Plus, Check, CreditCard } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminPayrollPage() {
  const { data: payroll = [] } = trpc.payroll.list.useQuery();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const utils = trpc.useUtils();
  const createMut = trpc.payroll.create.useMutation({ onSuccess: () => { utils.payroll.list.invalidate(); toast.success("Payroll record created"); setShowAdd(false); } });
  const approveMut = trpc.payroll.approve.useMutation({ onSuccess: () => { utils.payroll.list.invalidate(); toast.success("Approved"); } });
  const processMut = trpc.payroll.process.useMutation({ onSuccess: () => { utils.payroll.list.invalidate(); toast.success("Processed"); } });
  const paidMut = trpc.payroll.markPaid.useMutation({ onSuccess: () => { utils.payroll.list.invalidate(); toast.success("Marked paid"); } });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ employeeId: 0, payrollCycle: "", baseSalary: "", grossPay: "", deductions: "0", netPay: "", currency: "USD" });

  const getEmpName = (id: number) => { const e = employees.find((e: any) => e.id === id); return e ? `${e.firstName} ${e.lastName}` : `#${id}`; };
  const statusColors: Record<string, string> = { draft: "bg-slate-50 text-slate-600 border-slate-200", approved: "bg-blue-50 text-blue-700 border-blue-200", processed: "bg-amber-50 text-amber-700 border-amber-200", paid: "bg-emerald-50 text-emerald-700 border-emerald-200" };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Global Payroll</h1><p className="text-sm text-slate-500 mt-1">{payroll.length} records</p></div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild><Button className="bg-indigo-600 hover:bg-indigo-700"><Plus size={16} className="mr-2" />Add Record</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Payroll Record</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Employee</Label>
                  <Select onValueChange={(v) => setForm(p => ({ ...p, employeeId: Number(v) }))}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>{employees.map((e: any) => <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Payroll Cycle</Label><Input value={form.payrollCycle} onChange={e => setForm(p => ({ ...p, payrollCycle: e.target.value }))} placeholder="e.g. March 2026" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Base Salary</Label><Input value={form.baseSalary} onChange={e => setForm(p => ({ ...p, baseSalary: e.target.value }))} /></div>
                  <div><Label>Gross Pay</Label><Input value={form.grossPay} onChange={e => setForm(p => ({ ...p, grossPay: e.target.value }))} /></div>
                  <div><Label>Deductions</Label><Input value={form.deductions} onChange={e => setForm(p => ({ ...p, deductions: e.target.value }))} /></div>
                  <div><Label>Net Pay</Label><Input value={form.netPay} onChange={e => setForm(p => ({ ...p, netPay: e.target.value }))} /></div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={() => { if (!form.employeeId || !form.netPay) { toast.error("Employee and net pay required"); return; } createMut.mutate(form); }} className="bg-indigo-600 hover:bg-indigo-700">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">
                <th className="text-left py-3 px-4 font-medium text-slate-500">Employee</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Cycle</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Gross</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Deductions</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Net</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                <th className="text-right py-3 px-4 font-medium text-slate-500">Actions</th>
              </tr></thead>
              <tbody>
                {payroll.map((p: any) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-900">{getEmpName(p.employeeId)}</td>
                    <td className="py-3 px-4 text-slate-600">{p.payrollCycle}</td>
                    <td className="py-3 px-4 text-slate-600">{p.currency} {p.grossPay}</td>
                    <td className="py-3 px-4 text-red-500">-{p.deductions}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{p.currency} {p.netPay}</td>
                    <td className="py-3 px-4"><Badge variant="outline" className={`text-xs capitalize ${statusColors[p.status] || ""}`}>{p.status}</Badge></td>
                    <td className="py-3 px-4 text-right">
                      {p.status === "draft" && <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => approveMut.mutate({ id: p.id })}><Check size={14} className="mr-1" />Approve</Button>}
                      {p.status === "approved" && <Button size="sm" variant="ghost" className="text-amber-600" onClick={() => processMut.mutate({ id: p.id })}>Process</Button>}
                      {p.status === "processed" && <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => paidMut.mutate({ id: p.id })}><CreditCard size={14} className="mr-1" />Pay</Button>}
                    </td>
                  </tr>
                ))}
                {payroll.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-slate-400">No payroll records</td></tr>}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
