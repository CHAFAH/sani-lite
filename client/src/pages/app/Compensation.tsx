/*
 * Compensation — Salary bands and compensation management
 */
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, DollarSign, Trash2, TrendingUp, BarChart3 } from "lucide-react";

const DEPARTMENTS = ["Engineering", "Product", "Design", "Marketing", "Sales", "HR", "Finance", "Operations"];

export default function CompensationPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ title: "", level: "", department: "", minSalary: "", midSalary: "", maxSalary: "", currency: "USD" });

  const utils = trpc.useUtils();
  const { data: bands, isLoading: bandsLoading } = trpc.salaryBand.list.useQuery();
  const { data: compensations } = trpc.compensation.list.useQuery();
  const { data: employees } = trpc.employee.list.useQuery();
  const createBand = trpc.salaryBand.create.useMutation({ onSuccess: () => { utils.salaryBand.list.invalidate(); setIsOpen(false); toast.success("Salary band created"); } });
  const deleteBand = trpc.salaryBand.delete.useMutation({ onSuccess: () => { utils.salaryBand.list.invalidate(); toast.success("Band deleted"); } });

  const activeEmployees = (employees || []).filter((e: { status: string; salary: string | null }) => e.status === "active" && e.salary);
  const avgSalary = activeEmployees.length > 0 ? activeEmployees.reduce((s: number, e: { salary: string | null }) => s + Number(e.salary || 0), 0) / activeEmployees.length : 0;
  const totalComp = activeEmployees.reduce((s: number, e: { salary: string | null }) => s + Number(e.salary || 0), 0);

  const deptAvg: Record<string, { total: number; count: number }> = {};
  activeEmployees.forEach((e: { department: string | null; salary: string | null }) => {
    const d = e.department || "Other";
    if (!deptAvg[d]) deptAvg[d] = { total: 0, count: 0 };
    deptAvg[d].total += Number(e.salary || 0);
    deptAvg[d].count += 1;
  });
  const deptData = Object.entries(deptAvg).map(([dept, { total, count }]) => ({ dept, avg: total / count, count })).sort((a, b) => b.avg - a.avg);

  const getEmployeeName = (id: number) => {
    const emp = employees?.find((e: { id: number }) => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${id}`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-normal tracking-tight font-serif">Compensation</h1>
            <p className="text-muted-foreground text-sm mt-1">Salary bands, pay equity, and compensation insights</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2"><Plus size={16} />Add Salary Band</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Salary Band</DialogTitle></DialogHeader>
              <div className="space-y-3 mt-4">
                <Input placeholder="Job Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Level (e.g. L4)" value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))} />
                  <Select value={form.department} onValueChange={v => setForm(p => ({ ...p, department: v }))}>
                    <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                    <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input placeholder="Min Salary" type="number" value={form.minSalary} onChange={e => setForm(p => ({ ...p, minSalary: e.target.value }))} />
                  <Input placeholder="Mid Salary" type="number" value={form.midSalary} onChange={e => setForm(p => ({ ...p, midSalary: e.target.value }))} />
                  <Input placeholder="Max Salary" type="number" value={form.maxSalary} onChange={e => setForm(p => ({ ...p, maxSalary: e.target.value }))} />
                </div>
                <Select value={form.currency} onValueChange={v => setForm(p => ({ ...p, currency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["USD", "EUR", "GBP", "NGN", "CAD"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white" disabled={createBand.isPending} onClick={() => {
                  if (!form.title || !form.level || !form.minSalary || !form.maxSalary) { toast.error("Title, level and salary range required"); return; }
                  createBand.mutate({ title: form.title, level: form.level, department: form.department || undefined, minSalary: form.minSalary, midSalary: form.midSalary || form.minSalary, maxSalary: form.maxSalary, currency: form.currency });
                }}>{createBand.isPending ? "Creating..." : "Create"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center"><DollarSign size={20} className="text-teal-600" /></div><div><p className="text-2xl font-semibold">${avgSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p><p className="text-xs text-muted-foreground">Avg Salary</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><TrendingUp size={20} className="text-emerald-600" /></div><div><p className="text-2xl font-semibold">${totalComp.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Comp</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><BarChart3 size={20} className="text-purple-600" /></div><div><p className="text-2xl font-semibold">{(bands || []).length}</p><p className="text-xs text-muted-foreground">Salary Bands</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><DollarSign size={20} className="text-amber-600" /></div><div><p className="text-2xl font-semibold">{activeEmployees.length}</p><p className="text-xs text-muted-foreground">With Salary</p></div></div></CardContent></Card>
        </div>

        <Tabs defaultValue="bands">
          <TabsList><TabsTrigger value="bands">Salary Bands</TabsTrigger><TabsTrigger value="history">Compensation History</TabsTrigger><TabsTrigger value="insights">Insights</TabsTrigger></TabsList>

          <TabsContent value="bands" className="mt-4">
            {bandsLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
            ) : (bands || []).length === 0 ? (
              <Card className="py-12 text-center"><CardContent><BarChart3 size={48} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">No salary bands defined yet</p></CardContent></Card>
            ) : (
              <div className="space-y-3">
                {(bands || []).map((band: { id: number; title: string; level: string; department: string | null; minSalary: string; midSalary: string | null; maxSalary: string; currency: string }) => (
                  <motion.div key={band.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-border/50 shadow-sm p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><DollarSign size={20} className="text-purple-600" /></div>
                      <div>
                        <p className="font-medium text-sm">{band.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{band.level}</Badge>
                          {band.department && <span>{band.department}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold">{band.currency} {Number(band.minSalary).toLocaleString()} — {Number(band.maxSalary).toLocaleString()}</p>
                        {band.midSalary && <p className="text-xs text-muted-foreground">Mid: {Number(band.midSalary).toLocaleString()}</p>}
                      </div>
                      <Button size="sm" variant="ghost" className="text-red-500 h-8 w-8 p-0" onClick={() => { if (confirm("Delete?")) deleteBand.mutate({ id: band.id }); }}><Trash2 size={14} /></Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {(compensations || []).length === 0 ? (
              <Card className="py-12 text-center"><CardContent><DollarSign size={48} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">No compensation records yet</p></CardContent></Card>
            ) : (
              <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead><tr className="border-b bg-gray-50/50">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">Employee</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">Type</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase px-4 py-3">Amount</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">Effective</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">Reason</th>
                  </tr></thead>
                  <tbody>
                    {(compensations || []).map((c: { id: number; employeeId: number; type: string; amount: string; currency: string; effectiveDate: Date; reason: string | null }) => (
                      <tr key={c.id} className="border-b border-border/30">
                        <td className="px-4 py-3 text-sm">{getEmployeeName(c.employeeId)}</td>
                        <td className="px-4 py-3"><Badge variant="outline" className="capitalize text-xs">{c.type.replace("_", " ")}</Badge></td>
                        <td className="px-4 py-3 text-sm font-semibold text-right">{c.currency} {Number(c.amount).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(c.effectiveDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{c.reason || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="mt-4">
            {deptData.length > 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Average Salary by Department</h3>
                  <div className="space-y-3">
                    {deptData.map(d => (
                      <div key={d.dept} className="flex items-center gap-4">
                        <span className="text-sm w-28 truncate">{d.dept}</span>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full flex items-center justify-end pr-2" style={{ width: `${Math.min((d.avg / (deptData[0]?.avg || 1)) * 100, 100)}%` }}>
                            <span className="text-xs text-white font-medium">${d.avg.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground w-16 text-right">{d.count} emp</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="py-12 text-center"><CardContent><BarChart3 size={48} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">Add employees with salary data to see insights</p></CardContent></Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
