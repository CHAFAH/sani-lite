/*
 * AppLayout — Persistent sidebar layout for the SANI app UI
 * Design: Warm Machine / Organic Modernism
 */

import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Wallet, TrendingUp, BarChart3, Settings, HelpCircle,
  ChevronLeft, Bell, Search, CalendarDays, GitBranch, Globe, Receipt,
  Heart, Briefcase, GraduationCap, Star, DollarSign, Shield, ChevronDown,
  Building2, UserCircle,
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
    label: "Core",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/app/dashboard" },
      { label: "Employees", icon: Users, href: "/app/employees" },
      { label: "Self Service", icon: UserCircle, href: "/app/self-service" },
      { label: "Time Off", icon: CalendarDays, href: "/app/time-off" },
      { label: "Workflows", icon: GitBranch, href: "/app/workflows" },
      { label: "Announcements", icon: Bell, href: "/app/announcements" },
      { label: "Analytics", icon: BarChart3, href: "/app/analytics" },
    ],
  },
  {
    label: "Payroll Suite",
    items: [
      { label: "Global Payroll", icon: Globe, href: "/app/payroll" },
      { label: "Payroll Hub", icon: Receipt, href: "/app/payroll-hub" },
      { label: "Benefits", icon: Heart, href: "/app/benefits" },
    ],
  },
  {
    label: "Talent Suite",
    items: [
      { label: "Hiring", icon: Briefcase, href: "/app/hiring" },
      { label: "Learning", icon: GraduationCap, href: "/app/learning" },
      { label: "Performance", icon: Star, href: "/app/performance" },
      { label: "Compensation", icon: DollarSign, href: "/app/compensation" },
    ],
  },
];

const bottomNavItems = [
  { label: "Admin", icon: Shield, href: "/admin" },
  { label: "Settings", icon: Settings, href: "#" },
  { label: "Help", icon: HelpCircle, href: "#" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ Core: true, "Payroll Suite": true, "Talent Suite": true });
  const { user } = useAuth();

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex h-screen bg-[#FEFCF8] overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="flex flex-col border-r border-border bg-white/60 backdrop-blur-sm"
        style={{ minWidth: collapsed ? 72 : 260 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-border">
          {!collapsed && (
            <Link href="/">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <SaniLogo size={32} />
                <span className="font-semibold text-lg tracking-tight text-warm-charcoal">SANI</span>
              </motion.div>
            </Link>
          )}
          {collapsed && <Link href="/"><SaniLogo size={32} /></Link>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-teal-50 transition-colors text-muted-foreground">
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }}><ChevronLeft size={18} /></motion.div>
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-1">
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 hover:text-muted-foreground transition-colors"
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
                      const isActive = location === item.href || (item.href === "/app/dashboard" && location === "/app");
                      return (
                        <Link key={item.href} href={item.href}>
                          <motion.div
                            whileHover={{ x: 2 }}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative ${
                              isActive ? "bg-teal-50 text-teal-700" : "text-muted-foreground hover:bg-cream-dark hover:text-foreground"
                            }`}
                          >
                            {isActive && (
                              <motion.div layoutId="activeNav" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-teal-600 rounded-r-full" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                            )}
                            <item.icon size={18} className={isActive ? "text-teal-600" : ""} />
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

        {/* Bottom nav */}
        <div className="px-3 py-3 border-t border-border space-y-0.5">
          {bottomNavItems.map((item) => {
            if (item.href === "#") {
              return (
                <button key={item.label} className="flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:bg-cream-dark hover:text-foreground transition-all duration-200 w-full" onClick={() => toast("Feature coming soon")}>
                  <item.icon size={18} />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              );
            }
            return (
              <Link key={item.label} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${location === item.href ? "bg-teal-50 text-teal-700" : "text-muted-foreground hover:bg-cream-dark hover:text-foreground"}`}>
                  <item.icon size={18} />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </div>
              </Link>
            );
          })}

          {/* User */}
          <div className="flex items-center gap-3 px-3 py-2 mt-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center ring-2 ring-teal-50">
              <UserCircle size={20} className="text-teal-600" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-border bg-white/60 backdrop-blur-sm flex items-center justify-between px-6">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Search size={18} className="text-muted-foreground" />
            <input type="text" placeholder="Search employees, reports, settings..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-cream-dark transition-colors">
              <Bell size={18} className="text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
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
