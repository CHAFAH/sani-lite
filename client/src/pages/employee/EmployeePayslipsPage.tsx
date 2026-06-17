import { useState, useMemo } from "react";
import EmployeeLayout from "@/components/EmployeeLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, X, Loader2 } from "lucide-react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function EmployeePayslipsPage() {
  const { data: payslips = [], isLoading } = trpc.payslip.myPayslips.useQuery();
  const { data: company } = trpc.company.get.useQuery(undefined, { retry: false });
  const { data: employees = [] } = trpc.employee.list.useQuery();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [viewingPayslip, setViewingPayslip] = useState<any>(null);

  // 7 years back
  const years = useMemo(() => Array.from({ length: 7 }, (_, i) => currentYear - i), [currentYear]);

  const yearPayslips = useMemo(() =>
    payslips.filter((p: any) => p.year === parseInt(selectedYear)).sort((a: any, b: any) => a.month - b.month),
    [payslips, selectedYear]
  );

  const myEmployee = useMemo(() => {
    return employees.find((e: any) => payslips.some((p: any) => p.employeeId === e.id)) as any;
  }, [employees, payslips]);

  if (isLoading) {
    return <EmployeeLayout><div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div></EmployeeLayout>;
  }

  return (
    <EmployeeLayout>
      <div className="max-w-lg mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Payslips</h1>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px] h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Month List */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {yearPayslips.length > 0 ? (
            yearPayslips.map((p: any) => (
              <button
                key={p.id}
                onClick={() => setViewingPayslip(p)}
                className="w-full flex items-center justify-between px-5 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-medium text-slate-800">{MONTHS[p.month - 1]}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-900">{p.currency} {Number(p.netPay).toLocaleString()}</span>
                  <FileText size={18} className="text-teal-600" />
                </div>
              </button>
            ))
          ) : (
            <div className="px-5 py-12 text-center text-slate-400">
              <FileText size={32} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No payslips for {selectedYear}</p>
            </div>
          )}
        </div>

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
            <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto py-6">
              <div className="bg-white w-full max-w-[620px] rounded-xl shadow-2xl mx-4">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 sticky top-0 bg-white rounded-t-xl z-10">
                  <h3 className="font-bold text-slate-900 text-sm">{MONTHS[p.month - 1]} {p.year}</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5"><Download size={14} /> Download</Button>
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
                      <p className="text-slate-500">{myEmployee?.department}</p>
                      <p className="text-slate-500">EMP-{myEmployee?.id}</p>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-5 border border-slate-200 rounded-lg p-3 bg-slate-50 text-[10px]">
                    <div className="flex justify-between"><span className="text-slate-500">Salary period</span><span>{new Date(p.salaryPeriodStart).toLocaleDateString("en-GB")} – {new Date(p.salaryPeriodEnd).toLocaleDateString("en-GB")}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Payment date</span><span>{new Date(p.salaryPeriodEnd).toLocaleDateString("en-GB")}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Bank account</span><span>{p.bankAccount ? p.bankAccount.substring(0, 4) + " ****" : "—"}</span></div>
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
                      {p.deductionDetails && Array.isArray(p.deductionDetails) ? (
                        p.deductionDetails.map((line: any, idx: number) => (
                          <tr key={idx} className="border-b border-slate-100">
                            <td className="py-1.5 px-2">{line.text}</td>
                            <td className="text-right px-2">{line.basis || ""}</td>
                            <td className="text-right px-2">{line.rate || ""}</td>
                            <td className="text-right px-2 text-emerald-700">{line.paidOut ? Number(line.paidOut).toLocaleString("da-DK", {minimumFractionDigits: 2}) : ""}</td>
                            <td className="text-right px-2 text-red-600">{line.deducted ? Number(line.deducted).toLocaleString("da-DK", {minimumFractionDigits: 2}) : ""}</td>
                          </tr>
                        ))
                      ) : (
                        <>
                          <tr className="border-b border-slate-100"><td className="py-1.5 px-2">Salary</td><td className="text-right px-2">{hours.toFixed(2)}</td><td className="text-right px-2">{rate.toFixed(2)}</td><td className="text-right px-2 text-emerald-700">{gross.toLocaleString("da-DK", {minimumFractionDigits: 2})}</td><td></td></tr>
                          <tr className="border-b border-slate-100"><td className="py-1.5 px-2">ATP</td><td></td><td></td><td></td><td className="text-right px-2 text-red-600">{atpVal.toFixed(2)}</td></tr>
                          <tr className="border-b border-slate-100"><td className="py-1.5 px-2">Pension</td><td></td><td></td><td></td><td className="text-right px-2 text-red-600">{pen.toLocaleString("da-DK", {minimumFractionDigits: 2})}</td></tr>
                          <tr className="border-b border-slate-100"><td className="py-1.5 px-2">AM contribution (8%)</td><td></td><td className="text-right px-2">8%</td><td></td><td className="text-right px-2 text-red-600">{am.toLocaleString("da-DK", {minimumFractionDigits: 2})}</td></tr>
                          <tr className="border-b border-slate-100"><td className="py-1.5 px-2">A-tax (38%)</td><td></td><td className="text-right px-2">38%</td><td></td><td className="text-right px-2 text-red-600">{tax.toLocaleString("da-DK", {minimumFractionDigits: 2})}</td></tr>
                        </>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-teal-50 border-t-2 border-teal-300">
                        <td className="py-2.5 px-2 font-bold text-teal-800" colSpan={3}>Net pay</td>
                        <td className="text-right px-2 font-bold text-teal-700 text-sm" colSpan={2}>{net.toLocaleString("da-DK", {minimumFractionDigits: 2})} {p.currency}</td>
                      </tr>
                    </tfoot>
                  </table>

                  <p className="text-center text-[9px] text-slate-400">Generated by SANI · {company?.name}</p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </EmployeeLayout>
  );
}
