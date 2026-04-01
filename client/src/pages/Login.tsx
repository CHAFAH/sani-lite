import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const isDev = import.meta.env.DEV;

export default function Login() {
  useEffect(() => {
    if (!isDev) {
      window.location.href = getLoginUrl();
    }
  }, []);

  if (isDev) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center gap-6 w-full max-w-sm">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Sani Lite</h1>
            <p className="text-slate-500 text-sm">Development mode</p>
          </div>

          <a
            href="/api/dev-login"
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Dev Bypass Login (company_owner)
          </a>

          <div className="w-full border-t border-slate-100 pt-4 flex flex-col gap-3">
            <p className="text-xs text-slate-400 text-center uppercase tracking-wide">Or use real OAuth</p>
            <a
              href={getLoginUrl()}
              className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 px-6 rounded-lg transition-colors text-sm"
            >
              Sign in with Google / OAuth
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
        <p className="text-slate-600 text-sm">Redirecting to login...</p>
      </div>
    </div>
  );
}
