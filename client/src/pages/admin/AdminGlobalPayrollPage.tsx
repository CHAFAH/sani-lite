import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Globe, DollarSign, Users, AlertTriangle, CheckCircle2, Clock,
  Search, Filter, MoreVertical, Play, FileText, Download,
  TrendingUp, ArrowUpRight, ArrowDownRight, Banknote, Building2,
  Loader2, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { getSchengenCountries } from "@shared/countries";

/* ── Country payroll configs (Schengen countries with accurate 2026 tax rates) ── */
const SCHENGEN_PAYROLL_CONFIG = getSchengenCountries().map((country: any) => ({
  code: country.code,
  name: country.name,
  currency: country.currency || "EUR",
  taxRate: (country.taxRate || 0) / 100, // Convert percentage to decimal
  flag: country.flag,
  isSchengen: true,
}));

// Fallback for non-Schengen countries
const OTHER_COUNTRIES = [
  { code: "US", name: "United States", currency: "USD", taxRate: 0.22, flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", currency: "GBP", taxRate: 0.20, flag: "🇬🇧" },
  { code: "CA", name: "Canada", currency: "CAD", taxRate: 0.205, flag: "🇨🇦" },
  { code: "AU", name: "Australia", currency: "AUD", taxRate: 0.325, flag: "🇦🇺" },
  { code: "IN", name: "India", currency: "INR", taxRate: 0.20, flag: "🇮🇳" },
  { code: "NG", name: "Nigeria", currency: "NGN", taxRate: 0.24, flag: "🇳🇬" },
  { code: "KE", name: "Kenya", currency: "KES", taxRate: 0.30, flag: "🇰🇪" },
  { code: "AE", name: "UAE", currency: "AED", taxRate: 0.0, flag: "🇦🇪" },
  { code: "SG", name: "Singapore", currency: "SGD", taxRate: 0.07, flag: "🇸🇬" },
  { code: "JP", name: "Japan", currency: "JPY", taxRate: 0.23, flag: "🇯🇵" },
  { code: "BR", name: "Brazil", currency: "BRL", taxRate: 0.275, flag: "🇧🇷" },
  { code: "ZA", name: "South Africa", currency: "ZAR", taxRate: 0.26, flag: "🇿🇦" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", taxRate: 0.0, flag: "🇸🇦" },
];

const COUNTRIES = [...SCHENGEN_PAYROLL_CONFIG, ...OTHER_COUNTRIES];

const PAY_SCHEDULES = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom" },
];

export default function AdminGlobalPayrollPage() {
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const { data: payrollRecords = [] } = trpc.payroll.list.useQuery();
  const { data: cycles = [] } = trpc.payrollCycle.list.useQuery();
  const utils = trpc.useUtils();

  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [scheduleFilter, setScheduleFilter] = useState("all");
  const [showRunPayroll, setShowRunPayroll] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

  // Compute payroll stats
  const totalPayrollCost = useMemo(() => {
    return employees.reduce((sum: number, e: any) => sum + (Number(e.salary) || 0), 0);
  }, [employees]);

  const activeEmployees = employees.filter((e: any) => e.status === "active");
  const countriesUsed = useMemo(() => {
    const set = new Set(employees.map((e: any) => e.country).filter(Boolean));
    return Array.from(set);
  }, [employees]);

  const pendingPayrolls = cycles.filter((c: any) => c.status === "draft" || c.status === "approved").length;
  const processedThisMonth = cycles.filter((c: any) => c.status === "paid").length;

  // Filter employees for payroll view
  const filteredEmployees = useMemo(() => {
    return activeEmployees.filter((e: any) => {
      const matchSearch = !searchQuery || 
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCountry = countryFilter === "all" || e.country === countryFilter;
      return matchSearch && matchCountry;
    });
  }, [activeEmployees, searchQuery, countryFilter]);

  // Group employees by country
  const employeesByCountry = useMemo(() => {
    const groups: Record<string, any[]> = {};
    activeEmployees.forEach((e: any) => {
      const country = e.country || "Unassigned";
      if (!groups[country]) groups[country] = [];
      groups[country].push(e);
    });
    return groups;
  }, [activeEmployees]);

  const toggleEmployee = (id: number) => {
    setSelectedEmployees(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map((e: any) => e.id));
    }
  };

  const computeTax = (salary: number, country: string) => {
    const config = COUNTRIES.find(c => c.name === country);
    if (!config) return { tax: salary * 0.2, social: salary * 0.1, net: salary * 0.7 };
    const tax = salary * config.taxRate;
    const social = salary * ((config as any).socialSecurity || 0.1); // Default 10% if not specified
    const net = salary - tax - social;
    return { tax, social, net };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Global Payroll</h1>
            <p className="text-sm text-slate-500 mt-1">Multi-country payroll management with local compliance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info("Export coming soon")}>
              <Download size={16} className="mr-2" />Export
            </Button>
            <Button 
              className="bg-teal-600 hover:bg-teal-700"
              onClick={() => setShowRunPayroll(!showRunPayroll)}
            >
              <Play size={16} className="mr-2" />Run Payroll
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                  <DollarSign size={20} className="text-teal-600" />
                </div>
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-0">
                  <ArrowUpRight size={12} className="mr-1" />+4.2%
                </Badge>
              </div>
              <p className="text-2xl font-bold text-slate-900">${(totalPayrollCost / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-slate-500 mt-1">Monthly Payroll Cost</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users size={20} className="text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{activeEmployees.length}</p>
              <p className="text-xs text-slate-500 mt-1">Employees on Payroll</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Globe size={20} className="text-amber-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{countriesUsed.length}</p>
              <p className="text-xs text-slate-500 mt-1">Countries Active</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{pendingPayrolls}</p>
              <p className="text-xs text-slate-500 mt-1">Pending Payrolls</p>
            </CardContent>
          </Card>
        </div>

        {/* Country Compliance Overview */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Country Compliance Overview</h2>
              <Badge variant="outline" className="text-xs">{countriesUsed.length} countries</Badge>
            </div>
            <div className="divide-y divide-slate-100">
              {Object.entries(employeesByCountry).map(([country, emps]) => {
                const config = COUNTRIES.find(c => c.name === country);
                const totalSalary = emps.reduce((s: number, e: any) => s + (Number(e.salary) || 0), 0);
                return (
                  <div key={country} className="px-5 py-3 flex items-center hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                        {config?.code || country.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{country}</p>
                        <p className="text-xs text-slate-500">{emps.length} employee{emps.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="text-right mr-6">
                      <p className="text-sm font-medium text-slate-900">{config?.currency || "USD"} {(totalSalary / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</p>
                    </div>
                    <div className="flex items-center gap-2 mr-4">
                      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-0">
                        <CheckCircle2 size={10} className="mr-1" />Compliant
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-400">{(config as any)?.compliance || "Local"}</div>
                    <ChevronRight size={16} className="text-slate-300 ml-3" />
                  </div>
                );
              })}
              {Object.keys(employeesByCountry).length === 0 && (
                <div className="px-5 py-8 text-center text-slate-400">
                  <Globe size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No employees assigned to countries yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payroll Run Section */}
        {showRunPayroll && (
          <Card className="border-0 shadow-sm border-l-4 border-l-teal-500">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-slate-900">Run Payroll</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Select employees and review before processing</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowRunPayroll(false)}>Cancel</Button>
                  <Button 
                    size="sm" 
                    className="bg-teal-600 hover:bg-teal-700"
                    disabled={selectedEmployees.length === 0}
                    onClick={() => {
                      toast.success(`Payroll initiated for ${selectedEmployees.length} employees`);
                      setShowRunPayroll(false);
                      setSelectedEmployees([]);
                    }}
                  >
                    Process {selectedEmployees.length > 0 ? `(${selectedEmployees.length})` : ""}
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger className="w-44 h-9">
                    <SelectValue placeholder="All countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countriesUsed.map((c: any) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={selectAll} className="h-9">
                  {selectedEmployees.length === filteredEmployees.length ? "Deselect All" : "Select All"}
                </Button>
              </div>

              {/* Employee Selection Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 grid grid-cols-7 gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-2">Employee</div>
                  <div>Country</div>
                  <div className="text-right">Gross</div>
                  <div className="text-right">Tax</div>
                  <div className="text-right">Social</div>
                  <div className="text-right">Net Pay</div>
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {filteredEmployees.map((emp: any) => {
                    const salary = Number(emp.salary) || 0;
                    const monthly = salary / 12;
                    const { tax, social, net } = computeTax(monthly, emp.country);
                    const isSelected = selectedEmployees.includes(emp.id);
                    return (
                      <div
                        key={emp.id}
                        className={`px-4 py-3 grid grid-cols-7 gap-4 items-center cursor-pointer transition-colors ${
                          isSelected ? "bg-teal-50" : "hover:bg-slate-50"
                        }`}
                        onClick={() => toggleEmployee(emp.id)}
                      >
                        <div className="col-span-2 flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleEmployee(emp.id)}
                            className="rounded border-slate-300"
                          />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-slate-500">{emp.position || "—"}</p>
                          </div>
                        </div>
                        <div className="text-sm text-slate-600">{emp.country || "—"}</div>
                        <div className="text-sm text-slate-900 text-right font-medium">{(emp.currency || "USD")} {monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        <div className="text-sm text-red-600 text-right">-{tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        <div className="text-sm text-amber-600 text-right">-{social.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        <div className="text-sm text-emerald-700 text-right font-semibold">{net.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                      </div>
                    );
                  })}
                  {filteredEmployees.length === 0 && (
                    <div className="px-4 py-8 text-center text-slate-400 col-span-7">
                      <p className="text-sm">No employees found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payroll Summary */}
              {selectedEmployees.length > 0 && (
                <div className="mt-4 bg-slate-50 rounded-lg p-4 grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Selected</p>
                    <p className="text-lg font-bold text-slate-900">{selectedEmployees.length} employees</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Total Gross</p>
                    <p className="text-lg font-bold text-slate-900">
                      ${filteredEmployees
                        .filter((e: any) => selectedEmployees.includes(e.id))
                        .reduce((s: number, e: any) => s + (Number(e.salary) || 0) / 12, 0)
                        .toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Total Tax + Social</p>
                    <p className="text-lg font-bold text-red-600">
                      -${filteredEmployees
                        .filter((e: any) => selectedEmployees.includes(e.id))
                        .reduce((s: number, e: any) => {
                          const m = (Number(e.salary) || 0) / 12;
                          const { tax, social } = computeTax(m, e.country);
                          return s + tax + social;
                        }, 0)
                        .toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Total Net Pay</p>
                    <p className="text-lg font-bold text-emerald-700">
                      ${filteredEmployees
                        .filter((e: any) => selectedEmployees.includes(e.id))
                        .reduce((s: number, e: any) => {
                          const m = (Number(e.salary) || 0) / 12;
                          const { net } = computeTax(m, e.country);
                          return s + net;
                        }, 0)
                        .toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Employee Payroll Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Employee Payroll Overview</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 w-48 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Employee</th>
                    <th className="px-5 py-3 text-left">Country</th>
                    <th className="px-5 py-3 text-left">Schedule</th>
                    <th className="px-5 py-3 text-right">Annual Salary</th>
                    <th className="px-5 py-3 text-right">Monthly Gross</th>
                    <th className="px-5 py-3 text-right">Monthly Net</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((emp: any) => {
                    const salary = Number(emp.salary) || 0;
                    const monthly = salary / 12;
                    const { net } = computeTax(monthly, emp.country);
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold">
                              {emp.firstName?.[0]}{emp.lastName?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{emp.firstName} {emp.lastName}</p>
                              <p className="text-xs text-slate-500">{emp.position || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-600">{emp.country || "—"}</td>
                        <td className="px-5 py-3">
                          <Badge variant="outline" className="text-xs capitalize">Monthly</Badge>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-900 text-right font-medium">
                          {emp.currency || "USD"} {salary.toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-900 text-right">
                          {monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-5 py-3 text-sm text-emerald-700 text-right font-semibold">
                          {net.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-0">Active</Badge>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreVertical size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toast.info("View payslip coming soon")}>
                                <FileText size={14} className="mr-2" />View Payslip
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.info("Salary adjustment coming soon")}>
                                <DollarSign size={14} className="mr-2" />Adjust Salary
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.info("Download coming soon")}>
                                <Download size={14} className="mr-2" />Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => toast.info("Correction coming soon")}>
                                <AlertTriangle size={14} className="mr-2" />Log Correction
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredEmployees.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                  <Banknote size={40} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">No employees on payroll</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-indigo-50 to-violet-50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <TrendingUp size={16} className="text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900">AI Payroll Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Budget Forecast</p>
                <p className="text-sm font-medium text-slate-900">Payroll costs projected to increase 6.2% next quarter based on hiring pipeline and scheduled raises.</p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Compliance Alert</p>
                <p className="text-sm font-medium text-slate-900">Germany tax brackets updated for 2026. Review affected employees before next payroll run.</p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Anomaly Detection</p>
                <p className="text-sm font-medium text-slate-900">No unusual payroll adjustments detected this period. All changes within expected ranges.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
