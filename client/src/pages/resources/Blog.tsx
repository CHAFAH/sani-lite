/*
 * Blog — Resource hub with article cards
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

const articles = [
  { category: "Payroll", title: "The Complete Guide to Global Payroll in 2026", excerpt: "Everything you need to know about running compliant payroll across multiple countries.", readTime: "8 min", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop" },
  { category: "HR Strategy", title: "How to Build a People-First Culture in Remote Teams", excerpt: "Practical strategies for maintaining culture and engagement in distributed organizations.", readTime: "6 min", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop" },
  { category: "Performance", title: "Why Annual Reviews Are Dead (And What to Do Instead)", excerpt: "The shift to continuous feedback and how leading companies are making it work.", readTime: "5 min", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop" },
  { category: "Compliance", title: "GDPR and Employee Data: A Practical Compliance Guide", excerpt: "How to handle employee data under GDPR without slowing down your HR operations.", readTime: "7 min", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop" },
  { category: "Hiring", title: "Reducing Time-to-Hire by 40%: A Case Study", excerpt: "How a 500-person company transformed their hiring process with SANI.", readTime: "4 min", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop" },
  { category: "Analytics", title: "5 People Analytics Metrics Every CHRO Should Track", excerpt: "The key workforce metrics that drive strategic decisions at the executive level.", readTime: "6 min", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop" },
  { category: "Benefits", title: "Designing a Benefits Package That Actually Attracts Talent", excerpt: "Beyond health insurance: creative benefits strategies for the modern workforce.", readTime: "5 min", image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=400&fit=crop" },
  { category: "Automation", title: "10 HR Workflows You Should Automate Today", excerpt: "Stop wasting time on repetitive tasks. Here are the workflows with the biggest ROI.", readTime: "7 min", image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&h=400&fit=crop" },
  { category: "Compensation", title: "Pay Transparency Laws: What You Need to Know in 2026", excerpt: "A state-by-state guide to pay transparency requirements and how to prepare.", readTime: "9 min", image: "https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=600&h=400&fit=crop" },
];

export default function Blog() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <MarketingLayout>
      <section className="pt-28 pb-16 bg-gradient-to-b from-teal-50/40 via-[#FEFCF8] to-[#FEFCF8]">
        <div className="container text-center">
          <FadeIn>
            <span className="inline-block px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold tracking-wide uppercase mb-6">Blog</span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 font-serif">
              Insights for <span className="text-teal-600 italic">modern teams</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Expert perspectives on HR, payroll, performance, and building great workplaces.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="pb-20">
        <div className="container">
          {/* Featured article */}
          <FadeIn>
            <div className="grid md:grid-cols-2 gap-8 mb-12 bg-white rounded-2xl border border-border/50 overflow-hidden shadow-lg shadow-black/5">
              <img src={articles[0].image} alt={articles[0].title} className="w-full h-64 md:h-full object-cover" loading="lazy" />
              <div className="p-8 flex flex-col justify-center">
                <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-3">{articles[0].category}</span>
                <h2 className="text-2xl md:text-3xl font-bold font-serif mb-4">{articles[0].title}</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">{articles[0].excerpt}</p>
                <div className="flex items-center gap-4">
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-6">
                    Read Article →
                  </Button>
                  <span className="text-sm text-muted-foreground">⏱ {articles[0].readTime}</span>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Article grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.slice(1).map((article, i) => (
              <FadeIn key={article.title} delay={i * 0.05}>
                <div className="bg-white rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-all duration-300 group cursor-pointer h-full flex flex-col">
                  <div className="overflow-hidden">
                    <img src={article.image} alt={article.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-2">{article.category}</span>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-teal-600 transition-colors font-serif">{article.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">{article.excerpt}</p>
                    <span className="text-xs text-muted-foreground">⏱ {article.readTime}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-white">
        <div className="container text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-serif mb-4">Stay in the loop</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">Get the latest HR insights delivered to your inbox every week.</p>
            <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
              <input type="email" placeholder="Enter your email" className="flex-1 h-12 px-4 rounded-xl border border-border bg-[#FEFCF8] text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-6 h-12">Subscribe</Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </MarketingLayout>
  );
}
