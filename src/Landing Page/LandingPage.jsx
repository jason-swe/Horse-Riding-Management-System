import { useState } from "react";
import "../App.css";
import horseImage from "../img/img_horse03.png";
import testi1 from "../assets/testi1.svg";
import testi2 from "../assets/testi2.svg";
import testi3 from "../assets/testi3.svg";

const navItems = ["Home", "Schedule", "Leaderboard"];

const horseFacts = [
  { label: "Warmblood", position: "fact-left fact-top" },
  { label: "Flexible Back", position: "fact-center fact-top" },
  { label: "17hh", position: "fact-right fact-top" },
  { label: "15 years", position: "fact-left fact-mid" },
  { label: "Efficient Heart", position: "fact-right fact-mid" },
  { label: "58 mph", position: "fact-center fact-bottom" },
  { label: "455 lb", position: "fact-right fact-bottom" },
];

const stats = [
  { value: "100%", label: "Satisfied Riders", tone: "left", badge: "😊" },
  {
    value: "15+",
    label: "Years we have been giving",
    tone: "right",
    badge: "15+",
  },
];

const testimonials = [
  {
    id: 1,
    name: "Elina Lee",
    role: "Rider",
    text:
      "Exceptional training, supportive environment — my riding skills and confidence have greatly improved.",
    stars: 5,
    image: testi1,
  },
  {
    id: 2,
    name: "Maya Tran",
    role: "Rider",
    text: "Great instructors and a friendly community. I learned so much quickly.",
    stars: 5,
    image: testi2,
  },
  {
    id: 3,
    name: "Rita Tran",
    role: "Rider",
    text: "Friendly staff and great lessons — highly recommended for beginners.",
    stars: 5,
    image: testi3,
  },
  {
    id: 4,
    name: "Sam Park",
    role: "Rider",
    text: "Well-structured classes, patient trainers, and a clean facility.",
    stars: 4,
    image: testi1,
  },
];

function LandingPage() {
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const year = new Date().getFullYear();

  const moveTestimonial = (direction) => {
    setTestimonialIndex(
      (current) => (current + direction + testimonials.length) % testimonials.length,
    );
  };

  const getSlideOffset = (slideIndex) => {
    const total = testimonials.length;
    let offset = slideIndex - testimonialIndex;

    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    return offset;
  };

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

          <div className="header-actions">
            <a className="signup-btn" href="#signup">Sign Up</a>
            <a className="contact-btn" href="#login">
              Login
              <span aria-hidden="true">↗</span>
            </a>
          </div>
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

        <section className="testimonials" aria-label="Riders testimonials">
          <div className="testimonials__header">
            <h3 className="testimonials__title">What's Riders Are Saying</h3>
            <div className="testimonials__controls" />
          </div>

          <div className="testimonials__stage">
            <div className="testimonials__track">
              {testimonials.map((testimonial, slideIndex) => {
                const offset = getSlideOffset(slideIndex);
                const absOffset = Math.abs(offset);
                const isCenter = offset === 0;
                const sideClass = offset < 0 ? "left" : "right";

                return (
                  <article
                    key={testimonial.id}
                    className={`testimonial-card ${
                      isCenter ? "is-center" : absOffset === 1 ? `is-side is-${sideClass}` : "is-far"
                    }`}
                    style={{ "--offset": offset }}
                  >
                    <img
                      src={testimonial.image}
                      alt={`${testimonial.name} testimonial`}
                      className="testimonial-card__image"
                    />

                    {isCenter ? (
                      <div className="testimonial-card__content">
                        <p className="testimonial-card__text">{testimonial.text}</p>
                        <div className="testimonial-card__meta">
                          <div className="testimonial-card__name">{testimonial.name}</div>
                          <div className="testimonial-card__role">{testimonial.role}</div>
                        </div>
                        <div
                          className="testimonial-card__rating"
                          aria-label={`${testimonial.stars} out of 5 stars`}
                        >
                          {"★".repeat(testimonial.stars)}
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
            <button
              className="testimonials__nav testimonials__nav--left"
              type="button"
              onClick={() => moveTestimonial(-1)}
              aria-label="Previous testimonial"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              className="testimonials__nav testimonials__nav--right"
              type="button"
              onClick={() => moveTestimonial(1)}
              aria-label="Next testimonial"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </section>
      </section>
      <footer className="site-footer" aria-label="Site footer">
        <div className="site-footer__inner">
          <div className="footer-brand">
            <a className="brand footer-brand__link" href="#home">
              <span className="brand-mark">HR</span>
              <span className="brand-text">
                <strong>horse</strong>
                <span>riding</span>
              </span>
            </a>
            <p className="footer-copy">Providing expert riding lessons, horse care, and community events since 2010.</p>
          </div>

          <nav className="footer-links" aria-label="Footer navigation">
            <h4>Explore</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#schedule">Schedule</a></li>
              <li><a href="#leaderboard">Leaderboard</a></li>
            </ul>
          </nav>

          <div className="footer-contact">
            <h4>Contact</h4>
            <address>
              123 Stable Lane<br />
              Countryside, CA 90210
            </address>
            <a href="mailto:info@horseriding.example">info@horseriding.example</a>
            <a href="tel:+1234567890">+1 (234) 567-890</a>
          </div>

          <div className="footer-newsletter">
            <h4>Join our newsletter</h4>
            <p>Get news on lessons, events and special offers.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input className="newsletter-input" type="email" placeholder="Email address" aria-label="Email address" />
              <button className="newsletter-btn" type="submit">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="site-footer__bottom">
          <div className="footer-copyright">© {year} Horse Riding. All rights reserved.</div>
          <div className="footer-social" aria-hidden="false">
            <a href="#" aria-label="Facebook" className="social-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07C2 17.09 5.66 21.2 10.44 21.95v-6.94H8.08v-2.9h2.36V9.41c0-2.33 1.39-3.62 3.52-3.62 1.02 0 2.09.18 2.09.18v2.3h-1.18c-1.16 0-1.52.72-1.52 1.46v1.76h2.59l-.41 2.9h-2.18v6.94C18.34 21.2 22 17.09 22 12.07z" fill="currentColor"/></svg>
            </a>
            <a href="#" aria-label="Instagram" className="social-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6.2a4 4 0 100 8 4 4 0 000-8zm5.5-.5a1 1 0 11-2 0 1 1 0 012 0z" fill="currentColor"/></svg>
            </a>
            <a href="#" aria-label="Twitter" className="social-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 5.92c-.6.27-1.23.45-1.9.53.68-.4 1.2-1.03 1.44-1.78-.63.37-1.32.64-2.06.79A3.29 3.29 0 0015.5 5c-1.8 0-3.26 1.5-3.26 3.36 0 .26.03.52.09.77-2.71-.13-5.12-1.5-6.73-3.56-.28.48-.44 1.03-.44 1.62 0 1.12.55 2.11 1.38 2.69-.51-.02-.98-.16-1.39-.4v.04c0 1.61 1.15 2.96 2.68 3.27-.28.08-.57.12-.88.12-.22 0-.44-.02-.65-.06.45 1.4 1.75 2.42 3.29 2.45A6.63 6.63 0 012 18.4a9.33 9.33 0 005.05 1.48c6.06 0 9.38-4.98 9.38-9.3v-.42c.64-.46 1.18-1.04 1.62-1.7-.58.26-1.2.44-1.86.52z" fill="currentColor"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default LandingPage;
