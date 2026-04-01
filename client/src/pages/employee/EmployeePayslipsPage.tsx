import EmployeeLayout from "@/components/EmployeeLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmployeePayslipsPage() {
  const { data: payroll = [] } = trpc.payroll.list.useQuery();

  const statusColors: Record<string, string> = {
    paid: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    processing: "bg-blue-50 text-blue-700",
  };

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-slate-900">My Payslips</h1><p className="text-sm text-slate-500 mt-1">View your salary history</p></div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Period</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Base Salary</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Bonus</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Deductions</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Net Pay</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {payroll.map((p: any) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-900">{p.payPeriod}</td>
                    <td className="py-3 px-4 text-slate-600">${Number(p.baseSalary || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-600">${Number(p.bonus || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-red-500">-${Number(p.deductions || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">${Number(p.netPay || 0).toLocaleString()}</td>
                    <td className="py-3 px-4"><Badge variant="outline" className={`text-xs capitalize ${statusColors[p.status] || ""}`}>{p.status}</Badge></td>
                  </tr>
                ))}
                {payroll.length === 0 && (
                  <tr><td colSpan={6} className="py-12 text-center text-slate-400">
                    <DollarSign size={40} className="mx-auto mb-3 text-slate-300" />
                    <p>No payslips available</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </EmployeeLayout>
  );
}
