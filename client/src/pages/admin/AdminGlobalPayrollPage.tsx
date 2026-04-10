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
  Globe, DollarSign, Users, AlertTriangle, CheckCircle2,
  Search, MoreVertical, Play, FileText, Download,
  TrendingUp, ArrowUpRight, ArrowDownRight, Banknote,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { getSchengenCountries } from "@shared/countries";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell,
} from "recharts";

/* ── Country payroll configs ── */
const SCHENGEN_PAYROLL_CONFIG = getSchengenCountries().map((country: any) => ({
  code: country.code,
  name: country.name,
  currency: country.currency || "EUR",
  taxRate: (country.taxRate || 0) / 100,
  flag: country.flag,
  isSchengen: true,
}));

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

const PAYROLL_COLORS = ["#0D9488", "#F59E0B", "#6366F1", "#EC4899", "#10B981", "#8B5CF6", "#F97316", "#14B8A6"];

export default function AdminGlobalPayrollPage() {
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const { data: cycles = [] } = trpc.payrollCycle.list.useQuery();

  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [showRunPayroll, setShowRunPayroll] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

  const totalPayrollCost = useMemo(() => {
    return employees.reduce((sum: number, e: any) => sum + (Number(e.salary) || 0), 0);
  }, [employees]);

  const activeEmployees = employees.filter((e: any) => e.status === "active");
  const countriesUsed = useMemo(() => {
    const set = new Set(employees.map((e: any) => e.country).filter(Boolean));
    return Array.from(set);
  }, [employees]);

  const pendingPayrolls = cycles.filter((c: any) => c.status === "draft" || c.status === "approved").length;

  const filteredEmployees = useMemo(() => {
    return activeEmployees.filter((e: any) => {
      const matchSearch = !searchQuery ||
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCountry = countryFilter === "all" || e.country === countryFilter;
      return matchSearch && matchCountry;
    });
  }, [activeEmployees, searchQuery, countryFilter]);

  const employeesByCountry = useMemo(() => {
    const groups: Record<string, any[]> = {};
    activeEmployees.forEach((e: any) => {
      const country = e.country || "Unassigned";
      if (!groups[country]) groups[country] = [];
      groups[country].push(e);
    });
    return groups;
  }, [activeEmployees]);

  /* Chart data: payroll cost by country */
  const countryChartData = useMemo(() => {
    return Object.entries(employeesByCountry)
      .map(([country, emps]) => ({
        country: country.length > 12 ? country.slice(0, 10) + "…" : country,
        fullName: country,
        cost: Math.round(emps.reduce((s: number, e: any) => s + (Number(e.salary) || 0), 0) / 12),
        employees: emps.length,
      }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 8);
  }, [employeesByCountry]);

  /* Donut data: currency distribution */
  const currencyDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    activeEmployees.forEach((e: any) => {
      const curr = e.currency || "USD";
      map[curr] = (map[curr] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [activeEmployees]);

  const computeTax = (salary: number, country: string) => {
    const config = COUNTRIES.find(c => c.name === country);
    if (!config) return { tax: salary * 0.2, social: salary * 0.1, net: salary * 0.7 };
    const tax = salary * config.taxRate;
    const social = salary * ((config as any).socialSecurity || 0.1);
    const net = salary - tax - social;
    return { tax, social, net };
  };

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Global Payroll</h1>
            <p className="text-sm text-slate-500 mt-1">Multi-country payroll management with local compliance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-200" onClick={() => toast.info("Export coming soon")}>
              <Download size={16} className="mr-2" />Export
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={() => setShowRunPayroll(!showRunPayroll)}
            >
              <Play size={16} className="mr-2" />Run Payroll
            </Button>
          </div>
        </div>

        {/* KPI Stat Cards — matching dashboard design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                  <DollarSign size={16} className="text-teal-600" />
                </div>
                <span className="ml-auto text-xs font-medium flex items-center gap-0.5 text-emerald-600">
                  <ArrowUpRight size={12} />+4.2%
                </span>
              </div>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">
                ${(totalPayrollCost / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-slate-400 mt-1">Monthly Payroll Cost</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Users size={16} className="text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{activeEmployees.length}</p>
              <p className="text-xs text-slate-400 mt-1">Employees on Payroll</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Globe size={16} className="text-amber-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{countriesUsed.length}</p>
              <p className="text-xs text-slate-400 mt-1">Countries Active</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertTriangle size={16} className="text-red-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{pendingPayrolls}</p>
              <p className="text-xs text-slate-400 mt-1">Pending Payrolls</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row — matching dashboard layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payroll Cost by Country Bar Chart */}
          <Card className="lg:col-span-2 border border-slate-100 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-slate-900">Monthly Payroll Cost by Country</h2>
                <Badge variant="outline" className="text-xs text-slate-500">{countriesUsed.length} countries</Badge>
              </div>
              {countryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={countryChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="country" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Monthly Cost"]}
                      labelFormatter={(label) => {
                        const item = countryChartData.find(d => d.country === label);
                        return item?.fullName || label;
                      }}
                    />
                    <Bar dataKey="cost" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {countryChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PAYROLL_COLORS[index % PAYROLL_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-slate-400 text-sm">
                  <Globe size={24} className="mr-2 text-slate-300" />No payroll data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Currency Distribution Donut */}
          <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-2">Currency Distribution</h2>
              {currencyDistribution.length > 0 ? (
                <>
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={currencyDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {currencyDistribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PAYROLL_COLORS[index % PAYROLL_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          formatter={(value: number, name: string) => [`${value} employees`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Total:</p>
                        <p className="text-xl font-bold text-slate-900">{activeEmployees.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                    {currencyDistribution.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PAYROLL_COLORS[i % PAYROLL_COLORS.length] }} />
                        <span className="text-slate-500">{item.name}</span>
                        <span className="ml-auto font-medium text-slate-700">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No data</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Country Compliance Overview */}
        <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Country Compliance Overview</h2>
              <Badge variant="outline" className="text-xs text-slate-500">{countriesUsed.length} countries</Badge>
            </div>
            <div className="divide-y divide-slate-50">
              {Object.entries(employeesByCountry).map(([country, emps]) => {
                const config = COUNTRIES.find(c => c.name === country);
                const totalSalary = emps.reduce((s: number, e: any) => s + (Number(e.salary) || 0), 0);
                return (
                  <div key={country} className="px-5 py-3.5 flex items-center hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-xl">{config?.flag || "🌍"}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{country}</p>
                        <p className="text-xs text-slate-400">{emps.length} employee{emps.length !== 1 ? "s" : ""} · Tax: {((config?.taxRate || 0) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="text-right mr-6">
                      <p className="text-sm font-semibold text-slate-900">{config?.currency || "USD"} {(totalSalary / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</p>
                    </div>
                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-0 mr-3">
                      <CheckCircle2 size={10} className="mr-1" />Compliant
                    </Badge>
                    <ChevronRight size={16} className="text-slate-300" />
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

        {/* Run Payroll Section */}
        {showRunPayroll && (
          <Card className="border border-teal-200 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Run Payroll</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Select employees and review before processing</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowRunPayroll(false)}>Cancel</Button>
                  <Button
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700 text-white"
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

              <div className="flex gap-3 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input placeholder="Search employees..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9" />
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

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 grid grid-cols-7 gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-2">Employee</div>
                  <div>Country</div>
                  <div className="text-right">Gross</div>
                  <div className="text-right">Tax</div>
                  <div className="text-right">Social</div>
                  <div className="text-right">Net Pay</div>
                </div>
                <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                  {filteredEmployees.map((emp: any) => {
                    const salary = Number(emp.salary) || 0;
                    const monthly = salary / 12;
                    const { tax, social, net } = computeTax(monthly, emp.country);
                    const isSelected = selectedEmployees.includes(emp.id);
                    return (
                      <div
                        key={emp.id}
                        className={`px-4 py-3 grid grid-cols-7 gap-4 items-center cursor-pointer transition-colors ${isSelected ? "bg-teal-50" : "hover:bg-slate-50"}`}
                        onClick={() => toggleEmployee(emp.id)}
                      >
                        <div className="col-span-2 flex items-center gap-3">
                          <input type="checkbox" checked={isSelected} onChange={() => toggleEmployee(emp.id)} className="rounded border-slate-300 text-teal-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-slate-400">{emp.position || "—"}</p>
                          </div>
                        </div>
                        <div className="text-sm text-slate-600">{emp.country || "—"}</div>
                        <div className="text-sm text-slate-900 text-right font-medium">{monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        <div className="text-sm text-red-500 text-right">-{tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        <div className="text-sm text-amber-600 text-right">-{social.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        <div className="text-sm text-emerald-700 text-right font-semibold">{net.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                      </div>
                    );
                  })}
                  {filteredEmployees.length === 0 && (
                    <div className="px-4 py-8 text-center text-slate-400"><p className="text-sm">No employees found</p></div>
                  )}
                </div>
              </div>

              {selectedEmployees.length > 0 && (
                <div className="mt-4 bg-slate-50 rounded-xl p-4 grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Selected</p>
                    <p className="text-lg font-bold text-slate-900">{selectedEmployees.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Total Gross</p>
                    <p className="text-lg font-bold text-slate-900">
                      ${filteredEmployees.filter((e: any) => selectedEmployees.includes(e.id)).reduce((s: number, e: any) => s + (Number(e.salary) || 0) / 12, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Total Deductions</p>
                    <p className="text-lg font-bold text-red-500">
                      -${filteredEmployees.filter((e: any) => selectedEmployees.includes(e.id)).reduce((s: number, e: any) => {
                        const m = (Number(e.salary) || 0) / 12;
                        const { tax, social } = computeTax(m, e.country);
                        return s + tax + social;
                      }, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Total Net Pay</p>
                    <p className="text-lg font-bold text-emerald-700">
                      ${filteredEmployees.filter((e: any) => selectedEmployees.includes(e.id)).reduce((s: number, e: any) => {
                        const m = (Number(e.salary) || 0) / 12;
                        const { net } = computeTax(m, e.country);
                        return s + net;
                      }, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Employee Payroll Table */}
        <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Employee Payroll Overview</h2>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 w-48 text-sm" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
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
                <tbody className="divide-y divide-slate-50">
                  {filteredEmployees.map((emp: any) => {
                    const salary = Number(emp.salary) || 0;
                    const monthly = salary / 12;
                    const { net } = computeTax(monthly, emp.country);
                    const config = COUNTRIES.find(c => c.name === emp.country);
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 text-xs font-bold">
                              {emp.firstName?.[0]}{emp.lastName?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{emp.firstName} {emp.lastName}</p>
                              <p className="text-xs text-slate-400">{emp.position || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm text-slate-600">{config?.flag || ""} {emp.country || "—"}</span>
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant="outline" className="text-xs capitalize bg-slate-50 border-slate-200">Monthly</Badge>
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
        <Card className="border border-slate-100 shadow-sm bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                <TrendingUp size={16} className="text-teal-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">AI Payroll Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/80 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1">Budget Forecast</p>
                <p className="text-sm text-slate-700">Payroll costs projected to increase 6.2% next quarter based on hiring pipeline and scheduled raises.</p>
              </div>
              <div className="bg-white/80 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1">Compliance Alert</p>
                <p className="text-sm text-slate-700">Germany tax brackets updated for 2026. Review affected employees before next payroll run.</p>
              </div>
              <div className="bg-white/80 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-1">Anomaly Detection</p>
                <p className="text-sm text-slate-700">No unusual payroll adjustments detected this period. All changes within expected ranges.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
