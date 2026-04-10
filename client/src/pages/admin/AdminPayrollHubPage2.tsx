/*
 * AdminPayrollHubPage2 — The flagship Payroll Hub
 * Inner Navigation: Overview | Employees | Calculations | Deductions | Variances | Approvals | Exports
 * Color: Deep Navy (#0A2540) + Vibrant Teal (#00D4C8)
 */

import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Calculator, Receipt, AlertTriangle,
  CheckSquare, FileOutput, Settings, Search, ChevronLeft,
  ChevronRight, Play, Download, RefreshCw, ArrowUpRight,
  ArrowDownRight, DollarSign, Globe, TrendingUp, Clock,
  CheckCircle2, XCircle, Sparkles, Eye, MoreVertical,
  FileText, Send, Filter, ChevronDown, Zap, Shield,
  BarChart3, PieChart, MapPin, Calendar, AlertCircle,
  ThumbsUp, ThumbsDown, MessageSquare, UserCheck, Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const TEAL = "#00D4C8";
const NAVY = "#0A2540";

/* ── Sample Data ── */
const EMPLOYEES_DATA = [
  { id: 1, name: "Sarah Chen", country: "🇺🇸 US", entity: "SANI Inc.", gross: 12500, net: 8750, status: "calculated", warnings: 0 },
  { id: 2, name: "James Wilson", country: "🇬🇧 UK", entity: "SANI Ltd.", gross: 9800, net: 6860, status: "calculated", warnings: 0 },
  { id: 3, name: "Priya Sharma", country: "🇮🇳 India", entity: "SANI Tech", gross: 4200, net: 3360, status: "calculated", warnings: 1 },
  { id: 4, name: "Max Müller", country: "🇩🇪 Germany", entity: "SANI GmbH", gross: 8900, net: 5340, status: "pending", warnings: 0 },
  { id: 5, name: "Ana Silva", country: "🇧🇷 Brazil", entity: "SANI Ltda", gross: 5600, net: 3920, status: "calculated", warnings: 2 },
  { id: 6, name: "Wei Zhang", country: "🇸🇬 Singapore", entity: "SANI Pte", gross: 11200, net: 8960, status: "calculated", warnings: 0 },
  { id: 7, name: "Emily Brown", country: "🇨🇦 Canada", entity: "SANI CA", gross: 9400, net: 6580, status: "error", warnings: 3 },
  { id: 8, name: "Liam O'Brien", country: "🇦🇺 Australia", entity: "SANI Pty", gross: 10100, net: 7070, status: "calculated", warnings: 0 },
  { id: 9, name: "Jordan Lee", country: "🇺🇸 US", entity: "SANI Inc.", gross: 14200, net: 9940, status: "calculated", warnings: 0 },
  { id: 10, name: "Sophie Martin", country: "🇩🇪 Germany", entity: "SANI GmbH", gross: 7800, net: 4680, status: "calculated", warnings: 1 },
  { id: 11, name: "Raj Patel", country: "🇮🇳 India", entity: "SANI Tech", gross: 3800, net: 3040, status: "calculated", warnings: 0 },
  { id: 12, name: "Maria Garcia", country: "🇧🇷 Brazil", entity: "SANI Ltda", gross: 4900, net: 3430, status: "calculated", warnings: 0 },
];

const DEDUCTIONS_DATA = [
  { country: "🇺🇸 United States", authority: "IRS", type: "Federal Income Tax", amount: 156800, status: "filed", dueDate: "Apr 15" },
  { country: "🇺🇸 United States", authority: "SSA", type: "Social Security", amount: 89400, status: "filed", dueDate: "Apr 15" },
  { country: "🇬🇧 United Kingdom", authority: "HMRC", type: "PAYE", amount: 67200, status: "pending", dueDate: "Apr 19" },
  { country: "🇩🇪 Germany", authority: "Finanzamt", type: "Lohnsteuer", amount: 82100, status: "pending", dueDate: "Apr 10" },
  { country: "🇮🇳 India", authority: "CBDT", type: "TDS", amount: 24600, status: "filed", dueDate: "Apr 30" },
  { country: "🇧🇷 Brazil", authority: "Receita Federal", type: "IRRF", amount: 31200, status: "overdue", dueDate: "Mar 31" },
  { country: "🇸🇬 Singapore", authority: "IRAS", type: "Income Tax", amount: 18900, status: "filed", dueDate: "May 1" },
  { country: "🇨🇦 Canada", authority: "CRA", type: "CPP + EI", amount: 42300, status: "pending", dueDate: "Apr 30" },
];

