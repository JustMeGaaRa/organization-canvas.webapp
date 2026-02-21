import { Trash2 } from "lucide-react";
import type { Person } from "../../types";

interface SidebarPersonListProps {
  people: Person[];
  onPersonDragStart: (e: React.DragEvent, person: Person) => void;
  onDeletePersonTemplate?: (id: string) => void;
  onPersonTouchDragStart?: (
    person: Person,
    x: number,
    y: number,
    pointerId: number,
  ) => void;
}

export const SidebarPersonList = ({
  people,
  onPersonDragStart,
  onDeletePersonTemplate,
  onPersonTouchDragStart,
}: SidebarPersonListProps) => {
  return (
    <div className="flex-grow p-6 pt-0 space-y-3 overflow-y-auto">
      {people.map((p) => (
        <div
          key={p.id}
          draggable
          onDragStart={(e) => onPersonDragStart(e, p)}
          onPointerDown={(e) => {
            if (e.pointerType === "touch" && onPersonTouchDragStart) {
              onPersonTouchDragStart(p, e.clientX, e.clientY, e.pointerId);
            }
          }}
          className="group relative p-3 border border-slate-100 bg-white rounded-xl cursor-grab hover:border-green-200 hover:bg-green-50 flex items-center gap-3 transition-all"
          style={{ userSelect: "none", touchAction: "pan-y" }}
        >
          <img
            src={p.imageUrl}
            className="w-8 h-8 rounded-full shadow-sm"
            alt=""
          />
          <div>
            <p className="text-xs font-bold text-slate-700">{p.name}</p>
            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tight">
              Person
            </p>
          </div>
          {onDeletePersonTemplate && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDeletePersonTemplate(p.id);
              }}
              className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-all"
              title="Delete Person"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
