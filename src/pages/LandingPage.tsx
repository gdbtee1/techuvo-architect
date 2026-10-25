import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import HeroMorphScene from "../components/landing/HeroMorphScene";
import "../styles/landing.css";

type SceneType = "estate" | "barn" | "farm";

const scenes: {
  id: SceneType;
  label: string;
  title: string;
  description: string;
}[] = [
  {
    id: "estate",
    label: "01 / RESIDENTIAL",
    title: "Design Beyond Expectations.",
    description:
      "Explore sophisticated residential architecture and visualize every detail of your future estate.",
  },
  {
    id: "barn",
    label: "02 / AGRICULTURAL",
    title: "Built for Possibility.",
    description:
      "Plan agricultural facilities with thoughtful layouts and intelligent design recommendations.",
  },
  {
    id: "farm",
    label: "03 / VERTICAL FARMING",
    title: "Cultivate the Future.",
    description:
      "Discover innovative farming environments designed for modern agricultural ambitions.",
  },
];

export default function LandingPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = scenes[activeIndex];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % scenes.length);
    }, 7000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="lux-site">
      <section className="lux-immersive-hero">
        <div className="lux-immersive-background" aria-hidden="true">
          <HeroMorphScene scene={active.id} />
        </div>

        <div className="lux-immersive-wash" />

        <header className="lux-nav lux-nav-overlay">
          <Link className="lux-brand" to="/">
            <span className="lux-brand-symbol">△</span>
            <span>ARCHITECTURAL INTELLIGENCE</span>
          </Link>

          <nav className="lux-nav-links" aria-label="Main navigation">
            <Link to="/platform">Platform</Link>
            <Link to="/designs">Designs</Link>
            <Link to="/packages">Packages</Link>
            <Link to="/gallery">Gallery</Link>
            <Link to="/about">About</Link>
          </nav>

          <Link className="lux-nav-action" to="/studio">
            View Demo <ArrowUpRight size={17} />
          </Link>
        </header>

        <main className="lux-immersive-content">
          <div className="lux-immersive-eyebrow">
            AI-ASSISTED ARCHITECTURAL DESIGN
          </div>

          <h1 className="lux-immersive-headline">
            Architectural Intelligence,
            <em> Tailored for Luxury.</em>
          </h1>

          <p className="lux-immersive-description">
            From initial sketch to professional 3D CAD floor plans.
            Design your legacy from the ground up.
          </p>

          <div className="lux-immersive-actions">
            <Link className="lux-primary-cta" to="/studio">
              View Live Demo <ArrowUpRight size={19} />
            </Link>

            <Link className="lux-secondary-cta" to="/packages">
              Explore Design Packages <ArrowRight size={18} />
            </Link>
          </div>

          <div className="lux-active-scene" key={active.id}>
            <span>{active.label}</span>
            <strong>{active.title}</strong>
            <p>{active.description}</p>
          </div>
        </main>

        <div className="lux-scene-navigation">
          {scenes.map((scene, index) => (
            <button
              key={scene.id}
              type="button"
              className={activeIndex === index ? "active" : ""}
              onClick={() => setActiveIndex(index)}
              aria-pressed={activeIndex === index}
            >
              <span>0{index + 1}</span>
              {scene.id === "estate"
                ? "ESTATE"
                : scene.id === "barn"
                ? "AGRICULTURAL"
                : "VERTICAL FARM"}
            </button>
          ))}
        </div>

        <div className="lux-immersive-bottom">
          <span>RESIDENTIAL · COMMERCIAL · AGRICULTURAL</span>
          <span>EXPLORE ARCHITECTURAL INTELLIGENCE ↓</span>
        </div>
      </section>
    </div>
  );
}
