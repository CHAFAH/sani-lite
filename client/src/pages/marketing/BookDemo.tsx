import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import MarketingLayout from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  company: z.string().min(2, { message: "Company name is required." }),
  teamSize: z.string({ required_error: "Please select your team size." }),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BookDemo() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      teamSize: "",
      message: "",
    },
  });

  function onSubmit(values: FormValues) {
    console.log("Form submitted:", values);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      toast.success("Demo request sent successfully!");
    }, 1000);
  }

  return (
    <MarketingLayout>
      <section className="pt-32 pb-20 bg-gradient-to-b from-teal-50/40 via-[#FEFCF8] to-[#FEFCF8] min-h-[calc(100vh-64px)]">
        <div className="container max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Column: Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold tracking-wide uppercase mb-6">
                Book a Demo
              </span>
              <h1 className="text-4xl md:text-5xl font-normal tracking-tight leading-[1.1] mb-6 font-serif">
                See SANI in <span className="text-teal-600 italic">action</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                Discover how our unified platform can transform your HR, payroll, and IT operations. Our experts will show you how to:
              </p>
              
              <ul className="space-y-6">
                {[
                  { title: "Consolidate your stack", desc: "Replace multiple tools with one unified platform." },
                  { title: "Automate workflows", desc: "Save hours of manual work with intelligent automation." },
                  { title: "Global compliance", desc: "Manage teams across 100+ countries with ease." },
                  { title: "Real-time insights", desc: "Make data-driven decisions with advanced analytics." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-1">
                      {String.fromCharCode(97 + i)}
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-12 p-6 rounded-2xl bg-white border border-border/50 shadow-sm">
                <p className="italic text-muted-foreground mb-4">
                  "SANI has completely changed how we manage our global team. The demo showed us exactly how much time we could save, and the implementation was seamless."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                    JD
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Jane Doe</p>
                    <p className="text-xs text-muted-foreground">Head of People, TechFlow</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-black/5 border border-border/50"
            >
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-serif mb-4">Thank you!</h2>
                  <p className="text-muted-foreground mb-8">
                    We've received your request. One of our product experts will reach out to you shortly to schedule your personalized demo.
                  </p>
                  <Button 
                    onClick={() => setIsSubmitted(false)}
                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8"
                  >
                    Back to form
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-serif mb-6">Request a personalized demo</h2>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} className="rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work Email</FormLabel>
                            <FormControl>
                              <Input placeholder="john@company.com" {...field} className="rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Acme Inc." {...field} className="rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="teamSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Team Size</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl">
                                  <SelectValue placeholder="Select team size" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1-10">1-10 employees</SelectItem>
                                <SelectItem value="11-50">11-50 employees</SelectItem>
                                <SelectItem value="51-200">51-200 employees</SelectItem>
                                <SelectItem value="201-500">201-500 employees</SelectItem>
                                <SelectItem value="500+">500+ employees</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Anything else? (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us about your specific needs..." 
                                {...field} 
                                className="rounded-xl min-h-[100px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-12 text-base font-semibold shadow-lg shadow-teal-600/20 mt-4"
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting ? "Sending..." : "Book My Demo"}
                      </Button>
                      <p className="text-[10px] text-center text-muted-foreground mt-4">
                        By clicking "Book My Demo", you agree to our Terms of Service and Privacy Policy.
                      </p>
                    </form>
                  </Form>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
