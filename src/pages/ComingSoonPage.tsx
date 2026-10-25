import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const pages: Record<string, { title: string; description: string }> = {
  "/platform": {
    title: "The Platform",
    description: "AI-assisted architectural planning, interactive CAD tools, and 3D visualization.",
  },
  "/designs": {
    title: "Architectural Designs",
    description: "Explore residential, commercial, agricultural, and industrial design collections.",
  },
  "/packages": {
    title: "Design Packages",
    description: "Discover architectural planning packages and customization options.",
  },
  "/gallery": {
    title: "Design Gallery",
    description: "Explore architectural visualizations and featured projects.",
  },
  "/about": {
    title: "Our Approach",
    description: "Where architectural intelligence meets thoughtful design.",
  },
  "/contact": {
    title: "Get in Touch",
    description: "Start a conversation about your architectural project.",
  },
};

export default function ComingSoonPage() {
  const { pathname } = useLocation();
  const page = pages[pathname];

  if (!page) {
    return (
      <main style={{ padding: "100px 7vw" }}>
        <h1>Page not found</h1>
        <Link to="/">Return home</Link>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        padding: "clamp(70px, 12vw, 160px) 7vw",
        background: "#f8f7f2",
        color: "#26302d",
      }}
    >
      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          color: "#55735f",
          textDecoration: "none",
          fontSize: 13,
        }}
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <p
        style={{
          marginTop: 80,
          letterSpacing: "0.2em",
          fontSize: 11,
          color: "#77917c",
        }}
      >
        ARCHITECTURAL INTELLIGENCE
      </p>

      <h1
        style={{
          fontFamily: "Georgia, serif",
          fontWeight: 400,
          fontSize: "clamp(46px, 7vw, 105px)",
          letterSpacing: "-0.055em",
          lineHeight: 1,
          maxWidth: 900,
        }}
      >
        {page.title}
      </h1>

      <p
        style={{
          maxWidth: 530,
          fontSize: 17,
          lineHeight: 1.9,
          color: "#738075",
        }}
      >
        {page.description}
      </p>

      <p style={{ color: "#87958a", fontSize: 12 }}>
        This page is currently under development.
      </p>

      <Link
        to="/studio"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          marginTop: 30,
          padding: "15px 22px",
          background: "#304d3d",
          color: "white",
          textDecoration: "none",
          fontSize: 13,
        }}
      >
        View Live Demo <ArrowUpRight size={17} />
      </Link>
    </main>
  );
}
