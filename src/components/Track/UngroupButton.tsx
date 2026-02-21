import type { FC } from "react";
import { Ungroup } from "lucide-react";

interface UngroupButtonProps {
  onUngroup: (e: React.MouseEvent | React.PointerEvent) => void;
  isSelected: boolean;
}

export const UngroupButton: FC<UngroupButtonProps> = ({
  onUngroup,
  isSelected,
}) => {
  return (
    <button
      onClick={onUngroup}
      onPointerDown={(e) => e.stopPropagation()}
      className={`absolute bottom-full right-4 p-1 rounded-t-md rounded-b-none shadow-sm opacity-0 group-hover:opacity-100 ${isSelected ? "[@media(hover:none)]:opacity-100" : ""} transition-opacity z-30 border-x border-t border-b-0 ${
        isSelected
          ? "bg-blue-500 text-white border-blue-500 hover:bg-red-500 hover:border-red-500"
          : "bg-slate-300 text-slate-700 border-slate-300 hover:bg-red-100 hover:text-red-700 hover:border-red-200"
      }`}
      title="Ungroup cards"
    >
      <Ungroup size={14} />
    </button>
  );
};
