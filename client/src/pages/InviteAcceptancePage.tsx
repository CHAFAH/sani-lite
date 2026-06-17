import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { SaniLogo } from "@/components/MarketingLayout";
import { toast } from "sonner";

function PasswordPolicy({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains a number", met: /[0-9]/.test(password) },
    { label: "Contains special character (!@#$...)", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const metCount = checks.filter(c => c.met).length;
  const strength = metCount <= 2 ? "Weak" : metCount <= 3 ? "Fair" : metCount <= 4 ? "Good" : "Strong";
  const strengthColor = metCount <= 2 ? "bg-red-500" : metCount <= 3 ? "bg-amber-500" : metCount <= 4 ? "bg-teal-400" : "bg-teal-600";

  return (
    <div className="space-y-3">
      {/* Strength bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-500">Password strength</span>
          <span className={`text-xs font-medium ${metCount <= 2 ? "text-red-600" : metCount <= 3 ? "text-amber-600" : "text-teal-600"}`}>{strength}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`flex-1 rounded-full transition-colors ${i <= metCount ? strengthColor : "bg-slate-200"}`} />
          ))}
        </div>
      </div>
      {/* Criteria */}
      <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2 text-xs">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${check.met ? "bg-teal-500 scale-100" : "bg-slate-200 scale-90"}`}>
              {check.met && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={`transition-colors ${check.met ? "text-teal-700 font-medium" : "text-slate-500"}`}>{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InviteAcceptancePage() {
  const [status, setStatus] = useState<"loading" | "form" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [inviteInfo, setInviteInfo] = useState<{ email: string; role: string; companyName: string } | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const token = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("token")
    : null;

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Invalid invitation link. No token provided.");
      return;
    }
    // Fetch invitation info
    fetch(`/api/auth/invite/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setStatus("error");
          setErrorMessage(data.error);
        } else {
          setInviteInfo(data);
          setStatus("form");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMessage("Failed to load invitation. Please try again.");
      });
  }, [token]);

  const isPasswordValid = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) { toast.error("Please meet all password requirements"); return; }
    if (!passwordsMatch) { toast.error("Passwords don't match"); return; }
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, name: name || undefined }),
      });
      const data = await res.json();
      if (res.ok && data.redirect) {
        setStatus("success");
        setTimeout(() => { window.location.href = data.redirect; }, 1500);
      } else {
        toast.error(data.error || "Failed to accept invitation");
        setSubmitting(false);
      }
    } catch {
      toast.error("Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <SaniLogo size={36} />
          <span className="text-2xl font-serif tracking-tight text-slate-800">SANI</span>
        </div>

        {/* Loading */}
        {status === "loading" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <Loader2 size={32} className="text-teal-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading your invitation...</p>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-red-500" />
            </div>
            <h2 className="font-semibold text-slate-900 mb-2">Invitation Error</h2>
            <p className="text-slate-500 text-sm mb-6">{errorMessage}</p>
            <a href="/login" className="inline-flex items-center gap-2 text-teal-600 font-medium text-sm hover:underline">
              Go to login
            </a>
          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-teal-600" />
            </div>
            <h2 className="font-semibold text-slate-900 mb-2">Welcome aboard!</h2>
            <p className="text-slate-500 text-sm">Your account is set up. Redirecting to your dashboard...</p>
          </div>
        )}

        {/* Form */}
        {status === "form" && inviteInfo && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5 text-white text-center">
              <h2 className="text-lg font-semibold mb-1">Join {inviteInfo.companyName}</h2>
              <p className="text-teal-100 text-sm">You've been invited as <span className="font-medium text-white capitalize">{inviteInfo.role}</span></p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Email (read-only) */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={inviteInfo.email}
                    disabled
                    className="w-full h-11 pl-10 pr-4 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-600"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full h-11 pl-10 pr-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Create Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full h-11 pl-10 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Password Policy */}
              {password.length > 0 && <PasswordPolicy password={password} />}

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className={`w-full h-11 pl-10 pr-10 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white ${confirmPassword && !passwordsMatch ? "border-red-300" : "border-slate-200"}`}
                  />
                  {confirmPassword.length > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {passwordsMatch ? (
                        <CheckCircle2 size={16} className="text-teal-500" />
                      ) : (
                        <AlertCircle size={16} className="text-red-400" />
                      )}
                    </div>
                  )}
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !isPasswordValid || !passwordsMatch}
                className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Accept Invitation & Create Account
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
