import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Plus, Trash2, Lock, Users, UserCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminRbacPage() {
  const { data: roles = [] } = trpc.rbac.listRoles.useQuery();
  const { data: permissions = [] } = trpc.rbac.listPermissions.useQuery();
  const { data: users = [] } = trpc.userManagement.listUsers.useQuery();
  const utils = trpc.useUtils();

  const createRoleMut = trpc.rbac.createRole.useMutation({ onSuccess: () => { utils.rbac.listRoles.invalidate(); toast.success("Role created"); } });
  const deleteRoleMut = trpc.rbac.deleteRole.useMutation({ onSuccess: () => { utils.rbac.listRoles.invalidate(); toast.success("Role deleted"); } });
  const updateUserRoleMut = trpc.userManagement.updateRole.useMutation({ onSuccess: () => { utils.userManagement.listUsers.invalidate(); toast.success("User role updated"); } });

  const [showAddRole, setShowAddRole] = useState(false);
  const [roleForm, setRoleForm] = useState({ name: "", description: "" });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Roles & Permissions</h1>
          <p className="text-sm text-slate-500 mt-1">Manage access control and user roles</p>
        </div>

        <Tabs defaultValue="system-roles">
          <TabsList>
            <TabsTrigger value="system-roles">System Roles</TabsTrigger>
            <TabsTrigger value="custom-roles">Custom Roles</TabsTrigger>
            <TabsTrigger value="users">User Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="system-roles" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "Admin", desc: "Full platform access. Can manage all settings, employees, payroll, and RBAC.", color: "bg-red-50 text-red-700" },
                { name: "HR Admin", desc: "Access to people management, payroll, benefits, hiring, and performance modules.", color: "bg-purple-50 text-purple-700" },
                { name: "Manager", desc: "Team-centric access. Can view team members, approve time off, manage goals and reviews.", color: "bg-emerald-50 text-emerald-700" },
                { name: "Employee", desc: "Self-service access. Can view own profile, request time off, track goals and learning.", color: "bg-blue-50 text-blue-700" },
              ].map(role => (
                <Card key={role.name} className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${role.color}`}>
                        <Shield size={16} />
                      </div>
                      <h3 className="font-semibold text-slate-900">{role.name}</h3>
                      <Badge variant="outline" className="text-xs">System</Badge>
                    </div>
                    <p className="text-sm text-slate-500">{role.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom-roles" className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Dialog open={showAddRole} onOpenChange={setShowAddRole}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700"><Plus size={16} className="mr-2" />Create Role</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create Custom Role</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div><Label>Role Name *</Label><Input value={roleForm.name} onChange={e => setRoleForm(p => ({ ...p, name: e.target.value }))} /></div>
                    <div><Label>Description</Label><Input value={roleForm.description} onChange={e => setRoleForm(p => ({ ...p, description: e.target.value }))} /></div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={() => { if (!roleForm.name) { toast.error("Name required"); return; } createRoleMut.mutate(roleForm); setRoleForm({ name: "", description: "" }); setShowAddRole(false); }} className="bg-indigo-600 hover:bg-indigo-700">Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            {roles.length === 0 ? (
              <Card className="border-0 shadow-sm"><CardContent className="py-12 text-center text-slate-400"><Lock size={32} className="mx-auto mb-2 text-slate-300" /><p>No custom roles yet</p></CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((role: any) => (
                  <Card key={role.id} className="border-0 shadow-sm">
                    <CardContent className="p-5 flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{role.name}</h3>
                        <p className="text-sm text-slate-500 mt-1">{role.description || "No description"}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => { if (confirm("Delete role?")) deleteRoleMut.mutate({ id: role.id }); }}><Trash2 size={14} /></Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-3 px-4 font-medium text-slate-500">User</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Current Role</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500">Change Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u: any) => (
                      <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-3 px-4 flex items-center gap-2"><UserCircle size={16} className="text-slate-400" /><span className="font-medium text-slate-900">{u.name}</span></td>
                        <td className="py-3 px-4 text-slate-500">{u.email}</td>
                        <td className="py-3 px-4"><Badge variant="outline" className="capitalize text-xs">{u.role?.replace("_", " ")}</Badge></td>
                        <td className="py-3 px-4 text-right">
                          <Select value={u.role} onValueChange={(v: any) => updateUserRoleMut.mutate({ userId: u.id, role: v })}>
                            <SelectTrigger className="w-[140px] ml-auto"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="hr_admin">HR Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="employee">Employee</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && <tr><td colSpan={4} className="py-12 text-center text-slate-400">No users found</td></tr>}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
