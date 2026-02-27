import { useState } from "react";
import { Pencil, X } from "lucide-react";
import type { RoleTemplate, Person } from "../../types";
import { Sidebar } from "../ui/Sidebar";
import { SidebarTabs } from "./SidebarTabs";
import { SidebarSearch } from "./SidebarSearch";
import { SidebarRoleList } from "./SidebarRoleList";
import { SidebarPersonList } from "./SidebarPersonList";

interface LibraryPanelProps {
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
  roleTemplates: RoleTemplate[];
  peopleTemplates: Person[];
  onAddRoleTemplate: (name: string) => void;
  onAddPersonTemplate: (name: string) => void;
  onDeleteRoleTemplate?: (id: string) => void;
  onDeletePersonTemplate?: (id: string) => void;
  onUpdateRoleTemplate?: (id: string, updates: Partial<RoleTemplate>) => void;
  onUpdatePersonTemplate?: (id: string, updates: Partial<Person>) => void;
  onLibraryDragStart: (
    e: React.PointerEvent,
    item:
      | { type: "person"; data: Person }
      | { type: "role"; data: RoleTemplate },
  ) => void;
  position?: "bottom" | "right";
}

export const LibraryPanel = ({
  isOpen,
  onToggle,
  roleTemplates,
  peopleTemplates,
  onAddRoleTemplate,
  onAddPersonTemplate,
  onDeleteRoleTemplate,
  onDeletePersonTemplate,
  onUpdateRoleTemplate,
  onUpdatePersonTemplate,
  onLibraryDragStart,
  position = "right",
}: LibraryPanelProps) => {
  const [activeTab, setActiveTab] = useState<"roles" | "people">("roles");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

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

  const handlePersonDragStart = (e: React.PointerEvent, person: Person) => {
    onLibraryDragStart(e, { type: "person", data: person });
  };

  return (
    <Sidebar
      isOpen={isOpen}
      onClose={() => {
        setIsEditMode(false);
        onToggle(false);
      }}
      position={position}
      isExpanded={isEditMode}
    >
      <Sidebar.Header>
        <Sidebar.Title>Library</Sidebar.Title>
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors flex items-center gap-1.5 text-sm font-medium"
        >
          {isEditMode ? (
            <>
              <span title="Close">
                <X size={16} />
              </span>
            </>
          ) : (
            <>
              <span title="Edit Assets">
                <Pencil size={16} />
              </span>
            </>
          )}
        </button>
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
            onRoleDragStart={(e, role) =>
              onLibraryDragStart(e, { type: "role", data: role })
            }
            onDeleteRoleTemplate={onDeleteRoleTemplate}
            onUpdateRoleTemplate={onUpdateRoleTemplate}
            isEditMode={isEditMode}
          />
        ) : (
          <SidebarPersonList
            people={filteredPeople}
            onPersonDragStart={handlePersonDragStart}
            onDeletePersonTemplate={onDeletePersonTemplate}
            onUpdatePersonTemplate={onUpdatePersonTemplate}
            isEditMode={isEditMode}
          />
        )}
      </Sidebar.Content>
    </Sidebar>
  );
};
