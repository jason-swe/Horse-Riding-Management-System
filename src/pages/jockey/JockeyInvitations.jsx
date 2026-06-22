import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Link as LinkIcon,
  MapPin,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import LoadingSkeleton from "../../components/LoadingSkeleton.jsx";
import {
  horseJockeyImages,
  jockeyActionImages,
} from "./jockeyData";
import { useJockeyApiData } from "./useJockeyApiData";

const statusClass = (status) => {
  if (["Accepted", "Confirmed", "Published", "Available"].includes(status)) {
    return "jockey-badge--green";
  }
  if (["Rejected", "Expired", "Meeting rejected", "Contract rejected", "Cancelled"].includes(status)) {
    return "jockey-badge--muted";
  }
  return "jockey-badge--amber";
};

const getStageCopy = (rawStatus) => ({
  meeting_invited: "Review the Meet details and respond to the owner's meeting invitation.",
  meeting_accepted: "Meet accepted. Join at the scheduled time, then wait for the owner to record the agreed terms.",
  terms_agreed: "The owner recorded the terms and is preparing the contract.",
  contract_uploaded: "Review the terms and contract. Confirming the contract accepts the assignment.",
  accepted: "Assignment accepted. This horse and race are now confirmed in your plan.",
  meeting_rejected: "You declined this meeting invitation.",
  contract_rejected: "You rejected this contract. The assignment is not accepted.",
  cancelled: "The owner cancelled this assignment.",
}[rawStatus] || "Track this assignment through its meeting and contract stages.");

const getStatusGroup = (rawStatus) => ({
  meeting_invited: "Meet",
  meeting_accepted: "Meet",
  terms_agreed: "Terms",
  contract_uploaded: "Contract",
  accepted: "Accepted",
}[rawStatus] || "Closed");

