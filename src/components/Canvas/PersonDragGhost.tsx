import type { PersonTouchDragState } from "../../hooks/usePersonAssignmentDrag";

interface PersonDragGhostProps {
  personTouchDrag: PersonTouchDragState | null;
}

export const PersonDragGhost = ({ personTouchDrag }: PersonDragGhostProps) => {
  if (!personTouchDrag) return null;

  return (
    <div
      ref={(el) => {
        if (el) {
          try {
            el.setPointerCapture(personTouchDrag.pointerId);
          } catch {
            // Ignore capture errors on unmount or invalid pointer ids
          }
        }
      }}
      className="fixed z-[9999] pointer-events-none bg-white border-2 border-green-400 rounded-xl p-3 flex items-center gap-2 shadow-xl -translate-x-1/2 -translate-y-1/2"
      style={{ left: personTouchDrag.x, top: personTouchDrag.y }}
    >
      <img
        src={personTouchDrag.person.imageUrl}
        className="w-8 h-8 rounded-full"
        alt=""
      />
      <span className="text-xs font-bold text-slate-700">
        {personTouchDrag.person.name}
      </span>
    </div>
  );
};
