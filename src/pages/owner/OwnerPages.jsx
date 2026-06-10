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
  Filter,
  Flag,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Trophy,
  UserRound,
  UsersRound,
} from "lucide-react";
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
import { toHorsePayload } from "./ownerAdapters";
import { useOwnerHorse, useOwnerHorses, useOwnerProfile } from "./useOwnerData";

const statusClass = (status) => {
  if (["Ready", "Approved", "Assigned", "Confirmed", "Published", "Won", "Verified"].includes(status)) {
    return "owner-badge--green";
  }
  if (["Rejected", "Closed"].includes(status)) {
    return "owner-badge--muted";
  }
  return "owner-badge--amber";
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

      {isLoading && <div className="owner-empty">Loading stable horses from API...</div>}
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
                  <span className="owner-kicker">{horse.id}</span>
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
    });
  }, [existingHorse]);

  const updateField = (field, value) => {
    setSaved(false);
    setError("");
    setForm((current) => ({ ...current, [field]: value }));
  };

  const actionPath = isEdit && existingHorse ? `/owner/horses/${existingHorse.id}` : "/owner/horses";

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

      if (isEdit && existingHorse) {
        await ownerApi.updateHorse(existingHorse.id, payload);
        setSaved(true);
      } else {
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
    return <div className="owner-empty">Loading horse profile from API...</div>;
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
  if (isLoading) {
    return <div className="owner-empty">Loading horse profile from API...</div>;
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
          </div>
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
  const [saved, setSaved] = useState(false);
  const [entry, setEntry] = useState({
    horse: ownerHorses[0].name,
    tournament: availableTournaments[0],
    note: "",
  });
  const selectedHorse = ownerHorses.find((horse) => horse.name === entry.horse) ?? ownerHorses[0];

  const updateEntry = (field, value) => {
    setSaved(false);
    setEntry((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="owner-registration-page">
      <section className="owner-registration-hero">
        <img src={registrationHeroImage} alt="Race track grandstand for tournament registration" />
        <div className="owner-registration-hero__copy">
          <p className="owner-eyebrow">Tournament entries</p>
          <h1>Register horses and track approvals.</h1>
          <p>Submit entries, monitor admin review, and keep approval notes visible before each race window closes.</p>
        </div>
        <aside className="owner-registration-hero__panel">
          <span className="owner-badge owner-badge--amber"><ClipboardCheck size={14} /> {ownerRegistrations.filter((item) => item.status === "Pending" || item.status === "Review").length} need attention</span>
          <strong>{selectedHorse.name}</strong>
          <p>{selectedHorse.healthNote}</p>
        </aside>
      </section>

      <section className="owner-registration-workspace">
        <form className="owner-registration-form" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
          <div className="owner-card__header">
            <div>
              <span className="owner-kicker">New entry</span>
              <h2>Submit tournament registration</h2>
            </div>
            <Send size={20} />
          </div>

          <div className="owner-form-grid owner-form-grid--single">
            <FormSelect label="Horse" value={entry.horse} options={ownerHorses.map((horse) => horse.name)} onChange={(value) => updateEntry("horse", value)} />
            <FormSelect label="Tournament" value={entry.tournament} options={availableTournaments} onChange={(value) => updateEntry("tournament", value)} />
            <label className="owner-form-note">Owner note<textarea value={entry.note} onChange={(event) => updateEntry("note", event.target.value)} placeholder="Add readiness, preferred jockey, or scheduling note..." /></label>
          </div>

          <div className="owner-registration-preview">
            <div><span>Horse status</span><strong>{selectedHorse.status}</strong></div>
            <div><span>Assigned jockey</span><strong>{selectedHorse.jockey}</strong></div>
            <div><span>Next race</span><strong>{selectedHorse.nextRace}</strong></div>
          </div>

          <div className="owner-form-actions">
            {saved && <span className="owner-success"><CheckCircle2 size={16} /> Registration saved locally.</span>}
            <button className="owner-button owner-button--primary" type="submit">Submit Entry</button>
          </div>
        </form>

        <aside className="owner-registration-side">
          <div className="owner-registration-side__item">
            <span>Available tournaments</span>
            <strong>{availableTournaments.length}</strong>
            <small>Open choices in the entry dropdown</small>
          </div>
          <div className="owner-registration-side__item">
            <span>Approved entries</span>
            <strong>{ownerRegistrations.filter((item) => item.status === "Approved").length}</strong>
            <small>Ready for race scheduling</small>
          </div>
          <div className="owner-registration-side__item">
            <span>Review queue</span>
            <strong>{ownerRegistrations.filter((item) => item.status === "Pending" || item.status === "Review").length}</strong>
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
          {ownerRegistrations.map((item) => (
            <div className="owner-registration owner-registration--rich" key={item.id}>
              <time className="owner-registration__date">{item.submitted}</time>
              <div className="owner-registration__content">
                <div className="owner-registration__headline">
                  <span className="owner-registration__id">{item.id}</span>
                  <div className="owner-registration__body">
                    <strong>{item.horse}</strong>
                    <small>{item.tournament}</small>
                  </div>
                </div>
                <small className="owner-registration__note">{item.note}</small>
              </div>
              <span className={`owner-badge ${statusClass(item.status)}`}>{item.status}</span>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function OwnerJockeys() {
  const [jockeys, setJockeys] = useState(ownerJockeys);
  const updateStatus = (id, status) => setJockeys((current) => current.map((jockey) => jockey.id === id ? { ...jockey, status } : jockey));
  const assignedCount = jockeys.filter((jockey) => jockey.status === "Assigned").length;
  const openCount = jockeys.filter((jockey) => jockey.status === "Available" || jockey.status === "Invited").length;
  const pendingCount = jockeys.filter((jockey) => jockey.status === "Pending").length;
  const topWinRate = Math.max(...jockeys.map((jockey) => Math.round((jockey.wins / jockey.races) * 100)));

  return (
    <div className="owner-jockey-page">
      <section className="owner-jockey-hero">
        <img src={jockeyHeroImage} alt="Jockey preparing for a horse racing assignment" />
        <div className="owner-jockey-hero__copy">
          <p className="owner-eyebrow">Jockey assignments</p>
          <h1>Invite riders and confirm horse pairings.</h1>
          <p>Compare availability, win form, and assigned horse before locking the race-day lineup.</p>
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
          { label: "Open riders", value: openCount, note: "Available or invited", icon: UserRound },
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

      <section className="owner-jockey-board">
        {jockeys.map((jockey, index) => {
          const winRate = Math.round((jockey.wins / jockey.races) * 100);
          return (
            <article className="owner-jockey-card" key={jockey.id}>
              <div className="owner-jockey-card__media">
                <img src={jockeyImages[index % jockeyImages.length]} alt={`${jockey.name} jockey profile`} />
                <span className={`owner-badge ${statusClass(jockey.status)}`}>{jockey.status}</span>
              </div>
              <div className="owner-jockey-card__body">
                <div className="owner-jockey-card__header">
                  <div>
                    <span className="owner-kicker">{jockey.id}</span>
                    <h2>{jockey.name}</h2>
                  </div>
                  <strong>{winRate}%</strong>
                </div>

                <div className="owner-jockey-pairing">
                  <span>Assigned horse</span>
                  <strong>{jockey.assignedHorse}</strong>
                  <small>{jockey.assignedHorse === "Unassigned" ? "Ready for a new horse invitation." : "Pairing visible for owner confirmation."}</small>
                </div>

                <div className="owner-jockey-metrics">
                  <div><span>Wins</span><strong>{jockey.wins}</strong></div>
                  <div><span>Races</span><strong>{jockey.races}</strong></div>
                  <div><span>Availability</span><strong>{jockey.availability}</strong></div>
                </div>

                <div className="owner-jockey-card__actions">
                  <button className="owner-button" type="button" onClick={() => updateStatus(jockey.id, "Invited")}>Invite</button>
                  <button className="owner-button owner-button--primary" type="button" onClick={() => updateStatus(jockey.id, "Assigned")}>Confirm</button>
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
  const { profile, isLoading, error } = useOwnerProfile();

  if (isLoading) {
    return <div className="owner-empty">Loading owner profile from API...</div>;
  }

  if (error || !profile) {
    return <div className="owner-empty owner-empty--error">{error || "Owner profile not found."}</div>;
  }

  return (
    <div className="owner-profile-page">
      <section className="owner-profile-hero">
        <img src={profileStableImage} alt={`${profile.stable} stable profile background`} />
        <div className="owner-profile-hero__copy">
          <p className="owner-eyebrow">Stable profile</p>
          <h1>{profile.stable} account.</h1>
          <p>Review owner identity, verification, contact information, and notification preferences.</p>
        </div>
        <aside className="owner-profile-card">
          <img src={profileHeroImage} alt={`${profile.name} owner portrait`} />
          <div>
            <span className="owner-badge owner-badge--green"><ShieldCheck size={14} /> Verified Owner</span>
            <strong>{profile.name}</strong>
            <small>{profile.location} / {profile.joined}</small>
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
            <div><span>Name</span><strong>{profile.name}</strong></div>
            <div><span>Stable</span><strong>{profile.stable}</strong></div>
            <div><span><Mail size={13} /> Email</span><strong>{profile.email}</strong></div>
            <div><span><Phone size={13} /> Phone</span><strong>{profile.phone}</strong></div>
            <div><span><MapPin size={13} /> Location</span><strong>{profile.location}</strong></div>
            <div><span><ShieldCheck size={13} /> License</span><strong>{profile.licenseNumber}</strong></div>
            <div><span><ShieldCheck size={13} /> Status</span><strong>{profile.status}</strong></div>
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
