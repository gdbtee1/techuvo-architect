import "./building-generator.css";
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import UniversalCamera, {
  type CameraView,
} from "../../components/buildings/UniversalCamera";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Layers3,
  Ruler,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";

import {
  createBuildingProject,
  type BuildingCategory,
} from "../../engine/buildings/buildingTypes";

import UniversalBuilding3D from "../../components/buildings/UniversalBuilding3D";

const categories: {
  id: BuildingCategory;
  label: string;
}[] = [
  { id: "residential", label: "Residential" },
  { id: "agricultural", label: "Agricultural" },
  { id: "commercial", label: "Commercial" },
  { id: "industrial-farming", label: "Industrial Farming" },
];

export default function BuildingGenerator() {
  const [cameraView, setCameraView] =
    useState<CameraView>("perspective");
  const [resetToken, setResetToken] = useState(0);

  const [category, setCategory] =
    useState<BuildingCategory>("residential");

  const [floorCount, setFloorCount] = useState(3);
  const [width, setWidth] = useState(12);
  const [length, setLength] = useState(15);

  const [project, setProject] = useState(() =>
    createBuildingProject("residential", 3, 12, 15)
  );

  const [selectedFloor, setSelectedFloor] = useState(1);
  const [showAllFloors, setShowAllFloors] = useState(true);

  function generateBuilding() {
    const nextProject = createBuildingProject(
      category,
      floorCount,
      width,
      length
    );

    setProject(nextProject);
    setSelectedFloor(1);
    setShowAllFloors(true);
    setCameraView("perspective");
    setResetToken((value) => value + 1);
  }

  return (
    <main className="building-generator">
      <header className="generator-header">
        <Link to="/" className="generator-back">
          <ArrowLeft size={17} />
          <span>Back</span>
        </Link>

        <div className="generator-brand">
          <Building2 size={22} />
          <div>
            <strong>Architectural Generator</strong>
            <span>Universal Building Studio</span>
          </div>
        </div>

        <span className="generator-status">
          Concept Workspace
        </span>
      </header>

      <div className="generator-toolbar">
        <label>
          <span>Building type</span>
          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value as BuildingCategory
              )
            }
          >
            {categories.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Floors</span>
          <input
            type="number"
            min={1}
            max={20}
            value={floorCount}
            onChange={(event) =>
              setFloorCount(
                Math.min(
                  20,
                  Math.max(1, Number(event.target.value) || 1)
                )
              )
            }
          />
        </label>

        <label>
          <span>Width (m)</span>
          <input
            type="number"
            min={5}
            max={100}
            value={width}
            onChange={(event) =>
              setWidth(
                Math.min(
                  100,
                  Math.max(5, Number(event.target.value) || 5)
                )
              )
            }
          />
        </label>

        <label>
          <span>Length (m)</span>
          <input
            type="number"
            min={5}
            max={150}
            value={length}
            onChange={(event) =>
              setLength(
                Math.min(
                  150,
                  Math.max(5, Number(event.target.value) || 5)
                )
              )
            }
          />
        </label>

        <button
          type="button"
          className="generator-create"
          onClick={generateBuilding}
        >
          <RefreshCw size={16} />
          Generate
        </button>
      </div>

      <section className="generator-main">
        <div className="generator-viewport">
          <Canvas
            shadows
            camera={{
              position: [28, 23, 31],
              fov: 43,
              near: 0.1,
              far: 300,
            }}
          >
            <color
              attach="background"
              args={["#e9eef1"]}
            />

            <ambientLight intensity={1.15} />

            <directionalLight
              position={[18, 25, 12]}
              intensity={2.1}
              castShadow
            />

            <UniversalBuilding3D
              project={project}
              selectedFloor={selectedFloor}
              showAllFloors={showAllFloors}
              onFloorSelect={setSelectedFloor}
            />

            <gridHelper
              args={[120, 60, "#afbec7", "#d2dde3"]}
              position={[0, -0.25, 0]}
            />

            <UniversalCamera
              width={project.floors[0].width}
              length={project.floors[0].length}
              floors={project.floors.length}
              floorHeight={project.floors[0].height}
              selectedFloor={selectedFloor}
              view={cameraView}
              resetToken={resetToken}
            />
          </Canvas>

          <div className="universal-camera-toolbar">
            {(
              [
                ["perspective", "3D"],
                ["front", "Front"],
                ["side", "Side"],
                ["top", "Top"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={cameraView === id ? "active" : ""}
                onClick={() => setCameraView(id)}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setResetToken((v) => v + 1)}
              aria-label="Reset camera"
            >
              Reset
            </button>
          </div>

          <div className="generator-viewport-label">
            <Ruler size={15} />
            <span>
              {project.floors.length} floors ·{" "}
              {project.floors[0].width} ×{" "}
              {project.floors[0].length} m
            </span>
          </div>
        </div>

        <aside className="generator-floors">
          <div className="generator-floors-heading">
            <Layers3 size={17} />
            <strong>Building Levels</strong>
          </div>

          <p>
            Select a floor to inspect its individual
            architectural level.
          </p>

          <button
            type="button"
            className="generator-visibility"
            onClick={() =>
              setShowAllFloors((value) => !value)
            }
          >
            {showAllFloors ? (
              <Eye size={16} />
            ) : (
              <EyeOff size={16} />
            )}

            {showAllFloors
              ? "Show selected level only"
              : "Show all levels"}
          </button>

          <div className="generator-floor-list">
            {[...project.floors]
              .reverse()
              .map((floor) => (
                <button
                  key={floor.id}
                  type="button"
                  className={
                    selectedFloor === floor.level
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setSelectedFloor(floor.level)
                  }
                >
                  <span className="generator-floor-number">
                    {String(floor.level).padStart(2, "0")}
                  </span>

                  <span>{floor.name}</span>
                </button>
              ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
