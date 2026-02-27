import { useState, useRef } from "react";
import { Menu, Trash2, Plus, Download, Upload } from "lucide-react";
import type { Org } from "../../types";

interface OrgHeaderProps {
  orgName: string;
  updateOrgName: (name: string) => void;
  orgs: Org[];
  currentOrgId: string;
  switchOrg: (id: string) => void;
  deleteOrg: (e: React.MouseEvent, id: string) => void;
  createNewOrg: () => void;
  /** Touch-only — backup handler */
  onBackup?: () => void;
  /** Touch-only — restore handler */
  onRestore?: (file: File) => void;
}

export const OrgHeader = ({
  orgName,
  updateOrgName,
  orgs,
  currentOrgId,
  switchOrg,
  deleteOrg,
  createNewOrg,
  onBackup,
  onRestore,
}: OrgHeaderProps) => {
  const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="absolute top-safe-6 left-safe-6 left-4 z-50"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        className={`bg-white/90 backdrop-blur-sm border border-slate-200/60 shadow-xl overflow-hidden ${
          isOrgMenuOpen ? "rounded-2xl" : "rounded-full"
        }`}
      >
        {/* ── Main row (always visible) ── */}
        <div className="flex items-center gap-2 p-1.5">
          {/* Menu button */}
          <button
            onClick={() => setIsOrgMenuOpen(!isOrgMenuOpen)}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${
              isOrgMenuOpen
                ? "bg-slate-900 text-white"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
          >
            <Menu size={16} />
          </button>

          {/* Org name + label */}
          <div className="flex flex-col min-w-0">
            <input
              type="text"
              value={orgName}
              onChange={(e) => updateOrgName(e.target.value)}
              className="bg-transparent border-none outline-none text-[15px] font-normal text-slate-800 p-0 focus:ring-0 w-28 md:w-36 leading-tight"
              placeholder="Organization Name"
            />
          </div>

          <div className="w-px h-5 bg-slate-200 mx-0.5" />

          {/* Utility buttons: Backup / Restore */}
          <button
            onClick={onBackup}
            title="Backup Organization"
            className="p-1.5 rounded-full transition-colors text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <Download size={15} />
          </button>
          <button
            onClick={() => restoreInputRef.current?.click()}
            title="Restore Organization"
            className="p-1.5 rounded-full transition-colors text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <Upload size={15} />
          </button>
          <input
            type="file"
            ref={restoreInputRef}
            className="hidden"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onRestore?.(file);
                e.target.value = "";
              }
            }}
          />
        </div>

        {/* ── Organization Switcher (inline, command-center style) ── */}
        {isOrgMenuOpen && (
          <div className="px-2 pb-2 animate-in fade-in duration-150 min-w-[240px]">
            {/* Divider */}
            <div className="h-px bg-slate-100 mx-1 mb-1.5" />

            <div className="max-h-60 overflow-y-auto">
              {orgs.map((o) => (
                <div
                  key={o.id}
                  onClick={() => {
                    switchOrg(o.id);
                    setIsOrgMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    o.id === currentOrgId
                      ? "bg-blue-50 border border-blue-100"
                      : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        o.id === currentOrgId ? "bg-blue-500" : "bg-slate-200"
                      }`}
                    />
                    <span
                      className={`text-xs font-bold truncate ${
                        o.id === currentOrgId
                          ? "text-blue-700"
                          : "text-slate-600"
                      }`}
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

            <div className="mt-1 pt-1.5 border-t border-slate-100">
              <button
                onClick={() => {
                  createNewOrg();
                  setIsOrgMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group"
              >
                <div className="p-1 bg-slate-100 group-hover:bg-blue-100 rounded-lg transition-colors">
                  <Plus size={14} />
                </div>
                <span className="text-xs font-bold">
                  Create New Organization
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
