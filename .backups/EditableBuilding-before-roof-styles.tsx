import * as THREE from "three";
import { useMemo } from "react";

type EditableBuildingProps = {
  width: number;
  length: number;
  height: number;
  color: string;
  roofStyle?: "gable" | "gambrel";
};

const FT = 0.3048;

function BarnPart({
  position,
  size,
  color,
  rotation = [0, 0, 0],
  metalness = 0,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  rotation?: [number, number, number];
  metalness?: number;
}) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={metalness ? 0.55 : 0.83}
        metalness={metalness}
      />
    </mesh>
  );
}

export default function EditableBuilding({
  width,
  length,
  height,
  color,
  roofStyle = "gable",
}: EditableBuildingProps) {
  const w = width * FT;
  const l = length * FT;
  const h = height * FT;

  const roofRise = w * 0.32;

  const roofPoints =
    roofStyle === "gambrel"
      ? [
          [-w / 2, 0],
          [-w * 0.28, roofRise * 0.76],
          [0, roofRise],
          [w * 0.28, roofRise * 0.76],
          [w / 2, 0],
        ]
      : [
          [-w / 2, 0],
          [0, roofRise],
          [w / 2, 0],
        ];

  const roofSegments = roofPoints.slice(0, -1).map(
    ([x1, y1], i) => {
      const [x2, y2] = roofPoints[i + 1];
      return {
        x: (x1 + x2) / 2,
        y: h + (y1 + y2) / 2,
        span: Math.hypot(x2 - x1, y2 - y1),
        angle: Math.atan2(y2 - y1, x2 - x1),
      };
    }
  );

  const trim = "#efe9dd";
  const roof = "#40504e";
  const door = "#6b4837";

  const gable = useMemo(() => {
    const shape = new THREE.Shape();

    roofPoints.forEach(([x, y], i) => {
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });

    shape.closePath();
    return shape;
  }, [w, roofRise, roofStyle]);

  const sidingCount = Math.max(8, Math.ceil(h / 0.17));

  const doorWidth = Math.min(w * 0.42, 4.4);
  const doorHeight = Math.min(h * 0.78, 3.5);

  return (
    <group>
      {/* FOUNDATION */}
      <BarnPart
        position={[0, -0.13, 0]}
        size={[w + 0.6, 0.26, l + 0.6]}
        color="#d1c8b7"
      />

      {/* MAIN WALL VOLUME */}
      <BarnPart
        position={[0, h / 2, 0]}
        size={[w, h, l]}
        color={color}
      />

      {/* TRIANGULAR GABLE ENDS */}
      {[-1, 1].map((side) => (
        <mesh
          key={`gable-${side}`}
          position={[0, h, side * l / 2]}
          castShadow
          receiveShadow
        >
          <shapeGeometry args={[gable]} />
          <meshStandardMaterial
            color={color}
            roughness={0.83}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* PARAMETRIC GABLE / GAMBREL ROOF */}
      {roofSegments.map((segment, i) => (
        <BarnPart
          key={`roof-panel-${i}`}
          position={[segment.x, segment.y, 0]}
          size={[segment.span + 0.12, 0.14, l + 0.5]}
          rotation={[0, 0, segment.angle]}
          color={roof}
          metalness={0.35}
        />
      ))}

      <BarnPart
        position={[0, h + roofRise + 0.05, 0]}
        size={[0.17, 0.12, l + 0.55]}
        color="#34413f"
        metalness={0.4}
      />

      {/* HORIZONTAL TIMBER SIDING */}
      {Array.from({ length: sidingCount }, (_, i) => {
        const y = (i + 0.5) * (h / sidingCount);

        return (
          <group key={`siding-${i}`}>
            {[-1, 1].map((side) => (
              <group key={side}>
                <BarnPart
                  position={[
                    0,
                    y,
                    side * (l / 2 + 0.025),
                  ]}
                  size={[w, 0.025, 0.045]}
                  color={i % 3 === 0 ? "#c09372" : color}
                />

                <BarnPart
                  position={[
                    side * (w / 2 + 0.025),
                    y,
                    0,
                  ]}
                  size={[0.045, 0.025, l]}
                  color={color}
                />
              </group>
            ))}
          </group>
        );
      })}

      {/* DOUBLE BARN DOORS */}
      {[-1, 1].map((side) => (
        <group
          key={`door-${side}`}
          position={[
            side * doorWidth / 4,
            doorHeight / 2,
            l / 2 + 0.085,
          ]}
        >
          <BarnPart
            position={[0, 0, 0]}
            size={[doorWidth / 2, doorHeight, 0.1]}
            color={door}
          />

          {[-1, 1].map((edge) => (
            <BarnPart
              key={edge}
              position={[
                edge * doorWidth / 4,
                0,
                0.075,
              ]}
              size={[0.07, doorHeight, 0.08]}
              color={trim}
            />
          ))}

          {[-1, 1].map((edge) => (
            <BarnPart
              key={`horizontal-${edge}`}
              position={[
                0,
                edge * doorHeight / 2,
                0.075,
              ]}
              size={[doorWidth / 2, 0.07, 0.08]}
              color={trim}
            />
          ))}

          <BarnPart
            position={[0, 0, 0.09]}
            size={[
              0.09,
              Math.hypot(doorWidth / 2, doorHeight),
              0.07,
            ]}
            rotation={[
              0,
              0,
              side *
                Math.atan2(doorWidth / 2, doorHeight),
            ]}
            color={trim}
          />
        </group>
      ))}

      {/* DOOR TRACK */}
      <BarnPart
        position={[0, doorHeight + 0.12, l / 2 + 0.15]}
        size={[doorWidth + 0.3, 0.12, 0.12]}
        color="#374744"
      />

      {/* HAYLOFT WINDOW */}
      <BarnPart
        position={[0, h + roofRise * 0.32, l / 2 + 0.06]}
        size={[
          Math.min(w * 0.16, 1.2),
          Math.min(roofRise * 0.35, 0.8),
          0.09,
        ]}
        color="#3e6669"
      />

      {/* EXTERIOR STRUCTURAL CORNERS */}
      {[-1, 1].map((x) =>
        [-1, 1].map((z) => (
          <BarnPart
            key={`${x}-${z}`}
            position={[
              x * w / 2,
              h / 2,
              z * l / 2,
            ]}
            size={[0.12, h, 0.12]}
            color={trim}
          />
        ))
      )}
    </group>
  );
}
