import type { TrackData, Role, RoleTemplate, Person, HistoryStep } from "../types";

interface UseBackupRestoreProps {
  currentOrgId: string;
  orgName: string;
  cards: Role[];
  tracks: TrackData[];
  roleTemplates: RoleTemplate[];
  peopleTemplates: Person[];
  transform: { x: number; y: number; scale: number };
  historySteps: HistoryStep[]; // Or specific type for history steps
  setCards: React.Dispatch<React.SetStateAction<Role[]>>;
  setTracks: React.Dispatch<React.SetStateAction<TrackData[]>>;
  setRoleTemplates: (roles: RoleTemplate[]) => void;
  setPeopleTemplates: (people: Person[]) => void;
  setTransform: React.Dispatch<
    React.SetStateAction<{ x: number; y: number; scale: number }>
  >;
  setHistorySteps: React.Dispatch<React.SetStateAction<HistoryStep[]>>;
  updateOrgName: (name: string) => void;
}

export const useBackupRestore = ({
  currentOrgId,
  orgName,
  cards,
  tracks,
  roleTemplates,
  peopleTemplates,
  transform,
  historySteps,
  setCards,
  setTracks,
  setRoleTemplates,
  setPeopleTemplates,
  setTransform,
  setHistorySteps,
  updateOrgName,
}: UseBackupRestoreProps) => {
  const handleBackup = () => {
    const backupData = {
      version: 1,
      timestamp: new Date().toISOString(),
      orgId: currentOrgId,
      orgName: orgName,
      cards: cards,
      tracks: tracks,
      roleTemplates: roleTemplates,
      peopleTemplates: peopleTemplates,
      transform: transform,
      historySteps: historySteps,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${orgName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestore = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Basic validation
        if (!data.cards || !data.tracks) {
          alert("Invalid backup file: Missing cards or tracks data.");
          return;
        }

        // Restore data
        if (data.orgName) updateOrgName(data.orgName);
        if (data.cards) setCards(data.cards);
        if (data.tracks) setTracks(data.tracks);
        if (data.roleTemplates) setRoleTemplates(data.roleTemplates);
        if (data.peopleTemplates) setPeopleTemplates(data.peopleTemplates);
        if (data.transform) setTransform(data.transform);
        if (data.historySteps) setHistorySteps(data.historySteps);

        // alert("Organization restored successfully!");
      } catch (err) {
        console.error("Failed to restore backup:", err);
        alert("Failed to parse backup file.");
      }
    };
    reader.readAsText(file);
  };

  return { handleBackup, handleRestore };
};
