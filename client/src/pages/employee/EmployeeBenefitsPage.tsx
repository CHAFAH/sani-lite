import EmployeeLayout from "@/components/EmployeeLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Shield, Eye } from "lucide-react";
import { toast } from "sonner";

export default function EmployeeBenefitsPage() {
  const { data: plans = [] } = trpc.benefits.listPlans.useQuery();
  const { data: enrollments = [] } = trpc.benefits.listEnrollments.useQuery();
  const utils = trpc.useUtils();
  const enrollMut = trpc.benefits.enroll.useMutation({
    onSuccess: () => { utils.benefits.listEnrollments.invalidate(); toast.success("Enrolled"); },
  });

  const enrolledPlanIds = new Set(enrollments.map((e: any) => e.planId));
  const typeIcons: Record<string, any> = { health: Heart, dental: Shield, vision: Eye };
  const statusColors: Record<string, string> = {
    enrolled: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    waived: "bg-slate-50 text-slate-500",
  };

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-slate-900">My Benefits</h1><p className="text-sm text-slate-500 mt-1">View and enroll in benefit plans</p></div>

        {enrollments.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">My Enrollments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {enrollments.map((e: any) => {
                const plan = plans.find((p: any) => p.id === e.planId);
                return (
                  <Card key={e.id} className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{plan?.name || `Plan #${e.planId}`}</p>
                        <p className="text-xs text-slate-500 capitalize">{plan?.type || "benefit"}</p>
                      </div>
                      <Badge variant="outline" className={`text-xs capitalize ${statusColors[e.status] || ""}`}>{e.status}</Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan: any) => {
              const Icon = typeIcons[plan.type] || Shield;
              const isEnrolled = enrolledPlanIds.has(plan.id);
              return (
                <Card key={plan.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <Icon size={18} className="text-indigo-600" />
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">{plan.type}</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mb-2">{plan.provider || "Provider"}</p>
                    {plan.cost && <p className="text-sm font-medium text-slate-900 mb-3">${plan.cost}/mo</p>}
                    {plan.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{plan.description}</p>}
                    {isEnrolled ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-0">Enrolled</Badge>
                    ) : (
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs w-full"
                        onClick={() => enrollMut.mutate({ planId: plan.id, employeeId: 0 })} disabled={enrollMut.isPending}>
                        Enroll
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {plans.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-400">
                <Shield size={40} className="mx-auto mb-3 text-slate-300" />
                <p>No benefit plans available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}
