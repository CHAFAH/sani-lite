import { Button } from "@/components/ui/button";

import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FEFCF8]">
      <div className="text-center max-w-lg mx-4">
        <p className="text-8xl font-normal tracking-tight mb-4" style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}>
          404
        </p>
        <h2 className="text-xl font-semibold mb-3 font-sans">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
          Sorry, the page you are looking for doesn't exist.
          It may have been moved or deleted.
        </p>
        <Button
          onClick={() => setLocation("/")}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}
