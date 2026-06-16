/*
 * EmployeeLayout — Simple, task-driven sidebar for employees
 * Accessible to: employee role
 */

import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard, CalendarDays, Star, Target, GraduationCap,
  Bell, Search, UserCircle, Heart, FileText, Megaphone, LogOut,
} from "lucide-react";
import { SaniLogo } from "@/components/MarketingLayout";
import { useAuth } from "@/_core/hooks/useAuth";

interface NavItem { label: string; icon: React.ElementType; href: string; }

const navItems: NavItem[] = [
  { label: "My Dashboard", icon: LayoutDashboard, href: "/employee" },
  { label: "My Profile", icon: UserCircle, href: "/employee/profile" },
  { label: "Time Off", icon: CalendarDays, href: "/employee/time-off" },
  { label: "My Goals", icon: Target, href: "/employee/goals" },
  { label: "My Learning", icon: GraduationCap, href: "/employee/learning" },
  { label: "My Reviews", icon: Star, href: "/employee/feedback" },
  { label: "My Benefits", icon: Heart, href: "/employee/benefits" },
  { label: "Payslips", icon: FileText, href: "/employee/payslips" },
  { label: "Announcements", icon: Megaphone, href: "/employee/dashboard" },
];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-[#FEFCF8] overflow-hidden">
      <aside className="w-[240px] flex flex-col border-r border-amber-100 bg-white" style={{ minWidth: 240 }}>
        <div className="flex items-center px-4 h-16 border-b border-amber-100">
          <Link href="/employee">
            <div className="flex items-center gap-2">
              <SaniLogo size={28} />
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-slate-900">SANI</span>
                <span className="text-[10px] font-medium text-amber-600 -mt-0.5">MY WORKSPACE</span>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href === "/app" && location === "/app/dashboard");
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative ${
                    isActive ? "bg-amber-50 text-amber-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {isActive && (
                    <motion.div layoutId="empActiveNav" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-500 rounded-r-full" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                  )}
                  <item.icon size={18} className={isActive ? "text-amber-600" : ""} />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-amber-100 space-y-1">
          <button onClick={() => logout()} className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full">
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center ring-2 ring-amber-50">
              <UserCircle size={20} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-slate-900">{user?.name || "Employee"}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || ""}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-amber-100 bg-white flex items-center justify-between px-6">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Search size={18} className="text-slate-400" />
            <input type="text" placeholder="Search..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell size={18} className="text-slate-500" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-[#FEFCF8]">
          {children}
        </main>
      </div>
    </div>
  );
}
