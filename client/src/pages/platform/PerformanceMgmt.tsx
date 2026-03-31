import FeaturePage from "@/components/FeaturePage";

const SCREENSHOT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/performance-review-JooDzmtFieLe8XbRNDBHp8.webp";

export default function PerformanceMgmt() {
  return (
    <FeaturePage
      badge="Performance"
      title="Track goals and"
      titleAccent="drive growth"
      subtitle="Run meaningful performance reviews with 360-degree feedback, goal tracking, and competency frameworks that actually help people improve."
      screenshotUrl={SCREENSHOT}
      screenshotAlt="SANI performance review interface"
      features={[
        { title: "360-Degree Reviews", description: "Collect feedback from self, managers, peers, and direct reports for a complete picture." },
        { title: "Goal Management (OKRs)", description: "Set, track, and align individual goals with team and company objectives." },
        { title: "Competency Frameworks", description: "Define role-specific competencies and track development with radar charts." },
        { title: "Continuous Feedback", description: "Enable real-time feedback and recognition between review cycles." },
        { title: "Calibration Tools", description: "Ensure fair and consistent ratings across teams with calibration sessions." },
        { title: "Performance Analytics", description: "Identify top performers, flight risks, and development opportunities with data." },
      ]}
      benefits={[
        "Replace annual reviews with continuous performance conversations",
        "Align individual goals with company strategy using OKR frameworks",
        "Reduce bias in reviews with structured competency-based assessments",
        "Identify and retain top talent with data-driven insights",
        "Create a culture of feedback and continuous improvement",
      ]}
      ctaTitle="Build a high-performance culture"
      ctaDescription="Make performance reviews meaningful, not painful."
    />
  );
}
