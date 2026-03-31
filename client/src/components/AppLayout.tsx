/*
 * AppLayout — Persistent sidebar layout for the SANI app UI
 * Design: Warm Machine / Organic Modernism
 * - Warm cream sidebar with teal accents
 * - Rounded nav items with pill-shaped active indicator
 * - Avatar-forward user section
 */

import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Wallet,
  TrendingUp,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  Bell,
  Search,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SaniLogo } from "@/components/MarketingLayout";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/app/dashboard" },
  { label: "Employees", icon: Users, href: "/app/employees" },
  { label: "Payroll", icon: Wallet, href: "/app/payroll" },
  { label: "Performance", icon: TrendingUp, href: "/app/performance" },
  { label: "Analytics", icon: BarChart3, href: "/app/analytics" },
];

const bottomNavItems = [
  { label: "Settings", icon: Settings, href: "#" },
  { label: "Help", icon: HelpCircle, href: "#" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <SaniLogo size={32} />
                <span className="font-semibold text-lg tracking-tight text-warm-charcoal">SANI</span>
              </motion.div>
            </Link>
          )}
          {collapsed && (
            <Link href="/">
              <SaniLogo size={32} />
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-teal-50 transition-colors text-muted-foreground"
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
              <ChevronLeft size={18} />
            </motion.div>
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href === "/app/dashboard" && location === "/app");
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? "bg-teal-50 text-teal-700"
                      : "text-muted-foreground hover:bg-cream-dark hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-teal-600 rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon size={20} className={isActive ? "text-teal-600" : ""} />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom nav */}
        <div className="px-3 py-3 border-t border-border space-y-1">
          {bottomNavItems.map((item) => (
            <button
              key={item.label}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-cream-dark hover:text-foreground transition-all duration-200 w-full"
              onClick={() => toast("Feature coming soon")}
            >
              <item.icon size={20} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}

          {/* User */}
          <div className="flex items-center gap-3 px-3 py-2.5 mt-2">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
              alt="User"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-100"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Alex Chen</p>
                <p className="text-xs text-muted-foreground truncate">HR Admin</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-white/60 backdrop-blur-sm flex items-center justify-between px-6">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Search size={18} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search employees, reports, settings..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-cream-dark transition-colors">
              <Bell size={18} className="text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
