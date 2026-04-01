import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { UserPlus, Mail, Copy, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminInvitationsPage() {
  const { data: invitations = [] } = trpc.invitation.list.useQuery();
  const utils = trpc.useUtils();
  const createMut = trpc.invitation.create.useMutation({
    onSuccess: (data) => { utils.invitation.list.invalidate(); toast.success("Invitation sent"); setShowAdd(false); },
  });
  const revokeMut = trpc.invitation.revoke.useMutation({ onSuccess: () => { utils.invitation.list.invalidate(); toast.success("Invitation revoked"); } });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ email: "", role: "employee" as "admin" | "hr_admin" | "manager" | "employee" });

  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    revoked: "bg-red-50 text-red-600 border-red-200",
    expired: "bg-slate-50 text-slate-500 border-slate-200",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Invitations</h1>
            <p className="text-sm text-slate-500 mt-1">Invite team members to join your organization</p>
          </div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700"><UserPlus size={16} className="mr-2" />Invite Member</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Send Invitation</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="colleague@company.com" /></div>
                <div>
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(v: any) => setForm(p => ({ ...p, role: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="hr_admin">HR Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={() => { if (!form.email) { toast.error("Email required"); return; } createMut.mutate(form); setForm({ email: "", role: "employee" }); }} disabled={createMut.isPending} className="bg-indigo-600 hover:bg-indigo-700">Send Invite</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Sent</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Expires</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv: any) => (
                  <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-900 flex items-center gap-2"><Mail size={14} className="text-slate-400" />{inv.email}</td>
                    <td className="py-3 px-4 capitalize text-slate-600">{inv.role?.replace("_", " ")}</td>
                    <td className="py-3 px-4"><Badge variant="outline" className={`text-xs capitalize ${statusColors[inv.status] || ""}`}>{inv.status}</Badge></td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{new Date(inv.expiresAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      {inv.status === "pending" && (
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => revokeMut.mutate({ id: inv.id })}>
                          <XCircle size={14} className="mr-1" />Revoke
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {invitations.length === 0 && (
                  <tr><td colSpan={6} className="py-12 text-center text-slate-400">No invitations sent yet</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
