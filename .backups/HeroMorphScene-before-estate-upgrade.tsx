import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

type SceneType = "estate" | "barn" | "farm";

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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    return () => setVisible(false);
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;

    group.current.rotation.y += delta * 0.07;

    const targetScale = visible ? 1 : 0.85;

    group.current.scale.lerp(
      new THREE.Vector3(
        targetScale,
        targetScale,
        targetScale
      ),
      Math.min(delta * 3, 1)
    );

    group.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.7) * 0.06;
  });

  return (
    <group ref={group}>
      {type === "estate" && <LuxuryEstate />}
      {type === "barn" && <AgriculturalBarn />}
      {type === "farm" && <VerticalFarm />}
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
  return (
    <group>
      <Box position={[0, 0.1, 0]} size={[7, 0.25, 5]} color="#d9d0c2" />
      <Box position={[-1.2, 1.2, 0]} size={[4.4, 2.3, 3.3]} color="#e5ddcf" />
      <Box position={[1.5, 1.6, -0.5]} size={[3.5, 3.1, 3.8]} color="#b8a28b" />

      <Box position={[-1.2, 2.5, 0]} size={[4.8, 0.25, 3.7]} color="#8f715a" />
      <Box position={[1.5, 3.3, -0.5]} size={[3.9, 0.25, 4.2]} color="#695b4e" />

      <Glass position={[-1.2, 1.2, 1.68]} size={[3.6, 1.8, 0.05]} />
      <Glass position={[1.5, 1.65, 1.43]} size={[2.9, 2.4, 0.05]} />
      <Glass position={[3.27, 1.65, -0.5]} size={[0.05, 2.4, 2.8]} />

      {[-2.5, -1.3, -0.1].map((x) => (
        <Box
          key={x}
          position={[x, 1.15, 1.72]}
          size={[0.07, 1.9, 0.08]}
          color="#685b4b"
        />
      ))}

      <Box position={[0, 0.15, 3.0]} size={[5.6, 0.13, 1.2]} color="#c4b09a" />
      <Box position={[0, 0.22, 3.5]} size={[4.7, 0.04, 0.6]} color="#70aeb6" />
    </group>
  );
}

function AgriculturalBarn() {
  return (
    <group>
      <Box position={[0, 0.1, 0]} size={[7, 0.2, 5]} color="#d3c4a8" />
      <Box position={[0, 1.5, 0]} size={[5.5, 3, 3.8]} color="#b98157" />

      {/* Gabled roof geometry */}
      <mesh position={[0, 3, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <coneGeometry args={[3.4, 1.7, 4]} />
        <meshStandardMaterial color="#5e716a" roughness={0.75} />
      </mesh>

      <Box position={[0, 1.3, 1.96]} size={[2.2, 2.5, 0.08]} color="#614c3f" />
      <Box position={[-1.9, 1.7, 1.97]} size={[0.9, 1.2, 0.06]} color="#a5c9c4" />
      <Box position={[1.9, 1.7, 1.97]} size={[0.9, 1.2, 0.06]} color="#a5c9c4" />

      {[-2.5, -1.5, 1.5, 2.5].map((x) => (
        <Box
          key={x}
          position={[x, 1.5, 2.02]}
          size={[0.13, 3.0, 0.1]}
          color="#785a43"
        />
      ))}
    </group>
  );
}

function VerticalFarm() {
  return (
    <group>
      <Box position={[0, 0.1, 0]} size={[7, 0.2, 5]} color="#d7ddd0" />

      {[-2.8, -1.4, 0, 1.4, 2.8].map((x) => (
        <Box
          key={`pillar-${x}`}
          position={[x, 2.1, 0]}
          size={[0.09, 4.2, 3.8]}
          color="#8baca8"
          metalness={0.55}
        />
      ))}

      {[0.7, 1.65, 2.6, 3.55].map((y) => (
        <group key={`level-${y}`}>
          <Box
            position={[0, y, 0]}
            size={[6.2, 0.1, 3.5]}
            color="#819d8c"
            metalness={0.35}
          />

          {[-2.1, -0.7, 0.7, 2.1].map((x) => (
            <group key={x}>
              <Box
                position={[x, y + 0.13, 0]}
                size={[0.9, 0.13, 2.7]}
                color="#6b493b"
              />

              {[-0.9, 0, 0.9].map((z) => (
                <mesh key={z} position={[x, y + 0.34, z]}>
                  <sphereGeometry args={[0.27, 12, 8]} />
                  <meshStandardMaterial color="#4b9163" roughness={0.9} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}

      <Box position={[0, 4.4, 0]} size={[6.4, 0.12, 4]} color="#b7d1c9" />
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
        shadows
        dpr={[1, 1.6]}
        camera={{
          position: [9, 6.5, 11],
          fov: 38,
          near: 0.1,
          far: 100,
        }}
      >
        <color attach="background" args={["#f4f5ec"]} />

        <ambientLight intensity={1.5} />
        <directionalLight
          position={[8, 12, 7]}
          intensity={2.4}
          castShadow
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
