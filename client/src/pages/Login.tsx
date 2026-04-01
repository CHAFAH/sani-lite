import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Login() {
  useEffect(() => {
    // Redirect to OAuth login portal
    window.location.href = getLoginUrl();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
        <p className="text-slate-600 text-sm">Redirecting to login...</p>
      </div>
    </div>
  );
}
