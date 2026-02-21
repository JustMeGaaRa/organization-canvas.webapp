import { useState } from "react";
import { Menu, Trash2, Plus } from "lucide-react";
import type { Org } from "../../types";

interface OrgHeaderProps {
  orgName: string;
  updateOrgName: (name: string) => void;
  orgs: Org[];
  currentOrgId: string;
  switchOrg: (id: string) => void;
  deleteOrg: (e: React.MouseEvent, id: string) => void;
  createNewOrg: () => void;
}

export const OrgHeader = ({
  orgName,
  updateOrgName,
  orgs,
  currentOrgId,
  switchOrg,
  deleteOrg,
  createNewOrg,
}: OrgHeaderProps) => {
  const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);

  return (
    <div
      className="absolute top-6 left-6 z-50"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="relative">
        <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/60 shadow-xl flex items-center gap-3 group">
          <button
            onClick={() => setIsOrgMenuOpen(!isOrgMenuOpen)}
            className={`p-2 rounded-xl transition-colors ${isOrgMenuOpen ? "bg-slate-900 text-white" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
          >
            <Menu size={18} />
          </button>
          <div className="flex flex-col">
            <input
              type="text"
              value={orgName}
              onChange={(e) => updateOrgName(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-bold text-slate-800 p-0 focus:ring-0 w-48"
              placeholder="Organization Name"
            />
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                Organization
              </span>
              <div className="w-1 h-1 rounded-full bg-green-500" />
            </div>
          </div>
        </div>

        {/* Organization Switcher Menu */}
        {isOrgMenuOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-60 overflow-y-auto">
              {orgs.map((o) => (
                <div
                  key={o.id}
                  onClick={() => switchOrg(o.id)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${o.id === currentOrgId ? "bg-blue-50 border border-blue-100" : "hover:bg-slate-50 border border-transparent"}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${o.id === currentOrgId ? "bg-blue-500" : "bg-slate-200"}`}
                    />
                    <span
                      className={`text-xs font-bold truncate ${o.id === currentOrgId ? "text-blue-700" : "text-slate-600"}`}
                    >
                      {o.name}
                    </span>
                  </div>
                  {orgs.length > 1 && (
                    <button
                      onClick={(e) => deleteOrg(e, o.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  createNewOrg();
                  setIsOrgMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group"
              >
                <div className="p-1 bg-slate-100 group-hover:bg-blue-100 rounded-lg transition-colors">
                  <Plus size={14} />
                </div>
                <span className="text-xs font-bold">Create New Org</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
