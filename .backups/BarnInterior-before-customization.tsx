type Props = {
  width: number;
  length: number;
  height: number;
};

const FT = 0.3048;

function Part({
  position,
  size,
  color,
  metalness = 0,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  metalness?: number;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={metalness ? 0.48 : 0.82}
        metalness={metalness}
      />
    </mesh>
  );
}

export default function BarnInterior({
  width,
  length,
  height,
}: Props) {
  const w = width * FT;
  const l = length * FT;
  const h = height * FT;

  const timber = "#927052";
  const darkTimber = "#73543c";
  const steel = "#64747a";
  const straw = "#c4a35e";

  // Keep a wide central aisle clear.
  const aisleWidth = Math.max(2.8, w * 0.34);

  const postX = w / 2 - 0.6;
  const postSpacing = Math.max(2.8, l / 6);
  const postCount = Math.max(2, Math.floor(l / postSpacing));

  return (
    <group>
      {/* CONCRETE INTERIOR SURFACE */}
      <Part
        position={[0, 0.065, 0]}
        size={[w - 0.36, 0.035, l - 0.36]}
        color="#b6b4ac"
      />

      {/* CENTRAL WALKING / EQUIPMENT AISLE */}
      <Part
        position={[0, 0.086, 0]}
        size={[aisleWidth, 0.008, l - 0.9]}
        color="#aaa99f"
      />

      {/* TIMBER SUPPORT POSTS */}
      {[-1, 1].map((side) =>
        Array.from({ length: postCount }, (_, i) => {
          const z =
            -l / 2 +
            1.2 +
            (i * (l - 2.4)) /
              Math.max(1, postCount - 1);

          return (
            <group key={`post-${side}-${i}`}>
              <Part
                position={[side * postX, h / 2, z]}
                size={[0.19, h, 0.19]}
                color={timber}
              />

              <Part
                position={[side * postX, h - 0.16, z]}
                size={[0.35, 0.32, 0.35]}
                color={darkTimber}
              />
            </group>
          );
        })
      )}

      {/* OVERHEAD CROSS BEAMS */}
      {Array.from({ length: postCount }, (_, i) => {
        const z =
          -l / 2 +
          1.2 +
          (i * (l - 2.4)) /
            Math.max(1, postCount - 1);

        return (
          <Part
            key={`beam-${i}`}
            position={[0, h - 0.22, z]}
            size={[w - 0.7, 0.2, 0.19]}
            color={darkTimber}
          />
        );
      })}

      {/* STORAGE SHELVING — LEFT SIDE */}
      {[-1, 0, 1].map((row) => {
        const z = row * Math.min(2.6, l / 5);

        return (
          <group
            key={`shelf-${row}`}
            position={[-w / 2 + 1.35, 0, z]}
          >
            {[0.5, 1.2, 1.9].map((y) => (
              <Part
                key={y}
                position={[0, y, 0]}
                size={[1.4, 0.075, 1.65]}
                color={steel}
                metalness={0.45}
              />
            ))}

            {[-0.62, 0.62].map((x) =>
              [-0.72, 0.72].map((zOffset) => (
                <Part
                  key={`${x}-${zOffset}`}
                  position={[x, 1.1, zOffset]}
                  size={[0.065, 2.2, 0.065]}
                  color={steel}
                  metalness={0.5}
                />
              ))
            )}

            {/* STORAGE CONTAINERS */}
            {[-0.4, 0.4].map((x) => (
              <Part
                key={`container-${x}`}
                position={[x, 1.37, 0]}
                size={[0.55, 0.28, 0.75]}
                color="#8b9e8f"
              />
            ))}
          </group>
        );
      })}

      {/* HAY BALE STORAGE — RIGHT SIDE */}
      {Array.from({ length: 6 }, (_, i) => {
        const column = i % 2;
        const row = Math.floor(i / 2);

        return (
          <group
            key={`hay-${i}`}
            position={[
              w / 2 - 1.35 + column * 0.6,
              0,
              -l / 3 + row * 1.0,
            ]}
          >
            <Part
              position={[0, 0.38, 0]}
              size={[0.56, 0.72, 0.87]}
              color={straw}
            />

            <Part
              position={[0, 0.37, 0]}
              size={[0.58, 0.055, 0.9]}
              color="#aa8747"
            />
          </group>
        );
      })}

      {/* FARM WORKBENCH */}
      <group position={[w / 2 - 1.35, 0, l / 3]}>
        <Part
          position={[0, 0.9, 0]}
          size={[1.4, 0.1, 1.65]}
          color={darkTimber}
        />

        {[-0.55, 0.55].map((x) =>
          [-0.65, 0.65].map((z) => (
            <Part
              key={`${x}-${z}`}
              position={[x, 0.45, z]}
              size={[0.09, 0.9, 0.09]}
              color={steel}
              metalness={0.5}
            />
          ))
        )}

        {/* TOOL STORAGE ON THE BENCH */}
        <Part
          position={[0, 1.07, 0]}
          size={[0.65, 0.22, 0.4]}
          color="#526c74"
        />
      </group>

      {/* OVERHEAD LIGHT FIXTURES */}
      {[-l / 4, 0, l / 4].map((z, i) => (
        <group key={`light-${i}`}>
          <Part
            position={[0, h - 0.42, z]}
            size={[1.45, 0.095, 0.22]}
            color="#e7e8df"
          />

          <pointLight
            position={[0, h - 0.6, z]}
            intensity={5}
            distance={7}
            decay={2}
            color="#fff2df"
          />
        </group>
      ))}
    </group>
  );
}