const ANOMALIES_DATA = [
  { id: 1, employee: "Emily Brown", flag: "red" as const, change: "+42%", reason: "Overtime spike + retroactive adjustment from Feb", confidence: 92, type: "Pay Variance" },
  { id: 2, employee: "Ana Silva", flag: "yellow" as const, change: "+18%", reason: "New stock grant vesting in March + currency fluctuation (BRL)", confidence: 87, type: "Compensation Change" },
  { id: 3, employee: "Priya Sharma", flag: "yellow" as const, change: "-12%", reason: "Unpaid leave (5 days) not reflected in time-off sync", confidence: 78, type: "Sync Error" },
  { id: 4, employee: "Sophie Martin", flag: "red" as const, change: "+38%", reason: "Promotion effective March 1 — salary band updated but tax bracket not recalculated", confidence: 95, type: "Tax Mismatch" },
  { id: 5, employee: "Max Müller", flag: "yellow" as const, change: "+8%", reason: "Social insurance rate change effective April 1 applied early", confidence: 84, type: "Regulatory" },
];

const APPROVALS_DATA = [
  { id: 1, country: "🇺🇸 United States", approver: "CFO — David Kim", amount: "$578,200", status: "pending", submitted: "Mar 28", comments: 2 },
  { id: 2, country: "🇬🇧 United Kingdom", approver: "Finance Dir — Lisa Park", amount: "£198,400", status: "approved", submitted: "Mar 27", comments: 0 },
  { id: 3, country: "🇩🇪 Germany", approver: "HR Lead — Klaus Weber", amount: "€172,300", status: "pending", submitted: "Mar 28", comments: 1 },
  { id: 4, country: "🇮🇳 India", approver: "Country Lead — Arun Nair", amount: "₹12.8M", status: "approved", submitted: "Mar 26", comments: 0 },
  { id: 5, country: "🇧🇷 Brazil", approver: "Finance — Carlos Souza", amount: "R$482K", status: "rejected", submitted: "Mar 27", comments: 3 },
  { id: 6, country: "🇸🇬 Singapore", approver: "APAC Lead — Mei Ling", amount: "S$142K", status: "approved", submitted: "Mar 26", comments: 0 },
];

const REPORTS = [
  { name: "Payroll Summary", desc: "Complete payroll breakdown by country", icon: FileText, format: "PDF / Excel" },
  { name: "Tax Filing Report", desc: "Tax obligations by jurisdiction", icon: Receipt, format: "PDF" },
  { name: "Variance Report", desc: "Month-over-month pay changes", icon: BarChart3, format: "Excel" },
  { name: "Audit Trail", desc: "Complete change log with timestamps", icon: Shield, format: "PDF" },
  { name: "Cost Analysis", desc: "Payroll cost by department & country", icon: PieChart, format: "Excel / CSV" },
  { name: "Year-End Filing", desc: "W-2, P60, and country-specific forms", icon: Calendar, format: "PDF" },
];

/* ── Inner Nav Items ── */
const innerNav = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "employees", label: "Employees", icon: Users },
  { id: "calculations", label: "Calculations", icon: Calculator },
  { id: "deductions", label: "Deductions & Taxes", icon: Receipt },
  { id: "variances", label: "Variances", icon: AlertTriangle },
  { id: "approvals", label: "Approvals", icon: CheckSquare },
  { id: "exports", label: "Exports & Reports", icon: FileOutput },
] as const;

type NavId = (typeof innerNav)[number]["id"];

