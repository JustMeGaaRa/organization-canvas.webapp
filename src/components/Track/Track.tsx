import { useState, useRef, useEffect } from "react";
import type { FC } from "react";
import { ResizeHandle } from "./ResizeHandle";
import { Pencil } from "lucide-react";
import type { TrackData } from "../../types";

/**
 * Track Component
 * A resizable, movable frame that sits behind cards
 */
export const Track: FC<{
  trackData: TrackData;
  isDragging: boolean;
  isResizing: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>, trackId: string) => void;
  onResizeStart: (
    e: React.MouseEvent<HTMLDivElement>,
    trackId: string,
    direction: "top" | "bottom" | "left" | "right",
  ) => void;
  onNameChange: (id: string, newName: string) => void;
  isOverDeleteZone: boolean;
  isSelected: boolean;
}> = ({
  trackData,
  isDragging,
  isResizing,
  onMouseDown,
  onResizeStart,
  onNameChange,
  isOverDeleteZone,
  isSelected,
}) => {
  const { x, y, width, height, name } = trackData;
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name || "New Group");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleResize = (
    e: React.MouseEvent<HTMLDivElement>,
    direction: "top" | "bottom" | "left" | "right",
  ) => {
    onResizeStart(e, trackData.id, direction);
  };

  const handleStartEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempName(name || "New Group");
    setIsEditing(true);
  };

  const handleNameSave = () => {
    setIsEditing(false);
    if (tempName.trim()) {
      onNameChange(trackData.id, tempName);
    } else {
      setTempName(name || "New Group");
    }
  };

  return (
    <div
      onMouseDown={(e) => onMouseDown(e, trackData.id)}
      className={`absolute border-2 border-dashed rounded-2xl transition-shadow group select-none ${
        isDragging
          ? `shadow-xl border-blue-400 bg-blue-50/10 z-20 ${isOverDeleteZone ? "border-red-500 opacity-50" : ""}`
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
      {/* Label */}
      <div
        className={`absolute -top-3 left-4 px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm border z-30 ${
          isSelected
            ? "bg-blue-500 text-white border-blue-500"
            : "bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600"
        }`}
        onClick={handleStartEditing}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleNameSave();
              e.stopPropagation();
            }}
            className={`bg-transparent outline-none min-w-[60px] text-center ${isSelected ? "text-white placeholder-blue-200" : "text-slate-700"}`}
            style={{ width: `${Math.max(tempName.length * 8, 60)}px` }}
          />
        ) : (
          <>
            {name || "Group"}
            <Pencil
              size={10}
              className={`opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? "text-white" : "text-slate-400"}`}
            />
          </>
        )}
      </div>

      <ResizeHandle direction="top" onResizeStart={handleResize} />
      <ResizeHandle direction="bottom" onResizeStart={handleResize} />
      <ResizeHandle direction="left" onResizeStart={handleResize} />
      <ResizeHandle direction="right" onResizeStart={handleResize} />
    </div>
  );
};
