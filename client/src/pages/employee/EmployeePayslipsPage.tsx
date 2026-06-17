import { useState, useMemo } from "react";
import EmployeeLayout from "@/components/EmployeeLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, X, Loader2 } from "lucide-react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function EmployeePayslipsPage() {
  const { data: payslips = [], isLoading } = trpc.payslip.myPayslips.useQuery();
  const { data: company } = trpc.company.get.useQuery(undefined, { retry: false });
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const { user } = trpc.useUtils().auth.me.getData() || {};

  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [viewingPayslip, setViewingPayslip] = useState<any>(null);

  const years = useMemo(() => {
    const yrs = [...new Set(payslips.map((p: any) => p.year))].sort((a: number, b: number) => b - a);
    return yrs.length ? yrs : [new Date().getFullYear()];
  }, [payslips]);

  const selectedPayslip = useMemo(() => {
    return payslips.find((p: any) => p.year === parseInt(selectedYear) && p.month === parseInt(selectedMonth));
  }, [payslips, selectedYear, selectedMonth]);

  const myEmployee = useMemo(() => {
    if (!employees.length) return null;
    return employees.find((e: any) => e.email === (user as any)?.email) as any;
  }, [employees, user]);

  if (isLoading) {
    return <EmployeeLayout><div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div></EmployeeLayout>;
  }

  return (
    <EmployeeLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Payslips</h1>
          <p className="text-sm text-slate-500 mt-0.5">View and download your monthly payslips</p>
        </div>

        {/* Year + Month Dropdowns */}
        <div className="flex items-center gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {years.map((y: any) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Month Payslip */}
        {selectedPayslip ? (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{MONTHS[selectedPayslip.month - 1]} {selectedPayslip.year}</h3>
                <p className="text-xs text-slate-500">
                  {new Date(selectedPayslip.salaryPeriodStart).toLocaleDateString("en-GB")} – {new Date(selectedPayslip.salaryPeriodEnd).toLocaleDateString("en-GB")}
                </p>
              </div>
              <Badge className={selectedPayslip.status === "sent" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                {selectedPayslip.status}
              </Badge>
            </div>

            {/* Salary Summary */}
            <div className="px-5 py-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Gross Salary</span>
                <span className="text-sm font-medium text-slate-800">{selectedPayslip.currency} {Number(selectedPayslip.grossSalary).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Total Deductions</span>
                <span className="text-sm font-medium text-red-600">
                  -{selectedPayslip.currency} {(Number(selectedPayslip.grossSalary) - Number(selectedPayslip.netPay)).toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-slate-200" />
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-teal-800">Net Pay</span>
                <span className="text-xl font-bold text-teal-700">{selectedPayslip.currency} {Number(selectedPayslip.netPay).toLocaleString()}</span>
              </div>
            </div>

            {/* Open Full Payslip */}
            <div className="px-5 py-3 border-t border-slate-100 flex justify-center">
              <Button onClick={() => setViewingPayslip(selectedPayslip)} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                <FileText size={16} /> View Full Payslip
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <FileText size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">No payslip for {MONTHS[parseInt(selectedMonth) - 1]} {selectedYear}</p>
          </div>
        )}

        {/* Full Payslip Document View */}
        {viewingPayslip && (() => {
          const p = viewingPayslip;
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
                    <Button variant="outline" size="sm" onClick={() => window.print()}><Download size={14} className="mr-1" /> PDF</Button>
                    <Button variant="ghost" size="sm" onClick={() => setViewingPayslip(null)}><X size={16} /></Button>
                  </div>
                </div>

                {/* Document */}
                <div className="p-6 text-[11px] font-mono leading-tight" id="payslip-doc">
                  {/* Header */}
                  <div className="flex justify-between mb-5">
                    <div>
                      <p className="font-bold text-sm">{company?.name || "Company"}</p>
                      <p className="text-slate-500">{company?.address || ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{myEmployee?.firstName} {myEmployee?.lastName}</p>
                      <p className="text-slate-500">ID: EMP-{myEmployee?.id}</p>
                      <p className="text-slate-500">{myEmployee?.department}</p>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-5 border border-slate-200 rounded-lg p-3 bg-slate-50 text-[10px]">
                    <div className="flex justify-between"><span className="text-slate-500">Salary period</span><span>{new Date(p.salaryPeriodStart).toLocaleDateString("en-GB")} – {new Date(p.salaryPeriodEnd).toLocaleDateString("en-GB")}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Payment date</span><span>{new Date(p.salaryPeriodEnd).toLocaleDateString("en-GB")}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Bank account</span><span>{p.bankAccount || "—"}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Currency</span><span>{p.currency}</span></div>
                  </div>

                  {/* Table */}
                  <table className="w-full text-[10px] border border-slate-200 rounded overflow-hidden mb-5">
                    <thead>
                      <tr className="bg-slate-800 text-white">
                        <th className="text-left py-1.5 px-2">Text</th>
                        <th className="text-right py-1.5 px-2 w-16">Basis</th>
                        <th className="text-right py-1.5 px-2 w-12">Rate</th>
                        <th className="text-right py-1.5 px-2 w-20">Paid out</th>
                        <th className="text-right py-1.5 px-2 w-20">Deducted</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100"><td className="py-1.5 px-2">Salary</td><td className="text-right px-2">{hours.toFixed(2)}</td><td className="text-right px-2">{rate.toFixed(2)}</td><td className="text-right px-2 text-emerald-700">{gross.toLocaleString("da-DK", {minimumFractionDigits: 2})}</td><td></td></tr>
                      <tr className="border-b border-slate-100"><td className="py-1.5 px-2">ATP</td><td className="text-right px-2">{hours.toFixed(2)}</td><td></td><td></td><td className="text-right px-2 text-red-600">{atpVal.toFixed(2)}</td></tr>
                      <tr className="border-b border-slate-100"><td className="py-1.5 px-2">Pension ({gross > 0 ? ((pen/gross)*100).toFixed(0) : 0}%)</td><td className="text-right px-2">{gross.toLocaleString("da-DK")}</td><td className="text-right px-2">{gross > 0 ? ((pen/gross)*100).toFixed(0) : 0}%</td><td></td><td className="text-right px-2 text-red-600">{pen.toLocaleString("da-DK", {minimumFractionDigits: 2})}</td></tr>
                      <tr className="border-b border-slate-100"><td className="py-1.5 px-2">AM contribution (8%)</td><td className="text-right px-2">{(gross-pen).toLocaleString("da-DK")}</td><td className="text-right px-2">8%</td><td></td><td className="text-right px-2 text-red-600">{am.toLocaleString("da-DK", {minimumFractionDigits: 2})}</td></tr>
                      <tr className="border-b border-slate-100"><td className="py-1.5 px-2">A-tax (38%)</td><td className="text-right px-2">{(gross-pen-am).toLocaleString("da-DK")}</td><td className="text-right px-2">38%</td><td></td><td className="text-right px-2 text-red-600">{tax.toLocaleString("da-DK", {minimumFractionDigits: 2})}</td></tr>
                      {Number(p.otherDeductions) > 0 && <tr className="border-b border-slate-100"><td className="py-1.5 px-2">Other deductions</td><td></td><td></td><td></td><td className="text-right px-2 text-red-600">{Number(p.otherDeductions).toLocaleString("da-DK", {minimumFractionDigits: 2})}</td></tr>}
                    </tbody>
                    <tfoot>
                      <tr className="bg-teal-50 border-t-2 border-teal-300">
                        <td className="py-2.5 px-2 font-bold text-teal-800" colSpan={3}>Net pay</td>
                        <td className="text-right px-2 font-bold text-teal-700 text-sm" colSpan={2}>{net.toLocaleString("da-DK", {minimumFractionDigits: 2})} {p.currency}</td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Footer */}
                  <p className="text-center text-[9px] text-slate-400">Generated by SANI · {company?.name} · {new Date().toLocaleDateString("en-GB")}</p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </EmployeeLayout>
  );
}
