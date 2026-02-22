import { Briefcase, User } from "lucide-react";

interface ViewControlsProps {
  viewMode: "structure" | "chart";
  setViewMode: (mode: "structure" | "chart") => void;
}

export const ViewControls = ({ viewMode, setViewMode }: ViewControlsProps) => {
  return (
    <div
      className="absolute top-safe-6 left-1/2 -translate-x-1/2 z-40 [@media(max-width:1023px)]:hidden"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex bg-white/90 backdrop-blur-sm p-1.5 rounded-full border border-slate-200/60 shadow-xl">
        <button
          onClick={() => setViewMode("structure")}
          className={`flex items-center gap-2 px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
            viewMode === "structure"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Briefcase size={16} /> <span className="hidden md:inline">Structure</span>
        </button>
        <button
          onClick={() => setViewMode("chart")}
          className={`flex items-center gap-2 px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
            viewMode === "chart"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <User size={16} /> <span className="hidden md:inline">Chart</span>
        </button>
      </div>
    </div>
  );
};
