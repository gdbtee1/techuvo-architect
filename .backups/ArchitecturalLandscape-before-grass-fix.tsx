import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Theme = "estate" | "barn" | "farm";

export default function ArchitecturalLandscape({
  theme,
}: {
  theme: Theme;
}) {
  const grass = useRef<THREE.InstancedMesh>(null);

  const colors = useMemo(() => ({
    estate: "#819f71",
    barn: "#779a61",
    farm: "#8ca994",
  }), []);

  useEffect(() => {
    if (!grass.current) return;

    const dummy = new THREE.Object3D();
    const palette = [
      new THREE.Color("#5b8e49"),
      new THREE.Color("#74a65d"),
      new THREE.Color("#95b76e"),
    ];

    for (let i = 0; i < 750; i++) {
      // Deterministic placement keeps the landscape stable
      // between renders.
      const a = Math.sin(i * 127.1) * 43758.5453;
      const b = Math.sin(i * 311.7) * 96321.1234;

      const x = ((a - Math.floor(a)) - 0.5) * 12.7;
      const z = ((b - Math.floor(b)) - 0.5) * 10.7;

      dummy.position.set(x, 0.12, z);

      const height = 0.12 + (i % 7) * 0.018;
      dummy.scale.set(0.035, height, 0.035);
      dummy.rotation.set(0, i * 0.5, 0);

      dummy.updateMatrix();
      grass.current.setMatrixAt(i, dummy.matrix);
      grass.current.setColorAt(i, palette[i % palette.length]);
    }

    grass.current.instanceMatrix.needsUpdate = true;
    if (grass.current.instanceColor) {
      grass.current.instanceColor.needsUpdate = true;
    }
    grass.current.computeBoundingSphere();
  }, []);

  const treePositions: [number, number, number][] =
    theme === "estate"
      ? [
          [-5.3, 0, -3.8],
          [5.1, 0, -3.9],
          [-5.4, 0, 3.5],
          [5.4, 0, 3.3],
        ]
      : theme === "barn"
      ? [
          [-5.2, 0, -4],
          [5.4, 0, -4],
          [-5.2, 0, 3.6],
        ]
      : [
          [-5.4, 0, -3.8],
          [5.4, 0, -3.8],
        ];

  return (
    <group>
      <mesh position={[0, -0.16, 0]} receiveShadow>
        <boxGeometry args={[13.5, 0.24, 11.5]} />
        <meshStandardMaterial
          color={colors[theme]}
          roughness={1}
        />
      </mesh>

      <instancedMesh
        ref={grass}
        args={[undefined, undefined, 750]}
        castShadow={false}
        receiveShadow={false}
      >
        <coneGeometry args={[1, 1, 3]} />
        <meshStandardMaterial
          color="#ffffff"
          vertexColors
          roughness={1}
        />
      </instancedMesh>

      {treePositions.map((position, i) => (
        <group
          key={i}
          position={position}
          scale={0.85 + (i % 3) * 0.15}
        >
          <mesh position={[0, 0.65, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.14, 1.3, 8]} />
            <meshStandardMaterial
              color="#76583e"
              roughness={1}
            />
          </mesh>

          <mesh position={[0, 1.7, 0]} castShadow>
            <icosahedronGeometry args={[0.65, 1]} />
            <meshStandardMaterial
              color={i % 2 ? "#668b52" : "#7fa56b"}
              roughness={0.95}
            />
          </mesh>

          <mesh position={[0.3, 1.5, 0.05]} castShadow>
            <icosahedronGeometry args={[0.43, 1]} />
            <meshStandardMaterial
              color="#61894f"
              roughness={0.95}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
