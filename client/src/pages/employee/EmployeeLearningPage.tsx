import EmployeeLayout from "@/components/EmployeeLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Play, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function EmployeeLearningPage() {
  const { data: assignments = [] } = trpc.learning.listAssignments.useQuery();
  const { data: courses = [] } = trpc.learning.listCourses.useQuery();
  const utils = trpc.useUtils();
  const updateMut = trpc.learning.updateAssignment.useMutation({
    onSuccess: () => { utils.learning.listAssignments.invalidate(); toast.success("Updated"); },
  });

  const getCourse = (id: number) => courses.find((c: any) => c.id === id);
  const statusColors: Record<string, string> = {
    assigned: "bg-blue-50 text-blue-700",
    in_progress: "bg-amber-50 text-amber-700",
    completed: "bg-emerald-50 text-emerald-700",
  };

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-slate-900">My Learning</h1><p className="text-sm text-slate-500 mt-1">Courses assigned to you</p></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((a: any) => {
            const course = getCourse(a.courseId);
            return (
              <Card key={a.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                      <BookOpen size={18} className="text-purple-600" />
                    </div>
                    <Badge variant="outline" className={`text-xs capitalize ${statusColors[a.status] || ""}`}>{a.status?.replace("_", " ")}</Badge>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{course?.title || `Course #${a.courseId}`}</h3>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{course?.description || "No description"}</p>
                  {course?.duration && <p className="text-xs text-slate-400 mb-3">{course.duration} min</p>}
                  {a.progress != null && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-medium text-indigo-600">{a.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${a.progress}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {a.status === "assigned" && (
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs" onClick={() => updateMut.mutate({ id: a.id, status: "in_progress", progress: 10 })}>
                        <Play size={12} className="mr-1" />Start
                      </Button>
                    )}
                    {a.status === "in_progress" && (
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs" onClick={() => updateMut.mutate({ id: a.id, status: "completed", progress: 100 })}>
                        <CheckCircle size={12} className="mr-1" />Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {assignments.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400">
              <BookOpen size={40} className="mx-auto mb-3 text-slate-300" />
              <p>No courses assigned</p>
            </div>
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
}
