import { useState } from "react";
import EmployeeLayout from "@/components/EmployeeLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, DollarSign, CheckCircle, Clock, XCircle } from "lucide-react";

export default function EmployeeExpensesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    category: "travel" as const,
    description: "",
    receiptUrl: "",
  });

  const { data: myEmployee } = trpc.userManagement.getMyEmployee.useQuery();
  const { data: expenses = [], isLoading } = trpc.finance.listExpenses.useQuery();

  const createExpenseMutation = trpc.finance.createExpense.useMutation({
    onSuccess: () => {
      setFormData({ amount: "", category: "travel", description: "", receiptUrl: "" });
      setIsCreateOpen(false);
      trpc.useUtils().finance.listExpenses.invalidate();
    },
  });

  const handleCreate = () => {
    if (!myEmployee || !formData.amount || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }
    createExpenseMutation.mutate({
      employeeId: myEmployee.id,
      amount: formData.amount,
      category: formData.category,
      description: formData.description,
      receiptUrl: formData.receiptUrl || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "submitted":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "reimbursed":
        return <Badge className="bg-purple-100 text-purple-800"><CheckCircle className="w-3 h-3 mr-1" />Reimbursed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalSubmitted = expenses.reduce((sum: number, exp: any) => sum + parseFloat(exp.amount || "0"), 0);
  const approvedAmount = expenses
    .filter((exp: any) => exp.status === "approved" || exp.status === "reimbursed")
    .reduce((sum: number, exp: any) => sum + parseFloat(exp.amount || "0"), 0);

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Expenses</h1>
            <p className="text-muted-foreground mt-2">Track and submit your business expenses for reimbursement</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Submit Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Expense</DialogTitle>
                <DialogDescription>Add a business expense for reimbursement</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Amount</Label>
                  <Input type="number" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="meals">Meals</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input placeholder="What was this expense for?" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div>
                  <Label>Receipt URL (optional)</Label>
                  <Input placeholder="https://..." value={formData.receiptUrl} onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })} />
                </div>
                <Button onClick={handleCreate} disabled={createExpenseMutation.isPending} className="w-full">
                  {createExpenseMutation.isPending ? "Submitting..." : "Submit Expense"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">${totalSubmitted.toFixed(2)}</div>
                <DollarSign className="w-8 h-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved & Reimbursed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">${approvedAmount.toFixed(2)}</div>
                <CheckCircle className="w-8 h-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expenses List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Expenses</h2>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No expenses submitted yet. Click "Submit Expense" to add one.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense: any) => (
                <Card key={expense.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-muted-foreground capitalize">{expense.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${parseFloat(expense.amount || "0").toFixed(2)}</p>
                        {getStatusBadge(expense.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
}
