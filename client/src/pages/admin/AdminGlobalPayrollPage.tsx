/*
 * AdminGlobalPayrollPage — Flagship Global Payroll module
 * 5 Tabs: Runs | History | Forecasting | Compliance Center | Payments
 * Color: Deep Navy (#0A2540) + Vibrant Teal (#00D4C8)
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "@/components/AdminLayout";
import {
  Globe, Play, Clock, TrendingUp, Shield, CreditCard,
  ChevronRight, Search, Filter, Download, RefreshCw,
  CheckCircle2, XCircle, AlertTriangle, ArrowUpRight,
  ArrowDownRight, Zap, Calendar, DollarSign, Users,
  MapPin, FileText, BarChart3, Eye, RotateCcw, Send,
  Sparkles, ChevronDown, Info, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const TEAL = "#00D4C8";
const NAVY = "#0A2540";

/* ── Sample Data ── */
const COUNTRIES_DATA = [
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD", employees: 87, totalGross: 892400, status: "ready", taxRate: 37 },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", employees: 34, totalGross: 312800, status: "ready", taxRate: 45 },
  { code: "DE", name: "Germany", flag: "🇩🇪", currency: "EUR", employees: 28, totalGross: 267500, status: "pending", taxRate: 45 },
  { code: "IN", name: "India", flag: "🇮🇳", currency: "INR", employees: 52, totalGross: 185600, status: "ready", taxRate: 30 },
  { code: "BR", name: "Brazil", flag: "🇧🇷", currency: "BRL", employees: 19, totalGross: 142300, status: "ready", taxRate: 27.5 },
  { code: "SG", name: "Singapore", flag: "🇸🇬", currency: "SGD", employees: 15, totalGross: 198700, status: "completed", taxRate: 22 },
  { code: "CA", name: "Canada", flag: "🇨🇦", currency: "CAD", employees: 22, totalGross: 245100, status: "ready", taxRate: 33 },
  { code: "AU", name: "Australia", flag: "🇦🇺", currency: "AUD", employees: 18, totalGross: 213400, status: "ready", taxRate: 45 },
];

const PAST_RUNS = [
  { id: "PR-2026-02", period: "February 2026", countries: 8, employees: 275, totalNet: 1847200, status: "completed", date: "2026-02-28" },
  { id: "PR-2026-01", period: "January 2026", countries: 8, employees: 271, totalNet: 1823400, status: "completed", date: "2026-01-31" },
  { id: "PR-2025-12", period: "December 2025", countries: 8, employees: 268, totalNet: 1891600, status: "completed", date: "2025-12-31" },
  { id: "PR-2025-11", period: "November 2025", countries: 7, employees: 264, totalNet: 1756300, status: "partial", date: "2025-11-30" },
  { id: "PR-2025-10", period: "October 2025", countries: 8, employees: 260, totalNet: 1734800, status: "completed", date: "2025-10-31" },
  { id: "PR-2025-09", period: "September 2025", countries: 8, employees: 258, totalNet: 1721500, status: "failed", date: "2025-09-30" },
];

const FORECAST_MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
const FORECAST_VALUES = [2.1, 2.15, 2.18, 2.22, 2.25, 2.28, 2.32, 2.35, 2.38, 2.42, 2.45, 2.5];

const COMPLIANCE_DATA = [
  { country: "🇺🇸 United States", score: 94, status: "green", deadline: "Apr 15, 2026", rule: "Q1 Federal Tax Filing" },
  { country: "🇬🇧 United Kingdom", score: 88, status: "green", deadline: "Apr 19, 2026", rule: "PAYE RTI Submission" },
  { country: "🇩🇪 Germany", score: 72, status: "yellow", deadline: "Apr 10, 2026", rule: "Social Insurance Update" },
  { country: "🇮🇳 India", score: 91, status: "green", deadline: "Apr 30, 2026", rule: "TDS Quarterly Return" },
  { country: "🇧🇷 Brazil", score: 65, status: "yellow", deadline: "Apr 20, 2026", rule: "eSocial Monthly Filing" },
  { country: "🇸🇬 Singapore", score: 97, status: "green", deadline: "May 1, 2026", rule: "CPF Contribution Deadline" },
  { country: "🇨🇦 Canada", score: 45, status: "red", deadline: "Apr 30, 2026", rule: "T4 Slip Filing Deadline" },
  { country: "🇦🇺 Australia", score: 82, status: "green", deadline: "Apr 21, 2026", rule: "STP Phase 2 Reporting" },
];

