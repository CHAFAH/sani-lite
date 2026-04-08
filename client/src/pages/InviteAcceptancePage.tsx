import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function InviteAcceptancePage() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  // Get token from URL query params
  const token = typeof window !== "undefined" 
    ? new URLSearchParams(window.location.search).get("token")
    : null;
  // For now, we'll just simulate accepting the invite
  // In a real app, you'd have an acceptInvite mutation
  const acceptInviteMut = {
    mutate: (data: any) => {
      setTimeout(() => {
        setStatus("success");
        setMessage("Invitation accepted! Redirecting to onboarding...");
        setTimeout(() => {
          setLocation("/employee/onboarding");
        }, 2000);
      }, 1000);
    },
  } as any;

  const oldAcceptInviteMut = trpc.employee.create.useMutation({
    onSuccess: () => {
      setStatus("success");
      setMessage("Invitation accepted! Redirecting to onboarding...");
      // Redirect to onboarding after 2 seconds
      setTimeout(() => {
        setLocation("/employee/onboarding");
      }, 2000);
    },
    onError: (error: any) => {
      setStatus("error");
      setMessage(error.message || "Failed to accept invitation");
      toast.error(message);
    },
  });

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid invitation link");
      return;
    }

    // Accept the invite
    acceptInviteMut.mutate({ token });
  }, [token, acceptInviteMut]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-slate-200">
        <CardHeader className="text-center">
          <CardTitle>Accepting Your Invitation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={40} className="text-blue-600 animate-spin" />
              <p className="text-slate-600 text-center">
                Processing your invitation...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <div className="text-center">
                <h2 className="font-semibold text-slate-900 mb-2">Welcome!</h2>
                <p className="text-slate-600 text-sm">{message}</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle size={32} className="text-red-600" />
              </div>
              <div className="text-center">
                <h2 className="font-semibold text-slate-900 mb-2">Invitation Error</h2>
                <p className="text-slate-600 text-sm">{message}</p>
              </div>
              <Button
                onClick={() => setLocation("/")}
                className="w-full mt-4"
              >
                Return to Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
