import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  position?: string | null;
  department?: string | null;
  role?: "admin" | "manager" | "employee";
  status: string;
  managerId?: number | null;
}

interface OrgChartProps {
  employees: Employee[];
  onEmployeeClick?: (employee: Employee) => void;
  expandedNodes?: Set<number>;
  onToggleNode?: (employeeId: number) => void;
}

const getRoleColor = (role?: string) => {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-800";
    case "manager":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
};

export default function OrgChart({
  employees,
  onEmployeeClick,
  expandedNodes = new Set(),
  onToggleNode,
}: OrgChartProps) {
  const [localExpanded, setLocalExpanded] = useState<Set<number>>(expandedNodes);

  // Build org hierarchy
  const orgStructure = useMemo(() => {
    // Find all managers (employees with no manager or are admins/managers)
    const managers = employees.filter((e) => !e.managerId);

    const getDirectReports = (managerId: number): Employee[] => {
      return employees.filter((e) => e.managerId === managerId);
    };

    return { managers, getDirectReports };
  }, [employees]);

  const handleToggle = (employeeId: number) => {
    const newExpanded = new Set(localExpanded);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setLocalExpanded(newExpanded);
    onToggleNode?.(employeeId);
  };

  const EmployeeNode = ({ employee, level = 0 }: { employee: Employee; level?: number }) => {
    const directReports = orgStructure.getDirectReports(employee.id);
    const isExpanded = localExpanded.has(employee.id);
    const hasReports = directReports.length > 0;

    return (
      <div key={employee.id} className="select-none">
        {/* Employee Card */}
        <div
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
          onClick={() => onEmployeeClick?.(employee)}
        >
          {/* Expand/Collapse Button */}
          <div className="w-6 flex justify-center">
            {hasReports ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(employee.id);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
          </div>

          {/* Avatar */}
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.id}`}
              alt={`${employee.firstName} ${employee.lastName}`}
            />
            <AvatarFallback className="bg-teal-100 text-teal-700 font-semibold">
              {getInitials(employee.firstName, employee.lastName)}
            </AvatarFallback>
          </Avatar>

          {/* Employee Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-slate-900 truncate">
                {employee.firstName} {employee.lastName}
              </p>
              <Badge className={`text-xs font-medium capitalize ${getRoleColor(employee.role)}`}>
                {employee.role || "employee"}
              </Badge>
            </div>
            <p className="text-sm text-slate-600 truncate">{employee.position}</p>
          </div>

          {/* Team Count */}
          {hasReports && (
            <div className="flex items-center gap-1 text-slate-500 text-sm flex-shrink-0">
              <Users size={14} />
              <span>{directReports.length}</span>
            </div>
          )}
        </div>

        {/* Direct Reports */}
        {hasReports && isExpanded && (
          <div className="ml-8 mt-2 space-y-2 border-l-2 border-slate-200 pl-0">
            {directReports.map((report) => (
              <EmployeeNode key={report.id} employee={report} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Root Level Employees */}
      <div className="space-y-2">
        {orgStructure.managers.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No employees found</p>
          </div>
        ) : (
          orgStructure.managers.map((manager) => (
            <EmployeeNode key={manager.id} employee={manager} level={0} />
          ))
        )}
      </div>
    </div>
  );
}
