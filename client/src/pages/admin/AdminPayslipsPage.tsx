import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Send, Check, Plus, Loader2, DollarSign } from "lucide-react";
import { toast } from "sonner";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function AdminPayslipsPage() {
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const { data: payslips = [], refetch } = trpc.payslip.listByCompany.useQuery();
  const createMut = trpc.payslip.create.useMutation({ onSuccess: () => { refetch(); toast.success("Payslip created"); setShowForm(false); } });
  const validateMut = trpc.payslip.validate.useMutation({ onSuccess: () => { refetch(); toast.success("Payslip validated"); } });
  const sendMut = trpc.payslip.send.useMutation({ onSuccess: () => { refetch(); toast.success("Payslip sent to employee"); } });

  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));

  // Auto-prefill from employee data
  const emp = useMemo(() => employees.find((e: any) => String(e.id) === selectedEmployee), [employees, selectedEmployee]);

  const [form, setForm] = useState({
    grossSalary: "", netPay: "", hoursWorked: "160.33", hourlyRate: "",
    amContribution: "", aTax: "", pension: "", atp: "99",
    otherDeductions: "", otherAdditions: "",
  });

  // Auto-calculate when employee is selected
  const handleEmployeeSelect = (empId: string) => {
    setSelectedEmployee(empId);
    const e = employees.find((x: any) => String(x.id) === empId) as any;
    if (e?.salary) {
      const gross = Number(e.salary);
      const am = gross * 0.08;
      const taxable = gross - am;
      const tax = taxable * 0.38;
      const pensionAmt = gross * 0.03;
      const net = gross - am - tax - pensionAmt - 99;
      setForm({
        grossSalary: String(gross), netPay: String(Math.round(net * 100) / 100),
        hoursWorked: "160.33", hourlyRate: String(Math.round((gross / 160.33) * 100) / 100),
        amContribution: String(Math.round(am * 100) / 100),
        aTax: String(Math.round(tax * 100) / 100),
        pension: String(Math.round(pensionAmt * 100) / 100),
        atp: "99", otherDeductions: "0", otherAdditions: "0",
      });
    }
  };

  const handleCreate = () => {
    if (!selectedEmployee || !form.grossSalary || !form.netPay) {
      toast.error("Select employee and fill salary details"); return;
    }
    createMut.mutate({
      employeeId: parseInt(selectedEmployee), month: parseInt(month), year: parseInt(year),
      grossSalary: form.grossSalary, netPay: form.netPay,
      currency: emp?.currency || "DKK", hoursWorked: form.hoursWorked, hourlyRate: form.hourlyRate,
      amContribution: form.amContribution, aTax: form.aTax, pension: form.pension,
      atp: form.atp, otherDeductions: form.otherDeductions, otherAdditions: form.otherAdditions,
      bankAccount: emp?.bankAccount || emp?.metadata?.bankAccount || undefined,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payslips</h1>
            <p className="text-sm text-slate-500 mt-0.5">{payslips.length} payslips generated</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
            <Plus size={16} /> Create Payslip
          </Button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-900">New Payslip</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Employee</label>
                <Select value={selectedEmployee} onValueChange={handleEmployeeSelect}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map((e: any) => (
                      <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Month</label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Year</label>
                <Input value={year} onChange={(e) => setYear(e.target.value)} className="mt-1" />
              </div>
            </div>

            {emp && (
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
                <span className="font-semibold">{emp.firstName} {emp.lastName}</span> · {emp.position} · {emp.department} · {emp.currency || "DKK"} {emp.salary ? Number(emp.salary).toLocaleString() : "—"}/month
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div><label className="text-xs text-slate-500">Gross Salary</label><Input value={form.grossSalary} onChange={(e) => setForm(f => ({ ...f, grossSalary: e.target.value }))} className="mt-1" /></div>
              <div><label className="text-xs text-slate-500">Hours Worked</label><Input value={form.hoursWorked} onChange={(e) => setForm(f => ({ ...f, hoursWorked: e.target.value }))} className="mt-1" /></div>
              <div><label className="text-xs text-slate-500">Hourly Rate</label><Input value={form.hourlyRate} onChange={(e) => setForm(f => ({ ...f, hourlyRate: e.target.value }))} className="mt-1" /></div>
              <div><label className="text-xs text-slate-500">AM Contribution (8%)</label><Input value={form.amContribution} onChange={(e) => setForm(f => ({ ...f, amContribution: e.target.value }))} className="mt-1" /></div>
              <div><label className="text-xs text-slate-500">A-Tax (38%)</label><Input value={form.aTax} onChange={(e) => setForm(f => ({ ...f, aTax: e.target.value }))} className="mt-1" /></div>
              <div><label className="text-xs text-slate-500">Pension (3%)</label><Input value={form.pension} onChange={(e) => setForm(f => ({ ...f, pension: e.target.value }))} className="mt-1" /></div>
              <div><label className="text-xs text-slate-500">ATP</label><Input value={form.atp} onChange={(e) => setForm(f => ({ ...f, atp: e.target.value }))} className="mt-1" /></div>
              <div><label className="text-xs text-slate-500">Other Deductions</label><Input value={form.otherDeductions} onChange={(e) => setForm(f => ({ ...f, otherDeductions: e.target.value }))} className="mt-1" /></div>
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-500">NET PAY</label>
                <Input value={form.netPay} onChange={(e) => setForm(f => ({ ...f, netPay: e.target.value }))} className="mt-1 text-lg font-bold" />
              </div>
              <Button onClick={handleCreate} disabled={createMut.isPending} className="bg-teal-600 hover:bg-teal-700 text-white h-11 px-6">
                {createMut.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <FileText size={16} className="mr-2" />} Create Payslip
              </Button>
            </div>
          </div>
        )}

        {/* Payslips Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Employee</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Period</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Gross</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Net</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map((p: any) => {
                const empName = employees.find((e: any) => e.id === p.employeeId);
                return (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-800">{empName ? `${empName.firstName} ${empName.lastName}` : `Employee #${p.employeeId}`}</td>
                    <td className="py-3 px-4 text-slate-600">{MONTHS[p.month - 1]} {p.year}</td>
                    <td className="py-3 px-4 text-right font-medium">{p.currency} {Number(p.grossSalary).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-bold text-teal-700">{p.currency} {Number(p.netPay).toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={p.status === "sent" ? "bg-emerald-100 text-emerald-700" : p.status === "validated" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {p.status === "draft" && (
                        <Button size="sm" variant="outline" onClick={() => validateMut.mutate({ id: p.id })} disabled={validateMut.isPending}>
                          <Check size={14} className="mr-1" /> Validate
                        </Button>
                      )}
                      {p.status === "validated" && (
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => sendMut.mutate({ id: p.id })} disabled={sendMut.isPending}>
                          <Send size={14} className="mr-1" /> Send
                        </Button>
                      )}
                      {p.status === "sent" && <span className="text-xs text-slate-400">Delivered</span>}
                    </td>
                  </tr>
                );
              })}
              {payslips.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-slate-400">No payslips yet. Create one above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
