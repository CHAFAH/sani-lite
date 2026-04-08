import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { CreditCard, DollarSign, TrendingUp, AlertCircle, Plus, CheckCircle, Clock, XCircle } from "lucide-react";
import { z } from "zod";

export default function AdminFinanceOSPage() {
  const [activeTab, setActiveTab] = useState("expenses");
  const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);
  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
  const [isCreateBudgetOpen, setIsCreateBudgetOpen] = useState(false);

  // Form states
  const [expenseForm, setExpenseForm] = useState({
    employeeId: "",
    amount: "",
    category: "travel" as const,
    description: "",
    receiptUrl: "",
  });

  const [cardForm, setCardForm] = useState({
    employeeId: "",
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    limit: "",
  });

  const [budgetForm, setBudgetForm] = useState({
    category: "",
    amount: "",
    period: "monthly" as const,
    startDate: "",
    endDate: "",
  });

  // Queries
  const { data: expenses = [], isLoading: expensesLoading } = trpc.finance.listExpenses.useQuery();
  const { data: cards = [], isLoading: cardsLoading } = trpc.finance.listCards.useQuery();
  const { data: budgets = [], isLoading: budgetsLoading } = trpc.finance.listBudgets.useQuery();
  const { data: employees = [] } = trpc.employee.list.useQuery();

  // Mutations
  const createExpenseMutation = trpc.finance.createExpense.useMutation({
    onSuccess: () => {
      setExpenseForm({ employeeId: "", amount: "", category: "travel", description: "", receiptUrl: "" });
      setIsCreateExpenseOpen(false);
      trpc.useUtils().finance.listExpenses.invalidate();
    },
  });

  const createCardMutation = trpc.finance.registerCard.useMutation({
    onSuccess: () => {
      setCardForm({ employeeId: "", cardNumber: "", cardholderName: "", expiryDate: "", limit: "" });
      setIsCreateCardOpen(false);
      trpc.useUtils().finance.listCards.invalidate();
    },
  });

  const createBudgetMutation = trpc.finance.createBudget.useMutation({
    onSuccess: () => {
      setBudgetForm({ category: "", amount: "", period: "monthly", startDate: "", endDate: "" });
      setIsCreateBudgetOpen(false);
      trpc.useUtils().finance.listBudgets.invalidate();
    },
  });

  const updateExpenseStatusMutation = trpc.finance.approveExpense.useMutation({
    onSuccess: () => {
      trpc.useUtils().finance.listExpenses.invalidate();
    },
  });

  const updateCardStatusMutation = trpc.finance.suspendCard.useMutation({
    onSuccess: () => {
      trpc.useUtils().finance.listCards.invalidate();
    },
  });

  // Handlers
  const handleCreateExpense = () => {
    if (!expenseForm.employeeId || !expenseForm.amount || !expenseForm.description) {
      alert("Please fill in all required fields");
      return;
    }
    createExpenseMutation.mutate({
      employeeId: parseInt(expenseForm.employeeId),
      amount: expenseForm.amount,
      category: expenseForm.category,
      description: expenseForm.description,
      receiptUrl: expenseForm.receiptUrl || undefined,
    });
  };

  const handleCreateCard = () => {
    if (!cardForm.employeeId || !cardForm.cardNumber || !cardForm.cardholderName || !cardForm.limit) {
      alert("Please fill in all required fields");
      return;
    }
    createCardMutation.mutate({
      employeeId: parseInt(cardForm.employeeId),
      cardNumber: cardForm.cardNumber,
      cardholderName: cardForm.cardholderName,
      expiryDate: cardForm.expiryDate,
      limit: cardForm.limit,
    });
  };

  const handleCreateBudget = () => {
    if (!budgetForm.category || !budgetForm.amount || !budgetForm.startDate || !budgetForm.endDate) {
      alert("Please fill in all required fields");
      return;
    }
    createBudgetMutation.mutate({
      departmentId: 1,
      amount: budgetForm.amount,
      period: budgetForm.period,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "submitted":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Submitted</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "reimbursed":
        return <Badge className="bg-purple-100 text-purple-800"><CheckCircle className="w-3 h-3 mr-1" />Reimbursed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCardStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "suspended":
        return <Badge className="bg-yellow-100 text-yellow-800">Suspended</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate stats
  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || "0"), 0);
  const pendingExpenses = expenses.filter((exp) => exp.status === "submitted").length;
  const activeCards = cards.filter((card) => card.status === "active").length;
  const totalBudget = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount || "0"), 0);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finance OS</h1>
          <p className="text-muted-foreground mt-2">Manage expenses, corporate cards, and budgets</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
                <DollarSign className="w-8 h-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{pendingExpenses}</div>
                <Clock className="w-8 h-8 text-yellow-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{activeCards}</div>
                <CreditCard className="w-8 h-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Budgets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">${totalBudget.toFixed(2)}</div>
                <TrendingUp className="w-8 h-8 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="cards">Corporate Cards</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
          </TabsList>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Expense Reports</h2>
              <Dialog open={isCreateExpenseOpen} onOpenChange={setIsCreateExpenseOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Expense
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Expense Report</DialogTitle>
                    <DialogDescription>Add a new expense for reimbursement</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Employee</Label>
                      <Select value={expenseForm.employeeId} onValueChange={(value) => setExpenseForm({ ...expenseForm, employeeId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id.toString()}>
                              {emp.firstName} {emp.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Amount</Label>
                      <Input type="number" placeholder="0.00" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={expenseForm.category} onValueChange={(value: any) => setExpenseForm({ ...expenseForm, category: value })}>
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
                      <Input placeholder="Expense description" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} />
                    </div>
                    <div>
                      <Label>Receipt URL (optional)</Label>
                      <Input placeholder="https://..." value={expenseForm.receiptUrl} onChange={(e) => setExpenseForm({ ...expenseForm, receiptUrl: e.target.value })} />
                    </div>
                    <Button onClick={handleCreateExpense} disabled={createExpenseMutation.isPending} className="w-full">
                      {createExpenseMutation.isPending ? "Creating..." : "Create Expense"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {expensesLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading expenses...</div>
            ) : expenses.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">No expenses found. Create one to get started.</CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {expenses.map((expense) => (
                  <Card key={expense.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{expense.description}</p>
                          <p className="text-sm text-muted-foreground capitalize">{expense.category}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">${parseFloat(expense.amount || "0").toFixed(2)}</p>
                            {getStatusBadge(expense.status)}
                          </div>
                          {expense.status === "submitted" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateExpenseStatusMutation.mutate({ id: expense.id })}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateExpenseStatusMutation.mutate({ id: expense.id })}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Corporate Cards Tab */}
          <TabsContent value="cards" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Corporate Cards</h2>
              <Dialog open={isCreateCardOpen} onOpenChange={setIsCreateCardOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Issue Card
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Issue Corporate Card</DialogTitle>
                    <DialogDescription>Create a new corporate card for an employee</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Employee</Label>
                      <Select value={cardForm.employeeId} onValueChange={(value) => setCardForm({ ...cardForm, employeeId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id.toString()}>
                              {emp.firstName} {emp.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Card Number</Label>
                      <Input placeholder="4111 1111 1111 1111" value={cardForm.cardNumber} onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })} />
                    </div>
                    <div>
                      <Label>Cardholder Name</Label>
                      <Input placeholder="Full name" value={cardForm.cardholderName} onChange={(e) => setCardForm({ ...cardForm, cardholderName: e.target.value })} />
                    </div>
                    <div>
                      <Label>Expiry Date</Label>
                      <Input placeholder="MM/YY" value={cardForm.expiryDate} onChange={(e) => setCardForm({ ...cardForm, expiryDate: e.target.value })} />
                    </div>
                    <div>
                      <Label>Spending Limit</Label>
                      <Input type="number" placeholder="5000" value={cardForm.limit} onChange={(e) => setCardForm({ ...cardForm, limit: e.target.value })} />
                    </div>
                    <Button onClick={handleCreateCard} disabled={createCardMutation.isPending} className="w-full">
                      {createCardMutation.isPending ? "Issuing..." : "Issue Card"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {cardsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading cards...</div>
            ) : cards.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">No corporate cards issued yet.</CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.map((card) => (
                  <Card key={card.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <CreditCard className="w-8 h-8 text-blue-600" />
                        {getCardStatusBadge(card.status)}
                      </div>
                      <p className="font-semibold text-lg mb-2">{card.cardholderName}</p>
                      <p className="text-sm text-muted-foreground font-mono mb-4">{card.cardNumber}</p>
                      <div className="flex justify-between text-sm">
                        <div>
                          <p className="text-muted-foreground">Limit</p>
                          <p className="font-semibold">${parseFloat(card.limit || "0").toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expires</p>
                          <p className="font-semibold">{card.expiryDate}</p>
                        </div>
                      </div>
                      {card.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-4"
                          onClick={() => updateCardStatusMutation.mutate({ id: card.id })}
                        >
                          Suspend Card
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Budgets Tab */}
          <TabsContent value="budgets" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Department Budgets</h2>
              <Dialog open={isCreateBudgetOpen} onOpenChange={setIsCreateBudgetOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Budget
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Budget</DialogTitle>
                    <DialogDescription>Set a spending budget for a category</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Category</Label>
                      <Input placeholder="e.g., Marketing, Engineering" value={budgetForm.category} onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })} />
                    </div>
                    <div>
                      <Label>Budget Amount</Label>
                      <Input type="number" placeholder="10000" value={budgetForm.amount} onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })} />
                    </div>
                    <div>
                      <Label>Period</Label>
                      <Select value={budgetForm.period} onValueChange={(value: any) => setBudgetForm({ ...budgetForm, period: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <Input type="date" value={budgetForm.startDate} onChange={(e) => setBudgetForm({ ...budgetForm, startDate: e.target.value })} />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input type="date" value={budgetForm.endDate} onChange={(e) => setBudgetForm({ ...budgetForm, endDate: e.target.value })} />
                    </div>
                    <Button onClick={handleCreateBudget} disabled={createBudgetMutation.isPending} className="w-full">
                      {createBudgetMutation.isPending ? "Creating..." : "Create Budget"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {budgetsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading budgets...</div>
            ) : budgets.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">No budgets set yet. Create one to get started.</CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {budgets.map((budget) => {
                  const spent = parseFloat(budget.spent || "0");
                  const total = parseFloat(budget.amount || "0");
                  const percentage = total > 0 ? (spent / total) * 100 : 0;
                  return (
                    <Card key={budget.id}>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{budget.category}</p>
                          <p className="text-sm text-muted-foreground capitalize">{budget.period}</p>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 mb-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(percentage, 100)}%` }} />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            ${spent.toFixed(2)} / ${total.toFixed(2)}
                          </span>
                          <span className={percentage > 100 ? "text-red-600 font-semibold" : "text-green-600"}>{percentage.toFixed(1)}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
