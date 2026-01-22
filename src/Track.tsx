/**
 * Track Component
 * A resizable, movable frame that sits behind cards
 */
export const Track = ({
  trackData, isDragging, isResizing, onMouseDown, onResizeStart, isOverDeleteZone,
}) => {
  const { x, y, width, height } = trackData;

  return (
    <div
      onMouseDown={(e) => onMouseDown(e, trackData.id)}
      className={`absolute border-2 border-dashed rounded-2xl transition-shadow group select-none ${isDragging
        ? `shadow-xl border-blue-400 bg-blue-50/10 z-20 ${isOverDeleteZone ? "border-red-500 opacity-50" : ""}`
        : "border-slate-300 bg-transparent z-0 hover:border-slate-400"}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        cursor: isResizing ? "grabbing" : "grab",
      }}
    >
      {/* Resize Handles - Splitter-like thumbs appearing on hover */}
      {/* Top Handle */}
      <div
        onMouseDown={(e) => onResizeStart(e, trackData.id, "top")}
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-1.5 bg-slate-400 rounded-full opacity-0 group-hover:opacity-100 cursor-ns-resize hover:bg-blue-500 transition-all z-30" />
      {/* Bottom Handle */}
      <div
        onMouseDown={(e) => onResizeStart(e, trackData.id, "bottom")}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-1.5 bg-slate-400 rounded-full opacity-0 group-hover:opacity-100 cursor-ns-resize hover:bg-blue-500 transition-all z-30" />
      {/* Left Handle */}
      <div
        onMouseDown={(e) => onResizeStart(e, trackData.id, "left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-8 bg-slate-400 rounded-full opacity-0 group-hover:opacity-100 cursor-ew-resize hover:bg-blue-500 transition-all z-30" />
      {/* Right Handle */}
      <div
        onMouseDown={(e) => onResizeStart(e, trackData.id, "right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-1.5 h-8 bg-slate-400 rounded-full opacity-0 group-hover:opacity-100 cursor-ew-resize hover:bg-blue-500 transition-all z-30" />
    </div>
  );
};
