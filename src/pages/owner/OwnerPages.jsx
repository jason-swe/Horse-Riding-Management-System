import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Award,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Check,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  Edit3,
  ExternalLink,
  FileText,
  Filter,
  Flag,
  HeartPulse,
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
  X,
} from "lucide-react";
import LoadingSkeleton from "../../components/LoadingSkeleton.jsx";
import { ownerApi } from "../../api/ownerApi";
import { advancedHorseGearOptions, commonHorseGearOptions } from "../../constants/raceModelInputs";
import { readFileAsDataUri } from "../../utils/fileData";
import { findAcceptedPrimaryAssignment, toHorsePayload, toOwnerJockey, toOwnerProfilePayload, toOwnerRaceOption, toOwnerScheduleEntry } from "./ownerAdapters";
import { useOwnerHorse, useOwnerHorseApprovalStatus, useOwnerHorses, useOwnerJockeyAssignments, useOwnerJockeys, useOwnerPrizeAwards, useOwnerProfile, useOwnerRegistrations, useOwnerTournaments } from "./useOwnerData";

const statusClass = (status) => {
  if (["Ready", "Approved", "Assigned", "Confirmed", "Published", "Won", "Verified", "Paid"].includes(status)) {
    return "owner-badge--green";
  }
  if (["Rejected", "Closed", "Cancelled", "Meet rejected", "Appointment rejected", "Contract rejected", "Replaced", "Disqualified"].includes(status)) {
    return "owner-badge--muted";
  }
  return "owner-badge--amber";
};

