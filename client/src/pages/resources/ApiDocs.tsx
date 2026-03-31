/*
 * API Docs — Developer documentation landing page
 * Design: Warm Machine / Organic Modernism
 */

import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import MarketingLayout from "@/components/MarketingLayout";

import { toast } from "sonner";

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

const endpoints = [
  { method: "GET", path: "/v1/employees", description: "List all employees with pagination and filters" },
  { method: "POST", path: "/v1/employees", description: "Create a new employee record" },
  { method: "GET", path: "/v1/payroll/runs", description: "List payroll runs with status and amounts" },
  { method: "POST", path: "/v1/payroll/runs", description: "Initiate a new payroll run" },
  { method: "GET", path: "/v1/time-off/requests", description: "List time-off requests with approval status" },
  { method: "GET", path: "/v1/analytics/headcount", description: "Get headcount analytics and trends" },
  { method: "POST", path: "/v1/webhooks", description: "Register a webhook for real-time events" },
  { method: "GET", path: "/v1/org-chart", description: "Get organizational hierarchy data" },
];

const methodColors: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-amber-100 text-amber-700",
  DELETE: "bg-rose-100 text-rose-700",
};

const codeExample = `curl -X GET "https://api.sani.io/v1/employees" \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json"

# Response
{
  "data": [
    {
      "id": "emp_01H8X...",
      "name": "Sarah Chen",
      "email": "sarah@company.com",
      "department": "Engineering",
      "status": "active"
    }
  ],
  "pagination": {
    "total": 247,
    "page": 1,
    "per_page": 25
  }
}`;

export default function ApiDocs() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <MarketingLayout>
      <section className="pt-28 pb-16 bg-gradient-to-b from-teal-50/40 via-[#FEFCF8] to-[#FEFCF8]">
        <div className="container text-center">
          <FadeIn>
            <span className="inline-block px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold tracking-wide uppercase mb-6">API Documentation</span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 font-serif">
              Build with <span className="text-teal-600 italic">SANI API</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              RESTful APIs with comprehensive documentation, SDKs, and webhooks to integrate SANI into your tech stack.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 h-12 text-base font-semibold">
                Get API Key →
              </Button>
              <Button variant="outline" className="rounded-xl px-8 h-12 text-base font-semibold border-2">
                View Full Docs
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Code example */}
      <section className="pb-16">
        <div className="container">
          <FadeIn>
            <div className="max-w-3xl mx-auto relative">
              <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border-b border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-xs text-gray-400 ml-2 font-mono">terminal</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(codeExample); toast.success("Copied to clipboard"); }}
                    className="ml-auto text-gray-400 hover:text-white transition-colors"
                  >
                    ⎘
                  </button>
                </div>
                <pre className="p-6 text-sm text-gray-300 font-mono overflow-x-auto leading-relaxed">
                  <code>{codeExample}</code>
                </pre>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Endpoints */}
      <section className="py-16 bg-white">
        <div className="container">
          <FadeIn>
            <h2 className="text-2xl font-bold font-serif mb-8 text-center">Popular Endpoints</h2>
          </FadeIn>
          <div className="max-w-3xl mx-auto space-y-2">
            {endpoints.map((ep, i) => (
              <FadeIn key={ep.path + ep.method} delay={i * 0.03}>
                <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-teal-50/50 transition-colors cursor-pointer group border border-transparent hover:border-border/50">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${methodColors[ep.method]}`}>
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono text-foreground flex-shrink-0">{ep.path}</code>
                  <span className="text-sm text-muted-foreground hidden md:block">{ep.description}</span>
                  <span className="ml-auto text-muted-foreground group-hover:text-teal-600 transition-colors flex-shrink-0">→</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SDKs */}
      <section className="py-16 bg-gradient-to-b from-[#FEFCF8] to-teal-50/30">
        <div className="container text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-serif mb-4">SDKs & Libraries</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">Official client libraries for your favorite language.</p>
          </FadeIn>
          <div className="flex flex-wrap items-center justify-center gap-4 max-w-2xl mx-auto">
            {["Node.js", "Python", "Ruby", "Go", "Java", "PHP", ".NET"].map((lang, i) => (
              <FadeIn key={lang} delay={i * 0.05}>
                <div className="px-6 py-3 bg-white rounded-xl border border-border/50 text-sm font-semibold hover:shadow-md hover:shadow-black/5 transition-all cursor-pointer hover:border-teal-200 hover:text-teal-600">
                  {lang}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
