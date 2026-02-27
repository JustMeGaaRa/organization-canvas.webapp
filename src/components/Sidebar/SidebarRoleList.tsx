import { useState } from "react";
import { Trash2, GripVertical, Pencil, Save } from "lucide-react";
import type { RoleTemplate } from "../../types";

interface SidebarRoleListProps {
  roles: RoleTemplate[];
  onRoleDragStart: (e: React.PointerEvent, role: RoleTemplate) => void;
  onDeleteRoleTemplate?: (id: string) => void;
  onUpdateRoleTemplate?: (id: string, updates: Partial<RoleTemplate>) => void;
  isEditMode?: boolean;
}

export const SidebarRoleList = ({
  roles,
  onRoleDragStart,
  onDeleteRoleTemplate,
  onUpdateRoleTemplate,
  isEditMode = false,
}: SidebarRoleListProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<RoleTemplate>>({});

  const handleEditStart = (role: RoleTemplate) => {
    setEditingId(role.id);
    setEditForm({ role: role.role, summary: role.summary });
  };

  const handleSaveEdit = (id: string) => {
    onUpdateRoleTemplate?.(id, editForm);
    setEditingId(null);
  };
  return (
    <div className="flex-grow p-6 pt-0 space-y-3 overflow-y-auto">
      {roles.map((r) => (
        <div
          key={r.id}
          className={`group relative p-4 border rounded-xl transition-all touch-pan-y ${
            editingId === r.id
              ? "border-blue-400 bg-white ring-4 ring-blue-50 shadow-lg"
              : `border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50 ${!isEditMode ? "pl-10" : "pl-4"}`
          }`}
          style={{ userSelect: "none" }}
        >
          {editingId === r.id ? (
            <div className="space-y-4 cursor-default">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  value={editForm.role || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:bg-white outline-none"
                  placeholder="e.g. Senior Developer"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Role Summary
                </label>
                <textarea
                  value={editForm.summary || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, summary: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm h-24 focus:bg-white outline-none resize-none"
                  placeholder="Briefly describe the responsibilities..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingId(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveEdit(r.id)}
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
                    onRoleDragStart(e, r);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing"
                  style={{ touchAction: "none" }}
                >
                  <GripVertical size={16} />
                </div>
              )}
              <p className="text-xs font-bold text-slate-700">{r.role}</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">
                Role Template
              </p>
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-all">
                {isEditMode && (
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditStart(r);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                    title="Edit Template"
                  >
                    <Pencil size={14} />
                  </button>
                )}
                {onDeleteRoleTemplate && (
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRoleTemplate(r.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                    title="Delete Template"
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
