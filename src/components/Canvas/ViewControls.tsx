import { Briefcase, User } from "lucide-react";

interface ViewControlsProps {
  viewMode: "structure" | "chart";
  setViewMode: (mode: "structure" | "chart") => void;
}

export const ViewControls = ({ viewMode, setViewMode }: ViewControlsProps) => {
  return (
    <div
      className="absolute top-6 left-1/2 -translate-x-1/2 z-40"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex bg-white/90 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/60 shadow-xl">
        <button
          onClick={() => setViewMode("structure")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
            viewMode === "structure"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Briefcase size={14} /> <span>Structure</span>
        </button>
        <button
          onClick={() => setViewMode("chart")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
            viewMode === "chart"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <User size={14} /> <span>Chart</span>
        </button>
      </div>
    </div>
  );
};
