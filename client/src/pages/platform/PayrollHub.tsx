import FeaturePage from "@/components/FeaturePage";

const SCREENSHOT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/payroll-hub-Gka4C4uM3pKibrtFG99BdC.webp";

export default function PayrollHub() {
  return (
    <FeaturePage
      badge="Payroll Hub"
      title="Your centralized"
      titleAccent="payroll command center"
      subtitle="Manage every payroll run, tax filing, and payment from one unified dashboard. Complete visibility and control over your payroll operations."
      screenshotUrl={SCREENSHOT}
      screenshotAlt="SANI centralized payroll hub dashboard"
      features={[
        { title: "Unified Payroll Dashboard", description: "See all upcoming pay dates, recent runs, and pending approvals in a single view." },
        { title: "One-Click Payroll Runs", description: "Review, approve, and process payroll with a single click. Built-in validation catches errors before they happen." },
        { title: "Tax Withholding Management", description: "Automatic calculation of federal, state, and local tax withholdings with real-time updates." },
        { title: "Department Breakdown", description: "Analyze payroll costs by department, location, or cost center with detailed breakdowns." },
        { title: "Payroll Reports", description: "Generate payroll summaries, tax reports, and journal entries for accounting with one click." },
        { title: "Payment Reconciliation", description: "Automatic reconciliation of payroll payments with bank transactions and GL entries." },
      ]}
      benefits={[
        "Process payroll 3x faster with automated calculations",
        "Catch errors before they reach employees with built-in validation",
        "Complete audit trail for every payroll run and adjustment",
        "Seamless integration with your accounting software",
        "Real-time visibility into payroll costs across the organization",
      ]}
      ctaTitle="Take control of your payroll"
      ctaDescription="Centralize and streamline your payroll operations."
    />
  );
}
