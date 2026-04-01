import EmployeeLayout from "@/components/EmployeeLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { CalendarDays, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function EmployeeTimeOffPage() {
  const { data: requests = [] } = trpc.timeOff.list.useQuery();
  const utils = trpc.useUtils();
  const createMut = trpc.timeOff.create.useMutation({
    onSuccess: () => { utils.timeOff.list.invalidate(); toast.success("Request submitted"); setShowAdd(false); },
  });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: "vacation" as any, startDate: "", endDate: "", days: 1, reason: "" });

  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-600 border-red-200",
    cancelled: "bg-slate-50 text-slate-500",
  };

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Time Off</h1><p className="text-sm text-slate-500 mt-1">Request and track your leave</p></div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild><Button className="bg-indigo-600 hover:bg-indigo-700"><Plus size={16} className="mr-2" />Request Leave</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Request Time Off</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Type</Label>
                  <Select value={form.type} onValueChange={(v: any) => setForm(p => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacation">Vacation</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="parental">Parental</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} /></div>
                  <div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} /></div>
                </div>
                <div><Label>Days</Label><Input type="number" min={1} value={form.days} onChange={e => setForm(p => ({ ...p, days: Number(e.target.value) }))} /></div>
                <div><Label>Reason</Label><Input value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Optional reason" /></div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={() => {
                  if (!form.startDate || !form.endDate) { toast.error("Dates required"); return; }
                  createMut.mutate({ ...form, startDate: form.startDate, endDate: form.endDate, employeeId: 0 });
                }} className="bg-indigo-600 hover:bg-indigo-700">Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {requests.map((req: any) => (
            <Card key={req.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <CalendarDays size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 capitalize">{req.type} Leave</p>
                      <p className="text-xs text-slate-500">
                        {new Date(req.startDate).toLocaleDateString()} — {new Date(req.endDate).toLocaleDateString()} · {req.days} day{req.days > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-xs capitalize ${statusColors[req.status] || ""}`}>{req.status}</Badge>
                </div>
                {req.reason && <p className="text-xs text-slate-400 mt-2 ml-13">{req.reason}</p>}
              </CardContent>
            </Card>
          ))}
          {requests.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <CalendarDays size={40} className="mx-auto mb-3 text-slate-300" />
              <p>No time off requests</p>
            </div>
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
}
