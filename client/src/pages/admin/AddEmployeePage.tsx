import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Loader2, Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { COUNTRIES } from "@shared/countries";


const CURRENCIES = [
  { code: "DKK", label: "DKK - Danish Krone" },
  { code: "USD", label: "USD - US Dollar" },
  { code: "EUR", label: "EUR - Euro" },
  { code: "GBP", label: "GBP - British Pound" },
  { code: "SEK", label: "SEK - Swedish Krona" },
  { code: "NOK", label: "NOK - Norwegian Krone" },
  { code: "CHF", label: "CHF - Swiss Franc" },
  { code: "CAD", label: "CAD - Canadian Dollar" },
  { code: "AUD", label: "AUD - Australian Dollar" },
  { code: "JPY", label: "JPY - Japanese Yen" },
  { code: "CNY", label: "CNY - Chinese Yuan" },
  { code: "INR", label: "INR - Indian Rupee" },
  { code: "BRL", label: "BRL - Brazilian Real" },
  { code: "PLN", label: "PLN - Polish Zloty" },
  { code: "CZK", label: "CZK - Czech Koruna" },
  { code: "ZAR", label: "ZAR - South African Rand" },
  { code: "NGN", label: "NGN - Nigerian Naira" },
  { code: "AED", label: "AED - UAE Dirham" },
  { code: "SGD", label: "SGD - Singapore Dollar" },
  { code: "NZD", label: "NZD - New Zealand Dollar" },
  { code: "MXN", label: "MXN - Mexican Peso" },
  { code: "PHP", label: "PHP - Philippine Peso" },
  { code: "THB", label: "THB - Thai Baht" },
];

