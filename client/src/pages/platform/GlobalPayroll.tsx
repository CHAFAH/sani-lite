import FeaturePage from "@/components/FeaturePage";

const SCREENSHOT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/global-payroll-map-NZXt6XZ48f89C7kvK7gHp3.webp";

export default function GlobalPayroll() {
  return (
    <FeaturePage
      badge="Global Payroll"
      title="Pay your team"
      titleAccent="anywhere in the world"
      subtitle="Run compliant payroll in 100+ countries from a single platform. Local expertise, global scale, zero headaches."
      screenshotUrl={SCREENSHOT}
      screenshotAlt="SANI global payroll world map"
      features={[
        { title: "100+ Country Coverage", description: "Process payroll in over 100 countries with local tax compliance, statutory deductions, and filings." },
        { title: "Multi-Currency Support", description: "Pay employees in their local currency with real-time exchange rates and transparent FX fees." },
        { title: "Automated Tax Filing", description: "Automatic calculation and filing of local, state, and federal taxes in every supported jurisdiction." },
        { title: "Contractor Payments", description: "Pay contractors and freelancers worldwide with compliant invoicing and 1099/W-8 management." },
        { title: "Payroll Calendar", description: "Manage multiple pay schedules across countries with a unified payroll calendar and reminders." },
        { title: "Compliance Engine", description: "Stay ahead of changing regulations with automatic updates to tax tables and labor laws." },
      ]}
      benefits={[
        "Consolidate payroll vendors from 10+ to just one platform",
        "Reduce payroll processing time by 75% with automation",
        "Eliminate compliance risk with built-in regulatory updates",
        "Pay employees on time, every time, in any country",
        "Full visibility into global payroll costs and trends",
      ]}
      ctaTitle="Simplify global payroll today"
      ctaDescription="Pay your team in 100+ countries with confidence."
    />
  );
}
