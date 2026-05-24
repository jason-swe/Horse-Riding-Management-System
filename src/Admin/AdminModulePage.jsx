import { Link, useParams } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { adminModules } from "./adminModules";

function AdminModulePage() {
  const { module: moduleName } = useParams();
  const moduleData = adminModules[moduleName];

  if (!moduleData) {
    return (
      <AdminLayout
        title="Module not found"
        eyebrow="Admin module"
        description="The requested admin module does not exist. Use the sidebar to choose another section."
        actions={(
          <>
            <Link className="admin-header__button" to="/admin">Back to dashboard</Link>
            <Link className="admin-header__button admin-header__button--ghost" to="/login">Login</Link>
          </>
        )}
      >
        <article className="admin-panel">
          <p className="admin-panel__eyebrow">Invalid route</p>
          <h2>No admin module available for this path.</h2>
          <p>
            Use the dashboard or the sidebar links to navigate to Users, Horses,
            Schedule, Results, Registrations, Jockeys, Referees, Predictions, or Tournament.
          </p>
        </article>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={moduleData.title}
      eyebrow={moduleData.eyebrow}
      description={moduleData.description}
      actions={(
        <>
          {moduleData.primaryActions.map((action) => (
            <button key={action} className="admin-header__button" type="button">
              {action}
            </button>
          ))}
        </>
      )}
      activeSection={moduleName}
    >
      <section className="admin-metrics admin-metrics--module" aria-label="Module summary">
        {moduleData.summary.map((card) => (
          <article key={card.label} className="admin-metric-card">
            <p className="admin-metric-card__label">{card.label}</p>
            <div className="admin-metric-card__value">{card.value}</div>
          </article>
        ))}
      </section>

      <section className="admin-grid admin-grid--module">
        {moduleData.sections.map((section) => (
          <article key={section.title} className="admin-panel">
            <div className="admin-panel__header">
              <p className="admin-panel__eyebrow">{moduleData.eyebrow}</p>
              <h2>{section.title}</h2>
            </div>
            <ul className="admin-list">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="admin-table-panel">
        {(moduleData.tables || []).map((table) => (
          <article key={table.title} className="admin-panel">
            <div className="admin-panel__header">
              <p className="admin-panel__eyebrow">{moduleData.eyebrow}</p>
              <h2>{table.title}</h2>
            </div>

            <div className="admin-data-table__wrap" role="region" aria-label={table.title} tabIndex={0}>
              <table className="admin-data-table">
                <thead>
                  <tr>
                    {table.columns.map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, index) => (
                        <td key={`${row[0]}-${index}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </section>
    </AdminLayout>
  );
}

export default AdminModulePage;
