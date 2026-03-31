import FeaturePage from "@/components/FeaturePage";

const SCREENSHOT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/performance-review-JooDzmtFieLe8XbRNDBHp8.webp";

export default function ForManagers() {
  return (
    <FeaturePage
      badge="For Managers"
      title="Lead your team with"
      titleAccent="clarity and confidence"
      subtitle="Give managers the insights and tools they need to make better decisions, develop their people, and drive results."
      screenshotUrl={SCREENSHOT}
      screenshotAlt="SANI manager performance review tools"
      features={[
        { title: "Team Dashboard", description: "See your team's headcount, PTO balances, upcoming reviews, and action items at a glance." },
        { title: "One-Click Approvals", description: "Approve time-off requests, expense reports, and other requests from email or mobile." },
        { title: "Performance Reviews", description: "Run structured reviews with templates, competency frameworks, and calibration tools." },
        { title: "Goal Alignment", description: "Set team goals that cascade from company objectives and track progress in real-time." },
        { title: "Compensation Insights", description: "View salary bands and budget guidelines when making promotion or raise decisions." },
        { title: "Org Chart Navigation", description: "Visualize your team structure and explore the broader organization with interactive org charts." },
      ]}
      benefits={[
        "Make informed decisions with real-time team analytics",
        "Reduce approval bottlenecks with mobile-friendly workflows",
        "Have better 1:1s with performance data and feedback history",
        "Align team efforts with company strategy through cascading goals",
        "Develop your people with structured growth frameworks",
      ]}
      ctaTitle="Empower your managers to lead"
      ctaDescription="Give every manager the tools to build great teams."
    />
  );
}
