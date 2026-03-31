import FeaturePage from "@/components/FeaturePage";

const SCREENSHOT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/workflow-automation-oUu3SZi3MPLJ559G3K9yWx.webp";

export default function Workflows() {
  return (
    <FeaturePage
      badge="Workflows & Automation"
      title="Automate the work"
      titleAccent="that slows you down"
      subtitle="Build powerful automations with a visual drag-and-drop builder. From onboarding checklists to approval chains — eliminate repetitive tasks."
      screenshotUrl={SCREENSHOT}
      screenshotAlt="SANI workflow automation builder"
      features={[
        { title: "Visual Workflow Builder", description: "Drag-and-drop interface to create multi-step workflows without writing a single line of code." },
        { title: "Pre-Built Templates", description: "50+ ready-made templates for onboarding, offboarding, promotions, and compliance tasks." },
        { title: "Conditional Logic", description: "Add if/then branches, delays, and parallel paths to handle complex business rules." },
        { title: "Multi-Channel Notifications", description: "Trigger emails, Slack messages, and in-app notifications at each workflow step." },
        { title: "Approval Chains", description: "Route requests through multi-level approval workflows with escalation rules." },
        { title: "Audit & Compliance", description: "Full audit trail of every workflow execution for compliance and troubleshooting." },
      ]}
      benefits={[
        "Save 15+ hours per week on repetitive HR admin tasks",
        "Ensure consistent processes across teams and locations",
        "Reduce onboarding time from weeks to days",
        "Never miss a compliance deadline with automated reminders",
        "Scale operations without scaling headcount",
      ]}
      ctaTitle="Stop doing manually what SANI can automate"
      ctaDescription="Build your first workflow in under 5 minutes."
    />
  );
}
