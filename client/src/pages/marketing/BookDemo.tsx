/*
 * Book a Demo Page — Lead capture form for SANI
 * Design: Warm Machine / Organic Modernism
 * No icons — uses styled typography, numbered elements, and brand imagery
 */

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import MarketingLayout from "@/components/MarketingLayout";
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

const companySizes = [
  "1–10 employees",
  "11–50 employees",
  "51–200 employees",
  "201–500 employees",
  "501–1,000 employees",
  "1,000+ employees",
];

const interests = [
  "Core HR",
  "Global Payroll",
  "Performance Management",
  "IT & Identity",
  "Analytics & AI",
  "Full Platform",
];

const benefits = [
  { num: "01", title: "Personalized walkthrough", desc: "See exactly how SANI solves your team's specific challenges with a tailored demo." },
  { num: "02", title: "Expert guidance", desc: "Our product specialists will answer every question and help you plan a smooth rollout." },
  { num: "03", title: "No commitment", desc: "Completely free, no strings attached. Just a conversation about what's possible." },
];

export default function BookDemo() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    jobTitle: "",
    companySize: "",
    interest: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.company) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success("Demo request submitted successfully!");
    }, 1500);
  };

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 via-transparent to-amber-50/30 pointer-events-none" />
        <div className="container relative">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium mb-6">
              Book a Demo
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl font-normal leading-[1.1] tracking-tight mb-6 font-serif">
              See SANI <span className="italic text-teal-600">in action</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Get a personalized demo tailored to your team's needs. Our product specialists will show you how SANI can transform your people operations.
            </motion.p>
          </AnimatedSection>
        </div>
      </section>

      {/* Form + Benefits */}
      <section className="pb-24">
        <div className="container">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 max-w-6xl mx-auto">

            {/* Left — Benefits */}
            <AnimatedSection className="lg:col-span-2 lg:pt-4">
              <motion.h2 variants={fadeUp} className="text-2xl font-normal tracking-tight mb-8 font-serif">
                What to <span className="italic text-teal-600">expect</span>
              </motion.h2>

              <div className="space-y-8">
                {benefits.map((b) => (
                  <motion.div key={b.num} variants={fadeUp} className="flex gap-4">
                    <span className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {b.num}
                    </span>
                    <div>
                      <h3 className="font-semibold text-sm mb-1 font-sans">{b.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div variants={fadeUp} className="mt-12 p-6 rounded-2xl bg-[#FEFCF8] border border-border/50">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  "The demo was incredibly thorough. Within 30 minutes, I understood exactly how SANI could replace our entire HR stack."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-xs">
                    JL
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Jessica Liu</p>
                    <p className="text-xs text-muted-foreground">VP of People, Meridian Health</p>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { value: "500+", label: "Companies" },
                  { value: "30 min", label: "Avg. demo" },
                  { value: "4.9/5", label: "Satisfaction" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-xl font-semibold text-teal-600">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </AnimatedSection>

            {/* Right — Form */}
            <AnimatedSection className="lg:col-span-3">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl border border-border/50 shadow-lg shadow-black/5 p-10 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6">
                    <span className="text-teal-600 text-2xl font-bold">✓</span>
                  </div>
                  <h3 className="text-2xl font-normal tracking-tight mb-3 font-serif">
                    Thank you, <span className="italic text-teal-600">{formData.firstName}!</span>
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-md mx-auto mb-8">
                    We've received your demo request. A product specialist will reach out to <strong className="text-foreground">{formData.email}</strong> within 24 hours to schedule your personalized walkthrough.
                  </p>
                  <div className="p-5 rounded-xl bg-[#FEFCF8] border border-border/50 max-w-sm mx-auto">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-semibold">What happens next</p>
                    <div className="space-y-3 text-left">
                      {[
                        "We'll confirm your demo time via email",
                        "You'll receive a brief questionnaire",
                        "Your specialist will prepare a tailored demo",
                      ].map((step, i) => (
                        <div key={step} className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-sm text-muted-foreground">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  variants={fadeUp}
                  onSubmit={handleSubmit}
                  className="bg-white rounded-2xl border border-border/50 shadow-lg shadow-black/5 p-8 sm:p-10"
                >
                  <h3 className="text-xl font-semibold mb-1 font-sans">Request your demo</h3>
                  <p className="text-sm text-muted-foreground mb-8">Fill in your details and we'll be in touch within 24 hours.</p>

                  <div className="grid sm:grid-cols-2 gap-5">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        First name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        placeholder="Jane"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#FEFCF8] text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors placeholder:text-muted-foreground/50"
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        Last name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        placeholder="Smith"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#FEFCF8] text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors placeholder:text-muted-foreground/50"
                      />
                    </div>

                    {/* Work Email */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-1.5">
                        Work email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="jane@company.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#FEFCF8] text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors placeholder:text-muted-foreground/50"
                      />
                    </div>

                    {/* Company */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        Company <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        required
                        placeholder="Acme Inc."
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#FEFCF8] text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors placeholder:text-muted-foreground/50"
                      />
                    </div>

                    {/* Job Title */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Job title</label>
                      <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        placeholder="VP of People"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#FEFCF8] text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors placeholder:text-muted-foreground/50"
                      />
                    </div>

                    {/* Company Size */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Company size</label>
                      <select
                        name="companySize"
                        value={formData.companySize}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#FEFCF8] text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors appearance-none"
                      >
                        <option value="">Select size</option>
                        {companySizes.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Interest */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Primary interest</label>
                      <select
                        name="interest"
                        value={formData.interest}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#FEFCF8] text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors appearance-none"
                      >
                        <option value="">Select interest</option>
                        {interests.map((i) => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>

                    {/* Message */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-1.5">Anything else we should know?</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Tell us about your current HR setup, pain points, or specific questions..."
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-[#FEFCF8] text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors resize-none placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-6 text-base shadow-lg shadow-teal-600/20 disabled:opacity-60"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      "Book My Free Demo"
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
                    By submitting this form, you agree to our{" "}
                    <a href="#" className="underline hover:text-foreground transition-colors">Privacy Policy</a>{" "}
                    and{" "}
                    <a href="#" className="underline hover:text-foreground transition-colors">Terms of Service</a>.
                  </p>
                </motion.form>
              )}
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-16 bg-white">
        <div className="container">
          <AnimatedSection className="text-center">
            <motion.p variants={fadeUp} className="text-sm text-muted-foreground uppercase tracking-widest mb-6 font-semibold">
              Trusted by forward-thinking companies
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-40">
              {["Meridian Health", "NovaTech", "Skyline Ventures", "Apex Digital", "Quantum Labs"].map((name) => (
                <span key={name} className="text-lg font-semibold tracking-tight">{name}</span>
              ))}
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </MarketingLayout>
  );
}
