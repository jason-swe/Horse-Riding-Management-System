import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuth } from "../auth/AuthContext";
import { clearRoleApplicationIntent, getRoleApplicationIntent } from "../auth/authStorage";
import { getPostLoginRoute, getRequiredRoleForPath } from "../auth/roleRoutes";
import "../index.css";
import "../App.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setError("");
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const data = await authApi.login({
        email: form.email,
        password: form.password,
      });
      const roles = signIn(data);
      const requestedPath = location.state?.from?.pathname;
      const requestedRole = getRequiredRoleForPath(requestedPath);
      const roleIntent = getRoleApplicationIntent(form.email);
      const fallbackRoute = getPostLoginRoute(roles);
      const shouldApplyForRole = roles.includes("spectator") && roleIntent?.role && !roles.includes(roleIntent.role);
      const nextRoute = shouldApplyForRole
        ? `/spectator/role-applications?role=${roleIntent.role}`
        : requestedRole && roles.includes(requestedRole)
          ? requestedPath
          : fallbackRoute;

      if (shouldApplyForRole) {
        clearRoleApplicationIntent();
      }

      navigate(nextRoute, { replace: true });
    } catch (apiError) {
      setError(apiError.message || "Unable to login. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page" aria-label="Login page">
      <section className="login-page__shell">
        <div className="login-page__panel login-page__panel--form">
          <Link className="login-page__brand brand" to="/" aria-label="Horse racing home">
            <span className="brand-mark">HR</span>
            <span className="brand-text">
              <strong>horse</strong>
              <span>racing</span>
            </span>
          </Link>

          <p className="login-page__eyebrow">WELCOME BACK</p>
          <h1 className="login-page__title">
            Sign in to your <span>race</span> account
          </h1>
          <p className="login-page__description">
            Access registrations, race schedules, results, rankings, and prediction tools in one place.
            The login flow matches the current horse-racing management style.
          </p>

          <form className="login-page__form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                name="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                required
              />
            </div>

            <div className="login-page__row">
              <label className="login-remember" htmlFor="login-remember">
                <input
                  id="login-remember"
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={(event) => updateField("remember", event.target.checked)}
                />
                Remember me
              </label>

              <a className="login-page__link" href="#forgot-password">
                Forgot password?
              </a>
            </div>

            {error && <p className="auth-message auth-message--error">{error}</p>}

            <button className="login-page__submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            <div className="login-page__divider">
              <span>or continue with</span>
            </div>

            <div className="login-page__socials">
              <button className="login-page__social" type="button">
                Google
              </button>
              <button className="login-page__social" type="button">
                Facebook
              </button>
            </div>

            <p className="login-page__note">
              New here? <Link className="login-page__link" to="/signup">Create an account</Link>
            </p>
          </form>
        </div>

        <aside className="login-page__panel login-page__panel--intro login-page__intro">
          <p className="login-page__eyebrow">HORSE RACING TOURNAMENT MANAGEMENT SYSTEM</p>
          <h2 className="login-page__title">
            Manage every <span>race</span> with clarity
          </h2>
          <p className="login-page__description">
            Your dashboard keeps race registrations, schedules, results, rankings, and prediction tracking in one calm, focused space.
          </p>

          <div className="login-page__intro-card">
            <ul className="login-page__intro-list">
              <li>
                <span className="login-page__intro-badge">01</span>
                <div>
                  <h4>Race registration</h4>
                  <p>Manage horse owner, jockey, referee, and spectator participation requests in one flow.</p>
                </div>
              </li>
              <li>
                <span className="login-page__intro-badge">02</span>
                <div>
                  <h4>Race scheduling</h4>
                  <p>Review heats, rounds, assigned referees, and race timing in a structured view.</p>
                </div>
              </li>
              <li>
                <span className="login-page__intro-badge">03</span>
                <div>
                  <h4>Results and rankings</h4>
                  <p>Track race results, prizes, rankings, and predictions with a layout that feels premium and calm.</p>
                </div>
              </li>
            </ul>

            <div className="login-page__quote">
              "A clean login flow should feel like the start of a race day: clear, fast, and dependable."
            </div>
          </div>

          <div className="login-page__stats" aria-label="Login page highlights">
            <article className="login-page__stat">
              <strong>24/7</strong>
              <span>tournament access</span>
            </article>
            <article className="login-page__stat">
              <strong>12+</strong>
              <span>role-based modules</span>
            </article>
            <article className="login-page__stat">
              <strong>100%</strong>
              <span>management flow</span>
            </article>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default Login;
