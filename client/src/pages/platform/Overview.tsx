import FeaturePage from "@/components/FeaturePage";

const SCREENSHOT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/dashboard-preview-eg8xb3WGfixWoqQjqSzH5A.webp";
const VIDEO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/sani-promo-video_b629459e.mp4";

export default function PlatformOverview() {
  return (
    <FeaturePage
      badge="Platform"
      title="One platform for"
      titleAccent="everything people"
      subtitle="SANI replaces your disconnected HR, payroll, IT, and finance tools with a single unified platform that grows with your team."
      screenshotUrl={SCREENSHOT}
      screenshotAlt="SANI platform dashboard overview"
      features={[
        { title: "Unified Dashboard", description: "See headcount, attrition, hiring, and engagement metrics in one place. Real-time data, zero spreadsheets." },
        { title: "Modular Architecture", description: "Start with Core HR and add payroll, performance, or analytics modules as your needs grow." },
        { title: "Global-First Design", description: "Built for distributed teams across 100+ countries with localized compliance and multi-currency support." },
        { title: "AI-Powered Insights", description: "Surface trends, predict attrition, and get actionable recommendations powered by machine learning." },
        { title: "Enterprise Security", description: "SOC 2 Type II, GDPR compliant, SSO, and role-based access controls to keep your data safe." },
        { title: "Seamless Integrations", description: "Connect with Slack, Google Workspace, Microsoft 365, and 200+ other tools your team already uses." },
      ]}
      videoUrl={VIDEO_URL}
      benefits={[
        "Reduce HR admin time by 60% with automated workflows",
        "Single source of truth for all employee data across departments",
        "Real-time analytics that drive better people decisions",
        "Scales from 10 to 10,000+ employees without switching platforms",
        "Dedicated customer success team for onboarding and support",
      ]}
    />
  );
}
