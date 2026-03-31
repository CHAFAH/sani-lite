/*
 * MarketingLayout — Shared layout for all marketing pages
 * Design: Warm Machine / Organic Modernism
 * Features: HiBob-style mega dropdown navbar (text-only links) + footer + custom SANI logo
 */

import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";


// ============================================================
// SANI LOGO — Unique SVG mark
// ============================================================
export function SaniLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Rounded square background */}
      <rect width="48" height="48" rx="12" fill="#0D9488" />
      {/* Abstract "S" formed by two flowing arcs */}
      <path
        d="M14 16C14 16 18 10 28 14C38 18 32 24 24 24C16 24 10 30 20 34C30 38 34 32 34 32"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Accent dot — top right */}
      <circle cx="35" cy="13" r="3" fill="#FBBF24" />
    </svg>
  );
}

// ============================================================
// MEGA MENU DATA — text-only, no icons, no descriptions
// ============================================================
interface NavItem {
  label: string;
  href?: string;
  mega?: MegaMenu;
}

interface MegaMenu {
  columns: MegaColumn[];
  featured?: {
    title: string;
    description: string;
    linkText: string;
    href: string;
  };
}

interface MegaColumn {
  title: string;
  items: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    label: "Platform",
    mega: {
      columns: [
        {
          title: "Core",
          items: [
            { label: "Platform Overview", href: "/platform/overview" },
            { label: "Employee Self Service", href: "/platform/employee-self-service" },
            { label: "Data & Analytics", href: "/platform/data-analytics" },
            { label: "Workflows & Automation", href: "/platform/workflows" },
          ],
        },
        {
          title: "Payroll Suite",
          items: [
            { label: "Global Payroll", href: "/platform/global-payroll" },
            { label: "Payroll Hub", href: "/platform/payroll-hub" },
            { label: "Benefits Administration", href: "/platform/benefits" },
          ],
        },
        {
          title: "Talent Suite",
          items: [
            { label: "Hiring", href: "/platform/hiring" },
            { label: "Learning", href: "/platform/learning" },
            { label: "Performance", href: "/platform/performance" },
            { label: "Compensation", href: "/platform/compensation" },
          ],
        },
      ],
      featured: {
        title: "Use one platform to manage time, talent, performance, and culture.",
        description: "See how SANI brings everything together.",
        linkText: "Learn More",
        href: "/platform",
      },
    },
  },
  {
    label: "Solutions",
    mega: {
      columns: [
        {
          title: "By Role",
          items: [
            { label: "For HR Leaders", href: "/solutions/hr" },
            { label: "For Managers", href: "/solutions/managers" },
            { label: "For Employees", href: "/solutions/employees" },
            { label: "For Finance", href: "/solutions/finance" },
          ],
        },
        {
          title: "By Need",
          items: [
            { label: "Onboarding", href: "/solutions/startups" },
            { label: "Time & Attendance", href: "/solutions/enterprise" },
            { label: "Remote Teams", href: "/solutions/remote-teams" },
            { label: "Compliance", href: "/solutions/enterprise" },
          ],
        },
        {
          title: "By Industry",
          items: [
            { label: "Technology", href: "/solutions/startups" },
            { label: "Healthcare", href: "/solutions/enterprise" },
            { label: "Financial Services", href: "/solutions/finance" },
            { label: "Professional Services", href: "/solutions/enterprise" },
          ],
        },
      ],
    },
  },
  {
    label: "Resources",
    mega: {
      columns: [
        {
          title: "Learn",
          items: [
            { label: "Blog", href: "/resources/blog" },
            { label: "Guides & eBooks", href: "/resources/guides" },
            { label: "Webinars", href: "/resources/webinars" },
            { label: "Case Studies", href: "/resources/guides" },
          ],
        },
        {
          title: "Support",
          items: [
            { label: "Help Center", href: "/resources/help-center" },
            { label: "API Documentation", href: "/resources/api-docs" },
            { label: "Community", href: "/resources/help-center" },
            { label: "System Status", href: "/resources/help-center" },
          ],
        },
      ],
    },
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
];

