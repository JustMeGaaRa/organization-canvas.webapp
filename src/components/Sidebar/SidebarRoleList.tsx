import { Trash2, GripVertical } from "lucide-react";
import type { RoleTemplate } from "../../types";

interface SidebarRoleListProps {
  roles: RoleTemplate[];
  onRoleDragStart: (e: React.PointerEvent, role: RoleTemplate) => void;
  onDeleteRoleTemplate?: (id: string) => void;
}

export const SidebarRoleList = ({
  roles,
  onRoleDragStart,
  onDeleteRoleTemplate,
}: SidebarRoleListProps) => {
  return (
    <div className="flex-grow p-6 pt-0 space-y-3 overflow-y-auto">
      {roles.map((r) => (
        <div
          key={r.id}
          className="group relative p-4 pl-10 border border-slate-100 bg-slate-50 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all touch-pan-y"
          style={{ userSelect: "none" }}
        >
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
          <p className="text-xs font-bold text-slate-700">{r.role}</p>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">
            Role Template
          </p>
          {onDeleteRoleTemplate && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRoleTemplate(r.id);
              }}
              className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-all"
              title="Delete Template"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
