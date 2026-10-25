import { useMemo } from "react";

type Theme = "estate" | "barn" | "farm";

export default function ArchitecturalLandscape({
  theme,
}: {
  theme: Theme;
}) {

  const groundColor = {
    estate: "#97b78a",
    barn: "#80a56c",
    farm: "#9bb69a",
  }[theme];

  const treePositions = useMemo<[number, number, number][]>(
    () =>
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
          ],
    [theme]
  );

  return (
    <group>
      {/* GREEN LANDSCAPED BASE */}
      <mesh position={[0, -0.16, 0]} receiveShadow>
        <boxGeometry args={[13.5, 0.24, 11.5]} />
        <meshStandardMaterial
          color={groundColor}
          roughness={1}
        />
      </mesh>

      {/* LANDSCAPE TREES */}
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