// ============================================================
// MEGA DROPDOWN COMPONENT — clean text-only links
// ============================================================
function MegaDropdown({ menu, onClose }: { menu: MegaMenu; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute top-full left-0 right-0 bg-white border-b border-border shadow-xl shadow-black/5"
    >
      <div className="container py-8">
        <div className={`grid gap-8 ${menu.featured ? "grid-cols-[1fr_1fr_1fr_280px]" : `grid-cols-${menu.columns.length}`}`}>
          {menu.columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-600 mb-4 font-sans">
                {col.title}
              </h4>
              <div className="space-y-0.5">
                {col.items.map((item) => (
                  <Link key={item.label} href={item.href}>
                    <div
                      onClick={onClose}
                      className="block px-3 py-2 rounded-lg hover:bg-cream-dark transition-colors"
                    >
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {menu.featured && (
            <div className="bg-teal-50/50 rounded-2xl p-6 border border-teal-100">
              <p className="text-sm font-semibold text-foreground leading-snug mb-2">
                {menu.featured.title}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                {menu.featured.description}
              </p>
              <Link href={menu.featured.href}>
                <span
                  onClick={onClose}
                  className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-wide"
                >
                  {menu.featured.linkText}
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// NAVBAR
// ============================================================
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 150);
  };

  // Close on route change
  const [location] = useLocation();
  useEffect(() => {
    setActiveMenu(null);
    setMobileOpen(false);
  }, [location]);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border/50"
      onMouseLeave={handleMouseLeave}
    >
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2.5">
            <SaniLogo size={32} />
            <span className="font-semibold text-lg tracking-tight font-sans">SANI</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.mega && handleMouseEnter(item.label)}
            >
              {item.href ? (
                <Link href={item.href}>
                  <span className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg">
                    {item.label}
                  </span>
                </Link>
              ) : (
                <button
                  className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                    activeMenu === item.label ? "text-teal-700" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                  <span
                    className={`text-xs transition-transform duration-200 inline-block ${activeMenu === item.label ? "rotate-180" : ""}`}
                  >▾</span>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link href="/app">
            <Button variant="ghost" size="sm" className="text-sm font-medium">
              Login
            </Button>
          </Link>
          <Link href="/book-demo">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-5">
              Book a Demo
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <span className="text-xl leading-none">✕</span> : <span className="text-xl leading-none">☰</span>}
        </button>
      </div>

      {/* Mega dropdown */}
      <AnimatePresence>
        {activeMenu && navItems.find((n) => n.label === activeMenu)?.mega && (
          <MegaDropdown
            menu={navItems.find((n) => n.label === activeMenu)!.mega!}
            onClose={() => setActiveMenu(null)}
          />
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-border overflow-hidden"
          >
            <div className="container py-4 space-y-1">
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.href ? (
                    <Link href={item.href}>
                      <span
                        onClick={() => setMobileOpen(false)}
                        className="block text-sm font-medium py-3 px-3 rounded-lg hover:bg-cream-dark transition-colors"
                      >
                        {item.label}
                      </span>
                    </Link>
                  ) : (
                    <MobileAccordion item={item} onNavigate={() => setMobileOpen(false)} />
                  )}
                </div>
              ))}
              <div className="pt-3 border-t border-border mt-3">
                <Link href="/book-demo">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl">
                    Book a Demo
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function MobileAccordion({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  if (!item.mega) return null;
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-medium py-3 px-3 rounded-lg hover:bg-cream-dark transition-colors"
      >
        {item.label}
        <span className={`text-xs transition-transform inline-block ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pl-4 pb-2 space-y-4">
              {item.mega.columns.map((col) => (
                <div key={col.title}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-600 mb-2 px-3">
                    {col.title}
                  </p>
                  {col.items.map((link) => (
                    <Link key={link.label} href={link.href}>
                      <span
                        onClick={onNavigate}
                        className="block text-sm py-2 px-3 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// FOOTER
// ============================================================
function Footer() {
  return (
    <footer className="border-t border-border bg-white py-16">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <SaniLogo size={32} />
              <span className="font-semibold text-lg tracking-tight font-sans">SANI</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Employee OS built for modern teams.
            </p>
          </div>

          {/* Links */}
          {[
            { title: "Product", links: [
              { label: "Core HR", href: "/platform/overview" },
              { label: "Global Payroll", href: "/platform/global-payroll" },
              { label: "IT & Identity", href: "/platform/workflows" },
              { label: "Analytics", href: "/platform/data-analytics" },
              { label: "AI Insights", href: "/platform/overview" },
            ]},
            { title: "Company", links: [
              { label: "About", href: "/about" },
              { label: "Careers", href: "/about" },
              { label: "Blog", href: "/resources/blog" },
              { label: "Press", href: "/about" },
              { label: "Contact", href: "/about" },
            ]},
            { title: "Resources", links: [
              { label: "Documentation", href: "/resources/api-docs" },
              { label: "API Reference", href: "/resources/api-docs" },
              { label: "Guides", href: "/resources/guides" },
              { label: "Community", href: "/resources/help-center" },
              { label: "Status", href: "/resources/help-center" },
            ]},
            { title: "Legal", links: [
              { label: "Privacy Policy", href: "#" },
              { label: "Terms of Service", href: "#" },
              { label: "Security", href: "#" },
              { label: "GDPR", href: "#" },
              { label: "Cookie Policy", href: "#" },
            ]},
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-4 font-sans">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>
                      <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; 2026 SANI Technologies, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Twitter", "LinkedIn", "GitHub"].map((social) => (
              <a key={social} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// MARKETING LAYOUT
// ============================================================
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
