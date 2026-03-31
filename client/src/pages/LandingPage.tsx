/*
 * LandingPage — Marketing website for SANI
 * Design: Warm Machine / Organic Modernism
 * Sections: Hero, Features, Comparison, Testimonials, Pricing, Footer
 */

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Users,
  Globe,
  Shield,
  Sparkles,
  BarChart3,
  Check,
  X,
  ArrowRight,
  ChevronRight,
  Star,
  Zap,
  Menu,
  XIcon,
} from "lucide-react";
import { testimonials, pricingTiers, comparisonData } from "@/lib/mockData";
import { useState } from "react";

// Image URLs
const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/hero-bg-6J7kdjgudLRhXVUiM5JTMp.webp";
const DASHBOARD_PREVIEW = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/dashboard-preview-eg8xb3WGfixWoqQjqSzH5A.webp";
const FEATURES_ABSTRACT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/features-abstract-KUEjcLAenh3xYBpvn3yAsn.webp";
const TESTIMONIAL_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/testimonial-bg-J72SxggiEweRRz5RxuC9pC.webp";
const PAYROLL_GLOBE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/payroll-globe-X5KLWv5LoyzXEGAiGL8cd5.webp";

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0, 0, 0.2, 1] as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// NAVBAR
// ============================================================
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        <Link href="/">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">SANI</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#comparison" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Compare</a>
          <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/app">
            <Button variant="ghost" size="sm" className="text-sm">
              Sign In
            </Button>
          </Link>
          <Link href="/app">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-5">
              Get Started
              <ArrowRight size={14} className="ml-1" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <XIcon size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden bg-white border-b border-border"
        >
          <div className="container py-4 space-y-3">
            <a href="#features" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#comparison" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>Compare</a>
            <a href="#testimonials" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>Testimonials</a>
            <a href="#pricing" className="block text-sm py-2" onClick={() => setMobileOpen(false)}>Pricing</a>
            <Link href="/app">
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl mt-2">
                Get Started
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

