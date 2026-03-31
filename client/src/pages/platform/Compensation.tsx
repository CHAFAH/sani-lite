import FeaturePage from "@/components/FeaturePage";

const SCREENSHOT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/compensation-planning-cEjRc9jEac5s3hvPvEFgXy.webp";

export default function Compensation() {
  return (
    <FeaturePage
      badge="Compensation"
      title="Fair, transparent, and"
      titleAccent="competitive pay"
      subtitle="Design compensation strategies with salary band visualization, pay equity analysis, and budget-aware planning tools."
      screenshotUrl={SCREENSHOT}
      screenshotAlt="SANI compensation planning dashboard"
      features={[
        { title: "Salary Band Management", description: "Define and visualize salary ranges by role, level, and location with clear band positioning." },
        { title: "Pay Equity Analysis", description: "Identify and address pay gaps across gender, ethnicity, and tenure with scatter plot analysis." },
        { title: "Compensation Reviews", description: "Run merit increase cycles with manager recommendations, budget guardrails, and approval workflows." },
        { title: "Total Rewards Statements", description: "Generate personalized total compensation statements including salary, benefits, and equity." },
        { title: "Market Benchmarking", description: "Compare your compensation against market data to stay competitive in your industry." },
        { title: "Budget Planning", description: "Model compensation scenarios and forecast budget impact before making changes." },
      ]}
      benefits={[
        "Close pay gaps and demonstrate commitment to pay equity",
        "Retain top talent with competitive, data-driven compensation",
        "Streamline merit review cycles from months to weeks",
        "Give managers clear guidelines with salary bands and budgets",
        "Build trust with transparent total rewards communication",
      ]}
      ctaTitle="Pay your people right"
      ctaDescription="Build a compensation strategy that attracts and retains talent."
    />
  );
}
