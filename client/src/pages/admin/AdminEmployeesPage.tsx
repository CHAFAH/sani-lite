import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Users, Plus, Search, MoreHorizontal, Mail, Phone, MapPin, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

export default function AdminEmployeesPage() {
  const { data: employees = [], isLoading } = trpc.employee.list.useQuery();
  const utils = trpc.useUtils();
  const createMut = trpc.employee.create.useMutation({ onSuccess: () => { utils.employee.list.invalidate(); toast.success("Employee created"); } });
  const deleteMut = trpc.employee.delete.useMutation({ onSuccess: () => { utils.employee.list.invalidate(); toast.success("Employee removed"); } });
  const updateMut = trpc.employee.update.useMutation({ onSuccess: () => { utils.employee.list.invalidate(); toast.success("Employee updated"); } });

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", department: "", position: "", phone: "", country: "", city: "", employmentType: "full_time" as const, salary: "", currency: "USD" });

  const departments = useMemo(() => Array.from(new Set(employees.map((e: any) => e.department).filter(Boolean))), [employees]);

  const filtered = useMemo(() => {
    return employees.filter((e: any) => {
      const matchSearch = !search || `${e.firstName} ${e.lastName} ${e.email}`.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === "all" || e.department === deptFilter;
      const matchStatus = statusFilter === "all" || e.status === statusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [employees, search, deptFilter, statusFilter]);

  const handleCreate = () => {
    if (!form.firstName || !form.lastName || !form.email) { toast.error("Name and email required"); return; }
    createMut.mutate(form);
    setShowAdd(false);
    setForm({ firstName: "", lastName: "", email: "", department: "", position: "", phone: "", country: "", city: "", employmentType: "full_time", salary: "", currency: "USD" });
  };

  const statusColors: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    inactive: "bg-slate-50 text-slate-600 border-slate-200",
    on_leave: "bg-amber-50 text-amber-700 border-amber-200",
    offboarded: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
            <p className="text-sm text-slate-500 mt-1">{employees.length} total employees</p>
          </div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700"><Plus size={16} className="mr-2" />Add Employee</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Add New Employee</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div><Label>First Name *</Label><Input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} /></div>
                <div><Label>Last Name *</Label><Input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} /></div>
                <div className="col-span-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
                <div><Label>Department</Label><Input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} /></div>
                <div><Label>Position</Label><Input value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
                <div><Label>Country</Label><Input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} /></div>
                <div><Label>Salary</Label><Input value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} /></div>
                <div>
                  <Label>Type</Label>
                  <Select value={form.employmentType} onValueChange={(v: any) => setForm(p => ({ ...p, employmentType: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleCreate} disabled={createMut.isPending} className="bg-indigo-600 hover:bg-indigo-700">{createMut.isPending ? "Creating..." : "Create"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d: any) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="offboarded">Offboarded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Position</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Location</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp: any) => (
                    <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs">
                            {emp.firstName?.[0]}{emp.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-slate-400">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{emp.department || "—"}</td>
                      <td className="py-3 px-4 text-slate-600">{emp.position || "—"}</td>
                      <td className="py-3 px-4"><span className="text-xs capitalize">{emp.employmentType?.replace("_", " ") || "—"}</span></td>
                      <td className="py-3 px-4"><Badge variant="outline" className={`text-xs capitalize ${statusColors[emp.status] || ""}`}>{emp.status}</Badge></td>
                      <td className="py-3 px-4 text-slate-600 text-xs">{[emp.city, emp.country].filter(Boolean).join(", ") || "—"}</td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => { if (confirm("Delete this employee?")) deleteMut.mutate({ id: emp.id }); }}>
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="py-12 text-center text-slate-400">No employees found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
