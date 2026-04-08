import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

/**
 * Demo Mode Page - Allows testing all three dashboards without authentication
 * This is a development/testing feature only
 */
export default function DemoMode() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Demo users with different roles
  const demoUsers = [
    {
      role: "admin",
      name: "Admin User",
      email: "admin@acme.example.com",
      description: "Full platform access - manage company, employees, payroll, hiring",
      path: "/admin",
    },
    {
      role: "manager",
      name: "Manager User",
      email: "manager@acme.example.com",
      description: "Team-focused access - manage direct reports, approve time-off",
      path: "/manager",
    },
    {
      role: "employee",
      name: "Employee User",
      email: "employee@acme.example.com",
      description: "Self-service access - view profile, request time-off, view payslips",
      path: "/employee",
    },
  ];

  const handleDemoLogin = (role: string, path: string) => {
    // Store demo mode in sessionStorage
    sessionStorage.setItem("demoMode", "true");
    sessionStorage.setItem("demoRole", role);
    setLocation(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">SANI Lite - Demo Mode</h1>
          <p className="text-lg text-slate-600">
            Test all three platform experiences without authentication
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {demoUsers.map((demo) => (
            <Card key={demo.role} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{demo.name}</CardTitle>
                <p className="text-sm text-slate-500">{demo.email}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600 text-sm">{demo.description}</p>
                <Button
                  onClick={() => handleDemoLogin(demo.role, demo.path)}
                  className="w-full"
                  variant={demo.role === "admin" ? "default" : "outline"}
                >
                  Try as {demo.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Demo Mode Information</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Demo mode uses mock data and does not require authentication</li>
            <li>• All three dashboards are fully functional with sample data</li>
            <li>• Changes made in demo mode are not persisted</li>
            <li>• To use real authentication, click "Login" on the landing page</li>
          </ul>
        </div>

        {user && (
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ You are logged in as <strong>{user.name}</strong> ({user.role})
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
