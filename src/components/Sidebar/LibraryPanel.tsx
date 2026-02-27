import { useState } from "react";
import type { RoleTemplate, Person } from "../../types";
import { Sidebar } from "../ui/Sidebar";
import { SidebarTabs } from "./SidebarTabs";
import { SidebarSearch } from "./SidebarSearch";
import { SidebarRoleList } from "./SidebarRoleList";
import { SidebarPersonList } from "./SidebarPersonList";

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
  onNavigateToLibrary,
  roleTemplates,
  peopleTemplates,
  onAddRoleTemplate,
  onAddPersonTemplate,
  onDeleteRoleTemplate,
  onDeletePersonTemplate,
  onLibraryDragStart,
  position = "right",
}: LibraryPanelProps) => {
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

  const handlePersonDragStart = (e: React.PointerEvent, person: Person) => {
    onLibraryDragStart(e, { type: "person", data: person });
  };

  return (
    <Sidebar
      isOpen={isOpen}
      onClose={() => onToggle(false)}
      position={position}
    >
      <Sidebar.Header>
        <Sidebar.Title>Library</Sidebar.Title>
      </Sidebar.Header>

      <SidebarTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <SidebarSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        isDuplicate={isDuplicate}
        onAdd={handleAdd}
        onNavigateToLibrary={onNavigateToLibrary}
      />

      <Sidebar.Content className="p-0">
        {activeTab === "roles" ? (
          <SidebarRoleList
            roles={filteredRoles}
            onRoleDragStart={(e, role) =>
              onLibraryDragStart(e, { type: "role", data: role })
            }
            onDeleteRoleTemplate={onDeleteRoleTemplate}
          />
        ) : (
          <SidebarPersonList
            people={filteredPeople}
            onPersonDragStart={handlePersonDragStart}
            onDeletePersonTemplate={onDeletePersonTemplate}
          />
        )}
      </Sidebar.Content>
    </Sidebar>
  );
};
