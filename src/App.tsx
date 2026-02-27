import { useOrganization } from "./hooks/useOrganization";
import { useLibrary } from "./hooks/useLibrary";
import { CanvasPage } from "./pages/CanvasPage";

function AppContent({
  orgs,
  currentOrgId,
  orgName,
  switchOrg,
  createNewOrg,
  deleteOrg,
  updateOrgName,
}: ReturnType<typeof useOrganization>) {
  const {
    roleTemplates,
    setRoleTemplates,
    peopleTemplates,
    setPeopleTemplates,
  } = useLibrary(currentOrgId);

  return (
    <CanvasPage
      key={currentOrgId}
      orgs={orgs}
      currentOrgId={currentOrgId}
      orgName={orgName}
      updateOrgName={updateOrgName}
      switchOrg={switchOrg}
      deleteOrg={deleteOrg}
      createNewOrg={createNewOrg}
      roleTemplates={roleTemplates}
      peopleTemplates={peopleTemplates}
      setRoleTemplates={setRoleTemplates}
      setPeopleTemplates={setPeopleTemplates}
      onDeleteRoleTemplate={(id) =>
        setRoleTemplates((prev) => prev.filter((r) => r.id !== id))
      }
      onDeletePersonTemplate={(id) =>
        setPeopleTemplates((prev) => prev.filter((p) => p.id !== id))
      }
    />
  );
}

/**
 * Main App
 */
export default function App() {
  const orgData = useOrganization();

  return <AppContent key={orgData.currentOrgId} {...orgData} />;
}
