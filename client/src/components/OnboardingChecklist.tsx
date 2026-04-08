import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  icon?: React.ReactNode;
}

interface OnboardingChecklistProps {
  tasks: OnboardingTask[];
  onTaskClick?: (taskId: string) => void;
}

export function OnboardingChecklist({ tasks, onTaskClick }: OnboardingChecklistProps) {
  const completedCount = tasks.filter((t) => t.completed).length;
  const requiredCount = tasks.filter((t) => t.required).length;
  const requiredCompletedCount = tasks.filter((t) => t.completed && t.required).length;
  const progressPercentage = requiredCount > 0 ? (requiredCompletedCount / requiredCount) * 100 : 0;
  const isComplete = requiredCompletedCount === requiredCount;

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Onboarding Checklist
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Complete all required tasks to finish your onboarding
              </p>
            </div>
            {isComplete && (
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">Complete</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-600">
                Progress: {requiredCompletedCount} of {requiredCount} required
              </span>
              <span className="text-xs font-semibold text-slate-900">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => onTaskClick?.(task.id)}
              className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left border border-transparent hover:border-slate-200"
            >
              {/* Checkbox Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {task.completed ? (
                  <CheckCircle2 size={20} className="text-emerald-600" />
                ) : (
                  <Circle size={20} className="text-slate-300" />
                )}
              </div>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`text-sm font-medium ${
                    task.completed ? "text-slate-600 line-through" : "text-slate-900"
                  }`}>
                    {task.title}
                  </h4>
                  {task.required && !task.completed && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                      Required
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-1 ${
                  task.completed ? "text-slate-500" : "text-slate-600"
                }`}>
                  {task.description}
                </p>
              </div>

              {/* Status Indicator */}
              <div className="flex-shrink-0">
                {!task.completed && task.required && (
                  <AlertCircle size={16} className="text-amber-500" />
                )}
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
