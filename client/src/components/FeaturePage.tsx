/*
 * FeaturePage — Reusable template for product feature pages
 * Design: Warm Machine / Organic Modernism
 * No icons — uses styled typography, numbered elements, and imagery instead
 */

import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import MarketingLayout from "@/components/MarketingLayout";

interface Feature {
  title: string;
  description: string;
}

interface FeaturePageProps {
  badge: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  screenshotUrl: string;
  screenshotAlt: string;
  features: Feature[];
  benefits: string[];
  ctaTitle?: string;
  ctaDescription?: string;
  videoUrl?: string;
}

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

export default function FeaturePage({
  badge,
  title,
  titleAccent,
  subtitle,
  screenshotUrl,
  screenshotAlt,
  features,
  benefits,
  ctaTitle = "Ready to transform your workflow?",
  ctaDescription = "Join thousands of companies using SANI to streamline their operations.",
  videoUrl,
}: FeaturePageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-teal-50/40 via-[#FEFCF8] to-[#FEFCF8]">
        <div className="container text-center">
          <FadeIn>
            <span className="inline-block px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold tracking-wide uppercase mb-6">
              {badge}
            </span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.1] mb-6 font-serif">
              {title}{" "}
              {titleAccent && (
                <span className="text-teal-600 italic">{titleAccent}</span>
              )}
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              {subtitle}
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="flex items-center justify-center gap-4">
              <Link href="/app">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 h-12 text-base font-semibold shadow-lg shadow-teal-600/20">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="rounded-xl px-8 h-12 text-base font-semibold border-2">
                  View Pricing
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Screenshot */}
      <section className="pb-20">
        <div className="container">
          <FadeIn>
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-b from-teal-200/20 to-amber-200/20 rounded-3xl blur-3xl -z-10 scale-105" />
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/10 border border-white/80">
                <img
                  src={screenshotUrl}
                  alt={screenshotAlt}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Video section (optional) */}
      {videoUrl && (
        <section className="pb-20">
          <div className="container">
            <FadeIn>
              <div className="max-w-4xl mx-auto text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-normal tracking-tight font-serif mb-3">
                  See it in <span className="italic text-teal-600">action</span>
                </h2>
                <p className="text-muted-foreground text-lg">
                  Watch how teams use SANI to streamline their daily workflows.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-black/10 border border-white/80">
                <video
                  src={videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-auto"
                />
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* Features Grid — numbered cards, no icons */}
      <section className="py-20 bg-white">
        <div className="container">
          <FadeIn>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight font-serif mb-4">
                Everything you need
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Powerful features designed to simplify your workflow and boost productivity.
              </p>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 0.05}>
                <div className="p-6 rounded-2xl bg-[#FEFCF8] border border-border/50 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 h-full group">
                  <span className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-3 block">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-base font-semibold mb-2 font-sans group-hover:text-teal-700 transition-colors">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits — styled list with teal bullets instead of icons */}
      <section className="py-20 bg-gradient-to-b from-[#FEFCF8] to-teal-50/30">
        <div className="container">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div>
                <h2 className="text-3xl md:text-4xl font-normal tracking-tight font-serif mb-6">
                  Why teams choose <span className="italic text-teal-600">SANI</span>
                </h2>
                <div className="space-y-4">
                  {benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {String.fromCharCode(97 + i)}
                      </span>
                      <p className="text-muted-foreground leading-relaxed">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="bg-white rounded-2xl p-8 border border-border/50 shadow-lg shadow-black/5">
                <div className="text-center">
                  <div className="text-5xl font-normal text-teal-600 font-serif mb-2">94%</div>
                  <p className="text-muted-foreground text-sm mb-6">customer satisfaction rate</p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-semibold font-serif">2,500+</div>
                      <p className="text-xs text-muted-foreground">Companies</p>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold font-serif">100+</div>
                      <p className="text-xs text-muted-foreground">Countries</p>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold font-serif">500K+</div>
                      <p className="text-xs text-muted-foreground">Employees managed</p>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold font-serif">99.9%</div>
                      <p className="text-xs text-muted-foreground">Uptime SLA</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA — no icons */}
      <section className="py-20 bg-white">
        <div className="container text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-normal tracking-tight font-serif mb-4">
              {ctaTitle}
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              {ctaDescription}
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/app">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 h-12 text-base font-semibold shadow-lg shadow-teal-600/20">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/book-demo">
                <Button variant="outline" className="rounded-xl px-8 h-12 text-base font-semibold border-2">
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </MarketingLayout>
  );
}
