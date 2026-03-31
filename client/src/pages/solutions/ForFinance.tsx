import FeaturePage from "@/components/FeaturePage";

const SCREENSHOT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/compensation-planning-cEjRc9jEac5s3hvPvEFgXy.webp";

export default function ForFinance() {
  return (
    <FeaturePage
      badge="For Finance"
      title="Payroll and people costs,"
      titleAccent="fully visible"
      subtitle="Give your finance team real-time visibility into payroll costs, headcount budgets, and workforce planning data."
      screenshotUrl={SCREENSHOT}
      screenshotAlt="SANI financial planning dashboard"
      features={[
        { title: "Payroll Cost Analytics", description: "Real-time breakdown of payroll costs by department, location, and cost center." },
        { title: "Budget vs. Actual", description: "Compare planned headcount and compensation budgets against actual spend." },
        { title: "Workforce Planning", description: "Model hiring scenarios and forecast their impact on payroll and benefits costs." },
        { title: "GL Integration", description: "Automatic journal entries and payroll data sync with your accounting system." },
        { title: "Tax Reporting", description: "Automated tax filings, W-2s, 1099s, and year-end reporting across jurisdictions." },
        { title: "Audit Support", description: "Complete audit trail with exportable reports for internal and external audits." },
      ]}
      benefits={[
        "Eliminate manual payroll reconciliation and data entry",
        "Forecast people costs accurately for better budgeting",
        "Close the books faster with automated GL entries",
        "Reduce audit preparation time by 70%",
        "Full visibility into the largest line item on your P&L",
      ]}
      ctaTitle="Finance and HR, finally aligned"
      ctaDescription="Give your finance team the data they need."
    />
  );
}
