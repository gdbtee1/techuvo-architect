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

  const area = width * length;

  function reset() {
    setWidth(40);
    setLength(60);
    setHeight(14);
    setFinish(finishes[0]);
  }

  return (
    <main className="min-h-screen bg-[#f5f5f0] text-[#243a31]">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d9ded4] bg-[#fafaf7] px-5 py-4 md:px-10">
        <div className="flex items-center gap-5">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold"
          >
            <ArrowLeft size={17} />
            Back
          </Link>

          <div className="h-7 w-px bg-[#d4d9d1]" />

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#799182]">
              Architectural Design Studio
            </p>
            <h1 className="text-lg font-semibold">
              Agricultural Barn / Custom Design
            </h1>
          </div>
        </div>

        <button
          onClick={reset}
          className="flex items-center gap-2 border border-[#d3d9cf] px-4 py-2 text-sm font-semibold transition hover:bg-white"
        >
          <RotateCcw size={15} />
          Reset Design
        </button>
      </header>

      <div className="grid min-h-[calc(100vh-88px)] lg:grid-cols-[minmax(0,1fr)_370px]">
        {/* INTERACTIVE 3D VIEWER */}
        <section className="relative min-h-[460px] overflow-hidden bg-[#e8eee7] lg:min-h-[740px]">
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

          <div className="pointer-events-none absolute left-5 top-5 border border-white/70 bg-white/85 px-4 py-3 backdrop-blur-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#819686]">
              Interactive 3D Preview
            </p>
            <p className="mt-1 text-sm font-medium">
              Drag to rotate · Scroll to zoom
            </p>
          </div>

          <div className="pointer-events-none absolute bottom-5 left-5 bg-[#28493b] px-5 py-3 text-white">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/65">
              Building Footprint
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {area.toLocaleString()} sq ft
            </p>
          </div>
        </section>

        {/* CUSTOMER CONTROLS */}
        <aside className="border-l border-[#d9ded4] bg-[#fafaf7] px-6 py-8 md:px-8">
          <div className="flex items-center gap-2 text-[#73907b]">
            <SlidersHorizontal size={17} />
            <span className="text-xs font-bold uppercase tracking-[0.19em]">
              Customize Your Building
            </span>
          </div>

          <h2 className="mt-5 font-serif text-4xl leading-tight">
            Make it your own.
          </h2>

          <p className="mt-3 text-sm leading-7 text-[#718278]">
            Adjust the dimensions and exterior finish of your
            agricultural building. Changes appear instantly.
          </p>

          <div className="mt-9 space-y-8">
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
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-semibold">
                    {control.label}
                  </label>

                  <span className="flex items-center gap-1 text-sm font-semibold">
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
                  className="w-full accent-[#365b47]"
                />
              </div>
            ))}
          </div>

          <div className="mt-10 border-t border-[#dce2da] pt-8">
            <p className="text-sm font-semibold">
              Exterior Material
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {finishes.map((option) => {
                const selected = finish.name === option.name;

                return (
                  <button
                    key={option.name}
                    onClick={() => setFinish(option)}
                    className={`relative border p-3 text-left transition ${
                      selected
                        ? "border-[#345741] bg-[#eef3ec]"
                        : "border-[#e0e4dd] hover:border-[#aebbb0]"
                    }`}
                  >
                    <div
                      className="mb-3 h-12 w-full"
                      style={{ backgroundColor: option.color }}
                    />

                    <span className="text-xs font-semibold">
                      {option.name}
                    </span>

                    {selected && (
                      <Check
                        size={15}
                        className="absolute right-2 top-2 text-[#345741]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-10 border-t border-[#dce2da] pt-7">
            <p className="text-xs uppercase tracking-[0.16em] text-[#819283]">
              Conceptual Floor Area
            </p>

            <p className="mt-2 font-serif text-4xl">
              {area.toLocaleString()} sq ft
            </p>

            <p className="mt-2 text-xs leading-6 text-[#87958a]">
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
