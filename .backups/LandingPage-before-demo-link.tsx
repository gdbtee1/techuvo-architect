import { ArrowUpRight, MoveUpRight } from "lucide-react";
import "../styles/landing.css";

export default function LandingPage() {
  return (
    <div className="lux-site">
      <header className="lux-nav">
        <a className="lux-brand" href="/">
          <span className="lux-brand-symbol">△</span>
          <span>ARCHITECTURAL INTELLIGENCE</span>
        </a>

        <nav className="lux-nav-links" aria-label="Main navigation">
          <a href="#platform">Platform</a>
          <a href="#categories">Design Categories</a>
          <a href="#packages">Packages</a>
        </nav>

        <a className="lux-nav-action" href="#packages">
          Get Started <ArrowUpRight size={17} />
        </a>
      </header>

      <main>
        <section className="lux-hero">
          <div className="lux-hero-content">
            <div className="lux-eyebrow">
              THE FUTURE OF ARCHITECTURAL DESIGN
            </div>

            <h1>
              Architectural Intelligence,
              <em> Tailored for Luxury.</em>
            </h1>

            <p className="lux-hero-description">
              From initial sketch to professional 3D CAD
              floor plans. Design your legacy from the
              ground up.
            </p>

            <div className="lux-hero-actions">
              <a className="lux-primary-cta" href="#platform">
                Explore the Platform
                <ArrowUpRight size={19} />
              </a>

              <a className="lux-secondary-cta" href="#packages">
                View Design Packages
                <MoveUpRight size={17} />
              </a>
            </div>

            <div className="lux-hero-categories">
              <span>Residential</span>
              <i />
              <span>Commercial</span>
              <i />
              <span>Agricultural</span>
            </div>
          </div>

          <div className="lux-hero-visual">
            <div className="lux-scene-placeholder">
              <span>INTERACTIVE ARCHITECTURAL EXPERIENCE</span>
              <strong>
                Estate / Agricultural / Vertical Farming
              </strong>
              <p>3D transformation scene coming next</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
