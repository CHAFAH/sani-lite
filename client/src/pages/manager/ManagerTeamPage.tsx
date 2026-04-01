import ManagerLayout from "@/components/ManagerLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, MapPin, Briefcase } from "lucide-react";

export default function ManagerTeamPage() {
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const activeEmployees = employees.filter((e: any) => e.status === "active");

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Team</h1>
          <p className="text-sm text-slate-500 mt-1">{activeEmployees.length} active members</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeEmployees.map((emp: any) => (
            <Card key={emp.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
                      {emp.firstName?.[0]}{emp.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-slate-900">{emp.firstName} {emp.lastName}</h3>
                    <p className="text-xs text-slate-500">{emp.position || "No position"}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-slate-500">
                  {emp.email && <div className="flex items-center gap-2"><Mail size={12} /><span>{emp.email}</span></div>}
                  {emp.department && <div className="flex items-center gap-2"><Briefcase size={12} /><span>{emp.department}</span></div>}
                  {emp.location && <div className="flex items-center gap-2"><MapPin size={12} /><span>{emp.location}</span></div>}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs capitalize">{emp.type || "full_time"}</Badge>
                  <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {activeEmployees.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400">No team members found</div>
          )}
        </div>
      </div>
    </ManagerLayout>
  );
}
