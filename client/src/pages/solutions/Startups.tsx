import FeaturePage from "@/components/FeaturePage";

const SCREENSHOT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/workflow-automation-oUu3SZi3MPLJ559G3K9yWx.webp";

export default function Startups() {
  return (
    <FeaturePage
      badge="Startups"
      title="Scale your team"
      titleAccent="without the chaos"
      subtitle="Built for fast-growing startups that need to move quickly without sacrificing compliance, culture, or employee experience."
      screenshotUrl={SCREENSHOT}
      screenshotAlt="SANI startup workflow automation"
      features={[
        { title: "Quick Setup", description: "Go from zero to fully operational HR in under a day. No implementation consultants needed." },
        { title: "Flexible Pricing", description: "Pay only for what you use. Scale up modules as your team grows from 10 to 1,000." },
        { title: "Hiring Pipeline", description: "Built-in ATS to manage your hiring funnel from job posting to offer letter." },
        { title: "Equity Management", description: "Track stock options, vesting schedules, and cap table integration." },
        { title: "Culture Tools", description: "Build company culture with kudos, celebrations, and team engagement features." },
        { title: "Investor Reporting", description: "Generate headcount and burn rate reports that investors and board members expect." },
      ]}
      benefits={[
        "Get set up in hours, not months — no enterprise sales cycle",
        "Stay compliant from day one without a dedicated HR team",
        "Attract top talent with a modern, professional employee experience",
        "Scale your people operations as fast as your business grows",
        "Free up founders to focus on product and customers, not HR admin",
      ]}
      ctaTitle="Built for builders"
      ctaDescription="Join 500+ startups already using SANI."
    />
  );
}
