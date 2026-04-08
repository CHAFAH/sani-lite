import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, Download, FileText, Calendar, TrendingUp,
  Heart, Shield, Activity, Stethoscope, Dumbbell, Gift,
  CheckCircle2, Clock, AlertCircle, Eye, Building2,
} from "lucide-react";
import { toast } from "sonner";

const PLAN_TYPES: Record<string, { icon: any; color: string }> = {
  health: { icon: Stethoscope, color: "text-red-500 bg-red-50" },
  dental: { icon: Activity, color: "text-blue-500 bg-blue-50" },
  vision: { icon: Eye, color: "text-indigo-500 bg-indigo-50" },
  life: { icon: Shield, color: "text-emerald-500 bg-emerald-50" },
  pension: { icon: Building2, color: "text-amber-500 bg-amber-50" },
  wellness: { icon: Dumbbell, color: "text-teal-500 bg-teal-50" },
  perks: { icon: Gift, color: "text-violet-500 bg-violet-50" },
};

export default function EmployeePayrollBenefitsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"payslips" | "benefits" | "compensation">("payslips");

  // Mock payslips
  const payslips = [
    { id: 1, period: "March 2026", date: "2026-03-31", grossPay: 8333, deductions: 2083, netPay: 6250, status: "paid" },
    { id: 2, period: "February 2026", date: "2026-02-28", grossPay: 8333, deductions: 2083, netPay: 6250, status: "paid" },
    { id: 3, period: "January 2026", date: "2026-01-31", grossPay: 8333, deductions: 2083, netPay: 6250, status: "paid" },
    { id: 4, period: "December 2025", date: "2025-12-31", grossPay: 8333, deductions: 2083, netPay: 6250, status: "paid" },
    { id: 5, period: "November 2025", date: "2025-11-30", grossPay: 8333, deductions: 2083, netPay: 6250, status: "paid" },
    { id: 6, period: "October 2025", date: "2025-10-31", grossPay: 7917, deductions: 1979, netPay: 5938, status: "paid" },
  ];

  // Mock benefits
  const myBenefits = [
    { type: "health", name: "Premium Health Plan", provider: "Aetna", monthlyCost: 450, employerPays: 360, youPay: 90, enrolled: true },
    { type: "dental", name: "Standard Dental", provider: "Delta Dental", monthlyCost: 45, employerPays: 45, youPay: 0, enrolled: true },
    { type: "vision", name: "Vision Care Plus", provider: "VSP", monthlyCost: 25, employerPays: 25, youPay: 0, enrolled: true },
    { type: "life", name: "Group Life Insurance", provider: "MetLife", monthlyCost: 30, employerPays: 30, youPay: 0, enrolled: true },
    { type: "pension", name: "Company 401k Match", provider: "Fidelity", monthlyCost: 0, employerPays: 0, youPay: 0, enrolled: true },
    { type: "wellness", name: "Wellness Stipend", provider: "Internal", monthlyCost: 100, employerPays: 100, youPay: 0, enrolled: false },
  ];

  const totalYouPay = myBenefits.filter(b => b.enrolled).reduce((s, b) => s + b.youPay, 0);
  const totalEmployerPays = myBenefits.filter(b => b.enrolled).reduce((s, b) => s + b.employerPays, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Pay & Benefits</h1>
        <p className="text-sm text-slate-500 mt-1">View your payslips, benefits enrollment, and compensation details</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-2">
              <DollarSign size={20} className="text-teal-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">$6,250</p>
            <p className="text-xs text-slate-500 mt-1">Last Net Pay</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-2">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">Mar 31</p>
            <p className="text-xs text-slate-500 mt-1">Next Pay Date</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center mb-2">
              <Heart size={20} className="text-rose-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{myBenefits.filter(b => b.enrolled).length}</p>
            <p className="text-xs text-slate-500 mt-1">Active Benefits</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-2">
              <TrendingUp size={20} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">${totalEmployerPays}/mo</p>
            <p className="text-xs text-slate-500 mt-1">Employer Benefits Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {(["payslips", "benefits", "compensation"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "payslips" ? "Payslips" : tab === "benefits" ? "My Benefits" : "Compensation"}
          </button>
        ))}
      </div>

      {/* Payslips Tab */}
      {activeTab === "payslips" && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Payslip History</h3>
                <p className="text-xs text-slate-500 mt-0.5">Download your monthly payslips</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.info("Download all coming soon")}>
                <Download size={14} className="mr-1" />Download All
              </Button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Period</th>
                  <th className="px-5 py-3 text-right">Gross Pay</th>
                  <th className="px-5 py-3 text-right">Deductions</th>
                  <th className="px-5 py-3 text-right">Net Pay</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payslips.map(slip => (
                  <tr key={slip.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-slate-900">{slip.period}</p>
                      <p className="text-xs text-slate-500">{new Date(slip.date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-900 text-right">${slip.grossPay.toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm text-red-500 text-right">-${slip.deductions.toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm text-slate-900 text-right font-bold">${slip.netPay.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <Badge variant="outline" className="text-xs border-0 bg-emerald-50 text-emerald-700 capitalize">
                        {slip.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Button variant="ghost" size="sm" className="h-7" onClick={() => toast.info("Download payslip coming soon")}>
                        <Download size={14} className="mr-1" />PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Benefits Tab */}
      {activeTab === "benefits" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Your monthly contribution: <span className="font-bold text-slate-900">${totalYouPay}</span></p>
              <p className="text-xs text-slate-500">Employer contribution: ${totalEmployerPays}/month</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.info("Open enrollment coming soon")}>
              Open Enrollment
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myBenefits.map((benefit, i) => {
              const typeConfig = PLAN_TYPES[benefit.type] || { icon: Heart, color: "bg-slate-100 text-slate-500" };
              const Icon = typeConfig.icon;
              return (
                <Card key={i} className={`border-0 shadow-sm ${!benefit.enrolled ? "opacity-60" : ""}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeConfig.color}`}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">{benefit.name}</h3>
                          <p className="text-xs text-slate-500">{benefit.provider}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-xs border-0 ${
                        benefit.enrolled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {benefit.enrolled ? "Enrolled" : "Not Enrolled"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-slate-500">Monthly Cost</p>
                        <p className="text-sm font-semibold text-slate-900">${benefit.monthlyCost}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Employer Pays</p>
                        <p className="text-sm font-semibold text-teal-600">${benefit.employerPays}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">You Pay</p>
                        <p className="text-sm font-semibold text-slate-900">${benefit.youPay}</p>
                      </div>
                    </div>
                    {!benefit.enrolled && (
                      <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => toast.info("Enrollment coming soon")}>
                        Enroll Now
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Compensation Tab */}
      {activeTab === "compensation" && (
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Total Compensation Breakdown</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { label: "Base Salary", value: "$100,000", period: "Annual", color: "text-slate-900" },
                  { label: "Annual Bonus (Target)", value: "$10,000", period: "10% of base", color: "text-emerald-600" },
                  { label: "Equity (Vesting)", value: "$5,000", period: "Annual value", color: "text-violet-600" },
                  { label: "Health Benefits", value: "$4,320", period: "Employer contribution", color: "text-rose-600" },
                  { label: "Retirement Match", value: "$4,000", period: "4% match", color: "text-amber-600" },
                  { label: "Other Benefits", value: "$3,600", period: "Wellness + perks", color: "text-teal-600" },
                ].map((item, i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.period}</p>
                    </div>
                    <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
                <div className="px-5 py-4 bg-slate-50 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900">Total Compensation</p>
                  <p className="text-lg font-bold text-teal-600">$126,920</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-900 mb-3">Compensation History</h3>
              <div className="space-y-3">
                {[
                  { date: "Jan 2026", event: "Annual Review", change: "+5%", newSalary: "$100,000" },
                  { date: "Jul 2025", event: "Promotion to Senior", change: "+15%", newSalary: "$95,238" },
                  { date: "Jan 2025", event: "Annual Review", change: "+3%", newSalary: "$82,816" },
                  { date: "Jun 2024", event: "Hired", change: "—", newSalary: "$80,400" },
                ].map((entry, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <TrendingUp size={14} className="text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{entry.event}</p>
                      <p className="text-xs text-slate-500">{entry.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{entry.newSalary}</p>
                      <p className="text-xs text-emerald-600">{entry.change}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