// ============================================================
// HERO
// ============================================================
function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img src={HERO_BG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
      </div>

      <div className="container relative">
        <AnimatedSection className="max-w-4xl mx-auto text-center">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium mb-8">
            <Sparkles size={14} />
            AI-Powered Employee Operating System
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-normal leading-[1.1] tracking-tight mb-6">
            The Employee OS{" "}
            <span className="italic text-teal-600">Built for</span>{" "}
            <br className="hidden sm:block" />
            Modern Teams
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            Replace HR, payroll, IT, and finance tools with one unified platform.
            Powered by AI. Built for global teams. Loved by people ops.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/app">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-8 py-6 text-base shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30 transition-all">
                Get Started Free
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="rounded-2xl px-8 py-6 text-base border-border hover:bg-white">
              Book a Demo
              <ChevronRight size={18} className="ml-1" />
            </Button>
          </motion.div>

          <motion.p variants={fadeUp} className="text-sm text-muted-foreground mt-4">
            No credit card required. Free for teams up to 10.
          </motion.p>
        </AnimatedSection>

        {/* Dashboard preview */}
        <AnimatedSection className="mt-16 max-w-5xl mx-auto">
          <motion.div
            variants={fadeUp}
            className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/10 border border-border/50"
          >
            <img
              src={DASHBOARD_PREVIEW}
              alt="SANI Dashboard"
              className="w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FEFCF8] via-transparent to-transparent opacity-20" />
          </motion.div>
        </AnimatedSection>

        {/* Trust bar */}
        <AnimatedSection className="mt-16 text-center">
          <motion.p variants={fadeUp} className="text-sm text-muted-foreground mb-6 font-medium uppercase tracking-wider">
            Trusted by forward-thinking companies
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-40">
            {["Meridian Health", "NovaTech", "Skyline Ventures", "Apex Digital", "Quantum Labs"].map((name) => (
              <span key={name} className="text-lg font-semibold tracking-tight">{name}</span>
            ))}
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ============================================================
// FEATURES
// ============================================================
const features = [
  {
    icon: Users,
    title: "Core HR",
    description: "Single source of truth for your entire workforce. Employee profiles, org charts, custom workflows, and document management — all in one place.",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: Globe,
    title: "Global Payroll",
    description: "Run payroll across 100+ countries from one dashboard. Native tax compliance, benefits administration, and payslip generation with zero third-party dependencies.",
    color: "bg-amber-50 text-amber-600",
    badge: "Key Differentiator",
  },
  {
    icon: Shield,
    title: "IT & Identity",
    description: "Manage devices, app provisioning, SSO, and access policies — all tied to your HR data. One platform for people and technology.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Sparkles,
    title: "AI Insights",
    description: "Predict employee churn, auto-generate policies, recommend promotions, and get smart workflow automation powered by machine learning.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Real-time dashboards, custom report builder, predictive analytics, and workforce forecasting tools that turn data into decisions.",
    color: "bg-cyan-50 text-cyan-600",
  },
  {
    icon: Zap,
    title: "Automation",
    description: "Build custom workflows for onboarding, promotions, offboarding, and more. Trigger actions based on events across the entire platform.",
    color: "bg-emerald-50 text-emerald-600",
  },
];

function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="container">
        <AnimatedSection className="text-center mb-16">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium mb-4">
            Platform
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-normal tracking-tight mb-4">
            One platform,{" "}
            <span className="italic text-teal-600">every tool</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop juggling disconnected systems. SANI brings HR, payroll, IT, and finance together in one beautifully integrated platform.
          </motion.p>
        </AnimatedSection>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <AnimatedSection key={feature.title}>
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative bg-white rounded-2xl p-7 border border-border/50 shadow-sm hover:shadow-lg transition-shadow duration-300 h-full"
              >
                {feature.badge && (
                  <span className="absolute top-4 right-4 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                    {feature.badge}
                  </span>
                )}
                <div className={`w-11 h-11 rounded-xl ${feature.color} flex items-center justify-center mb-5`}>
                  <feature.icon size={22} />
                </div>
                <h3 className="text-xl font-semibold mb-2 font-sans">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        {/* Feature visual */}
        <AnimatedSection className="mt-20 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={fadeUp}>
            <img
              src={FEATURES_ABSTRACT}
              alt="Integrated platform"
              className="w-full max-w-md mx-auto"
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <h3 className="text-3xl sm:text-4xl font-normal tracking-tight mb-4">
              Everything connects.{" "}
              <span className="italic text-teal-600">Natively.</span>
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              When an employee is promoted, their payroll updates automatically. When someone leaves, their devices are deprovisioned instantly. No integrations to maintain. No data silos to bridge.
            </p>
            <div className="space-y-3">
              {["Zero third-party integrations needed", "Real-time data sync across all modules", "Single audit trail for compliance"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-teal-600" />
                  </div>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatedSection>

        {/* Global Payroll highlight */}
        <AnimatedSection className="mt-24 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={fadeUp} className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium mb-4">
              <Globe size={14} />
              Key Differentiator
            </div>
            <h3 className="text-3xl sm:text-4xl font-normal tracking-tight mb-4">
              Global payroll,{" "}
              <span className="italic text-amber-600">built in.</span>
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Run payroll across 100+ countries from a single dashboard. Native tax compliance, automated benefits, and instant payslip generation — no third-party dependencies.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Countries", value: "100+" },
                { label: "Currencies", value: "50+" },
                { label: "Compliance Rate", value: "99.9%" },
                { label: "Avg. Processing", value: "< 24h" },
              ].map((stat) => (
                <div key={stat.label} className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                  <p className="text-2xl font-semibold text-amber-700 font-sans">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div variants={fadeUp} className="order-1 lg:order-2">
            <img
              src={PAYROLL_GLOBE}
              alt="Global payroll"
              className="w-full max-w-md mx-auto"
            />
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ============================================================
// COMPARISON
// ============================================================
function Comparison() {
  return (
    <section id="comparison" className="py-24 bg-white">
      <div className="container">
        <AnimatedSection className="text-center mb-16">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium mb-4">
            Compare
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-normal tracking-tight mb-4">
            SANI vs <span className="italic text-muted-foreground">HiBob</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See why teams are switching from point solutions to a unified platform.
          </motion.p>
        </AnimatedSection>

        <AnimatedSection className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="bg-[#FEFCF8] rounded-2xl border border-border overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 px-6 py-4 border-b border-border bg-cream-dark">
              <span className="text-sm font-medium text-muted-foreground">Feature</span>
              <span className="text-sm font-semibold text-teal-700 text-center">SANI</span>
              <span className="text-sm font-medium text-muted-foreground text-center">HiBob</span>
            </div>

            {/* Rows */}
            {comparisonData.map((row, i) => (
              <motion.div
                key={row.feature}
                variants={fadeUp}
                className={`grid grid-cols-3 px-6 py-3.5 items-center ${
                  i < comparisonData.length - 1 ? "border-b border-border/50" : ""
                }`}
              >
                <span className="text-sm font-medium">{row.feature}</span>
                <div className="flex justify-center">
                  {row.sani ? (
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                      <Check size={14} className="text-teal-600" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
                      <X size={14} className="text-red-400" />
                    </div>
                  )}
                </div>
                <div className="flex justify-center">
                  {row.hibob ? (
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                      <Check size={14} className="text-teal-600" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
                      <X size={14} className="text-red-400" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ============================================================
// TESTIMONIALS
// ============================================================
function Testimonials() {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <img src={TESTIMONIAL_BG} alt="" className="w-full h-full object-cover opacity-40" />
      </div>

      <div className="container relative">
        <AnimatedSection className="text-center mb-16">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium mb-4">
            Testimonials
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-normal tracking-tight mb-4">
            Loved by <span className="italic text-teal-600">people teams</span>
          </motion.h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <AnimatedSection key={i}>
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-7 border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground/80 flex-1 mb-6">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.author} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}, {t.company}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// PRICING
// ============================================================
function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="container">
        <AnimatedSection className="text-center mb-16">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium mb-4">
            Pricing
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-normal tracking-tight mb-4">
            Simple, <span className="italic text-teal-600">transparent</span> pricing
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free. Scale as you grow. No hidden fees, no surprises.
          </motion.p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingTiers.map((tier, i) => (
            <AnimatedSection key={tier.name}>
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className={`relative rounded-2xl p-7 border h-full flex flex-col ${
                  tier.highlighted
                    ? "bg-teal-600 text-white border-teal-600 shadow-xl shadow-teal-600/20"
                    : "bg-white border-border/50 shadow-sm"
                }`}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-1 rounded-full bg-amber-400 text-amber-900">
                    Most Popular
                  </span>
                )}

                <h3 className="text-xl font-semibold mb-2 font-sans">{tier.name}</h3>
                <p className={`text-sm mb-6 ${tier.highlighted ? "text-teal-100" : "text-muted-foreground"}`}>
                  {tier.description}
                </p>

                <div className="mb-6">
                  {tier.price ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-semibold font-sans">${tier.price}</span>
                      <span className={`text-sm ${tier.highlighted ? "text-teal-200" : "text-muted-foreground"}`}>
                        /employee/month
                      </span>
                    </div>
                  ) : (
                    <span className="text-4xl font-semibold font-sans">Custom</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check size={16} className={`mt-0.5 flex-shrink-0 ${tier.highlighted ? "text-teal-200" : "text-teal-600"}`} />
                      <span className={`text-sm ${tier.highlighted ? "text-teal-50" : ""}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full rounded-xl py-5 ${
                    tier.highlighted
                      ? "bg-white text-teal-700 hover:bg-teal-50"
                      : "bg-teal-600 hover:bg-teal-700 text-white"
                  }`}
                >
                  {tier.cta}
                </Button>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// CTA
// ============================================================
function CTA() {
  return (
    <section className="py-24">
      <div className="container">
        <AnimatedSection className="max-w-4xl mx-auto text-center">
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-normal tracking-tight mb-6">
            Ready to build a{" "}
            <span className="italic text-teal-600">better workplace?</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Join hundreds of companies that have replaced their HR stack with SANI.
            Start free, no credit card required.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/app">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-8 py-6 text-base shadow-lg shadow-teal-600/20">
                Get Started Free
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="rounded-2xl px-8 py-6 text-base">
              Talk to Sales
            </Button>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
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
              <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-lg tracking-tight">SANI</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Employee OS built for modern teams.
            </p>
          </div>

          {/* Links */}
          {[
            { title: "Product", links: ["Core HR", "Global Payroll", "IT & Identity", "Analytics", "AI Insights"] },
            { title: "Company", links: ["About", "Careers", "Blog", "Press", "Contact"] },
            { title: "Resources", links: ["Documentation", "API Reference", "Guides", "Community", "Status"] },
            { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Security", "GDPR", "Cookie Policy"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-4 font-sans">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </a>
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
// LANDING PAGE
// ============================================================
export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Comparison />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
