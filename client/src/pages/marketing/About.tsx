/*
 * About Page — Company story, values, team
 * Design: Warm Machine / Organic Modernism
 */

import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import MarketingLayout from "@/components/MarketingLayout";
import { ArrowRight, Globe, Users, Heart, Sparkles, Shield, Target } from "lucide-react";

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

const values = [
  { icon: Heart, title: "People First", desc: "We build for the humans behind the data. Every feature starts with empathy." },
  { icon: Sparkles, title: "Relentless Innovation", desc: "We push boundaries with AI and automation to make work simpler." },
  { icon: Globe, title: "Global by Default", desc: "Built for distributed teams from day one. 100+ countries, one platform." },
  { icon: Shield, title: "Trust & Security", desc: "Enterprise-grade security, SOC 2 Type II, GDPR, and ISO 27001 certified." },
  { icon: Target, title: "Customer Obsessed", desc: "Our customers' success is our north star. We ship what matters." },
  { icon: Users, title: "Inclusive Culture", desc: "Diversity drives better products. We build teams that reflect the world." },
];

const stats = [
  { value: "500+", label: "Companies" },
  { value: "100+", label: "Countries" },
  { value: "150K+", label: "Employees Managed" },
  { value: "99.9%", label: "Uptime" },
];

const team = [
  { name: "Sarah Mitchell", role: "CEO & Co-founder", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face" },
  { name: "David Park", role: "CTO & Co-founder", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" },
  { name: "Amara Johnson", role: "VP of Product", img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&crop=face" },
  { name: "Marcus Weber", role: "VP of Engineering", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face" },
  { name: "Priya Sharma", role: "VP of Sales", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face" },
  { name: "James Chen", role: "VP of Customer Success", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face" },
];

export default function About() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/40 via-transparent to-rose-50/30 pointer-events-none" />
        <div className="container relative">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium mb-6">
              About SANI
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl font-normal leading-[1.1] tracking-tight mb-6">
              Building the future of{" "}
              <span className="italic text-teal-600">work</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-sans">
              We started SANI because we believed that managing people shouldn't require a dozen disconnected tools. Our mission is to give every company — from startups to enterprises — a single, intelligent platform for their entire workforce.
            </motion.p>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((s) => (
              <AnimatedSection key={s.label}>
                <motion.div variants={fadeUp} className="text-center">
                  <p className="text-4xl font-semibold text-teal-600 font-sans mb-1">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24">
        <div className="container">
          <AnimatedSection className="max-w-3xl mx-auto">
            <motion.h2 variants={fadeUp} className="text-4xl font-normal tracking-tight mb-8 text-center">
              Our <span className="italic text-teal-600">Story</span>
            </motion.h2>
            <motion.div variants={fadeUp} className="space-y-5 text-muted-foreground leading-relaxed font-sans">
              <p>
                SANI was founded in 2022 by Sarah Mitchell and David Park, two former HR tech executives who saw firsthand how fragmented the people operations landscape had become. Companies were spending millions on dozens of disconnected tools — one for HR, another for payroll, yet another for IT provisioning — and none of them talked to each other.
              </p>
              <p>
                We set out to build something different: a single, natively integrated platform that handles everything from hiring to retirement. No more middleware. No more data silos. No more "integration maintenance" as a full-time job.
              </p>
              <p>
                Today, SANI serves over 500 companies across 100+ countries, managing more than 150,000 employees on our platform. We're backed by leading investors and growing rapidly — but we're just getting started.
              </p>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-white">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-normal tracking-tight mb-4">
              Our <span className="italic text-teal-600">Values</span>
            </motion.h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {values.map((v) => (
              <AnimatedSection key={v.title}>
                <motion.div variants={fadeUp} className="bg-[#FEFCF8] rounded-2xl p-7 border border-border/50 h-full">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5">
                    <v.icon size={22} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 font-sans">{v.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-24">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-normal tracking-tight mb-4">
              Leadership <span className="italic text-teal-600">Team</span>
            </motion.h2>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((t) => (
              <AnimatedSection key={t.name}>
                <motion.div variants={fadeUp} className="text-center">
                  <img
                    src={t.img}
                    alt={t.name}
                    className="w-28 h-28 rounded-2xl object-cover mx-auto mb-4 shadow-sm"
                  />
                  <p className="font-semibold font-sans">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
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
              Join us in building the{" "}
              <span className="italic text-teal-600">future of work</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              We're hiring across engineering, product, design, sales, and more.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-8 py-6 text-base shadow-lg shadow-teal-600/20">
                View Open Positions <ArrowRight size={18} className="ml-2" />
              </Button>
              <Link href="/">
                <Button variant="outline" size="lg" className="rounded-2xl px-8 py-6 text-base">
                  Back to Home
                </Button>
              </Link>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </MarketingLayout>
  );
}
