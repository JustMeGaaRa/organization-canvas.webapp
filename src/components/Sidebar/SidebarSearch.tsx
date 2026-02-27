import { Search, Plus, AlertCircle, Settings2 } from "lucide-react";
import { Input } from "../ui/Input";

interface SidebarSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: "roles" | "people";
  isDuplicate: boolean;
  onAdd: (e: React.FormEvent) => void;
  onNavigateToLibrary?: () => void;
}

export const SidebarSearch = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  isDuplicate,
  onAdd,
  onNavigateToLibrary,
}: SidebarSearchProps) => {
  return (
    <div className="px-6 py-4 flex gap-2 items-center">
      <form onSubmit={onAdd} className="relative flex-1">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeTab}...`}
          error={isDuplicate}
          className={`w-full pl-9 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs focus:bg-white outline-none transition-all ${isDuplicate ? "border-amber-200" : "border-slate-100 focus:border-blue-300"}`}
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Search size={14} />
        </div>
        {searchQuery && !isDuplicate && (
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
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
      {onNavigateToLibrary && (
        <button
          onClick={onNavigateToLibrary}
          title="Manage Assets"
          className="p-2.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-xl hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all flex-shrink-0 flex items-center justify-center"
        >
          <Settings2 size={16} />
        </button>
      )}
    </div>
  );
};
