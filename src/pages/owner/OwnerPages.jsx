import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Award,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Check,
  ChevronDown,
  ClipboardCheck,
  Edit3,
  FileText,
  Filter,
  Flag,
  HeartPulse,
  Link2,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Trophy,
  Upload,
  UserRound,
  UsersRound,
} from "lucide-react";
import LoadingSkeleton from "../../components/LoadingSkeleton.jsx";
import {
  availableTournaments,
  ownerHorses,
  ownerJockeys,
  ownerNotifications,
  ownerProfile,
  ownerRegistrations,
  ownerResults,
  ownerSchedule,
} from "./ownerData";
import { ownerApi } from "../../api/ownerApi";
import { readFileAsDataUri } from "../../utils/fileData";
import { toHorsePayload, toOwnerJockey, toOwnerProfilePayload } from "./ownerAdapters";
import { useOwnerHorse, useOwnerHorseApprovalStatus, useOwnerHorses, useOwnerJockeys, useOwnerProfile, useOwnerRegistrations, useOwnerTournaments } from "./useOwnerData";

const statusClass = (status) => {
  if (["Ready", "Approved", "Assigned", "Confirmed", "Published", "Won", "Verified"].includes(status)) {
    return "owner-badge--green";
  }
  if (["Rejected", "Closed", "Cancelled", "Meet rejected", "Contract rejected"].includes(status)) {
    return "owner-badge--muted";
  }
  return "owner-badge--amber";
};

const isMongoObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value || ""));

const compactRecordCode = (prefix, value) => {
  if (!value) return prefix;
  if (isMongoObjectId(value)) return `${prefix}-${String(value).slice(-6).toUpperCase()}`;
  return value;
};

const assignmentStatusLabel = (status) => ({
  meeting_invited: "Meet invitation sent",
  meeting_accepted: "Meet accepted",
  meeting_rejected: "Meet rejected",
  terms_agreed: "Terms recorded",
  contract_uploaded: "Contract awaiting jockey",
  contract_rejected: "Contract rejected",
  accepted: "Accepted",
  cancelled: "Cancelled",
}[status] || status || "Unknown");

const assignmentPartyName = (party, fallback) => {
  if (!party) return fallback;
  if (typeof party === "string") return fallback;
  return party.name || party.user_id?.full_name || party.user_id?.email || fallback;
};

const PageHeader = ({ eyebrow, title, copy, action }) => (
  <section className="owner-page-header">
    <div>
      <p className="owner-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{copy}</p>
    </div>
    {action}
  </section>
);

const StatStrip = ({ items }) => (
  <section className="owner-stats owner-stats--compact" aria-label="Page summary">
    {items.map((item) => {
      const Icon = item.icon;
      return (
        <article className="owner-stat-card" key={item.label}>
          <div className="owner-stat-card__icon"><Icon size={20} /></div>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <small>{item.note}</small>
        </article>
      );
    })}
  </section>
);

const FormSelect = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <label className="owner-form-select" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        setOpen(false);
      }
    }}>
      <span>{label}</span>
      <button
        aria-expanded={open}
        className="owner-form-select__trigger"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span>{value}</span>
        <ChevronDown size={17} />
      </button>
      <div className={`owner-form-select__menu ${open ? "is-open" : ""}`} role="listbox">
        {options.map((option) => (
          <button
            aria-selected={option === value}
            className={option === value ? "is-selected" : ""}
            key={option}
            onClick={() => {
              onChange(option);
              setOpen(false);
            }}
            role="option"
            type="button"
          >
            <span>{option}</span>
            {option === value && <Check size={15} />}
          </button>
        ))}
      </div>
    </label>
  );
};

const horseRosterImages = [
  "https://i.pinimg.com/736x/16/b4/e0/16b4e0814c679b1a64548914e499497d.jpg",
  "https://i.pinimg.com/736x/28/b6/ab/28b6ab0f95a9f5945b17ba17a3800ae8.jpg",
  "https://i.pinimg.com/736x/94/98/ab/9498ab5a8136f433c8d716fec64a7556.jpg",
  "https://i.pinimg.com/1200x/0b/9c/f0/0b9cf065f5a0823c9870113e206bfbd6.jpg",
];

const horseRosterHeroImage = "https://equusmagazine.com/wp-content/uploads/migrations/equus/row-of-horses-in-stalls.jpg";
const registrationHeroImage = "https://i.pinimg.com/1200x/3d/ff/a1/3dffa140ed55cb85b21a9e021e4cb2c8.jpg";
const jockeyHeroImage = "https://i.pinimg.com/1200x/00/b2/be/00b2be2f7811cfb0a83ae76b43671681.jpg";
const scheduleHeroImage = "https://i.pinimg.com/1200x/ae/08/50/ae0850e67c950abd7e962008bc7ae3fb.jpg";
const resultsHeroImage = "https://i.pinimg.com/1200x/30/d4/ec/30d4ec1fb8d7efed15adf856c338efe6.jpg";
const profileHeroImage = "https://i.pinimg.com/736x/39/2c/9d/392c9d4b357cdaf40df26e13f32c083e.jpg";
const profileStableImage = "https://i.pinimg.com/1200x/a9/46/9e/a9469ee3363098f154678502a9eeef9b.jpg";
const jockeyImages = [
  "https://i.pinimg.com/1200x/3f/55/e7/3f55e7e4639c7c2ee3cdbcf489a6d5e2.jpg",
  "https://i.pinimg.com/736x/d1/dd/44/d1dd4409201964373f28d16d633fc569.jpg",
  "https://i.pinimg.com/736x/3b/1d/d1/3b1dd18d6fa76acd8ccebb7cdc580324.jpg",
  "https://i.pinimg.com/1200x/00/b2/be/00b2be2f7811cfb0a83ae76b43671681.jpg",
  "https://i.pinimg.com/1200x/08/90/20/0890207bd0afe2601b672277b40e912f.jpg",
];

