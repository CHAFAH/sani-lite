/*
 * LandingPage — Marketing website for SANI
 * Design: Warm Machine / Organic Modernism
 * Sections: Hero, Features, Testimonials, Pricing, CTA
 * No icons — uses numbered elements, styled typography, and images
 */

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import MarketingLayout from "@/components/MarketingLayout";
import { testimonials, pricingTiers } from "@/lib/mockData";

// Image URLs
const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/hero-bg-6J7kdjgudLRhXVUiM5JTMp.webp";
const DASHBOARD_PREVIEW = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/dashboard-preview-eg8xb3WGfixWoqQjqSzH5A.webp";
const FEATURES_ABSTRACT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/features-abstract-KUEjcLAenh3xYBpvn3yAsn.webp";
const TESTIMONIAL_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/testimonial-bg-J72SxggiEweRRz5RxuC9pC.webp";
const PAYROLL_GLOBE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/payroll-globe-X5KLWv5LoyzXEGAiGL8cd5.webp";
const PROMO_VIDEO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/sani-promo-video_b629459e.mp4";

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
// HERO
// ============================================================
function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
        style={{ backgroundImage: `url('${HERO_BG}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/80 via-transparent to-amber-50/60 pointer-events-none" />

      <div className="container relative">
        <AnimatedSection className="max-w-4xl mx-auto text-center">
          <motion.h1
            variants={fadeUp}
            className="text-6xl sm:text-7xl font-normal leading-[1.1] tracking-tight mb-6 font-serif"
          >
            The Employee OS <span className="italic text-teal-600">Built for</span> Modern Teams
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Replace HR, payroll, IT, and finance tools with one unified platform. Powered by AI. Built for global teams. Loved by people ops.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-8 py-6 text-base shadow-lg shadow-teal-600/20">
                Get Started Free
              </Button>
            </Link>
            <Link href="/book-demo">
              <Button variant="outline" size="lg" className="rounded-2xl px-8 py-6 text-base">
                Book a Demo
              </Button>
            </Link>
          </motion.div>
          <motion.p variants={fadeUp} className="text-sm text-muted-foreground mt-6">
            No credit card required. Free for teams up to 10 employees.
          </motion.p>
        </AnimatedSection>

        <AnimatedSection className="mt-20">
          <motion.div variants={fadeUp} className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img src={DASHBOARD_PREVIEW} alt="SANI Dashboard" className="w-full h-auto" />
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ============================================================
// FEATURES
// ============================================================
function Features() {
  const features = [
    {
      num: "01",
      title: "Core HR",
      desc: "Employee records, org charts, and self-service portals that scale with your team.",
    },
    {
      num: "02",
      title: "Global Payroll",
      desc: "Pay teams in 100+ countries. Compliance, tax, and currency handled automatically.",
    },
    {
      num: "03",
      title: "IT & Identity",
      desc: "Provisioning, SSO, and device management in one place.",
    },
    {
      num: "04",
      title: "Performance",
      desc: "Goals, reviews, and feedback loops that drive growth.",
    },
    {
      num: "05",
      title: "Analytics",
      desc: "Real-time insights into headcount, attrition, and workforce trends.",
    },
    {
      num: "06",
      title: "AI Copilot",
      desc: "Intelligent recommendations for hiring, retention, and compliance.",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-teal-50/30">
      <div className="container">
        <AnimatedSection className="text-center mb-20">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium mb-4">
            Platform
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-5xl sm:text-6xl font-normal tracking-tight mb-6 font-serif">
            Everything you need, <span className="italic text-teal-600">nothing you don't</span>
          </motion.h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((f) => (
            <AnimatedSection key={f.num}>
              <motion.div variants={fadeUp} className="bg-white rounded-2xl p-8 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl font-bold text-teal-600 mb-4 font-sans">{f.num}</div>
                <h3 className="text-xl font-semibold mb-3 font-sans">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection className="mt-20">
          <motion.div variants={fadeUp} className="relative rounded-3xl overflow-hidden shadow-xl">
            <img src={FEATURES_ABSTRACT} alt="Features" className="w-full h-auto" />
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
    <section className="py-24">
      <div className="container">
        <AnimatedSection className="text-center mb-16">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium mb-4">
            Testimonials
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-5xl sm:text-6xl font-normal tracking-tight mb-6 font-serif">
            Loved by <span className="italic text-teal-600">teams worldwide</span>
          </motion.h2>
        </AnimatedSection>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
          {testimonials.map((t) => (
            <AnimatedSection key={t.author}>
              <motion.div variants={fadeUp} className="bg-[#FEFCF8] rounded-2xl p-8 border border-border/50 h-full flex flex-col">
                <p className="text-muted-foreground mb-6 leading-relaxed flex-1">{t.quote}</p>
                <div>
                  <p className="font-semibold text-sm font-sans">{t.author}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
          <div className="flex gap-4 w-max">
            {testimonials.map((t) => (
              <motion.div
                key={t.author}
                variants={fadeUp}
                className="bg-[#FEFCF8] rounded-2xl p-8 border border-border/50 h-full flex flex-col flex-shrink-0 w-80 snap-center"
              >
                <p className="text-muted-foreground mb-6 leading-relaxed flex-1">{t.quote}</p>
                <div>
                  <p className="font-semibold text-sm font-sans">{t.author}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
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
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-normal tracking-tight mb-4 font-serif">
            Simple, <span className="italic text-teal-600">transparent</span> pricing
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free. Scale as you grow. No hidden fees, no surprises.
          </motion.p>
        </AnimatedSection>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
          {pricingTiers.map((tier) => (
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
                      <span className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 ${tier.highlighted ? "bg-teal-400" : "bg-teal-600"}`} />
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

        {/* Mobile Carousel */}
        <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
          <div className="flex gap-4 w-max">
            {pricingTiers.map((tier) => (
              <motion.div
                key={tier.name}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className={`relative rounded-2xl p-7 border h-full flex flex-col flex-shrink-0 w-80 snap-center ${
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
                      <span className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 ${tier.highlighted ? "bg-teal-400" : "bg-teal-600"}`} />
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// CTA — No icons
// ============================================================
function CTA() {
  return (
    <section className="py-24">
      <div className="container">
        <AnimatedSection className="max-w-4xl mx-auto text-center">
          <motion.h2 variants={fadeUp} className="text-5xl sm:text-6xl font-normal tracking-tight mb-6 font-serif">
            Ready to simplify your <span className="italic text-teal-600">HR stack?</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Join hundreds of teams that have replaced their HR, payroll, and IT tools with SANI.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-8 py-6 text-base shadow-lg shadow-teal-600/20">
                Get Started Free
              </Button>
            </Link>
            <Link href="/book-demo">
              <Button variant="outline" size="lg" className="rounded-2xl px-8 py-6 text-base">
                Book a Demo
              </Button>
            </Link>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ============================================================
// MAIN EXPORT
// ============================================================
export default function LandingPage() {
  return (
    <MarketingLayout>
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <CTA />
    </MarketingLayout>
  );
}
