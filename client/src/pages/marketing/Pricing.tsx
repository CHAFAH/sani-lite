/*
 * Pricing Page — Transparent pricing tiers
 * Design: Warm Machine / Organic Modernism
 * No icons — uses styled bullets and numbered elements
 */

import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import MarketingLayout from "@/components/MarketingLayout";
import { pricingTiers } from "@/lib/mockData";
import { toast } from "sonner";

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

const faqs = [
  { q: "Can I try SANI for free?", a: "Yes! Our Starter plan is free for teams up to 10 employees. No credit card required." },
  { q: "What happens when I exceed my plan limits?", a: "We'll notify you before you hit any limits. You can upgrade at any time with no data loss." },
  { q: "Do you offer annual billing discounts?", a: "Yes, annual billing saves you 20% compared to monthly billing on all paid plans." },
  { q: "Can I switch plans at any time?", a: "Absolutely. Upgrade or downgrade at any time. Changes take effect on your next billing cycle." },
  { q: "Is there a setup fee?", a: "No setup fees for Starter or Growth plans. Enterprise plans include dedicated onboarding at no extra cost." },
  { q: "Do you offer discounts for nonprofits?", a: "Yes, we offer 30% off for qualified nonprofit organizations. Contact our sales team to learn more." },
];

export default function Pricing() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 via-transparent to-amber-50/30 pointer-events-none" />
        <div className="container relative">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium mb-6">
              Pricing
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl font-normal leading-[1.1] tracking-tight mb-6 font-serif">
              Simple, <span className="italic text-teal-600">transparent</span> pricing
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-sans">
              Start free. Scale as you grow. No hidden fees, no surprises.
            </motion.p>
          </AnimatedSection>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 ${tier.highlighted ? "bg-teal-300" : "bg-teal-500"}`} />
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

          <AnimatedSection className="text-center mt-8">
            <motion.p variants={fadeUp} className="text-sm text-muted-foreground">
              All plans include 14-day free trial. No credit card required for Starter plan.
            </motion.p>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-normal tracking-tight mb-4 font-serif">
              Frequently asked <span className="italic text-teal-600">questions</span>
            </motion.h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, i) => (
              <AnimatedSection key={faq.q}>
                <motion.div variants={fadeUp} className="bg-[#FEFCF8] rounded-2xl p-6 border border-border/50 h-full">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold mb-2 font-sans">{faq.q}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
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
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-normal tracking-tight mb-6 font-serif">
              Ready to get <span className="italic text-teal-600">started?</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Join hundreds of companies that have simplified their HR stack with SANI.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/app">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl px-8 py-6 text-base shadow-lg shadow-teal-600/20">
                  Start Free Trial
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="rounded-2xl px-8 py-6 text-base" onClick={() => toast("Feature coming soon")}>
                Talk to Sales
              </Button>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </MarketingLayout>
  );
}
