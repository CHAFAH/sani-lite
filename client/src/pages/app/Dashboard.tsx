/*
 * Dashboard — Main app dashboard page
 * Design: Warm Machine / Organic Modernism
 * Shows headcount stats, attrition chart, department breakdown, recent activity
 */

import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  TrendingDown,
  Briefcase,
  Clock,
  Heart,
} from "lucide-react";
import {
  dashboardStats,
  headcountByMonth,
  departmentBreakdown,
  attritionData,
  recentActivity,
} from "@/lib/mockData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stats = [
  { label: "Total Employees", value: dashboardStats.totalEmployees, icon: Users, change: "+2.1%", positive: true, color: "bg-teal-50 text-teal-600" },
  { label: "New Hires (Mar)", value: dashboardStats.newHires, icon: UserPlus, change: "+15%", positive: true, color: "bg-amber-50 text-amber-600" },
  { label: "Attrition Rate", value: `${dashboardStats.attritionRate}%`, icon: TrendingDown, change: "-0.5%", positive: true, color: "bg-emerald-50 text-emerald-600" },
  { label: "Open Positions", value: dashboardStats.openPositions, icon: Briefcase, change: "+3", positive: false, color: "bg-purple-50 text-purple-600" },
  { label: "Avg. Tenure", value: `${dashboardStats.avgTenure}y`, icon: Clock, change: "+0.2y", positive: true, color: "bg-cyan-50 text-cyan-600" },
  { label: "Engagement", value: `${dashboardStats.engagementScore}%`, icon: Heart, change: "+3%", positive: true, color: "bg-rose-50 text-rose-600" },
];

export default function AppDashboard() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <h1 className="text-3xl font-normal tracking-tight font-serif">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back, Alex. Here's what's happening today.</p>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon size={18} />
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  stat.positive ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-semibold font-sans">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Headcount chart */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="lg:col-span-2 bg-white rounded-2xl p-6 border border-border/50 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold font-sans">Employee Growth</h3>
                <p className="text-sm text-muted-foreground">Last 12 months headcount trend</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  Total
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  New Hires
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={headcountByMonth}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e5e2dc",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    fontSize: 13,
                  }}
                />
                <Area type="monotone" dataKey="total" stroke="#0D9488" strokeWidth={2} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="newHires" stroke="#F59E0B" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Department breakdown */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm"
          >
            <h3 className="text-lg font-semibold font-sans mb-1">Departments</h3>
            <p className="text-sm text-muted-foreground mb-4">Headcount by team</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={departmentBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {departmentBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e5e2dc",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    fontSize: 13,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {departmentBreakdown.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-muted-foreground truncate">{d.name}</span>
                  <span className="text-xs font-medium ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Attrition chart */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm"
          >
            <h3 className="text-lg font-semibold font-sans mb-1">Attrition Rate</h3>
            <p className="text-sm text-muted-foreground mb-4">Monthly voluntary turnover</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={attritionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[0, 5]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e5e2dc",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    fontSize: 13,
                  }}
                />
                <Line type="monotone" dataKey="rate" stroke="#EC4899" strokeWidth={2} dot={{ fill: "#EC4899", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent activity */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm"
          >
            <h3 className="text-lg font-semibold font-sans mb-1">Recent Activity</h3>
            <p className="text-sm text-muted-foreground mb-4">Latest updates across your organization</p>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <img
                    src={activity.avatar}
                    alt={activity.user}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{" "}
                      <span className="text-muted-foreground">{activity.action}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
