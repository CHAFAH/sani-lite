/*
 * Payroll — Global payroll management page
 * Design: Warm Machine / Organic Modernism
 */

import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import { Globe, DollarSign, Clock, AlertTriangle } from "lucide-react";
import { payrollRecords, payrollByCountry } from "@/lib/mockData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const statusColors: Record<string, string> = {
  Processed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Failed: "bg-red-50 text-red-700 border-red-200",
};

const payrollStats = [
  { label: "Total Payroll", value: "$3.63M", icon: DollarSign, color: "bg-teal-50 text-teal-600" },
  { label: "Countries", value: "6", icon: Globe, color: "bg-amber-50 text-amber-600" },
  { label: "Next Run", value: "Mar 31", icon: Clock, color: "bg-purple-50 text-purple-600" },
  { label: "Pending", value: "2", icon: AlertTriangle, color: "bg-rose-50 text-rose-600" },
];

export default function AppPayroll() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <h1 className="text-3xl font-normal tracking-tight font-serif">Payroll</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage global payroll across all your entities</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {payrollStats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm"
            >
              <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon size={18} />
              </div>
              <p className="text-2xl font-semibold font-sans">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Chart + Country breakdown */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm"
          >
            <h3 className="text-lg font-semibold font-sans mb-1">Payroll by Country</h3>
            <p className="text-sm text-muted-foreground mb-4">Monthly payroll distribution</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={payrollByCountry} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="country" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={110} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e5e2dc", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", fontSize: 13 }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Total Payroll"]}
                />
                <Bar dataKey="totalPayroll" fill="#0D9488" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm"
          >
            <h3 className="text-lg font-semibold font-sans mb-1">Country Breakdown</h3>
            <p className="text-sm text-muted-foreground mb-4">Employees and payroll by entity</p>
            <div className="space-y-3">
              {payrollByCountry.map((country) => (
                <div key={country.country} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{country.country}</p>
                    <p className="text-xs text-muted-foreground">{country.employees} employees</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${(country.totalPayroll / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-muted-foreground">{country.currency}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Payroll records table */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-semibold font-sans">Recent Payroll Runs</h3>
            <p className="text-sm text-muted-foreground">March 2026 payroll cycle</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-cream-dark/50">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Employee</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Department</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Base</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Bonus</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Deductions</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Net Pay</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payrollRecords.map((record, i) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/30 hover:bg-cream-dark/30 transition-colors"
                  >
                    <td className="px-6 py-3.5 text-sm font-medium">{record.employee}</td>
                    <td className="px-6 py-3.5 text-sm text-muted-foreground">{record.department}</td>
                    <td className="px-6 py-3.5 text-sm text-right">{record.currency} {record.baseSalary.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-sm text-right text-emerald-600">+{record.bonus.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-sm text-right text-red-500">-{record.deductions.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-sm text-right font-semibold">{record.currency} {record.netPay.toLocaleString()}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[record.status]}`}>
                        {record.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
