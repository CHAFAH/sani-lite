/*
 * Platform Page — Product overview with feature details
 * Design: Warm Machine / Organic Modernism
 */

import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import MarketingLayout from "@/components/MarketingLayout";
import {
  Users,
  Globe,
  Shield,
  Sparkles,
  BarChart3,
  Zap,
  ArrowRight,
  Check,
  GraduationCap,
  Heart,
  Target,
  Wallet,
  Clock,
  Building2,
} from "lucide-react";

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
    <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={stagger} className={className}>
      {children}
    </motion.div>
  );
}

const FEATURES_ABSTRACT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/features-abstract-KUEjcLAenh3xYBpvn3yAsn.webp";
const PAYROLL_GLOBE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/payroll-globe-X5KLWv5LoyzXEGAiGL8cd5.webp";

const corePlatform = [
  { icon: Users, title: "Core HR", desc: "Single source of truth for your entire workforce. Employee profiles, org charts, custom workflows, and document management.", color: "bg-teal-50 text-teal-600" },
  { icon: Globe, title: "Global Payroll", desc: "Run payroll across 100+ countries from one dashboard. Native tax compliance, benefits administration, and payslip generation.", color: "bg-amber-50 text-amber-600", badge: "Key Differentiator" },
  { icon: Shield, title: "IT & Identity", desc: "Manage devices, app provisioning, SSO, and access policies — all tied to your HR data.", color: "bg-purple-50 text-purple-600" },
  { icon: Sparkles, title: "AI Insights", desc: "Predict employee churn, auto-generate policies, recommend promotions, and get smart workflow automation.", color: "bg-rose-50 text-rose-600" },
  { icon: BarChart3, title: "Analytics", desc: "Real-time dashboards, custom report builder, predictive analytics, and workforce forecasting tools.", color: "bg-cyan-50 text-cyan-600" },
  { icon: Zap, title: "Automation", desc: "Build custom workflows for onboarding, promotions, offboarding, and more.", color: "bg-emerald-50 text-emerald-600" },
];

const talentSuite = [
  { icon: Target, title: "Hiring", desc: "End-to-end recruiting from job posting to offer letter. ATS, interview scheduling, and candidate scoring." },
  { icon: GraduationCap, title: "Learning", desc: "Create learning paths, assign courses, and track skill development across your organization." },
  { icon: Heart, title: "Performance", desc: "Goal setting, OKRs, 360-degree reviews, and continuous feedback in one unified system." },
  { icon: Wallet, title: "Compensation", desc: "Salary benchmarking, equity management, and total rewards planning with real-time market data." },
];

const payrollStats = [
  { label: "Countries", value: "100+" },
  { label: "Currencies", value: "50+" },
  { label: "Compliance Rate", value: "99.9%" },
  { label: "Avg. Processing", value: "< 24h" },
];

export default function Platform() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/60 via-transparent to-amber-50/40 pointer-events-none" />
        <div className="container relative">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium mb-6">
              Platform
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl font-normal leading-[1.1] tracking-tight mb-6">
              One platform for{" "}
              <span className="italic text-teal-600">everything</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
              HR, payroll, IT, talent, and finance — all natively integrated. No more juggling disconnected tools.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/app">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-8 py-6 text-base shadow-lg shadow-teal-600/20">
                  Get Started Free <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="rounded-2xl px-8 py-6 text-base">
                Watch Demo
              </Button>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Core Platform */}
      <section className="py-24">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-normal tracking-tight mb-4">
              Core <span className="italic text-teal-600">Platform</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your workforce, from hire to retire.
            </motion.p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {corePlatform.map((f) => (
              <AnimatedSection key={f.title}>
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="relative bg-white rounded-2xl p-7 border border-border/50 shadow-sm hover:shadow-lg transition-shadow duration-300 h-full"
                >
                  {f.badge && (
                    <span className="absolute top-4 right-4 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                      {f.badge}
                    </span>
                  )}
                  <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-5`}>
                    <f.icon size={22} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 font-sans">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Everything connects */}
      <section className="py-24 bg-white">
        <div className="container">
          <AnimatedSection className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp}>
              <img src={FEATURES_ABSTRACT} alt="Integrated platform" className="w-full max-w-md mx-auto" />
            </motion.div>
            <motion.div variants={fadeUp}>
              <h2 className="text-3xl sm:text-4xl font-normal tracking-tight mb-4">
                Everything connects.{" "}
                <span className="italic text-teal-600">Natively.</span>
              </h2>
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
        </div>
      </section>

      {/* Global Payroll */}
      <section className="py-24">
        <div className="container">
          <AnimatedSection className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium mb-4">
                <Globe size={14} />
                Key Differentiator
              </div>
              <h2 className="text-3xl sm:text-4xl font-normal tracking-tight mb-4">
                Global payroll,{" "}
                <span className="italic text-amber-600">built in.</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Run payroll across 100+ countries from a single dashboard. Native tax compliance, automated benefits, and instant payslip generation — no third-party dependencies.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {payrollStats.map((stat) => (
                  <div key={stat.label} className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                    <p className="text-2xl font-semibold text-amber-700 font-sans">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div variants={fadeUp}>
              <img src={PAYROLL_GLOBE} alt="Global payroll" className="w-full max-w-md mx-auto" />
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Talent Suite */}
      <section className="py-24 bg-white">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-normal tracking-tight mb-4">
              Talent <span className="italic text-teal-600">Suite</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Attract, develop, and retain top talent with integrated tools.
            </motion.p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {talentSuite.map((f) => (
              <AnimatedSection key={f.title}>
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-[#FEFCF8] rounded-2xl p-7 border border-border/50 shadow-sm hover:shadow-lg transition-shadow duration-300 h-full"
                >
                  <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5">
                    <f.icon size={22} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 font-sans">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container">
          <AnimatedSection className="max-w-4xl mx-auto text-center">
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-normal tracking-tight mb-6">
              Ready to see the{" "}
              <span className="italic text-teal-600">full platform?</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Start free and explore every feature. No credit card required.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/app">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-8 py-6 text-base shadow-lg shadow-teal-600/20">
                  Get Started Free <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="rounded-2xl px-8 py-6 text-base">
                Talk to Sales
              </Button>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </MarketingLayout>
  );
}
