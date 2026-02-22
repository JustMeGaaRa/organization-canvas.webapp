import { Minus, Plus, Focus } from "lucide-react";

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export const ZoomControls = ({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
}: ZoomControlsProps) => {
  return (
    <div
      className="absolute bottom-safe-8 left-safe-8 z-40 [@media(hover:none)]:hidden"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-full shadow-xl flex items-center p-1.5 gap-0.5">
        <button
          onClick={onZoomOut}
          className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Zoom out"
        >
          <Minus size={16} />
        </button>

        <div className="px-2 min-w-[46px] text-center">
          <span className="text-[10px] font-bold tracking-widest text-slate-500">
            {Math.round(scale * 100)}%
          </span>
        </div>

        <button
          onClick={onZoomIn}
          className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Zoom in"
        >
          <Plus size={16} />
        </button>

        {/* Separator before Reset */}
        <div className="w-px h-4 bg-slate-200 mx-0.5" />

        <button
          onClick={onReset}
          className="p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          title="Reset zoom"
        >
          <Focus size={16} />
        </button>
      </div>
    </div>
  );
};
