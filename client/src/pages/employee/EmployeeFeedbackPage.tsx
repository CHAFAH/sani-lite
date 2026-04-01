import EmployeeLayout from "@/components/EmployeeLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

export default function EmployeeFeedbackPage() {
  const { data: feedbacks = [] } = trpc.feedback.listByCompany.useQuery();

  const typeColors: Record<string, string> = {
    praise: "bg-emerald-50 text-emerald-700",
    constructive: "bg-blue-50 text-blue-700",
    one_on_one: "bg-purple-50 text-purple-700",
    peer_review: "bg-amber-50 text-amber-700",
  };

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-slate-900">My Feedback</h1><p className="text-sm text-slate-500 mt-1">Feedback received from your team</p></div>

        <div className="space-y-3">
          {feedbacks.map((f: any) => (
            <Card key={f.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mt-0.5">
                    <MessageSquare size={16} className="text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`text-xs capitalize ${typeColors[f.type] || ""}`}>{f.type?.replace("_", " ")}</Badge>
                      <span className="text-xs text-slate-400">{new Date(f.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-700">{f.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {feedbacks.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <MessageSquare size={40} className="mx-auto mb-3 text-slate-300" />
              <p>No feedback received yet</p>
            </div>
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
}
