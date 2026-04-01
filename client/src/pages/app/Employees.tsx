/*
 * Employees — Full employee directory with CRUD using real tRPC data
 */
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Search, UserCircle, Mail, Phone, MapPin, Building2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const DEPARTMENTS = ["Engineering", "Product", "Design", "Marketing", "Sales", "HR", "Finance", "Operations", "Legal", "Support"];
const STATUSES = ["active", "inactive", "on_leave", "offboarded"] as const;

export default function AppEmployees() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", department: "", position: "", phone: "", country: "", city: "", salary: "", currency: "USD", employmentType: "full_time" as const, startDate: "" });

  const utils = trpc.useUtils();
  const { data: employees, isLoading } = trpc.employee.list.useQuery();
  const createMut = trpc.employee.create.useMutation({ onSuccess: () => { utils.employee.list.invalidate(); setIsOpen(false); resetForm(); toast.success("Employee added"); } });
  const updateMut = trpc.employee.update.useMutation({ onSuccess: () => { utils.employee.list.invalidate(); setIsOpen(false); resetForm(); toast.success("Employee updated"); } });
  const deleteMut = trpc.employee.delete.useMutation({ onSuccess: () => { utils.employee.list.invalidate(); toast.success("Employee removed"); } });

  const resetForm = () => { setForm({ firstName: "", lastName: "", email: "", department: "", position: "", phone: "", country: "", city: "", salary: "", currency: "USD", employmentType: "full_time", startDate: "" }); setEditingId(null); };

  const handleSubmit = () => {
    if (!form.firstName || !form.lastName || !form.email) { toast.error("First name, last name, and email are required"); return; }
    if (editingId) {
      updateMut.mutate({ id: editingId, firstName: form.firstName, lastName: form.lastName, department: form.department || undefined, position: form.position || undefined, phone: form.phone || undefined, country: form.country || undefined, city: form.city || undefined, salary: form.salary || undefined, currency: form.currency || undefined });
    } else {
      createMut.mutate({ ...form, department: form.department || undefined, position: form.position || undefined, phone: form.phone || undefined, country: form.country || undefined, city: form.city || undefined, salary: form.salary || undefined, startDate: form.startDate || undefined });
    }
  };

  const openEdit = (emp: any) => {
    setEditingId(emp.id);
    setForm({ firstName: emp.firstName, lastName: emp.lastName, email: emp.email, department: emp.department || "", position: emp.position || "", phone: emp.phone || "", country: emp.country || "", city: emp.city || "", salary: emp.salary || "", currency: emp.currency || "USD", employmentType: emp.employmentType || "full_time", startDate: "" });
    setIsOpen(true);
  };

  const filtered = (employees || []).filter(e => {
    const matchSearch = `${e.firstName} ${e.lastName} ${e.email} ${e.position || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || e.department === deptFilter;
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const statusColor: Record<string, string> = { active: "bg-emerald-50 text-emerald-700 border-emerald-200", inactive: "bg-gray-50 text-gray-600 border-gray-200", on_leave: "bg-amber-50 text-amber-700 border-amber-200", offboarded: "bg-red-50 text-red-600 border-red-200" };

  return (
    <AppLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-normal tracking-tight font-serif">Employees</h1>
            <p className="text-muted-foreground text-sm mt-1">{filtered.length} employee{filtered.length !== 1 ? "s" : ""} found</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2"><Plus size={16} />Add Employee</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editingId ? "Edit Employee" : "Add Employee"}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Input placeholder="First Name *" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} />
                <Input placeholder="Last Name *" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} />
                <Input placeholder="Email *" type="email" className="col-span-2" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                <Select value={form.department} onValueChange={v => setForm(p => ({ ...p, department: v }))}>
                  <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
                <Input placeholder="Position" value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} />
                <Input placeholder="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                <Input placeholder="Country" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} />
                <Input placeholder="City" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                <Input placeholder="Salary" type="number" value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} />
                <Select value={form.currency} onValueChange={v => setForm(p => ({ ...p, currency: v }))}>
                  <SelectTrigger><SelectValue placeholder="Currency" /></SelectTrigger>
                  <SelectContent>{["USD", "EUR", "GBP", "NGN", "CAD", "AUD"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.employmentType} onValueChange={v => setForm(p => ({ ...p, employmentType: v as any }))}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
                {!editingId && <Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>Cancel</Button>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending}>
                  {createMut.isPending || updateMut.isPending ? "Saving..." : editingId ? "Update" : "Add Employee"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search employees..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Employee List */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="py-12 text-center">
            <CardContent>
              <UserCircle size={48} className="mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No employees found. Add your first team member to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(emp => (
              <motion.div key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm">
                      {emp.firstName[0]}{emp.lastName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs text-muted-foreground">{emp.position || "No position"}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal size={16} /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(emp)}><Pencil size={14} className="mr-2" />Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => { if (confirm("Delete this employee?")) deleteMut.mutate({ id: emp.id }); }}><Trash2 size={14} className="mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><Mail size={12} />{emp.email}</div>
                  {emp.phone && <div className="flex items-center gap-2"><Phone size={12} />{emp.phone}</div>}
                  {emp.department && <div className="flex items-center gap-2"><Building2 size={12} />{emp.department}</div>}
                  {(emp.city || emp.country) && <div className="flex items-center gap-2"><MapPin size={12} />{[emp.city, emp.country].filter(Boolean).join(", ")}</div>}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <Badge variant="outline" className={statusColor[emp.status || "active"] || ""}>{(emp.status || "active").replace("_", " ")}</Badge>
                  {emp.salary && <span className="text-xs font-medium">{emp.currency} {Number(emp.salary).toLocaleString()}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
