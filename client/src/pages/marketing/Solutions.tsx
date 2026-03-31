/*
 * Solutions Page — Role-based and need-based solutions
 * Design: Warm Machine / Organic Modernism
 */

import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import MarketingLayout from "@/components/MarketingLayout";
import {
  Users,
  Briefcase,
  Heart,
  Wallet,
  ArrowRight,
  Globe,
  Shield,
  Clock,
  Award,
  Building2,
  Zap,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0, 0, 0.2, 1] as const } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={stagger} className={className}>
      {children}
    </motion.div>
  );
}

const byRole = [
  { icon: Users, title: "For HR Leaders", desc: "Get complete visibility into your workforce. Automate admin tasks, ensure compliance, and focus on strategic initiatives that drive business outcomes.", color: "bg-teal-50 text-teal-600" },
  { icon: Briefcase, title: "For Managers", desc: "Access real-time team insights, run performance reviews, approve time-off requests, and manage your team's growth — all from one dashboard.", color: "bg-amber-50 text-amber-600" },
  { icon: Heart, title: "For Employees", desc: "Self-service portal for payslips, leave requests, benefits enrollment, learning paths, and career development. Everything in one place.", color: "bg-rose-50 text-rose-600" },
  { icon: Wallet, title: "For Finance", desc: "Real-time payroll analytics, cost forecasting, budget tracking, and automated expense management across all your entities.", color: "bg-purple-50 text-purple-600" },
];

const byNeed = [
  { icon: Award, title: "Onboarding", desc: "Automate the entire new hire journey — from offer letter to first day. Assign tasks, provision tools, and create memorable experiences." },
  { icon: Clock, title: "Time & Attendance", desc: "Track hours, manage shifts, handle PTO requests, and ensure labor law compliance across all locations." },
  { icon: Globe, title: "Remote Teams", desc: "Manage distributed workforces with location-aware policies, async workflows, and global compliance built in." },
  { icon: Shield, title: "Compliance", desc: "Stay ahead of regulations with automated compliance checks, audit trails, and country-specific policy templates." },
];

const industries = [
  { icon: Zap, title: "Technology", desc: "Scale fast with flexible workflows, equity management, and engineering-friendly tools." },
  { icon: Heart, title: "Healthcare", desc: "Manage credentialing, shift scheduling, and compliance for healthcare organizations." },
  { icon: Building2, title: "Financial Services", desc: "Meet regulatory requirements with robust audit trails and security controls." },
  { icon: Briefcase, title: "Professional Services", desc: "Track billable hours, manage project-based teams, and optimize utilization." },
];

export default function Solutions() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 via-transparent to-teal-50/40 pointer-events-none" />
        <div className="container relative">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium mb-6">
              Solutions
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl font-normal leading-[1.1] tracking-tight mb-6">
              Built for <span className="italic text-teal-600">every team</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
              Whether you're in HR, finance, management, or operations — SANI adapts to your role, your needs, and your industry.
            </motion.p>
          </AnimatedSection>
        </div>
      </section>

      {/* By Role */}
      <section className="py-24">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-normal tracking-tight mb-4">
              Solutions by <span className="italic text-teal-600">Role</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tailored experiences for every stakeholder in your organization.
            </motion.p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {byRole.map((item) => (
              <AnimatedSection key={item.title}>
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl p-8 border border-border/50 shadow-sm hover:shadow-lg transition-shadow duration-300 h-full"
                >
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-5`}>
                    <item.icon size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 font-sans">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* By Need */}
      <section className="py-24 bg-white">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-normal tracking-tight mb-4">
              Solutions by <span className="italic text-amber-600">Need</span>
            </motion.h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {byNeed.map((item) => (
              <AnimatedSection key={item.title}>
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-[#FEFCF8] rounded-2xl p-7 border border-border/50 shadow-sm hover:shadow-lg transition-shadow duration-300 h-full"
                >
                  <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5">
                    <item.icon size={22} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 font-sans">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* By Industry */}
      <section className="py-24">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-normal tracking-tight mb-4">
              Solutions by <span className="italic text-teal-600">Industry</span>
            </motion.h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {industries.map((item) => (
              <AnimatedSection key={item.title}>
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-lg transition-shadow duration-300 h-full text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 mx-auto">
                    <item.icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 font-sans">{item.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="container">
          <AnimatedSection className="max-w-4xl mx-auto text-center">
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-normal tracking-tight mb-6">
              Find the right <span className="italic text-teal-600">solution</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Talk to our team to discover how SANI can solve your specific challenges.
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
