import MarketingLayout from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function BookDemo() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    jobTitle: "",
    companySize: "",
    interest: "",
    notes: "",
  });

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        jobTitle: "",
        companySize: "",
        interest: "",
        notes: "",
      });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <MarketingLayout>
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FEFCF8] to-white">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h1 className="text-5xl sm:text-6xl font-serif font-normal tracking-tight mb-6">
              Book Your Demo
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how SANI Lite can transform your HR operations. Our team will walk you through the platform and answer all your questions.
            </p>
          </motion.div>

          {/* Form Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="grid md:grid-cols-3 gap-12"
          >
            {/* Form */}
            <div className="md:col-span-2">
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-8">
                  {submitted ? (
                    <div className="text-center py-12">
                      <div className="mb-4 text-5xl">✓</div>
                      <h3 className="text-2xl font-semibold mb-2">Thank You!</h3>
                      <p className="text-muted-foreground">
                        We have received your request. Our team will contact you within 24 hours to schedule your demo.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="John"
                            required
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Doe"
                            required
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@company.com"
                          required
                          className="mt-2"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="company">Company Name</Label>
                          <Input
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Acme Inc."
                            required
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="jobTitle">Job Title</Label>
                          <Input
                            id="jobTitle"
                            name="jobTitle"
                            value={formData.jobTitle}
                            onChange={handleChange}
                            placeholder="HR Manager"
                            required
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="companySize">Company Size</Label>
                          <Select value={formData.companySize} onValueChange={(val) => handleSelectChange("companySize", val)}>
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-50">1-50 employees</SelectItem>
                              <SelectItem value="51-200">51-200 employees</SelectItem>
                              <SelectItem value="201-500">201-500 employees</SelectItem>
                              <SelectItem value="501-1000">501-1000 employees</SelectItem>
                              <SelectItem value="1000+">1000+ employees</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="interest">Primary Interest</Label>
                          <Select value={formData.interest} onValueChange={(val) => handleSelectChange("interest", val)}>
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select interest" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="payroll">Global Payroll</SelectItem>
                              <SelectItem value="hr">Core HR</SelectItem>
                              <SelectItem value="analytics">Analytics & Insights</SelectItem>
                              <SelectItem value="talent">Talent Management</SelectItem>
                              <SelectItem value="all">All Features</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          placeholder="Tell us about your HR challenges..."
                          className="mt-2 min-h-24"
                        />
                      </div>

                      <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-6 text-lg rounded-lg">
                        Schedule Demo
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="space-y-8">
                {/* Stats */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-white">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <p className="text-4xl font-bold text-teal-600">500+</p>
                        <p className="text-sm text-muted-foreground">Companies trust SANI</p>
                      </div>
                      <div>
                        <p className="text-4xl font-bold text-teal-600">100+</p>
                        <p className="text-sm text-muted-foreground">Countries supported</p>
                      </div>
                      <div>
                        <p className="text-4xl font-bold text-teal-600">4.8/5</p>
                        <p className="text-sm text-muted-foreground">Customer rating</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Testimonial */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardContent className="p-6">
                    <p className="text-sm italic mb-4">
                      "SANI Lite has completely transformed how we manage HR. The global payroll feature alone has saved us hours every month."
                    </p>
                    <p className="font-semibold text-sm">Sarah Chen</p>
                    <p className="text-xs text-muted-foreground">VP of People, TechVenture</p>
                  </CardContent>
                </Card>

                {/* FAQ */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Demo Includes</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Platform walkthrough</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Customization options</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Pricing discussion</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>Q&A session</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  );
}
