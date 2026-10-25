import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import RealisticBarn from "../architecture/RealisticBarn";
import ArchitecturalLandscape from "../architecture/ArchitecturalLandscape";
import TimberFacade from "../architecture/TimberFacade";
import ArchitecturalGLB from "./ArchitecturalGLB";
import {
  architectureAssets,
  type ArchitectureScene,
} from "./architectureAssets";

type SceneType = ArchitectureScene;

export const heroScenes: SceneType[] = [
  "estate",
  "barn",
  "farm",
];

function Structure({
  type,
}: {
  type: SceneType;
}) {
  const group = useRef<THREE.Group>(null);
  const [modelAvailable, setModelAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkModel = async () => {
      const url = architectureAssets[type].modelUrl;

      try {
        const response = await fetch(url, {
          method: "HEAD",
        });

        if (!cancelled) {
          setModelAvailable(
            response.ok &&
            (response.headers.get("content-type") || "")
              .includes("model/")
          );
        }
      } catch {
        if (!cancelled) setModelAvailable(false);
      }
    };

    setModelAvailable(false);
    void checkModel();

    return () => {
      cancelled = true;
    };
  }, [type]);

  useFrame((state, delta) => {
    if (!group.current) return;

    group.current.rotation.y += delta * 0.07;
    group.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.7) * 0.06;
  });

  const asset = architectureAssets[type];

  return (
    <group ref={group}>
      <ArchitecturalLandscape theme={type} />
      {modelAvailable ? (
        <ArchitecturalGLB
          url={asset.modelUrl}
          targetSize={asset.targetSize}
        />
      ) : (
        <>
          {type === "estate" && <LuxuryEstate />}
          {type === "barn" && <RealisticBarn />}
          {type === "farm" && <VerticalFarm />}
        </>
      )}
    </group>
  );
}

function Box({
  position,
  size,
  color,
  metalness = 0,
  roughness = 0.65,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  metalness?: number;
  roughness?: number;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
      />
    </mesh>
  );
}