function JockeyInvitations() {
  const [filter, setFilter] = useState("All");
  const [actionError, setActionError] = useState("");
  const [activeActionId, setActiveActionId] = useState("");
  const { error, invitations, isLoading, respondToContract, respondToMeeting } = useJockeyApiData();

  const visibleInvitations = useMemo(
    () => invitations.filter((invite) => filter === "All" || getStatusGroup(invite.rawStatus) === filter),
    [filter, invitations]
  );

  const pendingCount = invitations.filter((invite) => invite.rawStatus === "meeting_invited").length;
  const acceptedCount = invitations.filter((invite) => invite.status === "Accepted").length;
  const reviewCount = invitations.filter((invite) => invite.rawStatus === "contract_uploaded").length;
  const featuredInvite = invitations.find((invite) => invite.rawStatus === "meeting_invited") ?? invitations[0];

  const updateInvitation = async (id, action) => {
    setActionError("");
    setActiveActionId(id);

    try {
      if (action === "accept-meeting" || action === "reject-meeting") {
        await respondToMeeting(id, action === "accept-meeting");
      } else {
        await respondToContract(id, action === "confirm-contract");
      }
    } catch (apiError) {
      setActionError(apiError.message || "Unable to update this invitation.");
    } finally {
      setActiveActionId("");
    }
  };

  if (isLoading) {
    return <div className="jockey-invitations-page"><LoadingSkeleton ariaLabel="Loading invitations" rows={4} variant="cards" /></div>;
  }

  return (
    <div className="jockey-invitations-page">
      {(error || actionError) && (
        <div className={`jockey-sync-note ${error || actionError ? "jockey-sync-note--warning" : ""}`}>
          {actionError || error}
        </div>
      )}
      <section className="jockey-invitations-hero">
        <img src={jockeyActionImages[2]} alt="Jockey riding during a race invitation decision" />
        <div className="jockey-invitations-hero__copy">
          <p className="jockey-kicker">Invitation room</p>
          <h1>Accept only the rides that fit race day.</h1>
          <p>Review owner requests, horse context, venue, and race timing before locking your availability.</p>
        </div>
        <aside className="jockey-invitations-hero__panel">
          <span className={`jockey-badge ${statusClass(featuredInvite.status)}`}>{featuredInvite.status}</span>
          <strong>{featuredInvite.horse}</strong>
          <p>{featuredInvite.race} / {featuredInvite.date}</p>
        </aside>
      </section>

      <section className="jockey-invitation-stats" aria-label="Invitation summary">
        {[
          { label: "Meet invites", value: pendingCount, note: "Waiting for your response", icon: Send },
          { label: "Contract review", value: reviewCount, note: "Needs your confirmation", icon: FileText },
          { label: "Accepted", value: acceptedCount, note: "Added to race plan", icon: CheckCircle2 },
          { label: "Total invites", value: invitations.length, note: "Owner requests", icon: CalendarDays },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article className="jockey-invitation-stat" key={item.label}>
              <Icon size={18} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </article>
          );
        })}
      </section>

      <section className="jockey-invitation-board">
        <div className="jockey-invitation-board__header">
          <div>
            <span className="jockey-kicker">Decision board</span>
            <h2>{filter === "All" ? "All invitations" : `${filter} invitations`}</h2>
          </div>
          <div className="jockey-segmented">
              {["All", "Meet", "Terms", "Contract", "Accepted", "Closed"].map((item) => (
              <button className={filter === item ? "jockey-segmented__active" : ""} key={item} onClick={() => setFilter(item)} type="button">
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="jockey-invitation-list">
          {visibleInvitations.map((invite, index) => (
            <article className="jockey-invitation-card" key={invite.id}>
              <div className="jockey-invitation-card__media">
                <img src={horseJockeyImages[index % horseJockeyImages.length]} alt={`${invite.horse} invitation pairing`} />
                <span className={`jockey-badge ${statusClass(invite.status)}`}>{invite.status}</span>
              </div>

              <div className="jockey-invitation-card__body">
                <div className="jockey-invitation-card__title">
                  <div>
                    <span className="jockey-kicker">{invite.id}</span>
                    <h3>{invite.horse}</h3>
                  </div>
                  <strong>{invite.owner}</strong>
                </div>

                <p>{invite.note}</p>

                <div className="jockey-invitation-stage" role="status">
                  <ShieldCheck size={17} />
                  <span>{getStageCopy(invite.rawStatus)}</span>
                </div>

                <div className="jockey-invitation-meta">
                  <div><span>Race</span><strong>{invite.race}</strong></div>
                  <div><span>Tournament</span><strong>{invite.tournament}</strong></div>
                  <div><span><Clock3 size={13} /> Time</span><strong>{invite.date}</strong></div>
                  <div><span><MapPin size={13} /> Venue</span><strong>{invite.venue}</strong></div>
                  <div><span><Clock3 size={13} /> Meet time</span><strong>{invite.meetingTime || "Pending"}</strong></div>
                  <div><span><FileText size={13} /> Contract</span><strong>{invite.contractTitle || invite.contractFileName || "Contract pending"}</strong></div>
                </div>

                <div className="jockey-invitation-review">
                  <div>
                    <span><LinkIcon size={13} /> Google Meet</span>
                    {invite.meetingUrl ? <a href={invite.meetingUrl} rel="noreferrer" target="_blank">{invite.meetingUrl}</a> : <strong>Meeting link pending</strong>}
                  </div>
                  <div>
                    <span><FileText size={13} /> Online contract</span>
                    {invite.contractUrl ? <a href={invite.contractUrl} rel="noreferrer" target="_blank">{invite.contractFileName || invite.contractUrl}</a> : <strong>{invite.contractFileName || "Contract link pending"}</strong>}
                  </div>
                </div>

                {invite.terms && (
                  <div className="jockey-invitation-terms">
                    <span><FileText size={14} /> Agreed terms</span>
                    <p>{invite.terms}</p>
                    {invite.meetingNote && <small>{invite.meetingNote}</small>}
                  </div>
                )}

                <div className="jockey-invitation-card__actions">
                  {invite.rawStatus === "meeting_invited" && (
                    <>
                      <button className="jockey-button" disabled={activeActionId === invite.id} onClick={() => updateInvitation(invite.id, "reject-meeting")} type="button">
                        <XCircle size={17} /> {activeActionId === invite.id ? "Updating..." : "Decline Meet"}
                      </button>
                      <button className="jockey-button jockey-button--primary" disabled={activeActionId === invite.id} onClick={() => updateInvitation(invite.id, "accept-meeting")} type="button">
                        <ShieldCheck size={17} /> {activeActionId === invite.id ? "Updating..." : "Accept Meet"}
                      </button>
                    </>
                  )}
                  {invite.rawStatus === "contract_uploaded" && (
                    <>
                      <button className="jockey-button" disabled={activeActionId === invite.id} onClick={() => updateInvitation(invite.id, "reject-contract")} type="button">
                        <XCircle size={17} /> {activeActionId === invite.id ? "Updating..." : "Reject contract"}
                      </button>
                      <button className="jockey-button jockey-button--primary" disabled={activeActionId === invite.id} onClick={() => updateInvitation(invite.id, "confirm-contract")} type="button">
                        <CheckCircle2 size={17} /> {activeActionId === invite.id ? "Updating..." : "Confirm contract"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {visibleInvitations.length === 0 && <div className="jockey-empty">No invitations match this filter.</div>}
      </section>
    </div>
  );
}

export default JockeyInvitations;