const formatMoney = (value, currency = "VND") => {
  const amount = Number(value || 0);

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("en-US")} ${currency}`;
  }
};

const FactPills = ({ facts, emptyText = "No optional profile data recorded yet." }) => {
  if (!facts?.length) {
    return <div className="owner-fact-empty">{emptyText}</div>;
  }

  return (
    <div className="owner-roster-card__facts">
      {facts.map((fact) => (
        <span key={fact.label}>
          <small>{fact.label}</small>
          <strong>{fact.value}</strong>
        </span>
      ))}
    </div>
  );
};

const GearOption = ({ gear, selected, onToggle }) => (
  <label className={`owner-gear-option${selected ? " is-selected" : ""}`} title={gear.label}>
    <input checked={selected} onChange={onToggle} type="checkbox" aria-label={gear.label} />
    <span className="owner-gear-option__check" aria-hidden="true" />
    <strong>{gear.code}</strong>
    <span className="owner-gear-option__label">{gear.label}</span>
  </label>
);

const GearSelector = ({ value = [], onChange, label = "Race gear" }) => {
  const toggleGear = (code) => onChange(value.includes(code)
    ? value.filter((item) => item !== code)
    : [...value, code]);

  return (
    <fieldset className="owner-gear-selector">
      <legend>{label}</legend>
      <div className="owner-gear-selector__grid">
        {commonHorseGearOptions.map((gear) => (
          <GearOption key={gear.code} gear={gear} selected={value.includes(gear.code)} onToggle={() => toggleGear(gear.code)} />
        ))}
      </div>
      <p className="owner-gear-selector__group-title">Additional gear</p>
      <div className="owner-gear-selector__grid owner-gear-selector__grid--advanced">
        {advancedHorseGearOptions.map((gear) => (
          <GearOption key={gear.code} gear={gear} selected={value.includes(gear.code)} onToggle={() => toggleGear(gear.code)} />
        ))}
      </div>
    </fieldset>
  );
};

const formatInvitationDate = (value) => {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const isMongoObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value || ""));

const compactRecordCode = (prefix, value) => {
  if (!value) return prefix;
  if (isMongoObjectId(value)) return `${prefix}-${String(value).slice(-6).toUpperCase()}`;
  return value;
};

const imageIndexForId = (value, length) => {
  const hash = Array.from(String(value || "horse")).reduce((total, character) => total + character.charCodeAt(0), 0);
  return hash % length;
};

const assignmentStatusLabel = (status) => ({
  meeting_invited: "Appointment invitation sent",
  meeting_accepted: "Appointment accepted",
  meeting_rejected: "Appointment rejected",
  terms_agreed: "Terms recorded",
  contract_uploaded: "Contract awaiting jockey",
  contract_rejected: "Contract rejected",
  accepted: "Accepted",
  replaced: "Replaced",
  cancelled: "Cancelled",
}[status] || status || "Unknown");

const activeAssignmentStatuses = ["meeting_invited", "meeting_accepted", "terms_agreed", "contract_uploaded", "accepted"];

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
        aria-haspopup="listbox"
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
const profileFallbackAvatar = "https://avatarhub.edu.vn/wp-content/uploads/2025/12/avatar-mac-dinh-cua-fb-4.jpg";
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
    const text = `${horse.name} ${horse.registrationNumber} ${horse.breed} ${horse.gender} ${horse.color} ${horse.status}`.toLowerCase();
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
          <span className="owner-badge owner-badge--green"><BadgeCheck size={14} /> {horses.filter((horse) => horse.status === "Ready").length} active profiles</span>
          <strong>{firstHorse?.name || "No horses yet"}</strong>
          <p>{firstHorse?.healthNote || "Create the first horse profile to begin owner API tracking."}</p>
        </aside>
      </section>

      <StatStrip
        items={[
          { label: "Stable horses", value: horses.length, note: "Registered profiles", icon: HeartPulse },
          { label: "Active profiles", value: horses.filter((horse) => horse.status === "Ready").length, note: "Horse status from API", icon: BadgeCheck },
          { label: "Health notes", value: horses.filter((horse) => horse.healthNote).length, note: "Profiles with vet context", icon: ClipboardCheck },
          { label: "Images", value: horses.filter((horse) => horse.imageUrl).length, note: "Uploaded horse media", icon: FileText },
        ]}
      />

      {error && <div className="owner-empty owner-empty--error">{error}</div>}

      <div className="owner-toolbar">
        <label className="owner-search">
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search horse, code, breed..." />
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
              <img src={horse.imageUrl || horseRosterImages[index % horseRosterImages.length]} alt={`${horse.name} profile`} />
              <span className={`owner-badge ${statusClass(horse.status)}`}>{horse.status}</span>
            </Link>
            <div className="owner-roster-card__body">
              <div className="owner-roster-card__title">
                <div>
                  <span className="owner-kicker">{horse.registrationNumber || compactRecordCode("Horse", horse.id)}</span>
                  <h2>{horse.name}</h2>
                </div>
                <span className={`owner-roster-card__status ${statusClass(horse.status)}`}>{horse.status}</span>
              </div>

              <FactPills facts={horse.facts} />

              {horse.healthNote
                ? <p className="owner-roster-card__note"><HeartPulse size={15} /> {horse.healthNote}</p>
                : <div className="owner-fact-empty owner-fact-empty--note"><HeartPulse size={15} /> No health status recorded.</div>}

              <div className="owner-roster-card__actions">
                <Link className="owner-roster-action owner-roster-action--primary" to={`/owner/horses/${horse.id}`}>View</Link>
                <Link className="owner-roster-action" to={`/owner/horses/${horse.id}/edit`}>Edit</Link>
                <Link className="owner-roster-action" to="/owner/registrations">Register</Link>
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
  const horseIndex = imageIndexForId(existingHorse?.id || horseId, horseRosterImages.length);
  const horseImage = horseRosterImages[Math.max(horseIndex, 0) % horseRosterImages.length];
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    registrationNumber: "",
    breed: "Thoroughbred",
    dateOfBirth: "",
    weight: "",
    status: "Ready",
    healthNote: "",
    defaultGears: [],
    imageFile: null,
    imageFileName: "",
  });

  useEffect(() => {
    if (!existingHorse) return;

    setForm({
      name: existingHorse.name,
      registrationNumber: existingHorse.registrationNumber,
      breed: existingHorse.breed || "Other",
      dateOfBirth: existingHorse.dateOfBirth,
      weight: existingHorse.weight,
      status: existingHorse.status,
      healthNote: existingHorse.healthNote,
      defaultGears: existingHorse.defaultGears || [],
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
          <p>Update the details owners, admins, and referees can read from the horse profile contract.</p>
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
              <label>Date of birth<input type="date" value={form.dateOfBirth} onChange={(event) => updateField("dateOfBirth", event.target.value)} /></label>
              <label>Weight<input value={form.weight} onChange={(event) => updateField("weight", event.target.value)} /></label>
              <div className="owner-form-span">
                <GearSelector label="Default race gear" value={form.defaultGears} onChange={(value) => updateField("defaultGears", value)} />
              </div>
              <label className="owner-form-span owner-profile-image-field">
                <span className="owner-profile-image-field__title">Profile image</span>
                <input className="owner-profile-image-field__input" accept="image/*" type="file" onChange={(event) => updateImageFile(event.target.files?.[0] || null)} />
                {form.imageFileName && <small className="owner-form-hint">Selected: {form.imageFileName}</small>}
              </label>
            </div>
          </section>

          <section className="owner-form-section">
            <div className="owner-form-section__header">
              <span className="owner-kicker">Profile state</span>
              <h2>Owner visibility</h2>
            </div>
            <div className="owner-form-grid">
              <FormSelect label="Status" value={form.status} options={["Ready", "Needs review", "Closed"]} onChange={(value) => updateField("status", value)} />
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

  const horseImage = horseRosterImages[imageIndexForId(horse.id, horseRosterImages.length)];
  const registrations = approvalStatus?.registrations || [];
  const schedule = registrations.map(toOwnerScheduleEntry);
  const summaryFacts = [
    horse.age !== "Not set" ? { label: "Age", value: `${horse.age} yrs`, icon: HeartPulse } : null,
    horse.breed ? { label: "Breed", value: horse.breed, icon: Flag } : null,
    horse.weight ? { label: "Weight", value: horse.weight, icon: Award } : null,
    { label: "Rating", value: horse.currentRating, icon: Trophy },
    horse.defaultGears.length ? { label: "Default gear", value: horse.defaultGears.join(" / "), icon: ShieldCheck } : null,
    registrations.length ? { label: "Registrations", value: registrations.length, icon: ClipboardCheck } : null,
  ].filter(Boolean);

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
          <p className="owner-eyebrow">{horse.registrationNumber || compactRecordCode("Horse", horse.id)}{horse.breed ? ` / ${horse.breed}` : ""}</p>
          <h1>{horse.name}</h1>
          <p>{horse.healthNote || "No health status recorded for this horse yet."}</p>
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
            <strong>{horse.registrationNumber || compactRecordCode("Horse", horse.id)}</strong>
            <small>{horse.facts.length ? horse.facts.map((fact) => fact.value).join(" / ") : "Optional profile details not recorded."}</small>
          </div>
        </aside>
      </section>

      <section className="owner-detail-summary" aria-label="Horse summary">
        {summaryFacts.map((item) => {
          const Icon = item.icon;
          return (
            <article className="owner-detail-summary__item" key={item.label}>
              <Icon size={18} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          );
        })}
        {summaryFacts.length === 0 && <div className="owner-empty owner-empty--compact">No optional horse profile facts have been recorded yet.</div>}
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
              <span>Profile status</span>
              <strong>{horse.status}</strong>
              <small>Status comes from the horse record.</small>
            </div>
            <div>
              <span>Registration state</span>
              <strong>{registrations[0]?.status ?? "Not submitted"}</strong>
              <small>{registrations[0]?.note ?? "Create a tournament entry when ready."}</small>
            </div>
            <div>
              <span>Next race</span>
              <strong>{schedule[0]?.race || "Not scheduled"}</strong>
              <small>{schedule[0] ? `${schedule[0].date} / ${schedule[0].tournament}` : "Approved registrations create schedule context."}</small>
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
          <div className="owner-empty owner-empty--compact" role="status">
            Published results are unavailable for the Horse Owner role in the current backend contract.
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
  const horses = liveHorses;
  const tournaments = liveTournaments;
  const registrations = liveRegistrations;
  const approvedCount = registrations.filter((item) => item.status === "Approved").length;
  const [races, setRaces] = useState([]);
  const [racesLoading, setRacesLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [tournamentQuery, setTournamentQuery] = useState("");
  const tournamentDetailRef = useRef(null);
  const [entry, setEntry] = useState({
    horse: horses[0]?.name || "",
    tournament: tournaments[0]?.id || "",
    race: "",
    note: "",
    gears: [],
  });
  const selectedHorse = horses.find((horse) => horse.name === entry.horse) ?? horses[0];
  const selectedTournament = tournaments.find((tournament) => tournament.id === entry.tournament) ?? tournaments[0];
  const selectedRace = races.find((race) => race.id === entry.race) ?? null;
  const filteredTournaments = tournaments.filter((tournament) => (
    `${tournament.name} ${tournament.location} ${tournament.date} ${tournament.status}`
      .toLowerCase()
      .includes(tournamentQuery.trim().toLowerCase())
  ));
  const tournamentPrizePool = selectedTournament?.prizePool || races.reduce((total, race) => total + Number(race.prizePool || 0), 0);
  const tournamentPrizeCurrency = selectedTournament?.prizeCurrency || selectedRace?.prizeCurrency || "VND";
  const registrationFeeVnd = Number(selectedRace?.entryFeeVnd || 0);
  const registrationFeeCurrency = selectedRace?.entryFeeCurrency || "VND";

  useEffect(() => {
    if (!horses.length || entry.horse) return;
    setEntry((current) => ({ ...current, horse: horses[0].name, gears: horses[0].defaultGears || [] }));
  }, [entry.horse, horses]);

  useEffect(() => {
    if (!tournaments.length || entry.tournament) return;
    setEntry((current) => ({ ...current, tournament: tournaments[0].id }));
  }, [entry.tournament, tournaments]);

  useEffect(() => {
    let cancelled = false;

    async function loadRaces() {
      if (!selectedTournament?.id) {
        setRaces([]);
        return;
      }

      setRaces([]);
      setEntry((current) => ({ ...current, race: "" }));
      setRacesLoading(true);
      setError("");

      try {
        const data = await ownerApi.getTournamentRaces(selectedTournament.id);
        if (!cancelled) {
          const nextRaces = (data.races || []).map(toOwnerRaceOption);
          setRaces(nextRaces);
          setEntry((current) => ({
            ...current,
            race: nextRaces.find((race) => race.registrationAvailable)?.id || "",
          }));
        }
      } catch (apiError) {
        if (!cancelled) {
          setRaces([]);
          setError(apiError.message || "Unable to load races for tournament.");
        }
      } finally {
        if (!cancelled) {
          setRacesLoading(false);
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
    if (["horse", "tournament", "race"].includes(field)) {
      setTermsAccepted(false);
    }
    setEntry((current) => {
      if (field === "horse") {
        const horse = horses.find((item) => item.name === value);
        return { ...current, horse: value, gears: horse?.defaultGears || [] };
      }
      return { ...current, [field]: value };
    });
  };

  const scrollTo = (ref) => {
    window.requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const selectTournament = (tournamentId) => {
    updateEntry("tournament", tournamentId);
    scrollTo(tournamentDetailRef);
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
      setError("Select an open race before submitting.");
      return;
    }

    if (!termsAccepted) {
      setError("Confirm the entry and pre-race inspection terms before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await ownerApi.registerHorseForRace({
        horse_id: selectedHorse.id,
        race_id: selectedRace.id,
        note: entry.note,
        gears: entry.gears,
        payment_method: "VNPAY",
      });

      if (result.payment_url) {
        window.location.assign(result.payment_url);
        return;
      }

      const [, raceData] = await Promise.all([
        reloadRegistrations(),
        ownerApi.getTournamentRaces(selectedTournament.id),
      ]);
      const nextRaces = (raceData.races || []).map(toOwnerRaceOption);
      setRaces(nextRaces);
      setEntry((current) => ({
        ...current,
        race: nextRaces.find((race) => race.registrationAvailable)?.id || "",
        note: "",
      }));
      setTermsAccepted(false);
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
      {(horsesError || tournamentsError || registrationsError) && (
        <section className="admin-live-state admin-live-state--warning" aria-live="polite">
          {horsesError || tournamentsError || registrationsError}
        </section>
      )}

      {!horsesError && !tournamentsError && !registrationsError && (!horses.length || !tournaments.length) && (
        <section className="admin-live-state" aria-live="polite">
          {!horses.length
            ? "Add an active horse profile before submitting a race registration."
            : "No tournaments are currently available for registration."}
        </section>
      )}

      <section className="owner-registration-hero">
        <img src={registrationHeroImage} alt="Race track grandstand for tournament registration" />
        <div className="owner-registration-hero__copy">
          <p className="owner-eyebrow">Tournament entries</p>
          <h1>Register horses for open races.</h1>
          <p>Choose a race with available capacity, confirm the entry fee, and prepare the horse for its pre-race inspection.</p>
        </div>
        <aside className="owner-registration-hero__panel">
          <span className="owner-badge owner-badge--green"><ClipboardCheck size={14} /> {approvedCount} confirmed</span>
          <strong>{selectedHorse?.name || "No horse selected"}</strong>
          <p>{selectedHorse?.healthNote || "Select a horse to submit an entry."}</p>
        </aside>
      </section>

      <section className="owner-registration-workspace">
        <form className="owner-registration-form" onSubmit={handleSubmit}>
          <div className="owner-card__header">
            <div>
              <span className="owner-kicker">New entry</span>
              <h2>Confirm race entry</h2>
            </div>
            <Send size={20} />
          </div>

          <div className="owner-form-grid owner-form-grid--single">
            <FormSelect label="Horse" value={entry.horse || "No horse available"} options={horses.map((horse) => horse.name)} onChange={(value) => updateEntry("horse", value)} />
          </div>

          <section className="owner-tournament-browser" aria-label="Available tournaments">
            <div className="owner-tournament-browser__header">
              <div>
                <span className="owner-kicker">Step 1 · Tournament</span>
                <h3>Choose where you want to enter</h3>
                <p>Start with the date and venue. Selecting a tournament opens its full race programme below.</p>
              </div>
              <label className="owner-tournament-search">
                <Search size={16} aria-hidden="true" />
                <span className="sr-only">Search tournaments</span>
                <input
                  onChange={(event) => setTournamentQuery(event.target.value)}
                  placeholder="Search tournament or venue"
                  type="search"
                  value={tournamentQuery}
                />
              </label>
            </div>
            <div className="owner-tournament-list">
              {filteredTournaments.map((tournament) => (
                <button
                  aria-pressed={selectedTournament?.id === tournament.id}
                  className={`owner-tournament-choice${selectedTournament?.id === tournament.id ? " is-selected" : ""}`}
                  key={tournament.id}
                  onClick={() => selectTournament(tournament.id)}
                  type="button"
                >
                  <span className="owner-tournament-choice__top">
                    <span className="owner-registration__id">{compactRecordCode("TOUR", tournament.id)}</span>
                    <span className={`owner-badge ${statusClass(tournament.status)}`}>{tournament.status}</span>
                  </span>
                  <strong>{tournament.name}</strong>
                  <span className="owner-tournament-choice__meta">
                    <span><CalendarDays size={14} /> {tournament.date || "Dates pending"}</span>
                    <span><MapPin size={14} /> {tournament.location || "Venue pending"}</span>
                  </span>
                  <span className="owner-tournament-choice__footer">
                    <span>{tournament.raceCount ? `${tournament.raceCount} races` : "Race programme available"}</span>
                    <span>{tournament.prizePool > 0 ? formatMoney(tournament.prizePool, tournament.prizeCurrency) : "Prize pending"}</span>
                  </span>
                </button>
              ))}
            </div>
            {!filteredTournaments.length && (
              <div className="owner-empty owner-empty--compact">No tournaments match “{tournamentQuery}”.</div>
            )}
          </section>

          <section className="owner-race-picker" aria-label="Race choices" ref={tournamentDetailRef} tabIndex="-1">
            <div className="owner-race-picker__header">
              <div>
                <span className="owner-kicker">Step 2 · Race programme</span>
                <h3>{selectedTournament?.name || "No tournament selected"}</h3>
                {selectedTournament?.description && <p>{selectedTournament.description}</p>}
              </div>
              <span className={`owner-badge ${statusClass(selectedTournament?.status)}`}>{selectedTournament?.status || "Unavailable"}</span>
            </div>

            <div className="owner-tournament-context">
              {selectedTournament?.location && <div><span>Tournament location</span><strong>{selectedTournament.location}</strong></div>}
              {selectedTournament?.date && <div><span>Tournament dates</span><strong>{selectedTournament.date}</strong></div>}
              <div><span>Tournament prize pool</span><strong>{tournamentPrizePool > 0 ? formatMoney(tournamentPrizePool, tournamentPrizeCurrency) : "Not configured"}</strong></div>
              <div><span>Selected race fee</span><strong>{registrationFeeVnd > 0 ? formatMoney(registrationFeeVnd, registrationFeeCurrency) : "No fee calculated"}</strong></div>
              <div><span>Race options</span><strong>{racesLoading ? "Loading" : races.length}</strong></div>
            </div>

            {racesLoading && <LoadingSkeleton ariaLabel="Loading tournament races" variant="inline" />}
            {!racesLoading && races.length === 0 && <div className="owner-empty owner-empty--compact">This tournament does not have a race programme yet.</div>}
            {!racesLoading && races.length > 0 && (
              <div className="owner-race-choice-list">
                {races.map((race) => (
                  <article className={`owner-race-choice${selectedRace?.id === race.id ? " is-selected" : ""}${!race.registrationAvailable ? " is-unavailable" : ""}`} key={race.id}>
                    <button
                      aria-pressed={selectedRace?.id === race.id}
                      className="owner-race-choice__select"
                      disabled={!race.registrationAvailable}
                      onClick={() => updateEntry("race", race.id)}
                      type="button"
                    >
                      <div className="owner-race-choice__main">
                        <span className="owner-registration__id">{compactRecordCode("RACE", race.id)}</span>
                        <strong>{race.name}</strong>
                        <small>{[race.round, race.date, race.clock].filter(Boolean).join(" / ") || "Schedule unavailable"}</small>
                      </div>
                      <div className="owner-race-choice__facts">
                        {race.location && <span><MapPin size={13} /> {race.location}</span>}
                        {race.distance && <span><Flag size={13} /> {race.distance}</span>}
                        {race.remainingSlots !== null && <span><UsersRound size={13} /> {race.remainingSlots} spots left</span>}
                        {race.prizePool > 0 && <span><Trophy size={13} /> {formatMoney(race.prizePool, race.prizeCurrency)}</span>}
                        {race.entryFeeVnd > 0 && <span><CreditCard size={13} /> Fee {formatMoney(race.entryFeeVnd, race.entryFeeCurrency)}</span>}
                        {race.registrationLock && <span><CalendarDays size={13} /> Locks {race.registrationLock}</span>}
                      </div>
                      <span className={`owner-badge ${statusClass(race.status)}`}>{race.registrationAvailable ? race.status : "Registration closed"}</span>
                    </button>
                    <div className="owner-race-choice__footer">
                      <span>{race.registrationAvailable ? "Select this race to continue" : race.registrationUnavailableReason || "This race is shown for programme context only."}</span>
                      <a
                        href={`/owner/tournaments/${encodeURIComponent(selectedTournament.id)}/races/${encodeURIComponent(race.id)}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        View race details <ExternalLink size={14} aria-hidden="true" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="owner-entry-gear">
            <div className="owner-entry-gear__header">
              <div>
                <span className="owner-kicker">Step 3 · Gear declaration</span>
                <h3>Choose approved gear</h3>
                <p>Select only the equipment this horse will wear in the chosen race. The declaration is sent with this entry.</p>
              </div>
              {entry.gears.length > 0 && (
                <button onClick={() => updateEntry("gears", [])} type="button">Clear all</button>
              )}
            </div>
            <GearSelector label="Available gear" value={entry.gears} onChange={(value) => updateEntry("gears", value)} />
          </section>

          <label className="owner-form-note">Owner note<textarea value={entry.note} onChange={(event) => updateEntry("note", event.target.value)} placeholder="Add readiness, preferred jockey, or scheduling note..." /></label>

          <div className="owner-registration-preview">
            <div><span>Horse status</span><strong>{selectedHorse?.status || "N/A"}</strong></div>
            <div><span>Horse code</span><strong>{selectedHorse?.registrationNumber || compactRecordCode("Horse", selectedHorse?.id)}</strong></div>
            <div><span>Selected race</span><strong>{selectedRace?.name || "No race loaded"}</strong></div>
            <div><span>Declared gear</span><strong>{entry.gears.length ? entry.gears.join(" / ") : "None"}</strong></div>
            <div><span>Payment due</span><strong>{registrationFeeVnd > 0 ? formatMoney(registrationFeeVnd, registrationFeeCurrency) : "No fee required"}</strong></div>
          </div>

          <section className="owner-registration-payment" aria-label="Registration payment">
            <div className="owner-registration-payment__header">
              <div>
                <span className="owner-kicker">Gateway payment</span>
                <h3>{registrationFeeVnd > 0 ? "Pay registration fee in VND" : "No payment required"}</h3>
              </div>
              <CreditCard size={20} />
            </div>
            <div className="owner-registration-payment__grid">
              <div>
                <span>Payment method</span>
                <strong>VNPay</strong>
              </div>
              <div>
                <span>Registration charge</span>
                <strong>{formatMoney(registrationFeeVnd, registrationFeeCurrency)}</strong>
              </div>
              <div>
                <span>After payment</span>
                <strong>Entry confirmed</strong>
              </div>
            </div>
            <p className="owner-registration-payment__note">You will continue to VNPay. The race entry is confirmed only after VNPay reports a successful payment. Spectator tokens are not used.</p>
          </section>

          <label className="owner-registration-terms">
            <input checked={termsAccepted} onChange={(event) => { setTermsAccepted(event.target.checked); setError(""); }} type="checkbox" />
            <span>I understand that the entry fee is non-refundable if the horse fails or misses the pre-race inspection, and the horse still needs an eligible primary jockey before race start.</span>
          </label>

          <div className="owner-form-actions">
            {saved && <span className="owner-success"><CheckCircle2 size={16} /> Entry confirmed. Confirmation email queued.</span>}
            {error && <span className="owner-success owner-success--error">{error}</span>}
            <button className="owner-button owner-button--primary" disabled={isSubmitting || racesLoading || !selectedHorse?.id || !selectedTournament?.id || !selectedRace?.id || !termsAccepted} type="submit">
              {isSubmitting ? "Preparing VNPay..." : registrationFeeVnd > 0 ? `Pay ${formatMoney(registrationFeeVnd, registrationFeeCurrency)} with VNPay` : "Confirm Entry"}
            </button>
          </div>
        </form>

      </section>

      <article className="owner-registration-board">
        <div className="owner-card__header">
          <div>
            <span className="owner-kicker">Entry history</span>
            <h2>Current race registrations</h2>
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
                <div className="owner-registration__payment">
                  <CreditCard size={14} />
                  <span>{item.entryFeeVnd > 0 ? `${item.paymentStatus} / ${formatMoney(item.entryFeeVnd, "VND")}` : "No fee required"}</span>
                </div>
              </div>
              <div className="owner-registration__actions">
                <span className={`owner-badge ${statusClass(item.status)}`}>{item.status}</span>
                {item.status !== "Cancelled" && item.status !== "Rejected" && (
                  <button
                    className="owner-button"
                    disabled={cancellingId === item.id}
                    onClick={() => handleCancelRegistration(item)}
                    type="button"
                  >
                    {cancellingId === item.id ? "Cancelling..." : "Cancel"}
                  </button>
                )}
              </div>
            </div>
          ))}
          {registrations.length === 0 && (
            <div className="owner-empty owner-empty--compact" role="status">
              No race registrations have been submitted yet.
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

function OwnerRaceDetail() {
  const { tournamentId, raceId } = useParams();
  const { tournaments, isLoading: tournamentsLoading, error: tournamentsError } = useOwnerTournaments();
  const [race, setRace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const tournament = tournaments.find((item) => String(item.id) === String(tournamentId));

  useEffect(() => {
    let cancelled = false;

    async function loadRace() {
      setIsLoading(true);
      setError("");

      try {
        const data = await ownerApi.getTournamentRaces(tournamentId);
        const nextRace = (data.races || [])
          .map(toOwnerRaceOption)
          .find((item) => String(item.id) === String(raceId));

        if (!cancelled) {
          setRace(nextRace || null);
          if (!nextRace) setError("Race information is unavailable.");
        }
      } catch (apiError) {
        if (!cancelled) setError(apiError.message || "Unable to load race information.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadRace();
    return () => {
      cancelled = true;
    };
  }, [raceId, tournamentId]);

  if (isLoading || tournamentsLoading) {
    return <div className="owner-race-detail-page"><LoadingSkeleton ariaLabel="Loading race details" variant="detail" /></div>;
  }

  if (error || tournamentsError || !race) {
    return (
      <div className="owner-race-detail-page">
        <Link className="owner-detail-back" to="/owner/registrations">Back to registration</Link>
        <div className="owner-empty owner-empty--error">{error || tournamentsError || "Race information is unavailable."}</div>
      </div>
    );
  }

  return (
    <div className="owner-race-detail-page">
      <Link className="owner-detail-back" to="/owner/registrations">Back to registration</Link>
      <header className="owner-race-detail-hero">
        <div>
          <p className="owner-eyebrow">{tournament?.name || "Tournament race"}</p>
          <h1>{race.name}</h1>
          <p>{[race.round, race.date, race.clock].filter(Boolean).join(" · ") || "Schedule pending"}</p>
        </div>
        <span className={`owner-badge ${statusClass(race.status)}`}>{race.status}</span>
      </header>

      <section className="owner-race-detail-facts" aria-label="Race information">
        <article><MapPin size={18} /><span>Venue</span><strong>{race.location || tournament?.location || "Pending"}</strong></article>
        <article><Flag size={18} /><span>Distance</span><strong>{race.distance || "Pending"}</strong></article>
        <article><UsersRound size={18} /><span>Capacity</span><strong>{race.remainingSlots === null ? race.maxParticipants || "Open" : `${race.remainingSlots} spots left`}</strong></article>
        <article><Trophy size={18} /><span>Race prize</span><strong>{race.prizePool > 0 ? formatMoney(race.prizePool, race.prizeCurrency) : "Pending"}</strong></article>
        <article><CreditCard size={18} /><span>Entry fee</span><strong>{race.entryFeeVnd > 0 ? formatMoney(race.entryFeeVnd, race.entryFeeCurrency) : "No fee"}</strong></article>
        <article><CalendarDays size={18} /><span>Registration lock</span><strong>{race.registrationLock || "Not configured"}</strong></article>
      </section>

      <section className="owner-race-detail-entry">
        <div>
          <span className="owner-kicker">Registration status</span>
          <h2>{race.registrationAvailable ? "This race is accepting entries" : "Registration is closed"}</h2>
          <p>{race.registrationAvailable
            ? "Return to the registration workspace to select a horse, declare gear, and confirm payment."
            : race.registrationUnavailableReason || "You can still review this race, but a new horse entry cannot be submitted."}</p>
        </div>
        {race.registrationAvailable && <Link className="owner-button owner-button--primary" to="/owner/registrations">Register a horse</Link>}
      </section>
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
  const [isEntryPickerOpen, setIsEntryPickerOpen] = useState(false);
  const [isJockeyPickerOpen, setIsJockeyPickerOpen] = useState(false);
  const [jockeyPreview, setJockeyPreview] = useState(null);
  const [jockeyPreviewPosition, setJockeyPreviewPosition] = useState(null);
  const [isJockeyInfoPinned, setIsJockeyInfoPinned] = useState(false);
  const jockeyHoverTimerRef = useRef(null);
  const [detailLoadingId, setDetailLoadingId] = useState("");
  const [assignmentSaved, setAssignmentSaved] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");
  const [pendingInvitation, setPendingInvitation] = useState(null);
  const [invitationToast, setInvitationToast] = useState(null);
  const [existingAssignments, setExistingAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [workflowDrafts, setWorkflowDrafts] = useState({});
  const [workflowActionId, setWorkflowActionId] = useState("");
  const [cancelAssignmentId, setCancelAssignmentId] = useState("");
  const [workflowMessage, setWorkflowMessage] = useState("");
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("");
  const [assignment, setAssignment] = useState({
    assignmentType: "primary",
    registrationId: "",
    message: "",
    meetingTitle: "",
    meetingTime: "",
    locationName: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    mapUrl: "",
    contactName: "",
    contactPhone: "",
  });
  const jockeys = liveJockeys
    .map((jockey, index) => ({
      ...jockey,
      status: localStatuses[jockey.id] || jockey.status,
      demoOrder: index,
    }))
    .sort((left, right) => {
      const priority = (name) => {
        const normalized = String(name || "").toLowerCase();
        if (normalized.includes("alpha")) return 0;
        if (normalized.includes("belta") || normalized.includes("beta") || normalized.includes("bravo")) return 1;
        return 2;
      };
      return priority(left.name) - priority(right.name) || left.demoOrder - right.demoOrder;
    });
  const horses = liveHorses;
  const updateStatus = (id, status) => setLocalStatuses((current) => ({ ...current, [id]: status }));
  const selectedJockey = jockeys.find((jockey) => jockey.id === selectedJockeyId) ?? jockeys[0];

  const getAssignmentsForRegistration = (registration) => existingAssignments.filter((item) => {
    const horseId = item.horse_id?._id || item.horse_id?.id || item.horse_id;
    const raceId = item.race_id?._id || item.race_id?.id || item.race_id;
    return String(horseId) === String(registration?.horseId) && String(raceId) === String(registration?.raceId);
  });
  const isActiveAssignment = (item) => activeAssignmentStatuses.includes(item.status);
  const findPrimaryAssignmentForRegistration = (registration) => getAssignmentsForRegistration(registration)
    .find((item) => (item.assignment_type || "primary") === "primary" && isActiveAssignment(item));
  const getBackupAssignmentsForRegistration = (registration) => getAssignmentsForRegistration(registration)
    .filter((item) => item.assignment_type === "backup" && isActiveAssignment(item));

  const approvedRaceEntries = liveRegistrations.filter((item) => item.status === "Approved" && item.horseId && item.raceId);
  const isBackupInvitation = assignment.assignmentType === "backup";
  const assignableRaceEntries = approvedRaceEntries.filter((item) => isBackupInvitation
    ? Boolean(findPrimaryAssignmentForRegistration(item))
    : !findPrimaryAssignmentForRegistration(item));
  const selectedEntry = assignableRaceEntries.find((item) => item.id === assignment.registrationId) ?? assignableRaceEntries[0] ?? null;
  const selectedHorse = selectedEntry
    ? horses.find((horse) => String(horse.id) === String(selectedEntry.horseId)) ?? { id: selectedEntry.horseId, name: selectedEntry.horse }
    : null;
  const selectedRace = selectedEntry
    ? { id: selectedEntry.raceId, name: selectedEntry.race, tournament: selectedEntry.tournament }
    : null;
  const existingAssignment = selectedEntry ? findPrimaryAssignmentForRegistration(selectedEntry) : null;
  const backupAssignments = selectedEntry ? getBackupAssignmentsForRegistration(selectedEntry) : [];
  const selectedJockeyDuplicate = selectedEntry && selectedJockey
    ? getAssignmentsForRegistration(selectedEntry).find((item) => {
      const jockeyId = item.jockey_id?._id || item.jockey_id?.id || item.jockey_id;
      return String(jockeyId) === String(selectedJockey.id) && isActiveAssignment(item);
    })
    : null;
  const assignedCount = existingAssignments.filter((item) => item.status === "accepted").length;
  const pendingCount = existingAssignments.filter((item) => ["meeting_invited", "meeting_accepted", "terms_agreed", "contract_uploaded"].includes(item.status)).length;
  const topWinRate = Math.max(0, ...jockeys.map((jockey) => Math.round((jockey.wins / Math.max(jockey.races, 1)) * 100)));
  const blockedByNoEntry = !assignmentsLoading && !selectedEntry;
  const invitationLocked = blockedByNoEntry || (!isBackupInvitation && Boolean(existingAssignment)) || (isBackupInvitation && !existingAssignment) || Boolean(selectedJockeyDuplicate);
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

  useEffect(() => () => clearTimeout(jockeyHoverTimerRef.current), []);

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

  const selectRaceEntry = (entryId) => {
    updateAssignment("registrationId", entryId);
    setIsEntryPickerOpen(false);
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

  const sendInvitation = async ({ payload, summary }) => {
    setPendingInvitation(null);
    setIsAssigning(true);
    setAssignmentError("");

    try {
      const data = await ownerApi.createJockeyAssignment(payload);
      if (data.assignment) {
        setExistingAssignments((current) => [{
          ...data.assignment,
          assignment_type: data.assignment.assignment_type || summary.assignmentType,
          horse_id: summary.horse,
          race_id: summary.race,
          jockey_id: summary.jockey,
        }, ...current]);
      }
      updateStatus(summary.jockeyId, "Pending");
      setAssignmentSaved(true);
      setWorkflowMessage("Invitation sent. Contract steps unlock after the jockey accepts the offline appointment.");
      setInvitationToast({
        ...summary,
        invitationId: data.assignment?._id ? compactRecordCode("INV", data.assignment._id) : "Pending assignment ID",
      });
    } catch (apiError) {
      setAssignmentError(apiError.status === 409
        ? `This horse already has an active primary jockey assignment for ${summary.race.name}. Choose backup mode or another race entry.`
        : apiError.message || "Unable to create jockey assignment.");
    } finally {
      setIsAssigning(false);
    }
  };

  const cancelJockeyInvitation = async (item) => {
    const id = item._id;
    setWorkflowActionId(id);
    setCancelAssignmentId("");
    setAssignmentError("");
    setWorkflowMessage("");

    try {
      const data = await ownerApi.cancelJockeyAssignment(id);
      replaceAssignment(data.assignment);
      setWorkflowMessage("Jockey invitation cancelled. The race entry is available for another invitation.");
    } catch (apiError) {
      setAssignmentError(apiError.message || "Unable to cancel this jockey invitation.");
    } finally {
      setWorkflowActionId("");
    }
  };

  const setJockeyPreviewAnchor = (event) => {
    if (!event) return;
    const cardWidth = 540;
    const cardHeight = 360;
    const offset = 16;
    const placeOnRight = event.clientX + offset + cardWidth <= window.innerWidth - 12;
    const placeBelow = event.clientY + offset + cardHeight <= window.innerHeight - 12;

    setJockeyPreviewPosition({
      top: placeBelow ? event.clientY + offset : Math.max(12, event.clientY - cardHeight - offset),
      left: placeOnRight ? event.clientX + offset : Math.max(12, event.clientX - cardWidth - offset),
    });
  };

  const openJockeyInfo = async (jockey, event) => {
    setJockeyPreview(jockey);
    setJockeyPreviewAnchor(event);
    setIsJockeyInfoPinned(false);
    await selectJockey(jockey);
  };

  const startJockeyHoverPreview = (jockey, event) => {
    clearTimeout(jockeyHoverTimerRef.current);
    setJockeyPreviewAnchor(event);
    jockeyHoverTimerRef.current = setTimeout(() => {
      setJockeyPreview(jockey);
      setIsJockeyInfoPinned(false);
    }, 2000);
  };

  const endJockeyHoverPreview = () => {
    clearTimeout(jockeyHoverTimerRef.current);
    setJockeyPreview(null);
    setJockeyPreviewPosition(null);
    setIsJockeyInfoPinned(false);
  };

  const moveJockeyPreview = (jockey, event) => {
    if (jockeyPreview?.id === jockey.id) setJockeyPreviewAnchor(event);
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
      setAssignmentError(isBackupInvitation
        ? "No approved race entry with a primary jockey is available for a backup invitation."
        : "No approved race registration without a primary jockey assignment is available.");
      return;
    }

    if (!selectedHorse?.id || !selectedRace?.id || !selectedJockey?.id) {
      setAssignmentError("Select an approved race entry and jockey before submitting.");
      return;
    }

    if (!assignment.meetingTitle.trim()) {
      setAssignmentError("Appointment title is required.");
      return;
    }

    if (!assignment.meetingTime) {
      setAssignmentError("Appointment time is required.");
      return;
    }

    if (new Date(assignment.meetingTime) <= new Date()) {
      setAssignmentError("Appointment time must be in the future.");
      return;
    }

    if (!assignment.locationName.trim()) {
      setAssignmentError("Appointment location name is required.");
      return;
    }

    if (!assignment.address.trim()) {
      setAssignmentError("Appointment address is required.");
      return;
    }

    if (assignment.mapUrl.trim() && !/^https?:\/\//i.test(assignment.mapUrl.trim())) {
      setAssignmentError("Map URL must start with http:// or https://.");
      return;
    }

    if (!isBackupInvitation && existingAssignment) {
      setAssignmentError(`This approved race entry already has a ${existingAssignment.status || "current"} jockey assignment.`);
      return;
    }

    if (isBackupInvitation && !existingAssignment) {
      setAssignmentError("Invite and complete the primary jockey flow before adding a backup jockey.");
      return;
    }

    if (selectedJockeyDuplicate) {
      setAssignmentError(`${selectedJockey.name} already has an active assignment for this horse and race.`);
      return;
    }

    const payload = {
        horse_id: selectedHorse.id,
        race_id: selectedRace.id,
        jockey_id: selectedJockey.id,
        assignment_type: assignment.assignmentType,
        backup_priority: isBackupInvitation ? backupAssignments.length + 1 : undefined,
        invitation_message: assignment.message || (isBackupInvitation
          ? `Please stand by as backup jockey for ${selectedHorse.name} in ${selectedRace.name}.`
          : `Please ride ${selectedHorse.name} in ${selectedRace.name}.`),
        meeting: {
          title: assignment.meetingTitle,
          meeting_time: new Date(assignment.meetingTime).toISOString(),
          location_name: assignment.locationName,
          address: assignment.address,
          city: assignment.city,
          district: assignment.district,
          ward: assignment.ward,
          map_url: assignment.mapUrl,
          contact_name: assignment.contactName,
          contact_phone: assignment.contactPhone,
          note: assignment.message,
        },
      };

    setPendingInvitation({
      payload,
      summary: {
        assignmentType: assignment.assignmentType,
        horse: selectedHorse,
        race: selectedRace,
        jockey: selectedJockey.raw || selectedJockey,
        jockeyId: selectedJockey.id,
        jockeyName: selectedJockeyDetail?.name || selectedJockey.name,
        meetingTitle: assignment.meetingTitle.trim(),
        meetingTime: assignment.meetingTime,
        locationName: assignment.locationName.trim(),
        address: [assignment.address, assignment.ward, assignment.district, assignment.city].filter(Boolean).join(", "),
        message: payload.invitation_message,
      },
    });
  };

  const promoteBackupAssignment = async (item) => {
    const id = item._id;
    const jockeyName = assignmentPartyName(item.jockey_id, "Jockey");
    const horseName = assignmentPartyName(item.horse_id, "Horse");

    setWorkflowActionId(id);
    setAssignmentError("");
    setWorkflowMessage("");
    try {
      const data = await ownerApi.promoteJockeyAssignment(id, `Promote ${jockeyName} from backup to primary for ${horseName}.`);
      const previousPrimaryId = data.previous_primary_assignment_id;

      if (previousPrimaryId) {
        setExistingAssignments((current) => current.map((currentItem) => String(currentItem._id) === String(previousPrimaryId)
          ? { ...currentItem, status: "replaced" }
          : currentItem));
      }

      replaceAssignment(data.assignment);
      setWorkflowMessage("Backup jockey promoted. Upload a new primary contract for final confirmation.");
    } catch (apiError) {
      setAssignmentError(apiError.message || "Unable to promote this backup jockey.");
    } finally {
      setWorkflowActionId("");
    }
  };

  if (isLoading || horsesLoading || registrationsLoading || assignmentsLoading) {
    return <div className="owner-jockey-page"><LoadingSkeleton ariaLabel="Loading jockey assignment workspace" rows={6} variant="cards" /></div>;
  }

  return (
    <div className="owner-jockey-page">
      {pendingInvitation && (
        <section className="owner-invitation-toast owner-invitation-toast--confirm" role="dialog" aria-modal="false" aria-labelledby="owner-invitation-confirm-title">
          <div className="owner-invitation-toast__header">
            <div className="owner-invitation-toast__icon"><Send size={18} /></div>
            <div>
              <span className="owner-kicker">Review before sending</span>
              <h2 id="owner-invitation-confirm-title">Send jockey invitation?</h2>
            </div>
            <button className="owner-invitation-toast__close" type="button" onClick={() => setPendingInvitation(null)} aria-label="Cancel invitation confirmation">
              <X size={18} />
            </button>
          </div>
          <div className="owner-invitation-toast__summary">
            <div><span>Jockey</span><strong>{pendingInvitation.summary.jockeyName}</strong></div>
            <div><span>Horse / race</span><strong>{pendingInvitation.summary.horse.name} / {pendingInvitation.summary.race.name}</strong></div>
            <div><span>Appointment</span><strong>{pendingInvitation.summary.meetingTitle}</strong><small>{formatInvitationDate(pendingInvitation.summary.meetingTime)}</small></div>
            <div><span>Location</span><strong>{pendingInvitation.summary.locationName}</strong><small>{pendingInvitation.summary.address}</small></div>
          </div>
          <p className="owner-invitation-toast__note">The jockey will receive this appointment invitation and can accept or reject it.</p>
          <div className="owner-invitation-toast__actions">
            <button className="owner-button" type="button" onClick={() => setPendingInvitation(null)}>Go back</button>
            <button className="owner-button owner-button--primary" type="button" onClick={() => sendInvitation(pendingInvitation)}>
              <Send size={16} /> Send invitation
            </button>
          </div>
        </section>
      )}

      {invitationToast && (
        <section className="owner-invitation-toast owner-invitation-toast--success" role="status" aria-live="polite" aria-labelledby="owner-invitation-success-title">
          <div className="owner-invitation-toast__header">
            <div className="owner-invitation-toast__icon"><CheckCircle2 size={18} /></div>
            <div>
              <span className="owner-kicker">Invitation sent</span>
              <h2 id="owner-invitation-success-title">{invitationToast.jockeyName} has been invited.</h2>
            </div>
            <button className="owner-invitation-toast__close" type="button" onClick={() => setInvitationToast(null)} aria-label="Dismiss invitation confirmation">
              <X size={18} />
            </button>
          </div>
          <div className="owner-invitation-toast__summary">
            <div><span>Invitation</span><strong>{invitationToast.invitationId}</strong></div>
            <div><span>Assignment</span><strong>{invitationToast.assignmentType === "backup" ? "Backup jockey" : "Primary jockey"}</strong></div>
            <div><span>Horse / race</span><strong>{invitationToast.horse.name} / {invitationToast.race.name}</strong></div>
            <div><span>Appointment</span><strong>{formatInvitationDate(invitationToast.meetingTime)}</strong><small>{invitationToast.locationName} · {invitationToast.address}</small></div>
          </div>
          <p className="owner-invitation-toast__note">Status: awaiting jockey response. Contract steps unlock after the appointment is accepted.</p>
        </section>
      )}

      {(error || horsesError || registrationsError) && (
        <section className="admin-live-state admin-live-state--warning" aria-live="polite">
          {error || horsesError || registrationsError}
        </section>
      )}

      {!error && !horsesError && !registrationsError && (!jockeys.length || !horses.length || !liveRegistrations.length) && (
        <section className="admin-live-state" aria-live="polite">
          {!jockeys.length
            ? "No active jockey profiles are currently available."
            : !horses.length
              ? "Add an active horse profile before creating a jockey invitation."
              : "No race registrations are available. Submit an entry and wait for approval before inviting a jockey."}
        </section>
      )}

      <section className="owner-jockey-hero">
        <img src={jockeyHeroImage} alt="Jockey preparing for a horse racing assignment" />
        <div className="owner-jockey-hero__copy">
          <p className="owner-eyebrow">Jockey assignments</p>
          <h1>Invite riders after race approval.</h1>
          <p>Start with an offline appointment, then record terms and send the contract after the jockey accepts.</p>
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
          { label: "Ready entries", value: assignableRaceEntries.length, note: isBackupInvitation ? "Ready for backup" : "Approved, no primary", icon: ClipboardCheck },
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
                        <small>{raceName} / {(item.assignment_type || "primary") === "backup" ? `Backup${item.backup_priority ? ` #${item.backup_priority}` : ""}` : "Primary"}</small>
                      </span>
                      <span className={`owner-badge ${statusClass(assignmentStatusLabel(item.status))}`}>{assignmentStatusLabel(item.status)}</span>
                    </button>
                  );
                })}

                {!existingAssignments.length && (
                  <div className="owner-assignment-empty" role="status">
                    <ClipboardCheck size={18} />
                  <div><strong>No jockey negotiations yet.</strong><span>Create an offline appointment invitation below to start the assignment flow.</span></div>
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
                const isBackupAssignment = item.assignment_type === "backup";

                return (
                  <article className="owner-assignment-workflow__detail">
                    <div className="owner-assignment-workflow__summary">
                      <div>
                        <span className="owner-kicker">{horseName} / {raceName} / {isBackupAssignment ? `Backup${item.backup_priority ? ` #${item.backup_priority}` : ""}` : "Primary"}</span>
                        <h3>{jockeyName}</h3>
                      </div>
                      <span className={`owner-badge ${statusClass(assignmentStatusLabel(status))}`}>{assignmentStatusLabel(status)}</span>
                    </div>

                    <div className="owner-assignment-steps" aria-label={`Assignment status: ${assignmentStatusLabel(status)}`}>
                      <span className={status !== "meeting_invited" ? "is-complete" : "is-current"}>Appointment invite</span>
                      <span className={["meeting_accepted", "terms_agreed", "contract_uploaded", "accepted"].includes(status) ? "is-complete" : ""}>Appointment accepted</span>
                      <span className={["terms_agreed", "contract_uploaded", "accepted"].includes(status) ? "is-complete" : status === "meeting_accepted" ? "is-current" : ""}>Terms</span>
                      <span className={["contract_uploaded", "accepted"].includes(status) ? "is-complete" : status === "terms_agreed" ? "is-current" : ""}>Contract</span>
                      <span className={status === "accepted" ? "is-complete" : status === "contract_uploaded" ? "is-current" : ""}>Accepted</span>
                    </div>

                    {status === "meeting_invited" && (
                      <div className="owner-assignment-workflow__invite-actions">
                        <p className="owner-assignment-workflow__note">Waiting for the jockey to accept or reject the offline appointment invitation.</p>
                        {cancelAssignmentId === id ? (
                          <div className="owner-assignment-workflow__cancel-confirm" role="group" aria-label="Confirm invitation cancellation">
                            <span>Cancel this invitation?</span>
                            <button className="owner-button" disabled={isBusy} onClick={() => setCancelAssignmentId("")} type="button">Keep invitation</button>
                            <button className="owner-button owner-button--danger" disabled={isBusy} onClick={() => cancelJockeyInvitation(item)} type="button">
                              {isBusy ? "Cancelling..." : "Cancel invitation"}
                            </button>
                          </div>
                        ) : (
                          <button className="owner-button owner-button--danger" disabled={isBusy} onClick={() => setCancelAssignmentId(id)} type="button">
                            Cancel invitation
                          </button>
                        )}
                      </div>
                    )}
                    {status === "meeting_accepted" && (
                      <div className="owner-assignment-workflow__form">
                        <label className="owner-field owner-field--full">
                          <span>Agreed terms <em>Required</em></span>
                          <textarea maxLength={5000} value={draft.agreedTerms || ""} onChange={(event) => updateWorkflowDraft(id, "agreedTerms", event.target.value)} placeholder="Record fee, race scope, preparation, and responsibilities agreed during the appointment." />
                        </label>
                        <label className="owner-field owner-field--full">
                          <span>Appointment note <small>Optional</small></span>
                          <textarea maxLength={2000} value={draft.meetingNote || ""} onChange={(event) => updateWorkflowDraft(id, "meetingNote", event.target.value)} placeholder="Add a short appointment summary." />
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
                    {status === "cancelled" && <p className="owner-assignment-workflow__note">This jockey invitation was cancelled and can no longer be accepted.</p>}
                    {status === "accepted" && (
                      <div className="owner-assignment-workflow__form">
                        <p className="owner-assignment-workflow__note is-success"><CheckCircle2 size={16} /> {isBackupAssignment ? "The jockey accepted this standby assignment." : "The jockey confirmed the contract and accepted this assignment."}</p>
                        {isBackupAssignment && (
                          <button className="owner-button owner-button--primary" disabled={isBusy} onClick={() => promoteBackupAssignment(item)} type="button">
                            <RotateCcw size={16} /> {isBusy ? "Promoting..." : "Promote to primary"}
                          </button>
                        )}
                      </div>
                    )}
                    {status === "replaced" && <p className="owner-assignment-workflow__note">This primary assignment was replaced by a promoted backup jockey.</p>}
                    {status === "meeting_rejected" && <p className="owner-assignment-workflow__note">The jockey declined the offline appointment invitation.</p>}
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

        <div className="owner-segmented owner-segmented--schedule" aria-label="Jockey assignment type">
          {[
            { value: "primary", label: "Primary" },
            { value: "backup", label: "Backup" },
          ].map((item) => (
            <button
              className={assignment.assignmentType === item.value ? "owner-segmented__active" : ""}
              key={item.value}
              onClick={() => {
                setAssignment((current) => ({ ...current, assignmentType: item.value, registrationId: "" }));
                setIsEntryPickerOpen(false);
              }}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <section className="owner-approved-entry-panel">
          <div className="owner-approved-entry-panel__header">
            <div>
              <span className="owner-kicker">Approved race entries</span>
              <h3>Choose the race slot before selecting a jockey</h3>
            </div>
            <span className="owner-badge owner-badge--green">{assignableRaceEntries.length} {isBackupInvitation ? "backup-ready" : "ready"}</span>
          </div>

          {assignableRaceEntries.length ? (
            <div className="owner-entry-picker">
              <button
                aria-expanded={isEntryPickerOpen}
                className={`owner-entry-picker__trigger ${isEntryPickerOpen ? "is-open" : ""}`}
                onClick={() => setIsEntryPickerOpen((current) => !current)}
                type="button"
              >
                <span className="owner-entry-picker__trigger-copy">
                  <span>Selected race entry</span>
                  <strong>{selectedEntry?.horse || "Choose a horse"}</strong>
                  <small>{selectedEntry ? `${selectedEntry.race} / ${selectedEntry.tournament}` : "Select an approved entry"}</small>
                </span>
                <span className="owner-entry-picker__trigger-meta">
                  <span>{selectedEntry ? "Change" : "Choose"}</span>
                  <ChevronDown size={18} />
                </span>
              </button>

              {isEntryPickerOpen && (
                <div className="owner-approved-entry-list" role="listbox" aria-label={isBackupInvitation ? "Approved race entries with primary jockey assignments" : "Approved race entries without primary jockey assignments"}>
                  {assignableRaceEntries.map((entry) => (
                    <button
                      aria-selected={selectedEntry?.id === entry.id}
                      className={`owner-approved-entry ${selectedEntry?.id === entry.id ? "is-selected" : ""}`}
                      key={entry.id}
                      onClick={() => selectRaceEntry(entry.id)}
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
              )}
            </div>
          ) : (
            <div className="owner-assignment-empty" role="status">
              <ClipboardCheck size={18} />
              <div>
                <strong>No race entry is ready for a jockey invitation.</strong>
                <span>{isBackupInvitation ? "A backup invitation needs an approved race registration with an active primary jockey first." : "Admin must approve the horse race registration, and the entry must not already have a primary jockey assignment."}</span>
              </div>
            </div>
          )}
        </section>

        <section className="owner-jockey-picker" aria-label="Choose jockey" onMouseLeave={endJockeyHoverPreview}>
          <div className="owner-jockey-picker__header">
            <div>
              <span className="owner-kicker">Jockey selection</span>
              <h3>Choose a jockey for this race entry</h3>
            </div>
            <span className="owner-badge owner-badge--green">{jockeys.length} available</span>
          </div>

          {jockeys.length ? (
            <div className="owner-entry-picker">
              <button
                aria-expanded={isJockeyPickerOpen}
                className={`owner-entry-picker__trigger ${isJockeyPickerOpen ? "is-open" : ""}`}
                onClick={() => setIsJockeyPickerOpen((current) => !current)}
                type="button"
              >
                <span className="owner-entry-picker__trigger-copy">
                  <span>Selected jockey</span>
                  <strong>{selectedJockey?.name || "Choose a jockey"}</strong>
                  <small>{selectedJockey?.licenseNumber || "Select an available jockey"}</small>
                </span>
                <span className="owner-entry-picker__trigger-meta">
                  <span>{selectedJockey ? "Change" : "Choose"}</span>
                  <ChevronDown size={18} />
                </span>
              </button>

              {isJockeyPickerOpen && (
                <div className="owner-jockey-picker__list" role="listbox" aria-label="Available jockeys">
                  {jockeys.map((jockey) => (
                    <div
                      className={`owner-jockey-picker__option ${selectedJockey?.id === jockey.id ? "is-selected" : ""}`}
                      key={jockey.id}
                      onMouseEnter={(event) => startJockeyHoverPreview(jockey, event)}
                      onMouseMove={(event) => moveJockeyPreview(jockey, event)}
                      role="option"
                      aria-selected={selectedJockey?.id === jockey.id}
                    >
                      <button
                        className="owner-jockey-picker__select"
                        disabled={detailLoadingId === jockey.id}
                        onClick={() => {
                          selectJockey(jockey);
                          setIsJockeyPickerOpen(false);
                          setJockeyPreview(null);
                          setIsJockeyInfoPinned(false);
                        }}
                        type="button"
                      >
                        <span className="owner-jockey-picker__avatar">
                          <img src={jockeyImages[imageIndexForId(jockey.id, jockeyImages.length)]} alt={`${jockey.name} profile`} />
                        </span>
                        <span className="owner-jockey-picker__copy">
                          <strong>{jockey.name}</strong>
                          <small>{jockey.licenseNumber || "License not set"} · {jockey.assignedHorse || "No current pairing"}</small>
                        </span>
                        {selectedJockey?.id === jockey.id && <Check size={17} />}
                      </button>
                      <button
                        className="owner-jockey-picker__info"
                        onClick={(event) => openJockeyInfo(jockey, event)}
                        type="button"
                      >
                        Info
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="owner-assignment-empty" role="status">
              <UserRound size={18} />
              <div><strong>No active jockey profiles are available for invitation.</strong></div>
            </div>
          )}

          {jockeyPreview && jockeyPreviewPosition && (
            <aside
              className="owner-jockey-card owner-jockey-card--preview"
              role="status"
              style={{ top: jockeyPreviewPosition.top, left: jockeyPreviewPosition.left }}
            >
              <div className="owner-jockey-card__media">
                <img src={jockeyImages[imageIndexForId(jockeyPreview.id, jockeyImages.length)]} alt={`${jockeyPreview.name} jockey profile`} />
                <span className={`owner-badge ${statusClass(jockeyPreview.status)}`}>{jockeyPreview.status}</span>
              </div>
              <div className="owner-jockey-card__body">
                <div className="owner-jockey-card__header">
                  <span className="owner-kicker">{compactRecordCode("License", jockeyPreview.licenseNumber || jockeyPreview.id)}</span>
                  <h2>{jockeyPreview.name}</h2>
                </div>
                <div className="owner-jockey-pairing owner-jockey-pairing--compact">
                  <UserRound size={18} />
                  <div>
                    <span>Current pairing</span>
                    <strong>{jockeyPreview.assignedHorse || "Unassigned"}</strong>
                  </div>
                </div>
                <div className="owner-jockey-metrics">
                  <div><span>Wins</span><strong>{jockeyPreview.wins ?? 0}</strong></div>
                  <div><span>Race starts</span><strong>{jockeyPreview.races ?? 0}</strong></div>
                  <div><span>License</span><strong>{jockeyPreview.licenseNumber || "Not set"}</strong></div>
                </div>
              </div>
            </aside>
          )}
        </section>

        <div className="owner-invitation-context" aria-label="Invitation selection">
          <div><span>Horse</span><strong>{selectedHorse?.name || "Not selected"}</strong></div>
          <div><span>Race</span><strong>{selectedRace?.name || "Not selected"}</strong></div>
          <div><span>Jockey</span><strong>{selectedJockeyDetail?.name || selectedJockey?.name || "Not selected"}</strong></div>
          <div><span>Role</span><strong>{isBackupInvitation ? `Backup #${backupAssignments.length + 1}` : "Primary"}</strong></div>
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
            <legend><MapPin size={18} /><span>Offline appointment</span></legend>
            <div className="owner-invitation-section__grid">
              <label className="owner-field">
                <span>Appointment title <em>Required</em></span>
                <input required value={assignment.meetingTitle} onChange={(event) => updateAssignment("meetingTitle", event.target.value)} placeholder="Contract discussion at the stable office" />
              </label>
              <label className="owner-field">
                <span>Appointment time <em>Required</em></span>
                <input required type="datetime-local" value={assignment.meetingTime} onChange={(event) => updateAssignment("meetingTime", event.target.value)} />
              </label>
              <label className="owner-field">
                <span>Location name <em>Required</em></span>
                <input required value={assignment.locationName} onChange={(event) => updateAssignment("locationName", event.target.value)} placeholder="Saigon Racing Club Office" />
              </label>
              <label className="owner-field owner-field--full">
                <span>Address <em>Required</em></span>
                <input required value={assignment.address} onChange={(event) => updateAssignment("address", event.target.value)} placeholder="123 Nguyen Hue Street" />
              </label>
              <label className="owner-field">
                <span>City <small>Optional</small></span>
                <input value={assignment.city} onChange={(event) => updateAssignment("city", event.target.value)} placeholder="Ho Chi Minh City" />
              </label>
              <label className="owner-field">
                <span>District <small>Optional</small></span>
                <input value={assignment.district} onChange={(event) => updateAssignment("district", event.target.value)} placeholder="District 1" />
              </label>
              <label className="owner-field">
                <span>Ward <small>Optional</small></span>
                <input value={assignment.ward} onChange={(event) => updateAssignment("ward", event.target.value)} placeholder="Ben Nghe" />
              </label>
              <label className="owner-field">
                <span>Map URL <small>Optional</small></span>
                <input type="url" value={assignment.mapUrl} onChange={(event) => updateAssignment("mapUrl", event.target.value)} placeholder="https://maps.google.com/..." />
              </label>
              <label className="owner-field">
                <span>Contact name <small>Optional</small></span>
                <input value={assignment.contactName} onChange={(event) => updateAssignment("contactName", event.target.value)} placeholder="Nguyen Van A" />
              </label>
              <label className="owner-field">
                <span>Contact phone <small>Optional</small></span>
                <input value={assignment.contactPhone} onChange={(event) => updateAssignment("contactPhone", event.target.value)} placeholder="+84901234567" />
              </label>
            </div>
          </fieldset>

        </div>

        {blockedByNoEntry && (
          <div className="owner-assignment-conflict" role="status">
            <ClipboardCheck size={16} />
            <span><strong>No eligible race entry.</strong> {isBackupInvitation ? "Choose a race entry that already has an active primary jockey before inviting a backup." : "A horse must have an approved race registration and no existing primary jockey assignment before you can invite a jockey."}</span>
          </div>
        )}

        {!isBackupInvitation && existingAssignment && (
          <div className="owner-assignment-conflict" role="status">
            <ShieldCheck size={16} />
            <span><strong>Primary assignment already exists.</strong> {selectedHorse?.name} already has a {existingAssignment.status || "current"} primary jockey assignment for {selectedRace?.name}.</span>
          </div>
        )}

        {selectedJockeyDuplicate && (
          <div className="owner-assignment-conflict" role="status">
            <ShieldCheck size={16} />
            <span><strong>Jockey already selected.</strong> {selectedJockey?.name} already has an active assignment for this horse and race.</span>
          </div>
        )}

        <div className="owner-form-actions owner-invitation-actions">
          <div className="owner-invitation-feedback" aria-live="polite">
            {assignmentSaved && <span className="owner-success"><CheckCircle2 size={16} /> Invitation sent.</span>}
            {assignmentError && <span className="owner-success owner-success--error">{assignmentError}</span>}
            {!assignmentSaved && !assignmentError && <span>Send the offline appointment invitation first. Terms and contract unlock after the jockey accepts.</span>}
          </div>
          <button className="owner-button owner-button--primary owner-invitation-submit" disabled={isAssigning || assignmentsLoading || invitationLocked || detailLoadingId === selectedJockeyId} type="submit">
            <Send size={17} />
            {isAssigning ? "Sending invitation..." : `Invite ${selectedJockey?.name || "jockey"}`}
          </button>
        </div>
      </form>

    </div>
  );
}

function OwnerSchedule() {
  const [filter, setFilter] = useState("All");
  const { registrations, isLoading, error } = useOwnerRegistrations();
  const { assignments, isLoading: assignmentsLoading, error: assignmentsError } = useOwnerJockeyAssignments();
  const ownerSchedule = registrations.map((registration) => toOwnerScheduleEntry(
    registration,
    findAcceptedPrimaryAssignment(assignments, registration)
  ));
  const visibleRaces = ownerSchedule.filter((race) => filter === "All" || race.status === filter);
  const confirmedCount = ownerSchedule.filter((race) => race.status === "Confirmed").length;
  const pendingCount = ownerSchedule.filter((race) => race.status === "Pending").length;
  const closedCount = ownerSchedule.filter((race) => race.status === "Closed").length;
  const featuredRace = visibleRaces[0] ?? ownerSchedule[0];

  if (isLoading || assignmentsLoading) {
    return <div className="owner-schedule-page"><LoadingSkeleton ariaLabel="Loading owner schedule" rows={5} variant="cards" /></div>;
  }

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
          {featuredRace ? (
            <>
              <span className={`owner-badge ${statusClass(featuredRace.status)}`}>{featuredRace.status}</span>
              <strong>{featuredRace.race}</strong>
              <p>{featuredRace.time} / {featuredRace.venue}</p>
            </>
          ) : (
            <>
              <span className="owner-badge">No entries</span>
              <strong>Schedule unavailable</strong>
              <p>Submit a race registration to create an owner schedule entry.</p>
            </>
          )}
        </aside>
      </section>

      <section className="owner-schedule-stats" aria-label="Schedule summary">
        {[
          { label: "All slots", value: ownerSchedule.length, note: "Race windows", icon: CalendarDays },
          { label: "Confirmed", value: confirmedCount, note: "Ready for race day", icon: BadgeCheck },
          { label: "Pending", value: pendingCount, note: "Waiting on admin", icon: ClipboardCheck },
          { label: "Closed", value: closedCount, note: "Rejected or cancelled", icon: Flag },
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
            {["All", "Confirmed", "Pending", "Closed"].map((item) => (
              <button className={filter === item ? "owner-segmented__active" : ""} key={item} type="button" onClick={() => setFilter(item)}>{item}</button>
            ))}
          </div>
        </div>

        <div className="owner-schedule-list">
          {visibleRaces.map((race) => {
            return (
              <div className="owner-schedule-slot" key={race.id}>
                <div className="owner-schedule-slot__time">
                  <span>{race.date}</span>
                  <strong>{race.clock}</strong>
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
          {(error || assignmentsError) && <div className="owner-empty owner-empty--compact owner-empty--error">{error || assignmentsError}</div>}
          {!error && visibleRaces.length === 0 && <div className="owner-empty owner-empty--compact">No race slots match this filter.</div>}
        </div>
      </article>
    </div>
  );
}

function OwnerResults() {
  const { awards, isLoading, error } = useOwnerPrizeAwards();
  const totalOwnerAmount = awards.reduce((total, award) => total + Number(award.ownerAmount || 0), 0);
  const paidOwnerAmount = awards
    .filter((award) => award.awardStatus === "Paid")
    .reduce((total, award) => total + Number(award.ownerAmount || 0), 0);
  const podiumCount = awards.filter((award) => Number(award.position) > 0 && Number(award.position) <= 3).length;
  const penaltyCount = awards.filter((award) => award.penaltyCount > 0 || award.isDisqualified).length;
  const featuredAward = awards[0];

  if (isLoading) {
    return <div className="owner-results-page"><LoadingSkeleton ariaLabel="Loading owner results and prizes" rows={6} variant="cards" /></div>;
  }

  return (
    <div className="owner-results-page">
      {error && <section className="admin-live-state admin-live-state--warning" aria-live="polite">{error}</section>}

      <section className="owner-results-hero">
        <img src={resultsHeroImage} alt="Race trophy display for owner results and prizes" />
        <div className="owner-results-hero__copy">
          <p className="owner-eyebrow">Results and prizes</p>
          <h1>Stable results and prize ledger.</h1>
          <p>Published race finishes, owner prize share, and penalty impact are shown from the official race result.</p>
        </div>
        <aside className="owner-results-hero__panel">
          <span className="owner-badge owner-badge--green"><Trophy size={14} /> Owner share</span>
          <strong>{formatMoney(totalOwnerAmount, featuredAward?.currency || "VND")}</strong>
          <p>{paidOwnerAmount > 0 ? `${formatMoney(paidOwnerAmount, featuredAward?.currency || "VND")} has been marked paid.` : "Awards appear after admin publishes race results."}</p>
        </aside>
      </section>

      <section className="owner-results-stats" aria-label="Results summary">
        {[
          { label: "Owner earnings", value: formatMoney(totalOwnerAmount, featuredAward?.currency || "VND"), note: "Owner share only", icon: Trophy },
          { label: "Prize awards", value: awards.length, note: "Published result awards", icon: Award },
          { label: "Penalty impact", value: penaltyCount, note: "Confirmed race penalties", icon: Flag },
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
            <span className="owner-kicker">Latest published award</span>
            <h2>{featuredAward ? `${featuredAward.horseName} finished ${featuredAward.finalPositionLabel}.` : "No published award yet."}</h2>
            <p>{featuredAward ? `${featuredAward.raceName} uses the final official result after penalties are applied.` : "When a race is published, the owner's result and prize share will be listed here."}</p>
          </div>
          <div className="owner-results-feature__facts">
            <div><span>Horse</span><strong>{featuredAward?.horseName || "Unavailable"}</strong></div>
            <div><span>Race</span><strong>{featuredAward?.raceName || "Unavailable"}</strong></div>
            <div><span>Penalty</span><strong>{featuredAward?.penaltySummary || "Unavailable"}</strong></div>
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
            {awards.length === 0 && (
              <div className="owner-empty" role="status">
                No published prize awards yet. Awards appear after admin publishes race results.
              </div>
            )}
            {awards.map((award) => (
              <div className="owner-results-row" key={award.id}>
                <div className="owner-results-row__date">{award.finalPositionLabel}</div>
                <div className="owner-results-row__main">
                  <h3>{award.horseName}</h3>
                  <small>{award.raceName} / {award.tournamentName}</small>
                  <small>{award.roundName} / {award.date} / {award.jockeyName}</small>
                </div>
                <div className="owner-results-row__metrics">
                  <div><span>Raw</span><strong>{award.rawPositionLabel} / {award.rawTime}</strong></div>
                  <div><span>Final</span><strong>{award.finalPositionLabel} / {award.finalTime}</strong></div>
                  <div><span>Penalty</span><strong>{award.penaltySummary}</strong></div>
                  <div><span>Owner prize</span><strong>{formatMoney(award.ownerAmount, award.currency)}</strong></div>
                  <div><span>Gross prize</span><strong>{formatMoney(award.grossAmount, award.currency)}</strong></div>
                  <div><span>Jockey share</span><strong>{formatMoney(award.jockeyAmount, award.currency)}</strong></div>
                </div>
                <span className={`owner-badge ${statusClass(award.isDisqualified ? "Disqualified" : award.awardStatus)}`}>
                  {award.isDisqualified ? "Disqualified" : award.awardStatus}
                </span>
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
  const { awards } = useOwnerPrizeAwards();
  const [form, setForm] = useState({ stable: "", location: "", licenseNumber: "", status: "Ready" });
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    if (!profile) return;

    setForm({
      stable: profile.stable,
      location: profile.location,
      licenseNumber: profile.licenseNumber,
      status: profile.status,
    });
  }, [profile]);

  useEffect(() => {
    setAvatarPreview(profile?.avatarUrl || "");
  }, [profile?.avatarUrl]);

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
  const ownerPrizeTotal = awards.reduce((total, award) => total + Number(award.ownerAmount || 0), 0);
  const ownerPrizeCurrency = awards[0]?.currency || "VND";

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

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Avatar must be 5 MB or smaller.");
      return;
    }

    setAvatarError("");
    const reader = new FileReader();
    reader.onload = async () => {
      const imageData = String(reader.result || "");
      setAvatarPreview(imageData);
      try {
        await ownerApi.updateProfile({ avatar_file_data: imageData });
        await reload();
      } catch (apiError) {
        setAvatarError(apiError.message || "Unable to save avatar.");
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
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
          </div>
        </div>
        <aside className="owner-profile-card" aria-label="Verified owner identity">
          <label className="owner-profile-avatar-upload" title="Change avatar">
            <img src={avatarPreview || profileFallbackAvatar} alt={`${profile.name} owner avatar`} />
            <span>Change photo</span>
            <input accept="image/*" type="file" onChange={handleAvatarChange} />
          </label>
          <div>
            <span className="owner-badge owner-badge--green"><ShieldCheck size={14} /> Verified Owner</span>
            <strong>{profile.licenseNumber}</strong>
            <small>Owner license</small>
            {avatarError && <small className="owner-form-error">{avatarError}</small>}
          </div>
        </aside>
      </section>

      <section className="owner-profile-stats" aria-label="Owner account summary">
        {[ 
          { label: "Earnings", value: formatMoney(ownerPrizeTotal, ownerPrizeCurrency), note: `${awards.length} prize award${awards.length === 1 ? "" : "s"}`, icon: Award },
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
            <strong>Verified</strong>
            <p>Account can submit horse registrations, manage jockey assignments, and review prize awards after published race results.</p>
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

    </div>
  );
}

export {
  OwnerHorseDetail,
  OwnerHorseForm,
  OwnerHorses,
  OwnerJockeys,
  OwnerProfile,
  OwnerRaceDetail,
  OwnerRegistrations,
  OwnerResults,
  OwnerSchedule,
};
