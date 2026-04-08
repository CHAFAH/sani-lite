import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OnboardingChecklist, type OnboardingTask } from "@/components/OnboardingChecklist";
import { useAuth } from "@/_core/hooks/useAuth";
import type { Company } from "@shared/types";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Users, Briefcase, FileText, Heart, Zap } from "lucide-react";

export default function OnboardingWelcomePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { data: company } = trpc.company.getById.useQuery({} as any);

  const [tasks, setTasks] = useState<OnboardingTask[]>([
    {
      id: "personal",
      title: "Complete Personal Information",
      description: "Add your contact details, address, and emergency contact information",
      completed: false,
      required: true,
      icon: <Users size={20} />,
    },
    {
      id: "job",
      title: "Review Job Details",
      description: "Confirm your position, department, manager, and employment type",
      completed: false,
      required: true,
      icon: <Briefcase size={20} />,
    },
    {
      id: "banking",
      title: "Add Banking Information",
      description: "Provide your bank details for payroll processing",
      completed: false,
      required: true,
      icon: <FileText size={20} />,
    },
    {
      id: "documents",
      title: "Review & Sign Documents",
      description: "Review employment contract and company policies",
      completed: false,
      required: true,
      icon: <FileText size={20} />,
    },
    {
      id: "benefits",
      title: "Enroll in Benefits",
      description: "Select your health insurance, retirement, and other benefits",
      completed: false,
      required: false,
      icon: <Heart size={20} />,
    },
    {
      id: "training",
      title: "Complete Orientation Training",
      description: "Watch company orientation videos and complete training modules",
      completed: false,
      required: false,
      icon: <Zap size={20} />,
    },
  ]);

  const handleTaskClick = (taskId: string) => {
    switch (taskId) {
      case "personal":
        setLocation("/employee/onboarding/personal");
        break;
      case "job":
        setLocation("/employee/onboarding/job");
        break;
      case "banking":
        setLocation("/employee/onboarding/banking");
        break;
      case "documents":
        setLocation("/employee/onboarding/documents");
        break;
      case "benefits":
        setLocation("/employee/onboarding/benefits");
        break;
      case "training":
        setLocation("/employee/onboarding/training");
        break;
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const requiredCount = tasks.filter((t) => t.required).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Welcome to {(company as any)?.name}!</h1>
              <p className="text-slate-600 mt-2">
                Hi {user?.name}, let's get you set up and ready to go
              </p>
            </div>
            {completedCount === requiredCount && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                <CheckCircle2 size={20} className="text-emerald-600" />
                <span className="font-medium text-emerald-700">All set!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Checklist */}
          <div className="lg:col-span-2">
            <OnboardingChecklist tasks={tasks} onTaskClick={handleTaskClick} />
          </div>

          {/* Right Column - Info Cards */}
          <div className="space-y-6">
            {/* Company Info Card */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Company Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                    Company
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{(company as any)?.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                    Industry
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{(company as any)?.industry}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                    Size
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{(company as any)?.size}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links Card */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => setLocation("/employee/profile")}
                >
                  <span className="text-sm">View My Profile</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => setLocation("/employee/time-off")}
                >
                  <span className="text-sm">Request Time Off</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => setLocation("/employee/documents")}
                >
                  <span className="text-sm">My Documents</span>
                </Button>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="border-slate-200 bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-blue-900">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-800 mb-4">
                  Our HR team is here to help. Reach out anytime during your onboarding.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Contact HR
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
