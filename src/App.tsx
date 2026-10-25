import ResidentialCommunity from "./pages/templates/ResidentialCommunity";
import BuildingGenerator from "./pages/generator/BuildingGenerator";
import BarnConfigurator from "./pages/configurator/BarnConfigurator";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import StudioPage from "./pages/StudioPage";
import ComingSoonPage from "./pages/ComingSoonPage";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/templates/residential-community" element={<ResidentialCommunity />} />
        <Route path="/generator" element={<BuildingGenerator />} />
        <Route path="/configure/barn" element={<BarnConfigurator />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/studio" element={<StudioPage />} />

        <Route path="/platform" element={<ComingSoonPage />} />
        <Route path="/designs" element={<ComingSoonPage />} />
        <Route path="/packages" element={<ComingSoonPage />} />
        <Route path="/gallery" element={<ComingSoonPage />} />
        <Route path="/about" element={<ComingSoonPage />} />
        <Route path="/contact" element={<ComingSoonPage />} />

        <Route path="*" element={<ComingSoonPage />} />
      </Routes>
    </BrowserRouter>
  );
}
