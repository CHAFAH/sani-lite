import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Check, X, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

export default function AdminTimeOffPage() {
  const { data: requests = [] } = trpc.timeOff.list.useQuery();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const utils = trpc.useUtils();
  const approveMut = trpc.timeOff.approve.useMutation({ onSuccess: () => { utils.timeOff.list.invalidate(); toast.success("Approved"); } });
  const rejectMut = trpc.timeOff.reject.useMutation({ onSuccess: () => { utils.timeOff.list.invalidate(); toast.success("Rejected"); } });

  const [filter, setFilter] = useState("all");
  const filtered = useMemo(() => filter === "all" ? requests : requests.filter((r: any) => r.status === filter), [requests, filter]);

  const getEmpName = (id: number) => { const e = employees.find((e: any) => e.id === id); return e ? `${e.firstName} ${e.lastName}` : `#${id}`; };
  const statusColors: Record<string, string> = { pending: "bg-amber-50 text-amber-700 border-amber-200", approved: "bg-emerald-50 text-emerald-700 border-emerald-200", rejected: "bg-red-50 text-red-600 border-red-200", cancelled: "bg-slate-50 text-slate-500 border-slate-200" };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Time Off Management</h1><p className="text-sm text-slate-500 mt-1">{requests.length} total requests</p></div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Filter" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100">
                <th className="text-left py-3 px-4 font-medium text-slate-500">Employee</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Type</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Dates</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Days</th>
                <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                <th className="text-right py-3 px-4 font-medium text-slate-500">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((req: any) => (
                  <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-900">{getEmpName(req.employeeId)}</td>
                    <td className="py-3 px-4 capitalize text-slate-600">{req.type}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{new Date(req.startDate).toLocaleDateString()} — {new Date(req.endDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-slate-600">{req.days}</td>
                    <td className="py-3 px-4"><Badge variant="outline" className={`text-xs capitalize ${statusColors[req.status] || ""}`}>{req.status}</Badge></td>
                    <td className="py-3 px-4 text-right">
                      {req.status === "pending" && (
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" className="text-emerald-600 hover:bg-emerald-50" onClick={() => approveMut.mutate({ id: req.id })}><Check size={14} className="mr-1" />Approve</Button>
                          <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => rejectMut.mutate({ id: req.id })}><X size={14} className="mr-1" />Reject</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-slate-400">No time off requests</td></tr>}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