/* ── Shared Components ── */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    calculated: { bg: "rgba(16,185,129,0.1)", text: "#10B981" },
    pending: { bg: "rgba(245,158,11,0.1)", text: "#F59E0B" },
    error: { bg: "rgba(239,68,68,0.1)", text: "#EF4444" },
    filed: { bg: "rgba(16,185,129,0.1)", text: "#10B981" },
    overdue: { bg: "rgba(239,68,68,0.1)", text: "#EF4444" },
    approved: { bg: "rgba(16,185,129,0.1)", text: "#10B981" },
    rejected: { bg: "rgba(239,68,68,0.1)", text: "#EF4444" },
  };
  const c = config[status] || { bg: "rgba(100,116,139,0.1)", text: "#64748B" };
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize" style={{ background: c.bg, color: c.text }}>
      {status}
    </span>
  );
}

function KpiCard({ label, value, change, changeType, icon: Icon, sparkData }: { label: string; value: string; change: string; changeType: "up" | "down"; icon: React.ElementType; sparkData?: number[] }) {
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
      {sparkData && (
        <div className="flex items-end gap-0.5 mt-3 h-6">
          {sparkData.map((v, i) => (
            <div key={i} className="flex-1 rounded-sm" style={{ height: `${(v / Math.max(...sparkData)) * 100}%`, background: i === sparkData.length - 1 ? TEAL : `${TEAL}40`, minHeight: 2 }} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Overview Section ── */
function OverviewSection() {
  const countryStatus = [
    { flag: "🇺🇸", name: "US", done: true },
    { flag: "🇬🇧", name: "UK", done: true },
    { flag: "🇩🇪", name: "DE", done: false },
    { flag: "🇮🇳", name: "IN", done: true },
    { flag: "🇧🇷", name: "BR", done: false },
    { flag: "🇸🇬", name: "SG", done: true },
    { flag: "🇨🇦", name: "CA", done: false },
    { flag: "🇦🇺", name: "AU", done: true },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        <KpiCard label="Total Gross Payroll" value="$2.46M" change="4.2%" changeType="up" icon={DollarSign} sparkData={[18, 22, 19, 24, 21, 26, 28]} />
        <KpiCard label="Total Net Pay" value="$1.72M" change="3.8%" changeType="up" icon={TrendingUp} sparkData={[14, 16, 15, 18, 17, 19, 20]} />
        <KpiCard label="Total Taxes & Deductions" value="$742K" change="5.1%" changeType="up" icon={Receipt} sparkData={[6, 7, 6, 8, 7, 9, 8]} />
        <KpiCard label="Error Rate" value="0.8%" change="0.3%" changeType="down" icon={AlertCircle} sparkData={[3, 2, 4, 2, 1, 2, 1]} />
        <KpiCard label="On-Time Rate" value="97.2%" change="1.2%" changeType="up" icon={Clock} sparkData={[92, 94, 95, 96, 95, 97, 97]} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: NAVY }}>Country Run Status — March 2026</h3>
            <span className="text-xs text-slate-400 flex items-center gap-1"><RefreshCw size={12} /> Live</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {countryStatus.map(c => (
              <div key={c.name} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${c.done ? "border-emerald-200 bg-emerald-50/50" : "border-amber-200 bg-amber-50/50"}`}>
                <span className="text-2xl">{c.flag}</span>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-slate-800">{c.name}</span>
                  <p className="text-[10px] text-slate-500">{c.done ? "Completed" : "In Progress"}</p>
                </div>
                {c.done ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Clock size={16} className="text-amber-500" />}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> 5 Completed</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> 3 In Progress</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} style={{ color: TEAL }} />
            <h3 className="text-sm font-semibold" style={{ color: NAVY }}>AI Insights</h3>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${TEAL}20`, color: TEAL }}>AI</span>
          </div>
          <div className="space-y-3">
            {[
              "Germany payroll pending — social insurance update required before processing.",
              "Brazil BRL weakened 3.2% this month. Net cost impact: +$4,200.",
              "3 employees have overtime exceeding 20hrs — review for compliance.",
              "Canada CPP contribution ceiling reached for 2 employees.",
              "On-time rate improved 1.2% vs last month. Keep it up!",
            ].map((insight, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 text-xs text-slate-600 leading-relaxed border border-slate-100 hover:border-teal-200 transition-colors cursor-pointer">
                {insight}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>Upcoming Deadlines</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[
            { date: "Apr 10", title: "Germany Lohnsteuer Filing", urgency: "high" },
            { date: "Apr 15", title: "US Federal Tax Remittance", urgency: "high" },
            { date: "Apr 19", title: "UK PAYE RTI Submission", urgency: "medium" },
            { date: "Apr 20", title: "Brazil eSocial Monthly", urgency: "medium" },
            { date: "Apr 30", title: "India TDS Quarterly Return", urgency: "low" },
            { date: "Apr 30", title: "Canada CPP/EI Remittance", urgency: "low" },
          ].map((d, i) => (
            <div key={i} className="flex-shrink-0 w-48 p-4 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
              <div className={`text-[10px] font-bold uppercase mb-2 ${d.urgency === "high" ? "text-red-500" : d.urgency === "medium" ? "text-amber-500" : "text-slate-400"}`}>
                {d.urgency === "high" ? "Urgent" : d.urgency === "medium" ? "Soon" : "Upcoming"}
              </div>
              <p className="text-sm font-semibold text-slate-800 mb-1">{d.title}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={12} /> {d.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Employees Section ── */
function EmployeesSection() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filtered = EMPLOYEES_DATA.filter(e =>
    !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.country.toLowerCase().includes(search.toLowerCase())
  );

  const selected = EMPLOYEES_DATA.find(e => e.id === selectedId);

  return (
    <div className="flex gap-6">
      <div className={`flex-1 space-y-4 transition-all ${selectedId ? "max-w-[60%]" : ""}`}>
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-4 py-2.5">
            <Search size={16} className="text-slate-400" />
            <input type="text" placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"><Filter size={14} /> Filters</button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90" style={{ background: TEAL }} onClick={() => toast("AI Classification running...")}>
            <Sparkles size={14} /> Classify Contractors
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead><tr className="text-xs text-slate-500 border-b border-slate-100">
              <th className="text-left px-5 py-3 font-medium">Employee</th>
              <th className="text-left px-3 py-3 font-medium">Country</th>
              <th className="text-left px-3 py-3 font-medium">Entity</th>
              <th className="text-right px-3 py-3 font-medium">Gross Pay</th>
              <th className="text-right px-3 py-3 font-medium">Net Pay</th>
              <th className="text-left px-3 py-3 font-medium">Status</th>
              <th className="text-center px-3 py-3 font-medium">Warnings</th>
            </tr></thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} onClick={() => setSelectedId(e.id)} className={`border-b border-slate-50 cursor-pointer transition-colors ${selectedId === e.id ? "bg-teal-50/50" : "hover:bg-slate-50/50"}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: TEAL }}>{e.name.split(" ").map(n => n[0]).join("")}</div>
                      <span className="text-sm font-medium text-slate-800">{e.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-600">{e.country}</td>
                  <td className="px-3 py-3 text-sm text-slate-500">{e.entity}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-right" style={{ color: NAVY }}>${e.gross.toLocaleString()}</td>
                  <td className="px-3 py-3 text-sm text-right text-slate-600">${e.net.toLocaleString()}</td>
                  <td className="px-3 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-3 py-3 text-center">
                    {e.warnings > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600"><AlertTriangle size={12} />{e.warnings}</span>
                    ) : (
                      <CheckCircle2 size={14} className="text-emerald-400 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-[40%] bg-white rounded-2xl border border-slate-100 p-6 space-y-5 sticky top-0 self-start">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold" style={{ color: NAVY }}>Payroll Breakdown</h3>
              <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-slate-600"><XCircle size={18} /></button>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-white" style={{ background: TEAL }}>{selected.name.split(" ").map(n => n[0]).join("")}</div>
              <div>
                <p className="text-lg font-bold" style={{ color: NAVY }}>{selected.name}</p>
                <p className="text-sm text-slate-500">{selected.country} · {selected.entity}</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Base Salary", value: `$${selected.gross.toLocaleString()}`, pct: "100%" },
                { label: "Federal Tax", value: `-$${Math.round(selected.gross * 0.22).toLocaleString()}`, pct: "22%" },
                { label: "Social Security", value: `-$${Math.round(selected.gross * 0.062).toLocaleString()}`, pct: "6.2%" },
                { label: "Medicare", value: `-$${Math.round(selected.gross * 0.0145).toLocaleString()}`, pct: "1.45%" },
                { label: "State Tax", value: `-$${Math.round(selected.gross * 0.05).toLocaleString()}`, pct: "5%" },
                { label: "401(k) Contribution", value: `-$${Math.round(selected.gross * 0.06).toLocaleString()}`, pct: "6%" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{item.pct}</span>
                    <span className={`text-sm font-semibold ${item.value.startsWith("-") ? "text-red-500" : ""}`} style={{ color: item.value.startsWith("-") ? undefined : NAVY }}>{item.value}</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 border-t-2 border-slate-200">
                <span className="text-sm font-bold" style={{ color: NAVY }}>Net Pay</span>
                <span className="text-lg font-bold" style={{ color: TEAL }}>${selected.net.toLocaleString()}</span>
              </div>
            </div>
            <button className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50" onClick={() => toast("Viewing full payslip...")}>
              <FileText size={14} className="inline mr-2" /> View Full Payslip
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Calculations Section ── */
function CalculationsSection() {
  const [expanded, setExpanded] = useState<string | null>("us");

  const rules = [
    {
      id: "us", country: "🇺🇸 United States", steps: [
        { label: "Gross Pay", formula: "Base Salary + Overtime + Bonuses", value: "$12,500" },
        { label: "Federal Income Tax", formula: "Progressive brackets (10%–37%)", value: "-$2,750" },
        { label: "FICA (SS + Medicare)", formula: "6.2% + 1.45% of gross", value: "-$955" },
        { label: "State Tax (CA)", formula: "Progressive brackets (1%–13.3%)", value: "-$625" },
        { label: "Pre-tax Deductions", formula: "401(k) 6% + HSA $250", value: "-$1,000" },
        { label: "Net Pay", formula: "Gross - All Deductions", value: "$7,170" },
      ],
    },
    {
      id: "uk", country: "🇬🇧 United Kingdom", steps: [
        { label: "Gross Pay", formula: "Base Salary + Allowances", value: "£9,800" },
        { label: "Income Tax (PAYE)", formula: "20% basic / 40% higher rate", value: "-£1,960" },
        { label: "National Insurance", formula: "12% on £12,570–£50,270", value: "-£784" },
        { label: "Pension (Auto-enrol)", formula: "5% employee contribution", value: "-£490" },
        { label: "Net Pay", formula: "Gross - All Deductions", value: "£6,566" },
      ],
    },
    {
      id: "de", country: "🇩🇪 Germany", steps: [
        { label: "Bruttolohn (Gross)", formula: "Base + Zulagen", value: "€8,900" },
        { label: "Lohnsteuer", formula: "Progressive 14%–45%", value: "-€2,670" },
        { label: "Sozialversicherung", formula: "~20% (KV+RV+AV+PV)", value: "-€1,780" },
        { label: "Solidaritätszuschlag", formula: "5.5% of Lohnsteuer (if applicable)", value: "-€0" },
        { label: "Nettolohn (Net)", formula: "Brutto - Abzüge", value: "€4,450" },
      ],
    },
    {
      id: "in", country: "🇮🇳 India", steps: [
        { label: "Gross Salary", formula: "CTC / 12", value: "₹3,50,000" },
        { label: "TDS (Income Tax)", formula: "New regime slabs (5%–30%)", value: "-₹52,500" },
        { label: "PF (Employee)", formula: "12% of basic", value: "-₹21,000" },
        { label: "Professional Tax", formula: "State-specific (max ₹2,500)", value: "-₹2,500" },
        { label: "Net Salary", formula: "Gross - Deductions", value: "₹2,74,000" },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Step-by-step calculation breakdown by country</p>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50" onClick={() => toast("Edit mode coming soon")}><Settings size={14} /> Edit Rules</button>
      </div>
      <div className="space-y-3">
        {rules.map(rule => (
          <div key={rule.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <button onClick={() => setExpanded(expanded === rule.id ? null : rule.id)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
              <span className="text-sm font-semibold" style={{ color: NAVY }}>{rule.country}</span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${expanded === rule.id ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {expanded === rule.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-6 pb-5 space-y-1">
                    {rule.steps.map((step, i) => {
                      const isLast = i === rule.steps.length - 1;
                      return (
                        <div key={i} className={`flex items-center justify-between py-3 ${!isLast ? "border-b border-slate-50" : "border-t-2 border-slate-200 pt-4"}`}>
                          <div>
                            <span className={`text-sm ${isLast ? "font-bold" : "font-medium"} text-slate-800`}>{step.label}</span>
                            <p className="text-xs text-slate-400 mt-0.5 font-mono">{step.formula}</p>
                          </div>
                          <span className={`text-sm ${isLast ? "font-bold text-lg" : "font-semibold"}`} style={{ color: isLast ? TEAL : step.value.startsWith("-") ? "#EF4444" : NAVY }}>{step.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Deductions & Taxes Section ── */
function DeductionsSection() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Total Tax Obligations" value="$512K" change="3.2%" changeType="up" icon={Receipt} />
        <KpiCard label="Filed & Remitted" value="$354K" change="On track" changeType="up" icon={CheckCircle2} />
        <KpiCard label="Pending / Overdue" value="$158K" change="2 items" changeType="down" icon={AlertTriangle} />
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold" style={{ color: NAVY }}>Tax & Deduction Breakdown by Authority</h3>
          <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50" style={{ color: TEAL }}>View Tax Forms</button>
        </div>
        <table className="w-full">
          <thead><tr className="text-xs text-slate-500 border-b border-slate-50">
            <th className="text-left px-5 py-3 font-medium">Country</th>
            <th className="text-left px-3 py-3 font-medium">Authority</th>
            <th className="text-left px-3 py-3 font-medium">Type</th>
            <th className="text-right px-3 py-3 font-medium">Amount</th>
            <th className="text-left px-3 py-3 font-medium">Status</th>
            <th className="text-left px-3 py-3 font-medium">Due Date</th>
            <th className="text-right px-5 py-3 font-medium">Action</th>
          </tr></thead>
          <tbody>
            {DEDUCTIONS_DATA.map((d, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-slate-800">{d.country}</td>
                <td className="px-3 py-3 text-sm text-slate-600">{d.authority}</td>
                <td className="px-3 py-3 text-sm text-slate-500">{d.type}</td>
                <td className="px-3 py-3 text-sm font-semibold text-right" style={{ color: NAVY }}>${(d.amount / 1000).toFixed(1)}K</td>
                <td className="px-3 py-3"><StatusBadge status={d.status} /></td>
                <td className="px-3 py-3 text-sm text-slate-500">{d.dueDate}</td>
                <td className="px-5 py-3 text-right">
                  {d.status === "pending" || d.status === "overdue" ? (
                    <button className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white hover:opacity-90" style={{ background: d.status === "overdue" ? "#EF4444" : TEAL }} onClick={() => toast.success(`Filing ${d.type}...`)}>
                      <Send size={12} className="inline mr-1" /> File & Remit
                    </button>
                  ) : (
                    <button className="text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-400" onClick={() => toast("Viewing receipt...")}><Eye size={12} className="inline mr-1" /> Receipt</button>
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

/* ── Variances & Anomalies Section ── */
function VariancesSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">AI-detected pay variances and anomalies for March 2026</p>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold px-2 py-1 rounded-full" style={{ background: `${TEAL}20`, color: TEAL }}>AI-Powered</span>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"><RefreshCw size={14} /> Re-scan</button>
        </div>
      </div>
      <div className="space-y-3">
        {ANOMALIES_DATA.map(a => (
          <div key={a.id} className={`bg-white rounded-2xl border p-5 hover:shadow-md transition-shadow ${a.flag === "red" ? "border-red-200" : "border-amber-200"}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${a.flag === "red" ? "bg-red-50" : "bg-amber-50"}`}>
                <AlertTriangle size={18} className={a.flag === "red" ? "text-red-500" : "text-amber-500"} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-semibold" style={{ color: NAVY }}>{a.employee}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.flag === "red" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>{a.change}</span>
                  <span className="text-xs text-slate-400">{a.type}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{a.reason}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xs text-slate-400">Confidence: <span className="font-semibold" style={{ color: a.confidence > 90 ? "#10B981" : a.confidence > 80 ? "#F59E0B" : "#EF4444" }}>{a.confidence}%</span></span>
                  <div className="flex gap-2">
                    <button className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white hover:opacity-90" style={{ background: TEAL }} onClick={() => toast.success(`Auto-fixing ${a.employee}...`)}><Zap size={12} className="inline mr-1" /> Auto-Fix</button>
                    <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600" onClick={() => toast(`Reviewing ${a.employee}...`)}><Eye size={12} className="inline mr-1" /> Review</button>
                    <button className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400" onClick={() => toast("Dismissed")}><XCircle size={12} className="inline mr-1" /> Dismiss</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Approvals Section ── */
function ApprovalsSection() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>Approval Workflow</h3>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {["Payroll Calculated", "Manager Review", "Finance Approval", "CFO Sign-off", "Funds Released"].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`px-4 py-2 rounded-xl text-xs font-semibold ${i < 2 ? "text-white" : i === 2 ? "border-2" : "bg-slate-100 text-slate-400"}`} style={{ background: i < 2 ? TEAL : undefined, borderColor: i === 2 ? TEAL : undefined, color: i === 2 ? TEAL : undefined }}>
                {i < 2 && <CheckCircle2 size={12} className="inline mr-1" />}
                {step}
              </div>
              {i < 4 && <ChevronRight size={16} className="text-slate-300" />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{APPROVALS_DATA.filter(a => a.status === "pending").length} pending approvals</p>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ background: TEAL }} onClick={() => toast.success("All pending items approved!")}>
          <CheckSquare size={14} /> Approve All Pending
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead><tr className="text-xs text-slate-500 border-b border-slate-100">
            <th className="text-left px-5 py-3 font-medium">Country</th>
            <th className="text-left px-3 py-3 font-medium">Approver</th>
            <th className="text-right px-3 py-3 font-medium">Amount</th>
            <th className="text-left px-3 py-3 font-medium">Status</th>
            <th className="text-left px-3 py-3 font-medium">Submitted</th>
            <th className="text-center px-3 py-3 font-medium">Comments</th>
            <th className="text-right px-5 py-3 font-medium">Actions</th>
          </tr></thead>
          <tbody>
            {APPROVALS_DATA.map(a => (
              <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-slate-800">{a.country}</td>
                <td className="px-3 py-3 text-sm text-slate-600">{a.approver}</td>
                <td className="px-3 py-3 text-sm font-semibold text-right" style={{ color: NAVY }}>{a.amount}</td>
                <td className="px-3 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-3 py-3 text-sm text-slate-500">{a.submitted}</td>
                <td className="px-3 py-3 text-center">
                  {a.comments > 0 ? <span className="text-xs font-semibold text-slate-600 flex items-center justify-center gap-1"><MessageSquare size={12} />{a.comments}</span> : <span className="text-xs text-slate-300">—</span>}
                </td>
                <td className="px-5 py-3 text-right">
                  {a.status === "pending" ? (
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-emerald-50" onClick={() => toast.success(`Approved ${a.country}`)}><ThumbsUp size={14} className="text-emerald-500" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50" onClick={() => toast.error(`Rejected ${a.country}`)}><ThumbsDown size={14} className="text-red-400" /></button>
                    </div>
                  ) : (
                    <button className="text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Eye size={12} className="inline mr-1" /> View</button>
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

/* ── Exports & Reports Section ── */
function ExportsSection() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {REPORTS.map((r, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${TEAL}15` }}>
                <r.icon size={20} style={{ color: TEAL }} />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{r.format}</span>
            </div>
            <h4 className="text-sm font-semibold mb-1" style={{ color: NAVY }}>{r.name}</h4>
            <p className="text-xs text-slate-500 mb-4">{r.desc}</p>
            <button className="w-full py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 group-hover:border-teal-300 group-hover:text-teal-600 transition-colors" onClick={() => toast.success(`Generating ${r.name}...`)}>
              <Download size={12} className="inline mr-1" /> Generate Report
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-6 border" style={{ background: `linear-gradient(135deg, ${NAVY}05, ${TEAL}08)`, borderColor: `${TEAL}20` }}>
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={18} style={{ color: TEAL }} />
          <h3 className="text-base font-semibold" style={{ color: NAVY }}>Custom Report Builder</h3>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${TEAL}20`, color: TEAL }}>AI</span>
        </div>
        <p className="text-sm text-slate-600 mb-4">Describe the report you need in natural language, and our AI will generate it for you.</p>
        <div className="flex gap-3">
          <input type="text" placeholder='e.g., "Show me all overtime costs by department for Q1 2026"' className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-teal-300" />
          <button className="px-6 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ background: TEAL }} onClick={() => toast("Generating custom report...")}>
            <Sparkles size={14} className="inline mr-2" /> Generate
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: NAVY }}>Year-End Filing Wizard</h3>
            <p className="text-xs text-slate-500 mt-1">Generate W-2, P60, and country-specific year-end forms</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ background: NAVY }} onClick={() => toast("Starting year-end wizard...")}>
            <Calendar size={14} /> Start Wizard
          </button>
        </div>
        <div className="flex gap-4">
          {[
            { country: "🇺🇸 US", form: "W-2 / 1099", status: "Ready" },
            { country: "🇬🇧 UK", form: "P60 / P11D", status: "Ready" },
            { country: "🇩🇪 DE", form: "Lohnsteuerbescheinigung", status: "Pending" },
            { country: "🇮🇳 IN", form: "Form 16", status: "Ready" },
          ].map((f, i) => (
            <div key={i} className="flex-1 p-3 rounded-xl border border-slate-100 text-center">
              <span className="text-lg">{f.country.split(" ")[0]}</span>
              <p className="text-xs font-medium text-slate-800 mt-1">{f.form}</p>
              <p className={`text-[10px] font-semibold mt-1 ${f.status === "Ready" ? "text-emerald-500" : "text-amber-500"}`}>{f.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function AdminPayrollHubPage() {
  const [activeNav, setActiveNav] = useState<NavId>("overview");
  const [period, setPeriod] = useState("March 2026");

  return (
    <AdminLayout>
      <div className="flex -mx-6 -mt-6" style={{ height: "calc(100vh - 64px)" }}>
        {/* Left Inner Navigation */}
        <div className="w-56 flex-shrink-0 border-r border-slate-100 bg-white p-4 space-y-1">
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">Payroll Hub</h2>
          </div>
          {innerNav.map(nav => {
            const isActive = activeNav === nav.id;
            return (
              <button key={nav.id} onClick={() => setActiveNav(nav.id)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all" style={{ background: isActive ? `${TEAL}15` : "transparent", color: isActive ? TEAL : "#64748B" }}>
                <nav.icon size={16} />
                {nav.label}
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Top Bar */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-100 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2">
                <Search size={16} className="text-slate-400" />
                <input type="text" placeholder="Search payroll..." className="bg-transparent text-sm outline-none w-48" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2">
                <button onClick={() => setPeriod("February 2026")}><ChevronLeft size={16} className="text-slate-400" /></button>
                <span className="text-sm font-semibold px-2" style={{ color: NAVY }}>{period}</span>
                <button onClick={() => setPeriod("April 2026")}><ChevronRight size={16} className="text-slate-400" /></button>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ background: TEAL }} onClick={() => toast("Starting new payroll run...")}>
                <Play size={14} /> New Run
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div key={activeNav} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                {activeNav === "overview" && <OverviewSection />}
                {activeNav === "employees" && <EmployeesSection />}
                {activeNav === "calculations" && <CalculationsSection />}
                {activeNav === "deductions" && <DeductionsSection />}
                {activeNav === "variances" && <VariancesSection />}
                {activeNav === "approvals" && <ApprovalsSection />}
                {activeNav === "exports" && <ExportsSection />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
