import FeaturePage from "@/components/FeaturePage";

const SCREENSHOT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663310424405/ghFKSW6XSJAhWQ7DNsVTod/hiring-pipeline-62gYSThq8Vp3Tquewaw2FL.webp";

export default function RemoteTeams() {
  return (
    <FeaturePage
      badge="Remote Teams"
      title="Manage distributed teams"
      titleAccent="like they're in one office"
      subtitle="Purpose-built for remote and hybrid workforces. Hire, pay, and engage employees anywhere in the world."
      screenshotUrl={SCREENSHOT}
      screenshotAlt="SANI remote team management"
      features={[
        { title: "Global Hiring", description: "Hire employees and contractors in 100+ countries without setting up local entities." },
        { title: "Time Zone Management", description: "See team availability across time zones and schedule meetings that work for everyone." },
        { title: "Async Communication", description: "Built-in tools for updates, announcements, and recognition that don't require real-time presence." },
        { title: "Remote Onboarding", description: "Digital-first onboarding with equipment shipping, document signing, and virtual introductions." },
        { title: "Engagement Surveys", description: "Pulse surveys designed for remote teams to measure connection, wellbeing, and satisfaction." },
        { title: "Virtual Team Building", description: "Celebrate milestones, birthdays, and achievements with automated recognition and kudos." },
      ]}
      benefits={[
        "Hire the best talent regardless of location",
        "Maintain company culture across distributed teams",
        "Ensure compliance in every country where you have employees",
        "Pay everyone on time in their local currency",
        "Keep remote employees engaged and connected",
      ]}
      ctaTitle="Remote work, done right"
      ctaDescription="Build and manage your distributed team with confidence."
    />
  );
}
