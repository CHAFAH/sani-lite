import FeaturePage from "@/components/FeaturePage";

const SCREENSHOT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/benefits-enrollment-WUcr9tFYWeqVW4sVFrycMQ.webp";

export default function Benefits() {
  return (
    <FeaturePage
      badge="Benefits Administration"
      title="Benefits that employees"
      titleAccent="actually understand"
      subtitle="Simplify benefits enrollment, management, and compliance with an intuitive platform that makes choosing the right plan effortless."
      screenshotUrl={SCREENSHOT}
      screenshotAlt="SANI benefits enrollment interface"
      features={[
        { title: "Guided Enrollment", description: "Step-by-step enrollment wizard that helps employees choose the right plans for their needs." },
        { title: "Plan Comparison", description: "Side-by-side comparison of health, dental, vision, and retirement plans with clear cost breakdowns." },
        { title: "Life Event Management", description: "Trigger special enrollment periods for marriage, birth, relocation, and other qualifying events." },
        { title: "Carrier Integrations", description: "Direct EDI feeds to major insurance carriers for automatic enrollment and eligibility updates." },
        { title: "COBRA Administration", description: "Automated COBRA notices, tracking, and compliance for departing employees." },
        { title: "Benefits Analytics", description: "Track enrollment rates, plan utilization, and costs to optimize your benefits strategy." },
      ]}
      benefits={[
        "Reduce benefits-related HR inquiries by 50%",
        "Increase enrollment completion rates with guided workflows",
        "Ensure ACA and ERISA compliance automatically",
        "Employees understand their benefits with clear plan comparisons",
        "Streamline open enrollment from weeks to days",
      ]}
      ctaTitle="Make benefits simple for everyone"
      ctaDescription="Give employees clarity and HR teams control."
    />
  );
}