function OwnerHorses() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const { horses, isLoading, error } = useOwnerHorses();
  const firstHorse = horses[0];
  const statusOptions = ["All", ...Array.from(new Set(horses.map((horse) => horse.status)))];

  const filteredHorses = horses.filter((horse) => {
    const text = `${horse.name} ${horse.breed} ${horse.jockey} ${horse.status}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (status === "All" || horse.status === status);
  });

  if (isLoading) {
    return <div className="owner-horses-page"><LoadingSkeleton ariaLabel="Loading stable horses" rows={6} variant="cards" /></div>;
  }

  return (
    <div className="owner-horses-page">
      <section className="owner-horses-hero">
        <img src={horseRosterHeroImage} alt="Stable corridor for horse owner roster" />
        <div className="owner-horses-hero__copy">
          <p className="owner-eyebrow">Stable roster</p>
          <h1>Manage horse profiles with race-day context.</h1>
          <p>Search, review, and update every horse profile before registration, jockey assignment, or race confirmation.</p>
          <div className="owner-hero__actions">
            <Link className="owner-button owner-button--primary" to="/owner/horses/new"><Plus size={18} /> Add Horse</Link>
            <Link className="owner-button" to="/owner/registrations">Register tournament</Link>
          </div>
        </div>
        <aside className="owner-horses-hero__panel">
          <span className="owner-badge owner-badge--green"><BadgeCheck size={14} /> {horses.filter((horse) => horse.status === "Ready").length} race-ready</span>
          <strong>{firstHorse?.name || "No horses yet"}</strong>
          <p>{firstHorse?.healthNote || "Create the first horse profile to begin owner API tracking."}</p>
        </aside>
      </section>

      <StatStrip
        items={[
          { label: "Stable horses", value: horses.length, note: "Registered profiles", icon: HeartPulse },
          { label: "Race-ready", value: horses.filter((horse) => horse.status === "Ready").length, note: "Cleared for schedule", icon: BadgeCheck },
          { label: "Assigned jockeys", value: horses.filter((horse) => horse.jockey !== "Unassigned").length, note: "Confirmed relationships", icon: UsersRound },
          { label: "Next entries", value: horses.filter((horse) => horse.nextRace !== "Unassigned").length, note: "Upcoming race windows", icon: CalendarDays },
        ]}
      />

      {error && <div className="owner-empty owner-empty--error">{error}</div>}

      <div className="owner-toolbar">
        <label className="owner-search">
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search horse, breed, jockey..." />
        </label>
        <label className="owner-select">
          <Filter size={17} />
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {statusOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
      </div>

      <section className="owner-roster-grid">
        {filteredHorses.map((horse, index) => (
          <article className="owner-roster-card" key={horse.id}>
            <Link className="owner-roster-card__media" to={`/owner/horses/${horse.id}`}>
              <img src={horseRosterImages[index % horseRosterImages.length]} alt={`${horse.name} profile`} />
              <span className={`owner-badge ${statusClass(horse.status)}`}>{horse.status}</span>
            </Link>
            <div className="owner-roster-card__body">
              <div className="owner-roster-card__title">
                <div>
                  <span className="owner-kicker">{compactRecordCode("Horse", horse.registrationNumber || horse.id)}</span>
                  <h2>{horse.name}</h2>
                </div>
                <strong>{horse.record}</strong>
              </div>

              <div className="owner-roster-card__facts">
                <span>{horse.breed}</span>
                <span>{horse.age === "Not set" ? horse.age : `${horse.age} yrs`}</span>
                <span>{horse.height}</span>
                <span>{horse.weight}</span>
              </div>

              <p>{horse.healthNote}</p>

              <div className="owner-roster-card__assignment">
                <span><UsersRound size={15} /> {horse.jockey}</span>
                <span><CalendarDays size={15} /> {horse.nextRace}</span>
              </div>

              <div className="owner-roster-card__actions">
                <Link className="owner-badge" to={`/owner/horses/${horse.id}`}>View</Link>
                <Link className="owner-badge" to={`/owner/horses/${horse.id}/edit`}>Edit</Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      {filteredHorses.length === 0 && <div className="owner-empty">No horses match this filter.</div>}
    </div>
  );
}

function OwnerHorseForm({ mode = "new" }) {
  const { horseId } = useParams();
  const isEdit = mode === "edit";
  const navigate = useNavigate();
  const { horse: existingHorse, isLoading, error: loadError } = useOwnerHorse(isEdit ? horseId : null);
  const horseIndex = ownerHorses.findIndex((horse) => horse.id === existingHorse?.id);
  const horseImage = horseRosterImages[Math.max(horseIndex, 0) % horseRosterImages.length];
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    registrationNumber: "",
    breed: "Thoroughbred",
    age: 5,
    height: "Not set",
    weight: "",
    status: "Ready",
    healthNote: "",
    nextRace: "Unassigned",
    imageFile: null,
    imageFileName: "",
  });

  useEffect(() => {
    if (!existingHorse) return;

    setForm({
      name: existingHorse.name,
      registrationNumber: existingHorse.registrationNumber,
      breed: existingHorse.breed,
      age: existingHorse.age,
      height: existingHorse.height,
      weight: existingHorse.weight,
      status: existingHorse.status,
      healthNote: existingHorse.healthNote,
      nextRace: existingHorse.nextRace,
      imageFile: null,
      imageFileName: "",
    });
  }, [existingHorse]);

  const updateField = (field, value) => {
    setSaved(false);
    setError("");
    setForm((current) => ({ ...current, [field]: value }));
  };

  const actionPath = isEdit && existingHorse ? `/owner/horses/${existingHorse.id}` : "/owner/horses";

  const updateImageFile = (file) => {
    setSaved(false);
    setError("");
    setForm((current) => ({
      ...current,
      imageFile: file,
      imageFileName: file?.name || "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Horse name is required.");
      return;
    }

    if (!form.registrationNumber.trim()) {
      setError("Registration number is required.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSaved(false);

    try {
      const payload = toHorsePayload(form);
      const imageFileData = form.imageFile ? await readFileAsDataUri(form.imageFile) : "";

      if (isEdit && existingHorse) {
        await ownerApi.updateHorse(existingHorse.id, payload);
        if (imageFileData) {
          await ownerApi.updateHorseMedia(existingHorse.id, { image_file_data: imageFileData });
        }
        setSaved(true);
      } else {
        if (imageFileData) {
          payload.image_file_data = imageFileData;
        }
        const data = await ownerApi.createHorse(payload);
        navigate(`/owner/horses/${data.horse._id}`, { replace: true });
      }
    } catch (apiError) {
      setError(apiError.message || "Unable to save horse profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && isLoading) {
    return <div className="owner-horse-form-page"><LoadingSkeleton ariaLabel="Loading horse profile" variant="detail" /></div>;
  }

  if (isEdit && loadError) {
    return <div className="owner-empty owner-empty--error">{loadError}</div>;
  }

  return (
    <div className="owner-horse-form-page">
      <section className="owner-horse-form-hero">
        <div className="owner-horse-form-hero__copy">
          <Link className="owner-detail-back" to={actionPath}>Back to {isEdit ? "profile" : "horses"}</Link>
          <p className="owner-eyebrow">{isEdit ? `${existingHorse?.registrationNumber} profile` : "New horse profile"}</p>
          <h1>{isEdit ? `Edit ${existingHorse?.name}` : "Create a race-ready horse file"}</h1>
          <p>Update the details owners, admins, and referees need before approving a tournament entry.</p>
        </div>
        <aside className="owner-horse-form-preview" aria-label="Horse profile preview">
          <img src={existingHorse?.imageUrl || horseImage} alt={`${isEdit ? existingHorse?.name : "New horse"} profile preview`} />
          <div className="owner-horse-form-preview__card">
            <span className={`owner-badge ${statusClass(form.status)}`}>{form.status}</span>
            <strong>{form.name || "Unnamed horse"}</strong>
            <small>{form.registrationNumber || "No registration"} / {form.breed}</small>
          </div>
        </aside>
      </section>

      <form className="owner-horse-form-shell" onSubmit={handleSubmit}>
        <div className="owner-form-main">
          <section className="owner-form-section">
            <div className="owner-form-section__header">
              <span className="owner-kicker">Identity</span>
              <h2>Horse details</h2>
            </div>
            <div className="owner-form-grid">
              <label>Name<input value={form.name} onChange={(event) => updateField("name", event.target.value)} required /></label>
              <label>Registration number<input value={form.registrationNumber} onChange={(event) => updateField("registrationNumber", event.target.value)} required /></label>
              <FormSelect label="Breed" value={form.breed} options={["Thoroughbred", "Warmblood", "Arabian", "Quarter Horse", "Standardbred", "Other"]} onChange={(value) => updateField("breed", value)} />
              <label>Age<input type="number" min="1" value={form.age} onChange={(event) => updateField("age", event.target.value)} /></label>
              <label>Height<input value={form.height} onChange={(event) => updateField("height", event.target.value)} /></label>
              <label>Weight<input value={form.weight} onChange={(event) => updateField("weight", event.target.value)} /></label>
              <label className="owner-form-span">
                Profile image
                <input accept="image/*" type="file" onChange={(event) => updateImageFile(event.target.files?.[0] || null)} />
                {form.imageFileName && <small className="owner-form-hint">Selected: {form.imageFileName}</small>}
              </label>
            </div>
          </section>

          <section className="owner-form-section">
            <div className="owner-form-section__header">
              <span className="owner-kicker">Race context</span>
              <h2>Approval state</h2>
            </div>
            <div className="owner-form-grid">
              <FormSelect label="Status" value={form.status} options={["Ready", "Needs review", "Closed"]} onChange={(value) => updateField("status", value)} />
              <label className="owner-form-span">Next race<input value={form.nextRace} onChange={(event) => updateField("nextRace", event.target.value)} /></label>
            </div>
          </section>

          <section className="owner-form-section">
            <div className="owner-form-section__header">
              <span className="owner-kicker">Health notes</span>
              <h2>Referee and vet context</h2>
            </div>
            <label className="owner-form-note">Health note<textarea value={form.healthNote} onChange={(event) => updateField("healthNote", event.target.value)} placeholder="Add referee, vet, or readiness notes..." /></label>
          </section>

          <div className="owner-form-actions">
            {saved && <span className="owner-success"><CheckCircle2 size={16} /> Profile saved to API.</span>}
            {error && <span className="owner-success owner-success--error">{error}</span>}
            <Link className="owner-button" to={actionPath}>Cancel</Link>
            <button className="owner-button owner-button--primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Horse"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function OwnerHorseDetail() {
  const { horseId } = useParams();
  const { horse, isLoading, error } = useOwnerHorse(horseId);
  const { approvalStatus, error: approvalError, isLoading: approvalLoading } = useOwnerHorseApprovalStatus(horseId);
  const navigate = useNavigate();
  const [actionMessage, setActionMessage] = useState("");
  const [isDeactivating, setIsDeactivating] = useState(false);

  if (isLoading) {
    return <div className="owner-horse-detail-page"><LoadingSkeleton ariaLabel="Loading horse profile" variant="detail" /></div>;
  }

  if (error || !horse) {
    return <div className="owner-empty owner-empty--error">{error || "Horse not found."}</div>;
  }

  const horseIndex = ownerHorses.findIndex((item) => item.id === horse.id);
  const horseImage = horseRosterImages[Math.max(horseIndex, 0) % horseRosterImages.length];
  const registrations = ownerRegistrations.filter((item) => item.horseId === horse.id);
  const schedule = ownerSchedule.filter((item) => item.horse === horse.name);
  const results = ownerResults.filter((item) => item.horse === horse.name);
  const latestResult = results[0];

  const handleDeactivate = async () => {
    if (!window.confirm(`Deactivate ${horse.name}?`)) return;

    setIsDeactivating(true);
    setActionMessage("");

    try {
      await ownerApi.deactivateHorse(horse.id);
      navigate("/owner/horses", { replace: true });
    } catch (apiError) {
      setActionMessage(apiError.message || "Unable to deactivate horse.");
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <div className="owner-horse-detail-page">
      <section className="owner-detail-hero">
        <div className="owner-detail-hero__copy">
          <Link className="owner-detail-back" to="/owner/horses">Back to horses</Link>
          <p className="owner-eyebrow">{horse.registrationNumber} / {horse.breed}</p>
          <h1>{horse.name}</h1>
          <p>{horse.healthNote}</p>
          <div className="owner-hero__actions">
            <Link className="owner-button owner-button--primary" to={`/owner/horses/${horse.id}/edit`}><Edit3 size={18} /> Edit Profile</Link>
            <Link className="owner-button" to="/owner/registrations">Register Tournament</Link>
            <Link className="owner-button" to="/owner/jockeys">Assign Jockey</Link>
            <button className="owner-button" disabled={isDeactivating} type="button" onClick={handleDeactivate}>
              {isDeactivating ? "Deactivating..." : "Deactivate"}
            </button>
          </div>
          {actionMessage && <p className="owner-success owner-success--error">{actionMessage}</p>}
        </div>
        <aside className="owner-detail-hero__media">
          <img src={horse.imageUrl || horseImage} alt={`${horse.name} horse profile`} />
          <div className="owner-detail-photo-card">
            <span className={`owner-badge ${statusClass(horse.status)}`}>{horse.status}</span>
            <strong>{horse.record}</strong>
            <small>{horse.jockey === "Unassigned" ? "Jockey not assigned" : `Ridden by ${horse.jockey}`}</small>
          </div>
        </aside>
      </section>

      <section className="owner-detail-summary" aria-label="Horse summary">
        {[
          { label: "Age", value: horse.age === "Not set" ? horse.age : `${horse.age} yrs`, icon: HeartPulse },
          { label: "Height", value: horse.height, icon: Flag },
          { label: "Weight", value: horse.weight, icon: Award },
          { label: "Next race", value: horse.nextRace, icon: CalendarDays },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article className="owner-detail-summary__item" key={item.label}>
              <Icon size={18} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          );
        })}
      </section>

      <section className="owner-detail-main">
        <article className="owner-card owner-detail-focus">
          <div className="owner-card__header">
            <div>
              <span className="owner-kicker">Race context</span>
              <h2>Next owner decisions</h2>
            </div>
            <CalendarDays size={20} />
          </div>
          <div className="owner-detail-decision-grid">
            <div>
              <span>Assigned jockey</span>
              <strong>{horse.jockey}</strong>
              <small>{horse.jockey === "Unassigned" ? "Invite a rider before approval." : "Relationship active for race planning."}</small>
            </div>
            <div>
              <span>Registration state</span>
              <strong>{registrations[0]?.status ?? "Not submitted"}</strong>
              <small>{registrations[0]?.note ?? "Create a tournament entry when ready."}</small>
            </div>
            <div>
              <span>Latest finish</span>
              <strong>{latestResult ? `#${latestResult.position}` : "No result"}</strong>
              <small>{latestResult ? `${latestResult.race} / ${latestResult.prize}` : "Results will appear after publication."}</small>
            </div>
          </div>
        </article>

        <article className="owner-card">
          <div className="owner-card__header">
            <div>
              <span className="owner-kicker">Approval status</span>
              <h2>Race readiness</h2>
            </div>
            <ShieldCheck size={20} />
          </div>
          {approvalLoading && <LoadingSkeleton ariaLabel="Loading approval status" variant="inline" />}
          {approvalError && <div className="owner-empty owner-empty--compact owner-empty--error">{approvalError}</div>}
          {approvalStatus && (
            <div className="owner-detail-summary" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
              <div className="owner-detail-summary__item">
                <ShieldCheck size={18} />
                <span>Ready</span>
                <strong>{approvalStatus.readyToRace ? "Yes" : "No"}</strong>
              </div>
              <div className="owner-detail-summary__item">
                <ClipboardCheck size={18} />
                <span>Registrations</span>
                <strong>{approvalStatus.registrations.length}</strong>
              </div>
              <div className="owner-detail-summary__item">
                <HeartPulse size={18} />
                <span>Checks</span>
                <strong>{approvalStatus.checks.length}</strong>
              </div>
            </div>
          )}
        </article>

        <article className="owner-card">
          <div className="owner-card__header">
            <div>
              <span className="owner-kicker">Approvals</span>
              <h2>Registrations</h2>
            </div>
            <ClipboardCheck size={20} />
          </div>
          <div className="owner-detail-registration-list">
            {registrations.map((item) => (
              <div className="owner-detail-registration" key={item.id}>
                <span>{item.id}</span>
                <div>
                  <strong>{item.tournament}</strong>
                  <small>{item.submitted} / {item.note}</small>
                </div>
                <span className={`owner-badge ${statusClass(item.status)}`}>{item.status}</span>
              </div>
            ))}
            {registrations.length === 0 && <div className="owner-empty owner-empty--compact">No registrations yet.</div>}
          </div>
        </article>
      </section>

      <section className="owner-detail-main owner-detail-main--lower">
        <article className="owner-card">
          <div className="owner-card__header">
            <div>
              <span className="owner-kicker">Calendar</span>
              <h2>Upcoming races</h2>
            </div>
            <CalendarDays size={20} />
          </div>
          <div className="owner-detail-race-list">
            {schedule.map((race) => (
              <div className="owner-detail-race" key={race.id}>
                <div className="owner-detail-race__time"><CalendarDays size={16} /><span>{race.time}</span></div>
                <div>
                  <h3>{race.race}</h3>
                  <span>{race.tournament} / {race.round}</span>
                  <small><MapPin size={13} /> {race.venue}</small>
                </div>
                <span className={`owner-badge ${statusClass(race.status)}`}>{race.status}</span>
              </div>
            ))}
            {schedule.length === 0 && <div className="owner-empty owner-empty--compact">No upcoming races.</div>}
          </div>
        </article>

        <article className="owner-card owner-detail-results">
          <div className="owner-card__header">
            <div>
              <span className="owner-kicker">Performance</span>
              <h2>Recent results</h2>
            </div>
            <Trophy size={20} />
          </div>
          <div className="owner-detail-result-list">
            {results.map((result) => (
              <div className="owner-detail-result" key={result.id}>
                <span>{result.date}</span>
                <div>
                  <strong>{result.race}</strong>
                  <small>{result.time}</small>
                </div>
                <strong>#{result.position}</strong>
                <span>{result.prize}</span>
              </div>
            ))}
            {results.length === 0 && <div className="owner-empty owner-empty--compact">No published results yet.</div>}
          </div>
        </article>
      </section>
    </div>
  );
}

