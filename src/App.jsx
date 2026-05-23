import "./App.css";
import horseImage from "./img/img_horse03.png";

const navItems = ["Home", "Horses", "Lessons", "Ownership", "Training"];

const stats = [
  { value: "100%", label: "Satisfied Riders", tone: "left", badge: "😊" },
  {
    value: "15+",
    label: "Years we have been giving",
    tone: "right",
    badge: "15+",
  },
];

const horseFacts = [
  { label: "Warmblood", position: "fact-left fact-top" },
  { label: "Flexible Back", position: "fact-center fact-top" },
  { label: "17hh", position: "fact-right fact-top" },
  { label: "15 years", position: "fact-left fact-mid" },
  { label: "Efficient Heart", position: "fact-right fact-mid" },
  { label: "58 mph", position: "fact-center fact-bottom" },
  { label: "455 lb", position: "fact-right fact-bottom" },
];

function App() {
  return (
    <main className="page-shell">
      <section className="hero-layout">
        <div className="hero-background" aria-hidden="true" />

        <header className="topbar">
          <a className="brand" href="#home" aria-label="Horse riding home">
            <span className="brand-mark">HR</span>
            <span className="brand-text">
              <strong>horse</strong>
              <span>riding</span>
            </span>
          </a>

          <nav className="nav" aria-label="Primary">
            {navItems.map((item, index) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={index === 0 ? "active" : ""}
              >
                {item}
              </a>
            ))}
          </nav>

          <a className="contact-btn" href="#contact">
            Contact Us
            <span aria-hidden="true">↗</span>
          </a>
        </header>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">RIDING</p>
            <h1>
              Improve Your <span>Riding</span> Skill With Us
            </h1>
            <p className="hero-description">
              Explore our website for comprehensive horse riding training,
              offering expert tips, techniques, and resources to help riders of
              all skill levels succeed.
            </p>
            <div className="hero-actions">
              <a className="primary-btn" href="#join">
                Join Our Club
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <div className="hero-visual" aria-label="Horse riding hero image">
            <div className="image-glow" aria-hidden="true" />
            <img
              src="/images/horse-riding.png"
              alt="Horse rider in motion"
              className="horse-image"
            />
          </div>

          <aside className="hero-rail" aria-label="Club stats and explore more">
            <div className="trainer-card">
              <div className="trainer-avatar-stack" aria-hidden="true">
                <div className="trainer-avatar avatar-1" />
                <div className="trainer-avatar avatar-2" />
                <div className="trainer-avatar avatar-3" />
              </div>
              <div className="trainer-count">20+</div>
              <div className="trainer-label">Trainer</div>
            </div>

            <div className="explore-rail">
              <div className="rail-line" aria-hidden="true">
                <span className="rail-dot" />
              </div>
              <div className="explore-copy">Explore More</div>
              <button
                className="play-btn"
                type="button"
                aria-label="Explore more"
              >
                ▶
              </button>
            </div>
          </aside>
        </div>

        <div className="stats-row" id="home">
          {stats.map((stat) => (
            <article key={stat.label} className={`stat-card ${stat.tone}`}>
              <div className="stat-badge" aria-hidden="true">
                {stat.badge}
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </article>
          ))}

          <article className="stat-card center">
            <div className="center-copy">
              Improve Your Riding Skill Through Training With Us.
            </div>
            <div className="center-cta" aria-hidden="true" />
          </article>
        </div>

        <section
          className="horse-details"
          id="horses"
          aria-labelledby="horse-details-title"
        >
          <div className="horse-details__header">
            <p className="horse-details__eyebrow">HORSE PROFILE</p>
            <h2 id="horse-details-title">Racing Horse Details</h2>
          </div>

          <div className="horse-details__stage">
            <div className="horse-details__watermark" aria-hidden="true">
              HORSE
            </div>

            <div className="horse-details__frame">
              <img
                src={horseImage}
                alt="Racing horse profile"
                className="horse-details__image"
              />

              {horseFacts.map((fact) => (
                <div key={fact.label} className={`horse-fact ${fact.position}`}>
                  <span className="horse-fact__connector" aria-hidden="true" />
                  <span className="horse-fact__label">{fact.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export default App;
