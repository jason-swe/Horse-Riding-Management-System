import { Link, useParams } from "react-router-dom";
import RefereeLayout from "./RefereeLayout";
import { assignedRaces, RESULT_STATUSES } from "./refereeData";

function RaceReport() {
  const { raceId } = useParams();
  const race = assignedRaces.find((r) => r.id === raceId);

  if (!race) return <RefereeLayout title="Not Found" eyebrow="" description=""><p>Race not found.</p></RefereeLayout>;

  const isPublished = race.resultStatus === RESULT_STATUSES.PUBLISHED;
  const confirmedTime = new Date().toLocaleString();

  const handleExport = () => {
    alert("PDF export would trigger here in a real implementation.\nAll report data would be compiled and sent to a PDF service.");
  };

  return (
    <RefereeLayout
      title="Race Report"
      eyebrow={`Official document · ${race.name}`}
      description="Official race report generated after result confirmation. Contains all race data, violations, and official rankings."
      actions={
        <>
          {isPublished && (
            <button className="admin-header__button" type="button" onClick={handleExport}>
              Export PDF
            </button>
          )}
          <Link className="admin-header__button admin-header__button--ghost" to={`/referee/races/${raceId}`}>
            ← Race Detail
          </Link>
        </>
      }
    >
      {!isPublished && (
        <section className="admin-panel">
          <div className="admin-panel__header">
            <p className="admin-panel__eyebrow">Not available</p>
            <h2>Report Pending</h2>
          </div>
          <p style={{ color: "rgba(245,247,243,0.64)" }}>
            The official report is only available after the race result has been confirmed and published.
          </p>
          <div style={{ marginTop: 14 }}>
            <Link className="admin-header__button admin-header__button--ghost" to={`/referee/races/${raceId}/result`}>
              Go to Race Result →
            </Link>
          </div>
        </section>
      )}

      {isPublished && (
        <>
          {/* Race Information */}
          <section className="admin-panel">
            <div className="admin-panel__header">
              <p className="admin-panel__eyebrow">01 · Race Information</p>
              <h2>{race.name}</h2>
            </div>
            <div className="referee-report-grid">
              <div><span className="referee-info-label">Race ID</span><span>{race.id}</span></div>
              <div><span className="referee-info-label">Tournament</span><span>{race.tournament}</span></div>
              <div><span className="referee-info-label">Track</span><span>{race.track}</span></div>
              <div><span className="referee-info-label">Date</span><span>{race.date}</span></div>
              <div><span className="referee-info-label">Start Time</span><span>{race.startTime}</span></div>
              <div><span className="referee-info-label">Status</span><span>{race.status}</span></div>
            </div>
          </section>

          {/* Participants */}
          <section className="admin-panel">
            <div className="admin-panel__header">
              <p className="admin-panel__eyebrow">02 · Participants</p>
              <h2>Horses &amp; Jockeys</h2>
            </div>
            <div className="admin-data-table__wrap">
              <table className="admin-data-table">
                <thead>
                  <tr><th>Lane</th><th>Horse</th><th>Owner</th><th>Jockey</th><th>License</th></tr>
                </thead>
                <tbody>
                  {race.participants.map((p) => (
                    <tr key={p.horseId}>
                      <td>{p.lane}</td>
                      <td><strong>{p.horseName}</strong></td>
                      <td>{p.owner}</td>
                      <td>{p.jockeyName}</td>
                      <td>{p.jockeyLicense}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Violations */}
          <section className="admin-panel">
            <div className="admin-panel__header">
              <p className="admin-panel__eyebrow">03 · Violations</p>
              <h2>Recorded Incidents</h2>
            </div>
            {race.violations.length === 0 ? (
              <p style={{ color: "rgba(245,247,243,0.48)", fontStyle: "italic" }}>No violations were recorded.</p>
            ) : (
              <div className="admin-data-table__wrap">
                <table className="admin-data-table">
                  <thead>
                    <tr><th>ID</th><th>Type</th><th>Subject</th><th>Penalty</th><th>Description</th></tr>
                  </thead>
                  <tbody>
                    {race.violations.map((v) => (
                      <tr key={v.id}>
                        <td>{v.id}</td>
                        <td>{v.type}</td>
                        <td>{v.subjectName}</td>
                        <td>{v.penalty}</td>
                        <td>{v.description || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Results */}
          <section className="admin-panel">
            <div className="admin-panel__header">
              <p className="admin-panel__eyebrow">04 · Official Results</p>
              <h2>Final Rankings</h2>
            </div>
            <div className="admin-data-table__wrap">
              <table className="admin-data-table">
                <thead>
                  <tr><th>Position</th><th>Horse</th><th>Jockey</th><th>Finish Time</th><th>Penalty</th></tr>
                </thead>
                <tbody>
                  {(race.result || []).sort((a, b) => a.position - b.position).map((r) => (
                    <tr key={r.horseId}>
                      <td>
                        <span className="referee-position-badge">
                          {r.position === 1 ? "1st" : r.position === 2 ? "2nd" : r.position === 3 ? "3rd" : `#${r.position}`}
                        </span>
                      </td>
                      <td><strong>{r.horseName}</strong></td>
                      <td>{r.jockeyName}</td>
                      <td>{r.finishTime}</td>
                      <td>{r.penaltyApplied ? <span className="referee-status-badge referee-status-badge--amber">Yes</span> : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Referee Information */}
          <section className="admin-panel referee-report-footer">
            <div className="admin-panel__header">
              <p className="admin-panel__eyebrow">05 · Referee Information</p>
              <h2>Official Signature</h2>
            </div>
            <div className="referee-report-grid">
              <div><span className="referee-info-label">Referee ID</span><span>RF-01</span></div>
              <div><span className="referee-info-label">Referee Name</span><span>Le Quang</span></div>
              <div><span className="referee-info-label">License Level</span><span>National</span></div>
              <div><span className="referee-info-label">Confirmed At</span><span>{confirmedTime}</span></div>
              <div><span className="referee-info-label">Result Status</span>
                <span className="referee-status-badge referee-status-badge--green">Published</span>
              </div>
            </div>
            <div className="referee-report-seal">
              <div>
                <strong>Officially Confirmed</strong>
                <p>This result has been confirmed by the assigned Race Referee and is final.</p>
              </div>
            </div>
          </section>
        </>
      )}
    </RefereeLayout>
  );
}

export default RaceReport;
