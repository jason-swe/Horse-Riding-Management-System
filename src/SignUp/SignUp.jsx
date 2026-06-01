import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../index.css";
import "../App.css";

const roleOptions = [
  "Horse Owner",
  "Jockey",
  "Race Referee",
  "Spectator",
  "Admin",
];

function SignUp() {
  const [selectedRole, setSelectedRole] = useState("");
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const rolePickerRef = useRef(null);

  useEffect(() => {
    const closeRolePicker = (event) => {
      if (!rolePickerRef.current?.contains(event.target)) {
        setIsRoleOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeRolePicker);
    return () => document.removeEventListener("pointerdown", closeRolePicker);
  }, []);

  const chooseRole = (role) => {
    setSelectedRole(role);
    setIsRoleOpen(false);
  };

  return (
    <main className="signup-page" aria-label="Sign up page">
      <section className="signup-page__shell">
        <div className="signup-page__panel signup-page__panel--form">
          <Link className="signup-page__brand brand" to="/" aria-label="Horse racing home">
            <span className="brand-mark">HR</span>
            <span className="brand-text">
              <strong>horse</strong>
              <span>racing</span>
            </span>
          </Link>

          <p className="signup-page__eyebrow">REGISTER FOR THE TOURNAMENT</p>
          <h1 className="signup-page__title">
            Create your <span>race</span> account
          </h1>
          <p className="signup-page__description">
            Register once to manage race registrations, horse details, schedules, results, and predictions.
          </p>

          <form className="signup-page__form" onSubmit={(event) => event.preventDefault()}>
            <div className="signup-page__grid">
              <div className="signup-field">
                <label htmlFor="signup-first-name">Full name</label>
                <input
                  id="signup-first-name"
                  type="text"
                  name="fullName"
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </div>

              <div className="signup-field">
                <label id="signup-role-label" htmlFor="signup-role">Role</label>
                <div className={`signup-role-picker ${isRoleOpen ? "signup-role-picker--open" : ""}`} ref={rolePickerRef}>
                  <input id="signup-role" type="hidden" name="role" value={selectedRole} />
                  <button
                    className="signup-role-picker__button"
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isRoleOpen}
                    aria-labelledby="signup-role-label"
                    onClick={() => setIsRoleOpen((open) => !open)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setIsRoleOpen(false);
                      }
                    }}
                  >
                    <span className={selectedRole ? "" : "signup-role-picker__placeholder"}>
                      {selectedRole || "Choose your role"}
                    </span>
                    <span className="signup-role-picker__chevron" aria-hidden="true" />
                  </button>

                  <div className="signup-role-picker__menu" role="listbox" aria-labelledby="signup-role-label">
                    {roleOptions.map((role) => (
                      <button
                        className={`signup-role-picker__option ${selectedRole === role ? "signup-role-picker__option--active" : ""}`}
                        type="button"
                        role="option"
                        aria-selected={selectedRole === role}
                        key={role}
                        onClick={() => chooseRole(role)}
                      >
                        <span>{role}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="signup-field">
              <label htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="signup-page__grid">
              <div className="signup-field">
                <label htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  name="password"
                  placeholder="Create password"
                  autoComplete="new-password"
                />
              </div>

              <div className="signup-field">
                <label htmlFor="signup-confirm-password">Confirm password</label>
                <input
                  id="signup-confirm-password"
                  type="password"
                  name="confirmPassword"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <label className="signup-page__agree" htmlFor="signup-terms">
              <input id="signup-terms" type="checkbox" name="terms" />
              I agree to the tournament rules and privacy policy
            </label>

            <button className="signup-page__submit" type="submit">
              Sign Up
            </button>

            <div className="signup-page__divider">
              <span>or continue with</span>
            </div>

            <div className="signup-page__socials">
              <button className="signup-page__social" type="button">
                Google
              </button>
              <button className="signup-page__social" type="button">
                Facebook
              </button>
            </div>

            <p className="signup-page__note">
              Already have an account? <Link className="signup-page__link" to="/login">Login</Link>
            </p>
          </form>
        </div>

        <aside className="signup-page__panel signup-page__panel--intro signup-page__intro">
          <p className="signup-page__eyebrow">START YOUR JOURNEY</p>
          <h2 className="signup-page__title">
            Build your racing profile and compete with <span>confidence</span>
          </h2>
          <p className="signup-page__description">
            Your account unlocks race schedules, horse registration, jockey invitations, referee access, and spectator features.
          </p>

          <div className="signup-page__intro-card">
            <ul className="signup-page__intro-list">
              <li>
                <span className="signup-page__intro-badge">01</span>
                <div>
                  <h4>Role selection</h4>
                  <p>Choose your role in the tournament system so the right tools and permissions are ready.</p>
                </div>
              </li>
              <li>
                <span className="signup-page__intro-badge">02</span>
                <div>
                  <h4>Participation management</h4>
                  <p>Once signed up, you can manage horses, jockey assignments, schedules, and results from one hub.</p>
                </div>
              </li>
              <li>
                <span className="signup-page__intro-badge">03</span>
                <div>
                  <h4>Tournament updates</h4>
                  <p>Stay connected with announcements, rankings, prizes, and prediction results without leaving the system.</p>
                </div>
              </li>
            </ul>

            <div className="signup-page__quote">
              "A good sign up screen should feel like an invitation to the tournament, not a barrier."
            </div>
          </div>

          <div className="signup-page__stats" aria-label="Sign up page highlights">
            <article className="signup-page__stat">
              <strong>1 min</strong>
              <span>setup time</span>
            </article>
            <article className="signup-page__stat">
              <strong>3 steps</strong>
              <span>to get started</span>
            </article>
            <article className="signup-page__stat">
              <strong>100%</strong>
              <span>matching style</span>
            </article>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default SignUp;
