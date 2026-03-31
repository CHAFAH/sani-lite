import FeaturePage from "@/components/FeaturePage";

const SCREENSHOT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/hiring-pipeline-62gYSThq8Vp3Tquewaw2FL.webp";

export default function Hiring() {
  return (
    <FeaturePage
      badge="Hiring"
      title="Find and hire"
      titleAccent="top talent faster"
      subtitle="A modern applicant tracking system with Kanban pipelines, collaborative scorecards, and seamless onboarding handoff — all built into SANI."
      screenshotUrl={SCREENSHOT}
      screenshotAlt="SANI hiring pipeline Kanban board"
      features={[
        { title: "Kanban Pipeline", description: "Visual drag-and-drop pipeline to move candidates through Applied, Screening, Interview, Offer, and Hired stages." },
        { title: "Job Board Distribution", description: "Post to LinkedIn, Indeed, Glassdoor, and 50+ job boards with a single click." },
        { title: "Collaborative Scorecards", description: "Structured interview scorecards that keep hiring teams aligned and reduce bias." },
        { title: "Automated Scheduling", description: "Let candidates self-schedule interviews based on your team's availability." },
        { title: "Offer Management", description: "Generate, send, and track offer letters with e-signature built in." },
        { title: "Onboarding Handoff", description: "Seamlessly transition new hires from the ATS into onboarding workflows." },
      ]}
      benefits={[
        "Reduce time-to-hire by 40% with streamlined workflows",
        "Improve candidate experience with self-service scheduling",
        "Eliminate hiring bias with structured scorecards and blind reviews",
        "Never lose a great candidate to a slow process again",
        "Complete visibility into your hiring funnel and bottlenecks",
      ]}
      ctaTitle="Hire smarter, not harder"
      ctaDescription="Build your dream team with SANI's modern ATS."
    />
  );
}
