/*
 * Guides — Downloadable resource guides
 * Design: Warm Machine / Organic Modernism
 */

import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import MarketingLayout from "@/components/MarketingLayout";


function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

const guides = [
  { category: "Payroll", title: "Global Payroll Implementation Playbook", description: "A step-by-step guide to rolling out payroll in new countries, including compliance checklists and vendor evaluation criteria.", pages: 42 },
  { category: "HR Strategy", title: "The Modern HR Tech Stack Guide", description: "How to evaluate, select, and implement HR technology that scales with your organization.", pages: 36 },
  { category: "Compliance", title: "Employee Data Privacy Handbook", description: "Navigate GDPR, CCPA, and global privacy regulations with practical templates and checklists.", pages: 28 },
  { category: "Performance", title: "Building a Continuous Feedback Culture", description: "Frameworks and templates for replacing annual reviews with ongoing performance conversations.", pages: 24 },
  { category: "Onboarding", title: "The Ultimate Onboarding Checklist", description: "A comprehensive 90-day onboarding plan with templates for remote and in-office employees.", pages: 18 },
  { category: "Compensation", title: "Pay Equity Analysis Toolkit", description: "Statistical methods, templates, and best practices for conducting pay equity audits.", pages: 32 },
  { category: "Analytics", title: "People Analytics Starter Kit", description: "Key metrics, dashboard templates, and data governance frameworks for HR analytics.", pages: 26 },
  { category: "Benefits", title: "Open Enrollment Communication Guide", description: "Email templates, timeline, and best practices for running a smooth open enrollment.", pages: 20 },
];

const colors: Record<string, string> = {
  Payroll: "bg-teal-100 text-teal-700",
  "HR Strategy": "bg-amber-100 text-amber-700",
  Compliance: "bg-rose-100 text-rose-700",
  Performance: "bg-violet-100 text-violet-700",
  Onboarding: "bg-blue-100 text-blue-700",
  Compensation: "bg-emerald-100 text-emerald-700",
  Analytics: "bg-orange-100 text-orange-700",
  Benefits: "bg-pink-100 text-pink-700",
};

export default function Guides() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <MarketingLayout>
      <section className="pt-28 pb-16 bg-gradient-to-b from-teal-50/40 via-[#FEFCF8] to-[#FEFCF8]">
        <div className="container text-center">
          <FadeIn>
            <span className="inline-block px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold tracking-wide uppercase mb-6">Guides & Templates</span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 font-serif">
              Free resources to <span className="text-teal-600 italic">level up</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Downloadable guides, templates, and toolkits created by HR experts.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="pb-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {guides.map((guide, i) => (
              <FadeIn key={guide.title} delay={i * 0.05}>
                <div className="bg-white rounded-2xl border border-border/50 p-6 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 group cursor-pointer h-full flex flex-col">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0 text-teal-600 font-serif text-xl font-bold">
                      PDF
                    </div>
                    <div className="flex-1">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide mb-2 ${colors[guide.category] || "bg-gray-100 text-gray-700"}`}>
                        {guide.category}
                      </span>
                      <h3 className="text-lg font-bold group-hover:text-teal-600 transition-colors font-serif">{guide.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 flex-1 leading-relaxed">{guide.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{guide.pages} pages</span>
                    <Button variant="outline" size="sm" className="rounded-lg text-xs gap-1.5 group-hover:bg-teal-50 group-hover:text-teal-700 group-hover:border-teal-200 transition-colors">
                      ↓ Download PDF
                    </Button>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-serif mb-4">Need a custom guide?</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">Our team can create tailored resources for your specific industry or use case.</p>
            <Link href="/about">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 h-12 text-base font-semibold">
                Contact Us →
              </Button>
            </Link>
          </FadeIn>
        </div>
      </section>
    </MarketingLayout>
  );
}
