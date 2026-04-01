import MarketingLayout from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useRef, useEffect } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const pricingTiers = [
  {
    name: "Starter",
    description: "Perfect for small teams getting started",
    price: "$49",
    period: "/month",
    features: [
      "Up to 50 employees",
      "Core HR management",
      "Basic payroll (US only)",
      "Employee self-service portal",
      "Email support",
      "Mobile app access",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Growth",
    description: "For scaling teams with global needs",
    price: "$199",
    period: "/month",
    features: [
      "Up to 500 employees",
      "Global payroll (100+ countries)",
      "Advanced analytics & reporting",
      "Performance management",
      "Learning & development tools",
      "Priority support",
      "API access",
      "Custom integrations",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "For large organizations with custom needs",
    price: "Custom",
    period: "pricing",
    features: [
      "Unlimited employees",
      "Full global payroll suite",
      "Advanced security & compliance",
      "Dedicated account manager",
      "Custom workflows & automation",
      "24/7 phone support",
      "On-premise deployment option",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function Pricing() {
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = 320;
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <MarketingLayout>
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FEFCF8] to-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h1 className="text-5xl sm:text-6xl font-serif font-normal tracking-tight mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your team. All plans include a 14-day free trial with full access to all features.
            </p>
          </motion.div>

          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-3 gap-8 mb-12">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`h-full flex flex-col transition-all duration-300 ${
                    tier.highlighted
                      ? "border-teal-600 shadow-xl scale-105 bg-gradient-to-br from-teal-50 to-white"
                      : "hover:shadow-lg"
                  }`}
                >
                  {tier.highlighted && (
                    <div className="bg-teal-600 text-white text-center py-2 text-sm font-semibold rounded-t-lg">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground ml-2">{tier.period}</span>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <span className="inline-block w-5 h-5 rounded-full bg-teal-100 text-teal-600 text-xs flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                            ✓
                          </span>
                          <span className="text-sm text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => setLocation("/book-demo")}
                      className={`w-full ${
                        tier.highlighted
                          ? "bg-teal-600 hover:bg-teal-700 text-white"
                          : "bg-teal-100 hover:bg-teal-200 text-teal-900"
                      }`}
                    >
                      {tier.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden">
            <div className="relative">
              <div
                ref={containerRef}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4"
                style={{ scrollBehavior: "smooth" }}
              >
                {pricingTiers.map((tier, index) => (
                  <motion.div
                    key={tier.name}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex-shrink-0 w-full sm:w-80 snap-start"
                  >
                    <Card
                      className={`h-full flex flex-col transition-all duration-300 ${
                        tier.highlighted
                          ? "border-teal-600 shadow-xl bg-gradient-to-br from-teal-50 to-white"
                          : "hover:shadow-lg"
                      }`}
                    >
                      {tier.highlighted && (
                        <div className="bg-teal-600 text-white text-center py-2 text-sm font-semibold rounded-t-lg">
                          Most Popular
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-2xl">{tier.name}</CardTitle>
                        <CardDescription>{tier.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <div className="mb-6">
                          <span className="text-4xl font-bold">{tier.price}</span>
                          <span className="text-muted-foreground ml-2">{tier.period}</span>
                        </div>

                        <ul className="space-y-3 mb-8 flex-1">
                          {tier.features.map((feature) => (
                            <li key={feature} className="flex items-start">
                              <span className="inline-block w-5 h-5 rounded-full bg-teal-100 text-teal-600 text-xs flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                                ✓
                              </span>
                              <span className="text-sm text-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Button
                          onClick={() => setLocation("/book-demo")}
                          className={`w-full ${
                            tier.highlighted
                              ? "bg-teal-600 hover:bg-teal-700 text-white"
                              : "bg-teal-100 hover:bg-teal-200 text-teal-900"
                          }`}
                        >
                          {tier.cta}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Scroll Indicators */}
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => handleScroll("left")}
                  className="p-2 rounded-full bg-teal-100 hover:bg-teal-200 text-teal-600 transition-colors"
                  aria-label="Scroll left"
                >
                  ←
                </button>
                <button
                  onClick={() => handleScroll("right")}
                  className="p-2 rounded-full bg-teal-100 hover:bg-teal-200 text-teal-600 transition-colors"
                  aria-label="Scroll right"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-20 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-serif font-normal text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                {
                  q: "Can I change plans anytime?",
                  a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
                },
                {
                  q: "Do you offer annual billing discounts?",
                  a: "Yes! Annual plans include a 20% discount compared to monthly billing. Contact our sales team for details.",
                },
                {
                  q: "Is there a setup fee?",
                  a: "No setup fees. All plans include onboarding support and training for your team at no additional cost.",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards, bank transfers, and purchase orders for Enterprise customers.",
                },
              ].map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-6">
                  <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-20 text-center bg-gradient-to-r from-teal-50 to-amber-50 rounded-2xl p-12"
          >
            <h2 className="text-3xl font-serif font-normal mb-4">Ready to transform your HR?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start your 14-day free trial today. No credit card required.
            </p>
            <Button
              onClick={() => setLocation("/book-demo")}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-lg rounded-xl"
            >
              Get Started Free
            </Button>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  );
}
