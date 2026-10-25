import FluidToolkitPanel from "../../components/configurator/FluidToolkitPanel";
import DesignToolkit, {
  type ToolkitTab,
} from "../../components/configurator/DesignToolkit";
import "../../styles/barn-configurator.css";
import { useRef, useState } from "react";
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
import BarnViewToolbar, {
  type BarnView,
} from "../../components/configurator/BarnViewToolbar";
import BarnViewController from "../../components/configurator/BarnViewController";
import TrackpadOrbit from "../../components/configurator/TrackpadOrbit";
import BarnCameraController from "../../components/configurator/BarnCameraController";
import BarnWalkthrough, {
  type WalkDirection,
} from "../../components/configurator/BarnWalkthrough";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

const finishes = [
  { name: "Natural Cedar", color: "#a97956" },
  { name: "Classic Barn Red", color: "#a3483f" },
  { name: "Charcoal", color: "#42514d" },
  { name: "Warm Sandstone", color: "#c5aa89" },
];

export default function BarnConfigurator() {
  const [activeTool, setActiveTool] =
    useState<ToolkitTab>("dimensions");

  const [width, setWidth] = useState(40);
  const [length, setLength] = useState(60);
  const [height, setHeight] = useState(14);
  const [finish, setFinish] = useState(finishes[0]);
  const [roofStyle, setRoofStyle] = useState<"gable" | "gambrel">("gable");
  const [doorSize, setDoorSize] =
    useState<"standard" | "wide" | "oversized">("standard");
  const [activeView, setActiveView] = useState<BarnView>("overview");
  const [viewRevision, setViewRevision] = useState(0);
  const [zoomRevision, setZoomRevision] = useState(0);
  const [zoomDirection, setZoomDirection] =
    useState<"in" | "out">("in");

  function selectView(view: BarnView) {
    setInside(false);
    setWalkReady(false);
    setActiveView(view);
    setViewRevision((value) => value + 1);
  }

  function zoom(direction: "in" | "out") {
    setZoomDirection(direction);
    setZoomRevision((value) => value + 1);
  }

  const [inside, setInside] = useState(false);
  const [walkReady, setWalkReady] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);

  const walkInput = useRef<Record<WalkDirection, boolean>>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });


  const orbitRef = useRef<OrbitControlsImpl>(null);
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [windowCount, setWindowCount] = useState<0 | 2 | 4 | 6>(4);
  const [windowStyle, setWindowStyle] =
    useState<"traditional" | "modern">("traditional");

  const area = width * length;

  function reset() {
    setWidth(40);
    setLength(60);
    setHeight(14);
    setFinish(finishes[0]);
    setRoofStyle("gable");
    setDoorSize("standard");
    setDoorsOpen(false);
    setInside(false);
    setWindowCount(4);
    setWindowStyle("traditional");
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
              fov: 72,
              near: 0.03,
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
              dollhouse={activeView === "dollhouse"}
              doorSize={doorSize}
              doorsOpen={doorsOpen}
              windowCount={windowCount}
              windowStyle={windowStyle}
            />

            <gridHelper
              args={[80, 40, "#b8c8bb", "#d7e2d8"]}
              position={[0, -0.25, 0]}
            />

            {false && <BarnWalkthrough
              active={inside && walkReady}
              width={width}
              length={length}
              input={walkInput}
            />}

            {false && <BarnCameraController
              inside={inside}
              width={width}
              length={length}
              controls={orbitRef}
              resetSignal={resetSignal}
              onTransitionComplete={() => {
                if (inside) setWalkReady(true);
              }}
            />}

            <TrackpadOrbit
              controls={orbitRef}
              enabled={!inside}
            />

            <BarnViewController
              view={activeView}
              revision={viewRevision}
              width={width}
              length={length}
              height={height}
              zoomRevision={zoomRevision}
              zoomDirection={zoomDirection}
              controls={orbitRef}
            />

            <OrbitControls
              ref={orbitRef}
              enabled
              makeDefault
              enableDamping
              minDistance={inside ? 0.3 : 8}
              maxDistance={75}
              maxPolarAngle={Math.PI / 2.06}
            />
          </Canvas>

          <BarnViewToolbar
            activeView={activeView}
            onViewChange={selectView}
            onZoom={zoom}
          />

          <div className="barn-viewer-label">
            <p className="barn-viewer-eyebrow">
              Interactive 3D Preview
            </p>
            <p className="barn-viewer-instructions">
              Drag to rotate · Scroll to zoom
            </p>
          </div>

          {inside && (
            <div className="barn-walk-controls">
              <div className="barn-walk-title">
                Walk Through Your Design
              </div>

              <div className="barn-walk-pad">
                {([
                  ["left", "←"],
                  ["forward", "↑"],
                  ["backward", "↓"],
                  ["right", "→"],
                ] as [WalkDirection, string][]).map(([direction, symbol]) => (
                  <button
                    key={direction}
                    type="button"
                    aria-label={`Move ${direction}`}
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId);
                      walkInput.current[direction] = true;
                    }}
                    onPointerUp={() => {
                      walkInput.current[direction] = false;
                    }}
                    onPointerCancel={() => {
                      walkInput.current[direction] = false;
                    }}
                    onLostPointerCapture={() => {
                      walkInput.current[direction] = false;
                    }}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>
          )}

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
        <aside
          className="barn-sidebar"
          data-tool={activeTool}
        >
          <DesignToolkit
            active={activeTool}
            onChange={setActiveTool}
          />
          <FluidToolkitPanel activeKey={activeTool}>
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

          <div className="barn-camera-reset">
            <button
              type="button"
              className="barn-reset"
              onClick={() => {
                setWalkReady(false);
                setInside(false);
                setResetSignal((value) => value + 1);
              }}
            >
              Reset Camera View
            </button>
          </div>

          <div className="barn-interior-action">
            <p className="barn-finish-title">Interior Exploration</p>

            <button
              type="button"
              className="barn-door-toggle"
              onClick={() => {
                setWalkReady(false);
                if (!inside) setDoorsOpen(true);
                setInside((value) => !value);
              }}
            >
              {inside ? "Exit Interior" : "Enter Building"}
            </button>

            <p className="barn-door-description">
              {inside
                ? "Return to the exterior architectural view."
                : "Open the doors and move inside your design."}
            </p>
          </div>

          <div className="barn-door-action">
            <p className="barn-finish-title">Explore Your Building</p>
            <button
              type="button"
              className="barn-door-toggle"
              aria-pressed={doorsOpen}
              onClick={() => setDoorsOpen((value) => !value)}
            >
              {doorsOpen ? "Close Barn Doors" : "Open Barn Doors"}
            </button>
            <p className="barn-door-description">
              Open the entrance to view the interior.
            </p>
          </div>

          <div className="barn-openings-section">
            <p className="barn-finish-title">Doors & Windows</p>

            <label className="barn-opening-label" htmlFor="barn-door-size">
              Barn Entrance
            </label>
            <select
              id="barn-door-size"
              className="barn-opening-select"
              value={doorSize}
              onChange={(e) =>
                setDoorSize(
                  e.target.value as "standard" | "wide" | "oversized"
                )
              }
            >
              <option value="standard">Standard entrance</option>
              <option value="wide">Wide entrance</option>
              <option value="oversized">Oversized entrance</option>
            </select>

            <label className="barn-opening-label" htmlFor="barn-window-count">
              Side Windows
            </label>
            <select
              id="barn-window-count"
              className="barn-opening-select"
              value={windowCount}
              onChange={(e) =>
                setWindowCount(Number(e.target.value) as 0 | 2 | 4 | 6)
              }
            >
              <option value={0}>No windows</option>
              <option value={2}>2 windows</option>
              <option value={4}>4 windows</option>
              <option value={6}>6 windows</option>
            </select>

            <label className="barn-opening-label" htmlFor="barn-window-style">
              Window Architecture
            </label>
            <select
              id="barn-window-style"
              className="barn-opening-select"
              value={windowStyle}
              onChange={(e) =>
                setWindowStyle(
                  e.target.value as "traditional" | "modern"
                )
              }
            >
              <option value="traditional">Traditional framed</option>
              <option value="modern">Modern minimal</option>
            </select>
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
          </FluidToolkitPanel>
        </aside>
      </div>
    </main>
  );
}
