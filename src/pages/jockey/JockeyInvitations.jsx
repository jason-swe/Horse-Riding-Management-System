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
  if (["Rejected", "Expired", "Meeting rejected", "Appointment rejected", "Contract rejected", "Cancelled"].includes(status)) {
    return "jockey-badge--muted";
  }
  return "jockey-badge--amber";
};

const getStageCopy = (rawStatus, isBackup = false) => ({
  meeting_invited: isBackup
    ? "Review the standby appointment details and respond to the owner's backup invitation."
    : "Review the offline appointment details and respond to the owner's invitation.",
  meeting_accepted: isBackup
    ? "Standby appointment accepted. The owner will send the terms and contract for your review."
    : "Appointment accepted. The owner will send the terms and contract for your review.",
  terms_agreed: "The owner is preparing the contract for your review.",
  contract_uploaded: isBackup
    ? "Review the terms and contract. Confirming accepts the standby assignment or promoted primary contract."
    : "Review the terms and contract. Confirming the contract accepts the assignment.",
  accepted: isBackup ? "Standby assignment accepted. You are available if the primary jockey is replaced." : "Assignment accepted. This horse and race are now confirmed in your plan.",
  replaced: "This assignment was replaced by another jockey assignment.",
  meeting_rejected: "You declined this appointment invitation.",
  contract_rejected: "You rejected this contract. The assignment is not accepted.",
  cancelled: "The owner cancelled this assignment.",
}[rawStatus] || "Track this assignment through its appointment and contract stages.");

const getStatusGroup = (rawStatus) => ({
  meeting_invited: "Appointment",
  meeting_accepted: "Appointment",
  terms_agreed: "Contract",
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
      if (action === "accept-appointment" || action === "reject-appointment") {
        await respondToMeeting(id, action === "accept-appointment");
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
          {featuredInvite ? (
            <>
              <span className={`jockey-badge ${statusClass(featuredInvite.status)}`}>{featuredInvite.status}</span>
              <strong>{featuredInvite.horse}</strong>
              <p>{featuredInvite.assignmentTypeLabel} / {featuredInvite.race} / {featuredInvite.date}</p>
            </>
          ) : (
            <>
              <span className="jockey-badge jockey-badge--muted">Clear</span>
              <strong>No invitations</strong>
              <p>Owner requests will appear here when a horse is assigned to you.</p>
            </>
          )}
        </aside>
      </section>

      <section className="jockey-invitation-stats" aria-label="Invitation summary">
        {[
          { label: "Appointments", value: pendingCount, note: "Waiting for your response", icon: Send },
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
              {["All", "Appointment", "Contract", "Accepted", "Closed"].map((item) => (
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
                <span className="jockey-badge">{invite.assignmentTypeLabel}</span>

                <div className="jockey-invitation-stage" role="status">
                  <ShieldCheck size={17} />
                  <span>{getStageCopy(invite.rawStatus, invite.isBackup)}</span>
                </div>

                <div className="jockey-invitation-meta">
                  <div><span>Race</span><strong>{invite.race}</strong></div>
                  <div><span>Tournament</span><strong>{invite.tournament}</strong></div>
                  <div><span><Clock3 size={13} /> Time</span><strong>{invite.date}</strong></div>
                  <div><span><MapPin size={13} /> Venue</span><strong>{invite.venue}</strong></div>
                  <div><span>Role</span><strong>{invite.assignmentTypeLabel}{invite.backupPriority ? ` #${invite.backupPriority}` : ""}</strong></div>
                  <div><span><Clock3 size={13} /> Appointment</span><strong>{invite.meetingTime || "Pending"}</strong></div>
                  <div><span><MapPin size={13} /> Location</span><strong>{invite.locationName || invite.venue || "Pending"}</strong></div>
                  <div><span><FileText size={13} /> Contract</span><strong>{invite.contractFileName || "Contract pending"}</strong></div>
                </div>

                <div className="jockey-invitation-review">
                  <div>
                    <span><MapPin size={13} /> Offline appointment</span>
                    <strong>{[invite.address, invite.ward, invite.district, invite.city].filter(Boolean).join(", ") || "Address pending"}</strong>
                    {invite.mapUrl && <a href={invite.mapUrl} rel="noreferrer" target="_blank"><LinkIcon size={13} /> Open map</a>}
                    {(invite.contactName || invite.contactPhone) && <small>{[invite.contactName, invite.contactPhone].filter(Boolean).join(" / ")}</small>}
                  </div>
                  <div>
                    <span><FileText size={13} /> Contract</span>
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
                      <button className="jockey-button" disabled={activeActionId === invite.id} onClick={() => updateInvitation(invite.id, "reject-appointment")} type="button">
                        <XCircle size={17} /> {activeActionId === invite.id ? "Updating..." : "Decline appointment"}
                      </button>
                      <button className="jockey-button jockey-button--primary" disabled={activeActionId === invite.id} onClick={() => updateInvitation(invite.id, "accept-appointment")} type="button">
                        <ShieldCheck size={17} /> {activeActionId === invite.id ? "Updating..." : "Accept appointment"}
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
