import { MinusCircle, PlusCircle, Focus } from "lucide-react";

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
      className="absolute bottom-8 right-8 z-40"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-xl flex items-center p-1.5 gap-1">
        <button
          onClick={onZoomOut}
          className="p-2 hover:bg-slate-50 text-slate-500 hover:text-blue-600 transition-colors"
        >
          <MinusCircle size={20} />
        </button>
        <div className="px-2 min-w-[50px] text-center border-x border-slate-100 cursor-default">
          <span className="text-[11px] font-bold text-slate-600">
            {Math.round(scale * 100)}%
          </span>
        </div>
        <button
          onClick={onZoomIn}
          className="p-2 hover:bg-slate-50 text-slate-500 hover:text-blue-600 transition-colors"
        >
          <PlusCircle size={20} />
        </button>
        <button
          onClick={onReset}
          className="p-2 ml-1 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
          title="Reset"
        >
          <Focus size={18} />
        </button>
      </div>
    </div>
  );
};
