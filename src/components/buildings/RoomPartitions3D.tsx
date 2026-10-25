import { useMemo } from "react";
import type {
  BuildingFloor,
  BuildingRoom,
} from "../../engine/buildings/buildingTypes";

type Props = {
  floor: BuildingFloor;
};

type Segment = {
  x1: number;
  z1: number;
  x2: number;
  z2: number;
};

function edges(room: BuildingRoom): Segment[] {
  const { x, z, width, length } = room.bounds;

  return [
    { x1: x, z1: z, x2: x + width, z2: z },
    { x1: x + width, z1: z, x2: x + width, z2: z + length },
    { x1: x + width, z1: z + length, x2: x, z2: z + length },
    { x1: x, z1: z + length, x2: x, z2: z },
  ];
}

function WallPiece({
  x,
  z,
  length,
  height,
  angle,
  elevation,
}: {
  x: number;
  z: number;
  length: number;
  height: number;
  angle: number;
  elevation: number;
}) {
  if (length <= 0.01 || height <= 0.01) return null;

  return (
    <mesh
      position={[x, elevation + height / 2, z]}
      rotation={[0, -angle, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[length, height, 0.12]} />
      <meshStandardMaterial
        color="#e5e4df"
        roughness={0.85}
      />
    </mesh>
  );
}

function Partition({
  segment,
  floor,
  opening,
}: {
  segment: Segment;
  floor: BuildingFloor;
  opening: boolean;
}) {
  const dx = segment.x2 - segment.x1;
  const dz = segment.z2 - segment.z1;

  const length = Math.hypot(dx, dz);
  if (length < 0.01) return null;

  const angle = Math.atan2(dz, dx);
  const centerX = (segment.x1 + segment.x2) / 2;
  const centerZ = (segment.z1 + segment.z2) / 2;

  const doorWidth = Math.min(0.95, length * 0.35);
  const doorHeight = Math.min(2.15, floor.height - 0.25);
  const sideLength = (length - doorWidth) / 2;

  const ux = dx / length;
  const uz = dz / length;

  if (!opening || sideLength < 0.2) {
    return (
      <WallPiece
        x={centerX}
        z={centerZ}
        length={length}
        height={floor.height}
        angle={angle}
        elevation={floor.elevation}
      />
    );
  }

  return (
    <group>
      <WallPiece
        x={centerX - ux * (doorWidth + sideLength) / 2}
        z={centerZ - uz * (doorWidth + sideLength) / 2}
        length={sideLength}
        height={floor.height}
        angle={angle}
        elevation={floor.elevation}
      />

      <WallPiece
        x={centerX + ux * (doorWidth + sideLength) / 2}
        z={centerZ + uz * (doorWidth + sideLength) / 2}
        length={sideLength}
        height={floor.height}
        angle={angle}
        elevation={floor.elevation}
      />

      {/* Wall header above the doorway */}
      <mesh
        position={[
          centerX,
          floor.elevation +
            doorHeight +
            (floor.height - doorHeight) / 2,
          centerZ,
        ]}
        rotation={[0, -angle, 0]}
        castShadow
      >
        <boxGeometry
          args={[
            doorWidth,
            floor.height - doorHeight,
            0.12,
          ]}
        />
        <meshStandardMaterial color="#e5e4df" />
      </mesh>
    </group>
  );
}

export default function RoomPartitions3D({
  floor,
}: Props) {
  const partitions = useMemo(() => {
    const results: {
      id: string;
      segment: Segment;
      opening: boolean;
    }[] = [];

    const margin = 0.35;
    const corridorWidth = 1.8;
    const roomWidth =
      (floor.width - 2 * margin - corridorWidth) / 2;

    const corridorLeft = margin + roomWidth;
    const corridorRight = corridorLeft + corridorWidth;

    floor.rooms.forEach((room) => {
      const roomEdges = edges(room);

      roomEdges.forEach((segment, index) => {
        // Each room has one entrance facing the center hallway.
        const isVertical =
          Math.abs(segment.x1 - segment.x2) < 0.001;

        const onHallway =
          isVertical &&
          (
            Math.abs(segment.x1 - corridorLeft) < 0.01 ||
            Math.abs(segment.x1 - corridorRight) < 0.01
          );

        results.push({
          id: `${room.id}-${index}`,
          segment,
          opening: onHallway,
        });
      });
    });

    return results;
  }, [floor]);

  return (
    <group>
      {partitions.map((item) => (
        <Partition
          key={item.id}
          segment={item.segment}
          floor={floor}
          opening={item.opening}
        />
      ))}
    </group>
  );
}
