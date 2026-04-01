import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Upload, Users, Lock } from "lucide-react";
import SsoConfiguration from "@/components/SsoConfiguration";

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    position: "",
    employmentType: "full_time" as const,
  });

  const listEmployeesMutation = trpc.employee.list.useQuery();
  const createEmployeeMutation = trpc.employee.create.useMutation();
  const deleteEmployeeMutation = trpc.employee.delete.useMutation();
  const subscriptionQuery = trpc.subscription.getByCompanyId.useQuery();

  const handleCreateEmployee = async () => {
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createEmployeeMutation.mutateAsync(newEmployee);
      setNewEmployee({
        firstName: "",
        lastName: "",
        email: "",
        department: "",
        position: "",
        employmentType: "full_time",
      });
      setIsOpen(false);
      toast.success("Employee added successfully");
      // Refetch employees
      listEmployeesMutation.refetch();
    } catch (error) {
      toast.error("Failed to add employee");
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      await deleteEmployeeMutation.mutateAsync({ id });
      toast.success("Employee deleted successfully");
      listEmployeesMutation.refetch();
    } catch (error) {
      toast.error("Failed to delete employee");
    }
  };

  const subscription = subscriptionQuery.data;
  const employeeCount = listEmployeesMutation.data?.length || 0;
  const seatsAvailable = subscription ? subscription.seats - employeeCount : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your team, settings, and integrations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600">{employeeCount}</div>
            <p className="text-xs text-gray-500 mt-1">Active team members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Seats Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{Math.max(0, seatsAvailable)}</div>
            <p className="text-xs text-gray-500 mt-1">Out of {subscription?.seats || 0} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Subscription Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 capitalize">{subscription?.tier || "N/A"}</div>
            <p className="text-xs text-gray-500 mt-1">{subscription?.billingCycle} billing</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="team" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="sso" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Single Sign-On
          </TabsTrigger>
        </TabsList>

        {/* Team Members Tab */}
        <TabsContent value="team" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>Invite a new team member to your company</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">First Name *</label>
                      <Input
                        placeholder="John"
                        value={newEmployee.firstName}
                        onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Last Name *</label>
                      <Input
                        placeholder="Doe"
                        value={newEmployee.lastName}
                        onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      placeholder="john@acme.com"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Department</label>
                    <Input
                      placeholder="Engineering"
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Position</label>
                    <Input
                      placeholder="Senior Developer"
                      value={newEmployee.position}
                      onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Employment Type</label>
                    <Select value={newEmployee.employmentType} onValueChange={(value: any) => setNewEmployee({ ...newEmployee, employmentType: value })}>
                      <SelectTrigger className="mt-1">
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
                  <Button onClick={handleCreateEmployee} className="w-full bg-teal-600 hover:bg-teal-700" disabled={createEmployeeMutation.isPending}>
                    {createEmployeeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Add Employee
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Employees Table */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage and view all employees in your company</CardDescription>
            </CardHeader>
            <CardContent>
              {listEmployeesMutation.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                </div>
              ) : listEmployeesMutation.data && listEmployeesMutation.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="pb-3 font-semibold text-gray-700">Name</th>
                        <th className="pb-3 font-semibold text-gray-700">Email</th>
                        <th className="pb-3 font-semibold text-gray-700">Department</th>
                        <th className="pb-3 font-semibold text-gray-700">Position</th>
                        <th className="pb-3 font-semibold text-gray-700">Status</th>
                        <th className="pb-3 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listEmployeesMutation.data.map((employee: any) => (
                        <tr key={employee.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">{employee.firstName} {employee.lastName}</td>
                          <td className="py-3 text-gray-600">{employee.email}</td>
                          <td className="py-3 text-gray-600">{employee.department || "-"}</td>
                          <td className="py-3 text-gray-600">{employee.position || "-"}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              employee.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}>
                              {employee.status}
                            </span>
                          </td>
                          <td className="py-3 flex gap-2">
                            <Button variant="outline" size="sm" className="text-xs">
                              <Upload className="w-3 h-3 mr-1" />
                              Docs
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteEmployee(employee.id)}
                              disabled={deleteEmployeeMutation.isPending}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No employees yet. Click "Add Employee" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SSO Tab */}
        <TabsContent value="sso">
          <SsoConfiguration />
        </TabsContent>
      </Tabs>
    </div>
  );
}
