import { getLoginUrl } from "@/const";
import { useState } from "react";
import { Loader2, Shield, Globe, Users, ArrowRight, Mail, Eye, EyeOff } from "lucide-react";
import { SaniLogo } from "@/components/MarketingLayout";
import { toast } from "sonner";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please enter email and password"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/email-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.redirect) {
        window.location.href = data.redirect;
      } else {
        toast.error(data.error || "Invalid credentials");
        setLoading(false);
      }
    } catch {
      toast.error("Login failed. Try again.");
      setLoading(false);
    }
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
            <h2 className="text-2xl font-serif font-normal text-slate-900 mb-2">Sign in</h2>
            <p className="text-slate-500 text-sm">Choose your preferred sign-in method</p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            {/* Google */}
            <a
              href={getLoginUrl() !== "#" ? getLoginUrl() : "/api/dev-login"}
              className="w-full flex items-center justify-center gap-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-sm">Continue with Google</span>
            </a>

            {/* Apple */}
            <button
              onClick={() => toast.info("Apple Sign-In coming soon")}
              className="w-full flex items-center justify-center gap-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="text-sm">Continue with Apple</span>
            </button>

            {/* SSO */}
            <button
              onClick={() => toast.info("Contact your admin for SSO configuration")}
              className="w-full flex items-center justify-center gap-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl transition-all"
            >
              <Shield className="w-5 h-5 text-slate-500" />
              <span className="text-sm">Sign in with SSO</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#FEFCF8] px-4 text-slate-400">or sign in with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
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
                <button type="button" className="text-xs text-teal-600 hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-11 pl-4 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Sign in
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-sm text-slate-500 text-center mt-6">
            Don't have an account?{" "}
            <a href="/api/dev-login?redirect=/signup" className="text-teal-600 font-medium hover:underline">Sign up</a>
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