export default function AddEmployeePage() {
  const [, setLocation] = useLocation();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const createMut = trpc.employee.create.useMutation({
    onSuccess: () => {
      toast.success("Employee created and invitation sent!");
      setLocation("/admin/employees");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create employee");
    },
  });

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e: any) => e.department).filter(Boolean))).sort(),
    [employees]
  );

  const positions = useMemo(
    () => Array.from(new Set(employees.map((e: any) => e.position).filter(Boolean))).sort(),
    [employees]
  );

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    position: "",
    department: "",
    employmentType: "full_time",
    salary: "",
    currency: "DKK",
    startDate: "",
    managerId: "",
  });

  const [newDepts, setNewDepts] = useState<string[]>([]);
  const [newPositions, setNewPositions] = useState<string[]>([]);
  const [countrySearch, setCountrySearch] = useState("");

  const DEFAULT_DEPARTMENTS = [
    "Engineering", "Product", "Design", "Marketing", "Sales", "Finance", "Human Resources",
    "Operations", "Customer Success", "Legal", "IT", "Data", "Research", "Quality Assurance",
    "Business Development", "Administration", "Supply Chain", "Logistics", "Procurement",
    "Communications", "Security", "Compliance", "Facilities", "Training",
  ];

  const DEFAULT_POSITIONS = [
    "Software Engineer", "Senior Software Engineer", "Staff Engineer", "Principal Engineer",
    "Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer",
    "Engineering Manager", "VP of Engineering", "CTO",
    "Product Manager", "Senior Product Manager", "Head of Product", "CPO",
    "UX Designer", "UI Designer", "Product Designer", "Design Lead", "Head of Design",
    "Data Analyst", "Data Scientist", "Data Engineer", "ML Engineer",
    "Marketing Manager", "Content Strategist", "Growth Manager", "CMO",
    "Sales Representative", "Account Executive", "Sales Manager", "VP of Sales",
    "Customer Success Manager", "Support Engineer", "Support Lead",
    "HR Manager", "HR Business Partner", "Recruiter", "People Operations", "CHRO",
    "Finance Manager", "Accountant", "Financial Analyst", "CFO", "Controller",
    "Operations Manager", "COO", "Project Manager", "Program Manager",
    "Legal Counsel", "Compliance Officer", "General Counsel",
    "Office Manager", "Executive Assistant", "Administrative Assistant",
    "QA Engineer", "QA Lead", "Test Automation Engineer",
    "Security Engineer", "CISO", "IT Administrator", "System Administrator",
    "Business Analyst", "Consultant", "Intern", "CEO",
  ];

  const allDepartments = useMemo(
    () => Array.from(new Set([...DEFAULT_DEPARTMENTS, ...departments, ...newDepts])).sort(),
    [departments, newDepts]
  );
  const allPositions = useMemo(
    () => Array.from(new Set([...DEFAULT_POSITIONS, ...positions, ...newPositions])).sort(),
    [positions, newPositions]
  );

  const filteredCountries = useMemo(
    () => {
      const term = countrySearch.toLowerCase();
      return term ? COUNTRIES.filter(c => c.name.toLowerCase().includes(term)) : COUNTRIES;
    },
    [countrySearch]
  );

  const handleCreate = () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error("Please fill in first name, last name, and email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    createMut.mutate({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone || undefined,
      country: form.country || undefined,
      city: form.city || undefined,
      position: form.position || undefined,
      department: form.department || undefined,
      employmentType: form.employmentType as any,
      salary: form.salary ? String(parseFloat(form.salary)) : undefined,
      currency: form.currency,
      startDate: form.startDate || undefined,
      managerId: form.managerId && form.managerId !== "none" ? parseInt(form.managerId) : undefined,
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/admin/employees")}>
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Add New Employee</h1>
        </div>

        {/* Form */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <UserPlus size={18} className="text-teal-600" />
            <h2 className="font-semibold text-slate-900">Employee Information</h2>
          </div>

          <div className="p-6 space-y-8">
            {/* Personal Information */}
            <section>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">First Name *</Label>
                  <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="John" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Last Name *</Label>
                  <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Doe" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Work Email * (invitation sent here)</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+45 12 34 56 78" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">City</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Copenhagen" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Country</Label>
                  <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
                    <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent>
                      <div className="px-2 pb-2 sticky top-0 bg-white">
                        <Input placeholder="Search country..." value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} className="h-8 text-sm" />
                      </div>
                      {filteredCountries.map((c) => (
                        <SelectItem key={c.code} value={c.name}>{c.flag} {c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Job Information */}
            <section>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Job Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Department</Label>
                  <div className="flex gap-2">
                    <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {allDepartments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <AddNewButton onAdd={(v) => { setNewDepts([...newDepts, v]); setForm({ ...form, department: v }); }} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Position / Title</Label>
                  <div className="flex gap-2">
                    <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="Select position" /></SelectTrigger>
                      <SelectContent>
                        {allPositions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <AddNewButton onAdd={(v) => { setNewPositions([...newPositions, v]); setForm({ ...form, position: v }); }} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Employment Type</Label>
                  <Select value={form.employmentType} onValueChange={(v) => setForm({ ...form, employmentType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Start Date</Label>
                  <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Reports To (Manager)</Label>
                  <Select value={form.managerId} onValueChange={(v) => setForm({ ...form, managerId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Manager</SelectItem>
                      {employees.map((e: any) => (
                        <SelectItem key={e.id} value={String(e.id)}>
                          {e.firstName} {e.lastName} {e.position ? `— ${e.position}` : ""} {e.department ? `(${e.department})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-slate-400 mt-1">This will sync to the org chart</p>
                </div>
              </div>
            </section>

            {/* Compensation */}
            <section>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Compensation</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Monthly Salary</Label>
                  <Input type="text" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="45000" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Currency</Label>
                  <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Info */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <p className="text-sm text-teal-900">
                <Mail size={14} className="inline mr-1.5 -mt-0.5" />
                <strong>Invitation:</strong> An email will be sent to <strong>{form.email || "the employee"}</strong> with a link to create their password and join the company.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button onClick={handleCreate} disabled={createMut.isPending} className="bg-teal-600 hover:bg-teal-700 text-white px-6">
                {createMut.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <UserPlus size={16} className="mr-2" />}
                Create Employee & Send Invite
              </Button>
              <Button variant="outline" onClick={() => setLocation("/admin/employees")}>Cancel</Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function AddNewButton({ onAdd }: { onAdd: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  if (!open) {
    return (
      <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => setOpen(true)}>
        <Plus size={14} />
      </Button>
    );
  }

  return (
    <div className="flex gap-1">
      <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="New..." className="h-9 w-28 text-sm" autoFocus onKeyDown={(e) => { if (e.key === "Enter" && value.trim()) { onAdd(value.trim()); setValue(""); setOpen(false); } }} />
      <Button type="button" size="sm" className="h-9 px-2 text-xs" onClick={() => { if (value.trim()) { onAdd(value.trim()); setValue(""); setOpen(false); } }}>Add</Button>
      <Button type="button" variant="ghost" size="sm" className="h-9 px-2 text-xs" onClick={() => { setOpen(false); setValue(""); }}>✕</Button>
    </div>
  );
}
