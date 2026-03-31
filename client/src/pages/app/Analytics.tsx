/*
 * Analytics — Workforce analytics and insights
 * Design: Warm Machine / Organic Modernism
 */

import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import { TrendingUp, Users, Heart, Target, Sparkles } from "lucide-react";
import {
  headcountByMonth,
  attritionData,
  engagementScores,
  departmentBreakdown,
} from "@/lib/mockData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e5e2dc",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  fontSize: 13,
};

const radarData = [
  { subject: "Engagement", A: 85, fullMark: 100 },
  { subject: "Retention", A: 92, fullMark: 100 },
  { subject: "Performance", A: 78, fullMark: 100 },
  { subject: "Growth", A: 70, fullMark: 100 },
  { subject: "Satisfaction", A: 88, fullMark: 100 },
  { subject: "Diversity", A: 75, fullMark: 100 },
];

const analyticsStats = [
  { label: "Engagement Score", value: "85%", change: "+3%", icon: Heart, color: "bg-rose-50 text-rose-600" },
  { label: "Retention Rate", value: "96.8%", change: "+0.5%", icon: Users, color: "bg-teal-50 text-teal-600" },
  { label: "Avg. Performance", value: "4.4/5", change: "+0.2", icon: Target, color: "bg-amber-50 text-amber-600" },
  { label: "AI Predictions", value: "3 alerts", change: "New", icon: Sparkles, color: "bg-purple-50 text-purple-600" },
];

export default function AppAnalytics() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <h1 className="text-3xl font-normal tracking-tight font-serif">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Workforce insights and predictive analytics</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {analyticsStats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon size={18} />
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-semibold font-sans">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Engagement trend */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm"
          >
            <h3 className="text-lg font-semibold font-sans mb-1">Engagement Trend</h3>
            <p className="text-sm text-muted-foreground mb-4">Employee engagement score over time</p>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={engagementScores}>
                <defs>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC4899" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[60, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="score" stroke="#EC4899" strokeWidth={2} fill="url(#colorEngagement)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Workforce health radar */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm"
          >
            <h3 className="text-lg font-semibold font-sans mb-1">Workforce Health</h3>
            <p className="text-sm text-muted-foreground mb-4">Overall organizational health metrics</p>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e2dc" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <PolarRadiusAxis tick={{ fontSize: 10, fill: "#9ca3af" }} domain={[0, 100]} />
                <Radar name="Score" dataKey="A" stroke="#0D9488" fill="#0D9488" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Charts row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Headcount growth */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm"
          >
            <h3 className="text-lg font-semibold font-sans mb-1">Headcount Growth</h3>
            <p className="text-sm text-muted-foreground mb-4">New hires per month</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={headcountByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="newHires" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Attrition trend */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm"
          >
            <h3 className="text-lg font-semibold font-sans mb-1">Attrition Trend</h3>
            <p className="text-sm text-muted-foreground mb-4">Monthly voluntary turnover rate</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={attritionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[0, 5]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="rate" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: "#8B5CF6", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* AI Insights */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
              <Sparkles size={16} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold font-sans">AI Insights</h3>
              <p className="text-sm text-muted-foreground">Predictive alerts and recommendations</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                title: "Attrition Risk",
                description: "3 employees in Engineering show elevated flight risk based on engagement patterns and tenure analysis.",
                severity: "High",
                severityColor: "bg-red-50 text-red-700 border-red-200",
              },
              {
                title: "Promotion Ready",
                description: "5 team members have exceeded performance goals for 2 consecutive quarters and may be ready for advancement.",
                severity: "Medium",
                severityColor: "bg-amber-50 text-amber-700 border-amber-200",
              },
              {
                title: "Engagement Dip",
                description: "Marketing department engagement dropped 4% this month. Consider scheduling a team pulse check.",
                severity: "Medium",
                severityColor: "bg-amber-50 text-amber-700 border-amber-200",
              },
            ].map((insight) => (
              <div key={insight.title} className="p-4 rounded-xl border border-border/50 bg-[#FEFCF8]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">{insight.title}</h4>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${insight.severityColor}`}>
                    {insight.severity}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