function Glass({
  position,
  size,
}: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshPhysicalMaterial
        color="#9cc5ca"
        transparent
        opacity={0.38}
        metalness={0.12}
        roughness={0.08}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function LuxuryEstate() {
  const wood = "#a87954";
  const stone = "#c6bbae";
  const concrete = "#d8d5cc";
  const bronze = "#66594d";
  const darkMetal = "#414a47";

  return (
    <group>
      {/* LANDSCAPED ARCHITECTURAL BASE */}
      <Box
        position={[0, -0.08, 0]}
        size={[9.5, 0.22, 7.2]}
        color="#d5d8c7"
      />

      <Box
        position={[0, 0.08, 0.4]}
        size={[7.5, 0.16, 5.2]}
        color={concrete}
      />

      {/* MAIN RESIDENTIAL VOLUMES */}
      <Box
        position={[-1.35, 1.25, -0.35]}
        size={[4.6, 2.5, 3.7]}
        color={stone}
      />

      <Box
        position={[1.65, 1.2, -0.7]}
        size={[2.8, 2.4, 3.1]}
        color="#eee7dc"
      />

      {/* UPPER CANTILEVERED FLOOR */}
      <Box
        position={[0.7, 3.35, -0.55]}
        size={[5.0, 2.1, 3.75]}
        color={wood}
      />

      {/* REAL PROCEDURAL TIMBER CLADDING */}

      {/* UPPER FRONT FACADE — SIDING AROUND GLAZING */}

      {/* Horizontal timber below the window */}
      <TimberFacade
        position={[0.7, 2.52, 1.35]}
        width={4.85}
        height={0.34}
        boardHeight={0.085}
        depth={0.07}
        color="#a77d5a"
      />

      {/* Horizontal timber above the window */}
      <TimberFacade
        position={[0.7, 4.17, 1.35]}
        width={4.85}
        height={0.34}
        boardHeight={0.085}
        depth={0.07}
        color="#a77d5a"
      />

      {/* Left solid wall section */}
      <TimberFacade
        position={[-1.53, 3.35, 1.35]}
        width={0.39}
        height={1.35}
        boardHeight={0.1}
        depth={0.07}
        color="#a77d5a"
      />

      {/* Right solid wall section */}
      <TimberFacade
        position={[2.93, 3.35, 1.35]}
        width={0.39}
        height={1.35}
        boardHeight={0.1}
        depth={0.07}
        color="#a77d5a"
      />

      {/* Dark architectural glazing frame */}
      <Box
        position={[0.7, 2.56, 1.405]}
        size={[4.3, 0.055, 0.075]}
        color="#394842"
        metalness={0.55}
      />

      <Box
        position={[0.7, 4.10, 1.405]}
        size={[4.3, 0.055, 0.075]}
        color="#394842"
        metalness={0.55}
      />

      {/* Horizontal window mullion */}
      <Box
        position={[0.7, 3.35, 1.43]}
        size={[4.25, 0.045, 0.07]}
        color="#394842"
        metalness={0.55}
      />

      {/* Upper rear facade */}
      <TimberFacade
        position={[0.7, 3.35, -2.46]}
        width={4.85}
        height={2.02}
        boardHeight={0.115}
        depth={0.055}
        color="#9d7353"
      />

      {/* Side facade */}
      <group
        position={[3.22, 3.35, -0.55]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <TimberFacade
          position={[0, 0, 0]}
          width={3.65}
          height={2.02}
          boardHeight={0.115}
          color="#a77d5a"
        />
      </group>

      {/* HORIZONTAL ROOFLINES */}
      <Box
        position={[-1.35, 2.57, -0.35]}
        size={[5.1, 0.19, 4.05]}
        color={darkMetal}
        metalness={0.35}
      />

      <Box
        position={[0.7, 4.5, -0.55]}
        size={[5.45, 0.22, 4.15]}
        color={darkMetal}
        metalness={0.45}
      />

      {/* LARGE GROUND FLOOR GLASS FACADE */}
      <Glass
        position={[-1.35, 1.25, 1.53]}
        size={[4.05, 2.15, 0.045]}
      />

      {/* VERTICAL GLAZING MULLIONS */}
      {[-3, -1.9, -0.8, 0.25].map((x) => (
        <Box
          key={`ground-frame-${x}`}
          position={[x, 1.25, 1.57]}
          size={[0.065, 2.3, 0.085]}
          color={darkMetal}
          metalness={0.5}
        />
      ))}

      {/* UPPER PANORAMIC WINDOWS */}
      <Glass
        position={[0.7, 3.3, 1.35]}
        size={[4.25, 1.5, 0.045]}
      />

      {[-1.2, 0, 1.2, 2.4].map((x) => (
        <Box
          key={`upper-frame-${x}`}
          position={[x, 3.3, 1.39]}
          size={[0.055, 1.55, 0.09]}
          color={darkMetal}
          metalness={0.55}
        />
      ))}

      {/* WOOD ARCHITECTURAL FINS */}
      {[0, 0.21, 0.42, 0.63, 0.84].map((n) => (
        <Box
          key={`wood-fin-${n}`}
          position={[3.06, 3.25, -1.75 + n * 1.3]}
          size={[0.09, 1.85, 0.095]}
          color={bronze}
        />
      ))}

      {/* SIDE WALL STONE ACCENT */}
      <Box
        position={[3.14, 1.25, -0.7]}
        size={[0.2, 2.4, 2.7]}
        color="#a89c8c"
      />

      {/* MAIN ENTRANCE DOOR */}
      <Box
        position={[1.6, 1.04, 0.91]}
        size={[0.95, 2.05, 0.09]}
        color={wood}
      />

      <Box
        position={[1.97, 1.08, 0.99]}
        size={[0.045, 0.42, 0.065]}
        color="#d7c29e"
        metalness={0.8}
      />

      {/* TERRACE */}
      <Box
        position={[-0.55, 0.19, 2.75]}
        size={[6.3, 0.16, 2.1]}
        color="#bca48c"
      />

      {/* TERRACE DECK LINES */}
      {Array.from({ length: 12 }, (_, i) => (
        <Box
          key={`deck-${i}`}
          position={[-3.4 + i * 0.52, 0.285, 2.75]}
          size={[0.025, 0.012, 2.0]}
          color="#796d5c"
        />
      ))}

      {/* INFINITY-STYLE POOL */}
      <Box
        position={[-0.6, 0.09, 4.2]}
        size={[5.9, 0.15, 1.1]}
        color="#f1f0e7"
      />

      <Box
        position={[-0.6, 0.18, 4.2]}
        size={[5.55, 0.025, 0.88]}
        color="#5babb5"
        metalness={0.3}
        roughness={0.12}
      />

      {/* OUTDOOR SOFA */}
      <Box
        position={[-2.35, 0.51, 2.65]}
        size={[1.6, 0.42, 0.7]}
        color="#ddd4c4"
      />

      <Box
        position={[-2.35, 0.82, 2.98]}
        size={[1.6, 0.58, 0.16]}
        color="#d8d0c3"
      />

      {/* COFFEE TABLE */}
      <Box
        position={[-0.25, 0.48, 2.65]}
        size={[0.85, 0.11, 0.65]}
        color="#7d6b59"
      />

      {/* FRONT STEPS */}
      {[0, 1, 2].map((i) => (
        <Box
          key={`step-${i}`}
          position={[2.35, 0.11 - i * 0.04, 2.18 + i * 0.3]}
          size={[1.3, 0.1, 0.32]}
          color="#c9c5b9"
        />
      ))}

      {/* LANDSCAPING */}
      {[
        [-3.7, 0, 2.7],
        [3.8, 0, 2.6],
        [-4, 0, -1.7],
        [4.1, 0, -2.1],
      ].map(([x, y, z], i) => (
        <group key={`tree-${i}`} position={[x, y, z]}>
          <mesh position={[0, 0.65, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.09, 1.3, 7]} />
            <meshStandardMaterial color="#76634e" />
          </mesh>

          <mesh position={[0, 1.55, 0]} castShadow>
            <sphereGeometry args={[0.53, 12, 9]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#70946c" : "#8ca77c"}
              roughness={0.95}
            />
          </mesh>
        </group>
      ))}

      {/* SMALL GARDEN PLANTS */}
      {[-3.7, -2.8, 2.9, 3.7].map((x) => (
        <mesh
          key={`plant-${x}`}
          position={[x, 0.17, 3.0]}
          castShadow
        >
          <sphereGeometry args={[0.2, 10, 7]} />
          <meshStandardMaterial color="#709b73" />
        </mesh>
      ))}
    </group>
  );
}

function VerticalFarm() {
  const levels = [0.65, 1.65, 2.65, 3.65];

  return (
    <group>
      {/* REINFORCED CONCRETE BASE */}
      <Box
        position={[0, 0.05, 0]}
        size={[8.5, 0.22, 6.6]}
        color="#c6c9ba"
      />

      {/* GREENHOUSE FRAME */}
      {[-3.7, 3.7].map((x) =>
        [-2.55, 2.55].map((z) => (
          <Box
            key={`${x}-${z}`}
            position={[x, 2.4, z]}
            size={[0.13, 4.8, 0.13]}
            color="#536c69"
            metalness={0.65}
          />
        ))
      )}

      {/* FRONT VERTICAL MULLIONS */}
      {[-2.4, -1.2, 0, 1.2, 2.4].map((x) => (
        <Box
          key={x}
          position={[x, 2.4, 2.56]}
          size={[0.07, 4.75, 0.08]}
          color="#526c69"
          metalness={0.55}
        />
      ))}

      {/* ROOF / STRUCTURAL BEAMS */}
      <Box
        position={[0, 4.85, 0]}
        size={[7.7, 0.16, 5.4]}
        color="#e2ebe4"
      />

      {[-2.5, 0, 2.5].map((z) => (
        <Box
          key={z}
          position={[0, 4.75, z]}
          size={[7.7, 0.12, 0.13]}
          color="#526c69"
          metalness={0.6}
        />
      ))}

      {/* TRANSPARENT FRONT AND SIDE GLAZING */}
      <Glass
        position={[0, 2.35, 2.53]}
        size={[7.35, 4.55, 0.035]}
      />
      <Glass
        position={[-3.68, 2.35, 0]}
        size={[0.035, 4.55, 5.1]}
      />
      <Glass
        position={[3.68, 2.35, 0]}
        size={[0.035, 4.55, 5.1]}
      />

      {/* FOUR-TIER HYDROPONIC RACKS */}
      {[-2.35, 0, 2.35].map((x, rack) => (
        <group key={rack} position={[x, 0, 0]}>
          {[-1.9, 1.9].map((z) => (
            <Box
              key={z}
              position={[0, 2.25, z]}
              size={[0.075, 4.35, 0.075]}
              color="#647a78"
              metalness={0.75}
            />
          ))}

          {levels.map((y, level) => (
            <group key={level}>
              {/* GROWING TRAY */}
              <Box
                position={[0, y, 0]}
                size={[1.65, 0.12, 3.9]}
                color="#e6eae6"
                metalness={0.25}
              />

              {/* NUTRIENT CHANNELS */}
              {[-0.46, 0, 0.46].map((channel) => (
                <Box
                  key={channel}
                  position={[channel, y + 0.1, 0]}
                  size={[0.22, 0.075, 3.65]}
                  color="#b1c7bd"
                  metalness={0.15}
                />
              ))}

              {/* LEAFY CROPS */}
              {Array.from({ length: 8 }, (_, i) => {
                const z = -1.6 + i * 0.46;

                return [-0.46, 0, 0.46].map((offset, j) => (
                  <group
                    key={`${i}-${j}`}
                    position={[offset, y + 0.26, z]}
                  >
                    <mesh
                      castShadow
                      rotation={[0.15, 0, 0.15]}
                    >
                      <icosahedronGeometry args={[0.17, 1]} />
                      <meshStandardMaterial
                        color={
                          (i + j) % 2
                            ? "#67a34d"
                            : "#80b95c"
                        }
                        roughness={0.88}
                      />
                    </mesh>

                    <mesh
                      position={[0.09, 0.05, -0.02]}
                      castShadow
                    >
                      <icosahedronGeometry args={[0.11, 1]} />
                      <meshStandardMaterial
                        color="#4c8a43"
                        roughness={0.9}
                      />
                    </mesh>
                  </group>
                ));
              })}

              {/* GROW LIGHT HOUSING */}
              <Box
                position={[0, y + 0.62, 0]}
                size={[1.25, 0.055, 3.5]}
                color="#f3e4f0"
                metalness={0.3}
              />

              <Box
                position={[0, y + 0.585, 0]}
                size={[0.95, 0.025, 3.35]}
                color="#e9a9d8"
              />
            </group>
          ))}
        </group>
      ))}

      {/* WATER AND NUTRIENT TANKS */}
      {[-2.9, -2.1].map((z, i) => (
        <mesh
          key={i}
          position={[4.35, 0.85, z]}
          castShadow
        >
          <cylinderGeometry args={[0.36, 0.4, 1.65, 16]} />
          <meshStandardMaterial
            color="#9daeb4"
            metalness={0.35}
            roughness={0.45}
          />
        </mesh>
      ))}

      {/* EXTERNAL UTILITY PLATFORM */}
      <Box
        position={[4.2, 0.05, -2.45]}
        size={[1.55, 0.18, 1.5]}
        color="#c4c9bf"
      />

      {/* WALKWAY / ENTRY */}
      <Box
        position={[0, 0.04, 3.45]}
        size={[2.3, 0.055, 1.8]}
        color="#d4d0c4"
      />
    </group>
  );
}

function AnimatedScene({
  scene,
}: {
  scene: SceneType;
}) {
  return (
    <group position={[0, -1.1, 0]}>
      <Structure key={scene} type={scene} />
    </group>
  );
}

export default function HeroMorphScene({
  scene,
}: {
  scene: SceneType;
}) {
  return (
    <div className="hero-morph-canvas">
      <Canvas
        shadows="soft"
        dpr={[1, 1.6]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
        camera={{
          position: [9, 6.5, 11],
          fov: 38,
          near: 0.1,
          far: 100,
        }}
      >
        <color attach="background" args={["#f4f5ec"]} />

        <ambientLight intensity={0.7} />

        <hemisphereLight
          args={["#fffaf0", "#b6c7b4", 1.15]}
        />

        <directionalLight
          position={[9, 13, 8]}
          intensity={2.1}
          color="#fff3dc"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
          shadow-camera-near={0.5}
          shadow-camera-far={45}
          shadow-bias={-0.0002}
        />

        <directionalLight
          position={[-7, 5, -5]}
          intensity={0.55}
          color="#d7ecff"
        />

        <Suspense fallback={null}>
          <AnimatedScene scene={scene} />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableDamping
          autoRotate={false}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2.15}
        />
      </Canvas>
    </div>
  );
}
