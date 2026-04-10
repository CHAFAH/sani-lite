import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { UserPlus, Mail, Copy, XCircle, RefreshCw, CheckCircle2, AlertCircle, Send, Users, Clock, UserCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminInvitationsPage() {
  const { data: invitations = [] } = trpc.invitation.list.useQuery();
  const utils = trpc.useUtils();

  const createMut = trpc.invitation.create.useMutation({
    onSuccess: (data) => {
      utils.invitation.list.invalidate();
      if (data.emailSent) {
        toast.success("Invitation sent! Email delivered successfully.", { icon: <Mail size={16} /> });
      } else {
        toast.warning("Invitation created but email could not be sent. You can copy the link manually or resend.", { duration: 5000 });
      }
      setShowAdd(false);
      setForm({ email: "", role: "employee" });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create invitation");
    },
  });

  const resendMut = trpc.invitation.resend.useMutation({
    onSuccess: () => {
      toast.success("Invitation email resent successfully!", { icon: <Mail size={16} /> });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to resend email");
    },
  });

  const revokeMut = trpc.invitation.revoke.useMutation({
    onSuccess: () => {
      utils.invitation.list.invalidate();
      toast.success("Invitation revoked");
    },
  });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ email: "", role: "employee" as "admin" | "hr_admin" | "manager" | "employee" });

  const statusConfig: Record<string, { bg: string; icon: React.ReactNode }> = {
    pending: { bg: "bg-amber-50 text-amber-700 border-amber-200", icon: <Clock size={12} /> },
    accepted: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={12} /> },
    revoked: { bg: "bg-red-50 text-red-600 border-red-200", icon: <XCircle size={12} /> },
    expired: { bg: "bg-slate-50 text-slate-500 border-slate-200", icon: <AlertCircle size={12} /> },
  };

  const pendingCount = invitations.filter((i: any) => i.status === "pending").length;
  const acceptedCount = invitations.filter((i: any) => i.status === "accepted").length;

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invite?token=${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied to clipboard!");
  };

  const handleResend = (id: number) => {
    resendMut.mutate({ id, origin: window.location.origin });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}>
              Team Invitations
            </h1>
            <p className="text-sm text-slate-500 mt-1">Invite and manage team members joining your organization</p>
          </div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 rounded-xl px-5 shadow-md">
                <UserPlus size={16} className="mr-2" />Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                    <Send size={16} className="text-teal-600" />
                  </div>
                  Send Invitation
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Email Address *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="colleague@company.com"
                    className="mt-1.5 rounded-lg"
                  />
                  <p className="text-xs text-slate-400 mt-1">An invitation email with a join link will be sent automatically</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Role</Label>
                  <Select value={form.role} onValueChange={(v: any) => setForm(p => ({ ...p, role: v }))}>
                    <SelectTrigger className="mt-1.5 rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="hr_admin">HR Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <DialogClose asChild><Button variant="outline" className="rounded-lg">Cancel</Button></DialogClose>
                <Button
                  onClick={() => {
                    if (!form.email) { toast.error("Email is required"); return; }
                    createMut.mutate({ ...form, origin: window.location.origin });
                  }}
                  disabled={createMut.isPending}
                  className="bg-teal-600 hover:bg-teal-700 rounded-lg"
                >
                  {createMut.isPending ? (
                    <><RefreshCw size={14} className="mr-2 animate-spin" />Sending...</>
                  ) : (
                    <><Send size={14} className="mr-2" />Send Invite</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center">
                <Users size={20} className="text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{invitations.length}</p>
                <p className="text-xs text-slate-500">Total Invitations</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
                <p className="text-xs text-slate-500">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                <UserCheck size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{acceptedCount}</p>
                <p className="text-xs text-slate-500">Accepted</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left py-3.5 px-5 font-medium text-slate-500 text-xs uppercase tracking-wider">Email</th>
                  <th className="text-left py-3.5 px-5 font-medium text-slate-500 text-xs uppercase tracking-wider">Role</th>
                  <th className="text-left py-3.5 px-5 font-medium text-slate-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-3.5 px-5 font-medium text-slate-500 text-xs uppercase tracking-wider">Sent</th>
                  <th className="text-left py-3.5 px-5 font-medium text-slate-500 text-xs uppercase tracking-wider">Expires</th>
                  <th className="text-right py-3.5 px-5 font-medium text-slate-500 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv: any) => {
                  const cfg = statusConfig[inv.status] || statusConfig.pending;
                  const isExpired = inv.status === "pending" && new Date() > new Date(inv.expiresAt);
                  const displayStatus = isExpired ? "expired" : inv.status;
                  const displayCfg = statusConfig[displayStatus] || cfg;

                  return (
                    <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-semibold text-xs">
                            {inv.email?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-900">{inv.email}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="capitalize text-slate-600 text-sm">{inv.role?.replace("_", " ")}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <Badge variant="outline" className={`text-xs capitalize gap-1 ${displayCfg.bg}`}>
                          {displayCfg.icon}
                          {displayStatus}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 text-xs">
                        {new Date(inv.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 text-xs">
                        {new Date(inv.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {(inv.status === "pending" && !isExpired) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 h-8 px-2.5 rounded-lg text-xs"
                                onClick={() => handleResend(inv.id)}
                                disabled={resendMut.isPending}
                              >
                                <RefreshCw size={13} className={`mr-1 ${resendMut.isPending ? "animate-spin" : ""}`} />
                                Resend
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-500 hover:text-slate-700 hover:bg-slate-50 h-8 px-2.5 rounded-lg text-xs"
                                onClick={() => copyInviteLink(inv.token)}
                              >
                                <Copy size={13} className="mr-1" />
                                Copy Link
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2.5 rounded-lg text-xs"
                                onClick={() => revokeMut.mutate({ id: inv.id })}
                              >
                                <XCircle size={13} className="mr-1" />
                                Revoke
                              </Button>
                            </>
                          )}
                          {inv.status === "accepted" && (
                            <span className="text-xs text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 size={13} />Joined
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {invitations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                          <Mail size={24} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600">No invitations sent yet</p>
                          <p className="text-xs text-slate-400 mt-1">Click "Invite Member" to send your first invitation</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
