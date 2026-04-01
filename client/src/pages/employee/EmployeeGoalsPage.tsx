import EmployeeLayout from "@/components/EmployeeLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Target } from "lucide-react";
import { toast } from "sonner";

export default function EmployeeGoalsPage() {
  const { data: goals = [] } = trpc.goals.list.useQuery();
  const utils = trpc.useUtils();
  const updateMut = trpc.goals.update.useMutation({
    onSuccess: () => { utils.goals.list.invalidate(); toast.success("Updated"); },
  });

  const statusColors: Record<string, string> = {
    not_started: "bg-slate-50 text-slate-600",
    in_progress: "bg-blue-50 text-blue-700",
    completed: "bg-emerald-50 text-emerald-700",
  };

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-slate-900">My Goals</h1><p className="text-sm text-slate-500 mt-1">Track and update your goals</p></div>

        <div className="space-y-3">
          {goals.map((g: any) => (
            <Card key={g.id} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Target size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{g.title}</h3>
                      {g.description && <p className="text-xs text-slate-500 mt-0.5">{g.description}</p>}
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-xs capitalize ${statusColors[g.status] || ""}`}>{g.status?.replace("_", " ")}</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-medium text-indigo-600">{g.progress || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${g.progress || 0}%` }} />
                    </div>
                  </div>
                  {g.status !== "completed" && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number" min={0} max={100} className="w-20 h-8 text-xs"
                        placeholder="%"
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            const val = Number((e.target as HTMLInputElement).value);
                            if (val >= 0 && val <= 100) {
                              updateMut.mutate({ id: g.id, progress: val, status: val >= 100 ? "completed" : "in_progress" });
                              (e.target as HTMLInputElement).value = "";
                            }
                          }
                        }}
                      />
                      <Button size="sm" variant="outline" className="h-8 text-xs text-emerald-600"
                        onClick={() => updateMut.mutate({ id: g.id, progress: 100, status: "completed" })}>
                        Done
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {goals.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Target size={40} className="mx-auto mb-3 text-slate-300" />
              <p>No goals assigned yet</p>
            </div>
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
}
