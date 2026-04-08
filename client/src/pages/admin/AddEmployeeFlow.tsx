import { useState } from "react";
import { useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

type Step = "basic" | "job" | "manager" | "role" | "review";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  employmentType: "full_time" | "part_time" | "contract" | "temporary";
  startDate: string;
  managerId: string | number;
  role: "admin" | "manager" | "employee";
  salary: string;
  currency: string;
}

export default function AddEmployeeFlow() {
  const [, setLocation] = useLocation();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const createMut = trpc.employee.create.useMutation({
    onSuccess: () => {
      toast.success("Employee created successfully");
      setLocation("/admin/employees");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create employee");
    },
  });

  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    employmentType: "full_time",
    startDate: "",
    managerId: "",
    role: "employee",
    salary: "",
    currency: "USD",
  });

  const steps: Step[] = ["basic", "job", "manager", "role", "review"];
  const currentStepIndex = steps.indexOf(currentStep);

  const handleNext = () => {
    // Validate current step
    if (currentStep === "basic") {
      if (!form.firstName || !form.lastName || !form.email) {
        toast.error("Please fill in all required fields");
        return;
      }
    }
    if (currentStep === "job") {
      if (!form.position || !form.department) {
        toast.error("Please fill in all required fields");
        return;
      }
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };

  const handleSubmit = () => {
    createMut.mutate({
      ...form,
      managerId: form.managerId ? parseInt(form.managerId.toString()) : undefined,
    } as any);
  };

  const managers = employees.filter((e: any) => (e as any)?.role === "manager" || (e as any)?.role === "admin");

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/admin/employees")}
            className="mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Employees
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Add New Employee</h1>
          <p className="text-slate-600 mt-1">Step {currentStepIndex + 1} of {steps.length}</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2">
          {steps.map((step, idx) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full transition-colors ${
                idx <= currentStepIndex ? "bg-teal-600" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === "basic" && "Basic Information"}
              {currentStep === "job" && "Job Details"}
              {currentStep === "manager" && "Manager Assignment"}
              {currentStep === "role" && "Role & Permissions"}
              {currentStep === "review" && "Review & Invite"}
            </CardTitle>
            <CardDescription>
              {currentStep === "basic" && "Enter the employee's basic contact information"}
              {currentStep === "job" && "Set up their job title, department, and employment details"}
              {currentStep === "manager" && "Assign a manager for this employee"}
              {currentStep === "role" && "Select the employee's role and permissions"}
              {currentStep === "review" && "Review all information and send invitation"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === "basic" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Job Details */}
            {currentStep === "job" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="position">Job Title *</Label>
                  <Input
                    id="position"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    placeholder="Engineering"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employmentType">Employment Type</Label>
                    <Select value={form.employmentType} onValueChange={(v: any) => setForm({ ...form, employmentType: v })}>
                      <SelectTrigger id="employmentType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salary">Salary</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={form.salary}
                      onChange={(e) => setForm({ ...form, salary: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Manager Assignment */}
            {currentStep === "manager" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="managerId">Assign Manager</Label>
                  <Select value={form.managerId.toString()} onValueChange={(v) => setForm({ ...form, managerId: v })}>
                    <SelectTrigger id="managerId">
                      <SelectValue placeholder="Select a manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Manager</SelectItem>
                      {managers.map((m: any) => (
                        <SelectItem key={m.id} value={m.id.toString()}>
                          {m.firstName} {m.lastName} ({m.position})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-2">
                    The manager can approve time off requests and provide feedback
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Role Assignment */}
            {currentStep === "role" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="role">Role & Permissions *</Label>
                  <Select value={form.role} onValueChange={(v: any) => setForm({ ...form, role: v })}>
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

                {/* Role Descriptions */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  {form.role === "employee" && (
                    <div>
                      <p className="font-medium text-slate-900">Employee</p>
                      <p className="text-sm text-slate-600">
                        Can view own profile, request time off, and view payslips
                      </p>
                    </div>
                  )}
                  {form.role === "manager" && (
                    <div>
                      <p className="font-medium text-slate-900">Manager</p>
                      <p className="text-sm text-slate-600">
                        Can manage team members, approve requests, and view team analytics
                      </p>
                    </div>
                  )}
                  {form.role === "admin" && (
                    <div>
                      <p className="font-medium text-slate-900">Admin</p>
                      <p className="text-sm text-slate-600">
                        Full platform access, can manage all employees, settings, and configurations
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === "review" && (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Name</p>
                      <p className="font-medium text-slate-900">
                        {form.firstName} {form.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="font-medium text-slate-900">{form.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Job Title</p>
                      <p className="font-medium text-slate-900">{form.position}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Department</p>
                      <p className="font-medium text-slate-900">{form.department}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Role</p>
                      <p className="font-medium text-slate-900 capitalize">{form.role}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Manager</p>
                      <p className="font-medium text-slate-900">
                        {form.managerId
                          ? managers.find((m: any) => m.id.toString() === form.managerId)?.firstName
                          : "No Manager"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    An invitation email will be sent to <strong>{form.email}</strong> with a link to set up their account.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-3 justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
          >
            <ArrowLeft size={16} className="mr-2" />
            Previous
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setLocation("/admin/employees")}
            >
              Cancel
            </Button>

            {currentStep !== "review" ? (
              <Button
                onClick={handleNext}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Next
                <ArrowRight size={16} className="ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createMut.isPending}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Check size={16} className="mr-2" />
                {createMut.isPending ? "Sending..." : "Send Invitation"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
