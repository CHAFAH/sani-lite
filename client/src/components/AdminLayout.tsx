/*
 * AdminLayout — Full-control admin shell with comprehensive sidebar
 * Accessible only to: super_admin, company_owner, admin, hr_admin
 */

import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Wallet, BarChart3, Settings, HelpCircle,
  ChevronLeft, Bell, Search, CalendarDays, GitBranch, Globe, Receipt,
  Heart, Briefcase, GraduationCap, Star, DollarSign, Shield, ChevronDown,
  Building2, UserCircle, Mail, FolderTree, Lock, Megaphone, Target,
  UserPlus, FileText, LogOut,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SaniLogo } from "@/components/MarketingLayout";
import { useAuth } from "@/_core/hooks/useAuth";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
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
      { label: "Departments", icon: FolderTree, href: "/admin/departments" },
      { label: "Invitations", icon: UserPlus, href: "/admin/invitations" },
      { label: "Time Off", icon: CalendarDays, href: "/admin/time-off" },
    ],
  },
  {
    label: "Payroll & Benefits",
    items: [
      { label: "Global Payroll", icon: Globe, href: "/admin/payroll" },
      { label: "Payroll Hub", icon: Receipt, href: "/admin/payroll-hub" },
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
      { label: "Workflows", icon: GitBranch, href: "/admin/workflows" },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "RBAC & Roles", icon: Lock, href: "/admin/rbac" },
      { label: "SSO Config", icon: Shield, href: "/admin/sso" },
      { label: "Company", icon: Building2, href: "/admin/company" },
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
    <div className="flex h-screen bg-[#F8F9FC] overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="flex flex-col border-r border-slate-200 bg-white"
        style={{ minWidth: collapsed ? 72 : 260 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200">
          {!collapsed && (
            <Link href="/admin">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <SaniLogo size={28} />
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight text-slate-900">SANI</span>
                  <span className="text-[10px] font-medium text-indigo-600 -mt-0.5">ADMIN</span>
                </div>
              </motion.div>
            </Link>
          )}
          {collapsed && <Link href="/admin"><SaniLogo size={28} /></Link>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400">
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }}><ChevronLeft size={18} /></motion.div>
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-0.5">
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-slate-400 hover:text-slate-600 transition-colors mt-2"
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
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative ${
                              isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          >
                            {isActive && (
                              <motion.div layoutId="adminActiveNav" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-r-full" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                            )}
                            <item.icon size={18} className={isActive ? "text-indigo-600" : ""} />
                            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
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
        <div className="px-3 py-3 border-t border-slate-200 space-y-1">
          <button onClick={() => toast("Feature coming soon")} className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 w-full">
            <HelpCircle size={18} />
            {!collapsed && <span className="text-sm font-medium">Help</span>}
          </button>
          <button onClick={() => logout()} className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full">
            <LogOut size={18} />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center ring-2 ring-indigo-50">
              <UserCircle size={20} className="text-indigo-600" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-slate-900">{user?.name || "Admin"}</p>
                <p className="text-xs text-slate-400 truncate capitalize">{user?.role?.replace("_", " ") || "Admin"}</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Search size={18} className="text-slate-400" />
            <input type="text" placeholder="Search employees, settings, reports..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <Bell size={18} className="text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-[#F8F9FC]">
          {children}
        </main>
      </div>
    </div>
  );
}
