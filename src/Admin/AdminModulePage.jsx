import { Link, useParams } from "react-router-dom";
import AdminCommandModule from "./AdminCommandModule";
import AdminCompetitionModule from "./AdminCompetitionModule";
import AdminDepositModule from "./AdminDepositModule";
import AdminIncidentModule from "./AdminIncidentModule";
import AdminLayout from "./AdminLayout";
import AdminRegistryModule from "./AdminRegistryModule";

const commandModules = new Set(["users", "registrations", "results"]);
const competitionModules = new Set(["tournament", "schedule"]);
const registryModules = new Set(["jockeys", "referees"]);

function AdminModulePage() {
  const { module: moduleName } = useParams();

  if (moduleName === "incidents") return <AdminIncidentModule />;
  if (moduleName === "deposits") return <AdminDepositModule />;
  if (commandModules.has(moduleName)) return <AdminCommandModule moduleName={moduleName} />;
  if (competitionModules.has(moduleName)) return <AdminCompetitionModule moduleName={moduleName} />;
  if (registryModules.has(moduleName)) return <AdminRegistryModule moduleName={moduleName} />;

  return (
    <AdminLayout title="Page not found" eyebrow="Admin" description="This workspace does not exist.">
      <section className="admin-not-found">
        <div><h2>Invalid address</h2></div>
        <Link className="admin-header__button" to="/admin">Return to overview</Link>
      </section>
    </AdminLayout>
  );
}

export default AdminModulePage;
