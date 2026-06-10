import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import { saveRoleApplicationIntent } from "../auth/authStorage";
import "../index.css";
import "../App.css";

const fallbackRoleOptions = [
  { value: "horse_owner", label: "Horse Owner" },
  { value: "jockey", label: "Jockey" },
  { value: "race_referee", label: "Race Referee" },
  { value: "spectator", label: "Spectator" },
  { value: "admin", label: "Admin" },
];

function SignUp() {
  const [selectedRole, setSelectedRole] = useState("");
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [roleOptions, setRoleOptions] = useState(fallbackRoleOptions);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  useEffect(() => {
    let cancelled = false;

    async function loadRoles() {
      try {
        const data = await authApi.getRoles();
        if (!cancelled && Array.isArray(data.roles) && data.roles.length) {
          setRoleOptions(data.roles.map((role) => ({
            value: role.value,
            label: role.label,
            description: role.description,
          })));
        }
      } catch {
        if (!cancelled) {
          setRoleOptions(fallbackRoleOptions);
        }
      }
    }

    loadRoles();

    return () => {
      cancelled = true;
    };
  }, []);

  const chooseRole = (role) => {
    setSelectedRole(role.value);
    setError("");
    setMessage("");
    setIsRoleOpen(false);
  };

  const selectedRoleOption = roleOptions.find((role) => role.value === selectedRole);

  const updateField = (field, value) => {
    setError("");
    setMessage("");
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validateForm = () => {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!selectedRole) return "Please choose a role.";
    if (!form.email.trim()) return "Email is required.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) return "Confirm password does not match.";
    if (!form.terms) return "Please agree to the tournament rules and privacy policy.";
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const data = await authApi.register({
        full_name: form.fullName,
        email: form.email,
        password: form.password,
      });
      const verificationOtp = data.verification?.otp;
      saveRoleApplicationIntent(selectedRole, form.email);

      if (verificationOtp) {
        await authApi.verifyAccount(verificationOtp);
        setMessage(
          selectedRole === "spectator"
            ? "Account created and verified. You can login now."
            : "Account created and verified. Login next to submit your role application."
        );
      } else {
        setMessage(
          selectedRole === "spectator"
            ? "Account created. Please verify your account before login."
            : "Account created. After verification, login to submit your role application."
        );
      }
    } catch (apiError) {
      setError(apiError.message || "Unable to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

          <form className="signup-page__form" onSubmit={handleSubmit}>
            <div className="signup-page__grid">
              <div className="signup-field">
                <label htmlFor="signup-first-name">Full name</label>
                <input
                  id="signup-first-name"
                  type="text"
                  name="fullName"
                  placeholder="Your full name"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  required
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
                    <span className={selectedRoleOption ? "" : "signup-role-picker__placeholder"}>
                      {selectedRoleOption?.label || "Choose your role"}
                    </span>
                    <span className="signup-role-picker__chevron" aria-hidden="true" />
                  </button>

                  <div className="signup-role-picker__menu" role="listbox" aria-labelledby="signup-role-label">
                    {roleOptions.map((role) => (
                      <button
                        className={`signup-role-picker__option ${selectedRole === role.value ? "signup-role-picker__option--active" : ""}`}
                        type="button"
                        role="option"
                        aria-selected={selectedRole === role.value}
                        key={role.value}
                        onClick={() => chooseRole(role)}
                      >
                        <span>{role.label}</span>
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
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                required
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
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  required
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
                  value={form.confirmPassword}
                  onChange={(event) => updateField("confirmPassword", event.target.value)}
                  required
                />
              </div>
            </div>

            <label className="signup-page__agree" htmlFor="signup-terms">
              <input
                id="signup-terms"
                type="checkbox"
                name="terms"
                checked={form.terms}
                onChange={(event) => updateField("terms", event.target.checked)}
              />
              I agree to the tournament rules and privacy policy
            </label>

            {error && <p className="auth-message auth-message--error">{error}</p>}
            {message && <p className="auth-message auth-message--success">{message}</p>}

            <button className="signup-page__submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Sign Up"}
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
