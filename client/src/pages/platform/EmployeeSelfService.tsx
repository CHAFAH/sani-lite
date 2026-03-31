import FeaturePage from "@/components/FeaturePage";

const SCREENSHOT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/employee-self-service-Jd7UqJWcifpy4WWcGE5s9G.webp";

export default function EmployeeSelfService() {
  return (
    <FeaturePage
      badge="Employee Self Service"
      title="Empower employees to"
      titleAccent="help themselves"
      subtitle="Give your team a modern self-service portal where they can manage their profile, request time off, view pay stubs, and access benefits — without waiting on HR."
      screenshotUrl={SCREENSHOT}
      screenshotAlt="SANI employee self-service portal"
      features={[
        { title: "Personal Profile Management", description: "Employees update their own contact info, emergency contacts, and banking details in seconds." },
        { title: "PTO & Leave Requests", description: "Submit time-off requests with one click. Managers approve instantly from email or mobile." },
        { title: "Pay Stub Access", description: "View and download current and historical pay stubs, tax documents, and compensation history." },
        { title: "Benefits Enrollment", description: "Browse, compare, and enroll in benefits plans during open enrollment or qualifying events." },
        { title: "Document Center", description: "Access offer letters, policies, handbooks, and tax forms in a secure document vault." },
        { title: "Mobile-First Experience", description: "Full functionality on any device. Submit requests, check balances, and update info on the go." },
      ]}
      benefits={[
        "Reduce HR ticket volume by 70% with self-service tools",
        "Employees get instant access to their own data 24/7",
        "Eliminate paper forms and manual data entry errors",
        "Boost employee satisfaction with a modern, intuitive experience",
        "Audit trail for every change made by employees or managers",
      ]}
      ctaTitle="Give your team the tools they deserve"
      ctaDescription="Start empowering employees with self-service today."
    />
  );
}
