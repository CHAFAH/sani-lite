import ManagerLayout from "@/components/ManagerLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Star, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ManagerPerformancePage() {
  const { data: reviews = [] } = trpc.performance.list.useQuery();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const utils = trpc.useUtils();
  const createMut = trpc.performance.create.useMutation({ onSuccess: () => { utils.performance.list.invalidate(); toast.success("Review created"); setShowAdd(false); } });
  const updateMut = trpc.performance.update.useMutation({ onSuccess: () => { utils.performance.list.invalidate(); toast.success("Updated"); } });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ employeeId: 0, reviewPeriod: "", rating: 3 });
  const getEmpName = (id: number) => { const e = employees.find((e: any) => e.id === id); return e ? `${e.firstName} ${e.lastName}` : `#${id}`; };
  const statusColors: Record<string, string> = { draft: "bg-slate-50 text-slate-600", submitted: "bg-blue-50 text-blue-700", completed: "bg-emerald-50 text-emerald-700" };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Performance Reviews</h1><p className="text-sm text-slate-500 mt-1">{reviews.length} reviews</p></div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild><Button className="bg-indigo-600 hover:bg-indigo-700"><Plus size={16} className="mr-2" />New Review</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Review</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Employee</Label>
                  <Select onValueChange={(v) => setForm(p => ({ ...p, employeeId: Number(v) }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{employees.map((e: any) => <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Review Period</Label><Input value={form.reviewPeriod} onChange={e => setForm(p => ({ ...p, reviewPeriod: e.target.value }))} placeholder="Q1 2026" /></div>
                <div><Label>Rating</Label>
                  <div className="flex gap-1 mt-1">{[1,2,3,4,5].map(n => <button key={n} onClick={() => setForm(p => ({...p, rating: n}))} className="p-1"><Star size={20} className={n <= form.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} /></button>)}</div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={() => { if (!form.employeeId) { toast.error("Select employee"); return; } createMut.mutate(form); }} className="bg-indigo-600 hover:bg-indigo-700">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Card className="border-0 shadow-sm"><CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-100">
              <th className="text-left py-3 px-4 font-medium text-slate-500">Employee</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Period</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Rating</th>
              <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
              <th className="text-right py-3 px-4 font-medium text-slate-500">Actions</th>
            </tr></thead>
            <tbody>
              {reviews.map((r: any) => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-slate-900">{getEmpName(r.employeeId)}</td>
                  <td className="py-3 px-4 text-slate-600">{r.reviewPeriod}</td>
                  <td className="py-3 px-4"><span className="flex items-center gap-0.5">{Array.from({length:5}).map((_,i) => <Star key={i} size={12} className={i < (r.rating||0) ? "text-amber-400 fill-amber-400" : "text-slate-200"} />)}</span></td>
                  <td className="py-3 px-4"><Badge variant="outline" className={`text-xs capitalize ${statusColors[r.status]||""}`}>{r.status}</Badge></td>
                  <td className="py-3 px-4 text-right">
                    {r.status === "draft" && <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => updateMut.mutate({ id: r.id, status: "submitted" })}>Submit</Button>}
                    {r.status === "submitted" && <Button size="sm" variant="ghost" className="text-emerald-600" onClick={() => updateMut.mutate({ id: r.id, status: "completed" })}>Complete</Button>}
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-slate-400">No reviews</td></tr>}
            </tbody>
          </table>
        </CardContent></Card>
      </div>
    </ManagerLayout>
  );
}
