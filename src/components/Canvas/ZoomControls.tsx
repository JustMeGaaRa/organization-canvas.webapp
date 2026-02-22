import { Minus, Plus, Focus, Maximize2 } from "lucide-react";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFitToScreen: () => void;
}

export const ZoomControls = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onFitToScreen,
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

        <button
          onClick={onZoomIn}
          className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Zoom in"
        >
          <Plus size={16} />
        </button>

        <div className="w-px h-4 bg-slate-200 mx-0.5" />

        <button
          onClick={onFitToScreen}
          className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Fit to screen"
        >
          <Maximize2 size={16} />
        </button>

        <button
          onClick={onReset}
          className="p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          title="Reset zoom (100%)"
        >
          <Focus size={16} />
        </button>
      </div>
    </div>
  );
};
