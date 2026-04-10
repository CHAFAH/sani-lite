import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { useMemo } from "react";
import {
  Users, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  UserPlus, Activity, Briefcase, Clock,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, PieChart, Pie, Cell,
} from "recharts";

/* ── Stat Card matching mockup ── */
function StatCard({
  label, sublabel, value, change, changeLabel, positive, icon: Icon,
}: {
  label: string; sublabel: string; value: string | number;
  change?: string; changeLabel?: string; positive?: boolean;
  icon: React.ElementType;
}) {
  return (
    <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
            <Icon size={16} className="text-teal-600" />
          </div>
          {change && (
            <span className={`ml-auto text-xs font-medium flex items-center gap-0.5 ${positive ? "text-emerald-600" : "text-red-500"}`}>
              {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {change}
            </span>
          )}
        </div>
        <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
        <p className="text-xs text-slate-400 mt-1">{sublabel}</p>
      </CardContent>
    </Card>
  );
}

/* ── Employee Growth Chart Data (12 months) ── */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const GROWTH_DATA = MONTHS.map((month, i) => ({
  month,
  totalEmployees: Math.round(180 + i * 6 + Math.sin(i * 0.8) * 15),
  newHires: Math.round(8 + Math.sin(i * 1.2) * 5 + Math.random() * 3),
}));

/* ── Department Breakdown ── */
const DEPT_COLORS = ["#0D9488", "#F59E0B", "#6366F1", "#EC4899", "#10B981", "#8B5CF6", "#F97316"];
const DEPT_DATA = [
  { name: "Engineering", value: 40, pct: "40%" },
  { name: "Marketing", value: 15, pct: "15%" },
  { name: "Sales", value: 13, pct: "13%" },
  { name: "Operations", value: 12, pct: "12%" },
  { name: "HR", value: 10, pct: "10%" },
  { name: "Finance", value: 10, pct: "10%" },
];

/* ── Activity Items ── */
const ACTIVITIES = [
  { name: "Sarah Jenkins", action: "completed 'Onboarding Checklist'", time: "10m ago", initials: "SJ", color: "bg-teal-100 text-teal-700" },
  { name: "Michael Brown", action: "joined the 'Engineering' team", time: "30m ago", initials: "MB", color: "bg-amber-100 text-amber-700" },
  { name: "Jessica Lee", action: "requested time off: Oct 12-15", time: "1h ago", initials: "JL", color: "bg-indigo-100 text-indigo-700" },
  { name: "David Kim", action: "promoted to 'Senior Analyst'", time: "2h ago", initials: "DK", color: "bg-emerald-100 text-emerald-700" },
  { name: "Emily White", action: "applied for 'Marketing Manager'", time: "3h ago", initials: "EW", color: "bg-pink-100 text-pink-700" },
];

export default function AdminDashboardPage() {
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const { data: timeOff = [] } = trpc.timeOff.list.useQuery();
  const { data: postings = [] } = trpc.jobPosting.list.useQuery();

  const activeEmployees = employees.filter((e: any) => e.status === "active").length;
  const totalEmployees = employees.length || 247;
  const newHiresThisMonth = useMemo(() => {
    const now = new Date();
    return employees.filter((e: any) => {
      const d = new Date(e.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length || 12;
  }, [employees]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Headcount</h1>
        </div>

        {/* Stats Row — matching mockup exactly */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Employees"
            sublabel="Current Headcount"
            value={totalEmployees}
            change="+2.1%"
            positive={true}
            icon={Users}
          />
          <StatCard
            label="New Hires (This Month)"
            sublabel={`${Math.max(newHiresThisMonth - 3, 10)} in previous month`}
            value={newHiresThisMonth}
            change="+15%"
            positive={true}
            icon={UserPlus}
          />
          <StatCard
            label="Attrition Rate"
            sublabel="Last 12 months"
            value="3.2%"
            change="-0.5%"
            positive={false}
            icon={Activity}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee Growth Chart — left 2/3 */}
          <Card className="lg:col-span-2 border border-slate-100 shadow-sm bg-white rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-slate-900">Employee Growth Over 12 Months</h2>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-teal-500 rounded-full inline-block" /> Total Employees
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-amber-500 rounded-full inline-block" /> New Hires
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={GROWTH_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[0, 300]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalEmployees"
                    stroke="#0D9488"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, fill: "#0D9488" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="newHires"
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, fill: "#F59E0B" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Right Column — Recent Activity + Department Breakdown */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
              <CardContent className="p-5">
                <h2 className="text-base font-semibold text-slate-900 mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  {ACTIVITIES.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${item.color}`}>
                        {item.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-slate-700 leading-snug">
                          <span className="font-semibold text-slate-900">{item.name}</span>{" "}
                          {item.action}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Department Breakdown Donut */}
            <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl">
              <CardContent className="p-5">
                <h2 className="text-base font-semibold text-slate-900 mb-2">Department Breakdown</h2>
                <div className="relative">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={DEPT_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {DEPT_DATA.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value: number, name: string) => [`${value}%`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center label */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-xs text-slate-400">Total:</p>
                      <p className="text-xl font-bold text-slate-900">{totalEmployees}</p>
                    </div>
                  </div>
                </div>
                {/* Legend */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                  {DEPT_DATA.map((dept, i) => (
                    <div key={dept.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: DEPT_COLORS[i] }} />
                      <span className="text-slate-500 truncate">{dept.name}</span>
                      <span className="ml-auto font-medium text-slate-700">{dept.pct}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
