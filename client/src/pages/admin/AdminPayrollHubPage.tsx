import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Receipt, Plus, Check, Play, Calendar, DollarSign,
  Clock, CheckCircle2, ArrowUpRight, Loader2, FileText,
  AlertCircle,
} from "lucide-react";
import GlobalPayrollMap from "@/components/GlobalPayrollMap";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell,
} from "recharts";

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: React.ElementType; label: string }> = {
  draft: { bg: "bg-slate-50", text: "text-slate-600", icon: FileText, label: "Draft" },
  approved: { bg: "bg-blue-50", text: "text-blue-700", icon: Check, label: "Approved" },
  processing: { bg: "bg-amber-50", text: "text-amber-700", icon: Loader2, label: "Processing" },
  paid: { bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2, label: "Paid" },
};

const CHART_COLORS = ["#0D9488", "#F59E0B", "#6366F1", "#EC4899", "#10B981", "#8B5CF6"];

export default function AdminPayrollHubPage() {
  const { data: cycles = [] } = trpc.payrollCycle.list.useQuery();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const utils = trpc.useUtils();

  const createMut = trpc.payrollCycle.create.useMutation({
    onSuccess: () => { utils.payrollCycle.list.invalidate(); toast.success("Cycle created"); setShowAdd(false); },
  });
  const approveMut = trpc.payrollCycle.approve.useMutation({
    onSuccess: () => { utils.payrollCycle.list.invalidate(); toast.success("Approved"); },
  });
  const processMut = trpc.payrollCycle.process.useMutation({
    onSuccess: () => { utils.payrollCycle.list.invalidate(); toast.success("Processing"); },
  });
  const paidMut = trpc.payrollCycle.markPaid.useMutation({
    onSuccess: () => { utils.payrollCycle.list.invalidate(); toast.success("Paid"); },
  });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", periodStart: "", periodEnd: "", payDate: "" });

  const totalPayroll = useMemo(() => {
    return employees.reduce((sum: number, e: any) => sum + (Number(e.salary) || 0), 0);
  }, [employees]);

  const draftCount = cycles.filter((c: any) => c.status === "draft").length;
  const paidCount = cycles.filter((c: any) => c.status === "paid").length;
  const processingCount = cycles.filter((c: any) => c.status === "processing" || c.status === "approved").length;

  /* Chart: cycles by month */
  const cycleChartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((month, i) => ({
      month,
      cycles: cycles.filter((c: any) => {
        const d = new Date(c.periodStart);
        return d.getMonth() === i;
      }).length,
    }));
  }, [cycles]);

  /* Sort cycles: draft first, then approved, processing, paid */
  const sortedCycles = useMemo(() => {
    const order: Record<string, number> = { draft: 0, approved: 1, processing: 2, paid: 3 };
    return [...cycles].sort((a: any, b: any) => (order[a.status] ?? 4) - (order[b.status] ?? 4));
  }, [cycles]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payroll Hub</h1>
            <p className="text-sm text-slate-500 mt-1">Manage payroll cycles, approvals, and processing</p>
          </div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                <Plus size={16} className="mr-2" />New Cycle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Payroll Cycle</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Cycle Name</Label>
                  <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. March 2026" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Period Start</Label><Input type="date" value={form.periodStart} onChange={e => setForm(p => ({ ...p, periodStart: e.target.value }))} /></div>
                  <div><Label>Period End</Label><Input type="date" value={form.periodEnd} onChange={e => setForm(p => ({ ...p, periodEnd: e.target.value }))} /></div>
                </div>
                <div><Label>Pay Date</Label><Input type="date" value={form.payDate} onChange={e => setForm(p => ({ ...p, payDate: e.target.value }))} /></div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button
                  onClick={() => { if (!form.name) { toast.error("Name required"); return; } createMut.mutate(form); }}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Create Cycle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPI Stat Cards — matching dashboard design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                  <Receipt size={16} className="text-teal-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{cycles.length}</p>
              <p className="text-xs text-slate-400 mt-1">Total Cycles</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock size={16} className="text-amber-600" />
                </div>
                {draftCount > 0 && (
                  <span className="ml-auto text-xs font-medium flex items-center gap-0.5 text-amber-600">
                    <AlertCircle size={12} />{draftCount} pending
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{processingCount + draftCount}</p>
              <p className="text-xs text-slate-400 mt-1">In Progress</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
                <span className="ml-auto text-xs font-medium flex items-center gap-0.5 text-emerald-600">
                  <ArrowUpRight size={12} />Completed
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{paidCount}</p>
              <p className="text-xs text-slate-400 mt-1">Paid Cycles</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <DollarSign size={16} className="text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">
                ${(totalPayroll / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-slate-400 mt-1">Monthly Budget</p>
            </CardContent>
          </Card>
        </div>

        {/* Cycles Activity Chart */}
        {/* Global Payroll Map */}
        <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">Global Coverage</h2>
              <Badge variant="outline" className="text-xs text-slate-500">Live</Badge>
            </div>
            <GlobalPayrollMap
              src="/__manus__/payroll-globe-small.webp"
              markers={[
                { id: "americas", title: "Americas", top: "48%", left: "23%", status: "ok" as const },
                { id: "europe", title: "Europe", top: "32%", left: "55%", status: "live" as const },
                { id: "apac", title: "APAC", top: "56%", left: "78%", status: "live" as const },
              ]}
            />
          </CardContent>
        </Card>
        <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">Payroll Cycles by Month</h2>
              <Badge variant="outline" className="text-xs text-slate-500">{cycles.length} total cycles</Badge>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cycleChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="cycles" radius={[6, 6, 0, 0]} maxBarSize={32}>
                  {cycleChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payroll Cycles Grid */}
        <div>
          <h2 className="text-base font-semibold text-slate-900 mb-4">Payroll Cycles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedCycles.map((c: any) => {
              const config = STATUS_CONFIG[c.status] || STATUS_CONFIG.draft;
              const StatusIcon = config.icon;
              return (
                <Card key={c.id} className="border border-slate-100 shadow-sm bg-white rounded-2xl hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                          <StatusIcon size={18} className={config.text} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 text-sm">{c.name}</h3>
                          <Badge variant="outline" className={`text-[10px] capitalize mt-0.5 border-0 ${config.bg} ${config.text}`}>
                            {config.label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar size={12} />
                        <span>Period: {new Date(c.periodStart).toLocaleDateString()} — {new Date(c.periodEnd).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <DollarSign size={12} />
                        <span>Pay Date: {new Date(c.payDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {c.status === "draft" && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex-1"
                          onClick={() => approveMut.mutate({ id: c.id })}
                        >
                          <Check size={14} className="mr-1" />Approve
                        </Button>
                      )}
                      {c.status === "approved" && (
                        <Button
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs flex-1"
                          onClick={() => processMut.mutate({ id: c.id })}
                        >
                          <Play size={14} className="mr-1" />Process
                        </Button>
                      )}
                      {c.status === "processing" && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex-1"
                          onClick={() => paidMut.mutate({ id: c.id })}
                        >
                          <CheckCircle2 size={14} className="mr-1" />Mark Paid
                        </Button>
                      )}
                      {c.status === "paid" && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 size={14} />Completed
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {cycles.length === 0 && (
              <div className="col-span-full">
                <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
                  <CardContent className="py-16 text-center">
                    <Receipt size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm text-slate-500 mb-1">No payroll cycles yet</p>
                    <p className="text-xs text-slate-400">Click "New Cycle" to create your first payroll cycle</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
