import "../../styles/barn-configurator.css";
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  RotateCcw,
  Ruler,
  SlidersHorizontal,
  Check,
} from "lucide-react";

import EditableBuilding from "../../components/configurator/EditableBuilding";

const finishes = [
  { name: "Natural Cedar", color: "#a97956" },
  { name: "Classic Barn Red", color: "#a3483f" },
  { name: "Charcoal", color: "#42514d" },
  { name: "Warm Sandstone", color: "#c5aa89" },
];

export default function BarnConfigurator() {
  const [width, setWidth] = useState(40);
  const [length, setLength] = useState(60);
  const [height, setHeight] = useState(14);
  const [finish, setFinish] = useState(finishes[0]);
  const [roofStyle, setRoofStyle] = useState<"gable" | "gambrel">("gable");

  const area = width * length;

  function reset() {
    setWidth(40);
    setLength(60);
    setHeight(14);
    setFinish(finishes[0]);
    setRoofStyle("gable");
  }

  return (
    <main className="barn-configurator">
      <header className="barn-header">
        <div className="barn-header-left">
          <Link
            to="/"
            className="barn-back"
          >
            <ArrowLeft size={17} />
            Back
          </Link>

          <div className="barn-header-divider" />

          <div>
            <p className="barn-eyebrow">
              Architectural Design Studio
            </p>
            <h1 className="barn-page-title">
              Agricultural Barn / Custom Design
            </h1>
          </div>
        </div>

        <button
          onClick={reset}
          className="barn-reset"
        >
          <RotateCcw size={15} />
          Reset Design
        </button>
      </header>

      <div className="barn-layout">
        {/* INTERACTIVE 3D VIEWER */}
        <section className="barn-viewer">
          <Canvas
            shadows
            camera={{
              position: [20, 15, 23],
              fov: 43,
              near: 0.1,
              far: 150,
            }}
          >
            <color attach="background" args={["#e8eee7"]} />

            <ambientLight intensity={1.2} />

            <directionalLight
              position={[12, 18, 10]}
              intensity={2.2}
              castShadow
              shadow-mapSize={[2048, 2048]}
            />

            <Environment preset="city" />

            <EditableBuilding
              width={width}
              length={length}
              height={height}
              color={finish.color}
              roofStyle={roofStyle}
            />

            <gridHelper
              args={[80, 40, "#b8c8bb", "#d7e2d8"]}
              position={[0, -0.25, 0]}
            />

            <OrbitControls
              makeDefault
              enableDamping
              minDistance={8}
              maxDistance={75}
              maxPolarAngle={Math.PI / 2.06}
            />
          </Canvas>

          <div className="barn-viewer-label">
            <p className="barn-viewer-eyebrow">
              Interactive 3D Preview
            </p>
            <p className="barn-viewer-instructions">
              Drag to rotate · Scroll to zoom
            </p>
          </div>

          <div className="barn-footprint">
            <p className="barn-footprint-label">
              Building Footprint
            </p>
            <p className="barn-footprint-number">
              {area.toLocaleString()} sq ft
            </p>
          </div>
        </section>

        {/* CUSTOMER CONTROLS */}
        <aside className="barn-sidebar">
          <div className="barn-section-label">
            <SlidersHorizontal size={17} />
            <span className="text-xs font-bold uppercase tracking-[0.19em]">
              Customize Your Building
            </span>
          </div>

          <h2 className="barn-sidebar-title">
            Make it your own.
          </h2>

          <p className="barn-sidebar-description">
            Adjust the dimensions and exterior finish of your
            agricultural building. Changes appear instantly.
          </p>

          <div className="barn-controls">
            {[
              {
                label: "Building Width",
                value: width,
                min: 20,
                max: 80,
                step: 5,
                setter: setWidth,
              },
              {
                label: "Building Length",
                value: length,
                min: 30,
                max: 120,
                step: 5,
                setter: setLength,
              },
              {
                label: "Wall Height",
                value: height,
                min: 8,
                max: 24,
                step: 2,
                setter: setHeight,
              },
            ].map((control) => (
              <div key={control.label}>
                <div className="barn-control-heading">
                  <label className="barn-control-label">
                    {control.label}
                  </label>

                  <span className="barn-control-value">
                    <Ruler size={13} />
                    {control.value} ft
                  </span>
                </div>

                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={control.value}
                  onChange={(event) =>
                    control.setter(Number(event.target.value))
                  }
                  className="barn-range"
                />
              </div>
            ))}
          </div>

          <div className="barn-roof-section">
            <p className="barn-finish-title">Roof Architecture</p>
            <div className="barn-roof-options">
              {([
                { id: "gable", name: "Modern Gable", note: "Clean dual-pitch roof" },
                { id: "gambrel", name: "Classic Gambrel", note: "Traditional barn profile" },
              ] as const).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={roofStyle === option.id}
                  onClick={() => setRoofStyle(option.id)}
                  className={`barn-roof-option ${
                    roofStyle === option.id ? "selected" : ""
                  }`}
                >
                  <span className="barn-roof-option-name">{option.name}</span>
                  <span className="barn-roof-option-note">{option.note}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="barn-finish-section">
            <p className="barn-control-label">
              Exterior Material
            </p>

            <div className="barn-finishes">
              {finishes.map((option) => {
                const selected = finish.name === option.name;

                return (
                  <button
                    key={option.name}
                    onClick={() => setFinish(option)}
                    className={`barn-finish-option ${selected ? "selected" : ""}`}
                  >
                    <div
                      className="barn-finish-swatch"
                      style={{ backgroundColor: option.color }}
                    />

                    <span className="barn-finish-name">
                      {option.name}
                    </span>

                    {selected && (
                      <Check
                        size={15}
                        className="barn-finish-check"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="barn-summary">
            <p className="barn-summary-label">
              Conceptual Floor Area
            </p>

            <p className="barn-summary-value">
              {area.toLocaleString()} sq ft
            </p>

            <p className="barn-summary-note">
              Concept visualization only. Structural feasibility
              and construction documentation require professional
              verification.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
