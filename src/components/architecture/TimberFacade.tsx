import { useMemo } from "react";
import * as THREE from "three";

type TimberFacadeProps = {
  width: number;
  height: number;
  position: [number, number, number];
  boardHeight?: number;
  depth?: number;
  color?: string;
};

export default function TimberFacade({
  width,
  height,
  position,
  boardHeight = 0.14,
  depth = 0.045,
  color = "#a87954",
}: TimberFacadeProps) {
  const boards = useMemo(() => {
    const count = Math.max(
      1,
      Math.floor(height / boardHeight)
    );

    return Array.from({ length: count }, (_, index) => {
      const y =
        -height / 2 +
        boardHeight / 2 +
        index * boardHeight;

      const shade = index % 4;

      return {
        y,
        shade,
      };
    });
  }, [height, boardHeight]);

  const shades = useMemo(() => {
    const base = new THREE.Color(color);

    return [
      base.clone(),
      base.clone().multiplyScalar(0.94),
      base.clone().multiplyScalar(1.06),
      base.clone().multiplyScalar(0.89),
    ];
  }, [color]);

  return (
    <group position={position}>
      {boards.map((board, index) => (
        <mesh
          key={index}
          position={[0, board.y, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              width,
              boardHeight * 0.91,
              depth,
            ]}
          />
          <meshStandardMaterial
            color={shades[board.shade]}
            roughness={0.82}
            metalness={0}
          />
        </mesh>
      ))}
    </group>
  );
}
