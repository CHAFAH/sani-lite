import { useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import EmployeeLayout from "@/components/EmployeeLayout";
import AdminEmployeeProfilePage from "@/pages/admin/EmployeeProfilePage";

export default function EmployeeProfilePage() {
  const { user } = useAuth();
  const { data: employees = [], isLoading } = trpc.employee.list.useQuery();

  const myEmployee = useMemo(() => {
    if (!user || !employees.length) return null;
    return employees.find((e: any) => e.userId === user.id || e.email === user.email);
  }, [user, employees]);

  if (isLoading) {
    return (
      <EmployeeLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      </EmployeeLayout>
    );
  }

  if (!myEmployee) {
    return (
      <EmployeeLayout>
        <div className="flex items-center justify-center h-96 text-center">
          <div>
            <p className="text-slate-600 text-lg font-medium mb-2">Profile not found</p>
            <p className="text-sm text-slate-400">Contact your admin to set up your employee profile.</p>
          </div>
        </div>
      </EmployeeLayout>
    );
  }

  return <AdminEmployeeProfilePage overrideEmployeeId={myEmployee.id} Layout={EmployeeLayout} />;
}
