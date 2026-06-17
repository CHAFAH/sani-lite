import { useState, useMemo, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Send, Check, Plus, Loader2, X, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Danish working hours per month (approx based on weekdays)
const WORK_HOURS_PER_MONTH = [160.33, 149.33, 168.00, 160.33, 160.33, 157.67, 176.00, 160.33, 176.00, 176.00, 160.33, 165.33];

function calcWorkingHours(month: number, year: number): number {
  return WORK_HOURS_PER_MONTH[month - 1] || 160.33;
}

interface PayslipLine {
  text: string;
  basis?: string;
  rate?: string;
  paidOut?: number;
  deducted?: number;
}

export default function AdminPayslipsPage() {
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const { data: company } = trpc.company.get.useQuery(undefined, { retry: false });
  const { data: payslips = [], refetch } = trpc.payslip.listByCompany.useQuery();
  const createMut = trpc.payslip.create.useMutation({ onSuccess: () => { refetch(); toast.success("Payslip created"); setShowForm(false); } });
  const validateMut = trpc.payslip.validate.useMutation({ onSuccess: () => { refetch(); toast.success("Payslip validated"); } });
  const sendMut = trpc.payslip.send.useMutation({ onSuccess: () => { refetch(); toast.success("Payslip sent to employee"); } });

  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [expandedPayslip, setExpandedPayslip] = useState<number | null>(null);
  const [viewingPayslip, setViewingPayslip] = useState<any>(null);

  // Payslip calculation state
  const [grossSalary, setGrossSalary] = useState("");
  const [taxDeduction, setTaxDeduction] = useState("7938"); // Monthly personal deduction (fradrag)
  const [taxRate, setTaxRate] = useState("38"); // A-tax rate %
  const [amRate] = useState("8"); // AM bidrag %
  const [pensionRate, setPensionRate] = useState("3"); // Employee pension %
  const [companyPensionRate, setCompanyPensionRate] = useState("3"); // Company pension %
  const [atpAmount, setAtpAmount] = useState("99"); // ATP per month
  const [sundhedsforsikring, setSundhedsforsikring] = useState("70.66");
  const [frokost, setFrokost] = useState("400");
  const [greatPrayerDay, setGreatPrayerDay] = useState("0");
  const [otherAdditions, setOtherAdditions] = useState("0");

  const emp = useMemo(() => employees.find((e: any) => String(e.id) === selectedEmployee), [employees, selectedEmployee]);

  // Auto-calculate when employee selected
  useEffect(() => {
    if (emp?.salary) {
      setGrossSalary(String(Number(emp.salary)));
    }
  }, [emp]);

  // Full calculation
  const calc = useMemo(() => {
    const gross = Number(grossSalary) || 0;
    const m = parseInt(month);
    const hours = calcWorkingHours(m, parseInt(year));
    const hourlyRate = gross > 0 ? gross / hours : 0;
    const prayerDay = Number(greatPrayerDay) || 0;
    const additions = Number(otherAdditions) || 0;
    const sundhed = Number(sundhedsforsikring) || 0;
    const atp = Number(atpAmount) || 0;
    const pensionEmp = gross * (Number(pensionRate) / 100);
    const pensionCompany = gross * (Number(companyPensionRate) / 100);
    const frokostAmt = Number(frokost) || 0;

    // AM income base = gross - pension employee contribution
    const amIncomeBase = gross - pensionEmp + prayerDay;
    const amContribution = amIncomeBase * (Number(amRate) / 100);

    // A-tax base = AM income base - AM contribution - deduction
    const deduction = Number(taxDeduction) || 0;
    const aTaxBase = amIncomeBase - amContribution - deduction;
    const aTax = Math.max(0, aTaxBase * (Number(taxRate) / 100));

    // Net pay
    const netPay = gross + prayerDay + additions - sundhed - atp - pensionEmp - amContribution - aTax - frokostAmt;

    // Build payslip lines
    const lines: PayslipLine[] = [
      { text: "Salary", basis: hours.toFixed(2), rate: hourlyRate.toFixed(2), paidOut: gross },
    ];
    if (prayerDay > 0) lines.push({ text: "Paid out Great Prayer Day compensation", paidOut: prayerDay });
    if (additions > 0) lines.push({ text: "Other additions", paidOut: additions });
    lines.push({ text: "Sundhedsforsikring", deducted: sundhed });
    lines.push({ text: `Sundhedsforsikring (Company contribution: ${(sundhed * 2.48).toFixed(2)} DKK)`, paidOut: 0 });
    lines.push({ text: "ATP of salary", basis: hours.toFixed(2), deducted: atp });
    lines.push({ text: `Pension - Employee contribution (${pensionRate}%)`, basis: gross.toFixed(2), rate: `${pensionRate}%`, deducted: pensionEmp });
    lines.push({ text: "AM income base", paidOut: amIncomeBase });
    lines.push({ text: "AM contribution", basis: amIncomeBase.toFixed(2), rate: `${amRate}%`, deducted: amContribution });
    lines.push({ text: `A-tax (Deduction: ${deduction.toLocaleString()} DKK)`, basis: aTaxBase.toFixed(2), rate: `${taxRate}%`, deducted: aTax });
    if (frokostAmt > 0) lines.push({ text: "Frokostordning", basis: "1.00", rate: frokostAmt.toFixed(2), deducted: frokostAmt });

    return { lines, netPay, gross, hours, hourlyRate, amContribution, aTax, pensionEmp, pensionCompany, atp, amIncomeBase, frokostAmt, sundhed };
  }, [grossSalary, month, year, taxDeduction, taxRate, pensionRate, companyPensionRate, atpAmount, sundhedsforsikring, frokost, greatPrayerDay, otherAdditions, amRate]);

  const handleCreate = () => {
    if (!selectedEmployee || !grossSalary) { toast.error("Select employee and enter salary"); return; }
    createMut.mutate({
      employeeId: parseInt(selectedEmployee), month: parseInt(month), year: parseInt(year),
      grossSalary: grossSalary, netPay: String(Math.round(calc.netPay * 100) / 100),
      currency: emp?.currency || "DKK",
      hoursWorked: String(calc.hours), hourlyRate: String(Math.round(calc.hourlyRate * 100) / 100),
      amContribution: String(Math.round(calc.amContribution * 100) / 100),
      aTax: String(Math.round(calc.aTax * 100) / 100),
      pension: String(Math.round(calc.pensionEmp * 100) / 100),
      atp: atpAmount,
      otherDeductions: String(Number(sundhedsforsikring) + Number(frokost)),
      otherAdditions: String(Number(greatPrayerDay) + Number(otherAdditions)),
      bankAccount: emp?.bankAccount || emp?.metadata?.bankAccount || undefined,
      deductionDetails: calc.lines,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payslips</h1>
            <p className="text-sm text-slate-500 mt-0.5">{payslips.length} payslips · {company?.name || "Company"}</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
            {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Close" : "Create Payslip"}
          </Button>
        </div>

        {/* ══ CREATE PAYSLIP FORM ══ */}
        {showForm && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Generate Payslip</h3>
              <p className="text-xs text-slate-500 mt-0.5">Select employee and period. Amounts auto-calculate based on salary.</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Employee + Period Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Employee</label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      {employees.map((e: any) => (
                        <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName} — {e.position}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Month</label>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Year</label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026, 2027, 2028].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Company + Employee Info */}
              {emp && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 rounded-lg p-4 text-sm">
                  <div>
                    <p className="font-bold text-slate-800 mb-1">{company?.name || "Company"}</p>
                    <p className="text-slate-500">{company?.address || "—"}</p>
                    <p className="text-slate-500">CVR: {company?.website?.includes("hilltop") ? "42891057" : "—"}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 mb-1">{emp.firstName} {emp.lastName}</p>
                    <p className="text-slate-500">Employee ID: EMP-{emp.id} · CPR: {emp.metadata?.cprNumber ? emp.metadata.cprNumber.substring(0, 4) + "-****" : "—"}</p>
                    <p className="text-slate-500">Dept: {emp.department} · Since: {emp.startDate ? new Date(emp.startDate).toLocaleDateString("en-GB") : "—"}</p>
                    <p className="text-slate-500">Bank: {emp.metadata?.bankAccount ? emp.metadata.bankAccount.substring(0, 4) + " **** " + emp.metadata.bankAccount.slice(-4) : "—"}</p>
                  </div>
                </div>
              )}

              {/* Salary Input */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Monthly Gross Salary ({emp?.currency || "DKK"})</label>
                <Input value={grossSalary} onChange={(e) => setGrossSalary(e.target.value)} className="text-lg font-bold max-w-xs" placeholder="45000" />
              </div>

              {/* Adjustable Rates */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <div><label className="text-[10px] text-slate-500 uppercase">Tax Deduction</label><Input value={taxDeduction} onChange={(e) => setTaxDeduction(e.target.value)} className="mt-0.5 h-8 text-sm" /></div>
                <div><label className="text-[10px] text-slate-500 uppercase">A-Tax Rate %</label><Input value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="mt-0.5 h-8 text-sm" /></div>
                <div><label className="text-[10px] text-slate-500 uppercase">Pension Emp %</label><Input value={pensionRate} onChange={(e) => setPensionRate(e.target.value)} className="mt-0.5 h-8 text-sm" /></div>
                <div><label className="text-[10px] text-slate-500 uppercase">Pension Co %</label><Input value={companyPensionRate} onChange={(e) => setCompanyPensionRate(e.target.value)} className="mt-0.5 h-8 text-sm" /></div>
                <div><label className="text-[10px] text-slate-500 uppercase">ATP</label><Input value={atpAmount} onChange={(e) => setAtpAmount(e.target.value)} className="mt-0.5 h-8 text-sm" /></div>
                <div><label className="text-[10px] text-slate-500 uppercase">Sundhedsfors.</label><Input value={sundhedsforsikring} onChange={(e) => setSundhedsforsikring(e.target.value)} className="mt-0.5 h-8 text-sm" /></div>
                <div><label className="text-[10px] text-slate-500 uppercase">Frokost</label><Input value={frokost} onChange={(e) => setFrokost(e.target.value)} className="mt-0.5 h-8 text-sm" /></div>
                <div><label className="text-[10px] text-slate-500 uppercase">Great Prayer Day</label><Input value={greatPrayerDay} onChange={(e) => setGreatPrayerDay(e.target.value)} className="mt-0.5 h-8 text-sm" /></div>
                <div><label className="text-[10px] text-slate-500 uppercase">Other Additions</label><Input value={otherAdditions} onChange={(e) => setOtherAdditions(e.target.value)} className="mt-0.5 h-8 text-sm" /></div>
              </div>

              {/* Payslip Preview */}
              {Number(grossSalary) > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex">
                    <span className="flex-1">Text</span>
                    <span className="w-20 text-right">Basis</span>
                    <span className="w-16 text-right">Rate</span>
                    <span className="w-24 text-right">Paid out</span>
                    <span className="w-24 text-right">Deducted</span>
                  </div>
                  {calc.lines.map((line, i) => (
                    <div key={i} className="flex px-4 py-2 border-b border-slate-100 text-sm hover:bg-slate-50">
                      <span className="flex-1 text-slate-700">{line.text}</span>
                      <span className="w-20 text-right text-slate-500 font-mono text-xs">{line.basis || ""}</span>
                      <span className="w-16 text-right text-slate-500 font-mono text-xs">{line.rate || ""}</span>
                      <span className="w-24 text-right font-medium text-emerald-700 font-mono text-xs">{line.paidOut ? line.paidOut.toLocaleString("da-DK", { minimumFractionDigits: 2 }) : ""}</span>
                      <span className="w-24 text-right font-medium text-red-600 font-mono text-xs">{line.deducted ? line.deducted.toLocaleString("da-DK", { minimumFractionDigits: 2 }) : ""}</span>
                    </div>
                  ))}
                  <div className="flex px-4 py-3 bg-teal-50 border-t-2 border-teal-200">
                    <span className="flex-1 font-bold text-teal-800">Net pay</span>
                    <span className="font-bold text-lg text-teal-700">{calc.netPay.toLocaleString("da-DK", { minimumFractionDigits: 2 })} {emp?.currency || "DKK"}</span>
                  </div>
                </div>
              )}

              {/* Create Button */}
              <div className="flex justify-end pt-2">
                <Button onClick={handleCreate} disabled={createMut.isPending || !selectedEmployee} className="bg-teal-600 hover:bg-teal-700 text-white px-8 h-11">
                  {createMut.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <FileText size={16} className="mr-2" />}
                  Create Payslip
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ══ PAYSLIPS LIST ══ */}
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
                const empData = employees.find((e: any) => e.id === p.employeeId);
                const isExpanded = expandedPayslip === p.id;
                return (
                  <>
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50 cursor-pointer" onClick={() => setExpandedPayslip(isExpanded ? null : p.id)}>
                      <td className="py-3 px-4 font-medium text-slate-800">{empData ? `${empData.firstName} ${empData.lastName}` : `#${p.employeeId}`}</td>
                      <td className="py-3 px-4 text-slate-600">{MONTHS[p.month - 1]} {p.year}</td>
                      <td className="py-3 px-4 text-right font-mono">{p.currency} {Number(p.grossSalary).toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-bold font-mono text-teal-700">{p.currency} {Number(p.netPay).toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={p.status === "sent" ? "bg-emerald-100 text-emerald-700" : p.status === "validated" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}>{p.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setViewingPayslip(p); }} className="text-slate-600"><FileText size={14} className="mr-1" />View</Button>
                        {p.status === "draft" && <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); validateMut.mutate({ id: p.id }); }}><Check size={14} className="mr-1" />Validate</Button>}
                        {p.status === "validated" && <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" onClick={(e) => { e.stopPropagation(); sendMut.mutate({ id: p.id }); }}><Send size={14} className="mr-1" />Send</Button>}
                        {p.status === "sent" && <span className="text-xs text-slate-400">Delivered</span>}
                        {isExpanded ? <ChevronUp size={14} className="inline text-slate-400" /> : <ChevronDown size={14} className="inline text-slate-400" />}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${p.id}-detail`}>
                        <td colSpan={6} className="bg-slate-50 px-6 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div><span className="text-slate-500">Hours:</span> <span className="font-medium">{p.hoursWorked || "—"}</span></div>
                            <div><span className="text-slate-500">Rate:</span> <span className="font-medium">{p.currency} {p.hourlyRate || "—"}/hr</span></div>
                            <div><span className="text-slate-500">AM (8%):</span> <span className="font-medium text-red-600">-{p.currency} {Number(p.amContribution).toLocaleString()}</span></div>
                            <div><span className="text-slate-500">A-Tax:</span> <span className="font-medium text-red-600">-{p.currency} {Number(p.aTax).toLocaleString()}</span></div>
                            <div><span className="text-slate-500">Pension:</span> <span className="font-medium text-red-600">-{p.currency} {Number(p.pension).toLocaleString()}</span></div>
                            <div><span className="text-slate-500">ATP:</span> <span className="font-medium text-red-600">-{p.currency} {Number(p.atp).toLocaleString()}</span></div>
                            <div><span className="text-slate-500">Bank:</span> <span className="font-medium">{p.bankAccount ? p.bankAccount.substring(0, 4) + " ****" : "—"}</span></div>
                            <div><span className="text-slate-500">Sent:</span> <span className="font-medium">{p.sentAt ? new Date(p.sentAt).toLocaleDateString("en-GB") : "—"}</span></div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {payslips.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-slate-400">No payslips yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ══ FULL PAYSLIP DOCUMENT VIEW ══ */}
        {viewingPayslip && (() => {
          const p = viewingPayslip;
          const empData = employees.find((e: any) => e.id === p.employeeId) as any;
          const gross = Number(p.grossSalary);
          const net = Number(p.netPay);
          const am = Number(p.amContribution);
          const tax = Number(p.aTax);
          const pen = Number(p.pension);
          const atpVal = Number(p.atp);
          const hours = Number(p.hoursWorked) || 160.33;
          const rate = Number(p.hourlyRate) || (gross / hours);
          return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto py-8">
              <div className="bg-white w-full max-w-[620px] rounded-xl shadow-2xl mx-4">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 sticky top-0 bg-white rounded-t-xl z-10">
                  <h3 className="font-bold text-slate-900">Payslip — {MONTHS[p.month - 1]} {p.year}</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.print()}>Download PDF</Button>
                    <Button variant="ghost" size="sm" onClick={() => setViewingPayslip(null)}><X size={16} /></Button>
                  </div>
                </div>

                {/* Document */}
                <div className="p-6 sm:p-8 text-[11px] sm:text-sm font-mono leading-tight" id="payslip-doc">
                  {/* Company + Employee Header */}
                  <div className="flex justify-between mb-6">
                    <div>
                      <p className="font-bold text-base">{company?.name || "Company"}</p>
                      <p className="text-slate-500">{company?.address || "—"}</p>
                      <p className="text-slate-500">CVR no.: {company?.website?.includes("hilltop") ? "42891057" : "36909587"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{empData?.firstName} {empData?.lastName}</p>
                      <p className="text-slate-500">CPR: {empData?.metadata?.cprNumber || empData?.cprNumber || "—"}</p>
                      <p className="text-slate-500">Emp ID: EMP-{empData?.id}</p>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-6 text-xs border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <div className="flex justify-between"><span className="text-slate-500">Department</span><span className="font-medium">{empData?.department || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Employment date</span><span className="font-medium">{empData?.startDate ? new Date(empData.startDate).toLocaleDateString("en-GB") : "—"}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Salary period</span><span className="font-medium">{new Date(p.salaryPeriodStart).toLocaleDateString("en-GB")} - {new Date(p.salaryPeriodEnd).toLocaleDateString("en-GB")}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Availability date</span><span className="font-medium">{new Date(p.salaryPeriodEnd).toLocaleDateString("en-GB")}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Account</span><span className="font-medium">{p.bankAccount || empData?.metadata?.bankAccount || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Currency</span><span className="font-medium">{p.currency}</span></div>
                  </div>

                  {/* Payslip Table */}
                  <table className="w-full text-[10px] sm:text-xs border border-slate-200 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-slate-800 text-white">
                        <th className="text-left py-2 px-3">Text</th>
                        <th className="text-right py-2 px-3 w-20">Basis</th>
                        <th className="text-right py-2 px-3 w-16">Rate</th>
                        <th className="text-right py-2 px-3 w-24">Paid out</th>
                        <th className="text-right py-2 px-3 w-24">Deducted</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100"><td className="py-2 px-3">Salary</td><td className="text-right px-3">{hours.toFixed(2)}</td><td className="text-right px-3">{rate.toFixed(2)}</td><td className="text-right px-3 text-emerald-700">{gross.toLocaleString("da-DK", {minimumFractionDigits: 2})}</td><td></td></tr>
                      <tr className="border-b border-slate-100"><td className="py-2 px-3">ATP of salary</td><td className="text-right px-3">{hours.toFixed(2)}</td><td></td><td></td><td className="text-right px-3 text-red-600">{atpVal.toFixed(2)}</td></tr>
                      <tr className="border-b border-slate-100"><td className="py-2 px-3">Pension - Employee ({((pen/gross)*100).toFixed(0)}%)</td><td className="text-right px-3">{gross.toLocaleString("da-DK")}</td><td className="text-right px-3">{((pen/gross)*100).toFixed(0)}%</td><td></td><td className="text-right px-3 text-red-600">{pen.toLocaleString("da-DK", {minimumFractionDigits: 2})}</td></tr>
                      <tr className="border-b border-slate-100"><td className="py-2 px-3">AM income base</td><td></td><td></td><td className="text-right px-3">{(gross - pen).toLocaleString("da-DK", {minimumFractionDigits: 2})}</td><td></td></tr>
                      <tr className="border-b border-slate-100"><td className="py-2 px-3">AM contribution</td><td className="text-right px-3">{(gross-pen).toLocaleString("da-DK")}</td><td className="text-right px-3">8%</td><td></td><td className="text-right px-3 text-red-600">{am.toLocaleString("da-DK", {minimumFractionDigits: 2})}</td></tr>
                      <tr className="border-b border-slate-100"><td className="py-2 px-3">A-tax</td><td className="text-right px-3">{(gross-pen-am).toLocaleString("da-DK")}</td><td className="text-right px-3">38%</td><td></td><td className="text-right px-3 text-red-600">{tax.toLocaleString("da-DK", {minimumFractionDigits: 2})}</td></tr>
                      {Number(p.otherDeductions) > 0 && <tr className="border-b border-slate-100"><td className="py-2 px-3">Other deductions</td><td></td><td></td><td></td><td className="text-right px-3 text-red-600">{Number(p.otherDeductions).toLocaleString("da-DK", {minimumFractionDigits: 2})}</td></tr>}
                    </tbody>
                    <tfoot>
                      <tr className="bg-teal-50 border-t-2 border-teal-300">
                        <td className="py-3 px-3 font-bold text-teal-800 text-sm" colSpan={3}>Net pay</td>
                        <td className="text-right px-3 font-bold text-lg text-teal-700" colSpan={2}>{net.toLocaleString("da-DK", {minimumFractionDigits: 2})} {p.currency}</td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Balance / Year-to-date */}
                  <div className="mt-6 border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <h4 className="text-xs font-bold text-slate-600 uppercase mb-2">Balance</h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div></div><div className="text-right font-bold text-slate-500">Period</div><div className="text-right font-bold text-slate-500">Year to date</div>
                      <div className="text-slate-600">AM income base</div><div className="text-right">{(gross-pen).toLocaleString("da-DK")}</div><div className="text-right">{((gross-pen)*p.month).toLocaleString("da-DK")}</div>
                      <div className="text-slate-600">A-tax</div><div className="text-right">{tax.toLocaleString("da-DK")}</div><div className="text-right">{(tax*p.month).toLocaleString("da-DK")}</div>
                      <div className="text-slate-600">AM contribution</div><div className="text-right">{am.toLocaleString("da-DK")}</div><div className="text-right">{(am*p.month).toLocaleString("da-DK")}</div>
                      <div className="text-slate-600">ATP</div><div className="text-right">{atpVal.toFixed(2)}</div><div className="text-right">{(atpVal*p.month).toFixed(2)}</div>
                      <div className="text-slate-600">Pension (employee)</div><div className="text-right">{pen.toLocaleString("da-DK")}</div><div className="text-right">{(pen*p.month).toLocaleString("da-DK")}</div>
                      <div className="text-slate-600">Hours</div><div className="text-right">{hours.toFixed(2)}</div><div className="text-right">{(hours*p.month).toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 text-center text-[10px] text-slate-400">
                    <p>Generated by SANI · {company?.name} · {new Date().toLocaleDateString("en-GB")}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </AdminLayout>
  );
}
