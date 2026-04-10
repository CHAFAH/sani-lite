/*
 * AdminLayout — Full-control admin shell with comprehensive sidebar
 * Color scheme: Deep Navy (#0A2540) + Vibrant Teal (#00D4C8)
 */

import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Wallet, BarChart3, Settings, HelpCircle,
  ChevronLeft, Bell, Search, CalendarDays, GitBranch, Globe, Receipt,
  Heart, Briefcase, GraduationCap, Star, DollarSign, Shield, ChevronDown,
  Building2, UserCircle, Mail, Lock, Megaphone, Target,
  FileText, LogOut, Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SaniLogo } from "@/components/MarketingLayout";
import { useAuth } from "@/_core/hooks/useAuth";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
      { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
      { label: "Announcements", icon: Megaphone, href: "/admin/announcements" },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Employees", icon: Users, href: "/admin/employees" },
      { label: "Org Chart", icon: GitBranch, href: "/admin/org-chart" },
      { label: "Invitations", icon: Mail, href: "/admin/invitations" },
    ],
  },
  {
    label: "Time Off",
    items: [
      { label: "Time Off", icon: CalendarDays, href: "/admin/time-off" },
    ],
  },
  {
    label: "Payroll & Benefits",
    items: [
      { label: "Global Payroll", icon: Globe, href: "/admin/global-payroll", badge: "NEW" },
      { label: "Payroll Hub", icon: Receipt, href: "/admin/payroll", badge: "★" },
      { label: "Benefits", icon: Heart, href: "/admin/benefits" },
      { label: "Compensation", icon: DollarSign, href: "/admin/compensation" },
    ],
  },
  {
    label: "Talent",
    items: [
      { label: "Hiring", icon: Briefcase, href: "/admin/hiring" },
      { label: "Learning", icon: GraduationCap, href: "/admin/learning" },
      { label: "Performance", icon: Star, href: "/admin/performance" },
      { label: "Goals / OKRs", icon: Target, href: "/admin/goals" },
    ],
  },
  {
    label: "Automation",
    items: [
      { label: "Workflows", icon: Zap, href: "/admin/workflows" },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "RBAC & Roles", icon: Lock, href: "/admin/rbac" },
      { label: "SSO Config", icon: Shield, href: "/admin/sso" },
      { label: "Company", icon: Building2, href: "/admin/company-settings" },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(navGroups.map(g => [g.label, true]))
  );
  const { user, logout } = useAuth();

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F0F2F5" }}>
      {/* Sidebar — Deep Navy */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 264 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="flex flex-col"
        style={{ minWidth: collapsed ? 72 : 264, background: "#0A2540" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {!collapsed && (
            <Link href="/admin">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#00D4C8" }}>
                  <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 16C14 16 18 10 28 14C38 18 32 24 24 24C16 24 10 30 20 34C30 38 34 32 34 32" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight text-white">SANI</span>
                  <span className="text-[10px] font-semibold -mt-0.5" style={{ color: "#00D4C8" }}>ADMIN</span>
                </div>
              </motion.div>
            </Link>
          )}
          {collapsed && (
            <Link href="/admin">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto" style={{ background: "#00D4C8" }}>
                <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 16C14 16 18 10 28 14C38 18 32 24 24 24C16 24 10 30 20 34C30 38 34 32 34 32" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none" />
                </svg>
              </div>
            </Link>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg transition-colors" style={{ color: "rgba(255,255,255,0.4)" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }}><ChevronLeft size={18} /></motion.div>
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
          {navGroups.map((group) => (
            <div key={group.label} className="mb-0.5">
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold transition-colors mt-3"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                  onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
                >
                  {group.label}
                  <motion.div animate={{ rotate: expandedGroups[group.label] ? 0 : -90 }} transition={{ duration: 0.15 }}>
                    <ChevronDown size={12} />
                  </motion.div>
                </button>
              )}
              <AnimatePresence initial={false}>
                {(collapsed || expandedGroups[group.label]) && (
                  <motion.div
                    initial={collapsed ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-0.5"
                  >
                    {group.items.map((item) => {
                      const isActive = location === item.href || (item.href === "/admin" && location === "/admin/dashboard");
                      return (
                        <Link key={item.href} href={item.href}>
                          <motion.div
                            whileHover={{ x: 2 }}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative"
                            style={{
                              background: isActive ? "rgba(0, 212, 200, 0.12)" : "transparent",
                              color: isActive ? "#00D4C8" : "rgba(255,255,255,0.6)",
                            }}
                            onMouseEnter={e => {
                              if (!isActive) {
                                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                              }
                            }}
                            onMouseLeave={e => {
                              if (!isActive) {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                              }
                            }}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="adminActiveNav"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                                style={{ background: "#00D4C8" }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              />
                            )}
                            <item.icon size={18} />
                            {!collapsed && (
                              <span className="text-sm font-medium flex-1">{item.label}</span>
                            )}
                            {!collapsed && item.badge && (
                              <span
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{
                                  background: item.badge === "NEW" ? "rgba(0, 212, 200, 0.2)" : "rgba(255, 191, 36, 0.2)",
                                  color: item.badge === "NEW" ? "#00D4C8" : "#FBBF24",
                                }}
                              >
                                {item.badge}
                              </span>
                            )}
                          </motion.div>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-3 space-y-1" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => toast("Feature coming soon")}
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 w-full"
            style={{ color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
          >
            <HelpCircle size={18} />
            {!collapsed && <span className="text-sm font-medium">Help</span>}
          </button>
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 w-full"
            style={{ color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#EF4444"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
          >
            <LogOut size={18} />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0, 212, 200, 0.15)", border: "2px solid rgba(0, 212, 200, 0.3)" }}>
              <UserCircle size={20} style={{ color: "#00D4C8" }} />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-white">{user?.name || "Admin"}</p>
                <p className="text-xs truncate capitalize" style={{ color: "rgba(255,255,255,0.4)" }}>{user?.role?.replace("_", " ") || "Admin"}</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white flex items-center justify-between px-6" style={{ borderBottom: "1px solid #E5E7EB" }}>
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Search size={18} className="text-slate-400" />
            <input type="text" placeholder="Search employees, payroll, reports..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <Bell size={18} className="text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#00D4C8" }} />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <span className="text-xs font-medium text-slate-500">March 2026</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6" style={{ background: "#F0F2F5" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
