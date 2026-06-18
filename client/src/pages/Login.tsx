import { useState } from "react";
import { Loader2, Shield, Globe, Users, ArrowRight, Mail, Eye, EyeOff, Lock } from "lucide-react";
import { SaniLogo } from "@/components/MarketingLayout";
import { toast } from "sonner";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please enter email and password"); return; }
    if (mode === "register" && password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const body: any = { email, password };
      if (mode === "register" && name) body.name = name;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.redirect) {
        window.location.href = data.redirect;
      } else {
        toast.error(data.error || "Authentication failed");
        setLoading(false);
      }
    } catch {
      toast.error("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-teal-700 via-teal-600 to-teal-800 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-32 left-10 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <SaniLogo size={48} />
            <span className="text-3xl font-serif font-normal tracking-tight">SANI</span>
          </div>
          <p className="text-teal-200 text-sm ml-1">The Employee OS</p>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center -mt-12">
          <h1 className="text-4xl xl:text-5xl font-serif font-normal leading-tight mb-6">
            Built for <br />
            <span className="italic text-amber-300">Modern Teams</span>
          </h1>
          <p className="text-teal-100 text-lg leading-relaxed max-w-md">
            Replace HR, payroll, IT, and finance tools with one unified platform.
            Powered by AI. Loved by people ops.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              <Globe className="w-4 h-4 text-amber-300" /><span>Global Payroll</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              <Users className="w-4 h-4 text-amber-300" /><span>Core HR</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              <Shield className="w-4 h-4 text-amber-300" /><span>Compliance</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-teal-200 text-sm">
            <Shield className="w-4 h-4" />
            <span>SOC 2 Compliant · GDPR Ready · 256-bit Encryption</span>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center bg-[#FEFCF8] p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <SaniLogo size={40} />
            <span className="text-2xl font-serif font-normal tracking-tight text-slate-800">SANI</span>
          </div>

          {/* Welcome text */}
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-normal text-slate-900 mb-2">
              {mode === "login" ? "Sign in" : "Create account"}
            </h2>
            <p className="text-slate-500 text-sm">
              {mode === "login" ? "Choose your preferred sign-in method" : "Get started with your SANI account"}
            </p>
          </div>

          {/* Google */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-sm">Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#FEFCF8] px-4 text-slate-400">or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full h-11 pl-4 pr-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full h-11 pl-10 pr-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-600">Password</label>
                {mode === "login" && (
                  <button type="button" className="text-xs text-teal-600 hover:underline">Forgot password?</button>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "Create a strong password" : "Enter your password"}
                  className="w-full h-11 pl-10 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password policy for register */}
            {mode === "register" && password.length > 0 && (
              <PasswordPolicy password={password} />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="text-sm text-slate-500 text-center mt-6">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            {mode === "login" ? (
              <a href="/signup" className="text-teal-600 font-medium hover:underline">Sign up</a>
            ) : (
              <button onClick={() => setMode("login")} className="text-teal-600 font-medium hover:underline">Sign in</button>
            )}
          </p>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-[11px] text-slate-400">
              By signing in, you agree to our{" "}
              <a href="/terms" className="text-teal-600 hover:underline">Terms</a>
              {" "}and{" "}
              <a href="/privacy" className="text-teal-600 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordPolicy({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains a number", met: /[0-9]/.test(password) },
    { label: "Contains special character (!@#$...)", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
      {checks.map((check) => (
        <div key={check.label} className="flex items-center gap-2 text-xs">
          <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${check.met ? "bg-teal-500" : "bg-slate-200"}`}>
            {check.met && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className={check.met ? "text-teal-700" : "text-slate-500"}>{check.label}</span>
        </div>
      ))}
    </div>
  );
}
