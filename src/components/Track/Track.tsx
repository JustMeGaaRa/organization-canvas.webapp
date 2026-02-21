import { motion } from "framer-motion";
import type { FC } from "react";
import { ResizeHandle } from "./ResizeHandle";
import { TrackLabel } from "./TrackLabel";
import { UngroupButton } from "./UngroupButton";
import type { TrackData } from "../../types";

/**
 * Track Component
 * A resizable, movable frame that sits behind cards
 */
export const Track: FC<{
  trackData: TrackData;
  isDragging: boolean;
  isResizing: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>, trackId: string) => void;
  onResizeStart: (
    e: React.PointerEvent<HTMLDivElement>,
    trackId: string,
    direction: "top" | "bottom" | "left" | "right",
  ) => void;
  onNameChange: (id: string, newName: string) => void;
  onUngroup: (id: string) => void;
  isDanger: boolean;
  isSelected: boolean;
  animate?: boolean;
}> = ({
  trackData,
  isDragging,
  isResizing,
  onPointerDown,
  onResizeStart,
  onNameChange,
  onUngroup,
  isDanger,
  isSelected,
  animate = false,
}) => {
  const { x, y, width, height } = trackData;

  const handleResize = (
    e: React.PointerEvent<HTMLDivElement>,
    direction: "top" | "bottom" | "left" | "right",
  ) => {
    onResizeStart(e, trackData.id, direction);
  };

  return (
    <motion.div
      // Remove layout={animate}
      initial={animate ? { opacity: 0, scale: 0.9 } : false}
      animate={{ opacity: 1, scale: 1 }}
      exit={animate ? { opacity: 0, scale: 0.9 } : undefined}
      transition={{ duration: 0.3 }}
      onPointerDown={(e) => onPointerDown(e, trackData.id)}
      className={`absolute border-2 border-dashed rounded-2xl group select-none ${
        animate
          ? "transition-[top,left,width,height,box-shadow] duration-500 ease-in-out"
          : "transition-shadow"
      } ${
        isDragging
          ? `shadow-xl border-blue-400 bg-blue-50/10 z-20 ${isDanger ? "border-red-500 opacity-50" : ""}`
          : `${isSelected ? "border-blue-500 bg-blue-50/5 z-10" : "border-slate-300 bg-transparent z-0 hover:border-slate-400"}`
      }`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        cursor: isResizing ? "grabbing" : "grab",
      }}
    >
      <TrackLabel
        name={trackData.name || ""}
        isSelected={isSelected}
        onNameChange={(newName) => onNameChange(trackData.id, newName)}
      />

      <UngroupButton
        onUngroup={(e) => {
          e.stopPropagation(); // Prevent select/drag
          onUngroup(trackData.id);
        }}
        isSelected={isSelected}
      />

      {(["top", "bottom", "left", "right"] as const).map((dir) => (
        <ResizeHandle key={dir} direction={dir} isSelected={isSelected} onResizeStart={handleResize} />
      ))}
    </motion.div>
  );
};
