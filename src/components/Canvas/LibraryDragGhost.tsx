import type { LibraryDragState } from "../../hooks/useLibraryDrag";

interface LibraryDragGhostProps {
  libraryDrag: LibraryDragState | null;
}

export const LibraryDragGhost = ({ libraryDrag }: LibraryDragGhostProps) => {
  if (!libraryDrag) return null;

  const { item, x, y, pointerId } = libraryDrag;

  return (
    <div
      ref={(el) => {
        if (el) {
          try {
            el.setPointerCapture(pointerId);
          } catch {
            // Ignore capture errors on unmount or invalid pointer ids
          }
        }
      }}
      className="fixed z-[9999] pointer-events-none opacity-50 flex items-center -translate-x-1/2 -translate-y-1/2"
      style={{ left: x, top: y }}
    >
      {item.type === "person" ? (
        <div className="p-3 border border-slate-200 bg-white rounded-xl shadow-xl flex items-center gap-3 w-64 touch-none">
          <img
            src={item.data.imageUrl}
            className="w-8 h-8 rounded-full shadow-sm"
            alt=""
          />
          <div>
            <p className="text-xs font-bold text-slate-700">{item.data.name}</p>
            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tight">
              Person
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 pl-10 border border-slate-200 bg-slate-50 rounded-xl shadow-xl w-64 touch-none text-left">
          <p className="text-xs font-bold text-slate-700">{item.data.role}</p>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">
            Role Template
          </p>
        </div>
      )}
    </div>
  );
};
