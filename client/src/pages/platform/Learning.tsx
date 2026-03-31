import FeaturePage from "@/components/FeaturePage";

const SCREENSHOT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/learning-management-bkiwB8ULKoMCrwrT4wjn62.webp";

export default function Learning() {
  return (
    <FeaturePage
      badge="Learning"
      title="Develop your people,"
      titleAccent="grow your business"
      subtitle="A built-in learning management system that makes it easy to create, assign, and track training programs across your organization."
      screenshotUrl={SCREENSHOT}
      screenshotAlt="SANI learning management system"
      features={[
        { title: "Course Catalog", description: "Build a library of courses with videos, documents, quizzes, and interactive content." },
        { title: "Learning Paths", description: "Create structured learning journeys for roles, skills, or compliance requirements." },
        { title: "Progress Tracking", description: "Real-time dashboards showing completion rates, time spent, and assessment scores." },
        { title: "Compliance Training", description: "Assign mandatory training with deadlines, reminders, and automatic escalation." },
        { title: "Certifications", description: "Issue and track certifications with expiration dates and renewal workflows." },
        { title: "Third-Party Integrations", description: "Connect with LinkedIn Learning, Udemy Business, Coursera, and other content providers." },
      ]}
      benefits={[
        "Reduce onboarding time by 50% with structured learning paths",
        "Ensure 100% compliance training completion with automated reminders",
        "Track skill development and identify knowledge gaps across teams",
        "Empower employees to own their professional development",
        "Measure ROI of training programs with detailed analytics",
      ]}
      ctaTitle="Invest in your team's growth"
      ctaDescription="Launch your learning program in days, not months."
    />
  );
}
