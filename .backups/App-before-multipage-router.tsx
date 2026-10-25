import LandingPage from "./pages/LandingPage";
import StudioPage from "./pages/StudioPage";

export default function App() {
  const path = window.location.pathname;

  if (path === "/studio" || path.startsWith("/studio/")) {
    return <StudioPage />;
  }

  return <LandingPage />;
}
