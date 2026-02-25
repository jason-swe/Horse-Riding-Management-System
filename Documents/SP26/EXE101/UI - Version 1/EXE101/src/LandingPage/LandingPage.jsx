import './LandingPage.css'

function LandingPage() {
  return (
    <div className="page">
      <div className="landing-card">
        <section className="left-section">
          <header className="landing-header">
            <div className="logo">
              <span className="logo-text">
                Laundry<span>Go</span>
              </span>
              <span className="logo-bubbles">
                <span className="bubble bubble-lg" />
                <span className="bubble bubble-md" />
                <span className="bubble bubble-sm" />
              </span>
            </div>
            <nav className="nav-links">
              <button className="nav-link nav-link-active">Services</button>
              <button className="nav-link">All Shops</button>
              <button className="nav-link">Track Order</button>
            </nav>
          </header>

          <p className="tagline">
            Effortless to keep your wardrobe flawless.
          </p>

          <div className="left-content">
            <div className="left-text">
              <h1 className="headline">
                Innovating the <span className="accent-blue">Way</span>
                <br />
                <span className="accent-teal">You</span> Wash your
                <br />
                Clothes
              </h1>
            </div>

            <div className="shirt-image-wrapper">
              <img
                src="/image1.jpg"
                alt="Freshly laundered white shirt"
                className="shirt-image"
              />
            </div>
          </div>
        </section>

        <section className="right-section">
          <div className="right-header">
            <div className="right-header-spacer" />
            <div className="auth-buttons">
              <button className="btn btn-primary">Sign Up</button>
              <button className="btn btn-outline">Login</button>
            </div>
          </div>

          <div className="map-wrapper">
            <img
              src="/image2.jpg"
              alt="Map showing laundry delivery route in Ho Chi Minh City"
              className="map-image"
            />
          </div>
        </section>
      </div>

      <div className="about-wrapper">
        <section className="about-section">
          <div className="about-images">
            <div className="about-image about-image-top">
              <img
                src="/about1.jpg"
                alt="Laundry basket in front of washing machine"
              />
            </div>
            <div className="about-image about-image-bottom">
              <img
                src="/about2.jpg"
                alt="Folded clothes and laundry equipment"
              />
            </div>
          </div>

          <div className="about-text">
            <h2 className="about-title">About Us</h2>
            <p className="about-paragraph">
              At LaundryGo, we believe your time is too precious to be spent on
              laundry. Our mission is to provide a seamless, high-quality
              garment care experience that fits perfectly into your modern
              lifestyle. By combining expert cleaning techniques with a
              reliable, affordable delivery service, we take the hassle out of
              your chores. From delicate fabrics to everyday wear, we treat
              every item with the utmost care, ensuring you always look and
              feel your best. Join the LaundryGo community today and
              rediscover the joy of a laundry‑free life.
            </p>
          </div>
        </section>
      </div>

      <div className="values-wrapper">
        <section className="values-section">
          <p className="values-label">VALUES</p>
          <h2 className="values-title">
            What success means at
            <br />
            LaundryGo Cleaners
          </h2>

          <div className="values-columns">
            <div className="value-item">
              <img
                src="/star.jpg"
                alt="Five star rating"
                className="value-stars"
              />
              <p className="value-description">
                On a scale of 1–10, be an 11. Be the person that takes an extra
                step.
              </p>
              <p className="value-tag">PRIDE</p>
            </div>

            <div className="value-item">
              <img
                src="/star.jpg"
                alt="Five star rating"
                className="value-stars"
              />
              <p className="value-description">
                When your aim is perfection, you will achieve excellence.
              </p>
              <p className="value-tag">ADVANCEMENT</p>
            </div>

            <div className="value-item">
              <img
                src="/star.jpg"
                alt="Five star rating"
                className="value-stars"
              />
              <p className="value-description">
                Treat each customer how you would like to be treated.
              </p>
              <p className="value-tag">CARING</p>
            </div>
          </div>
        </section>
      </div>

      <div className="pickup-wrapper">
        <section className="pickup-section">
          <h2 className="pickup-title">pick-up &amp; delivery</h2>

          <div className="pickup-layout">
            <div className="pickup-column pickup-column-left">
              <div className="pickup-item">
                <h3 className="pickup-item-title">Skip the trip</h3>
                <p className="pickup-item-text">
                  Do you run to the dry cleaners 5+ times per month? Try our dry
                  cleaning delivery service.
                </p>
              </div>

              <div className="pickup-item">
                <h3 className="pickup-item-title">Same price</h3>
                <p className="pickup-item-text">
                  We pick-up and deliver your dry cleaning with a small
                  flat-rate fee.
                </p>
              </div>
            </div>

            <div className="pickup-van">
              <img
                src="/vancar.jpg"
                alt="LaundryGo delivery van"
                className="pickup-van-image"
              />
            </div>

            <div className="pickup-column pickup-column-right">
              <div className="pickup-item">
                <h3 className="pickup-item-title">More than dry cleaning</h3>
                <p className="pickup-item-text">
                  LaundryGo also can pick-up and clean your comforters, drapes,
                  area rugs, leather, and suede.
                </p>
              </div>

              <div className="pickup-item">
                <h3 className="pickup-item-title">Get started today</h3>
                <p className="pickup-item-text">
                  It&apos;s easy. Click to sign up. We will contact you by phone
                  or text to get started.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-text">
                Laundry<span>Go</span>
              </span>
              <span className="logo-bubbles">
                <span className="bubble bubble-lg" />
                <span className="bubble bubble-md" />
                <span className="bubble bubble-sm" />
              </span>
            </div>
            <p className="footer-description">
              Redefining laundry with modern technology and professional care.
              We bring the laundromat to your doorstep.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4 className="footer-heading">Company</h4>
              <a href="#" className="footer-link">
                About Us
              </a>
              <a href="#" className="footer-link">
                Blog
              </a>
              <a href="#" className="footer-link">
                Partner With Us
              </a>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Support</h4>
              <a href="#" className="footer-link">
                Help Center
              </a>
              <a href="#" className="footer-link">
                FAQ
              </a>
              <a href="#" className="footer-link">
                Term Of Services
              </a>
            </div>

            <div className="footer-column footer-newsletter">
              <h4 className="footer-heading">Newsletter</h4>
              <label className="footer-label" htmlFor="newsletter-email">
                Email
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Enter your email"
                className="footer-input"
              />
              <p className="footer-note">
                Subscribe to our newsletter and get 10% OFF your next order!
              </p>
              <button className="footer-button">Subscribe</button>
            </div>
          </div>
        </div>

        <p className="footer-bottom">2026 LaundryGo. All rights reserved</p>
      </footer>
    </div>
  )
}

export default LandingPage

