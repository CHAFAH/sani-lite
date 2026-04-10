import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { Loader2, Shield, Globe, Users, ArrowRight } from "lucide-react";
import { SaniLogo } from "@/components/MarketingLayout";

const isDev = import.meta.env.DEV;

export default function Login() {
  useEffect(() => {
    if (!isDev) {
      window.location.href = getLoginUrl();
    }
  }, []);

  if (isDev) {
    return (
      <div className="min-h-screen flex">
        {/* Left Panel — Branding */}
        <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-teal-700 via-teal-600 to-teal-800 relative overflow-hidden flex-col justify-between p-12 text-white">
          {/* Background pattern */}
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

          {/* Floating decorative circles */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-32 left-10 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl" />

          {/* Logo + tagline */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <SaniLogo size={48} />
              <span className="text-3xl font-serif font-normal tracking-tight">SANI</span>
            </div>
            <p className="text-teal-200 text-sm ml-1">The Employee OS</p>
          </div>

          {/* Main headline */}
          <div className="relative z-10 flex-1 flex flex-col justify-center -mt-12">
            <h1 className="text-4xl xl:text-5xl font-serif font-normal leading-tight mb-6">
              Built for <br />
              <span className="italic text-amber-300">Modern Teams</span>
            </h1>
            <p className="text-teal-100 text-lg leading-relaxed max-w-md">
              Replace HR, payroll, IT, and finance tools with one unified platform. 
              Powered by AI. Loved by people ops.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mt-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Globe className="w-4 h-4 text-amber-300" />
                <span>Global Payroll</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Users className="w-4 h-4 text-amber-300" />
                <span>Core HR</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Shield className="w-4 h-4 text-amber-300" />
                <span>Compliance</span>
              </div>
            </div>
          </div>

          {/* Trust badge */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-teal-200 text-sm">
              <Shield className="w-4 h-4" />
              <span>SOC 2 Compliant · GDPR Ready · 256-bit Encryption</span>
            </div>
          </div>
        </div>

        {/* Right Panel — Login Form */}
        <div className="flex-1 flex items-center justify-center bg-[#FEFCF8] p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile logo (shown on small screens) */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
              <SaniLogo size={40} />
              <span className="text-2xl font-serif font-normal tracking-tight text-slate-800">SANI</span>
            </div>

            {/* Welcome text */}
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-normal text-slate-900 mb-2">Welcome back</h2>
              <p className="text-slate-500 text-sm">Sign in to your account to continue</p>
            </div>

            {/* Dev Bypass Login */}
            <a
              href="/api/dev-login"
              className="w-full flex items-center justify-center gap-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg group"
            >
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="48" rx="12" fill="white" fillOpacity="0.3" />
                  <path d="M14 16C14 16 18 10 28 14C38 18 32 24 24 24C16 24 10 30 20 34C30 38 34 32 34 32" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
                </svg>
              </div>
              <span>Dev Bypass Login</span>
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>

            <p className="text-xs text-slate-400 text-center mt-2 mb-6">Development mode — auto-login as company owner</p>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#FEFCF8] px-4 text-slate-400 uppercase tracking-widest">or continue with</span>
              </div>
            </div>

            {/* OAuth Login */}
            <a
              href={getLoginUrl()}
              className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 text-slate-700 font-medium py-3.5 px-6 rounded-xl transition-all duration-200 group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Sign in with Google / OAuth</span>
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-teal-600" />
            </a>

            {/* Footer */}
            <div className="mt-10 text-center">
              <p className="text-xs text-slate-400">
                By signing in, you agree to our{" "}
                <a href="/terms" className="text-teal-600 hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="/privacy" className="text-teal-600 hover:underline">Privacy Policy</a>
              </p>
            </div>

            {/* Bottom decoration */}
            <div className="mt-12 flex items-center justify-center gap-6 text-slate-300">
              <div className="w-8 h-px bg-slate-200" />
              <SaniLogo size={20} className="opacity-30" />
              <div className="w-8 h-px bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Production: auto-redirect to OAuth
  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding (same as dev) */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-teal-700 via-teal-600 to-teal-800 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid2)" />
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
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-teal-200 text-sm">
            <Shield className="w-4 h-4" />
            <span>SOC 2 Compliant · GDPR Ready · 256-bit Encryption</span>
          </div>
        </div>
      </div>

      {/* Right Panel — Loading */}
      <div className="flex-1 flex items-center justify-center bg-[#FEFCF8] p-6">
        <div className="text-center">
          <SaniLogo size={48} className="mx-auto mb-6" />
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-600 text-sm">Redirecting to sign in...</p>
        </div>
      </div>
    </div>
  );
}
