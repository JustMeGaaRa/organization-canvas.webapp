import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Briefcase,
  Users,
  Save,
  Pencil,
  Trash2,
  ImageIcon,
} from "lucide-react";
import type { RoleTemplate, Person } from "../types";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface LibraryEditorProps {
  roleTemplates: RoleTemplate[];
  setRoleTemplates: (roles: RoleTemplate[]) => void;
  peopleTemplates: Person[];
  setPeopleTemplates: (people: Person[]) => void;
  onBack: () => void;
}

export const LibraryEditor = ({
  roleTemplates,
  setRoleTemplates,
  peopleTemplates,
  setPeopleTemplates,
  onBack,
}: LibraryEditorProps) => {
  const [libraryEditorTab, setLibraryEditorTab] = useLocalStorage<
    "roles" | "people"
  >("org_libraryEditorTab", "roles");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<RoleTemplate & Person>>({});

  const handleEditStart = (
    item: RoleTemplate | Person,
    type: "role" | "person",
  ) => {
    setEditingId(item.id);
    if (type === "role") {
      const role = item as RoleTemplate;
      setEditForm({ role: role.role, summary: role.summary });
    } else {
      const person = item as Person;
      setEditForm({ name: person.name, imageUrl: person.imageUrl });
    }
  };

  const handleSaveEdit = (id: string, type: "role" | "person") => {
    if (type === "role") {
      setRoleTemplates(
        roleTemplates.map((r) => (r.id === id ? { ...r, ...editForm } : r)),
      );
    } else {
      setPeopleTemplates(
        peopleTemplates.map((p) => (p.id === id ? { ...p, ...editForm } : p)),
      );
    }
    setEditingId(null);
  };

  const handleAddNew = () => {
    const id = `new-${Date.now()}`;
    if (libraryEditorTab === "roles") {
      const newRole: RoleTemplate = {
        id,
        role: "New Role Name",
        summary: "Description of the role goes here.",
      };
      setRoleTemplates([newRole, ...roleTemplates]);
      setEditingId(id);
      setEditForm({ role: newRole.role, summary: newRole.summary });
    } else {
      const newPerson: Person = {
        id,
        name: "New Full Name",
        imageUrl: "https://i.pravatar.cc/150?u=" + id,
      };
      setPeopleTemplates([newPerson, ...peopleTemplates]);
      setEditingId(id);
      setEditForm({ name: newPerson.name, imageUrl: newPerson.imageUrl });
    }
  };

  return (
    <div className="flex-grow flex flex-col h-full bg-white animate-in fade-in duration-300">
      <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-500 shadow-sm hover:shadow-md"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Library Management
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Configure roles and people available for your organizational
              sandbox
            </p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all font-bold text-xs"
        >
          <Plus size={16} />
          {libraryEditorTab === "roles" ? "Add Role" : "Add Person"}
        </button>
      </header>

      <div className="flex-grow flex flex-col max-w-5xl mx-auto w-full p-8 overflow-hidden">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setLibraryEditorTab("roles")}
            className={`flex-1 py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${libraryEditorTab === "roles" ? "bg-blue-50 border-blue-600 text-blue-700 shadow-sm" : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"}`}
          >
            <Briefcase size={24} />
            <span className="text-sm font-bold uppercase tracking-widest">
              Global Roles
            </span>
          </button>
          <button
            onClick={() => setLibraryEditorTab("people")}
            className={`flex-1 py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${libraryEditorTab === "people" ? "bg-blue-50 border-blue-600 text-blue-700 shadow-sm" : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"}`}
          >
            <Users size={24} />
            <span className="text-sm font-bold uppercase tracking-widest">
              Global People
            </span>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-4 space-y-4 pb-12">
          {libraryEditorTab === "roles" ? (
            <div className="space-y-4">
              {roleTemplates.map((role) => (
                <div
                  key={role.id}
                  className={`p-5 bg-white border rounded-2xl transition-all ${editingId === role.id ? "border-blue-400 ring-4 ring-blue-50 shadow-lg" : "border-slate-100 shadow-sm hover:shadow-md group"}`}
                >
                  {editingId === role.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                          Role Name
                        </label>
                        <input
                          type="text"
                          value={editForm.role}
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
                          value={editForm.summary}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              summary: e.target.value,
                            })
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
                          onClick={() => handleSaveEdit(role.id, "role")}
                          className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-2"
                        >
                          <Save size={14} /> Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-100 rounded-xl text-slate-500">
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">
                            {role.role}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {role.summary}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditStart(role, "role")}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() =>
                            setRoleTemplates(
                              roleTemplates.filter((r) => r.id !== role.id),
                            )
                          }
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {peopleTemplates.map((person) => (
                <div
                  key={person.id}
                  className={`p-5 bg-white border rounded-2xl transition-all ${editingId === person.id ? "border-blue-400 ring-4 ring-blue-50 shadow-lg" : "border-slate-100 shadow-sm hover:shadow-md group"}`}
                >
                  {editingId === person.id ? (
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <img
                            src={editForm.imageUrl}
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
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
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:bg-white outline-none"
                              placeholder="e.g. John Doe"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                              Avatar URL
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={editForm.imageUrl}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    imageUrl: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] focus:bg-white outline-none font-mono"
                                placeholder="https://images.unsplash.com/..."
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
                                <ImageIcon size={14} />
                              </div>
                            </div>
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
                          onClick={() => handleSaveEdit(person.id, "person")}
                          className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-2"
                        >
                          <Save size={14} /> Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={person.imageUrl}
                          className="w-12 h-12 rounded-full shadow-sm object-cover"
                          alt=""
                        />
                        <div>
                          <h4 className="font-bold text-slate-800">
                            {person.name}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Resource Profile
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditStart(person, "person")}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() =>
                            setPeopleTemplates(
                              peopleTemplates.filter((p) => p.id !== person.id),
                            )
                          }
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