function OwnerRegistrations() {
  const { horses: liveHorses, isLoading: horsesLoading, error: horsesError } = useOwnerHorses();
  const { tournaments: liveTournaments, isLoading: tournamentsLoading, error: tournamentsError } = useOwnerTournaments();
  const {
    registrations: liveRegistrations,
    isLoading: registrationsLoading,
    error: registrationsError,
    reload: reloadRegistrations,
  } = useOwnerRegistrations();
  const horses = liveHorses.length ? liveHorses : ownerHorses;
  const tournaments = liveTournaments.length ? liveTournaments : availableTournaments.map((name, index) => ({ id: `sample-${index}`, name }));
  const registrations = liveRegistrations.length ? liveRegistrations : ownerRegistrations;
  const pendingCount = registrations.filter((item) => item.status === "Pending" || item.status === "Review").length;
  const approvedCount = registrations.filter((item) => item.status === "Approved").length;
  const [races, setRaces] = useState([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState("");
  const [entry, setEntry] = useState({
    horse: horses[0]?.name || "",
    tournament: tournaments[0]?.name || "",
    race: "",
    note: "",
  });
  const selectedHorse = horses.find((horse) => horse.name === entry.horse) ?? horses[0];
  const selectedTournament = tournaments.find((tournament) => tournament.name === entry.tournament) ?? tournaments[0];
  const selectedRace = races.find((race) => race.name === entry.race) ?? races[0];

  useEffect(() => {
    if (!horses.length || entry.horse) return;
    setEntry((current) => ({ ...current, horse: horses[0].name }));
  }, [entry.horse, horses]);

  useEffect(() => {
    if (!tournaments.length || entry.tournament) return;
    setEntry((current) => ({ ...current, tournament: tournaments[0].name }));
  }, [entry.tournament, tournaments]);

  useEffect(() => {
    let cancelled = false;

    async function loadRaces() {
      if (!selectedTournament?.id || String(selectedTournament.id).startsWith("sample-")) {
        setRaces([]);
        return;
      }

      try {
        const data = await ownerApi.getTournamentRaces(selectedTournament.id);
        if (!cancelled) {
          const nextRaces = (data.races || []).map((race) => ({
            id: race._id || race.id,
            name: race.name || "Race",
          }));
          setRaces(nextRaces);
          setEntry((current) => ({
            ...current,
            race: nextRaces[0]?.name || "",
          }));
        }
      } catch (apiError) {
        if (!cancelled) {
          setRaces([]);
          setError(apiError.message || "Unable to load races for tournament.");
        }
      }
    }

    loadRaces();

    return () => {
      cancelled = true;
    };
  }, [selectedTournament?.id]);

  const updateEntry = (field, value) => {
    setSaved(false);
    setError("");
    setEntry((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaved(false);
    setError("");

    if (!selectedHorse?.id) {
      setError("Select a horse before submitting.");
      return;
    }

    if (!selectedRace?.id) {
      setError("Select a race before submitting. Live tournament races are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await ownerApi.registerHorseForRace({
        horse_id: selectedHorse.id,
        race_id: selectedRace.id,
        note: entry.note,
      });
      await reloadRegistrations();
      setSaved(true);
    } catch (apiError) {
      setError(apiError.message || "Unable to submit race registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRegistration = async (registration) => {
    if (!registration.horseId || !registration.raceId) {
      setError("Registration is missing horse or race data.");
      return;
    }

    setSaved(false);
    setError("");
    setCancellingId(registration.id);

    try {
      await ownerApi.cancelRaceRegistration({
        horse_id: registration.horseId,
        race_id: registration.raceId,
      });
      await reloadRegistrations();
      setSaved(true);
    } catch (apiError) {
      setError(apiError.message || "Unable to cancel registration.");
    } finally {
      setCancellingId("");
    }
  };

  if (horsesLoading || tournamentsLoading || registrationsLoading) {
    return <div className="owner-registration-page"><LoadingSkeleton ariaLabel="Loading registration workspace" variant="page" /></div>;
  }

  return (
    <div className="owner-registration-page">
      {(horsesError || tournamentsError || registrationsError || !liveHorses.length || !liveTournaments.length || !liveRegistrations.length) && (
        <section className={`admin-live-state ${horsesError || tournamentsError || registrationsError ? "admin-live-state--warning" : ""}`} aria-live="polite">
          {horsesError || tournamentsError || registrationsError || "Showing sample registration data until backend owner registrations/tournaments/horses are available."}
        </section>
      )}

      <section className="owner-registration-hero">
        <img src={registrationHeroImage} alt="Race track grandstand for tournament registration" />
        <div className="owner-registration-hero__copy">
          <p className="owner-eyebrow">Tournament entries</p>
          <h1>Register horses and track approvals.</h1>
          <p>Submit entries, monitor admin review, and keep approval notes visible before each race window closes.</p>
        </div>
        <aside className="owner-registration-hero__panel">
          <span className="owner-badge owner-badge--amber"><ClipboardCheck size={14} /> {pendingCount} need attention</span>
          <strong>{selectedHorse?.name || "No horse selected"}</strong>
          <p>{selectedHorse?.healthNote || "Select a horse to submit an entry."}</p>
        </aside>
      </section>

      <section className="owner-registration-workspace">
        <form className="owner-registration-form" onSubmit={handleSubmit}>
          <div className="owner-card__header">
            <div>
              <span className="owner-kicker">New entry</span>
              <h2>Submit tournament registration</h2>
            </div>
            <Send size={20} />
          </div>

          <div className="owner-form-grid owner-form-grid--single">
            <FormSelect label="Horse" value={entry.horse} options={horses.map((horse) => horse.name)} onChange={(value) => updateEntry("horse", value)} />
            <FormSelect label="Tournament" value={entry.tournament} options={tournaments.map((tournament) => tournament.name)} onChange={(value) => updateEntry("tournament", value)} />
            <FormSelect label="Race" value={entry.race || "No race available"} options={races.length ? races.map((race) => race.name) : ["No race available"]} onChange={(value) => updateEntry("race", value)} />
            <label className="owner-form-note">Owner note<textarea value={entry.note} onChange={(event) => updateEntry("note", event.target.value)} placeholder="Add readiness, preferred jockey, or scheduling note..." /></label>
          </div>

          <div className="owner-registration-preview">
            <div><span>Horse status</span><strong>{selectedHorse?.status || "N/A"}</strong></div>
            <div><span>Assigned jockey</span><strong>{selectedHorse?.jockey || "Unassigned"}</strong></div>
            <div><span>Race</span><strong>{selectedRace?.name || "No race loaded"}</strong></div>
          </div>

          <div className="owner-form-actions">
            {saved && <span className="owner-success"><CheckCircle2 size={16} /> Registration submitted to API.</span>}
            {error && <span className="owner-success owner-success--error">{error}</span>}
            <button className="owner-button owner-button--primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Submitting..." : "Submit Entry"}
            </button>
          </div>
        </form>

        <aside className="owner-registration-side">
          <div className="owner-registration-side__item">
            <span>Available tournaments</span>
            <strong>{tournaments.length}</strong>
            <small>Open choices in the entry dropdown</small>
          </div>
          <div className="owner-registration-side__item">
            <span>Approved entries</span>
            <strong>{approvedCount}</strong>
            <small>Ready for race scheduling</small>
          </div>
          <div className="owner-registration-side__item">
            <span>Review queue</span>
            <strong>{pendingCount}</strong>
            <small>Needs admin or owner follow-up</small>
          </div>
        </aside>
      </section>

      <article className="owner-registration-board">
        <div className="owner-card__header">
          <div>
            <span className="owner-kicker">Approval timeline</span>
            <h2>Current registration queue</h2>
          </div>
          <ClipboardCheck size={20} />
        </div>
        <div className="owner-registration-list owner-registration-list--board">
          {registrations.map((item) => (
            <div className="owner-registration owner-registration--rich" key={item.id}>
              <time className="owner-registration__date">{item.submitted}</time>
              <div className="owner-registration__content">
                <div className="owner-registration__headline">
                  <span className="owner-registration__id">{compactRecordCode("REG", item.id)}</span>
                  <div className="owner-registration__body">
                    <strong>{item.horse}</strong>
                    <small>{item.tournament}</small>
                  </div>
                </div>
                <small className="owner-registration__note">{item.race ? `${item.race} / ${item.note}` : item.note}</small>
              </div>
              <div className="owner-registration__actions">
                <span className={`owner-badge ${statusClass(item.status)}`}>{item.status}</span>
                {item.status !== "Cancelled" && item.status !== "Rejected" && (
                  <button
                    className="owner-button"
                    disabled={cancellingId === item.id || !liveRegistrations.length}
                    onClick={() => handleCancelRegistration(item)}
                    type="button"
                  >
                    {cancellingId === item.id ? "Cancelling..." : "Cancel"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function OwnerJockeys() {
  const { jockeys: liveJockeys, isLoading, error } = useOwnerJockeys();
  const { horses: liveHorses, isLoading: horsesLoading, error: horsesError } = useOwnerHorses();
  const {
    registrations: liveRegistrations,
    isLoading: registrationsLoading,
    error: registrationsError,
  } = useOwnerRegistrations();
  const [localStatuses, setLocalStatuses] = useState({});
  const [selectedJockeyId, setSelectedJockeyId] = useState("");
  const [selectedJockeyDetail, setSelectedJockeyDetail] = useState(null);
  const [detailLoadingId, setDetailLoadingId] = useState("");
  const [assignmentSaved, setAssignmentSaved] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");
  const [existingAssignments, setExistingAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [workflowDrafts, setWorkflowDrafts] = useState({});
  const [workflowActionId, setWorkflowActionId] = useState("");
  const [workflowMessage, setWorkflowMessage] = useState("");
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("");
  const [assignment, setAssignment] = useState({
    registrationId: "",
    message: "",
    meetingTitle: "",
    meetingUrl: "",
    meetingTime: "",
  });
  const jockeys = (liveJockeys.length ? liveJockeys : ownerJockeys).map((jockey) => ({
    ...jockey,
    status: localStatuses[jockey.id] || jockey.status,
  }));
  const horses = liveHorses.length ? liveHorses : ownerHorses;
  const updateStatus = (id, status) => setLocalStatuses((current) => ({ ...current, [id]: status }));
  const selectedJockey = jockeys.find((jockey) => jockey.id === selectedJockeyId) ?? jockeys[0];

  const findAssignmentForRegistration = (registration) => existingAssignments.find((item) => {
    const horseId = item.horse_id?._id || item.horse_id?.id || item.horse_id;
    const raceId = item.race_id?._id || item.race_id?.id || item.race_id;
    return String(horseId) === String(registration?.horseId) && String(raceId) === String(registration?.raceId);
  });

  const approvedRaceEntries = liveRegistrations.filter((item) => item.status === "Approved" && item.horseId && item.raceId);
  const assignableRaceEntries = approvedRaceEntries.filter((item) => !findAssignmentForRegistration(item));
  const selectedEntry = assignableRaceEntries.find((item) => item.id === assignment.registrationId) ?? assignableRaceEntries[0] ?? null;
  const selectedHorse = selectedEntry
    ? horses.find((horse) => String(horse.id) === String(selectedEntry.horseId)) ?? { id: selectedEntry.horseId, name: selectedEntry.horse }
    : null;
  const selectedRace = selectedEntry
    ? { id: selectedEntry.raceId, name: selectedEntry.race, tournament: selectedEntry.tournament }
    : null;
  const existingAssignment = selectedEntry ? findAssignmentForRegistration(selectedEntry) : null;
  const assignedCount = existingAssignments.filter((item) => item.status === "accepted").length;
  const pendingCount = existingAssignments.filter((item) => ["meeting_invited", "meeting_accepted", "terms_agreed", "contract_uploaded"].includes(item.status)).length;
  const topWinRate = Math.max(0, ...jockeys.map((jockey) => Math.round((jockey.wins / Math.max(jockey.races, 1)) * 100)));
  const blockedByNoEntry = !assignmentsLoading && !selectedEntry;
  const invitationLocked = blockedByNoEntry || Boolean(existingAssignment);
  const selectedWorkflowAssignment = existingAssignments.find((item) => String(item._id) === String(selectedWorkflowId)) || null;

  useEffect(() => {
    if (!assignableRaceEntries.length) return;
    if (assignableRaceEntries.some((item) => item.id === assignment.registrationId)) return;
    setAssignment((current) => ({ ...current, registrationId: assignableRaceEntries[0].id }));
  }, [assignment.registrationId, assignableRaceEntries]);

  useEffect(() => {
    if (!jockeys.length || selectedJockeyId) return;
    setSelectedJockeyId(jockeys[0].id);
  }, [jockeys, selectedJockeyId]);

  useEffect(() => {
    let cancelled = false;

    async function loadAssignments() {
      if (!liveHorses.length) {
        setAssignmentsLoading(false);
        return;
      }

      setAssignmentsLoading(true);
      try {
        const data = await ownerApi.getJockeyAssignments();
        if (!cancelled) setExistingAssignments(data.assignments || []);
      } catch (apiError) {
        if (!cancelled) setAssignmentError(apiError.message || "Unable to load existing jockey assignments.");
      } finally {
        if (!cancelled) setAssignmentsLoading(false);
      }
    }

    loadAssignments();
    return () => { cancelled = true; };
  }, [liveHorses.length]);

  const updateAssignment = (field, value) => {
    setAssignmentSaved(false);
    setAssignmentError("");
    setAssignment((current) => ({ ...current, [field]: value }));
  };

  const updateWorkflowDraft = (id, field, value) => {
    setAssignmentError("");
    setWorkflowMessage("");
    setWorkflowDrafts((current) => ({
      ...current,
      [id]: { ...current[id], [field]: value },
    }));
  };

  const replaceAssignment = (updated) => {
    if (!updated?._id) return;
    setExistingAssignments((current) => current.map((item) => String(item._id) === String(updated._id) ? {
      ...item,
      ...updated,
      race_id: item.race_id,
      horse_id: item.horse_id,
      owner_id: item.owner_id,
      jockey_id: item.jockey_id,
    } : item));
  };

  const submitTerms = async (item) => {
    const id = item._id;
    const draft = workflowDrafts[id] || {};
    if (!draft.agreedTerms?.trim()) {
      setAssignmentError("Enter the agreed terms before continuing.");
      return;
    }

    setWorkflowActionId(id);
    setAssignmentError("");
    setWorkflowMessage("");
    try {
      const data = await ownerApi.updateJockeyAssignmentTerms(id, {
        agreed_terms: draft.agreedTerms.trim(),
        meeting_note: draft.meetingNote?.trim() || "",
        agreed_at: new Date().toISOString(),
      });
      replaceAssignment(data.assignment);
      setWorkflowMessage("Terms recorded. You can now upload the contract.");
    } catch (apiError) {
      setAssignmentError(apiError.message || "Unable to record the agreed terms.");
    } finally {
      setWorkflowActionId("");
    }
  };

  const uploadContract = async (item) => {
    const id = item._id;
    const draft = workflowDrafts[id] || {};
    const file = draft.contractFile;
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

    if (!file || !allowedTypes.includes(file.type)) {
      setAssignmentError("Choose a PDF, JPG, PNG, or WEBP contract file.");
      return;
    }
    if (file.size > 7 * 1024 * 1024) {
      setAssignmentError("Contract file must be 7 MB or smaller.");
      return;
    }

    setWorkflowActionId(id);
    setAssignmentError("");
    setWorkflowMessage("");
    try {
      const data = await ownerApi.uploadJockeyAssignmentContract(id, {
        contract_number: draft.contractNumber?.trim() || "",
        title: draft.contractTitle?.trim() || `${assignmentPartyName(item.horse_id, "Horse")} jockey agreement`,
        file_data: await readFileAsDataUri(file),
        file_type: file.type,
        file_name: file.name,
        note: draft.contractNote?.trim() || "",
      });
      replaceAssignment(data.assignment);
      setWorkflowMessage("Contract sent to the jockey for confirmation.");
    } catch (apiError) {
      setAssignmentError(apiError.message || "Unable to upload the contract.");
    } finally {
      setWorkflowActionId("");
    }
  };

  const selectJockey = async (jockey) => {
    setAssignmentSaved(false);
    setAssignmentError("");
    setSelectedJockeyId(jockey.id);

    if (!liveJockeys.length) {
      setSelectedJockeyDetail(null);
      updateStatus(jockey.id, "Invited");
      return;
    }

    setDetailLoadingId(jockey.id);
    try {
      const data = await ownerApi.getJockey(jockey.id);
      setSelectedJockeyDetail(toOwnerJockey(data.jockey || data, 0));
    } catch (apiError) {
      setAssignmentError(apiError.message || "Unable to load jockey detail.");
      setSelectedJockeyDetail(null);
    } finally {
      setDetailLoadingId("");
    }
  };

  const submitAssignment = async (event) => {
    event.preventDefault();
    setAssignmentSaved(false);
    setAssignmentError("");

    if (!liveHorses.length || !liveJockeys.length || !liveRegistrations.length) {
      setAssignmentError("Live horse, approved race registration, and jockey data are required before creating an invitation.");
      return;
    }

    if (!selectedEntry) {
      setAssignmentError("No approved race registration without a jockey assignment is available.");
      return;
    }

    if (!selectedHorse?.id || !selectedRace?.id || !selectedJockey?.id) {
      setAssignmentError("Select an approved race entry and jockey before submitting.");
      return;
    }

    if (!assignment.meetingTitle.trim()) {
      setAssignmentError("Meeting title is required.");
      return;
    }

    if (!assignment.meetingUrl.trim().startsWith("https://meet.google.com/")) {
      setAssignmentError("Google Meet URL is required and must start with https://meet.google.com/.");
      return;
    }

    if (!assignment.meetingTime) {
      setAssignmentError("Meeting time is required.");
      return;
    }

    if (new Date(assignment.meetingTime) <= new Date()) {
      setAssignmentError("Meeting time must be in the future.");
      return;
    }

    if (existingAssignment) {
      setAssignmentError(`This approved race entry already has a ${existingAssignment.status || "current"} jockey assignment.`);
      return;
    }

    setIsAssigning(true);

    try {
      const payload = {
        horse_id: selectedHorse.id,
        race_id: selectedRace.id,
        jockey_id: selectedJockey.id,
        invitation_message: assignment.message || `Please ride ${selectedHorse.name} in ${selectedRace.name}.`,
        meeting: {
          title: assignment.meetingTitle,
          meeting_url: assignment.meetingUrl,
          meeting_time: new Date(assignment.meetingTime).toISOString(),
          note: assignment.message,
        },
      };

      const data = await ownerApi.createJockeyAssignment(payload);
      if (data.assignment) {
        setExistingAssignments((current) => [{
          ...data.assignment,
          horse_id: selectedHorse,
          race_id: selectedRace,
          jockey_id: selectedJockey.raw || selectedJockey,
        }, ...current]);
      }
      updateStatus(selectedJockey.id, "Pending");
      setAssignmentSaved(true);
      setWorkflowMessage("Invitation sent. Contract steps unlock after the jockey accepts the Meet.");
    } catch (apiError) {
      setAssignmentError(apiError.status === 409
        ? `This horse already has a jockey assignment for ${selectedRace.name}. Choose another horse or race.`
        : apiError.message || "Unable to create jockey assignment.");
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading || horsesLoading || registrationsLoading || assignmentsLoading) {
    return <div className="owner-jockey-page"><LoadingSkeleton ariaLabel="Loading jockey assignment workspace" rows={6} variant="cards" /></div>;
  }

  return (
    <div className="owner-jockey-page">
      {(error || horsesError || registrationsError || !liveJockeys.length || !liveHorses.length || !liveRegistrations.length) && (
        <section className={`admin-live-state ${error || horsesError || registrationsError ? "admin-live-state--warning" : ""}`} aria-live="polite">
          {error || horsesError || registrationsError || "Showing sample jockey board until backend jockey, horse, and registration data is available."}
        </section>
      )}

      <section className="owner-jockey-hero">
        <img src={jockeyHeroImage} alt="Jockey preparing for a horse racing assignment" />
        <div className="owner-jockey-hero__copy">
          <p className="owner-eyebrow">Jockey assignments</p>
          <h1>Invite riders after race approval.</h1>
          <p>Start with a Meet invitation, then record terms and send the contract after the jockey accepts.</p>
        </div>
        <aside className="owner-jockey-hero__panel">
          <span className="owner-badge owner-badge--green"><UsersRound size={14} /> {assignedCount} assigned</span>
          <strong>{topWinRate}%</strong>
          <p>Best current win rate across available jockey profiles.</p>
        </aside>
      </section>

      <section className="owner-jockey-stats" aria-label="Jockey assignment summary">
        {[
          { label: "Assigned", value: assignedCount, note: "Confirmed pairings", icon: BadgeCheck },
          { label: "Ready entries", value: assignableRaceEntries.length, note: "Approved, no jockey", icon: ClipboardCheck },
          { label: "Pending", value: pendingCount, note: "Awaiting response", icon: ClipboardCheck },
          { label: "Jockey pool", value: jockeys.length, note: "Profiles in stable list", icon: UsersRound },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article className="owner-jockey-stat" key={item.label}>
              <Icon size={18} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </article>
          );
        })}
      </section>

      <section className={`owner-assignment-workflow ${isWorkflowOpen ? "is-open" : ""}`} aria-label="Jockey assignment pipeline">
        <button
          aria-expanded={isWorkflowOpen}
          className="owner-assignment-workflow__trigger"
          onClick={() => setIsWorkflowOpen((current) => !current)}
          type="button"
        >
          <span className="owner-assignment-workflow__trigger-icon"><ClipboardCheck size={19} /></span>
          <span className="owner-assignment-workflow__trigger-copy">
            <strong>Continue invitations</strong>
            <small>{pendingCount} active / {existingAssignments.length} total assignments</small>
          </span>
          <span className="owner-assignment-workflow__trigger-action">
            {isWorkflowOpen ? "Close" : "Open list"}
            <ChevronDown size={18} />
          </span>
        </button>

        {isWorkflowOpen && (
          <div className="owner-assignment-workflow__body">
            {(workflowMessage || assignmentError) && (
              <div className={`owner-workflow-feedback ${assignmentError ? "is-error" : ""}`} aria-live="polite">
                {assignmentError || workflowMessage}
              </div>
            )}

            <div className="owner-assignment-workflow__layout">
              <div className="owner-assignment-workflow__list" aria-label="Jockey invitations">
                {existingAssignments.map((item) => {
                  const id = item._id;
                  const isSelected = String(id) === String(selectedWorkflowId);
                  const horseName = assignmentPartyName(item.horse_id, "Horse");
                  const raceName = assignmentPartyName(item.race_id, "Race");
                  const jockeyName = assignmentPartyName(item.jockey_id, "Jockey");

                  return (
                    <button
                      aria-pressed={isSelected}
                      className={`owner-assignment-workflow__row ${isSelected ? "is-selected" : ""}`}
                      key={id}
                      onClick={() => {
                        setSelectedWorkflowId(id);
                        setAssignmentError("");
                        setWorkflowMessage("");
                      }}
                      type="button"
                    >
                      <span>
                        <strong>{horseName} / {jockeyName}</strong>
                        <small>{raceName}</small>
                      </span>
                      <span className={`owner-badge ${statusClass(assignmentStatusLabel(item.status))}`}>{assignmentStatusLabel(item.status)}</span>
                    </button>
                  );
                })}

                {!existingAssignments.length && (
                  <div className="owner-assignment-empty" role="status">
                    <ClipboardCheck size={18} />
                    <div><strong>No jockey negotiations yet.</strong><span>Create a Meet invitation below to start the assignment flow.</span></div>
                  </div>
                )}
              </div>

              {selectedWorkflowAssignment ? (() => {
                const item = selectedWorkflowAssignment;
                const id = item._id;
                const draft = workflowDrafts[id] || {};
                const status = item.status;
                const horseName = assignmentPartyName(item.horse_id, "Horse");
                const raceName = assignmentPartyName(item.race_id, "Race");
                const jockeyName = assignmentPartyName(item.jockey_id, "Jockey");
                const isBusy = workflowActionId === id;

                return (
                  <article className="owner-assignment-workflow__detail">
                    <div className="owner-assignment-workflow__summary">
                      <div>
                        <span className="owner-kicker">{horseName} / {raceName}</span>
                        <h3>{jockeyName}</h3>
                      </div>
                      <span className={`owner-badge ${statusClass(assignmentStatusLabel(status))}`}>{assignmentStatusLabel(status)}</span>
                    </div>

                    <div className="owner-assignment-steps" aria-label={`Assignment status: ${assignmentStatusLabel(status)}`}>
                      <span className={status !== "meeting_invited" ? "is-complete" : "is-current"}>Meet invite</span>
                      <span className={["meeting_accepted", "terms_agreed", "contract_uploaded", "accepted"].includes(status) ? "is-complete" : ""}>Meet accepted</span>
                      <span className={["terms_agreed", "contract_uploaded", "accepted"].includes(status) ? "is-complete" : status === "meeting_accepted" ? "is-current" : ""}>Terms</span>
                      <span className={["contract_uploaded", "accepted"].includes(status) ? "is-complete" : status === "terms_agreed" ? "is-current" : ""}>Contract</span>
                      <span className={status === "accepted" ? "is-complete" : status === "contract_uploaded" ? "is-current" : ""}>Accepted</span>
                    </div>

                    {status === "meeting_invited" && <p className="owner-assignment-workflow__note">Waiting for the jockey to accept or reject the Meet invitation.</p>}
                    {status === "meeting_accepted" && (
                      <div className="owner-assignment-workflow__form">
                        <label className="owner-field owner-field--full">
                          <span>Agreed terms <em>Required</em></span>
                          <textarea maxLength={5000} value={draft.agreedTerms || ""} onChange={(event) => updateWorkflowDraft(id, "agreedTerms", event.target.value)} placeholder="Record fee, race scope, preparation, and responsibilities agreed during the Meet." />
                        </label>
                        <label className="owner-field owner-field--full">
                          <span>Meeting note <small>Optional</small></span>
                          <textarea maxLength={2000} value={draft.meetingNote || ""} onChange={(event) => updateWorkflowDraft(id, "meetingNote", event.target.value)} placeholder="Add a short meeting summary." />
                        </label>
                        <button className="owner-button owner-button--primary" disabled={isBusy} onClick={() => submitTerms(item)} type="button">
                          <Save size={16} /> {isBusy ? "Saving terms..." : "Save agreed terms"}
                        </button>
                      </div>
                    )}

                    {status === "terms_agreed" && (
                      <div className="owner-assignment-workflow__form owner-assignment-workflow__form--contract">
                        <div className="owner-assignment-workflow__terms">
                          <span>Recorded terms</span>
                          <p>{item.terms?.agreed_terms}</p>
                        </div>
                        <label className="owner-field">
                          <span>Contract number <small>Optional</small></span>
                          <input value={draft.contractNumber || ""} onChange={(event) => updateWorkflowDraft(id, "contractNumber", event.target.value)} placeholder="JOC-CON-001" />
                        </label>
                        <label className="owner-field">
                          <span>Contract title <small>Optional</small></span>
                          <input value={draft.contractTitle || ""} onChange={(event) => updateWorkflowDraft(id, "contractTitle", event.target.value)} placeholder={`${horseName} jockey agreement`} />
                        </label>
                        <label className={`owner-contract-upload owner-field--full ${draft.contractFile ? "has-file" : ""}`}>
                          <input accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" type="file" onChange={(event) => updateWorkflowDraft(id, "contractFile", event.target.files?.[0] || null)} />
                          <span className="owner-contract-upload__icon"><Upload size={20} /></span>
                          <span className="owner-contract-upload__copy">
                            <strong>{draft.contractFile?.name || "Choose signed contract"}</strong>
                            <small>PDF, JPG, PNG, or WEBP, up to 7 MB</small>
                          </span>
                          <span className="owner-contract-upload__action">Browse</span>
                        </label>
                        <label className="owner-field owner-field--full">
                          <span>Contract note <small>Optional</small></span>
                          <textarea maxLength={1000} value={draft.contractNote || ""} onChange={(event) => updateWorkflowDraft(id, "contractNote", event.target.value)} placeholder="Add signing or payment details for the jockey." />
                        </label>
                        <button className="owner-button owner-button--primary" disabled={isBusy} onClick={() => uploadContract(item)} type="button">
                          <Upload size={16} /> {isBusy ? "Uploading contract..." : "Send contract to jockey"}
                        </button>
                      </div>
                    )}

                    {status === "contract_uploaded" && <p className="owner-assignment-workflow__note">Contract sent. The assignment becomes accepted only after the jockey confirms it.</p>}
                    {status === "accepted" && <p className="owner-assignment-workflow__note is-success"><CheckCircle2 size={16} /> The jockey confirmed the contract and accepted this assignment.</p>}
                    {status === "meeting_rejected" && <p className="owner-assignment-workflow__note">The jockey declined the Meet invitation.</p>}
                    {status === "contract_rejected" && <p className="owner-assignment-workflow__note">The jockey rejected the contract. This assignment was not accepted.</p>}
                    {item.contract?.file_url && <a className="owner-assignment-contract-link" href={item.contract.file_url} rel="noreferrer" target="_blank"><FileText size={15} /> View uploaded contract</a>}
                  </article>
                );
              })() : (
                <div className="owner-assignment-workflow__placeholder">
                  <ClipboardCheck size={22} />
                  <strong>Select an invitation</strong>
                  <span>Choose one item from the list to view its status, details, and available actions.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <form className="owner-registration-form" onSubmit={submitAssignment}>
        <div className="owner-card__header">
          <div>
            <span className="owner-kicker">Live assignment</span>
            <h2>Create jockey invitation</h2>
          </div>
          <Send size={20} />
        </div>

        <section className="owner-approved-entry-panel">
          <div className="owner-approved-entry-panel__header">
            <div>
              <span className="owner-kicker">Approved race entries</span>
              <h3>Choose the race slot before selecting a jockey</h3>
            </div>
            <span className="owner-badge owner-badge--green">{assignableRaceEntries.length} ready</span>
          </div>

          {assignableRaceEntries.length ? (
            <div className="owner-approved-entry-list" role="listbox" aria-label="Approved race entries without jockey assignments">
              {assignableRaceEntries.map((entry) => (
                <button
                  aria-selected={selectedEntry?.id === entry.id}
                  className={`owner-approved-entry ${selectedEntry?.id === entry.id ? "is-selected" : ""}`}
                  key={entry.id}
                  onClick={() => updateAssignment("registrationId", entry.id)}
                  role="option"
                  type="button"
                >
                  <span className="owner-approved-entry__main">
                    <strong>{entry.horse}</strong>
                    <small>{entry.race} / {entry.tournament}</small>
                  </span>
                  <span className="owner-approved-entry__meta">
                    <small>{entry.submitted}</small>
                    <BadgeCheck size={16} />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="owner-assignment-empty" role="status">
              <ClipboardCheck size={18} />
              <div>
                <strong>No race entry is ready for a jockey invitation.</strong>
                <span>Admin must approve the horse race registration, and the entry must not already have a jockey assignment.</span>
              </div>
            </div>
          )}
        </section>

        <div className="owner-invitation-context" aria-label="Invitation selection">
          <div><span>Horse</span><strong>{selectedHorse?.name || "Not selected"}</strong></div>
          <div><span>Race</span><strong>{selectedRace?.name || "Not selected"}</strong></div>
          <div><span>Jockey</span><strong>{selectedJockeyDetail?.name || selectedJockey?.name || "Not selected"}</strong></div>
          <span className={`owner-invitation-gate ${selectedEntry ? "is-ready" : ""}`}>
            {selectedEntry ? <CheckCircle2 size={16} /> : <ClipboardCheck size={16} />}
            {selectedEntry ? "Entry approved" : "Entry required"}
          </span>
        </div>

        <div className="owner-invitation-fields">
          <fieldset className="owner-invitation-section owner-invitation-section--message">
            <legend><MessageSquareText size={18} /><span>Invitation note</span></legend>
            <label className="owner-field owner-field--full">
              <span>Message <small>Optional</small></span>
              <textarea value={assignment.message} onChange={(event) => updateAssignment("message", event.target.value)} placeholder="Share race preparation, arrival time, or stable notes..." />
            </label>
          </fieldset>

          <fieldset className="owner-invitation-section owner-invitation-section--meeting">
            <legend><Link2 size={18} /><span>Meeting details</span></legend>
            <div className="owner-invitation-section__grid">
              <label className="owner-field">
                <span>Meeting title <em>Required</em></span>
                <input required value={assignment.meetingTitle} onChange={(event) => updateAssignment("meetingTitle", event.target.value)} placeholder="Race briefing with stable owner" />
              </label>
              <label className="owner-field">
                <span>Meeting time <em>Required</em></span>
                <input required type="datetime-local" value={assignment.meetingTime} onChange={(event) => updateAssignment("meetingTime", event.target.value)} />
              </label>
              <label className="owner-field owner-field--full">
                <span>Google Meet URL <em>Required</em></span>
                <input required type="url" value={assignment.meetingUrl} onChange={(event) => updateAssignment("meetingUrl", event.target.value)} placeholder="https://meet.google.com/abc-defg-hij" />
              </label>
            </div>
          </fieldset>

        </div>

        {blockedByNoEntry && (
          <div className="owner-assignment-conflict" role="status">
            <ClipboardCheck size={16} />
            <span><strong>No eligible race entry.</strong> A horse must have an approved race registration and no existing jockey assignment before you can invite a jockey.</span>
          </div>
        )}

        {existingAssignment && (
          <div className="owner-assignment-conflict" role="status">
            <ShieldCheck size={16} />
            <span><strong>Assignment already exists.</strong> {selectedHorse?.name} already has a {existingAssignment.status || "current"} jockey assignment for {selectedRace?.name}.</span>
          </div>
        )}

        <div className="owner-form-actions owner-invitation-actions">
          <div className="owner-invitation-feedback" aria-live="polite">
            {assignmentSaved && <span className="owner-success"><CheckCircle2 size={16} /> Invitation sent.</span>}
            {assignmentError && <span className="owner-success owner-success--error">{assignmentError}</span>}
            {!assignmentSaved && !assignmentError && <span>Send the Meet invitation first. Terms and contract unlock after the jockey accepts.</span>}
          </div>
          <button className="owner-button owner-button--primary owner-invitation-submit" disabled={isAssigning || assignmentsLoading || invitationLocked || detailLoadingId === selectedJockeyId} type="submit">
            <Send size={17} />
            {isAssigning ? "Sending invitation..." : `Invite ${selectedJockey?.name || "jockey"}`}
          </button>
        </div>
      </form>

      <section className="owner-jockey-board">
        {jockeys.map((jockey, index) => {
          const isSelected = selectedJockeyId === jockey.id;
          return (
            <article className={`owner-jockey-card ${isSelected ? "is-selected" : ""}`} key={jockey.id}>
              <div className="owner-jockey-card__media">
                <img src={jockeyImages[index % jockeyImages.length]} alt={`${jockey.name} jockey profile`} />
                <span className={`owner-badge ${statusClass(jockey.status)}`}>{jockey.status}</span>
                {isSelected && <span className="owner-jockey-card__selected"><Check size={15} /> Selected</span>}
              </div>
              <div className="owner-jockey-card__body">
                <div className="owner-jockey-card__header">
                  <div>
                    <span className="owner-kicker">{compactRecordCode("License", jockey.licenseNumber || jockey.id)}</span>
                    <h2>{jockey.name}</h2>
                  </div>
                </div>

                <div className="owner-jockey-pairing owner-jockey-pairing--compact">
                  <UserRound size={18} />
                  <div>
                    <span>Current pairing</span>
                    <strong>{jockey.assignedHorse}</strong>
                  </div>
                </div>

                <div className="owner-jockey-metrics">
                  <div><span>Wins</span><strong>{jockey.wins}</strong></div>
                  <div><span>Race starts</span><strong>{jockey.races}</strong></div>
                  <div><span>License</span><strong>{jockey.licenseNumber || "Not set"}</strong></div>
                </div>

                <div className="owner-jockey-card__actions">
                  <button
                    aria-pressed={isSelected}
                    className={`owner-button owner-jockey-select ${isSelected ? "is-selected" : "owner-button--primary"}`}
                    disabled={detailLoadingId === jockey.id}
                    type="button"
                    onClick={() => selectJockey(jockey)}
                  >
                    {isSelected ? <Check size={17} /> : <UserRound size={17} />}
                    {detailLoadingId === jockey.id ? "Loading jockey..." : isSelected ? "Selected for invitation" : "Select jockey"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function OwnerSchedule() {
  const [filter, setFilter] = useState("All");
  const visibleRaces = ownerSchedule.filter((race) => filter === "All" || race.status === filter);
  const confirmedCount = ownerSchedule.filter((race) => race.status === "Confirmed").length;
  const pendingCount = ownerSchedule.filter((race) => race.status === "Pending").length;
  const reviewCount = ownerSchedule.filter((race) => race.status === "Review").length;
  const featuredRace = visibleRaces[0] ?? ownerSchedule[0];

  return (
    <div className="owner-schedule-page">
      <section className="owner-schedule-hero">
        <img src={scheduleHeroImage} alt="Race track at night for owner schedule planning" />
        <div className="owner-schedule-hero__copy">
          <p className="owner-eyebrow">Race calendar</p>
          <h1>Track every owner race slot.</h1>
          <p>Review date, venue, round, horse, jockey, and confirmation status in one race-day board.</p>
        </div>
        <aside className="owner-schedule-hero__panel">
          <span className={`owner-badge ${statusClass(featuredRace.status)}`}>{featuredRace.status}</span>
          <strong>{featuredRace.race}</strong>
          <p>{featuredRace.time} / {featuredRace.venue}</p>
        </aside>
      </section>

      <section className="owner-schedule-stats" aria-label="Schedule summary">
        {[
          { label: "All slots", value: ownerSchedule.length, note: "Race windows", icon: CalendarDays },
          { label: "Confirmed", value: confirmedCount, note: "Ready for race day", icon: BadgeCheck },
          { label: "Pending", value: pendingCount, note: "Waiting on admin", icon: ClipboardCheck },
          { label: "Review", value: reviewCount, note: "Needs follow-up", icon: Flag },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article className="owner-schedule-stat" key={item.label}>
              <Icon size={18} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </article>
          );
        })}
      </section>

      <article className="owner-schedule-board">
        <div className="owner-schedule-board__header">
          <div>
            <span className="owner-kicker">Schedule board</span>
            <h2>{filter === "All" ? "All race slots" : `${filter} race slots`}</h2>
          </div>
          <div className="owner-segmented owner-segmented--schedule">
            {["All", "Confirmed", "Pending", "Review"].map((item) => (
              <button className={filter === item ? "owner-segmented__active" : ""} key={item} type="button" onClick={() => setFilter(item)}>{item}</button>
            ))}
          </div>
        </div>

        <div className="owner-schedule-list">
          {visibleRaces.map((race) => {
            const [date, time] = race.time.split(", ");
            return (
              <div className="owner-schedule-slot" key={race.id}>
                <div className="owner-schedule-slot__time">
                  <span>{date}</span>
                  <strong>{time}</strong>
                </div>
                <div className="owner-schedule-slot__race">
                  <span className="owner-kicker">{race.id} / {race.round}</span>
                  <h3>{race.race}</h3>
                  <small><MapPin size={13} /> {race.venue}</small>
                </div>
                <div className="owner-schedule-slot__pairing">
                  <div><span>Horse</span><strong>{race.horse}</strong></div>
                  <div><span>Jockey</span><strong>{race.jockey}</strong></div>
                </div>
                <div className="owner-schedule-slot__status">
                  <span className={`owner-badge ${statusClass(race.status)}`}>{race.status}</span>
                  <small>{race.tournament}</small>
                </div>
              </div>
            );
          })}
          {visibleRaces.length === 0 && <div className="owner-empty owner-empty--compact">No race slots match this filter.</div>}
        </div>
      </article>
    </div>
  );
}

function OwnerResults() {
  const totalPrize = "$34,200";
  const bestResult = ownerResults.reduce((best, result) => (result.position < best.position ? result : best), ownerResults[0]);
  const prizeTotal = ownerResults.reduce((sum, result) => sum + Number(result.prize.replace(/[$,]/g, "")), 0);
  const podiumCount = ownerResults.filter((result) => result.position <= 3).length;

  return (
    <div className="owner-results-page">
      <section className="owner-results-hero">
        <img src={resultsHeroImage} alt="Race trophy display for owner results and prizes" />
        <div className="owner-results-hero__copy">
          <p className="owner-eyebrow">Results and prizes</p>
          <h1>Review finishes and season earnings.</h1>
          <p>Prize tracking is grouped with official race outcomes so every owner decision has recent performance context.</p>
        </div>
        <aside className="owner-results-hero__panel">
          <span className="owner-badge owner-badge--green"><Trophy size={14} /> Best finish</span>
          <strong>#{bestResult.position}</strong>
          <p>{bestResult.horse} / {bestResult.race}</p>
        </aside>
      </section>

      <section className="owner-results-stats" aria-label="Results summary">
        {[
          { label: "Season earnings", value: ownerProfile.earnings, note: "All settled prizes", icon: Trophy },
          { label: "Recent prizes", value: `$${prizeTotal.toLocaleString()}`, note: "Listed results total", icon: Award },
          { label: "Published", value: ownerResults.length, note: "Official outcomes", icon: Flag },
          { label: "Podiums", value: podiumCount, note: "Top-three finishes", icon: BadgeCheck },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article className="owner-results-stat" key={item.label}>
              <Icon size={18} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </article>
          );
        })}
      </section>

      <section className="owner-results-layout">
        <article className="owner-results-feature">
          <div>
            <span className="owner-kicker">Prize focus</span>
            <h2>{totalPrize} recently settled</h2>
            <p>Use the latest published finishes to decide where to register, which jockeys to keep paired, and how to pace the season.</p>
          </div>
          <div className="owner-results-feature__facts">
            <div><span>Top horse</span><strong>{bestResult.horse}</strong></div>
            <div><span>Top race</span><strong>{bestResult.race}</strong></div>
            <div><span>Winning time</span><strong>{bestResult.time}</strong></div>
          </div>
        </article>

        <article className="owner-results-board">
          <div className="owner-card__header">
            <div>
              <span className="owner-kicker">Published outcomes</span>
              <h2>Race result ledger</h2>
            </div>
            <Trophy size={20} />
          </div>
          <div className="owner-results-list">
            {ownerResults.map((result) => (
              <div className="owner-results-row" key={result.id}>
                <time className="owner-results-row__date">{result.date}</time>
                <div className="owner-results-row__main">
                  <span className="owner-kicker">{result.id}</span>
                  <h3>{result.race}</h3>
                  <small>{result.horse}</small>
                </div>
                <div className="owner-results-row__metrics">
                  <div><span>Position</span><strong>#{result.position}</strong></div>
                  <div><span>Time</span><strong>{result.time}</strong></div>
                  <div><span>Prize</span><strong>{result.prize}</strong></div>
                </div>
                <span className={`owner-badge ${statusClass(result.status)}`}>{result.status}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function OwnerProfile() {
  const { profile, isLoading, error, reload } = useOwnerProfile();
  const [form, setForm] = useState({ stable: "", location: "", licenseNumber: "", status: "Ready" });
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;

    setForm({
      stable: profile.stable,
      location: profile.location,
      licenseNumber: profile.licenseNumber,
      status: profile.status,
    });
  }, [profile]);

  if (isLoading) {
    return <div className="owner-profile-page"><LoadingSkeleton ariaLabel="Loading owner profile" variant="detail" /></div>;
  }

  if (error || !profile) {
    return <div className="owner-empty owner-empty--error">{error || "Owner profile not found."}</div>;
  }

  const updateField = (field, value) => {
    setMessage("");
    setSaveError(false);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetProfileForm = () => {
    setMessage("");
    setSaveError(false);
    setForm({
      stable: profile.stable,
      location: profile.location,
      licenseNumber: profile.licenseNumber,
      status: profile.status,
    });
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setSaveError(false);

    try {
      await ownerApi.updateProfile(toOwnerProfilePayload(form));
      await reload();
      setMessage("Profile changes saved.");
    } catch (apiError) {
      setSaveError(true);
      setMessage(apiError.message || "Unable to save owner profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="owner-profile-page">
      <section className="owner-profile-hero">
        <img src={profileStableImage} alt={`${profile.stable} stable profile background`} />
        <div className="owner-profile-hero__copy">
          <p className="owner-eyebrow">Owner profile</p>
          <h1>{profile.name}</h1>
          <p>{profile.stable}</p>
          <div className="owner-profile-hero__meta">
            <span><MapPin size={15} /> {profile.location}</span>
            <span><CalendarDays size={15} /> {profile.joined}</span>
          </div>
        </div>
        <aside className="owner-profile-card" aria-label="Verified owner identity">
          <img src={profileHeroImage} alt={`${profile.name} owner portrait`} />
          <div>
            <span className="owner-badge owner-badge--green"><ShieldCheck size={14} /> Verified Owner</span>
            <strong>{profile.licenseNumber}</strong>
            <small>Owner license</small>
          </div>
        </aside>
      </section>

      <section className="owner-profile-stats" aria-label="Owner account summary">
        {[
          { label: "Season", value: profile.season, note: "Current profile cycle", icon: CalendarDays },
          { label: "Win rate", value: profile.winRate, note: "Stable performance", icon: Trophy },
          { label: "Earnings", value: profile.earnings, note: "Settled prizes", icon: Award },
          { label: "Status", value: profile.status, note: "Account access", icon: ShieldCheck },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article className="owner-profile-stat" key={item.label}>
              <Icon size={18} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </article>
          );
        })}
      </section>

      <section className="owner-profile-layout">
        <article className="owner-profile-panel-main">
          <div className="owner-card__header">
            <div>
              <span className="owner-kicker">Owner information</span>
              <h2>Contact and stable identity</h2>
            </div>
            <UserRound size={20} />
          </div>
          <div className="owner-profile-contact-grid">
            <div><span><UserRound size={14} /> Name</span><strong>{profile.name}</strong></div>
            <div><span><ShieldCheck size={14} /> Stable</span><strong>{profile.stable}</strong></div>
            <div><span><Mail size={14} /> Email</span><strong>{profile.email}</strong></div>
            <div><span><Phone size={14} /> Phone</span><strong>{profile.phone}</strong></div>
            <div><span><MapPin size={14} /> Location</span><strong>{profile.location}</strong></div>
            <div><span><BadgeCheck size={14} /> License</span><strong>{profile.licenseNumber}</strong></div>
          </div>
        </article>

        <aside className="owner-profile-verify">
          <div className="owner-card__header">
            <div>
              <span className="owner-kicker">Verification</span>
              <h2>Owner permissions</h2>
            </div>
            <ShieldCheck size={20} />
          </div>
          <div className="owner-profile-verify__body">
            <span className="owner-badge owner-badge--green"><ShieldCheck size={14} /> Verified Owner</span>
            <strong>{profile.season}</strong>
            <p>Account can submit horse registrations, manage jockey assignments, and track prize outcomes.</p>
          </div>
        </aside>
      </section>

      <section className="owner-profile-edit-shell">
        <article className="owner-profile-panel-main owner-profile-edit-panel">
          <div className="owner-card__header">
            <div>
              <span className="owner-kicker">Profile settings</span>
              <h2>Edit stable details</h2>
              <p>Keep registration and licensing details current.</p>
            </div>
            <Edit3 size={20} />
          </div>
          <form className="owner-profile-edit-form" onSubmit={handleProfileSubmit}>
            <div className="owner-profile-edit-grid">
              <label className="owner-profile-field">
                <span>Stable name <em>Required</em></span>
                <input autoComplete="organization" maxLength={100} required value={form.stable} onChange={(event) => updateField("stable", event.target.value)} />
                <small>Shown on horse registrations and invitations.</small>
              </label>
              <label className="owner-profile-field">
                <span>Address <em>Required</em></span>
                <input autoComplete="street-address" maxLength={180} required value={form.location} onChange={(event) => updateField("location", event.target.value)} />
                <small>Used as the stable's primary contact location.</small>
              </label>
              <label className="owner-profile-field">
                <span>License number <em>Required</em></span>
                <input maxLength={60} required value={form.licenseNumber} onChange={(event) => updateField("licenseNumber", event.target.value)} />
                <small>Must match the verified owner record.</small>
              </label>
              <FormSelect label="Status" value={form.status} options={["Ready", "Needs review", "Closed"]} onChange={(value) => updateField("status", value)} />
            </div>
            <div className="owner-form-actions owner-profile-edit-actions">
              <div className="owner-profile-save-feedback" aria-live="polite">
                {message && <span className={`owner-success${saveError ? " owner-success--error" : ""}`}>{saveError ? null : <CheckCircle2 size={16} />} {message}</span>}
                {!message && <span>Changes apply to future registrations and jockey invitations.</span>}
              </div>
              <button className="owner-button" disabled={isSaving} type="button" onClick={resetProfileForm}>
                <RotateCcw size={16} /> Reset
              </button>
              <button className="owner-button owner-button--primary" disabled={isSaving} type="submit">
                <Save size={16} /> {isSaving ? "Saving..." : "Save profile"}
              </button>
            </div>
          </form>
        </article>
      </section>

      <section className="owner-profile-lower">
        <article className="owner-profile-notifications">
          <div className="owner-card__header">
            <div>
              <span className="owner-kicker">Notifications</span>
              <h2>Recent account signals</h2>
            </div>
            <BadgeCheck size={20} />
          </div>
          <ul>
            {ownerNotifications.map((item) => <li key={item}><Trophy size={16} /><span>{item}</span></li>)}
          </ul>
        </article>

        <article className="owner-profile-preferences">
          <div className="owner-card__header">
            <div>
              <span className="owner-kicker">Preferences</span>
              <h2>Alert controls</h2>
            </div>
            <UsersRound size={20} />
          </div>
          <div className="owner-profile-preference-list">
            <label><input type="checkbox" defaultChecked /><span>Race schedule updates</span></label>
            <label><input type="checkbox" defaultChecked /><span>Jockey invitation responses</span></label>
            <label><input type="checkbox" defaultChecked /><span>Registration approval alerts</span></label>
          </div>
        </article>
      </section>
    </div>
  );
}

export {
  OwnerHorseDetail,
  OwnerHorseForm,
  OwnerHorses,
  OwnerJockeys,
  OwnerProfile,
  OwnerRegistrations,
  OwnerResults,
  OwnerSchedule,
};