const PAYMENT_DATA = [
  { country: "🇺🇸 United States", amount: "$578,200", method: "ACH Direct", status: "released", date: "Mar 28, 2026" },
  { country: "🇬🇧 United Kingdom", amount: "£198,400", method: "BACS", status: "released", date: "Mar 28, 2026" },
  { country: "🇩🇪 Germany", amount: "€172,300", method: "SEPA", status: "pending", date: "—" },
  { country: "🇮🇳 India", amount: "₹12,840,000", method: "NEFT", status: "released", date: "Mar 27, 2026" },
  { country: "🇧🇷 Brazil", amount: "R$482,100", method: "PIX", status: "pending", date: "—" },
  { country: "🇸🇬 Singapore", amount: "S$142,600", method: "GIRO", status: "released", date: "Mar 26, 2026" },
  { country: "🇨🇦 Canada", amount: "C$168,900", method: "EFT", status: "processing", date: "Mar 29, 2026" },
  { country: "🇦🇺 Australia", amount: "A$138,700", method: "BPAY", status: "released", date: "Mar 28, 2026" },
];

const tabs = [
  { id: "runs", label: "Runs", icon: Play },
  { id: "history", label: "History", icon: Clock },
  { id: "forecasting", label: "Forecasting", icon: TrendingUp },
  { id: "compliance", label: "Compliance Center", icon: Shield },
  { id: "payments", label: "Payments", icon: CreditCard },
] as const;

type TabId = (typeof tabs)[number]["id"];

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    completed: { bg: "rgba(16,185,129,0.1)", text: "#10B981", icon: CheckCircle2 },
    ready: { bg: "rgba(0,212,200,0.1)", text: TEAL, icon: CheckCircle2 },
    pending: { bg: "rgba(245,158,11,0.1)", text: "#F59E0B", icon: AlertTriangle },
    failed: { bg: "rgba(239,68,68,0.1)", text: "#EF4444", icon: XCircle },
    partial: { bg: "rgba(245,158,11,0.1)", text: "#F59E0B", icon: AlertTriangle },
    released: { bg: "rgba(16,185,129,0.1)", text: "#10B981", icon: CheckCircle2 },
    processing: { bg: "rgba(59,130,246,0.1)", text: "#3B82F6", icon: RefreshCw },
  };
  const c = config[status] || config.pending;
  const Icon = c.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: c.bg, color: c.text }}>
      <Icon size={12} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function KpiCard({ label, value, change, changeType, icon: Icon }: { label: string; value: string; change: string; changeType: "up" | "down"; icon: React.ElementType }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${TEAL}15` }}>
          <Icon size={20} style={{ color: TEAL }} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${changeType === "up" ? "text-emerald-600" : "text-red-500"}`}>
          {changeType === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ color: NAVY }}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

