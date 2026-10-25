import { Arc, Circle, Group, Line, Rect } from "react-konva";
import type { Opening, Wall } from "../../types/architecture";

type Props = {
  opening: Opening;
  wall: Wall;
  scale: number;
  centerX: number;
  centerY: number;
};

export default function OpeningSymbol({
  opening,
  wall,
  scale,
  centerX,
  centerY,
}: Props) {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const length = Math.hypot(dx, dy);

  if (length < 0.001) return null;

  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const width = opening.width * scale;
  const thickness = Math.max(3, wall.thickness * scale);

  const door = opening.type === "door";

  return (
    <Group x={centerX} y={centerY} rotation={angle} listening={false}>
      <Line
        points={[-width / 2, 0, width / 2, 0]}
        stroke="#ffffff"
        strokeWidth={thickness + 4}
      />

      {door ? (
        <>
          <Circle
            x={-width / 2}
            y={0}
            radius={3}
            fill="#275E7C"
          />

          <Line
            points={[
              -width / 2,
              0,
              -width / 2,
              -width,
            ]}
            stroke="#275E7C"
            strokeWidth={2}
          />

          <Arc
            x={-width / 2}
            y={0}
            innerRadius={Math.max(0, width - 1.5)}
            outerRadius={width}
            angle={90}
            rotation={-90}
            fill="#275E7C"
            opacity={0.9}
          />
        </>
      ) : (
        <>
          <Rect
            x={-width / 2}
            y={-thickness / 2}
            width={width}
            height={thickness}
            fill="#DDEFF7"
            stroke="#275E7C"
            strokeWidth={1.5}
          />

          <Line
            points={[-width / 2, 0, width / 2, 0]}
            stroke="#4B9BBE"
            strokeWidth={2}
          />
        </>
      )}
    </Group>
  );
}
