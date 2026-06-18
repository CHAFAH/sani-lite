import React, { useState } from "react";

type Marker = { id: string; title: string; top: string; left: string; status?: "live" | "ok" | "down" };

export default function GlobalPayrollMap({
  src,
  markers = [],
  alt = "Global payroll map",
}: {
  src: string;
  markers?: Marker[];
  alt?: string;
}) {
  const [hovered, setHovered] = useState<null | Marker>(null);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-50">
      <img src={src} alt={alt} className="w-full h-auto block" />

      <div className="absolute inset-0 pointer-events-none">
        {markers.map((m) => (
          <div
            key={m.id}
            onMouseEnter={() => setHovered(m)}
            onMouseLeave={() => setHovered((h) => (h?.id === m.id ? null : h))}
            title={m.title}
            className={`absolute rounded-full w-7 h-7 flex items-center justify-center border border-slate-200 shadow-sm pointer-events-auto transition-all transform -translate-x-1/2 -translate-y-1/2 ${
              m.status === "live" ? "bg-white/95 animate-pulse" : "bg-white/95"
            }`}
            style={{ top: m.top, left: m.left }}
          >
            <span
              className={`text-xs font-semibold ${
                m.status === "down" ? "text-red-500" : m.status === "ok" ? "text-emerald-600" : "text-teal-600"
              }`}
            >
              •
            </span>
          </div>
        ))}

        {hovered && (
          <div
            className="absolute z-50 pointer-events-auto bg-white rounded-lg shadow-lg px-3 py-2 text-xs border"
            style={{ top: `calc(${hovered.top} - 36px)`, left: hovered.left, transform: "translateX(-50%)" }}
          >
            <div className="font-semibold text-sm">{hovered.title}</div>
            <div className="text-xs text-muted-foreground">Status: {hovered.status || "live"}</div>
          </div>
        )}
      </div>
    </div>
  );
}
