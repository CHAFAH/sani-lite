/*
 * Help Center — Knowledge base and support
 * Design: Warm Machine / Organic Modernism
 */

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
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

const categories = [
  { title: "Getting Started", articles: 24, description: "Set up your account, invite team members, and configure your workspace.", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=260&fit=crop" },
  { title: "Core HR", articles: 38, description: "Employee records, org charts, document management, and more.", image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=260&fit=crop" },
  { title: "Payroll", articles: 42, description: "Running payroll, tax configuration, deductions, and reporting.", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=260&fit=crop" },
  { title: "Performance", articles: 19, description: "Reviews, goals, feedback, and calibration workflows.", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=260&fit=crop" },
  { title: "Integrations", articles: 31, description: "Connect SANI with Slack, Google, Microsoft, and 200+ tools.", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=260&fit=crop" },
  { title: "Security & Compliance", articles: 16, description: "SSO, permissions, data privacy, and audit logs.", image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=260&fit=crop" },
];

const popular = [
  "How to run your first payroll",
  "Setting up SSO with Okta or Azure AD",
  "Importing employees from a CSV file",
  "Configuring PTO policies and accruals",
  "Creating a custom workflow automation",
  "Understanding role-based permissions",
  "Connecting SANI to Slack",
  "Generating year-end tax reports",
];

export default function HelpCenter() {
  const [query, setQuery] = useState("");
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <MarketingLayout>
      <section className="pt-28 pb-16 bg-gradient-to-b from-teal-50/40 via-[#FEFCF8] to-[#FEFCF8]">
        <div className="container text-center">
          <FadeIn>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 font-serif">
              How can we <span className="text-teal-600 italic">help?</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="max-w-xl mx-auto relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">🔍</span>
              <input
                type="text"
                placeholder="Search for articles, guides, and tutorials..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-2xl border border-border bg-white text-base focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-lg shadow-black/5"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {categories.map((cat, i) => (
              <FadeIn key={cat.title} delay={i * 0.05}>
                <div className="bg-white rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-all duration-300 group cursor-pointer">
                  <img src={cat.image} alt={cat.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold group-hover:text-teal-600 transition-colors font-serif">{cat.title}</h3>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{cat.articles} articles</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{cat.description}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Popular articles */}
      <section className="py-16 bg-white">
        <div className="container">
          <FadeIn>
            <h2 className="text-2xl font-bold font-serif mb-8 text-center">Popular Articles</h2>
          </FadeIn>
          <div className="max-w-2xl mx-auto space-y-2">
            {popular.map((article, i) => (
              <FadeIn key={article} delay={i * 0.03}>
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-teal-50/50 transition-colors cursor-pointer group">
                  <span className="text-base group-hover:text-teal-600 transition-colors">{article}</span>
                  <span className="text-muted-foreground group-hover:text-teal-600 transition-colors">→</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Contact support */}
      <section className="py-20 bg-gradient-to-b from-[#FEFCF8] to-teal-50/30">
        <div className="container text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-serif mb-4">Still need help?</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">Our support team is available 24/7 to help you with any questions.</p>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 h-12 text-base font-semibold gap-2">
              Chat with Support
            </Button>
          </FadeIn>
        </div>
      </section>
    </MarketingLayout>
  );
}
