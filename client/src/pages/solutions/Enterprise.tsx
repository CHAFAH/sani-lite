import FeaturePage from "@/components/FeaturePage";

const SCREENSHOT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/global-payroll-map-NZXt6XZ48f89C7kvK7gHp3.webp";

export default function Enterprise() {
  return (
    <FeaturePage
      badge="Enterprise"
      title="Enterprise-grade HR"
      titleAccent="without the complexity"
      subtitle="The security, compliance, and scalability that large organizations demand — with the modern UX that employees love."
      screenshotUrl={SCREENSHOT}
      screenshotAlt="SANI enterprise global payroll"
      features={[
        { title: "SSO & SCIM", description: "Enterprise single sign-on with SAML/OIDC and automated user provisioning via SCIM." },
        { title: "Advanced Permissions", description: "Granular role-based access controls with field-level security and custom permission sets." },
        { title: "Multi-Entity Support", description: "Manage multiple legal entities, subsidiaries, and brands from a single platform." },
        { title: "Custom Workflows", description: "Build complex approval chains, escalation rules, and business logic without code." },
        { title: "Dedicated Support", description: "Named customer success manager, priority support, and custom SLA agreements." },
        { title: "Data Residency", description: "Choose where your data lives with regional hosting options in US, EU, and APAC." },
      ]}
      benefits={[
        "SOC 2 Type II, ISO 27001, and GDPR certified",
        "99.99% uptime SLA with enterprise support",
        "Migrate from legacy systems with white-glove onboarding",
        "Support for 10,000+ employees across multiple entities",
        "Custom integrations with your existing enterprise tech stack",
      ]}
      ctaTitle="Ready for enterprise scale"
      ctaDescription="Talk to our enterprise team about your needs."
    />
  );
}
