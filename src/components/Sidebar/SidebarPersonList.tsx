import { Trash2, GripVertical } from "lucide-react";
import type { Person } from "../../types";

interface SidebarPersonListProps {
  people: Person[];
  onPersonDragStart: (e: React.PointerEvent, person: Person) => void;
  onDeletePersonTemplate?: (id: string) => void;
}

export const SidebarPersonList = ({
  people,
  onPersonDragStart,
  onDeletePersonTemplate,
}: SidebarPersonListProps) => {
  return (
    <div className="flex-grow p-6 pt-0 space-y-3 overflow-y-auto">
      {people.map((p) => (
        <div
          key={p.id}
          className="group relative p-3 border border-slate-100 bg-white rounded-xl flex items-center gap-3 transition-all touch-pan-y"
          style={{ userSelect: "none" }}
        >
          <div
            onPointerDown={(e) => {
              e.stopPropagation();
              onPersonDragStart(e, p);
            }}
            className="p-1.5 -ml-2 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing"
            style={{ touchAction: "none" }}
          >
            <GripVertical size={16} />
          </div>
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
