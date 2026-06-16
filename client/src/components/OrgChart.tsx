import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Users, User, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

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

function countDescendants(id: number, childrenMap: Map<number | null, Employee[]>): number {
  const children = childrenMap.get(id) || [];
  let count = children.length;
  for (const child of children) {
    count += countDescendants(child.id, childrenMap);
  }
  return count;
}

function EmployeeCard({ employee, onClick }: { employee: Employee; onClick?: () => void }) {
  const initials = getInitials(employee.firstName, employee.lastName);
  const color = getAvatarColor(`${employee.firstName}${employee.lastName}`);

  return (
    <div
      onClick={onClick}
      className="w-[140px] bg-white border border-slate-200 rounded-lg p-2.5 text-center cursor-pointer
                 hover:shadow-md hover:border-teal-300 transition-all duration-200 group select-none"
    >
      <div className="flex justify-center mb-1.5">
        <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
          {initials}
        </div>
      </div>
      <p className="font-semibold text-slate-900 text-[11px] leading-tight group-hover:text-teal-700 truncate">
        {employee.firstName} {employee.lastName}
      </p>
      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight truncate">
        {employee.position || "No title"}
      </p>
      <p className="text-[9px] text-slate-400 mt-0.5 truncate">
        {employee.department || ""}
      </p>
    </div>
  );
}

function ExpandPill({ totalDescendants, directReports, isExpanded, onToggle }: {
  totalDescendants: number; directReports: number; isExpanded: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-full
                 text-[10px] text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm select-none"
    >
      <Users size={10} className="text-slate-400" />
      <span className="font-medium">{totalDescendants}</span>
      <User size={10} className="text-slate-400" />
      <span className="font-medium">{directReports}</span>
      {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
    </button>
  );
}

function TreeNode({ employee, childrenMap, onEmployeeClick, expandedSet, toggleExpand }: {
  employee: Employee; childrenMap: Map<number | null, Employee[]>;
  onEmployeeClick?: (employee: Employee) => void; expandedSet: Set<number>; toggleExpand: (id: number) => void;
}) {
  const children = childrenMap.get(employee.id) || [];
  const hasChildren = children.length > 0;
  const isExpanded = expandedSet.has(employee.id);
  const totalDesc = useMemo(() => countDescendants(employee.id, childrenMap), [employee.id, childrenMap]);

  return (
    <div className="flex flex-col items-center">
      <EmployeeCard employee={employee} onClick={() => onEmployeeClick?.(employee)} />

      {hasChildren && (
        <div className="flex flex-col items-center">
          <div className="w-px h-2 bg-slate-300" />
          <ExpandPill totalDescendants={totalDesc} directReports={children.length} isExpanded={isExpanded} onToggle={() => toggleExpand(employee.id)} />

          {isExpanded && (
            <>
              <div className="w-px h-3 bg-slate-300" />
              <div className="relative">
                <div className="flex items-start gap-1">
                  {children.map((child, index) => (
                    <div key={child.id} className="flex flex-col items-center relative">
                      <div className="w-px h-3 bg-slate-300" />
                      {children.length > 1 && (
                        <div
                          className="absolute top-0 h-px bg-slate-300"
                          style={{
                            left: index === 0 ? "50%" : 0,
                            right: index === children.length - 1 ? "50%" : 0,
                          }}
                        />
                      )}
                      <TreeNode employee={child} childrenMap={childrenMap} onEmployeeClick={onEmployeeClick} expandedSet={expandedSet} toggleExpand={toggleExpand} />
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

export default function OrgChart({ employees, onEmployeeClick, companyName = "SANI" }: OrgChartProps) {
  // Only expand CEO by default (single level)
  const [expandedSet, setExpandedSet] = useState<Set<number>>(() => {
    const roots = employees.filter((e) => !e.managerId);
    return new Set(roots.map((r) => r.id));
  });

  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom(z => Math.min(1.5, Math.max(0.3, z + delta)));
    };
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  // Pan with mouse drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("[data-card]")) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const childrenMap = useMemo(() => {
    const map = new Map<number | null, Employee[]>();
    for (const emp of employees) {
      const parentId = emp.managerId ?? null;
      if (!map.has(parentId)) map.set(parentId, []);
      map.get(parentId)!.push(emp);
    }
    return map;
  }, [employees]);

  const roots = useMemo(() => employees.filter((e) => !e.managerId), [employees]);

  // Toggle only this single node (not children)
  const toggleExpand = useCallback((id: number) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => setExpandedSet(new Set(employees.map((e) => e.id))), [employees]);
  const collapseAll = useCallback(() => setExpandedSet(new Set()), []);
  const resetView = useCallback(() => { setZoom(0.8); setPan({ x: 0, y: 0 }); }, []);

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
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-700">{employees.length}</span>
          </span>
          <span className="text-xs text-slate-400">Scroll to zoom · Drag to pan</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="p-1.5 text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"><ZoomOut size={14} /></button>
          <span className="text-xs text-slate-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="p-1.5 text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"><ZoomIn size={14} /></button>
          <button onClick={resetView} className="p-1.5 text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50" title="Reset view"><Maximize2 size={14} /></button>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <button onClick={expandAll} className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Expand All</button>
          <button onClick={collapseAll} className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">Collapse All</button>
        </div>
      </div>

      {/* Pannable + Zoomable Canvas */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50/30"
        style={{ height: "calc(100vh - 320px)", cursor: isPanning ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute inset-0 flex justify-center pt-8"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "top center",
            transition: isPanning ? "none" : "transform 0.1s ease-out",
          }}
        >
          <div className="inline-flex flex-col items-center px-8">
            {/* Company root */}
            <div className="bg-white border-2 border-slate-300 rounded-xl px-6 py-3 text-center shadow-sm select-none">
              <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm mx-auto mb-1.5">
                {companyName[0]}
              </div>
              <p className="font-bold text-slate-900 text-sm">{companyName}</p>
            </div>

            <div className="w-px h-2 bg-slate-300" />

            <ExpandPill
              totalDescendants={employees.length}
              directReports={roots.length}
              isExpanded={expandedSet.size > 0}
              onToggle={() => {
                const rootIds = roots.map((r) => r.id);
                if (rootIds.every((id) => expandedSet.has(id))) collapseAll();
                else setExpandedSet(new Set(rootIds));
              }}
            />

            {roots.length > 0 && expandedSet.size > 0 && (
              <>
                <div className="w-px h-3 bg-slate-300" />
                <div className="relative">
                  <div className="flex items-start gap-1">
                    {roots.map((root, index) => (
                      <div key={root.id} className="flex flex-col items-center relative">
                        <div className="w-px h-3 bg-slate-300" />
                        {roots.length > 1 && (
                          <div className="absolute top-0 h-px bg-slate-300" style={{ left: index === 0 ? "50%" : 0, right: index === roots.length - 1 ? "50%" : 0 }} />
                        )}
                        <TreeNode employee={root} childrenMap={childrenMap} onEmployeeClick={onEmployeeClick} expandedSet={expandedSet} toggleExpand={toggleExpand} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
