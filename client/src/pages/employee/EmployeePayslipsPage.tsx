import { useState, useMemo } from "react";
import EmployeeLayout from "@/components/EmployeeLayout";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, DollarSign } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function EmployeePayslipsPage() {
  const { data: payslips = [], isLoading } = trpc.payslip.myPayslips.useQuery();
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const years = useMemo(() => {
    const yrs = [...new Set(payslips.map((p: any) => p.year))].sort((a: number, b: number) => b - a);
    return yrs.length ? yrs : [new Date().getFullYear()];
  }, [payslips]);

  const yearPayslips = useMemo(() => payslips.filter((p: any) => p.year === parseInt(selectedYear)), [payslips, selectedYear]);
  const selectedPayslip = useMemo(() => selectedMonth !== null ? yearPayslips.find((p: any) => p.month === selectedMonth) : null, [yearPayslips, selectedMonth]);

  const yearTotal = useMemo(() => yearPayslips.reduce((sum: number, p: any) => sum + Number(p.netPay), 0), [yearPayslips]);

  return (
    <EmployeeLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Payslips</h1>
            <p className="text-sm text-slate-500 mt-0.5">View and download your monthly payslips</p>
          </div>
          <Select value={selectedYear} onValueChange={(v) => { setSelectedYear(v); setSelectedMonth(null); }}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {years.map((y: any) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Year Summary */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-600 uppercase">Year Total ({selectedYear})</h3>
            <span className="text-xl font-bold text-teal-700">{yearPayslips[0]?.currency || "DKK"} {yearTotal.toLocaleString()}</span>
          </div>
          <div className="text-xs text-slate-400">{yearPayslips.length} payslip{yearPayslips.length !== 1 ? "s" : ""} this year</div>
        </div>

        {/* Month Grid */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700">Monthly Breakdown</h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-0">
            {MONTHS.map((m, i) => {
              const payslip = yearPayslips.find((p: any) => p.month === i + 1);
              const isSelected = selectedMonth === i + 1;
              return (
                <button
                  key={i}
                  onClick={() => payslip && setSelectedMonth(i + 1)}
                  disabled={!payslip}
                  className={`flex flex-col items-center py-4 px-2 border-b border-r border-slate-100 transition-all ${
                    isSelected ? "bg-teal-50 ring-2 ring-inset ring-teal-500" :
                    payslip ? "hover:bg-slate-50 cursor-pointer" : "opacity-40 cursor-default"
                  }`}
                >
                  <span className={`text-xs font-semibold ${isSelected ? "text-teal-700" : "text-slate-600"}`}>{m}</span>
                  {payslip ? (
                    <span className={`text-sm font-bold mt-1 ${isSelected ? "text-teal-700" : "text-slate-800"}`}>
                      {Number(payslip.netPay).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300 mt-1">—</span>
                  )}
                  {payslip && (
                    <Badge className={`mt-1.5 text-[9px] ${payslip.status === "sent" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {payslip.status}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Payslip Detail */}
        {selectedPayslip && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {MONTH_FULL[(selectedPayslip as any).month - 1]} {(selectedPayslip as any).year}
                </h3>
                <p className="text-xs text-slate-500">Salary period: {new Date((selectedPayslip as any).salaryPeriodStart).toLocaleDateString("en-GB")} – {new Date((selectedPayslip as any).salaryPeriodEnd).toLocaleDateString("en-GB")}</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors">
                <Download size={14} /> PDF
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              <Row label="Gross Salary" value={`${(selectedPayslip as any).currency} ${Number((selectedPayslip as any).grossSalary).toLocaleString()}`} bold />
              <Row label="Hours Worked" value={(selectedPayslip as any).hoursWorked || "—"} />
              <Row label="Hourly Rate" value={(selectedPayslip as any).hourlyRate ? `${(selectedPayslip as any).currency} ${(selectedPayslip as any).hourlyRate}` : "—"} />

              <div className="px-5 py-2 bg-slate-50"><span className="text-[11px] font-bold text-slate-500 uppercase">Deductions</span></div>
              <Row label="AM Contribution (8%)" value={`-${(selectedPayslip as any).currency} ${Number((selectedPayslip as any).amContribution).toLocaleString()}`} red />
              <Row label="A-Tax (38%)" value={`-${(selectedPayslip as any).currency} ${Number((selectedPayslip as any).aTax).toLocaleString()}`} red />
              <Row label="Pension (3%)" value={`-${(selectedPayslip as any).currency} ${Number((selectedPayslip as any).pension).toLocaleString()}`} red />
              <Row label="ATP" value={`-${(selectedPayslip as any).currency} ${Number((selectedPayslip as any).atp).toLocaleString()}`} red />
              {Number((selectedPayslip as any).otherDeductions) > 0 && (
                <Row label="Other Deductions" value={`-${(selectedPayslip as any).currency} ${Number((selectedPayslip as any).otherDeductions).toLocaleString()}`} red />
              )}

              <div className="px-5 py-4 bg-teal-50 flex items-center justify-between">
                <span className="text-base font-bold text-teal-800">Net Pay</span>
                <span className="text-xl font-bold text-teal-700">{(selectedPayslip as any).currency} {Number((selectedPayslip as any).netPay).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {!selectedPayslip && yearPayslips.length > 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">Select a month above to view payslip details</div>
        )}

        {yearPayslips.length === 0 && !isLoading && (
          <div className="text-center py-12 text-slate-400">
            <FileText size={40} className="mx-auto mb-3 text-slate-300" />
            <p>No payslips for {selectedYear}</p>
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
}

function Row({ label, value, bold, red }: { label: string; value: string; bold?: boolean; red?: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className={`text-sm ${bold ? "font-semibold text-slate-800" : "text-slate-600"}`}>{label}</span>
      <span className={`text-sm font-medium ${red ? "text-red-600" : bold ? "font-bold text-slate-900" : "text-slate-800"}`}>{value}</span>
    </div>
  );
}
