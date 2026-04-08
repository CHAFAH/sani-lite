import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, Plus, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

interface EditableDropdownProps {
  label: string;
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  onAddNew: (newValue: string) => void;
  placeholder?: string;
}

function EditableDropdown({
  label,
  value,
  options,
  onValueChange,
  onAddNew,
  placeholder,
}: EditableDropdownProps) {
  const [showAddNew, setShowAddNew] = useState(false);
  const [newValue, setNewValue] = useState("");

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {!showAddNew ? (
        <div className="flex gap-2">
          <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddNew(true)}
            className="px-3"
          >
            <Plus size={16} />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder={`New ${label.toLowerCase()}`}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (newValue.trim()) {
                onAddNew(newValue.trim());
                setNewValue("");
                setShowAddNew(false);
              }
            }}
          >
            Add
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setShowAddNew(false);
              setNewValue("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AddEmployeePage() {
  const [, setLocation] = useLocation();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const createMut = trpc.employee.create.useMutation({
    onSuccess: (newEmployee) => {
      toast.success("Employee created and invitation sent!");
      setLocation("/admin/employees");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create employee");
    },
  });

  // Get unique values for dropdowns
  const departments = useMemo(
    () => Array.from(new Set(employees.map((e: any) => e.department).filter(Boolean))),
    [employees]
  );

  const positions = useMemo(
    () => Array.from(new Set(employees.map((e: any) => e.position).filter(Boolean))),
    [employees]
  );

  const managers = useMemo(
    () =>
      employees
        .filter((e: any) => e.role === "manager" || e.role === "admin")
        .map((e: any) => `${e.firstName} ${e.lastName}`),
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
    currency: "USD",
    role: "employee",
    manager: "",
  });

  const [newDepts, setNewDepts] = useState<string[]>([]);
  const [newPositions, setNewPositions] = useState<string[]>([]);

  const handleAddDepartment = (dept: string) => {
    setNewDepts([...newDepts, dept]);
    setForm({ ...form, department: dept });
  };

  const handleAddPosition = (pos: string) => {
    setNewPositions([...newPositions, pos]);
    setForm({ ...form, position: pos });
  };

  const handleCreate = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const selectedManager = employees.find(
      (e: any) => `${e.firstName} ${e.lastName}` === form.manager
    );

    createMut.mutate({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone || undefined,
      country: form.country || undefined,
      city: form.city || undefined,
      position: form.position || undefined,
      department: form.department || undefined,
      employmentType: form.employmentType,
      salary: form.salary ? String(parseFloat(form.salary)) : undefined,
      currency: form.currency,
      role: form.role as any,
      managerId: selectedManager?.id || undefined,
      status: "invited",
    } as any);
  };

  const allDepartments = Array.from(new Set([...departments, ...newDepts]));
  const allPositions = Array.from(new Set([...positions, ...newPositions]));

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/admin/employees")}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Add New Employee</h1>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail size={20} />
              Employee Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Company Email * (Invitation will be sent here)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="San Francisco"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium">
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>

            {/* Job Information */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Job Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <EditableDropdown
                  label="Department"
                  value={form.department}
                  options={allDepartments}
                  onValueChange={(value) => setForm({ ...form, department: value })}
                  onAddNew={handleAddDepartment}
                  placeholder="Select department"
                />
                <EditableDropdown
                  label="Position"
                  value={form.position}
                  options={allPositions}
                  onValueChange={(value) => setForm({ ...form, position: value })}
                  onAddNew={handleAddPosition}
                  placeholder="Select position"
                />
                <div className="space-y-2">
                  <Label htmlFor="employment-type" className="text-sm font-medium">
                    Employment Type
                  </Label>
                  <Select value={form.employmentType} onValueChange={(value) => setForm({ ...form, employmentType: value })}>
                    <SelectTrigger id="employment-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium">
                    Role
                  </Label>
                  <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-sm font-medium">Manager</Label>
                  <Select value={form.manager} onValueChange={(value) => setForm({ ...form, manager: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Manager</SelectItem>
                      {managers.map((manager) => (
                        <SelectItem key={manager} value={manager}>
                          {manager}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Compensation */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Compensation</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary" className="text-sm font-medium">
                    Salary
                  </Label>
                  <Input
                    id="salary"
                    type="text"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    placeholder="50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium">
                    Currency
                  </Label>
                  <Select value={form.currency} onValueChange={(value) => setForm({ ...form, currency: value })}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <p className="text-sm text-teal-900">
                <strong>Email Invitation:</strong> An invitation email will be sent to <strong>{form.email || "the employee email"}</strong> with a link to accept and join the company. They will then be taken to their employee profile to complete their setup.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <Button
                onClick={handleCreate}
                disabled={createMut.isPending}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {createMut.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
                Create Employee & Send Invite
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/admin/employees")}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
