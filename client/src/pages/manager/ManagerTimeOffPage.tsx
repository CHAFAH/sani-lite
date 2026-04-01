import ManagerLayout from "@/components/ManagerLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, CalendarDays } from "lucide-react";
import { toast } from "sonner";

export default function ManagerTimeOffPage() {
  const { data: requests = [] } = trpc.timeOff.list.useQuery();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const utils = trpc.useUtils();
  const approveMut = trpc.timeOff.approve.useMutation({ onSuccess: () => { utils.timeOff.list.invalidate(); toast.success("Approved"); } });
  const rejectMut = trpc.timeOff.reject.useMutation({ onSuccess: () => { utils.timeOff.list.invalidate(); toast.success("Rejected"); } });

  const pending = requests.filter((r: any) => r.status === "pending");
  const resolved = requests.filter((r: any) => r.status !== "pending");
  const getEmpName = (id: number) => { const e = employees.find((e: any) => e.id === id); return e ? `${e.firstName} ${e.lastName}` : `#${id}`; };
  const statusColors: Record<string, string> = { approved: "bg-emerald-50 text-emerald-700", rejected: "bg-red-50 text-red-600", cancelled: "bg-slate-50 text-slate-500" };

  const RequestRow = ({ req, showActions }: { req: any; showActions: boolean }) => (
    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
          <CalendarDays size={18} className="text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900">{getEmpName(req.employeeId)}</p>
          <p className="text-xs text-slate-500">{new Date(req.startDate).toLocaleDateString()} — {new Date(req.endDate).toLocaleDateString()} · {req.days} days</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs capitalize">{req.type}</Badge>
        {showActions ? (
          <>
            <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => approveMut.mutate({ id: req.id })}><Check size={14} className="mr-1" />Approve</Button>
            <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => rejectMut.mutate({ id: req.id })}><X size={14} className="mr-1" />Reject</Button>
          </>
        ) : (
          <Badge variant="outline" className={`text-xs capitalize ${statusColors[req.status] || ""}`}>{req.status}</Badge>
        )}
      </div>
    </div>
  );

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-slate-900">Time Off Approvals</h1><p className="text-sm text-slate-500 mt-1">{pending.length} pending requests</p></div>
        <Tabs defaultValue="pending">
          <TabsList><TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger><TabsTrigger value="history">History ({resolved.length})</TabsTrigger></TabsList>
          <TabsContent value="pending" className="mt-4 space-y-3">
            {pending.length === 0 ? <div className="text-center py-12 text-slate-400">No pending requests</div> : pending.map(req => <RequestRow key={req.id} req={req} showActions />)}
          </TabsContent>
          <TabsContent value="history" className="mt-4 space-y-3">
            {resolved.length === 0 ? <div className="text-center py-12 text-slate-400">No history</div> : resolved.map(req => <RequestRow key={req.id} req={req} showActions={false} />)}
          </TabsContent>
        </Tabs>
      </div>
    </ManagerLayout>
  );
}
