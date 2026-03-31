/*
 * Resources Page — Blog, guides, webinars, community
 * Design: Warm Machine / Organic Modernism
 */

import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import MarketingLayout from "@/components/MarketingLayout";
import {
  BookOpen,
  FileText,
  GraduationCap,
  MessageSquare,
  Headphones,
  BarChart3,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
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

const categories = [
  { icon: BookOpen, title: "Blog", desc: "HR insights, product updates, and thought leadership from our team.", count: "120+ articles", color: "bg-teal-50 text-teal-600" },
  { icon: FileText, title: "Guides & eBooks", desc: "In-depth resources on HR strategy, global payroll, compliance, and more.", count: "25+ guides", color: "bg-amber-50 text-amber-600" },
  { icon: GraduationCap, title: "Webinars", desc: "Live and on-demand sessions with HR leaders and industry experts.", count: "40+ sessions", color: "bg-purple-50 text-purple-600" },
  { icon: MessageSquare, title: "Community", desc: "Connect with 5,000+ HR professionals, share best practices, and get answers.", count: "5K+ members", color: "bg-rose-50 text-rose-600" },
  { icon: Headphones, title: "Help Center", desc: "Step-by-step guides, FAQs, and troubleshooting for every SANI feature.", count: "300+ articles", color: "bg-cyan-50 text-cyan-600" },
  { icon: BarChart3, title: "API Documentation", desc: "Developer resources, API reference, SDKs, and integration guides.", count: "Full REST API", color: "bg-emerald-50 text-emerald-600" },
];

const featuredPosts = [
  {
    title: "The Complete Guide to Global Payroll in 2026",
    excerpt: "Everything you need to know about running payroll across multiple countries, from tax compliance to currency management.",
    category: "Guide",
    readTime: "12 min read",
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop",
  },
  {
    title: "How AI is Transforming HR Operations",
    excerpt: "From predictive attrition to automated policy generation — discover how AI is reshaping people operations.",
    category: "Blog",
    readTime: "8 min read",
    img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
  },
  {
    title: "Building a Culture of Continuous Feedback",
    excerpt: "Why annual reviews are dead, and how to implement a modern performance management system your team will love.",
    category: "Blog",
    readTime: "6 min read",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop",
  },
];

export default function Resources() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/40 via-transparent to-teal-50/40 pointer-events-none" />
        <div className="container relative">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-sm font-medium mb-6">
              Resources
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl font-normal leading-[1.1] tracking-tight mb-6">
              Learn, grow, <span className="italic text-teal-600">succeed</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-sans">
              Explore our library of guides, blog posts, webinars, and developer resources to get the most out of SANI.
            </motion.p>
          </AnimatedSection>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {categories.map((cat) => (
              <AnimatedSection key={cat.title}>
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  onClick={() => toast("Feature coming soon")}
                  className="bg-white rounded-2xl p-7 border border-border/50 shadow-sm hover:shadow-lg transition-shadow duration-300 h-full cursor-pointer"
                >
                  <div className={`w-11 h-11 rounded-xl ${cat.color} flex items-center justify-center mb-5`}>
                    <cat.icon size={22} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 font-sans">{cat.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3">{cat.desc}</p>
                  <span className="text-xs font-medium text-teal-600">{cat.count}</span>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-24 bg-white">
        <div className="container">
          <AnimatedSection className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-normal tracking-tight mb-4">
              Featured <span className="italic text-teal-600">Content</span>
            </motion.h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {featuredPosts.map((post) => (
              <AnimatedSection key={post.title}>
                <motion.div
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  onClick={() => toast("Feature coming soon")}
                  className="bg-[#FEFCF8] rounded-2xl border border-border/50 shadow-sm hover:shadow-lg transition-shadow duration-300 h-full overflow-hidden cursor-pointer group"
                >
                  <div className="aspect-[3/2] overflow-hidden">
                    <img
                      src={post.img}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">{post.category}</span>
                      <span className="text-xs text-muted-foreground">{post.readTime}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 font-sans leading-snug">{post.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{post.excerpt}</p>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24">
        <div className="container">
          <AnimatedSection className="max-w-2xl mx-auto text-center">
            <motion.h2 variants={fadeUp} className="text-4xl font-normal tracking-tight mb-4">
              Stay <span className="italic text-teal-600">informed</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground mb-8">
              Get the latest HR insights, product updates, and best practices delivered to your inbox.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-white text-sm outline-none focus:ring-2 focus:ring-teal-200 transition-shadow"
              />
              <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-6" onClick={() => toast("Feature coming soon")}>
                Subscribe
              </Button>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </MarketingLayout>
  );
}
