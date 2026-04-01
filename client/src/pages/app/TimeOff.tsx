/*
 * Time Off — Leave management with request/approve flow
 */
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, CalendarDays, CheckCircle2, XCircle, Clock } from "lucide-react";

const LEAVE_TYPES = ["vacation", "sick", "personal", "parental", "bereavement", "other"] as const;

export default function TimeOffPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ employeeId: "", type: "vacation" as typeof LEAVE_TYPES[number], startDate: "", endDate: "", days: "", reason: "" });

  const utils = trpc.useUtils();
  const { data: requests, isLoading } = trpc.timeOff.list.useQuery();
  const { data: employees } = trpc.employee.list.useQuery();
  const createMut = trpc.timeOff.create.useMutation({ onSuccess: () => { utils.timeOff.list.invalidate(); setIsOpen(false); toast.success("Time off request created"); } });
  const approveMut = trpc.timeOff.approve.useMutation({ onSuccess: () => { utils.timeOff.list.invalidate(); toast.success("Request approved"); } });
  const rejectMut = trpc.timeOff.reject.useMutation({ onSuccess: () => { utils.timeOff.list.invalidate(); toast.success("Request rejected"); } });

  const filtered = (requests || []).filter(r => filter === "all" || r.status === filter);

  const statusBadge: Record<string, { class: string; icon: React.ElementType }> = {
    pending: { class: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
    approved: { class: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    rejected: { class: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
    cancelled: { class: "bg-gray-50 text-gray-600 border-gray-200", icon: XCircle },
  };

  const pendingCount = (requests || []).filter(r => r.status === "pending").length;
  const approvedCount = (requests || []).filter(r => r.status === "approved").length;

  const getEmployeeName = (id: number) => {
    const emp = employees?.find(e => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : `Employee #${id}`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-normal tracking-tight font-serif">Time Off</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage leave requests and approvals</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2"><Plus size={16} />New Request</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Request Time Off</DialogTitle></DialogHeader>
              <div className="space-y-3 mt-4">
                <Select value={form.employeeId} onValueChange={v => setForm(p => ({ ...p, employeeId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                  <SelectContent>{(employees || []).map(e => <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as any }))}>
                  <SelectTrigger><SelectValue placeholder="Leave Type" /></SelectTrigger>
                  <SelectContent>{LEAVE_TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-muted-foreground">Start Date</label><Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} /></div>
                  <div><label className="text-xs text-muted-foreground">End Date</label><Input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} /></div>
                </div>
                <Input type="number" placeholder="Number of days" value={form.days} onChange={e => setForm(p => ({ ...p, days: e.target.value }))} />
                <Textarea placeholder="Reason (optional)" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white" disabled={createMut.isPending} onClick={() => {
                  if (!form.employeeId || !form.startDate || !form.endDate || !form.days) { toast.error("Please fill all required fields"); return; }
                  createMut.mutate({ employeeId: Number(form.employeeId), type: form.type, startDate: form.startDate, endDate: form.endDate, days: Number(form.days), reason: form.reason || undefined });
                }}>
                  {createMut.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-semibold text-amber-600">{pendingCount}</p><p className="text-sm text-muted-foreground mt-1">Pending</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-semibold text-emerald-600">{approvedCount}</p><p className="text-sm text-muted-foreground mt-1">Approved</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-semibold text-gray-600">{(requests || []).length}</p><p className="text-sm text-muted-foreground mt-1">Total</p></CardContent></Card>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected"].map(s => (
            <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)} className={filter === s ? "bg-teal-600 hover:bg-teal-700 text-white" : ""}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>

        {/* Requests */}
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <Card className="py-12 text-center"><CardContent><CalendarDays size={48} className="mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">No time off requests found</p></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(req => {
              const badge = statusBadge[req.status || "pending"];
              const BadgeIcon = badge?.icon || Clock;
              return (
                <motion.div key={req.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-border/50 shadow-sm p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center"><CalendarDays size={20} className="text-teal-600" /></div>
                    <div>
                      <p className="font-medium text-sm">{getEmployeeName(req.employeeId)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{req.type} · {req.days} day{req.days > 1 ? "s" : ""}</p>
                      <p className="text-xs text-muted-foreground">{new Date(req.startDate).toLocaleDateString()} — {new Date(req.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={badge?.class || ""}><BadgeIcon size={12} className="mr-1" />{req.status}</Badge>
                    {req.status === "pending" && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => approveMut.mutate({ id: req.id })} disabled={approveMut.isPending}><CheckCircle2 size={14} /></Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => rejectMut.mutate({ id: req.id })} disabled={rejectMut.isPending}><XCircle size={14} /></Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
