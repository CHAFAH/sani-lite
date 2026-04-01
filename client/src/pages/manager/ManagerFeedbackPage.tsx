import ManagerLayout from "@/components/ManagerLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { MessageSquare, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ManagerFeedbackPage() {
  const { data: feedbacks = [] } = trpc.feedback.listByCompany.useQuery();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const utils = trpc.useUtils();
  const createMut = trpc.feedback.create.useMutation({ onSuccess: () => { utils.feedback.listByCompany.invalidate(); toast.success("Feedback sent"); setShowAdd(false); } });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ fromEmployeeId: 0, toEmployeeId: 0, type: "praise" as const, content: "", isPrivate: false });
  const getEmpName = (id: number) => { const e = employees.find((e: any) => e.id === id); return e ? `${e.firstName} ${e.lastName}` : `#${id}`; };
  const typeColors: Record<string, string> = { praise: "bg-emerald-50 text-emerald-700", constructive: "bg-blue-50 text-blue-700", one_on_one: "bg-purple-50 text-purple-700", peer_review: "bg-amber-50 text-amber-700" };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-slate-900">Team Feedback</h1><p className="text-sm text-slate-500 mt-1">Give and track feedback</p></div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild><Button className="bg-indigo-600 hover:bg-indigo-700"><Plus size={16} className="mr-2" />Give Feedback</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Give Feedback</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>From</Label>
                  <Select onValueChange={(v) => setForm(p => ({ ...p, fromEmployeeId: Number(v) }))}>
                    <SelectTrigger><SelectValue placeholder="Select yourself" /></SelectTrigger>
                    <SelectContent>{employees.map((e: any) => <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>To</Label>
                  <Select onValueChange={(v) => setForm(p => ({ ...p, toEmployeeId: Number(v) }))}>
                    <SelectTrigger><SelectValue placeholder="Select team member" /></SelectTrigger>
                    <SelectContent>{employees.map((e: any) => <SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Type</Label>
                  <Select value={form.type} onValueChange={(v: any) => setForm(p => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="praise">Praise</SelectItem>
                      <SelectItem value="constructive">Constructive</SelectItem>
                      <SelectItem value="one_on_one">One-on-One</SelectItem>
                      <SelectItem value="peer_review">Peer Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Message *</Label><textarea className="w-full border rounded-lg p-3 text-sm min-h-[100px]" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} /></div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={() => {
                  if (!form.fromEmployeeId || !form.toEmployeeId || !form.content) { toast.error("All fields required"); return; }
                  createMut.mutate({
                    fromEmployeeId: form.fromEmployeeId,
                    toEmployeeId: form.toEmployeeId,
                    type: form.type,
                    content: form.content,
                    isPrivate: form.isPrivate,
                  });
                }} className="bg-indigo-600 hover:bg-indigo-700" disabled={createMut.isPending}>
                  {createMut.isPending ? "Sending..." : "Send"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-3">
          {feedbacks.map((f: any) => (
            <Card key={f.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mt-0.5"><MessageSquare size={16} className="text-indigo-600" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`text-xs capitalize ${typeColors[f.type] || ""}`}>{f.type?.replace("_", " ")}</Badge>
                      <span className="text-xs text-slate-400">{new Date(f.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-700">{f.content}</p>
                    <p className="text-xs text-slate-400 mt-1">From: {getEmpName(f.fromEmployeeId)} → To: {getEmpName(f.toEmployeeId)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {feedbacks.length === 0 && <div className="text-center py-12 text-slate-400"><MessageSquare size={40} className="mx-auto mb-3 text-slate-300" /><p>No feedback yet</p></div>}
        </div>
      </div>
    </ManagerLayout>
  );
}
