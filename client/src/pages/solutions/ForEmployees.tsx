import FeaturePage from "@/components/FeaturePage";

const SCREENSHOT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/employee-self-service-Jd7UqJWcifpy4WWcGE5s9G.webp";

export default function ForEmployees() {
  return (
    <FeaturePage
      badge="For Employees"
      title="Everything you need,"
      titleAccent="in one place"
      subtitle="A modern self-service experience where employees can manage their profile, request time off, view pay stubs, and access benefits."
      screenshotUrl={SCREENSHOT}
      screenshotAlt="SANI employee self-service portal"
      features={[
        { title: "Personal Dashboard", description: "See your PTO balance, upcoming reviews, recent pay stubs, and action items at a glance." },
        { title: "Time Off Requests", description: "Submit and track vacation, sick leave, and personal time requests with one click." },
        { title: "Pay & Benefits", description: "Access pay stubs, tax documents, and benefits information anytime, anywhere." },
        { title: "Learning & Development", description: "Browse courses, track certifications, and build your skills with the built-in LMS." },
        { title: "Company Directory", description: "Find colleagues, explore the org chart, and connect with people across the company." },
        { title: "Mobile App", description: "Full functionality on iOS and Android — manage everything from your phone." },
      ]}
      benefits={[
        "Get answers instantly without waiting for HR to respond",
        "Manage your work life from any device, anywhere",
        "Stay informed about your compensation, benefits, and growth",
        "Connect with colleagues across the organization",
        "Own your professional development with learning tools",
      ]}
      ctaTitle="A better experience for every employee"
      ctaDescription="Give your team the modern tools they deserve."
    />
  );
}
