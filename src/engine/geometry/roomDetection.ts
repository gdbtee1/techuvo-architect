import type {
  Point2D,
  Wall,
} from "../../types/architecture";

export type DetectedRoom = {
  id: string;
  points: Point2D[];
  area: number;
};

const EPSILON = 0.001;

function samePoint(a: Point2D, b: Point2D) {
  return Math.hypot(a.x - b.x, a.y - b.y) < EPSILON;
}

function signedArea(points: Point2D[]) {
  let sum = 0;

  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];

    sum += a.x * b.y - b.x * a.y;
  }

  return sum / 2;
}

function segmentsIntersect(
  a: Point2D,
  b: Point2D,
  c: Point2D,
  d: Point2D
) {
  function cross(
    p: Point2D,
    q: Point2D,
    r: Point2D
  ) {
    return (
      (q.x - p.x) * (r.y - p.y) -
      (q.y - p.y) * (r.x - p.x)
    );
  }

  const abC = cross(a, b, c);
  const abD = cross(a, b, d);
  const cdA = cross(c, d, a);
  const cdB = cross(c, d, b);

  return (
    abC * abD < -EPSILON &&
    cdA * cdB < -EPSILON
  );
}

export function detectRooms(walls: Wall[]): DetectedRoom[] {
  // Initial implementation:
  // Detect one closed polygon formed by a simple wall loop.
  if (walls.length < 3) return [];

  const remaining = [...walls];
  const first = remaining.shift()!;

  const points: Point2D[] = [
    first.start,
    first.end,
  ];

  while (remaining.length > 0) {
    const lastPoint = points[points.length - 1];

    const nextIndex = remaining.findIndex(
      (wall) =>
        samePoint(wall.start, lastPoint) ||
        samePoint(wall.end, lastPoint)
    );

    if (nextIndex === -1) return [];

    const next = remaining.splice(nextIndex, 1)[0];

    const nextPoint = samePoint(
      next.start,
      lastPoint
    )
      ? next.end
      : next.start;

    if (samePoint(nextPoint, points[0])) {
      if (remaining.length > 0) return [];
      break;
    }

    if (points.some((p) => samePoint(p, nextPoint))) {
      return [];
    }

    points.push(nextPoint);
  }

  if (points.length < 3) return [];

  const lastWallEnd = points[points.length - 1];

  const closes = walls.some(
    (wall) =>
      (samePoint(wall.start, lastWallEnd) &&
        samePoint(wall.end, points[0])) ||
      (samePoint(wall.end, lastWallEnd) &&
        samePoint(wall.start, points[0]))
  );

  if (!closes) return [];

  // Reject crossing edges.
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];

    for (let j = i + 1; j < points.length; j++) {
      if (
        j === i + 1 ||
        (i === 0 && j === points.length - 1)
      ) {
        continue;
      }

      const c = points[j];
      const d = points[(j + 1) % points.length];

      if (segmentsIntersect(a, b, c, d)) {
        return [];
      }
    }
  }

  const area = Math.abs(signedArea(points));

  if (area < 0.5) return [];

  return [
    {
      id: "room-1",
      points,
      area,
    },
  ];
}
