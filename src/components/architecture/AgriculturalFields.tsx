import { useMemo } from "react";

type Props = {
  position?: [number, number, number];
};

export default function AgriculturalFields({
  position = [-3.5, 0.05, -1.6],
}: Props) {
  const crops = useMemo(() => {
    const plants: {
      x: number;
      z: number;
      scale: number;
      shade: number;
    }[] = [];

    for (let row = 0; row < 5; row++) {
      for (let plant = 0; plant < 12; plant++) {
        plants.push({
          x: row * 0.48 - 0.96,
          z: plant * 0.32 - 1.76,
          scale: 0.8 + ((row + plant) % 4) * 0.09,
          shade: (row + plant) % 3,
        });
      }
    }

    return plants;
  }, []);

  const leafColors = [
    "#4f8c3f",
    "#68a64c",
    "#82b95e",
  ];

  return (
    <group position={position}>
      {/* CULTIVATED EARTH */}
      <mesh position={[0, 0.015, 0]} receiveShadow>
        <boxGeometry args={[3.2, 0.09, 4.4]} />
        <meshStandardMaterial
          color="#6c4a32"
          roughness={1}
        />
      </mesh>

      {/* RAISED SOIL ROWS */}
      {Array.from({ length: 5 }, (_, i) => (
        <group key={i}>
          <mesh
            position={[i * 0.48 - 0.96, 0.11, 0]}
            receiveShadow
          >
            <boxGeometry args={[0.34, 0.15, 4.1]} />
            <meshStandardMaterial
              color={i % 2 ? "#805438" : "#765036"}
              roughness={1}
            />
          </mesh>

          {/* IRRIGATION LINE */}
          <mesh
            position={[i * 0.48 - 0.96, 0.2, 0]}
          >
            <cylinderGeometry args={[0.014, 0.014, 4.05, 6]} />
            <meshStandardMaterial
              color="#303c37"
              roughness={0.85}
            />
          </mesh>
        </group>
      ))}

      {/* LEAFY CROP PLANTS */}
      {crops.map((crop, i) => (
        <group
          key={i}
          position={[crop.x, 0.26, crop.z]}
          scale={crop.scale}
        >
          <mesh castShadow>
            <icosahedronGeometry args={[0.13, 1]} />
            <meshStandardMaterial
              color={leafColors[crop.shade]}
              roughness={0.95}
            />
          </mesh>

          {[-1, 0, 1].map((n) => (
            <mesh
              key={n}
              position={[
                Math.sin(n * 2.1) * 0.12,
                0.06,
                Math.cos(n * 2.1) * 0.12,
              ]}
              rotation={[0.25, n * 1.4, 0.35]}
              castShadow
            >
              <sphereGeometry args={[0.1, 7, 5]} />
              <meshStandardMaterial
                color={leafColors[(crop.shade + n + 3) % 3]}
                roughness={0.94}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
