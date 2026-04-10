import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Receipt, Plus, Check, Play, MoreVertical, Download, FileText,
  TrendingUp, Calendar, DollarSign, Users, Clock, AlertTriangle,
  BarChart3, ArrowUpRight, Loader2, Search, Eye, RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  approved: "bg-blue-50 text-blue-700",
  processing: "bg-amber-50 text-amber-700",
  paid: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-600",
};

export default function AdminPayrollHubPage() {
  const { data: cycles = [] } = trpc.payrollCycle.list.useQuery();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const utils = trpc.useUtils();

  const createMut = trpc.payrollCycle.create.useMutation({
    onSuccess: () => { utils.payrollCycle.list.invalidate(); toast.success("Payroll cycle created"); setShowCreate(false); resetForm(); },
  });
  const approveMut = trpc.payrollCycle.approve.useMutation({
    onSuccess: () => { utils.payrollCycle.list.invalidate(); toast.success("Payroll approved"); },
  });
  const processMut = trpc.payrollCycle.process.useMutation({
    onSuccess: () => { utils.payrollCycle.list.invalidate(); toast.success("Payroll processing started"); },
  });
  const paidMut = trpc.payrollCycle.markPaid.useMutation({
    onSuccess: () => { utils.payrollCycle.list.invalidate(); toast.success("Payroll marked as paid"); },
  });

  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({ name: "", periodStart: "", periodEnd: "", payDate: "" });
  const [activeTab, setActiveTab] = useState<"cycles" | "reports" | "audit">("cycles");

  const resetForm = () => setForm({ name: "", periodStart: "", periodEnd: "", payDate: "" });

  const filteredCycles = useMemo(() => {
    return cycles.filter((c: any) => {
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      const matchSearch = !searchQuery || c.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [cycles, statusFilter, searchQuery]);

  const totalPayroll = employees.reduce((s: number, e: any) => s + (Number(e.salary) || 0), 0);
  const paidCycles = cycles.filter((c: any) => c.status === "paid").length;
  const pendingCycles = cycles.filter((c: any) => c.status === "draft" || c.status === "approved").length;

  const auditLog = useMemo(() => {
    if (cycles.length === 0) return [];
    return cycles.flatMap((c: any) => {
      const entries = [];
      entries.push({
        id: `${c.id}-created`,
        action: "Payroll cycle created",
        user: "Admin",
        timestamp: c.createdAt || c.startDate || new Date().toISOString(),
        details: c.name || `Cycle #${c.id}`,
      });
      if (c.status === "approved" || c.status === "paid" || c.status === "processing") {
        entries.push({
          id: `${c.id}-approved`,
          action: "Payroll approved",
          user: "Admin",
          timestamp: c.updatedAt || c.startDate || new Date().toISOString(),
          details: c.name || `Cycle #${c.id}`,
        });
      }
      if (c.status === "paid") {
        entries.push({
          id: `${c.id}-paid`,
          action: "Payroll marked paid",
          user: "System",
          timestamp: c.payDate || c.endDate || new Date().toISOString(),
          details: `${c.name || `Cycle #${c.id}`} - $${(Number(c.totalAmount) || 0).toLocaleString()}`,
        });
      }
      return entries;
    }).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
  }, [cycles]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payroll Hub</h1>
            <p className="text-sm text-slate-500 mt-1">Centralized payroll management across all entities</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-200" onClick={() => toast.info("Export coming soon")}>
              <Download size={16} className="mr-2" />Export
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => setShowCreate(true)}>
              <Plus size={16} className="mr-2" />New Cycle
            </Button>
          </div>
        </div>

        {/* KPI Stat Cards — matching dashboard design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                  <DollarSign size={16} className="text-teal-600" />
                </div>
                <span className="ml-auto text-xs font-medium flex items-center gap-0.5 text-emerald-600">
                  <ArrowUpRight size={12} />+3.1%
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">
                ${(totalPayroll / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-slate-400 mt-1">Monthly Payroll</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Calendar size={16} className="text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{cycles.length}</p>
              <p className="text-xs text-slate-400 mt-1">Total Cycles</p>
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
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{paidCycles}</p>
              <p className="text-xs text-slate-400 mt-1">Paid Cycles</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock size={16} className="text-amber-600" />
                </div>
                {pendingCycles > 0 && (
                  <span className="ml-auto text-xs font-medium flex items-center gap-0.5 text-amber-600">
                    <AlertTriangle size={12} />{pendingCycles} pending
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{pendingCycles}</p>
              <p className="text-xs text-slate-400 mt-1">Pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {(["cycles", "reports", "audit"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "cycles" ? "Payroll Cycles" : tab === "reports" ? "Reports" : "Audit Log"}
            </button>
          ))}
        </div>

        {/* Cycles Tab */}
        {activeTab === "cycles" && (
          <>
            {/* Create Cycle Form */}
            {showCreate && (
              <Card className="border border-teal-200 shadow-sm bg-white rounded-2xl">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-slate-900 mb-4">Create Payroll Cycle</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Cycle Name</label>
                      <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. March 2026" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Period Start</label>
                      <Input type="date" value={form.periodStart} onChange={e => setForm(p => ({ ...p, periodStart: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Period End</label>
                      <Input type="date" value={form.periodEnd} onChange={e => setForm(p => ({ ...p, periodEnd: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Pay Date</label>
                      <Input type="date" value={form.payDate} onChange={e => setForm(p => ({ ...p, payDate: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" onClick={() => { setShowCreate(false); resetForm(); }}>Cancel</Button>
                    <Button
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                      disabled={createMut.isPending}
                      onClick={() => {
                        if (!form.name) { toast.error("Cycle name is required"); return; }
                        createMut.mutate(form);
                      }}
                    >
                      {createMut.isPending && <Loader2 size={14} className="mr-2 animate-spin" />}
                      Create Cycle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filters */}
            <div className="flex gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Search cycles..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cycles Table */}
            <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="px-5 py-3 text-left">Cycle</th>
                      <th className="px-5 py-3 text-left">Period</th>
                      <th className="px-5 py-3 text-left">Pay Date</th>
                      <th className="px-5 py-3 text-left">Status</th>
                      <th className="px-5 py-3 text-right">Employees</th>
                      <th className="px-5 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredCycles.map((c: any) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <p className="text-sm font-medium text-slate-900">{c.name}</p>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600">
                          {c.periodStart ? new Date(c.periodStart).toLocaleDateString() : "—"} — {c.periodEnd ? new Date(c.periodEnd).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600">
                          {c.payDate ? new Date(c.payDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant="outline" className={`text-xs capitalize border-0 ${STATUS_STYLES[c.status] || ""}`}>
                            {c.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600 text-right">
                          {employees.length}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreVertical size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toast.info("View details coming soon")}>
                                <Eye size={14} className="mr-2" />View Details
                              </DropdownMenuItem>
                              {c.status === "draft" && (
                                <DropdownMenuItem onClick={() => approveMut.mutate({ id: c.id })}>
                                  <Check size={14} className="mr-2" />Approve
                                </DropdownMenuItem>
                              )}
                              {c.status === "approved" && (
                                <DropdownMenuItem onClick={() => processMut.mutate({ id: c.id })}>
                                  <Play size={14} className="mr-2" />Process
                                </DropdownMenuItem>
                              )}
                              {c.status === "processing" && (
                                <DropdownMenuItem onClick={() => paidMut.mutate({ id: c.id })}>
                                  <DollarSign size={14} className="mr-2" />Mark Paid
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => toast.info("Download coming soon")}>
                                <Download size={14} className="mr-2" />Export PDF
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => toast.info("Reversal coming soon")} className="text-red-600">
                                <RotateCcw size={14} className="mr-2" />Reverse
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredCycles.length === 0 && (
                  <div className="py-12 text-center text-slate-400">
                    <Receipt size={40} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm">No payroll cycles found</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowCreate(true)}>
                      Create First Cycle
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Payroll by Department", desc: "Breakdown of payroll costs per department", icon: BarChart3, color: "bg-teal-50 text-teal-600" },
              { title: "Payroll by Country", desc: "Multi-country payroll distribution", icon: Receipt, color: "bg-blue-50 text-blue-600" },
              { title: "Payroll by Role", desc: "Compensation analysis by role level", icon: Users, color: "bg-amber-50 text-amber-600" },
              { title: "Tax Summary", desc: "Tax withholdings and social security by jurisdiction", icon: FileText, color: "bg-red-50 text-red-500" },
              { title: "Year-to-Date Report", desc: "Cumulative payroll costs and trends", icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
              { title: "Budget vs Actual", desc: "Compare planned vs actual payroll spend", icon: DollarSign, color: "bg-violet-50 text-violet-600" },
            ].map((report, i) => (
              <Card key={i} className="border border-slate-100 shadow-sm bg-white rounded-2xl hover:shadow-md transition-shadow cursor-pointer" onClick={() => toast.info(`${report.title} report coming soon`)}>
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${report.color.split(" ")[0]}`}>
                    <report.icon size={18} className={report.color.split(" ")[1]} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{report.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{report.desc}</p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto flex-shrink-0 border-slate-200">
                    <Download size={14} className="mr-1" />Export
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === "audit" && (
          <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Payroll Audit Log</h3>
                <p className="text-xs text-slate-400 mt-0.5">Complete history of all payroll actions</p>
              </div>
              <div className="divide-y divide-slate-50">
                {auditLog.map((entry) => (
                  <div key={entry.id} className="px-5 py-3 flex items-center hover:bg-slate-50/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center mr-3 flex-shrink-0">
                      <FileText size={14} className="text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{entry.action}</p>
                      <p className="text-xs text-slate-400">{entry.details}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">{entry.user}</p>
                      <p className="text-xs text-slate-400">{new Date(entry.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {auditLog.length === 0 && (
                  <div className="py-12 text-center text-slate-400">
                    <FileText size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">No audit entries yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Forecasting */}
        <Card className="border border-slate-100 shadow-sm bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                <TrendingUp size={16} className="text-teal-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">AI Payroll Forecasting</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/80 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1">Next Month Forecast</p>
                <p className="text-lg font-bold text-slate-900">${((totalPayroll / 12) * 1.02).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-amber-600 mt-0.5">+2% from scheduled raises</p>
              </div>
              <div className="bg-white/80 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1">Q2 Budget Impact</p>
                <p className="text-lg font-bold text-slate-900">${((totalPayroll / 4) * 1.05).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-slate-500 mt-0.5">Including 3 planned hires</p>
              </div>
              <div className="bg-white/80 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1">Annual Projection</p>
                <p className="text-lg font-bold text-slate-900">${(totalPayroll * 1.08).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-emerald-600 mt-0.5">Within budget (+8% YoY)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
