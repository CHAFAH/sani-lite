import FeaturePage from "@/components/FeaturePage";

const SCREENSHOT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/data-analytics-dashboard-CzQ2vYqvfaMsa5TyHAq2pj.webp";

export default function ForHR() {
  return (
    <FeaturePage
      badge="For HR Teams"
      title="HR tools that"
      titleAccent="actually save time"
      subtitle="Automate admin, centralize data, and focus on what matters — your people. SANI gives HR teams superpowers."
      screenshotUrl={SCREENSHOT}
      screenshotAlt="SANI HR analytics dashboard"
      features={[
        { title: "Centralized Employee Records", description: "One source of truth for all employee data, documents, and history across the organization." },
        { title: "Automated Onboarding", description: "Create seamless onboarding experiences with checklists, document collection, and task assignments." },
        { title: "Compliance Management", description: "Stay compliant with automated policy tracking, audit trails, and regulatory updates." },
        { title: "HR Analytics", description: "Real-time dashboards for headcount, attrition, diversity, and engagement metrics." },
        { title: "Document Management", description: "Secure storage and e-signature for offer letters, policies, and employee documents." },
        { title: "Employee Relations", description: "Track cases, investigations, and grievances with confidential case management tools." },
      ]}
      benefits={[
        "Spend 60% less time on administrative tasks",
        "Eliminate data silos with a single source of truth",
        "Proactively identify and address workforce challenges",
        "Deliver a world-class employee experience from day one",
        "Scale HR operations without scaling the HR team",
      ]}
      ctaTitle="Give your HR team superpowers"
      ctaDescription="Automate the busywork and focus on strategy."
    />
  );
}
