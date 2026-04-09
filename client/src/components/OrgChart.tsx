import { useMemo, useState, useCallback } from "react";
import { ChevronDown, ChevronUp, Users, User } from "lucide-react";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  position?: string | null;
  department?: string | null;
  country?: string | null;
  city?: string | null;
  profilePictureUrl?: string | null;
  managerId?: number | null;
  status: string;
}

interface OrgChartProps {
  employees: Employee[];
  onEmployeeClick?: (employee: Employee) => void;
  companyName?: string;
}

// Generate a consistent color from name
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-rose-500", "bg-pink-500", "bg-fuchsia-500", "bg-purple-500",
    "bg-violet-500", "bg-indigo-500", "bg-blue-500", "bg-sky-500",
    "bg-cyan-500", "bg-teal-500", "bg-emerald-500", "bg-green-500",
    "bg-amber-500", "bg-orange-500", "bg-red-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (firstName: string, lastName: string) =>
  `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

// Count all descendants recursively
function countDescendants(id: number, childrenMap: Map<number | null, Employee[]>): number {
  const children = childrenMap.get(id) || [];
  let count = children.length;
  for (const child of children) {
    count += countDescendants(child.id, childrenMap);
  }
  return count;
}

// ─── Employee Card ───────────────────────────────────────────
function EmployeeCard({
  employee,
  onClick,
}: {
  employee: Employee;
  onClick?: () => void;
}) {
  const initials = getInitials(employee.firstName, employee.lastName);
  const color = getAvatarColor(`${employee.firstName}${employee.lastName}`);

  return (
    <div
      onClick={onClick}
      className="w-[180px] bg-white border border-slate-200 rounded-xl p-4 text-center cursor-pointer
                 hover:shadow-lg hover:border-teal-300 transition-all duration-200 group"
    >
      {/* Avatar */}
      <div className="flex justify-center mb-3">
        {employee.profilePictureUrl ? (
          <img
            src={employee.profilePictureUrl}
            alt={`${employee.firstName} ${employee.lastName}`}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
        ) : (
          <div
            className={`w-14 h-14 rounded-full ${color} flex items-center justify-center text-white font-bold text-lg shadow-sm ring-2 ring-white`}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Name */}
      <p className="font-semibold text-slate-900 text-sm leading-tight group-hover:text-teal-700 transition-colors">
        {employee.firstName} {employee.lastName}
      </p>

      {/* Title */}
      <p className="text-xs text-slate-500 mt-1 leading-tight">
        {employee.position || "No title"}
      </p>

      {/* Department + City */}
      <p className="text-[11px] text-slate-400 mt-1.5">
        {[employee.department, employee.city].filter(Boolean).join(" \u00B7 ") || "\u00A0"}
      </p>
    </div>
  );
}

// ─── Expand/Collapse Pill ────────────────────────────────────
function ExpandPill({
  totalDescendants,
  directReports,
  isExpanded,
  onToggle,
}: {
  totalDescendants: number;
  directReports: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full
                 text-xs text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
    >
      <Users size={12} className="text-slate-400" />
      <span className="font-medium">{totalDescendants}</span>
      <User size={12} className="text-slate-400" />
      <span className="font-medium">{directReports}</span>
      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
    </button>
  );
}

// ─── Tree Node (recursive) ──────────────────────────────────
function TreeNode({
  employee,
  childrenMap,
  onEmployeeClick,
  expandedSet,
  toggleExpand,
}: {
  employee: Employee;
  childrenMap: Map<number | null, Employee[]>;
  onEmployeeClick?: (employee: Employee) => void;
  expandedSet: Set<number>;
  toggleExpand: (id: number) => void;
}) {
  const children = childrenMap.get(employee.id) || [];
  const hasChildren = children.length > 0;
  const isExpanded = expandedSet.has(employee.id);
  const totalDesc = useMemo(
    () => countDescendants(employee.id, childrenMap),
    [employee.id, childrenMap]
  );

  return (
    <div className="flex flex-col items-center">
      {/* This employee's card */}
      <EmployeeCard
        employee={employee}
        onClick={() => onEmployeeClick?.(employee)}
      />

      {/* Expand pill + connector */}
      {hasChildren && (
        <div className="flex flex-col items-center">
          {/* Vertical connector from card to pill */}
          <div className="w-px h-3 bg-slate-300" />

          {/* Expand/Collapse pill */}
          <ExpandPill
            totalDescendants={totalDesc}
            directReports={children.length}
            isExpanded={isExpanded}
            onToggle={() => toggleExpand(employee.id)}
          />

          {/* Children */}
          {isExpanded && (
            <>
              {/* Vertical connector from pill to horizontal line */}
              <div className="w-px h-4 bg-slate-300" />

              {/* Horizontal connector + children */}
              <div className="relative">
                {/* Horizontal line spanning all children */}
                {children.length > 1 && (
                  <div
                    className="absolute bg-slate-300"
                    style={{
                      height: "1px",
                      top: 0,
                      left: "50%",
                      right: "50%",
                      // Will be calculated by the container
                    }}
                  />
                )}

                <div className="flex items-start gap-2">
                  {children.map((child, index) => (
                    <div key={child.id} className="flex flex-col items-center relative">
                      {/* Vertical connector from horizontal line to child card */}
                      <div className="w-px h-4 bg-slate-300" />

                      {/* Horizontal line segment */}
                      {children.length > 1 && (
                        <div
                          className="absolute top-0 h-px bg-slate-300"
                          style={{
                            left: index === 0 ? "50%" : 0,
                            right: index === children.length - 1 ? "50%" : 0,
                          }}
                        />
                      )}

                      {/* Recursive child node */}
                      <TreeNode
                        employee={child}
                        childrenMap={childrenMap}
                        onEmployeeClick={onEmployeeClick}
                        expandedSet={expandedSet}
                        toggleExpand={toggleExpand}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main OrgChart Component ─────────────────────────────────
export default function OrgChart({
  employees,
  onEmployeeClick,
  companyName = "SANI",
}: OrgChartProps) {
  const [expandedSet, setExpandedSet] = useState<Set<number>>(() => {
    // Auto-expand root nodes by default
    const roots = employees.filter((e) => !e.managerId);
    return new Set(roots.map((r) => r.id));
  });

  // Build children map
  const childrenMap = useMemo(() => {
    const map = new Map<number | null, Employee[]>();
    for (const emp of employees) {
      const parentId = emp.managerId ?? null;
      if (!map.has(parentId)) map.set(parentId, []);
      map.get(parentId)!.push(emp);
    }
    return map;
  }, [employees]);

  // Root employees (no manager)
  const roots = useMemo(
    () => employees.filter((e) => !e.managerId),
    [employees]
  );

  const toggleExpand = useCallback((id: number) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedSet(new Set(employees.map((e) => e.id)));
  }, [employees]);

  const collapseAll = useCallback(() => {
    setExpandedSet(new Set());
  }, []);

  const totalEmployees = employees.length;

  if (employees.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <Users size={48} className="mx-auto mb-4 text-slate-300" />
        <p className="text-lg font-medium">No employees found</p>
        <p className="text-sm mt-1">Add employees to see the organizational chart</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-700">{totalEmployees}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="overflow-x-auto pb-8">
        <div className="inline-flex flex-col items-center min-w-full px-4">
          {/* Company root node */}
          <div className="bg-white border-2 border-slate-300 rounded-2xl px-8 py-5 text-center shadow-sm mb-0">
            <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
              {companyName[0]}
            </div>
            <p className="font-bold text-slate-900 text-lg">{companyName}</p>
          </div>

          {/* Connector from company to expand pill */}
          <div className="w-px h-3 bg-slate-300" />

          {/* Expand pill for root level */}
          <ExpandPill
            totalDescendants={totalEmployees}
            directReports={roots.length}
            isExpanded={roots.some((r) => expandedSet.has(r.id)) || expandedSet.size > 0}
            onToggle={() => {
              const rootIds = roots.map((r) => r.id);
              const allExpanded = rootIds.every((id) => expandedSet.has(id));
              if (allExpanded) {
                collapseAll();
              } else {
                setExpandedSet(new Set(rootIds));
              }
            }}
          />

          {/* Root level children */}
          {roots.length > 0 && (expandedSet.size > 0) && (
            <>
              <div className="w-px h-4 bg-slate-300" />

              <div className="relative">
                <div className="flex items-start gap-2">
                  {roots.map((root, index) => (
                    <div key={root.id} className="flex flex-col items-center relative">
                      <div className="w-px h-4 bg-slate-300" />

                      {roots.length > 1 && (
                        <div
                          className="absolute top-0 h-px bg-slate-300"
                          style={{
                            left: index === 0 ? "50%" : 0,
                            right: index === roots.length - 1 ? "50%" : 0,
                          }}
                        />
                      )}

                      <TreeNode
                        employee={root}
                        childrenMap={childrenMap}
                        onEmployeeClick={onEmployeeClick}
                        expandedSet={expandedSet}
                        toggleExpand={toggleExpand}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