/* ── Runs Tab ── */
function RunsTab() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>(COUNTRIES_DATA.map(c => c.code));
  const [showWizard, setShowWizard] = useState(false);

  const toggleCountry = (code: string) => {
    setSelectedCountries(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  };

  const totalGross = COUNTRIES_DATA.filter(c => selectedCountries.includes(c.code)).reduce((s, c) => s + c.totalGross, 0);
  const totalEmployees = COUNTRIES_DATA.filter(c => selectedCountries.includes(c.code)).reduce((s, c) => s + c.employees, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Total Gross Payroll" value={`$${(totalGross / 1000).toFixed(0)}K`} change="4.2%" changeType="up" icon={DollarSign} />
        <KpiCard label="Employees in Scope" value={totalEmployees.toString()} change="3.1%" changeType="up" icon={Users} />
        <KpiCard label="Countries Active" value={selectedCountries.length.toString()} change="0%" changeType="up" icon={Globe} />
        <KpiCard label="Pending Approvals" value="3" change="2 new" changeType="down" icon={AlertTriangle} />
      </div>

      <div className="flex gap-6">
        {/* Left — Country Selector + Quick Actions */}
        <div className="w-[30%] space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-sm font-semibold mb-3" style={{ color: NAVY }}>Country Selector</h3>
            <div className="space-y-2">
              {COUNTRIES_DATA.map(c => (
                <label key={c.code} className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="checkbox" checked={selectedCountries.includes(c.code)} onChange={() => toggleCountry(c.code)} className="w-4 h-4 rounded" style={{ accentColor: TEAL }} />
                  <span className="text-lg">{c.flag}</span>
                  <span className="text-sm font-medium text-slate-700 flex-1">{c.name}</span>
                  <span className="text-xs text-slate-400">{c.employees}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-sm font-semibold mb-3" style={{ color: NAVY }}>Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={() => setShowWizard(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90" style={{ background: `linear-gradient(135deg, ${TEAL}, #00B8AE)` }}>
                <Play size={16} /> Run Global Payroll
              </button>
              <button onClick={() => toast("Simulation started")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <BarChart3 size={16} style={{ color: TEAL }} /> Simulate Run
              </button>
              <button onClick={() => toast("Downloading report...")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Download size={16} style={{ color: TEAL }} /> Export Summary
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-sm font-semibold mb-3" style={{ color: NAVY }}>Run Calendar</h3>
            <div className="space-y-2">
              {["Mar 31 — Monthly Close", "Apr 5 — Tax Remittance", "Apr 15 — Q1 Filing"].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50">
                  <Calendar size={14} style={{ color: TEAL }} />
                  <span className="text-xs text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Active Runs Table + AI Insights */}
        <div className="flex-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold" style={{ color: NAVY }}>Active Runs — March 2026</h3>
              <span className="text-xs text-slate-400 flex items-center gap-1"><RefreshCw size={12} /> Last synced 11s ago</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-50">
                  <th className="text-left px-5 py-3 font-medium">Country</th>
                  <th className="text-left px-3 py-3 font-medium">Employees</th>
                  <th className="text-left px-3 py-3 font-medium">Gross Total</th>
                  <th className="text-left px-3 py-3 font-medium">Currency</th>
                  <th className="text-left px-3 py-3 font-medium">Tax Rate</th>
                  <th className="text-left px-3 py-3 font-medium">Status</th>
                  <th className="text-right px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {COUNTRIES_DATA.filter(c => selectedCountries.includes(c.code)).map(c => (
                  <tr key={c.code} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3"><div className="flex items-center gap-2.5"><span className="text-lg">{c.flag}</span><span className="text-sm font-medium text-slate-800">{c.name}</span></div></td>
                    <td className="px-3 py-3 text-sm text-slate-600">{c.employees}</td>
                    <td className="px-3 py-3 text-sm font-semibold" style={{ color: NAVY }}>${(c.totalGross / 1000).toFixed(1)}K</td>
                    <td className="px-3 py-3 text-sm text-slate-500">{c.currency}</td>
                    <td className="px-3 py-3 text-sm text-slate-600">{c.taxRate}%</td>
                    <td className="px-3 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <button className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ color: TEAL }} onClick={() => toast(`Viewing ${c.name} details`)}>View <ChevronRight size={12} className="inline" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs text-slate-500">{selectedCountries.length} countries · {totalEmployees} employees</span>
              <span className="text-sm font-bold" style={{ color: NAVY }}>Total: ${(totalGross / 1000).toFixed(0)}K</span>
            </div>
          </div>

          <div className="rounded-2xl p-5 border" style={{ background: `linear-gradient(135deg, ${NAVY}08, ${TEAL}08)`, borderColor: `${TEAL}20` }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} style={{ color: TEAL }} />
              <span className="text-sm font-semibold" style={{ color: NAVY }}>AI Insights</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${TEAL}20`, color: TEAL }}>AI</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["Germany's social insurance contribution rates updated effective April 1. Review required before next run.", "Canada payroll shows 12% cost increase YoY — primarily driven by new hires in Ontario.", "Singapore CPF contribution ceiling increased to SGD 8,000. 3 employees affected.", "Brazil eSocial filing deadline approaching. 2 missing employee records need attention."].map((insight, i) => (
                <div key={i} className="bg-white rounded-xl p-3 text-xs text-slate-600 leading-relaxed border border-slate-100">{insight}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Run Wizard Modal */}
      <AnimatePresence>
        {showWizard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowWizard(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-1" style={{ color: NAVY }}>Run Global Payroll</h2>
              <p className="text-sm text-slate-500 mb-6">March 2026 · Select countries and confirm</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {COUNTRIES_DATA.map(c => (
                  <label key={c.code} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 cursor-pointer hover:border-teal-300 transition-colors">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded" style={{ accentColor: TEAL }} />
                    <span className="text-lg">{c.flag}</span>
                    <div className="flex-1"><span className="text-sm font-medium text-slate-800">{c.name}</span><span className="text-xs text-slate-400 ml-2">{c.employees} emp</span></div>
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button onClick={() => setShowWizard(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <div className="flex gap-3">
                  <button onClick={() => { toast("Simulation running..."); setShowWizard(false); }} className="px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 hover:bg-slate-50" style={{ color: TEAL }}>Simulate</button>
                  <button onClick={() => { toast.success("Payroll approved & running!"); setShowWizard(false); }} className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90" style={{ background: TEAL }}>Approve & Run</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── History Tab ── */
function HistoryTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-4 py-2.5">
          <Search size={16} className="text-slate-400" />
          <input type="text" placeholder="Search past runs..." className="flex-1 bg-transparent text-sm outline-none" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"><Filter size={14} /> Filters</button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead><tr className="text-xs text-slate-500 border-b border-slate-100">
            <th className="text-left px-5 py-3 font-medium">Run ID</th>
            <th className="text-left px-3 py-3 font-medium">Period</th>
            <th className="text-left px-3 py-3 font-medium">Countries</th>
            <th className="text-left px-3 py-3 font-medium">Employees</th>
            <th className="text-left px-3 py-3 font-medium">Total Net</th>
            <th className="text-left px-3 py-3 font-medium">Status</th>
            <th className="text-left px-3 py-3 font-medium">Date</th>
            <th className="text-right px-5 py-3 font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {PAST_RUNS.map(run => (
              <tr key={run.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3 text-sm font-mono font-medium" style={{ color: TEAL }}>{run.id}</td>
                <td className="px-3 py-3 text-sm font-medium text-slate-800">{run.period}</td>
                <td className="px-3 py-3 text-sm text-slate-600">{run.countries}</td>
                <td className="px-3 py-3 text-sm text-slate-600">{run.employees}</td>
                <td className="px-3 py-3 text-sm font-semibold" style={{ color: NAVY }}>${(run.totalNet / 1000).toFixed(1)}K</td>
                <td className="px-3 py-3"><StatusBadge status={run.status} /></td>
                <td className="px-3 py-3 text-sm text-slate-500">{run.date}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 rounded-lg hover:bg-slate-100" onClick={() => toast("Viewing details...")}><Eye size={14} className="text-slate-400" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-slate-100" onClick={() => toast("Re-running...")}><RotateCcw size={14} className="text-slate-400" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-slate-100" onClick={() => toast("Downloading...")}><Download size={14} className="text-slate-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Forecasting Tab ── */
function ForecastingTab() {
  const [headcountDelta, setHeadcountDelta] = useState(0);
  const [salaryIncrease, setSalaryIncrease] = useState(0);
  const maxVal = Math.max(...FORECAST_VALUES) * (1 + (headcountDelta + salaryIncrease) / 100) * 1.15;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Projected Annual Cost" value="$27.8M" change="8.2%" changeType="up" icon={TrendingUp} />
        <KpiCard label="Avg Monthly Cost" value="$2.32M" change="4.1%" changeType="up" icon={DollarSign} />
        <KpiCard label="Cost Per Employee" value="$8,420" change="1.8%" changeType="up" icon={Users} />
      </div>
      <div className="flex gap-6">
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>12-Month Cash Flow Forecast</h3>
          <div className="h-64 flex items-end gap-2">
            {FORECAST_VALUES.map((val, i) => {
              const adjusted = val * (1 + (headcountDelta + salaryIncrease) / 100);
              const height = (adjusted / maxVal) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-500 font-medium">${adjusted.toFixed(2)}M</span>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${height}%` }} className="w-full rounded-t-lg" style={{ background: i < 3 ? TEAL : `${TEAL}60`, minHeight: 4 }} />
                  <span className="text-[9px] text-slate-400 mt-1">{FORECAST_MONTHS[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="w-[320px] space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>What-If Analysis</h3>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2"><span className="text-xs text-slate-600">Headcount Change</span><span className="text-xs font-semibold" style={{ color: TEAL }}>{headcountDelta > 0 ? "+" : ""}{headcountDelta}%</span></div>
                <input type="range" min={-20} max={30} value={headcountDelta} onChange={e => setHeadcountDelta(+e.target.value)} className="w-full" style={{ accentColor: TEAL }} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2"><span className="text-xs text-slate-600">Salary Increase</span><span className="text-xs font-semibold" style={{ color: TEAL }}>{salaryIncrease > 0 ? "+" : ""}{salaryIncrease}%</span></div>
                <input type="range" min={0} max={15} value={salaryIncrease} onChange={e => setSalaryIncrease(+e.target.value)} className="w-full" style={{ accentColor: TEAL }} />
              </div>
            </div>
          </div>
          <div className="rounded-2xl p-5 border" style={{ background: `${TEAL}08`, borderColor: `${TEAL}20` }}>
            <div className="flex items-center gap-2 mb-3"><Sparkles size={14} style={{ color: TEAL }} /><span className="text-xs font-semibold" style={{ color: NAVY }}>AI Forecast Insights</span></div>
            <div className="space-y-2">
              {["Currency fluctuations in BRL may increase Brazil costs by 6% in Q3.", "Germany's minimum wage increase in July will impact 8 employees.", "Hiring 15 engineers in India could save $420K vs US equivalents."].map((insight, i) => (
                <p key={i} className="text-xs text-slate-600 leading-relaxed">{insight}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Compliance Center Tab ── */
function ComplianceTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Overall Score" value="79/100" change="3pts" changeType="up" icon={Shield} />
        <KpiCard label="Countries Compliant" value="5/8" change="1 new" changeType="up" icon={CheckCircle2} />
        <KpiCard label="Upcoming Deadlines" value="6" change="2 urgent" changeType="down" icon={Calendar} />
        <KpiCard label="Auto-Applied Rules" value="12" change="3 new" changeType="up" icon={Zap} />
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100"><h3 className="text-sm font-semibold" style={{ color: NAVY }}>Country Compliance Overview</h3></div>
        <table className="w-full">
          <thead><tr className="text-xs text-slate-500 border-b border-slate-50">
            <th className="text-left px-5 py-3 font-medium">Country</th>
            <th className="text-left px-3 py-3 font-medium">Score</th>
            <th className="text-left px-3 py-3 font-medium">Status</th>
            <th className="text-left px-3 py-3 font-medium">Next Deadline</th>
            <th className="text-left px-3 py-3 font-medium">Upcoming Rule</th>
            <th className="text-right px-5 py-3 font-medium">Action</th>
          </tr></thead>
          <tbody>
            {COMPLIANCE_DATA.map((c, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-slate-800">{c.country}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${c.score}%`, background: c.status === "green" ? "#10B981" : c.status === "yellow" ? "#F59E0B" : "#EF4444" }} /></div>
                    <span className="text-xs font-semibold text-slate-700">{c.score}</span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style={{ background: c.status === "green" ? "rgba(16,185,129,0.1)" : c.status === "yellow" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)", color: c.status === "green" ? "#10B981" : c.status === "yellow" ? "#F59E0B" : "#EF4444" }}>{c.status}</span>
                </td>
                <td className="px-3 py-3 text-sm text-slate-600">{c.deadline}</td>
                <td className="px-3 py-3 text-xs text-slate-500">{c.rule}</td>
                <td className="px-5 py-3 text-right">
                  <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50" style={{ color: TEAL }} onClick={() => toast(`Reviewing ${c.country}`)}>Review & Accept</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Payments Tab ── */
function PaymentsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Total Disbursed" value="$1.72M" change="Released" changeType="up" icon={CreditCard} />
        <KpiCard label="Pending Release" value="$654K" change="2 countries" changeType="down" icon={Clock} />
        <KpiCard label="Processing" value="$169K" change="1 country" changeType="up" icon={RefreshCw} />
        <KpiCard label="Failed" value="$0" change="None" changeType="up" icon={CheckCircle2} />
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold" style={{ color: NAVY }}>Payment Status — March 2026</h3>
          <span className="text-xs text-slate-400 flex items-center gap-1"><RefreshCw size={12} /> Live</span>
        </div>
        <table className="w-full">
          <thead><tr className="text-xs text-slate-500 border-b border-slate-50">
            <th className="text-left px-5 py-3 font-medium">Country</th>
            <th className="text-left px-3 py-3 font-medium">Amount</th>
            <th className="text-left px-3 py-3 font-medium">Method</th>
            <th className="text-left px-3 py-3 font-medium">Status</th>
            <th className="text-left px-3 py-3 font-medium">Date</th>
            <th className="text-right px-5 py-3 font-medium">Action</th>
          </tr></thead>
          <tbody>
            {PAYMENT_DATA.map((p, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-slate-800">{p.country}</td>
                <td className="px-3 py-3 text-sm font-semibold" style={{ color: NAVY }}>{p.amount}</td>
                <td className="px-3 py-3 text-sm text-slate-500">{p.method}</td>
                <td className="px-3 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-3 py-3 text-sm text-slate-500">{p.date}</td>
                <td className="px-5 py-3 text-right">
                  {p.status === "pending" ? (
                    <button className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white hover:opacity-90" style={{ background: TEAL }} onClick={() => toast.success(`Funds released for ${p.country}`)}>
                      <Send size={12} className="inline mr-1" /> Release Funds
                    </button>
                  ) : (
                    <button className="text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-400" onClick={() => toast("Viewing receipt...")}><FileText size={12} className="inline mr-1" /> Receipt</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function AdminGlobalPayrollPage() {
  const [activeTab, setActiveTab] = useState<TabId>("runs");

  return (
    <AdminLayout>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Global Payroll</h1>
          <p className="text-sm text-slate-500 mt-1">Manage payroll across 8 countries · March 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => toast("Downloading...")} className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"><Download size={16} /> Export</button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90" style={{ background: TEAL }}><Play size={16} /> New Run</button>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-100 p-1">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all" style={{ background: isActive ? NAVY : "transparent", color: isActive ? "white" : "#64748B" }}>
              <tab.icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {activeTab === "runs" && <RunsTab />}
          {activeTab === "history" && <HistoryTab />}
          {activeTab === "forecasting" && <ForecastingTab />}
          {activeTab === "compliance" && <ComplianceTab />}
          {activeTab === "payments" && <PaymentsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
    </AdminLayout>
  );
}
