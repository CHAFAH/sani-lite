/*
 * ManagerLayout — Team-centric sidebar for managers
 * Accessible to: manager (and above roles)
 */

import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, CalendarDays, Star, Target, GraduationCap,
  ChevronLeft, Bell, Search, ChevronDown, UserCircle, MessageSquare, LogOut,
} from "lucide-react";
import { useState } from "react";
import { SaniLogo } from "@/components/MarketingLayout";
import { useAuth } from "@/_core/hooks/useAuth";

interface NavItem { label: string; icon: React.ElementType; href: string; }
interface NavGroup { label: string; items: NavItem[]; }

const navGroups: NavGroup[] = [
  {
    label: "My Team",
    items: [
      { label: "Team Dashboard", icon: LayoutDashboard, href: "/manager" },
      { label: "Team Members", icon: Users, href: "/manager/team" },
      { label: "Time Off Requests", icon: CalendarDays, href: "/manager/time-off" },
    ],
  },
  {
    label: "Development",
    items: [
      { label: "Performance Reviews", icon: Star, href: "/manager/performance" },
      { label: "Goals & OKRs", icon: Target, href: "/manager/goals" },
      { label: "Learning", icon: GraduationCap, href: "/manager/learning" },
      { label: "Feedback", icon: MessageSquare, href: "/manager/feedback" },
    ],
  },
];

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
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
    <div className="flex h-screen bg-[#FAFBF9] overflow-hidden">
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="flex flex-col border-r border-emerald-100 bg-white"
        style={{ minWidth: collapsed ? 72 : 260 }}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-emerald-100">
          {!collapsed && (
            <Link href="/manager">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <SaniLogo size={28} />
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight text-slate-900">SANI</span>
                  <span className="text-[10px] font-medium text-emerald-600 -mt-0.5">MANAGER</span>
                </div>
              </motion.div>
            </Link>
          )}
          {collapsed && <Link href="/manager"><SaniLogo size={28} /></Link>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-emerald-50 transition-colors text-slate-400">
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }}><ChevronLeft size={18} /></motion.div>
          </button>
        </div>

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
                      const isActive = location === item.href;
                      return (
                        <Link key={item.href} href={item.href}>
                          <motion.div
                            whileHover={{ x: 2 }}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 relative ${
                              isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          >
                            {isActive && (
                              <motion.div layoutId="mgrActiveNav" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-600 rounded-r-full" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                            )}
                            <item.icon size={18} className={isActive ? "text-emerald-600" : ""} />
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

        <div className="px-3 py-3 border-t border-emerald-100 space-y-1">
          <button onClick={() => logout()} className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full">
            <LogOut size={18} />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center ring-2 ring-emerald-50">
              <UserCircle size={20} className="text-emerald-600" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-slate-900">{user?.name || "Manager"}</p>
                <p className="text-xs text-slate-400 truncate">Manager</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-emerald-100 bg-white flex items-center justify-between px-6">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Search size={18} className="text-slate-400" />
            <input type="text" placeholder="Search team members..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <Bell size={18} className="text-slate-500" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
