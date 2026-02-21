import { useState, useRef } from "react";
import type { RoleTemplate, Person } from "../../types";
import { Sidebar } from "../ui/Sidebar";
import { SidebarTabs } from "./SidebarTabs";
import { SidebarSearch } from "./SidebarSearch";
import { SidebarRoleList } from "./SidebarRoleList";
import { SidebarPersonList } from "./SidebarPersonList";
import { Settings2, ChevronRight, Download, Upload } from "lucide-react";

interface LibraryPanelProps {
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
  onNavigateToLibrary: () => void;
  roleTemplates: RoleTemplate[];
  peopleTemplates: Person[];
  onAddRoleTemplate: (name: string) => void;
  onAddPersonTemplate: (name: string) => void;
  onDeleteRoleTemplate?: (id: string) => void;
  onDeletePersonTemplate?: (id: string) => void;
  onRoleDragStart: (e: React.PointerEvent, role: RoleTemplate) => void;
  onPersonTouchDragStart?: (
    person: Person,
    x: number,
    y: number,
    pointerId: number,
  ) => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
}

export const LibraryPanel = ({
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
  onPersonTouchDragStart,
  onBackup,
  onRestore,
}: LibraryPanelProps) => {
  const [activeTab, setActiveTab] = useState<"roles" | "people">("roles");
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <Sidebar isOpen={isOpen} onClose={() => onToggle(false)} position="right">
      <Sidebar.Header>
        <Sidebar.Title>Library</Sidebar.Title>
        <Sidebar.CloseButton onClose={() => onToggle(false)} />
      </Sidebar.Header>

      <SidebarTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <SidebarSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        isDuplicate={isDuplicate}
        onAdd={handleAdd}
      />

      <Sidebar.Content className="p-0">
        {activeTab === "roles" ? (
          <SidebarRoleList
            roles={filteredRoles}
            onRoleDragStart={onRoleDragStart}
            onDeleteRoleTemplate={onDeleteRoleTemplate}
          />
        ) : (
          <SidebarPersonList
            people={filteredPeople}
            onPersonDragStart={handlePersonDragStart}
            onDeletePersonTemplate={onDeletePersonTemplate}
            onPersonTouchDragStart={onPersonTouchDragStart}
          />
        )}
      </Sidebar.Content>

      <Sidebar.Footer>
        <div className="flex gap-2 w-full">
          <button
            onClick={onNavigateToLibrary}
            className="flex-1 flex items-center justify-between px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm group"
            title="Manage Assets"
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

          <button
            onClick={onBackup}
            className="p-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
            title="Backup Organization"
          >
            <Download size={18} />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
            title="Restore Organization"
          >
            <Upload size={18} />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onRestore(file);
                e.target.value = "";
              }
            }}
          />
        </div>
      </Sidebar.Footer>
    </Sidebar>
  );
};
