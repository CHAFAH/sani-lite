import EmployeeLayout from "@/components/EmployeeLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { Mail, MapPin, Briefcase, Calendar, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function EmployeeProfilePage() {
  const { user } = useAuth();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const myEmployee = employees.find((e: any) => e.userId === user?.id);

  const { data: personalDetails } = trpc.personalDetails.get.useQuery(
    { employeeId: myEmployee?.id ?? 0 },
    { enabled: !!myEmployee }
  );
  const utils = trpc.useUtils();
  const updateDetails = trpc.personalDetails.upsert.useMutation({
    onSuccess: () => { utils.personalDetails.get.invalidate(); toast.success("Profile updated"); },
  });

  const [form, setForm] = useState({
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
  });

  useEffect(() => {
    if (personalDetails) {
      setForm({
        address: personalDetails.address || "",
        emergencyContactName: personalDetails.emergencyContactName || "",
        emergencyContactPhone: personalDetails.emergencyContactPhone || "",
        emergencyContactRelation: personalDetails.emergencyContactRelation || "",
      });
    }
  }, [personalDetails]);

  const initials = user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase() : "?";

  return (
    <EmployeeLayout>
      <div className="space-y-6 max-w-3xl">
        <div><h1 className="text-2xl font-bold text-slate-900">My Profile</h1><p className="text-sm text-slate-500 mt-1">View and update your personal information</p></div>

        {/* Profile Header */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-2xl font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{user?.name || "Employee"}</h2>
                <p className="text-sm text-slate-500">{myEmployee?.position || "Team Member"}</p>
                <div className="flex items-center gap-2 mt-2">
                  {myEmployee?.department && <Badge variant="outline" className="text-xs">{myEmployee.department}</Badge>}
                  <Badge variant="outline" className="text-xs capitalize bg-emerald-50 text-emerald-700 border-emerald-200">{myEmployee?.status || "active"}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">Work Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <Mail size={16} className="text-slate-400" />
                <div><p className="text-xs text-slate-400">Email</p><p className="text-sm text-slate-900">{myEmployee?.email || "—"}</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <Briefcase size={16} className="text-slate-400" />
                <div><p className="text-xs text-slate-400">Position</p><p className="text-sm text-slate-900">{myEmployee?.position || "—"}</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <MapPin size={16} className="text-slate-400" />
                <div><p className="text-xs text-slate-400">Location</p><p className="text-sm text-slate-900">{[myEmployee?.city, myEmployee?.country].filter(Boolean).join(", ") || "—"}</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <Calendar size={16} className="text-slate-400" />
                <div><p className="text-xs text-slate-400">Start Date</p><p className="text-sm text-slate-900">{myEmployee?.startDate ? new Date(myEmployee.startDate).toLocaleDateString() : "—"}</p></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base">Personal Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Address</Label><Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Home address" /></div>
              <div><Label>Emergency Contact Name</Label><Input value={form.emergencyContactName} onChange={e => setForm(p => ({ ...p, emergencyContactName: e.target.value }))} placeholder="Name" /></div>
              <div><Label>Emergency Contact Phone</Label><Input value={form.emergencyContactPhone} onChange={e => setForm(p => ({ ...p, emergencyContactPhone: e.target.value }))} placeholder="Phone" /></div>
              <div><Label>Relationship</Label><Input value={form.emergencyContactRelation} onChange={e => setForm(p => ({ ...p, emergencyContactRelation: e.target.value }))} placeholder="e.g. Spouse" /></div>
            </div>
            <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => {
                if (!myEmployee) { toast.error("Employee not found"); return; }
                updateDetails.mutate({ employeeId: myEmployee.id, ...form });
              }}
              disabled={updateDetails.isPending}>
              <Save size={14} className="mr-2" />{updateDetails.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </EmployeeLayout>
  );
}
