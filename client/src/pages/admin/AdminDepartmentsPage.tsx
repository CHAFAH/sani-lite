import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Plus, FolderTree, Trash2, Edit, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminDepartmentsPage() {
  const { data: departments = [] } = trpc.department.list.useQuery();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const utils = trpc.useUtils();
  const createMut = trpc.department.create.useMutation({ onSuccess: () => { utils.department.list.invalidate(); toast.success("Department created"); setShowAdd(false); } });
  const deleteMut = trpc.department.delete.useMutation({ onSuccess: () => { utils.department.list.invalidate(); toast.success("Department deleted"); } });

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const getEmployeeCount = (deptName: string) => employees.filter((e: any) => e.department === deptName).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Departments</h1>
            <p className="text-sm text-slate-500 mt-1">Manage organizational structure</p>
          </div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700"><Plus size={16} className="mr-2" />Add Department</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Department</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Engineering" /></div>
                <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description" /></div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={() => { if (!form.name) { toast.error("Name required"); return; } createMut.mutate(form); setForm({ name: "", description: "" }); }} disabled={createMut.isPending} className="bg-indigo-600 hover:bg-indigo-700">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept: any) => (
            <Card key={dept.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <FolderTree size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{dept.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{dept.description || "No description"}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => { if (confirm("Delete department?")) deleteMut.mutate({ id: dept.id }); }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <Users size={14} />
                  <span>{getEmployeeCount(dept.name)} employees</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {departments.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400">
              <FolderTree size={40} className="mx-auto mb-3 text-slate-300" />
              <p>No departments yet. Create your first department.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
