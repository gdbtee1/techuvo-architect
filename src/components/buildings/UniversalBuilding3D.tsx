import RoomPartitions3D from "./RoomPartitions3D";
import { Text } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

import type {
  BuildingProject,
  BuildingFloor,
  BuildingWall,
} from "../../engine/buildings/buildingTypes";

type Props = {
  project: BuildingProject;
  selectedFloor?: number;
  showAllFloors?: boolean;
  onFloorSelect?: (level: number) => void;
};

function WallMesh({
  wall,
  elevation,
  selected,
}: {
  wall: BuildingWall;
  elevation: number;
  selected: boolean;
}) {
  const start = new THREE.Vector3(
    wall.start.x,
    0,
    wall.start.z
  );

  const end = new THREE.Vector3(
    wall.end.x,
    0,
    wall.end.z
  );

  const distance = start.distanceTo(end);

  const centerX = (wall.start.x + wall.end.x) / 2;
  const centerZ = (wall.start.z + wall.end.z) / 2;

  const angle = Math.atan2(
    wall.end.z - wall.start.z,
    wall.end.x - wall.start.x
  );

  return (
    <mesh
      position={[
        centerX,
        elevation + wall.height / 2,
        centerZ,
      ]}
      rotation={[0, -angle, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry
        args={[distance, wall.height, wall.thickness]}
      />
      <meshStandardMaterial
        color={selected ? "#d6dfeb" : "#e6e9e8"}
        roughness={0.82}
      />
    </mesh>
  );
}

function FloorLevel({
  floor,
  selected,
  onSelect,
}: {
  floor: BuildingFloor;
  selected: boolean;
  onSelect?: () => void;
}) {
  const slabColor = selected ? "#c7d8e8" : "#d8dad6";

  return (
    <group>
      {/* FLOOR SLAB */}
      <mesh
        position={[
          floor.width / 2,
          floor.elevation - 0.12,
          floor.length / 2,
        ]}
        castShadow
        receiveShadow
        onClick={(event) => {
          event.stopPropagation();
          onSelect?.();
        }}
      >
        <boxGeometry
          args={[
            floor.width + 0.16,
            0.24,
            floor.length + 0.16,
          ]}
        />
        <meshStandardMaterial
          color={slabColor}
          roughness={0.88}
        />
      </mesh>

      {/* DATA-DRIVEN ROOM ZONES */}
      {floor.rooms.map((room, index) => {
        const colors = [
          "#b5d3ee",
          "#bfded3",
          "#e9d2b1",
          "#d5c7e6",
        ];

        const x = room.bounds.x + room.bounds.width / 2;
        const z = room.bounds.z + room.bounds.length / 2;

        const labelSize = Math.max(
          0.38,
          Math.min(
            1.15,
            room.bounds.width * 0.13,
            room.bounds.length * 0.13
          )
        );

        return (
          <group key={room.id}>
            <mesh
              position={[x, floor.elevation + 0.025, z]}
              rotation={[-Math.PI / 2, 0, 0]}
              onClick={(event) => {
                event.stopPropagation();
                onSelect?.();
              }}
            >
              <planeGeometry
                args={[
                  Math.max(0.1, room.bounds.width - 0.12),
                  Math.max(0.1, room.bounds.length - 0.12),
                ]}
              />
              <meshStandardMaterial
                color={colors[index % colors.length]}
                transparent
                opacity={0.86}
                roughness={1}
                side={THREE.DoubleSide}
              />
            </mesh>

            <Text
              position={[x, floor.elevation + 0.055, z]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={labelSize}
              maxWidth={room.bounds.width * 0.88}
              textAlign="center"
              anchorX="center"
              anchorY="middle"
              color="#324758"
            >
              {room.name}
            </Text>
          </group>
        );
      })}

      {/* GENERATED INTERIOR PARTITIONS */}
      <RoomPartitions3D floor={floor} />

      {/* GENERATED WALLS */}
      {floor.walls.map((wall) => (
        <WallMesh
          key={wall.id}
          wall={wall}
          elevation={floor.elevation}
          selected={selected}
        />
      ))}

      {/* LEVEL EDGE ACCENT */}
      {selected && (
        <lineSegments
          position={[
            floor.width / 2,
            floor.elevation - 0.12,
            floor.length / 2,
          ]}
        >
          <edgesGeometry
            args={[
              new THREE.BoxGeometry(
                floor.width + 0.16,
                0.24,
                floor.length + 0.16
              ),
            ]}
          />
          <lineBasicMaterial color="#4b80ca" />
        </lineSegments>
      )}
    </group>
  );
}

export default function UniversalBuilding3D({
  project,
  selectedFloor = 1,
  showAllFloors = true,
  onFloorSelect,
}: Props) {
  const visibleFloors = useMemo(() => {
    return project.floors.filter((floor) =>
      showAllFloors || floor.level === selectedFloor
    );
  }, [project, selectedFloor, showAllFloors]);

  return (
    <group
      position={[
        -project.floors[0].width / 2,
        0,
        -project.floors[0].length / 2,
      ]}
    >
      {visibleFloors.map((floor) => (
        <FloorLevel
          key={floor.id}
          floor={floor}
          selected={floor.level === selectedFloor}
          onSelect={() => onFloorSelect?.(floor.level)}
        />
      ))}
    </group>
  );
}
