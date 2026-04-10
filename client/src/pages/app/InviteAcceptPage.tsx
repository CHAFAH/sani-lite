import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Building2, Check, X, Loader2, LogIn, AlertCircle } from "lucide-react";

export default function InviteAcceptPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") || "";
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [accepted, setAccepted] = useState(false);

  // Validate the invitation token (public - no auth needed)
  const { data: validation, isLoading: validating, error: validationError } = trpc.invitation.validate.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  // Accept invitation mutation (requires auth)
  const acceptMut = trpc.invitation.accept.useMutation();

  const handleAccept = async () => {
    try {
      const result = await acceptMut.mutateAsync({ token });
      setAccepted(true);
      // Redirect to employee dashboard after 2 seconds
      setTimeout(() => {
        const path = result.role === "admin" || result.role === "hr_admin" ? "/admin" : result.role === "manager" ? "/manager" : "/employee";
        setLocation(path);
      }, 2000);
    } catch {
      // Error handled by mutation state
    }
  };

  const handleLogin = () => {
    // Store the invite token in sessionStorage so we can redirect back after login
    sessionStorage.setItem("pendingInviteToken", token);
    window.location.href = getLoginUrl(`/invite?token=${token}`);
  };

  // Auto-accept if user just logged in and has a pending invite
  useEffect(() => {
    if (user && !authLoading && validation?.valid && !accepted && !acceptMut.isPending) {
      const pendingToken = sessionStorage.getItem("pendingInviteToken");
      if (pendingToken === token) {
        sessionStorage.removeItem("pendingInviteToken");
        handleAccept();
      }
    }
  }, [user, authLoading, validation, token]);

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEFCF8] to-[#F0F9FF] flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg border-0">
          <CardContent className="pt-8 pb-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Invitation Link</h2>
            <p className="text-gray-500 mb-6">This invitation link is missing a token. Please check the link and try again.</p>
            <Button onClick={() => setLocation("/")} variant="outline">Go to Homepage</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (validating || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEFCF8] to-[#F0F9FF] flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg border-0">
          <CardContent className="pt-8 pb-8 text-center">
            <Loader2 className="w-12 h-12 text-teal-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500">Verifying invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid or expired invitation
  if (!validation?.valid || validationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEFCF8] to-[#F0F9FF] flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg border-0">
          <CardContent className="pt-8 pb-8 text-center">
            <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invitation Invalid</h2>
            <p className="text-gray-500 mb-6">{validation?.error || "This invitation link is invalid or has expired."}</p>
            <Button onClick={() => setLocation("/")} variant="outline">Go to Homepage</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Accepted successfully
  if (accepted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEFCF8] to-[#F0F9FF] flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg border-0">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to {validation.companyName}!</h2>
            <p className="text-gray-500 mb-2">Your invitation has been accepted. Redirecting to your dashboard...</p>
            <Loader2 className="w-5 h-5 text-teal-600 mx-auto animate-spin mt-4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not logged in - show login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEFCF8] to-[#F0F9FF] flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg border-0">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center mx-auto mb-2">
              <Building2 className="w-8 h-8 text-teal-600" />
            </div>
            <CardTitle className="text-xl">You're Invited!</CardTitle>
            <CardDescription>
              <span className="font-semibold text-gray-900">{validation.companyName}</span> has invited you to join as{" "}
              <span className="capitalize font-medium text-teal-700">{validation.role?.replace("_", " ")}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600">Invited email: <span className="font-medium">{validation.email}</span></p>
            </div>
            <p className="text-sm text-gray-500 text-center">Sign in or create an account to accept this invitation.</p>
            <Button onClick={handleLogin} className="w-full bg-teal-600 hover:bg-teal-700 h-11">
              <LogIn className="w-4 h-4 mr-2" /> Sign In to Accept
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logged in - show accept button
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFCF8] to-[#F0F9FF] flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg border-0">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center mx-auto mb-2">
            <Building2 className="w-8 h-8 text-teal-600" />
          </div>
          <CardTitle className="text-xl">Join {validation.companyName}</CardTitle>
          <CardDescription>
            You've been invited to join as <span className="capitalize font-medium text-teal-700">{validation.role?.replace("_", " ")}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Company</span>
              <span className="font-medium">{validation.companyName}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Role</span>
              <span className="font-medium capitalize">{validation.role?.replace("_", " ")}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Signed in as</span>
              <span className="font-medium">{user.email}</span>
            </div>
          </div>

          {acceptMut.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {acceptMut.error.message}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setLocation("/")} className="flex-1 h-11">Decline</Button>
            <Button onClick={handleAccept} className="flex-1 bg-teal-600 hover:bg-teal-700 h-11" disabled={acceptMut.isPending}>
              {acceptMut.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Accepting...</> : <><Check className="w-4 h-4 mr-2" /> Accept Invitation</>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
