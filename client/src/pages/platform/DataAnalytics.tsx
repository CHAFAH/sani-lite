import FeaturePage from "@/components/FeaturePage";

const SCREENSHOT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/data-analytics-dashboard-CzQ2vYqvfaMsa5TyHAq2pj.webp";

export default function DataAnalytics() {
  return (
    <FeaturePage
      badge="Data & Analytics"
      title="Insights that drive"
      titleAccent="better decisions"
      subtitle="Transform raw people data into actionable insights with real-time dashboards, custom reports, and AI-powered predictions."
      screenshotUrl={SCREENSHOT}
      screenshotAlt="SANI data analytics dashboard"
      features={[
        { title: "Real-Time Dashboards", description: "Pre-built and custom dashboards for headcount, attrition, diversity, compensation, and more." },
        { title: "Predictive Analytics", description: "AI models that forecast attrition risk, hiring needs, and budget impact before problems arise." },
        { title: "Custom Report Builder", description: "Drag-and-drop report builder with filters, grouping, and export to Excel, PDF, or CSV." },
        { title: "Benchmarking", description: "Compare your metrics against industry benchmarks to understand where you stand." },
        { title: "Scheduled Reports", description: "Automate report delivery to stakeholders on a daily, weekly, or monthly cadence." },
        { title: "Data Governance", description: "Role-based access ensures sensitive data is only visible to authorized personnel." },
      ]}
      benefits={[
        "Make data-driven people decisions instead of relying on gut feeling",
        "Identify flight risks before top performers leave",
        "Track DEI metrics and progress toward diversity goals",
        "Reduce time spent building manual reports by 80%",
        "Present board-ready analytics with one-click exports",
      ]}
      ctaTitle="Turn your people data into a strategic advantage"
      ctaDescription="Start making smarter decisions with SANI Analytics."
    />
  );
}
