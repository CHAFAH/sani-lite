import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import OrgChart from "@/components/OrgChart";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Search, Filter, Eye } from "lucide-react";
import { toast } from "sonner";

export default function AdminOrgChartPage() {
  const [, setLocation] = useLocation();
  const { data: employees = [] } = trpc.employee.list.useQuery();
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  // Get unique departments
  const departments = useMemo(
    () => Array.from(new Set(employees.map((e: any) => e.department).filter(Boolean))),
    [employees]
  );

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((e: any) => {
      const matchesSearch =
        search === "" ||
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        e.position?.toLowerCase().includes(search.toLowerCase()) ||
        e.email?.toLowerCase().includes(search.toLowerCase());

      const matchesDept = departmentFilter === "all" || e.department === departmentFilter;

      return matchesSearch && matchesDept;
    });
  }, [employees, search, departmentFilter]);

  const handleEmployeeClick = (employee: any) => {
    setLocation(`/admin/employees/${employee.id}`);
  };

  const handleToggleNode = (employeeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleExpandAll = () => {
    const allIds = new Set(filteredEmployees.map((e: any) => e.id));
    setExpandedNodes(allIds);
  };

  const handleCollapseAll = () => {
    setExpandedNodes(new Set());
  };

  const handleExportChart = () => {
    // Create a simple text representation of the org chart
    const buildOrgText = (employee: any, indent = 0): string => {
      const directReports = filteredEmployees.filter((e: any) => e.managerId === employee.id);
      let text = `${"  ".repeat(indent)}├─ ${employee.firstName} ${employee.lastName} (${employee.position})\n`;
      
      for (const report of directReports) {
        text += buildOrgText(report, indent + 1);
      }
      
      return text;
    };

    const rootEmployees = filteredEmployees.filter((e: any) => !e.managerId);
    let fullText = "ORGANIZATIONAL CHART\n";
    fullText += "=".repeat(50) + "\n\n";

    for (const root of rootEmployees) {
      fullText += buildOrgText(root);
    }

    // Download as text file
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(fullText));
    element.setAttribute("download", "org-chart.txt");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast.success("Org chart exported successfully");
  };

  const managerCount = filteredEmployees.filter((e: any) => e.role === "manager").length;
  const employeeCount = filteredEmployees.length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Organizational Chart</h1>
          <p className="text-slate-600 mt-1">View your company's reporting structure and team hierarchy</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">{employeeCount}</p>
                <p className="text-sm text-slate-600 mt-1">Total Employees</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">{managerCount}</p>
                <p className="text-sm text-slate-600 mt-1">Managers</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">{departments.length}</p>
                <p className="text-sm text-slate-600 mt-1">Departments</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter size={20} />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <Label htmlFor="search" className="text-sm">
                  Search by name, position, or email
                </Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                  <Input
                    id="search"
                    placeholder="Search employees..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Department Filter */}
              <div>
                <Label htmlFor="department" className="text-sm">
                  Filter by Department
                </Label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger id="department" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExpandAll}
                className="text-xs"
              >
                Expand All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCollapseAll}
                className="text-xs"
              >
                Collapse All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportChart}
                className="text-xs"
              >
                <Download size={14} className="mr-1" />
                Export Chart
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Org Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye size={20} />
              Team Structure
            </CardTitle>
            <CardDescription>
              Click on any employee to view their profile. Click the arrow to expand/collapse team members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">No employees found matching your filters</p>
              </div>
            ) : (
              <div className="space-y-2">
                <OrgChart
                  employees={filteredEmployees}
                  onEmployeeClick={handleEmployeeClick}
                  expandedNodes={expandedNodes}
                  onToggleNode={handleToggleNode}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-red-100 text-red-800">Admin</Badge>
                <span className="text-sm text-slate-600">Administrator</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">Manager</Badge>
                <span className="text-sm text-slate-600">Team Manager</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-slate-100 text-slate-800">Employee</Badge>
                <span className="text-sm text-slate-600">Team Member</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
