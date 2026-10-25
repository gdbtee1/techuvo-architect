type EditableBuildingProps = {
  width: number;
  length: number;
  height: number;
  color: string;
};

export default function EditableBuilding({
  width,
  length,
  height,
  color,
}: EditableBuildingProps) {
  // Measurements supplied in feet.
  // Three.js geometry uses meters.
  const ft = 0.3048;

  const w = width * ft;
  const l = length * ft;
  const h = height * ft;

  const roofRise = Math.min(w * 0.3, 3.5);
  const slope = Math.hypot(w / 2, roofRise);
  const pitch = Math.atan2(roofRise, w / 2);

  return (
    <group>
      {/* FOUNDATION */}
      <mesh position={[0, -0.13, 0]} receiveShadow>
        <boxGeometry args={[w + 0.5, 0.25, l + 0.5]} />
        <meshStandardMaterial
          color="#c7c2b6"
          roughness={0.9}
        />
      </mesh>

      {/* MAIN STRUCTURE */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, l]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>

      {/* PITCHED ROOF PANELS */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[
            side * w / 4,
            h + roofRise / 2,
            0,
          ]}
          rotation={[0, 0, -side * pitch]}
          castShadow
        >
          <boxGeometry args={[slope + 0.35, 0.14, l + 0.5]} />
          <meshStandardMaterial
            color="#405451"
            metalness={0.35}
            roughness={0.55}
          />
        </mesh>
      ))}

      {/* FRONT DOUBLE DOORS */}
      <mesh position={[0, h * 0.35, l / 2 + 0.035]}>
        <boxGeometry args={[Math.min(w * 0.35, 3.2), h * 0.7, 0.09]} />
        <meshStandardMaterial color="#593e31" />
      </mesh>
    </group>
  );
}
