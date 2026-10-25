import * as THREE from "three";

const WOOD = "#a56848";
const TRIM = "#eee6d5";
const ROOF = "#394946";

function Beam({
  position,
  size,
  color = TRIM,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
  rotation?: [number, number, number];
}) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

export default function RealisticBarn() {
  const width = 5.4;
  const length = 5.8;
  const wallHeight = 2.8;
  const roofRise = 1.75;

  const pitch = Math.atan2(roofRise, width / 2);
  const slope = Math.hypot(width / 2, roofRise);

  const gable = new THREE.Shape();
  gable.moveTo(-width / 2, 0);
  gable.lineTo(width / 2, 0);
  gable.lineTo(0, roofRise);
  gable.closePath();

  return (
    <group position={[1.1, 0, 0]}>
      {/* FOUNDATION */}
      <Beam
        position={[0, 0.08, 0]}
        size={[6, 0.16, 6.4]}
        color="#d2c7b7"
      />

      {/* MAIN BARN VOLUME */}
      <Beam
        position={[0, 0.16 + wallHeight / 2, 0]}
        size={[width, wallHeight, length]}
        color={WOOD}
      />

      {/* TRIANGULAR GABLES */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[0, wallHeight + 0.16, side * length / 2]}
          castShadow
          receiveShadow
        >
          <shapeGeometry args={[gable]} />
          <meshStandardMaterial
            color={WOOD}
            side={THREE.DoubleSide}
            roughness={0.82}
          />
        </mesh>
      ))}

      {/* CONTINUOUS GABLE ROOF */}
      {[-1, 1].map((side) => (
        <mesh
          key={`roof-${side}`}
          position={[
            side * width / 4,
            wallHeight + 0.16 + roofRise / 2,
            0,
          ]}
          rotation={[0, 0, -side * pitch]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[slope + 0.34, 0.12, length + 0.45]}
          />
          <meshStandardMaterial
            color={ROOF}
            metalness={0.32}
            roughness={0.58}
          />
        </mesh>
      ))}

      <Beam
        position={[0, wallHeight + roofRise + 0.2, 0]}
        size={[0.16, 0.14, length + 0.5]}
        color="#293936"
      />

      {/* HORIZONTAL WOOD SIDING ON FRONT/BACK */}
      {[-1, 1].map((side) =>
        Array.from({ length: 21 }, (_, i) => (
          <Beam
            key={`${side}-${i}`}
            position={[
              0,
              0.24 + i * 0.13,
              side * (length / 2 + 0.038),
            ]}
            size={[width, 0.025, 0.045]}
            color={i % 3 === 0 ? "#c0835a" : "#915638"}
          />
        ))
      )}

      {/* SIDE WALL SIDING */}
      {[-1, 1].map((side) =>
        Array.from({ length: 21 }, (_, i) => (
          <Beam
            key={`${side}-${i}`}
            position={[
              side * (width / 2 + 0.038),
              0.24 + i * 0.13,
              0,
            ]}
            size={[0.045, 0.025, length]}
            color={i % 3 === 0 ? "#b97751" : "#945838"}
          />
        ))
      )}

      {/* LARGE DOUBLE SLIDING BARN DOORS */}
      {[-1, 1].map((side) => (
        <group
          key={`door-${side}`}
          position={[side * 0.76, 1.37, length / 2 + 0.11]}
        >
          <Beam
            position={[0, 0, 0]}
            size={[1.5, 2.45, 0.11]}
            color="#71432f"
          />

          {[-0.71, 0.71].map((x) => (
            <Beam
              key={x}
              position={[x, 0, 0.08]}
              size={[0.075, 2.45, 0.07]}
            />
          ))}

          {[-1.15, 1.15].map((y) => (
            <Beam
              key={y}
              position={[0, y, 0.09]}
              size={[1.5, 0.08, 0.07]}
            />
          ))}

          <Beam
            position={[0, 0, 0.13]}
            size={[0.095, 2.7, 0.07]}
            rotation={[0, 0, side * 0.53]}
          />
        </group>
      ))}

      {/* DOOR TRACK */}
      <Beam
        position={[0, 2.66, length / 2 + 0.2]}
        size={[3.4, 0.12, 0.12]}
        color="#3e4945"
      />

      {/* HAYLOFT WINDOW */}
      <Beam
        position={[0, wallHeight + 0.58, length / 2 + 0.1]}
        size={[0.9, 0.65, 0.09]}
        color="#304b4b"
      />

      <Beam
        position={[0, wallHeight + 0.58, length / 2 + 0.17]}
        size={[0.065, 0.65, 0.06]}
      />

      {/* SIDE WINDOWS */}
      {[-1.45, 1.45].map((z) => (
        <group key={z}>
          <Beam
            position={[width / 2 + 0.07, 1.8, z]}
            size={[0.06, 0.95, 0.95]}
            color="#a5c5c7"
          />
          <Beam
            position={[width / 2 + 0.13, 1.8, z]}
            size={[0.07, 0.95, 0.07]}
          />
          <Beam
            position={[width / 2 + 0.13, 1.8, z]}
            size={[0.07, 0.07, 0.95]}
          />
        </group>
      ))}

      {/* ROOF GUTTER */}
      {[-1, 1].map((side) => (
        <Beam
          key={`gutter-${side}`}
          position={[
            side * (width / 2 + 0.16),
            wallHeight + 0.05,
            0,
          ]}
          size={[0.11, 0.11, length + 0.55]}
          color="#344541"
        />
      ))}

      {/* FRONT GRAVEL APPROACH */}
      <Beam
        position={[0, 0.025, length / 2 + 1.0]}
        size={[4, 0.055, 2]}
        color="#c4b8a2"
      />
    </group>
  );
}
