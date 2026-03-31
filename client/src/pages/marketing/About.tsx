/*
 * About Page — Founder story of Prince Chafah Forchu Sani, company values with images
 * Design: Warm Machine / Organic Modernism — No icons, stylish images, creative layouts
 */

import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import MarketingLayout from "@/components/MarketingLayout";


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

const FOUNDER_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/founder-portrait-PovBLBHAcMLbu8QBL29mYG.webp";
const PEOPLE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/values-people-5qPw6QFvCBV7kMkKCJ6w2P.webp";
const INNOVATION_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/values-innovation-Jis58QrU3q8cw632EvnZBQ.webp";
const GLOBAL_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/values-global-TnUHgx4ukzMJkgyoSxdN8g.webp";
const OFFICE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/office-culture-4RZnhMQwwoCWypwrH2v2L2.webp";

const stats = [
  { value: "500+", label: "Companies" },
  { value: "100+", label: "Countries" },
  { value: "150K+", label: "Employees Managed" },
  { value: "99.9%", label: "Uptime" },
];

const team = [
  { name: "Prince Chafah Forchu Sani", role: "Founder & CEO", img: FOUNDER_IMG },
  { name: "Amara Johnson", role: "VP of Product", img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&crop=face" },
  { name: "Marcus Weber", role: "VP of Engineering", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face" },
  { name: "Priya Sharma", role: "VP of Sales", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face" },
  { name: "James Chen", role: "VP of Customer Success", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face" },
  { name: "Sofia Andersen", role: "Head of Design", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face" },
];

export default function About() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/40 via-transparent to-amber-50/30 pointer-events-none" />
        <div className="container relative">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium mb-6">
              About SANI
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl font-normal leading-[1.1] tracking-tight mb-6 font-serif">
              Born from frustration,{" "}
              <span className="italic text-teal-600">built with purpose</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              SANI was founded because managing people shouldn't require a dozen disconnected tools. One platform. Every team. Everywhere.
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
                  <p className="text-4xl font-semibold text-teal-600 mb-1">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Story — Asymmetric layout with large image */}
      <section className="py-24">
        <div className="container">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            <AnimatedSection className="lg:col-span-2">
              <motion.div variants={fadeUp} className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-teal-100/60 to-amber-100/40 rounded-3xl -z-10 rotate-2" />
                <img
                  src={FOUNDER_IMG}
                  alt="Prince Chafah Forchu Sani, Founder and CEO of SANI"
                  className="w-full rounded-2xl shadow-xl shadow-black/10 object-cover aspect-[3/4]"
                  loading="lazy"
                />
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl px-5 py-3 shadow-lg shadow-black/10 border border-border/50">
                  <p className="text-xs text-muted-foreground">Founder & CEO</p>
                  <p className="font-semibold text-sm">Prince Chafah Forchu Sani</p>
                </div>
              </motion.div>
            </AnimatedSection>

            <AnimatedSection className="lg:col-span-3">
              <motion.h2 variants={fadeUp} className="text-4xl font-normal tracking-tight mb-8 font-serif">
                Our <span className="italic text-teal-600">Story</span>
              </motion.h2>
              <motion.div variants={fadeUp} className="space-y-5 text-muted-foreground leading-relaxed">
                <p>
                  In early 2026, <strong className="text-foreground">Prince Chafah Forchu Sani</strong> was working as a Lead DevOps Engineer at a fast-growing ecommerce company in Copenhagen, Denmark. Every month, he watched the HR team struggle with a patchwork of disconnected tools — one for payroll, another for performance reviews, a third for IT provisioning, and spreadsheets filling the gaps between them.
                </p>
                <p>
                  The breaking point came during a rapid scaling phase. The company was hiring across five countries simultaneously, and the existing HR stack simply couldn't keep up. Onboarding took weeks instead of days. Payroll errors were constant. New hires in different time zones had wildly inconsistent experiences. Prince saw engineers spending hours on manual IT provisioning that should have been automated.
                </p>
                <p>
                  As a DevOps engineer, Prince understood infrastructure at scale. He knew that the same principles that made modern cloud platforms reliable — unified systems, automation, observability — could transform how companies manage their most important asset: their people. The problem wasn't that HR teams weren't working hard enough. The problem was that their tools were fundamentally broken.
                </p>
                <p>
                  So he started building. Nights and weekends at first, sketching out what a truly unified employee operating system would look like. Not another point solution. Not another integration layer. A single, natively integrated platform that handles everything from the moment someone accepts an offer letter to the day they retire — HR, payroll, IT, performance, and analytics, all speaking the same language.
                </p>
                <p>
                  <strong className="text-foreground">SANI was born in Copenhagen in 2026</strong>, named after the founder's own family name — a word that carries the meaning of clarity and purpose in his Cameroonian heritage. What started as a side project quickly attracted attention from HR leaders who were tired of the status quo. Today, SANI serves over 500 companies across 100+ countries, and we're just getting started.
                </p>
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values — Creative image-driven layout, no icons */}
      <section className="py-24 bg-white">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-normal tracking-tight mb-4 font-serif">
              Our <span className="italic text-teal-600">Values</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-xl mx-auto">
              The principles that guide everything we build and every decision we make.
            </motion.p>
          </AnimatedSection>

          {/* Value 1: People First */}
          <AnimatedSection className="max-w-6xl mx-auto mb-20">
            <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
              <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl">
                <img src={PEOPLE_IMG} alt="Team collaboration" className="w-full h-72 md:h-96 object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
              </motion.div>
              <motion.div variants={fadeUp} className="md:pl-6">
                <span className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-3 block">01</span>
                <h3 className="text-3xl font-normal tracking-tight mb-4 font-serif">People First</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  We build for the humans behind the data. Every feature starts with empathy, every design decision considers the person on the other side of the screen. Technology should serve people, not the other way around.
                </p>
              </motion.div>
            </div>
          </AnimatedSection>

          {/* Value 2: Relentless Innovation */}
          <AnimatedSection className="max-w-6xl mx-auto mb-20">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <motion.div variants={fadeUp} className="md:pr-6 order-2 md:order-1">
                <span className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-3 block">02</span>
                <h3 className="text-3xl font-normal tracking-tight mb-4 font-serif">Relentless Innovation</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  We push boundaries with AI and automation to make work simpler. We're not interested in incremental improvements — we want to fundamentally rethink how people operations work in the modern era.
                </p>
              </motion.div>
              <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl order-1 md:order-2">
                <img src={INNOVATION_IMG} alt="Innovation and technology" className="w-full h-72 md:h-96 object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
              </motion.div>
            </div>
          </AnimatedSection>

          {/* Value 3: Global by Default — Full-width with overlay */}
          <AnimatedSection className="max-w-6xl mx-auto mb-20">
            <motion.div variants={fadeUp} className="relative rounded-2xl overflow-hidden">
              <img src={GLOBAL_IMG} alt="Global team collaboration" className="w-full h-72 md:h-[28rem] object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <span className="text-xs font-semibold text-teal-300 uppercase tracking-widest mb-3 block">03</span>
                <h3 className="text-3xl font-normal tracking-tight mb-3 text-white font-serif">Global by Default</h3>
                <p className="text-white/80 leading-relaxed text-lg max-w-2xl">
                  Built for distributed teams from day one. 100+ countries, one platform. We believe the best talent is everywhere, and your tools should make it effortless to work across borders.
                </p>
              </div>
            </motion.div>
          </AnimatedSection>

          {/* Values 4, 5, 6 — Cards with top images */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <AnimatedSection>
              <motion.div variants={fadeUp} className="rounded-2xl overflow-hidden border border-border/50 bg-[#FEFCF8] h-full">
                <img src="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&h=300&fit=crop" alt="Security" className="w-full h-44 object-cover" loading="lazy" />
                <div className="p-6">
                  <span className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-2 block">04</span>
                  <h3 className="text-xl font-normal tracking-tight mb-2 font-serif">Trust & Security</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Enterprise-grade security with SOC 2 Type II, GDPR, and ISO 27001. Your data is your most sensitive asset — we treat it that way.
                  </p>
                </div>
              </motion.div>
            </AnimatedSection>

            <AnimatedSection>
              <motion.div variants={fadeUp} className="rounded-2xl overflow-hidden border border-border/50 bg-[#FEFCF8] h-full">
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=300&fit=crop" alt="Customer focus" className="w-full h-44 object-cover" loading="lazy" />
                <div className="p-6">
                  <span className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-2 block">05</span>
                  <h3 className="text-xl font-normal tracking-tight mb-2 font-serif">Customer Obsessed</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Our customers' success is our north star. We ship what matters, listen deeply, and iterate relentlessly based on real feedback.
                  </p>
                </div>
              </motion.div>
            </AnimatedSection>

            <AnimatedSection>
              <motion.div variants={fadeUp} className="rounded-2xl overflow-hidden border border-border/50 bg-[#FEFCF8] h-full">
                <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=300&fit=crop" alt="Inclusive culture" className="w-full h-44 object-cover" loading="lazy" />
                <div className="p-6">
                  <span className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-2 block">06</span>
                  <h3 className="text-xl font-normal tracking-tight mb-2 font-serif">Inclusive Culture</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Diversity drives better products. We build teams that reflect the world we serve, because different perspectives create better solutions.
                  </p>
                </div>
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Office / Culture — Full-bleed image */}
      <section className="py-0">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="relative">
            <img src={OFFICE_IMG} alt="SANI Copenhagen office" className="w-full h-64 md:h-96 object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
              <div className="container">
                <p className="text-white text-2xl md:text-4xl font-normal max-w-lg leading-snug font-serif">
                  Our home in <span className="italic">Copenhagen</span>, where it all started.
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatedSection>
      </section>

      {/* Leadership */}
      <section className="py-24">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-normal tracking-tight mb-4 font-serif">
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
                    loading="lazy"
                  />
                  <p className="font-semibold">{t.name}</p>
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
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-normal tracking-tight mb-6 font-serif">
              Join us in building the{" "}
              <span className="italic text-teal-600">future of work</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              We're hiring across engineering, product, design, sales, and more. Come build something meaningful.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-8 py-6 text-base shadow-lg shadow-teal-600/20">
                View Open Positions
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
