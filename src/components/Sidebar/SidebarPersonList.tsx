import { useState } from "react";
import { Trash2, GripVertical, Pencil, Save, ImageIcon } from "lucide-react";
import type { Person } from "../../types";

interface SidebarPersonListProps {
  people: Person[];
  onPersonDragStart: (e: React.PointerEvent, person: Person) => void;
  onDeletePersonTemplate?: (id: string) => void;
  onUpdatePersonTemplate?: (id: string, updates: Partial<Person>) => void;
  isEditMode?: boolean;
}

export const SidebarPersonList = ({
  people,
  onPersonDragStart,
  onDeletePersonTemplate,
  onUpdatePersonTemplate,
  isEditMode = false,
}: SidebarPersonListProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Person>>({});

  const handleEditStart = (person: Person) => {
    setEditingId(person.id);
    setEditForm({ name: person.name, imageUrl: person.imageUrl });
  };

  const handleSaveEdit = (id: string) => {
    onUpdatePersonTemplate?.(id, editForm);
    setEditingId(null);
  };
  return (
    <div className="flex-grow p-6 pt-0 space-y-3 overflow-y-auto">
      {people.map((p) => (
        <div
          key={p.id}
          className={`group relative p-3 border rounded-xl transition-all touch-pan-y ${
            editingId === p.id
              ? "border-blue-400 bg-white ring-4 ring-blue-50 shadow-lg"
              : "border-slate-100 bg-white flex items-center gap-3"
          }`}
          style={{ userSelect: "none" }}
        >
          {editingId === p.id ? (
            <div className="space-y-4 cursor-default w-full">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <img
                    src={editForm.imageUrl || p.imageUrl}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
                    alt="Preview"
                  />
                </div>
                <div className="flex-grow space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:bg-white outline-none"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Avatar URL
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editForm.imageUrl || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, imageUrl: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] focus:bg-white outline-none font-mono"
                    placeholder="https://images.unsplash.com/..."
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
                    <ImageIcon size={14} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingId(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveEdit(p.id)}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-2"
                >
                  <Save size={14} /> Save
                </button>
              </div>
            </div>
          ) : (
            <>
              {!isEditMode && (
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
              )}
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
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-all">
                {isEditMode && (
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditStart(p);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                    title="Edit Person"
                  >
                    <Pencil size={14} />
                  </button>
                )}
                {onDeletePersonTemplate && (
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePersonTemplate(p.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                    title="Delete Person"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
