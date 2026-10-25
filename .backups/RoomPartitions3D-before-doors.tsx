import { useMemo } from "react";
import * as THREE from "three";

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

function getRoomEdges(room: BuildingRoom): Segment[] {
  const { x, z, width, length } = room.bounds;

  return [
    { x1: x, z1: z, x2: x + width, z2: z },
    {
      x1: x + width,
      z1: z,
      x2: x + width,
      z2: z + length,
    },
    {
      x1: x + width,
      z1: z + length,
      x2: x,
      z2: z + length,
    },
    { x1: x, z1: z + length, x2: x, z2: z },
  ];
}

function edgeKey(segment: Segment): string {
  const a = [
    segment.x1.toFixed(3),
    segment.z1.toFixed(3),
  ].join(",");

  const b = [
    segment.x2.toFixed(3),
    segment.z2.toFixed(3),
  ].join(",");

  return [a, b].sort().join("|");
}

export default function RoomPartitions3D({
  floor,
}: Props) {
  const partitions = useMemo(() => {
    const unique = new Map<string, Segment>();

    for (const room of floor.rooms) {
      for (const segment of getRoomEdges(room)) {
        unique.set(edgeKey(segment), segment);
      }
    }

    return [...unique.values()];
  }, [floor.rooms]);

  return (
    <group>
      {partitions.map((segment, index) => {
        const dx = segment.x2 - segment.x1;
        const dz = segment.z2 - segment.z1;

        const distance = Math.hypot(dx, dz);

        const centerX = (segment.x1 + segment.x2) / 2;
        const centerZ = (segment.z1 + segment.z2) / 2;

        const angle = Math.atan2(dz, dx);

        return (
          <mesh
            key={index}
            position={[
              centerX,
              floor.elevation + floor.height / 2,
              centerZ,
            ]}
            rotation={[0, -angle, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry
              args={[
                distance,
                floor.height,
                0.12,
              ]}
            />

            <meshStandardMaterial
              color="#e5e4df"
              roughness={0.88}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}
