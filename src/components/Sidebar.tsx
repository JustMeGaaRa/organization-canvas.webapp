import { useState } from "react";
import {
  ChevronRight,
  Settings2,
  Briefcase,
  Users,
  Search,
  Plus,
  AlertCircle,
  ChevronLeft,
  Trash2,
} from "lucide-react";
import type { RoleTemplate, Person } from "../types";

interface SidebarProps {
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
  onNavigateToLibrary: () => void;
  roleTemplates: RoleTemplate[];
  peopleTemplates: Person[];
  onAddRoleTemplate: (name: string) => void;
  onAddPersonTemplate: (name: string) => void;
  onDeleteRoleTemplate?: (id: string) => void;
  onDeletePersonTemplate?: (id: string) => void;
  onRoleDragStart: (e: React.MouseEvent, role: RoleTemplate) => void;
}

export const Sidebar = ({
  isOpen,
  onToggle,
  onNavigateToLibrary,
  roleTemplates,
  peopleTemplates,
  onAddRoleTemplate,
  onAddPersonTemplate,
  onDeleteRoleTemplate,
  onDeletePersonTemplate,
  onRoleDragStart,
}: SidebarProps) => {
  const [activeTab, setActiveTab] = useState<"roles" | "people">("roles");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRoles = roleTemplates.filter((r) =>
    r.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredPeople = peopleTemplates.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isDuplicate =
    activeTab === "roles"
      ? roleTemplates.some(
          (r) => r.role.toLowerCase() === searchQuery.trim().toLowerCase(),
        )
      : peopleTemplates.some(
          (p) => p.name.toLowerCase() === searchQuery.trim().toLowerCase(),
        );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isDuplicate) return;
    if (activeTab === "roles") {
      onAddRoleTemplate(searchQuery.trim());
    } else {
      onAddPersonTemplate(searchQuery.trim());
    }
    setSearchQuery("");
  };

  const handlePersonDragStart = (e: React.DragEvent, person: Person) => {
    e.dataTransfer.setData("person", JSON.stringify(person));
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => onToggle(true)}
        className="absolute top-6 right-6 p-2 bg-white border border-slate-200 rounded-full shadow-lg hover:bg-slate-50 z-30"
      >
        <ChevronLeft size={20} className="text-slate-600" />
      </button>
    );
  }

  return (
    <aside className="w-80 bg-white border-l border-slate-200 transition-all duration-300 flex flex-col z-20 shadow-xl overflow-hidden h-full">
      <div className="w-80 flex flex-col h-full">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Library
          </h2>
          <button
            onClick={() => onToggle(false)}
            className="p-1.5 hover:bg-slate-100 rounded-md"
          >
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="flex px-6 pt-2 gap-4 border-b border-slate-50">
          <button
            onClick={() => setActiveTab("roles")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${activeTab === "roles" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"}`}
          >
            <Briefcase size={14} /> Roles
          </button>
          <button
            onClick={() => setActiveTab("people")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${activeTab === "people" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"}`}
          >
            <Users size={14} /> People
          </button>
        </div>
        <div className="px-6 py-4">
          <form onSubmit={handleAdd} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className={`w-full pl-9 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs focus:bg-white outline-none transition-all ${isDuplicate ? "border-amber-200" : "border-slate-100 focus:border-blue-300"}`}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={14} />
            </div>
            {searchQuery && !isDuplicate && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-blue-600 text-white rounded-md"
              >
                <Plus size={14} />
              </button>
            )}
            {isDuplicate && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500">
                <AlertCircle size={14} />
              </div>
            )}
          </form>
        </div>
        <div className="flex-grow p-6 pt-0 space-y-3 overflow-y-auto">
          {activeTab === "roles"
            ? filteredRoles.map((r) => (
                <div
                  key={r.id}
                  onMouseDown={(e) => onRoleDragStart(e, r)}
                  className="group relative p-4 border border-slate-100 bg-slate-50 rounded-xl cursor-grab hover:border-blue-200 hover:bg-blue-50 transition-all"
                  style={{ userSelect: "none" }}
                >
                  <p className="text-xs font-bold text-slate-700">{r.role}</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">
                    Role Template
                  </p>
                  {onDeleteRoleTemplate && (
                    <button
                      onMouseDown={(e) => e.stopPropagation()} // Prevent drag start
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRoleTemplate(r.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete Template"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))
            : filteredPeople.map((p) => (
                <div
                  key={p.id}
                  draggable
                  onDragStart={(e) => handlePersonDragStart(e, p)}
                  className="group relative p-3 border border-slate-100 bg-white rounded-xl cursor-grab hover:border-green-200 hover:bg-green-50 flex items-center gap-3 transition-all"
                  style={{ userSelect: "none" }}
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
                      onMouseDown={(e) => e.stopPropagation()} // Prevent drag start? Draggable works via dragstart.
                      // For draggable element, buttons inside might need preventDefault on mousedown or dragstart stop propagation.
                      // Usually click works fine if we don't drag.
                      onClick={(e) => {
                        e.stopPropagation(); // prevent drag selection if any
                        onDeletePersonTemplate(p.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete Person"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
        </div>
        <div className="p-4 border-t border-slate-100 mt-auto">
          <button
            onClick={onNavigateToLibrary}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <Settings2
                size={16}
                className="text-slate-400 group-hover:text-blue-500"
              />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Manage Assets
              </span>
            </div>
            <ChevronRight
              size={14}
              className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
            />
          </button>
        </div>
      </div>
    </aside>
  );
};
