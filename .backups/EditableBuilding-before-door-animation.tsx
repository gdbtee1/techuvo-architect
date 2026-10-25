import * as THREE from "three";
import { useMemo } from "react";

type EditableBuildingProps = {
  width: number;
  length: number;
  height: number;
  color: string;
  roofStyle?: "gable" | "gambrel";
  doorSize?: "standard" | "wide" | "oversized";
  windowCount?: 0 | 2 | 4 | 6;
  windowStyle?: "traditional" | "modern";
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
  doorSize = "standard",
  windowCount = 4,
  windowStyle = "traditional",
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

  const doorRatio = {
    standard: 0.34,
    wide: 0.48,
    oversized: 0.62,
  }[doorSize];

  const doorWidth = Math.min(w * doorRatio, w - 0.8);
  const doorHeight = Math.min(h * 0.78, 3.5);

  return (
    <group>
      {/* FOUNDATION */}
      <BarnPart
        position={[0, -0.13, 0]}
        size={[w + 0.6, 0.26, l + 0.6]}
        color="#d1c8b7"
      />

      {/* WALKABLE INTERIOR FLOOR */}
      <BarnPart
        position={[0, 0.025, 0]}
        size={[w - 0.2, 0.05, l - 0.2]}
        color="#b6aa96"
      />

      {/* REAR WALL */}
      <BarnPart
        position={[0, h / 2, -l / 2]}
        size={[w, h, 0.18]}
        color={color}
      />

      {/* LEFT EXTERIOR WALL */}
      <BarnPart
        position={[-w / 2, h / 2, 0]}
        size={[0.18, h, l]}
        color={color}
      />

      {/* RIGHT EXTERIOR WALL */}
      <BarnPart
        position={[w / 2, h / 2, 0]}
        size={[0.18, h, l]}
        color={color}
      />

      {/* FRONT WALL SEGMENTS — REAL DOOR OPENING */}
      <BarnPart
        position={[
          -(w + doorWidth) / 4,
          h / 2,
          l / 2,
        ]}
        size={[
          (w - doorWidth) / 2,
          h,
          0.18,
        ]}
        color={color}
      />

      <BarnPart
        position={[
          (w + doorWidth) / 4,
          h / 2,
          l / 2,
        ]}
        size={[
          (w - doorWidth) / 2,
          h,
          0.18,
        ]}
        color={color}
      />

      {/* HEADER ABOVE ENTRANCE */}
      <BarnPart
        position={[
          0,
          doorHeight + (h - doorHeight) / 2,
          l / 2,
        ]}
        size={[
          doorWidth,
          h - doorHeight,
          0.18,
        ]}
        color={color}
      />

      {/* INTERIOR STRUCTURAL POSTS */}
      {[-1, 1].map((side) =>
        [-1, 1].map((end) => (
          <BarnPart
            key={`interior-post-${side}-${end}`}
            position={[
              side * (w / 2 - 0.25),
              h / 2,
              end * (l / 2 - 0.3),
            ]}
            size={[0.16, h, 0.16]}
            color="#85674d"
          />
        ))
      )}

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
                {side === -1 || y >= doorHeight ? (
                  <BarnPart
                    position={[
                      0,
                      y,
                      side * (l / 2 + 0.025),
                    ]}
                    size={[w, 0.025, 0.045]}
                    color={i % 3 === 0 ? "#c09372" : color}
                  />
                ) : (
                  <>
                    {[-1, 1].map((half) => (
                      <BarnPart
                        key={`front-siding-${half}`}
                        position={[
                          half * (w + doorWidth) / 4,
                          y,
                          l / 2 + 0.025,
                        ]}
                        size={[
                          (w - doorWidth) / 2,
                          0.025,
                          0.045,
                        ]}
                        color={i % 3 === 0 ? "#c09372" : color}
                      />
                    ))}
                  </>
                )}

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

      {/* PARAMETRIC SIDE WINDOWS */}
      {[-1, 1].map((side) =>
        Array.from({ length: windowCount / 2 }, (_, i) => {
          const perSide = windowCount / 2;
          const z = -l / 2 + ((i + 1) * l) / (perSide + 1);
          const windowWidth = Math.min(1.3, l / (perSide + 2));
          const windowHeight = Math.min(1.15, h * 0.35);
          const frameColor =
            windowStyle === "modern" ? "#354a48" : trim;

          return (
            <group
              key={`window-${side}-${i}`}
              position={[
                side * (w / 2 + 0.075),
                h * 0.58,
                z,
              ]}
            >
              {/* Window glazing */}
              <BarnPart
                position={[0, 0, 0]}
                size={[0.045, windowHeight, windowWidth]}
                color="#9bc1c4"
                metalness={0.18}
              />

              {/* Vertical frame edges */}
              {[-1, 1].map((edge) => (
                <BarnPart
                  key={`jamb-${edge}`}
                  position={[0.04, 0, edge * windowWidth / 2]}
                  size={[0.08, windowHeight + 0.1, 0.07]}
                  color={frameColor}
                />
              ))}

              {/* Horizontal frame edges */}
              {[-1, 1].map((edge) => (
                <BarnPart
                  key={`rail-${edge}`}
                  position={[0.04, edge * windowHeight / 2, 0]}
                  size={[0.08, 0.07, windowWidth + 0.12]}
                  color={frameColor}
                />
              ))}

              {windowStyle === "traditional" && (
                <BarnPart
                  position={[0.05, 0, 0]}
                  size={[0.08, windowHeight, 0.055]}
                  color={frameColor}
                />
              )}
            </group>
          );
        })
      )}

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
