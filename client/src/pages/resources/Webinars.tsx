/*
 * Webinars — Upcoming and recorded webinars
 * Design: Warm Machine / Organic Modernism
 */

import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
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

const upcoming = [
  { date: "Apr 15, 2026", time: "2:00 PM EST", title: "Global Payroll Masterclass: Scaling to 50+ Countries", speaker: "Sarah Chen, VP of Payroll Operations", spots: 124 },
  { date: "Apr 22, 2026", time: "11:00 AM EST", title: "Building a Data-Driven HR Strategy in 2026", speaker: "Marcus Williams, Chief People Officer", spots: 89 },
  { date: "May 6, 2026", time: "1:00 PM EST", title: "The Future of Performance Management", speaker: "Dr. Elena Rodriguez, Organizational Psychologist", spots: 156 },
];

const recorded = [
  { title: "How to Automate 80% of Your HR Workflows", duration: "45 min", views: "2.3K", image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=340&fit=crop" },
  { title: "Pay Transparency: Preparing for 2026 Regulations", duration: "38 min", views: "1.8K", image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=340&fit=crop" },
  { title: "Remote Onboarding Done Right: A Live Demo", duration: "52 min", views: "3.1K", image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=340&fit=crop" },
  { title: "People Analytics: From Data to Action", duration: "41 min", views: "1.5K", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop" },
  { title: "Designing Benefits That Attract Gen Z Talent", duration: "35 min", views: "2.0K", image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=340&fit=crop" },
  { title: "SANI Product Deep Dive: What's New in Q1 2026", duration: "48 min", views: "4.2K", image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=340&fit=crop" },
];

export default function Webinars() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <MarketingLayout>
      <section className="pt-28 pb-16 bg-gradient-to-b from-teal-50/40 via-[#FEFCF8] to-[#FEFCF8]">
        <div className="container text-center">
          <FadeIn>
            <span className="inline-block px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold tracking-wide uppercase mb-6">Webinars</span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 font-serif">
              Learn from <span className="text-teal-600 italic">the experts</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Live sessions and on-demand recordings from HR leaders and SANI product experts.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Upcoming */}
      <section className="pb-16">
        <div className="container">
          <FadeIn>
            <h2 className="text-2xl font-bold font-serif mb-8">Upcoming Webinars</h2>
          </FadeIn>
          <div className="space-y-4 max-w-4xl">
            {upcoming.map((webinar, i) => (
              <FadeIn key={webinar.title} delay={i * 0.05}>
                <div className="bg-white rounded-2xl border border-border/50 p-6 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-shrink-0 text-center md:text-left md:w-32">
                    <div className="text-sm font-semibold text-teal-600">{webinar.date}</div>
                    <div className="text-xs text-muted-foreground">{webinar.time}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold font-serif mb-1">{webinar.title}</h3>
                    <p className="text-sm text-muted-foreground">{webinar.speaker}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{webinar.spots} spots left</span>
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-5 text-sm">
                      Register →
                    </Button>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Recorded */}
      <section className="py-16 bg-white">
        <div className="container">
          <FadeIn>
            <h2 className="text-2xl font-bold font-serif mb-8">On-Demand Recordings</h2>
          </FadeIn>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recorded.map((webinar, i) => (
              <FadeIn key={webinar.title} delay={i * 0.05}>
                <div className="bg-[#FEFCF8] rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-all duration-300 group cursor-pointer">
                  <div className="relative overflow-hidden">
                    <img src={webinar.image} alt={webinar.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center text-teal-600 text-2xl font-bold">
                        ▶
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold mb-2 group-hover:text-teal-600 transition-colors font-serif">{webinar.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{webinar.duration}</span>
                      <span>&middot;</span>
                      <span>{webinar.views} views</span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
