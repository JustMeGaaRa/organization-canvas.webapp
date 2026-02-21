import type { FC } from "react";

interface ResizeHandleProps {
  direction: "top" | "bottom" | "left" | "right";
  isSelected: boolean;
  onResizeStart: (
    e: React.PointerEvent<HTMLDivElement>,
    direction: "top" | "bottom" | "left" | "right",
  ) => void;
}

export const ResizeHandle: FC<ResizeHandleProps> = ({
  direction,
  isSelected,
  onResizeStart,
}) => {
  let positionClass = "";
  let cursorClass = "";
  let sizeClass = "";

  if (direction === "top") {
    positionClass = "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2";
    cursorClass = "cursor-ns-resize";
    sizeClass = "w-8 h-1.5";
  } else if (direction === "bottom") {
    positionClass = "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2";
    cursorClass = "cursor-ns-resize";
    sizeClass = "w-8 h-1.5";
  } else if (direction === "left") {
    positionClass = "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2";
    cursorClass = "cursor-ew-resize";
    sizeClass = "w-1.5 h-8";
  } else if (direction === "right") {
    positionClass = "right-0 top-1/2 -translate-y-1/2 translate-x-1/2";
    cursorClass = "cursor-ew-resize";
    sizeClass = "w-1.5 h-8";
  }

  return (
    <div
      onPointerDown={(e) => onResizeStart(e, direction)}
      className={`absolute ${positionClass} ${sizeClass} bg-slate-400 rounded-full opacity-0 group-hover:opacity-100 ${isSelected ? "[@media(hover:none)]:opacity-100" : ""} ${cursorClass} hover:bg-blue-500 active:bg-blue-600 transition-all z-30`}
    />
  );
};
